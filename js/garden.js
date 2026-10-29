/**
 * ====================================================================
 *   THE LIVING GARDEN - CORE SIMULATION & INTERACTION ENGINE
 * ====================================================================
 * Manages the living ecosystem:
 * - Hidden gardenState progression
 * - Watering can physics & pouring
 * - Individual reactive flowers & pollen
 * - Pendulum wind chime physics
 * - Dynamic lantern ignition & firefly attraction
 * - Water ripples & lotus blooms
 * - Firefly flocking & cursor curiosity
 * - Great Transformation sequence & wholesome emotional reveal
 */

class LivingGarden {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new window.PixelRenderer(canvas);
    this.audio = window.gardenAudio;
    this.sprites = window.pixelSprites;

    // Environmental Time & Wind
    this.time = 0;
    this.breeze = 0;
    this.targetBreeze = 0;

    // Hidden Internal State
    this.state = {
      flowersBloomed: 0,
      totalFlowers: 10,
      lanternLit: false,
      windChimeHits: 0,
      pondInteractions: 0,
      wateredCount: 0,
      seedTouched: false,
      awakeningLevel: 0.0,
      isTransforming: false,
      isTransformed: false,
      letterRevealed: false
    };

    // User Interaction & Cursor
    this.cursor = {
      x: 320,
      y: 180,
      normX: 0,
      normY: 0,
      prevX: 320,
      prevY: 180,
      speed: 0,
      isDown: false,
      hasInteracted: false
    };

    // Interactive Objects
    this.wateringCan = {
      x: 95,
      y: 285,
      restX: 95,
      restY: 285,
      isDragging: false,
      isPouring: false,
      pourTime: 0,
      drops: []
    };

    this.lantern = {
      x: 275,
      y: 232,
      w: 24,
      h: 42,
      flameFrame: 0,
      flameTimer: 0
    };

    this.windChime = {
      x: 155,
      y: 88,
      angle: 0,
      angVel: 0,
      damping: 0.982,
      spring: 0.045,
      lastHitTime: 0
    };

    this.pond = {
      x: 335,
      y: 245,
      w: 215,
      h: 65,
      ripples: [],
      lotuses: [
        { x: 380, y: 258, bloomed: false, bloomRatio: 0.0 },
        { x: 485, y: 272, bloomed: false, bloomRatio: 0.0 }
      ]
    };

    this.mysteriousSeed = {
      x: 220,
      y: 295,
      pulse: 0.0,
      growingTreeProgress: 0.0
    };

    // Ecosystem Entities
    this.flowers = [];
    this.initFlowers();

    this.grassField = [];
    this.meadowFlowers = [];
    this.initGrassField();

    this.fireflies = [];
    this.initFireflies();

    this.butterflies = [];
    this.initButterflies();

    this.pollenParticles = [];
    this.treeVines = [];

    // High-Detail Cherry Blossom Tree & 16 Progressive Organic Growth Frames
    this.cherryTreeImg = new Image();
    this.cherryTreeImg.src = "assets/cherry_blossom_tree.png?v=10";
    this.cherryTreeLoaded = false;
    this.cherryTreeImg.onload = () => {
      this.cherryTreeLoaded = true;
    };

    this.growthFrames = [];
    this.growthFramesLoaded = 0;
    for (let i = 0; i < 16; i++) {
      const img = new Image();
      const pad = i < 10 ? "0" + i : "" + i;
      img.src = `assets/growth/grow_${pad}.png?v=10`;
      img.onload = () => {
        this.growthFramesLoaded++;
      };
      this.growthFrames.push(img);
    }

    this.fallenPetals = [];
    for (let i = 0; i < 55; i++) {
      this.fallenPetals.push({
        relX: (Math.random() - 0.5) * 230,
        relY: (Math.random() - 0.5) * 22 + 8,
        color: Math.random() > 0.4 ? PALETTE.sakuraPink : (Math.random() > 0.5 ? PALETTE.sakuraLight : PALETTE.sakuraPale),
        size: Math.random() > 0.6 ? 2 : 1
      });
    }

    this.canopyGlints = [];
    for (let i = 0; i < 28; i++) {
      this.canopyGlints.push({
        relX: (Math.random() - 0.5) * 230,
        relY: -160 + Math.random() * 110,
        phase: Math.random() * Math.PI * 2,
        speed: 2.2 + Math.random() * 2.5
      });
    }

    this.willowLeaves = [];
    this.initWillowLeaves();

    this.driftingBlossoms = [];

    // Tree Transformation Data
    this.spiritTree = {
      grown: false,
      growthProgress: 0.0, // 0.0 to 1.0
      alpha: 0.0
    };

    // Instruction Banner
    this.introOpacity = 1.0;
    this.introStep = 0; // 0: hint 1, 1: hint 2, 2: faded
    this.hoverTarget = null;

    // Setup input listeners
    this.bindEvents();

    // Restore cached garden progress if visitor previously watered/bloomed the garden
    this.loadProgress();

    // Auto-save garden progress before page unloads or reloads
    window.addEventListener("beforeunload", () => this.saveProgress());

    // Start simulation loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));

    // Emit initial discovery state
    setTimeout(() => this.emitDiscoveryUpdate(), 250);

    // Set environmental hint from config if available (only if garden is not already bloomed)
    const config = window.GARDEN_CONFIG || {};
    const hintEl = document.getElementById("environmental-hint");
    const hintTextEl = document.getElementById("hint-text");
    if (hintEl) {
      if (this.state.isTransformed) {
        hintEl.style.display = "none";
      } else {
        if (config.introHint) {
          if (hintTextEl) hintTextEl.textContent = config.introHint;
          else hintEl.textContent = config.introHint;
        }
        setTimeout(() => {
          hintEl.style.opacity = "0";
          setTimeout(() => {
            hintEl.style.display = "none";
          }, 3200);
        }, 10000);
      }
    }
  }

  /**
   * -------------------------------------------------------------
   * INITIALIZATION OF GARDEN ELEMENTS
   * -------------------------------------------------------------
   */
  initFlowers() {
    this.flowers = [
      // Left flowerbed
      { x: 45, y: 285, type: "star_lily", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },
      { x: 72, y: 295, type: "bluebell", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },
      { x: 125, y: 288, type: "poppy", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },
      { x: 155, y: 300, type: "jasmine", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },

      // Center-near-seed flowerbed
      { x: 185, y: 288, type: "star_lily", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },
      { x: 250, y: 295, type: "bluebell", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },

      // Lantern base flowers
      { x: 268, y: 268, type: "jasmine", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },
      { x: 312, y: 265, type: "poppy", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },

      // Right meadow flowers (near pond)
      { x: 575, y: 275, type: "star_lily", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 },
      { x: 605, y: 290, type: "bluebell", bloomRatio: 0.0, sway: 0, watered: false, targetBloom: 0 }
    ];
  }

  initGrassField() {
    this.grassField = [];
    this.meadowFlowers = [];

    // Dense living meadow of 450+ organic grass blades covering y = 215 to y = 358
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * 640;
      const depth = Math.pow(Math.random(), 0.72); // 0 (horizon) to 1.0 (foreground)
      const y = 216 + depth * 142;

      // Avoid middle of deep pond water
      const pondX = 335, pondW = 215, pondY = 245, pondH = 65;
      if (x > pondX + 18 && x < pondX + pondW - 18 && y > pondY + 12 && y < pondY + pondH - 10) {
        continue;
      }

      // Height increases with depth (from 5px at horizon to 24px in foreground)
      const height = Math.round(5 + depth * 18 + (Math.random() * 6 - 3));
      const baseWidth = depth > 0.7 ? (depth > 0.88 ? 3 : 2) : 1;

      // Color variation reflecting depth, shadows, and moonlight
      let color;
      if (depth < 0.35) {
        color = PALETTE.meadowHillNear;
      } else if (depth < 0.65) {
        color = Math.random() > 0.4 ? PALETTE.grassLush : PALETTE.grassMid;
      } else {
        const r = Math.random();
        color = r > 0.65 ? PALETTE.grassHighlight : (r > 0.3 ? PALETTE.grassBright : PALETTE.grassLush);
      }

      this.grassField.push({
        x: x,
        y: y,
        depth: depth,
        height: height,
        baseWidth: baseWidth,
        naturalCurve: (Math.random() - 0.45) * 1.8,
        windPhase: x * 0.016 + y * 0.012,
        bend: 0,
        bendVel: 0,
        color: color
      });
    }

    // Sort by Y so rendering automatically has correct depth sorting
    this.grassField.sort((a, b) => a.y - b.y);

    // Wild clover tufts and buttercups scattered through the grass field
    for (let i = 0; i < 40; i++) {
      const mx = Math.random() * 640;
      const my = 222 + Math.random() * 134;
      if (mx > 340 && mx < 535 && my > 248 && my < 302) continue;
      this.meadowFlowers.push({
        x: mx,
        y: my,
        type: Math.random() > 0.45 ? "clover" : "buttercup"
      });
    }
  }

  initFireflies() {
    this.fireflies = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      this.fireflies.push({
        x: 100 + Math.random() * 450,
        y: 120 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: 0.4 + Math.random() * 0.6,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        pulse: 0.5,
        glowRadius: 10 + Math.random() * 8,
        curiosity: Math.random() > 0.6 // curious fireflies follow cursor
      });
    }
  }

  initButterflies() {
    this.butterflies = [
      {
        x: 160,
        y: 220,
        targetX: 200,
        targetY: 210,
        variant: "lavender",
        frame: 0,
        frameTimer: 0,
        flightTimer: 0,
        isResting: false,
        restDuration: 0
      }
    ];
  }

  initCherryBlossomTree() {
    // Loaded via high-res pixel art sprite in constructor
  }

  initSpiritLeaves() {
    this.initCherryBlossomTree();
  }

  /**
   * High-Detail Willow Leaves for the Weeping Willow Tree
   */
  initWillowLeaves() {
    this.willowLeaves = [];
    const willowClusters = [
      { cx: -40, cy: -135, rx: 38, ry: 21, weight: 35 },
      { cx: 10, cy: -145, rx: 42, ry: 23, weight: 40 },
      { cx: 65, cy: -138, rx: 35, ry: 20, weight: 35 },
      { cx: -15, cy: -152, rx: 40, ry: 22, weight: 40 },
      { cx: 25, cy: -148, rx: 38, ry: 21, weight: 35 }
    ];

    willowClusters.forEach(cl => {
      for (let i = 0; i < cl.weight; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random());
        const relX = cl.cx + Math.cos(angle) * (cl.rx * rad);
        const relY = cl.cy + Math.sin(angle) * (cl.ry * rad);
        const depth = Math.random();

        this.willowLeaves.push({
          relX: relX,
          relY: relY,
          depth: depth,
          phase: Math.random() * Math.PI * 2,
          flutterSpeed: 1.6 + Math.random() * 1.4,
          flutterAmp: 0.6 + depth * 1.5,
          colorShadow: depth < 0.35 ? "#0d1f19" : PALETTE.leafEmeraldDark,
          colorMid: depth < 0.6 ? PALETTE.grassMid : PALETTE.grassLush,
          colorLight: PALETTE.grassBright,
          colorTip: PALETTE.grassHighlight
        });
      }
    });

    this.willowLeaves.sort((a, b) => a.depth - b.depth);
  }

  /**
   * -------------------------------------------------------------
   * USER INPUT & BINDINGS (DESKTOP & MOBILE TOUCH)
   * -------------------------------------------------------------
   */
  bindEvents() {
    const handleMove = (clientX, clientY) => {
      const v = this.renderer.screenToVirtual(clientX, clientY);
      this.cursor.prevX = this.cursor.x;
      this.cursor.prevY = this.cursor.y;
      this.cursor.x = v.x;
      this.cursor.y = v.y;

      const dx = this.cursor.x - this.cursor.prevX;
      const dy = this.cursor.y - this.cursor.prevY;
      this.cursor.speed = Math.sqrt(dx * dx + dy * dy);

      // Normalized coordinates (-1 to 1) for camera parallax
      this.cursor.normX = (this.cursor.x / (this.renderer.width * 0.5)) - 1.0;
      this.cursor.normY = (this.cursor.y / (this.renderer.height * 0.5)) - 1.0;

      // First user movement wakes audio & fades intro
      if (!this.cursor.hasInteracted && this.cursor.speed > 1.0) {
        this.onFirstInteraction();
      }

      // Fast cursor motion gusts wind
      if (this.cursor.speed > 8) {
        this.targetBreeze = Math.min(2.5, this.targetBreeze + 0.35);
        this.audio.gustWind(0.3);
      }

      // Dragging watering can
      if (this.wateringCan.isDragging) {
        this.wateringCan.x = this.cursor.x - 14;
        this.wateringCan.y = this.cursor.y - 14;
      }

      // Interactive Wind Chime hover/swipe
      this.checkChimeInteraction();

      // Ripple pond on cursor passage
      if (
        this.cursor.x > this.pond.x && this.cursor.x < this.pond.x + this.pond.w &&
        this.cursor.y > this.pond.y + 10 && this.cursor.y < this.pond.y + this.pond.h
      ) {
        if (Math.random() < 0.2 && this.cursor.speed > 2.0) {
          this.createPondRipple(this.cursor.x, this.cursor.y);
        }
      }

      // Check interactive object hover
      this.checkHoverEntity(clientX, clientY);
    };

    const handleDown = (clientX, clientY) => {
      this.cursor.isDown = true;
      const v = this.renderer.screenToVirtual(clientX, clientY);
      this.cursor.x = v.x;
      this.cursor.y = v.y;

      this.onFirstInteraction();

      // 1. Check Watering Can grab
      const canDist = Math.hypot(this.cursor.x - (this.wateringCan.x + 16), this.cursor.y - (this.wateringCan.y + 13));
      if (canDist < 26) {
        this.wateringCan.isDragging = true;
        return;
      }

      // 2. Check Lantern click
      const lDist = Math.hypot(this.cursor.x - (this.lantern.x + 12), this.cursor.y - (this.lantern.y + 20));
      if (lDist < 28) {
        this.toggleLantern();
        return;
      }

      // 3. Check Wind Chime click
      const chimeDist = Math.hypot(this.cursor.x - this.windChime.x, this.cursor.y - (this.windChime.y + 25));
      if (chimeDist < 30) {
        this.strikeWindChime(0.28);
        return;
      }

      // 4. Check Pond touch
      if (
        this.cursor.x > this.pond.x && this.cursor.x < this.pond.x + this.pond.w &&
        this.cursor.y > this.pond.y && this.cursor.y < this.pond.y + this.pond.h
      ) {
        this.createPondRipple(this.cursor.x, this.cursor.y);
        this.checkLotusTouch(this.cursor.x, this.cursor.y);
        return;
      }

      // 5. Check Mysterious Seed touch
      const seedDist = Math.hypot(this.cursor.x - this.mysteriousSeed.x, this.cursor.y - this.mysteriousSeed.y);
      if (seedDist < 26) {
        this.onSeedClicked();
        return;
      }

      // 6. Check Individual Flowers touch/hover
      this.flowers.forEach(fl => {
        const fDist = Math.hypot(this.cursor.x - (fl.x + 12), this.cursor.y - (fl.y + 10));
        if (fDist < 20) {
          fl.sway = 4.5;
          this.audio.playFlowerBloom();
          this.spawnPollen(fl.x + 12, fl.y + 8, 4);
        }
      });

      // 7. Check Sky touch (triggers shooting star)
      if (this.cursor.y < 120) {
        this.renderer.triggerShootingStar(this.cursor.x, this.cursor.y);
        this.audio.playFireflySparkle();
      }
    };

    const handleUp = () => {
      this.cursor.isDown = false;
      if (this.wateringCan.isDragging) {
        this.wateringCan.isDragging = false;
      }
    };

    // Mouse Listeners
    window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener("mousedown", (e) => handleDown(e.clientX, e.clientY));
    window.addEventListener("mouseup", () => handleUp());

    // Touch Listeners
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        handleDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("touchend", () => handleUp());

    // Secret shortcut: Ctrl + Shift + L makes the tree blossom immediately without manual steps
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "L" || e.key === "l" || e.code === "KeyL")) {
        e.preventDefault();
        this.onFirstInteraction();
        if (this.state.isTransformed) {
          this.revealBirthdayLetter();
        } else if (!this.state.isTransforming) {
          this.state.awakeningLevel = 1.0;
          this.triggerGreatTransformation();
        }
      }
    });
  }

  onFirstInteraction() {
    if (!this.cursor.hasInteracted) {
      this.cursor.hasInteracted = true;
      this.audio.init();
    }
  }

  /**
   * Evaluates what interactive entity the cursor is currently hovering over
   */
  checkHoverEntity(clientX, clientY) {
    let target = null;
    let label = "";

    // 1. Watering can
    const canDist = Math.hypot(this.cursor.x - (this.wateringCan.x + 16), this.cursor.y - (this.wateringCan.y + 13));
    if (canDist < 26) {
      target = "can";
      label = "Watering Can · Drag to water";
    }
    // 2. Lantern
    else if (Math.hypot(this.cursor.x - (this.lantern.x + 12), this.cursor.y - (this.lantern.y + 20)) < 26) {
      target = "lantern";
      label = this.state.lanternLit ? "Ancient Lantern · Glowing warmly" : "Ancient Lantern · Tap to light";
    }
    // 3. Windchimes
    else if (Math.hypot(this.cursor.x - this.windChime.x, this.cursor.y - (this.windChime.y + 25)) < 26) {
      target = "chimes";
      label = "Glass Windchimes · Tap to chime";
    }
    // 4. Mysterious seed or Tree
    else if (this.state.isTransformed && Math.hypot(this.cursor.x - 230, this.cursor.y - 250) < 65) {
      target = "tree";
      const carvingTooltip = (window.GARDEN_CONFIG && (window.GARDEN_CONFIG.treeCarvingText || (window.GARDEN_CONFIG.initials ? `${window.GARDEN_CONFIG.initials} ♡` : "A + A ♡"))) || "A + A ♡";
      label = `Sacred Sakura · Carved with ${carvingTooltip}`;
    }
    else if (!this.state.isTransformed && Math.hypot(this.cursor.x - this.mysteriousSeed.x, this.cursor.y - this.mysteriousSeed.y) < 26) {
      target = "seed";
      label = this.state.awakeningLevel >= 0.7 ? "Awakened Seed · Tap or water to bloom!" : "Mysterious Seed · Give it water";
    }
    // 5. Pond
    else if (this.cursor.x > this.pond.x && this.cursor.x < this.pond.x + this.pond.w && this.cursor.y > this.pond.y && this.cursor.y < this.pond.y + this.pond.h) {
      target = "pond";
      label = "Serene Pond · Touch to ripple";
    }
    // 6. Flowers
    else {
      const f = this.flowers.find(fl => Math.hypot(this.cursor.x - (fl.x + 12), this.cursor.y - (fl.y + 10)) < 20);
      if (f) {
        target = "flower";
        label = f.bloomRatio > 0.7 ? "Blooming Wildflower · Rustle" : "Garden Bud · Water to bloom";
      }
    }

    if (this.hoverTarget !== target) {
      this.hoverTarget = target;
      window.dispatchEvent(new CustomEvent('garden-hover-target', { detail: { target, label, clientX, clientY } }));
    }
  }

  clearHoverEntity() {
    if (this.hoverTarget) {
      this.hoverTarget = null;
      window.dispatchEvent(new CustomEvent('garden-hover-target', { detail: { target: null, label: "", clientX: 0, clientY: 0 } }));
    }
  }

  /**
   * Generates summary of garden wonder discoveries
   */
  getDiscoverySummary() {
    const bloomedFlowers = this.flowers.filter(f => f.bloomRatio > 0.7).length;
    const lotusesBloomed = this.pond.lotuses.filter(l => l.bloomed).length;
    let score = 0;
    if (this.state.lanternLit) score++;
    if (this.state.windChimeHits > 0) score++;
    if (bloomedFlowers >= 5) score++;
    if (lotusesBloomed > 0 || this.state.pondInteractions > 2) score++;
    if (this.state.isTransformed || this.state.isTransforming) score++;

    return {
      lantern: this.state.lanternLit,
      chimes: this.state.windChimeHits > 0,
      flowers: bloomedFlowers,
      totalFlowers: this.flowers.length,
      pond: lotusesBloomed > 0 || this.state.pondInteractions > 2,
      tree: this.state.isTransformed || this.state.isTransforming,
      score: score
    };
  }

  emitDiscoveryUpdate() {
    const summary = this.getDiscoverySummary();
    window.dispatchEvent(new CustomEvent('garden-discovery-update', { detail: summary }));
  }

  /**
   * Captures memory photo snapshot with flash and sound
   */
  takeSnapshot() {
    if (this.audio) this.audio.playSnapshot();
    const flash = document.getElementById("snapshot-flash");
    if (flash) {
      flash.classList.remove("flash-active");
      void flash.offsetWidth;
      flash.classList.add("flash-active");
      setTimeout(() => {
        flash.classList.remove("flash-active");
      }, 400);
    }
    return this.renderer.takeSnapshot();
  }

  /**
   * Make a wish: triggers shooting star, breeze, audio, and celestial sparks
   */
  triggerWish() {
    this.onFirstInteraction();
    if (this.audio) this.audio.playWishStar();
    this.renderer.triggerShootingStar();
    this.audio.gustWind(0.6);
    this.targetBreeze = 2.4;
    // Spawn celestial stardust fireflies
    for (let i = 0; i < 10; i++) {
      this.fireflies.push({
        x: Math.random() * 640,
        y: 20 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.6 + Math.random() * 1.0,
        alpha: 0.8,
        pulseSpeed: 0.05,
        pulsePhase: Math.random() * Math.PI,
        pulse: 0.8,
        glowRadius: 15,
        curiosity: true
      });
    }
  }

  /**
   * -------------------------------------------------------------
   * INTERACTION MECHANICS & CHAIN REACTIONS
   * -------------------------------------------------------------
   */
  toggleLantern() {
    this.state.lanternLit = !this.state.lanternLit;
    if (this.state.lanternLit) {
      this.audio.playLanternIgnite();

      // Chain reaction: attract fireflies to dance around the light
      this.fireflies.forEach(f => {
        f.curiosity = true;
        f.vx += (this.lantern.x - f.x) * 0.01;
        f.vy += (this.lantern.y - f.y) * 0.01;
      });

      // Chain reaction: spawn 4 more fireflies
      for (let i = 0; i < 4; i++) {
        this.fireflies.push({
          x: this.lantern.x + (Math.random() - 0.5) * 40,
          y: this.lantern.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          alpha: 0.1,
          pulseSpeed: 0.03,
          pulsePhase: Math.random() * Math.PI,
          pulse: 0.5,
          glowRadius: 14,
          curiosity: true
        });
      }

      this.checkAwakeningProgression();
      this.saveProgress();
    }
  }

  strikeWindChime(force = 0.22) {
    const now = Date.now();
    if (now - this.windChime.lastHitTime < 280) return;
    this.windChime.lastHitTime = now;

    this.windChime.angVel += (Math.random() > 0.5 ? 1 : -1) * force;
    this.audio.playWindChime();

    // Environmental ripple: wave of breeze moves through vegetation
    this.targetBreeze = 2.8;

    // Shake nearby tree leaves & spawn falling leaves
    for (let i = 0; i < 3; i++) {
      this.pollenParticles.push({
        x: this.windChime.x + (Math.random() - 0.5) * 40,
        y: this.windChime.y + 10 + Math.random() * 20,
        vx: 1.2 + Math.random() * 1.5,
        vy: 0.4 + Math.random() * 0.5,
        alpha: 1.0,
        color: PALETTE.grassHighlight,
        isLeaf: true,
        rot: Math.random() * Math.PI,
        rotSpeed: 0.05
      });
    }

    this.state.windChimeHits++;
    this.checkAwakeningProgression();
    this.saveProgress();
  }

  checkChimeInteraction() {
    const chimeX = this.windChime.x;
    const chimeY = this.windChime.y + 25;
    const dist = Math.hypot(this.cursor.x - chimeX, this.cursor.y - chimeY);

    if (dist < 22 && this.cursor.speed > 1.2) {
      const impulse = Math.min(0.35, this.cursor.speed * 0.04);
      this.strikeWindChime(impulse);
    }
  }

  createPondRipple(x, y) {
    if (this.pond.ripples.length < 8) {
      this.pond.ripples.push({
        x: x,
        y: y,
        radius: 2,
        maxRadius: 28 + Math.random() * 14,
        alpha: 0.75
      });
      this.audio.playWaterRipple();
      this.state.pondInteractions++;
      this.checkAwakeningProgression();
      this.saveProgress();
    }
  }

  checkLotusTouch(x, y) {
    this.pond.lotuses.forEach(lotus => {
      const d = Math.hypot(x - lotus.x, y - lotus.y);
      if (d < 24 && !lotus.bloomed) {
        lotus.bloomed = true;
        this.audio.playFlowerBloom();
        this.spawnPollen(lotus.x, lotus.y - 4, 6);
        this.checkAwakeningProgression();
        this.saveProgress();
      }
    });
  }

  spawnPollen(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.pollenParticles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.8 + 0.2,
        vy: -0.4 - Math.random() * 0.8,
        alpha: 1.0,
        color: Math.random() > 0.5 ? PALETTE.magicGold : PALETTE.lilyWhite,
        isLeaf: false
      });
    }
  }

  /**
   * Evaluates the natural awakening of the garden.
   * Progresses quietly in the background without any HUD/bars.
   */
  checkAwakeningProgression() {
    let score = 0;
    // Flowers bloomed (max 50 points)
    const bloomedCount = this.flowers.filter(f => f.bloomRatio > 0.7).length;
    score += (bloomedCount / this.flowers.length) * 0.45;

    // Lantern lit (20 points)
    if (this.state.lanternLit) score += 0.20;

    // Wind chime used (12 points)
    if (this.state.windChimeHits > 0) score += 0.12;

    // Pond lotuses & ripples (15 points)
    const bloomedLotuses = this.pond.lotuses.filter(l => l.bloomed).length;
    score += (bloomedLotuses / this.pond.lotuses.length) * 0.15;
    if (this.state.pondInteractions > 2) score += 0.08;

    this.state.awakeningLevel = Math.min(1.0, score);
    this.audio.setAwakeningLevel(this.state.awakeningLevel);

    // Increase ambient fireflies smoothly
    const desiredFireflies = Math.round(14 + this.state.awakeningLevel * 22);
    while (this.fireflies.length < desiredFireflies) {
      this.fireflies.push({
        x: 80 + Math.random() * 480,
        y: 100 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: 0.1,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI,
        pulse: 0.5,
        glowRadius: 12,
        curiosity: Math.random() > 0.4
      });
    }

    // Add extra butterfly once awakening is high
    if (this.state.awakeningLevel > 0.4 && this.butterflies.length === 1) {
      this.butterflies.push({
        x: 480,
        y: 200,
        targetX: 420,
        targetY: 230,
        variant: "azure",
        frame: 0,
        frameTimer: 0,
        flightTimer: 0,
        isResting: false,
        restDuration: 0
      });
    }

    // If awakening is complete, the mysterious seed pulses with wonder
    if (this.state.awakeningLevel >= 0.85 && !this.state.isTransforming && !this.state.isTransformed) {
      this.mysteriousSeed.pulse = Math.max(this.mysteriousSeed.pulse, 0.6);
    }

    this.emitDiscoveryUpdate();
  }

  onSeedClicked() {
    if (this.state.isTransforming || this.state.isTransformed) return;

    // If garden is ready or visitor discovers the seed
    if (this.state.awakeningLevel > 0.4 || this.state.flowersBloomed >= 4) {
      this.triggerGreatTransformation();
    } else {
      // Gentle early discovery pulse
      this.mysteriousSeed.pulse = 1.0;
      this.audio.playFlowerBloom();
      this.spawnPollen(this.mysteriousSeed.x, this.mysteriousSeed.y - 4, 8);
    }
  }

  /**
   * -------------------------------------------------------------
   * PHASE 5: THE GREAT TRANSFORMATION
   * The emotional cinematic payoff.
   * -------------------------------------------------------------
   */
  triggerGreatTransformation() {
    if (this.state.isTransforming || this.state.isTransformed) return;
    this.state.isTransforming = true;

    // Audio sequence begins (calm silence -> rising harp/chimes -> majestic bloom)
    this.audio.triggerTransformationSequence(() => {
      // Peak of transformation
      this.state.isTransformed = true;
      this.state.isTransforming = false;
      this.spiritTree.growthProgress = 1.0;
      this.spiritTree.grown = true;
      this.saveProgress();

      // Reveal the emotional birthday message inside the garden
      this.revealBirthdayLetter();
    });

    // Bloom all remaining flowers across the whole garden
    this.flowers.forEach((fl, idx) => {
      setTimeout(() => {
        fl.targetBloom = 1.0;
        fl.watered = true;
        this.spawnPollen(fl.x + 12, fl.y + 8, 8);
      }, 3000 + idx * 250);
    });

    // Bloom all water lilies
    this.pond.lotuses.forEach(lotus => {
      lotus.bloomed = true;
    });

    // Ignite lantern if unlit
    if (!this.state.lanternLit) {
      setTimeout(() => {
        this.toggleLantern();
      }, 2600);
    }

    // Swarm fireflies into swirling celestial spiral
    this.fireflies.forEach(f => {
      f.curiosity = false;
      f.glowRadius = 18;
    });
  }

  /**
   * Populates letter typography and keepsake text from window.GARDEN_CONFIG
   */
  populateLetterContent() {
    const config = window.GARDEN_CONFIG || {};
    const headingEl = document.getElementById("letter-heading");
    const bodyEl = document.getElementById("letter-body");
    const signatureEl = document.getElementById("letter-signature");
    const specialDateEl = document.getElementById("letter-date");

    if (headingEl) {
      headingEl.textContent = config.letterHeading || "To the Love of my Life.";
    }

    if (specialDateEl && config.specialDate) {
      specialDateEl.textContent = config.specialDate;
    }

    if (bodyEl && config.letterParagraphs) {
      bodyEl.innerHTML = "";
      config.letterParagraphs.forEach(pText => {
        const p = document.createElement("p");
        p.textContent = pText;
        p.className = "letter-paragraph";
        bodyEl.appendChild(p);
      });
    }

    if (signatureEl) {
      signatureEl.innerHTML = `<em>${config.letterClosing || "Forever yours,"}</em><br><strong>${config.letterSignature || config.senderName || "Atharv"}</strong>`;
    }
  }

  /**
   * Reveals the wholesome personal romantic birthday letter inside the living garden.
   */
  revealBirthdayLetter() {
    this.state.letterRevealed = true;
    this.saveProgress();

    if (this.audio) {
      this.audio.playLetterOpen();
      this.audio.duckMusic(0.32, 1.4);
    }
    const letterOverlay = document.getElementById("letter-overlay");
    this.populateLetterContent();

    // Smoothly fade in the letter directly inside the living garden
    if (letterOverlay) {
      letterOverlay.classList.remove("hidden");
      setTimeout(() => {
        letterOverlay.classList.add("visible");
      }, 500);
    }
  }

  /**
   * Saves visitor's garden progress (flowers, lotuses, tree growth, lantern, awakening level)
   * to localStorage so progress persists across browser reloads and future visits.
   */
  saveProgress() {
    try {
      const data = {
        version: 1,
        timestamp: Date.now(),
        isTransformed: !!this.state.isTransformed,
        treeGrowth: this.spiritTree.growthProgress,
        treeGrown: !!this.spiritTree.grown,
        lanternLit: !!this.state.lanternLit,
        windChimeHits: this.state.windChimeHits,
        pondInteractions: this.state.pondInteractions,
        wateredCount: this.state.wateredCount,
        flowersBloomed: this.state.flowersBloomed,
        awakeningLevel: this.state.awakeningLevel,
        letterRevealed: !!this.state.letterRevealed,
        flowers: this.flowers.map(f => ({
          watered: !!f.watered,
          bloomRatio: Math.round(f.bloomRatio * 100) / 100,
          targetBloom: f.targetBloom
        })),
        lotuses: this.pond.lotuses.map(l => ({
          bloomed: !!l.bloomed,
          bloomRatio: Math.round((l.bloomRatio || 0) * 100) / 100
        }))
      };
      localStorage.setItem("living_garden_save_v1", JSON.stringify(data));
    } catch (err) {
      console.warn("Could not save garden progress:", err);
    }
  }

  /**
   * Restores cached garden state from localStorage.
   * If visitor had blossomed the tree and transformed the garden, loads directly
   * into that completed state with full blossoms, active butterflies, and keepsake button.
   */
  loadProgress() {
    try {
      const raw = localStorage.getItem("living_garden_save_v1");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data) return;

      this.populateLetterContent();

      if (data.isTransformed) {
        this.state.isTransformed = true;
        this.state.isTransforming = false;
        this.spiritTree.growthProgress = 1.0;
        this.spiritTree.grown = true;
        this.spiritTree.alpha = 1.0;
        this.mysteriousSeed.pulse = 1.0;
        this.state.lanternLit = true;
        this.state.awakeningLevel = 1.0;
        this.state.flowersBloomed = this.flowers.length;
        this.state.wateredCount = this.flowers.length;
        this.state.letterRevealed = true;
        this.state.windChimeHits = Math.max(1, data.windChimeHits || 1);
        this.state.pondInteractions = Math.max(3, data.pondInteractions || 3);

        // Fully bloom all flowers
        this.flowers.forEach(fl => {
          fl.watered = true;
          fl.bloomRatio = 1.0;
          fl.targetBloom = 1.0;
        });

        // Fully bloom all pond water lilies
        this.pond.lotuses.forEach(lotus => {
          lotus.bloomed = true;
          lotus.bloomRatio = 1.0;
        });

        // Hide environmental hint
        const hintEl = document.getElementById("environmental-hint");
        if (hintEl) {
          hintEl.style.display = "none";
          hintEl.style.opacity = "0";
        }

        // Show keepsake letter reopen button
        const reopenBtn = document.getElementById("letter-reopen-btn");
        if (reopenBtn) {
          reopenBtn.classList.add("visible");
        }

        // Configure audio for awakened state
        if (this.audio) {
          this.audio.setAwakeningLevel(1.0);
          this.audio.transformed = true;
        }

        // Fill out fireflies for lush awakened sanctuary
        while (this.fireflies.length < 36) {
          this.fireflies.push({
            x: 80 + Math.random() * 480,
            y: 100 + Math.random() * 200,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: 0.1,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            pulsePhase: Math.random() * Math.PI,
            pulse: 0.5,
            glowRadius: 18,
            curiosity: false
          });
        }

        // Ensure azure butterfly is active
        if (this.butterflies.length === 1) {
          this.butterflies.push({
            x: 480,
            y: 200,
            targetX: 420,
            targetY: 230,
            variant: "azure",
            frame: 0,
            frameTimer: 0,
            flightTimer: 0,
            isResting: false,
            restDuration: 0
          });
        }

        this.emitDiscoveryUpdate();
        return;
      }

      // Restore partial progress
      if (typeof data.treeGrowth === "number") {
        this.spiritTree.growthProgress = Math.max(0, Math.min(1.0, data.treeGrowth));
        if (this.spiritTree.growthProgress >= 1.0) {
          this.spiritTree.grown = true;
        }
      }
      if (data.lanternLit) {
        this.state.lanternLit = true;
      }
      if (typeof data.windChimeHits === "number") {
        this.state.windChimeHits = data.windChimeHits;
      }
      if (typeof data.pondInteractions === "number") {
        this.state.pondInteractions = data.pondInteractions;
      }
      if (typeof data.wateredCount === "number") {
        this.state.wateredCount = data.wateredCount;
      }
      if (typeof data.awakeningLevel === "number") {
        this.state.awakeningLevel = Math.max(0, Math.min(1.0, data.awakeningLevel));
      }
      if (data.letterRevealed) {
        this.state.letterRevealed = true;
        const reopenBtn = document.getElementById("letter-reopen-btn");
        if (reopenBtn) reopenBtn.classList.add("visible");
      }

      if (Array.isArray(data.flowers) && data.flowers.length === this.flowers.length) {
        data.flowers.forEach((saved, idx) => {
          if (saved.watered) {
            this.flowers[idx].watered = true;
            this.flowers[idx].bloomRatio = saved.bloomRatio !== undefined ? saved.bloomRatio : 1.0;
            this.flowers[idx].targetBloom = saved.targetBloom !== undefined ? saved.targetBloom : 1.0;
          }
        });
        this.state.flowersBloomed = this.flowers.filter(f => f.watered || f.bloomRatio > 0.7).length;
      }

      if (Array.isArray(data.lotuses) && data.lotuses.length === this.pond.lotuses.length) {
        data.lotuses.forEach((saved, idx) => {
          if (saved.bloomed) {
            this.pond.lotuses[idx].bloomed = true;
            this.pond.lotuses[idx].bloomRatio = saved.bloomRatio !== undefined ? saved.bloomRatio : 1.0;
          }
        });
      }

      this.checkAwakeningProgression();
      this.emitDiscoveryUpdate();
    } catch (err) {
      console.warn("Could not load garden progress:", err);
    }
  }

  /**
   * Resets cached garden progress and reloads
   */
  resetProgress() {
    try {
      localStorage.removeItem("living_garden_save_v1");
      window.location.reload();
    } catch (err) {
      console.warn("Could not reset garden progress:", err);
    }
  }

  /**
   * -------------------------------------------------------------
   * MAIN SIMULATION & RENDERING LOOP
   * -------------------------------------------------------------
   */
  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;
    this.time += dt;

    // 1. Update Physics & Entities
    this.update(dt);

    // 2. Render Frame
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Smooth breeze oscillation
    this.breeze += (this.targetBreeze - this.breeze) * 0.05;
    this.targetBreeze *= 0.98; // natural decay

    // Camera Parallax
    this.renderer.updateCamera(this.cursor.normX, this.cursor.normY);

    // 1. Watering Can Physics
    this.updateWateringCan(dt);

    // 2. Wind Chime Pendulum Physics
    const restoring = -this.windChime.spring * this.windChime.angle;
    this.windChime.angVel += restoring;
    this.windChime.angVel *= this.windChime.damping;
    this.windChime.angle += this.windChime.angVel;

    // 3. Lantern Flame Flicker
    if (this.state.lanternLit) {
      this.lantern.flameTimer += dt;
      if (this.lantern.flameTimer > 0.12) {
        this.lantern.flameFrame++;
        this.lantern.flameTimer = 0;
      }
    }

    // 4. Flowers Physics & Blooming
    this.flowers.forEach(fl => {
      // Natural wind sway + cursor proximity lean
      const naturalSway = Math.sin(this.time * 2.5 + fl.x * 0.05) * (1.2 + this.breeze * 2.0);
      const toCursorX = this.cursor.x - (fl.x + 12);
      const toCursorY = this.cursor.y - (fl.y + 10);
      const cursorDist = Math.hypot(toCursorX, toCursorY);

      let cursorLean = 0;
      if (cursorDist < 45) {
        // Lean slightly toward cursor
        cursorLean = (toCursorX / cursorDist) * 3.5 * (1.0 - cursorDist / 45);
      }

      fl.sway += (-fl.sway * 0.1);
      fl.currentSway = naturalSway + cursorLean + fl.sway;

      // Smooth bloom transition
      if (fl.targetBloom > fl.bloomRatio) {
        fl.bloomRatio += dt * 0.45;
        if (fl.bloomRatio > 1.0) fl.bloomRatio = 1.0;
      }
    });

    // 5. Living Field of Grass Physics
    this.grassField.forEach(gb => {
      const dx = this.cursor.x - gb.x;
      const dy = this.cursor.y - gb.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 36 && this.cursor.speed > 0.4) {
        const pushDir = this.cursor.x > gb.x ? -1 : 1;
        const pushStrength = (1.0 - dist / 36) * Math.min(5.0, this.cursor.speed * 0.5);
        gb.bendVel += pushDir * pushStrength * 0.35;
      }

      // Natural spring restoration + damping
      gb.bendVel += (-0.14 * gb.bend);
      gb.bendVel *= 0.86;
      gb.bend += gb.bendVel;
    });

    // 6. Pond Ripples & Lotuses
    for (let i = this.pond.ripples.length - 1; i >= 0; i--) {
      const r = this.pond.ripples[i];
      r.radius += dt * 18;
      r.alpha -= dt * 0.4;
      if (r.alpha <= 0 || r.radius > r.maxRadius) {
        this.pond.ripples.splice(i, 1);
      }
    }

    this.pond.lotuses.forEach(lotus => {
      if (lotus.bloomed && lotus.bloomRatio < 1.0) {
        lotus.bloomRatio = Math.min(1.0, lotus.bloomRatio + dt * 0.5);
      }
    });

    // 7. Fireflies Steering & Flocking
    this.updateFireflies(dt);

    // 8. Butterflies Flight
    this.updateButterflies(dt);

    // 9. Pollen & Falling Leaf Particles
    for (let i = this.pollenParticles.length - 1; i >= 0; i--) {
      const p = this.pollenParticles[i];
      p.x += p.vx + this.breeze * 0.4;
      p.y += p.vy;
      p.alpha -= dt * 0.25;
      if (p.isLeaf) {
        p.rot += p.rotSpeed;
      }
      if (p.alpha <= 0 || p.y > 360) {
        this.pollenParticles.splice(i, 1);
      }
    }

    // 10. Mysterious Seed & Spirit Tree Growth
    if (this.state.isTransforming || this.state.isTransformed) {
      if (this.spiritTree.growthProgress < 1.0) {
        this.spiritTree.growthProgress += dt * 0.18; // smooth growth over ~5.5s
        if (this.spiritTree.growthProgress >= 1.0) {
          this.spiritTree.growthProgress = 1.0;
          if (!this.spiritTree.grown) {
            this.spiritTree.grown = true;
            this.saveProgress();
          }
        }
      }
      this.mysteriousSeed.pulse = 1.0;

      // Spawn drifting falling sakura blossom petals across the meadow
      if (this.spiritTree.growthProgress > 0.45 && this.driftingBlossoms.length < 75) {
        if (Math.random() < 0.4) {
          this.driftingBlossoms.push({
            x: 230 + (Math.random() - 0.5) * 440,
            y: 10 + Math.random() * 120,
            vx: 0.6 + Math.random() * 0.9 + this.breeze * 0.8,
            vy: 0.35 + Math.random() * 0.45,
            oscPhase: Math.random() * Math.PI * 2,
            oscSpeed: 2.0 + Math.random() * 2.0,
            color: Math.random() > 0.4 ? PALETTE.sakuraPink : (Math.random() > 0.5 ? PALETTE.sakuraLight : PALETTE.sakuraPale),
            rot: Math.random() * Math.PI,
            tumbleSpeed: 2.0 + Math.random() * 3.0
          });
        }
      }
    } else if (this.state.awakeningLevel > 0.3) {
      this.mysteriousSeed.pulse = 0.5 + 0.5 * Math.sin(this.time * 3.0);
    }

    // 11. Drifting Falling Blossom Petals Physics
    for (let i = this.driftingBlossoms.length - 1; i >= 0; i--) {
      const b = this.driftingBlossoms[i];
      b.x += b.vx + Math.sin(this.time * b.oscSpeed + b.oscPhase) * 0.4;
      b.y += b.vy;
      b.rot += b.tumbleSpeed * dt;
      if (b.y > 340 || b.x > 645) {
        this.driftingBlossoms.splice(i, 1);
      }
    }
  }

  /**
   * Watering Can Drag & Drop + Pour Stream
   */
  updateWateringCan(dt) {
    const can = this.wateringCan;

    if (!can.isDragging) {
      // Spring back to resting spot smoothly
      can.x += (can.restX - can.x) * 0.12;
      can.y += (can.restY - can.y) * 0.12;
      can.isPouring = false;
    } else {
      // If dragged near flowerbeds, pond, or seed, tilt & pour!
      const overGardenBed = can.y > 200 && can.y < 320;
      can.isPouring = overGardenBed;

      if (can.isPouring) {
        can.pourTime += dt;
        if (can.pourTime > 0.08) {
          // Spawn sparkling water drops from spout
          const spoutX = can.x + 29;
          const spoutY = can.y + 7;
          can.drops.push({
            x: spoutX,
            y: spoutY,
            vx: 0.8 + Math.random() * 0.4,
            vy: 2.5 + Math.random() * 1.5,
            alpha: 1.0
          });
          can.pourTime = 0;
          this.audio.playWaterStream();
        }

        // Water flowers underneath the stream
        const pourLandingX = can.x + 36;
        const pourLandingY = can.y + 40;

        this.flowers.forEach(fl => {
          const d = Math.hypot(pourLandingX - (fl.x + 12), pourLandingY - (fl.y + 12));
          if (d < 38) {
            if (!fl.watered) {
              fl.watered = true;
              fl.targetBloom = 1.0;
              this.audio.playFlowerBloom();
              this.spawnPollen(fl.x + 12, fl.y + 8, 6);
              this.state.flowersBloomed++;
              this.state.wateredCount++;
              this.checkAwakeningProgression();
              this.saveProgress();
            }
          }
        });

        // Water pond lotuses
        this.pond.lotuses.forEach(lotus => {
          const d = Math.hypot(pourLandingX - lotus.x, pourLandingY - lotus.y);
          if (d < 35 && !lotus.bloomed) {
            lotus.bloomed = true;
            this.audio.playFlowerBloom();
            this.spawnPollen(lotus.x, lotus.y - 4, 6);
            this.checkAwakeningProgression();
            this.saveProgress();
          }
        });

        // Water mysterious seed
        const seedD = Math.hypot(pourLandingX - this.mysteriousSeed.x, pourLandingY - this.mysteriousSeed.y);
        if (seedD < 32) {
          this.mysteriousSeed.pulse = 1.0;
          this.spawnPollen(this.mysteriousSeed.x, this.mysteriousSeed.y - 4, 4);
          if (this.state.awakeningLevel >= 0.7) {
            this.triggerGreatTransformation();
          }
        }
      }
    }

    // Update water drops
    for (let i = can.drops.length - 1; i >= 0; i--) {
      const d = can.drops[i];
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.25; // gravity
      if (d.y > 315) {
        // Water splash sparks
        for (let s = 0; s < 2; s++) {
          this.pollenParticles.push({
            x: d.x,
            y: d.y,
            vx: (Math.random() - 0.5) * 1.4,
            vy: -0.6 - Math.random() * 0.8,
            alpha: 0.8,
            color: PALETTE.waterSparkle,
            isLeaf: false
          });
        }
        can.drops.splice(i, 1);
      }
    }
  }

  /**
   * Fireflies organic flight simulation
   */
  updateFireflies(dt) {
    this.fireflies.forEach(f => {
      f.pulsePhase += f.pulseSpeed;
      f.pulse = 0.5 + 0.5 * Math.sin(f.pulsePhase);

      // Wander acceleration
      f.vx += (Math.random() - 0.5) * 0.12;
      f.vy += (Math.random() - 0.5) * 0.10;

      // Friction
      f.vx *= 0.94;
      f.vy *= 0.94;

      // Reaction to Lantern
      if (this.state.lanternLit) {
        const lx = this.lantern.x + 12;
        const ly = this.lantern.y + 18;
        const distL = Math.hypot(lx - f.x, ly - f.y);
        if (distL < 140) {
          // Gentle orbit around lantern
          f.vx += (lx - f.x) * 0.008 + (ly - f.y) * 0.005;
          f.vy += (ly - f.y) * 0.008 - (lx - f.x) * 0.005;
        }
      }

      // Reaction to Cursor
      const cDist = Math.hypot(this.cursor.x - f.x, this.cursor.y - f.y);
      if (cDist < 60) {
        if (this.cursor.speed > 5) {
          // Scatter away from fast cursor
          f.vx += (f.x - this.cursor.x) * 0.04;
          f.vy += (f.y - this.cursor.y) * 0.04;
        } else if (f.curiosity && cDist > 18) {
          // Curious firefly gently circles cursor
          f.vx += (this.cursor.x - f.x) * 0.015;
          f.vy += (this.cursor.y - f.y) * 0.015;
        }
      }

      // Celestial spiral during Great Transformation
      if (this.state.isTransforming || this.state.isTransformed) {
        const treeX = 220;
        const treeY = 160;
        const angle = Math.atan2(f.y - treeY, f.x - treeX) + 0.03;
        const rad = Math.hypot(f.x - treeX, f.y - treeY);
        f.x = treeX + Math.cos(angle) * (rad + 0.2);
        f.y = treeY + Math.sin(angle) * (rad + 0.2) - 0.4;
      } else {
        f.x += f.vx;
        f.y += f.vy;
      }

      // Stay within garden bounds
      if (f.x < 20) f.x = 20;
      if (f.x > 620) f.x = 620;
      if (f.y < 40) f.y = 40;
      if (f.y > 330) f.y = 330;
    });
  }

  /**
   * Butterflies Flight & Perching
   */
  updateButterflies(dt) {
    this.butterflies.forEach(b => {
      b.flightTimer += dt;
      b.frameTimer += dt;
      if (b.frameTimer > 0.09) {
        b.frame++;
        b.frameTimer = 0;
      }

      // Flutter flight along smooth bezier curves
      const dx = b.targetX - b.x;
      const dy = b.targetY - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 15) {
        // Pick next bloomed flower or picturesque waypoint
        const bloomed = this.flowers.filter(f => f.bloomRatio > 0.5);
        if (bloomed.length > 0 && Math.random() > 0.3) {
          const chosen = bloomed[Math.floor(Math.random() * bloomed.length)];
          b.targetX = chosen.x + 12;
          b.targetY = chosen.y + 4;
        } else {
          b.targetX = 60 + Math.random() * 520;
          b.targetY = 160 + Math.random() * 120;
        }
      } else {
        b.x += (dx / dist) * 1.4 + Math.sin(b.flightTimer * 5) * 0.6;
        b.y += (dy / dist) * 1.1 + Math.cos(b.flightTimer * 4) * 0.8;
      }
    });
  }

  /**
   * -------------------------------------------------------------
   * RENDERING PASSES
   * -------------------------------------------------------------
   */
  render() {
    this.renderer.beginFrame();
    const ctx = this.renderer.vCtx;

    // 1. Sky, Moon, Clouds, Stars
    this.renderer.renderSky(this.time, this.state.awakeningLevel, this.state.isTransformed);

    // 2. Distant Mountains & Forest Ridge
    this.renderer.renderMountains();

    // 3. Rolling Green Meadows (No concrete pavement or stone walls!)
    this.renderRollingMeadows(ctx);

    // 4. Serene Pond with Reflections & Ripples
    this.renderPond(ctx);

    // 5. Scenic Weeping Willow Tree & Hanging Wind Chime
    this.renderScenicWillowTree(ctx);

    // 6. Rustic Lantern on Timber Post
    this.renderLantern(ctx);

    // 7. Mysterious Seed in Clover Fairy Ring
    this.renderSeed(ctx);

    // 8. The Great Spirit Tree (if transforming or transformed)
    if (this.state.isTransforming || this.state.isTransformed) {
      this.renderSpiritTree(ctx);
    }

    // 9. Interactive Wildflowers
    this.renderFlowers(ctx);

    // 10. Living Field of Grass (hundreds of waving blades with wind waves)
    this.renderGrassField(ctx);

    // 12. Vintage Watering Can & Water Stream
    this.renderWateringCan(ctx);

    // 13. Butterflies & Pollen Particles
    this.renderCrittersAndParticles(ctx);

    // 14. Dynamic 2D Lighting Pass (ambient dusk + lantern glow + bioluminescence)
    this.renderer.applyLightingPass(
      this.state.lanternLit,
      { x: this.lantern.x + 12, y: this.lantern.y + 16 },
      this.fireflies,
      this.flowers,
      this.state.awakeningLevel,
      this.state.isTransformed
    );

    // 15. Fireflies Glowing Cores (drawn after lighting for sharp pixel brilliance)
    this.renderFireflies(ctx);

    // 16. Subtle Stardust Cursor Trail
    this.renderCursorMote(ctx);

    // Present virtual pixel buffer to screen
    this.renderer.present();
  }

  /**
   * Rolling Green Meadows (Organic hills, knolls, clover patches - No concrete!)
   */
  renderRollingMeadows(ctx) {
    const camX = this.renderer.cameraX;
    const camY = this.renderer.cameraY;

    // 1. Far Rolling Grassy Ridge (Horizon meadow against dusk sky)
    const farCamX = camX * 0.35;
    const farCamY = camY * 0.3;
    ctx.fillStyle = PALETTE.meadowHillFar;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(0, 205 + farCamY);
    ctx.quadraticCurveTo(140 + farCamX, 192 + farCamY, 280 + farCamX, 208 + farCamY);
    ctx.quadraticCurveTo(420 + farCamX, 224 + farCamY, 530 + farCamX, 198 + farCamY);
    ctx.quadraticCurveTo(590 + farCamX, 190 + farCamY, 640, 204 + farCamY);
    ctx.lineTo(640, 360);
    ctx.closePath();
    ctx.fill();

    // Dithered grass tips along horizon ridge
    ctx.fillStyle = PALETTE.meadowHillMid;
    for (let x = 0; x < 640; x += 3) {
      const rx = Math.round(x + farCamX);
      const ry = Math.round(204 + Math.sin(x * 0.015) * 8 + farCamY);
      ctx.fillRect(rx, ry - 2, 1, 3);
      if (x % 6 === 0) ctx.fillRect(rx + 1, ry - 3, 1, 2);
    }

    // 2. Mid Rolling Meadow Knoll (sloping around pond)
    const midCamX = camX * 0.55;
    const midCamY = camY * 0.5;
    ctx.fillStyle = PALETTE.meadowHillMid;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(0, 226 + midCamY);
    ctx.quadraticCurveTo(160 + midCamX, 242 + midCamY, 320 + midCamX, 228 + midCamY);
    ctx.quadraticCurveTo(460 + midCamX, 218 + midCamY, 640, 236 + midCamY);
    ctx.lineTo(640, 360);
    ctx.closePath();
    ctx.fill();

    // 3. Main Rolling Meadow Field (Lush Green expanse down to bottom)
    const nearCamX = camX * 0.75;
    const nearCamY = camY * 0.7;
    ctx.fillStyle = PALETTE.grassDark;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(0, 248 + nearCamY);
    ctx.quadraticCurveTo(180 + nearCamX, 264 + nearCamY, 340 + nearCamX, 248 + nearCamY);
    ctx.quadraticCurveTo(500 + nearCamX, 238 + nearCamY, 640, 256 + nearCamY);
    ctx.lineTo(640, 360);
    ctx.closePath();
    ctx.fill();

    // Gradient bands of living meadow green
    ctx.fillStyle = PALETTE.grassMid;
    ctx.fillRect(0, Math.round(268 + nearCamY), 640, 92);
    ctx.fillStyle = PALETTE.grassLush;
    ctx.fillRect(0, Math.round(295 + nearCamY), 640, 65);

    // Subtle dither texture across meadow ground
    for (let dy = 265; dy < 360; dy += 4) {
      for (let dx = (dy % 8 === 0 ? 0 : 2); dx < 640; dx += 4) {
        if (Math.sin(dx * 0.05 + dy * 0.08) > 0.25) {
          ctx.fillStyle = PALETTE.grassBright;
          ctx.fillRect(Math.round(dx + nearCamX), Math.round(dy + nearCamY), 2, 1);
        }
      }
    }

    // Render clover patches and buttercups in the grass
    this.meadowFlowers.forEach(mf => {
      const fx = Math.round(mf.x + nearCamX);
      const fy = Math.round(mf.y + nearCamY);
      if (mf.type === "clover") {
        ctx.fillStyle = PALETTE.cloverColor;
        ctx.fillRect(fx - 1, fy, 3, 2);
        ctx.fillRect(fx, fy - 1, 1, 4);
      } else {
        ctx.fillStyle = PALETTE.buttercupGold;
        ctx.fillRect(fx, fy, 2, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(fx, fy, 1, 1);
      }
    });

    // Dark fertile moist soil under watered flowers (clean, no concrete pavement!)
    this.flowers.forEach(fl => {
      if (fl.watered || fl.bloomRatio > 0.2) {
        const mx = Math.round(fl.x + nearCamX + 2);
        const my = Math.round(fl.y + nearCamY + 22);
        ctx.fillStyle = PALETTE.soilWet;
        ctx.fillRect(mx - 6, my, 26, 4);
        ctx.fillRect(mx - 8, my + 1, 30, 2);
      }
    });

    // Moist earth around mysterious seed
    if (this.state.isTransforming || this.state.isTransformed || this.mysteriousSeed.pulse > 0.3) {
      const sx = Math.round(this.mysteriousSeed.x + nearCamX);
      const sy = Math.round(this.mysteriousSeed.y + nearCamY + 8);
      ctx.fillStyle = PALETTE.soilWet;
      ctx.fillRect(sx - 16, sy, 32, 5);
    }
  }

  /**
   * Serene Pond Nestled in the Meadow with Animated Reflections & Reeds
   */
  renderPond(ctx) {
    const camX = this.renderer.cameraX * 0.65;
    const camY = this.renderer.cameraY * 0.6;
    const p = this.pond;
    const px = Math.round(p.x + camX);
    const py = Math.round(p.y + camY);

    // 1. Mossy Earth Shoreline
    ctx.fillStyle = PALETTE.meadowHillFar;
    ctx.beginPath();
    ctx.ellipse(px + p.w * 0.5, py + p.h * 0.5 + 2, p.w * 0.52, p.h * 0.54, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Deep Water Basin
    ctx.fillStyle = PALETTE.waterDeep;
    ctx.beginPath();
    ctx.ellipse(px + p.w * 0.5, py + p.h * 0.5, p.w * 0.5, p.h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Clear Water Surface
    ctx.fillStyle = PALETTE.waterMid;
    ctx.beginPath();
    ctx.ellipse(px + p.w * 0.5, py + p.h * 0.5 + 3, p.w * 0.46, p.h * 0.43, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Shimmering Reflections (Moon & Lantern)
    const moonRefX = px + p.w * 0.68;
    const moonRefY = py + p.h * 0.35;
    ctx.fillStyle = "rgba(254, 240, 138, 0.28)";
    for (let r = 0; r < 5; r++) {
      const wave = Math.sin(this.time * 2.5 + r * 1.5) * 3;
      ctx.fillRect(Math.round(moonRefX + wave - 8), Math.round(moonRefY + r * 5), 16, 2);
    }

    if (this.state.lanternLit) {
      const lanRefX = px + 28;
      const lanRefY = py + p.h * 0.4;
      ctx.fillStyle = "rgba(245, 158, 11, 0.32)";
      for (let r = 0; r < 6; r++) {
        const wave = Math.sin(this.time * 3.0 + r * 1.8) * 4;
        ctx.fillRect(Math.round(lanRefX + wave - 10), Math.round(lanRefY + r * 4), 20, 2);
      }
    }

    // 5. Water Ripples
    p.ripples.forEach(rip => {
      ctx.strokeStyle = `rgba(126, 228, 230, ${rip.alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(rip.x + camX, rip.y + camY, rip.radius, rip.radius * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 6. Water Reeds & Cattails around the edge
    const reeds = [
      { rx: px + 12, ry: py + p.h * 0.6, h: 22 },
      { rx: px + 18, ry: py + p.h * 0.65, h: 26 },
      { rx: px + p.w - 18, ry: py + p.h * 0.55, h: 24 },
      { rx: px + p.w - 12, ry: py + p.h * 0.6, h: 20 }
    ];
    reeds.forEach(rd => {
      const rSway = Math.sin(this.time * 2.0 + rd.rx * 0.1) * (1.5 + this.breeze * 2.0);
      ctx.fillStyle = PALETTE.grassLush;
      ctx.fillRect(rd.rx, rd.ry - rd.h, 2, rd.h);
      ctx.fillStyle = "#4a2d1d";
      ctx.fillRect(Math.round(rd.rx + rSway - 1), rd.ry - rd.h, 4, 8);
    });

    // 7. Water Lilies & Glowing Lotuses
    p.lotuses.forEach(lotus => {
      const spr = this.sprites.getWaterLilySprite(lotus.bloomed, lotus.bloomRatio);
      ctx.drawImage(spr, Math.round(lotus.x + camX - 14), Math.round(lotus.y + camY - 9));
    });
  }

  /**
   * Scenic Weeping Willow Tree & Hanging Wind Chime
   */
  renderScenicWillowTree(ctx) {
    const camX = this.renderer.cameraX * 0.6;
    const camY = this.renderer.cameraY * 0.55;

    const tx = Math.round(95 + camX);
    const ty = Math.round(260 + camY);

    // 1. Spreading Tree Roots anchoring into grassy meadow
    ctx.fillStyle = "#1e130d";
    ctx.fillRect(tx - 22, ty - 2, 44, 8);
    ctx.fillRect(tx - 30, ty + 1, 16, 4);
    ctx.fillRect(tx + 14, ty + 1, 18, 4);
    ctx.fillStyle = "#3a2216";
    ctx.fillRect(tx - 18, ty - 1, 36, 4);

    // Grass tufts growing over roots
    ctx.fillStyle = PALETTE.grassBright;
    ctx.fillRect(tx - 25, ty - 3, 4, 6);
    ctx.fillRect(tx + 18, ty - 3, 5, 6);

    // 2. Ancient Twisting Trunk
    ctx.fillStyle = "#1e130d";
    ctx.beginPath();
    ctx.moveTo(tx - 16, ty);
    ctx.quadraticCurveTo(tx - 20, ty - 70, tx - 10, ty - 130);
    ctx.lineTo(tx + 10, ty - 130);
    ctx.quadraticCurveTo(tx + 14, ty - 70, tx + 16, ty);
    ctx.closePath();
    ctx.fill();

    // Bark texture & warm twilight rim
    ctx.fillStyle = "#3d2417";
    ctx.fillRect(tx - 6, ty - 120, 12, 115);
    ctx.fillStyle = "#5c3722";
    ctx.fillRect(tx - 2, ty - 110, 4, 100);

    // 3. Sweeping Overhead Boughs
    ctx.fillStyle = "#1e130d";
    ctx.beginPath();
    ctx.moveTo(tx - 4, ty - 120);
    ctx.quadraticCurveTo(tx + 40, ty - 140, tx + 85, ty - 130);
    ctx.lineTo(tx + 85, ty - 124);
    ctx.quadraticCurveTo(tx + 38, ty - 133, tx + 4, ty - 112);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(tx - 8, ty - 115);
    ctx.quadraticCurveTo(tx - 45, ty - 135, tx - 70, ty - 120);
    ctx.lineTo(tx - 70, ty - 114);
    ctx.quadraticCurveTo(tx - 42, ty - 128, tx - 4, ty - 108);
    ctx.closePath();
    ctx.fill();

    // 4. Handcrafted Individual Willow Leaves (No flat ellipse polygons!)
    this.willowLeaves.forEach(leaf => {
      const sway = Math.sin(this.time * leaf.flutterSpeed + leaf.phase) * (leaf.flutterAmp + this.breeze * 2.2);
      const lx = Math.round(tx + leaf.relX + sway);
      const ly = Math.round(ty + leaf.relY + Math.abs(sway) * 0.2);

      // Distinct pixel leaf with shadow backing, body, highlight & starlight tip
      ctx.fillStyle = leaf.colorShadow;
      ctx.fillRect(lx - 1, ly + 1, 3, 2);

      ctx.fillStyle = leaf.colorMid;
      ctx.fillRect(lx - 1, ly, 3, 1);

      ctx.fillStyle = leaf.colorLight;
      ctx.fillRect(lx, ly - 1, 2, 1);

      ctx.fillStyle = leaf.colorTip;
      ctx.fillRect(lx, ly - 1, 1, 1);
    });

    // 5. Hanging Weeping Willow Fronds swaying rhythmically in wind with individual leaflets
    const fronds = [
      { ox: -50, len: 45, delay: 0 },
      { ox: -25, len: 55, delay: 1.2 },
      { ox: 5, len: 62, delay: 2.1 },
      { ox: 35, len: 58, delay: 0.8 },
      { ox: 70, len: 48, delay: 1.8 }
    ];

    fronds.forEach(fr => {
      const fx = tx + fr.ox;
      const fy = ty - 130;
      const sway = Math.sin(this.time * 2.2 + fr.delay) * (3.5 + this.breeze * 3.5);

      ctx.fillStyle = PALETTE.grassDark;
      ctx.fillRect(Math.round(fx + sway * 0.4), fy, 1, Math.round(fr.len * 0.7));

      for (let y = 8; y < fr.len; y += 6) {
        const curSway = sway * (y / fr.len);
        const lx = Math.round(fx + curSway);
        const ly = Math.round(fy + y);

        // Individual drooping leaflet with shadow and highlight
        ctx.fillStyle = PALETTE.leafEmeraldDark;
        ctx.fillRect(lx - 2, ly, 5, 2);
        ctx.fillStyle = (y % 12 === 0) ? PALETTE.grassHighlight : PALETTE.grassBright;
        ctx.fillRect(lx - 1, ly, 3, 1);
        ctx.fillStyle = PALETTE.grassMoonlit;
        ctx.fillRect(lx, ly, 1, 1);
      }
    });

    // 6. Hanging Wind Chime on the arching bough
    const chimeX = tx + 62;
    const chimeY = ty - 128;
    this.windChime.x = chimeX;
    this.windChime.y = chimeY;

    const chimeSpr = this.sprites.getWindChimeSprite(this.windChime.angle);
    ctx.drawImage(chimeSpr, Math.round(chimeX - 18), Math.round(chimeY));
  }

  /**
   * Stone Pedestal & Rustic Lantern
   */
  renderLantern(ctx) {
    const camX = this.renderer.cameraX * 0.65;
    const camY = this.renderer.cameraY * 0.6;
    const lx = Math.round(this.lantern.x + camX);
    const ly = Math.round(this.lantern.y + camY);

    const spr = this.sprites.getLanternSprite(this.state.lanternLit, this.lantern.flameFrame);
    ctx.drawImage(spr, lx, ly);
  }

  /**
   * Mysterious Dormant Seed in Moss Cradle
   */
  renderSeed(ctx) {
    // Once the cherry blossom tree begins growing, the seed has blossomed into the Great Tree
    if (this.spiritTree.growthProgress > 0.1) {
      return;
    }

    const camX = this.renderer.cameraX * 0.7;
    const camY = this.renderer.cameraY * 0.65;
    const sx = Math.round(this.mysteriousSeed.x + camX - 12);
    const sy = Math.round(this.mysteriousSeed.y + camY - 12);

    const isAwake = this.state.awakeningLevel > 0.4;
    const spr = this.sprites.getSeedSprite(this.mysteriousSeed.pulse, isAwake);
    ctx.drawImage(spr, sx, sy);

    // Pulsing aura rings when awakening or touched
    if (this.mysteriousSeed.pulse > 0.1) {
      const radius = 12 + this.mysteriousSeed.pulse * 14;
      ctx.strokeStyle = `rgba(253, 230, 138, ${this.mysteriousSeed.pulse * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx + 12, sy + 12, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * -------------------------------------------------------------
   * THE CHERRY BLOSSOM TREE (SAKURA)
   * Grown majestically during Phase 5 Transformation.
   * Matches the reference pixel art: billowing cloud-like canopy mounds,
   * dark gnarled branches peeking out from below, sturdy trunk anchored
   * in meadow grass with ground shadow & fallen petals, romantic carved initials.
   * -------------------------------------------------------------
   */
  renderSpiritTree(ctx) {
    const camX = this.renderer.cameraX * 0.6;
    const camY = this.renderer.cameraY * 0.55;
    const p = this.spiritTree.growthProgress;
    if (p <= 0.005) return;

    // Anchor coordinates for the grand centerpiece tree
    const rootX = Math.round(230 + camX);
    const rootY = Math.round(318 + camY);

    if (this.cherryTreeImg && this.cherryTreeImg.complete && !this.cherryTreeLoaded) {
      this.cherryTreeLoaded = true;
    }

    // High-resolution display dimensions (1:1 crisp pixel art)
    const fullW = 476;
    const fullH = 331;
    const trunkAnchorX = 221;

    const growProgress = Math.min(1.0, p);

    // 1. Spreading Sturdy Roots & Soil Eruption on the Meadow
    if (growProgress > 0.02) {
      const rootSpread = Math.min(1.0, growProgress * 2.2);
      ctx.fillStyle = "#1a0e14";
      ctx.fillRect(rootX - Math.round(28 * rootSpread), rootY - 3, Math.round(56 * rootSpread), 7);
      ctx.fillRect(rootX - Math.round(38 * rootSpread), rootY + 1, Math.round(20 * rootSpread), 4);
      ctx.fillRect(rootX + Math.round(18 * rootSpread), rootY + 1, Math.round(22 * rootSpread), 4);

      ctx.fillStyle = "#3e1e26";
      ctx.fillRect(rootX - Math.round(22 * rootSpread), rootY - 1, Math.round(44 * rootSpread), 4);

      // Fresh grass tufts overlapping roots
      ctx.fillStyle = PALETTE.grassBright;
      ctx.fillRect(rootX - Math.round(26 * rootSpread), rootY - 3, 3, 5);
      ctx.fillRect(rootX + Math.round(20 * rootSpread), rootY - 3, 4, 5);
    }

    // 2. Soft Canopy Ground Shadow on the meadow grass
    if (growProgress > 0.18) {
      const shadowAlpha = Math.min(0.44, (growProgress - 0.18) * 0.65);
      const shadowSpread = Math.min(1.0, 0.3 + 0.7 * Math.pow(growProgress, 0.7));
      ctx.fillStyle = `rgba(14, 38, 30, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(rootX - 5, rootY + 6, 160 * shadowSpread, 22 * shadowSpread, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fallen Pink Sakura Petals on the grass & shadow knoll
      this.fallenPetals.forEach(fp => {
        const fx = Math.round(rootX + fp.relX * Math.min(1.0, growProgress * 1.1) * 1.76);
        const fy = Math.round(rootY + fp.relY * 1.76);
        ctx.fillStyle = fp.color;
        ctx.fillRect(fx, fy, fp.size, 1);
        if (fp.size > 1) {
          ctx.fillStyle = PALETTE.sakuraPale || "#ffffff";
          ctx.fillRect(fx, fy, 1, 1);
        }
      });
    }

    // 3. Render Tree: Trunk shoots up first, then Leaves GROW OUT continuously!
    if (this.cherryTreeLoaded || this.growthFramesLoaded > 0) {
      const windSway = Math.sin(this.time * 2.0) * (0.008 + this.breeze * 0.015) * Math.min(1.0, growProgress * 1.5);

      ctx.save();
      ctx.translate(rootX, rootY);
      ctx.rotate(windSway);
      ctx.imageSmoothingEnabled = false;

      if (growProgress >= 1.0) {
        // Complete full bloom: Draw full crisp cherry blossom tree
        ctx.drawImage(this.cherryTreeImg, -trunkAnchorX, -fullH, fullW, fullH);
      } else if (growProgress < 0.28) {
        // Phase 1: Bare wooden trunk & limbs shoot physically upward out of the soil
        const barkFrac = Math.min(1.0, Math.pow(growProgress / 0.28, 0.85));
        const visibleBarkH = Math.max(4, Math.round(fullH * barkFrac));

        ctx.save();
        ctx.beginPath();
        ctx.rect(-trunkAnchorX - 40, -visibleBarkH, fullW + 80, visibleBarkH + 15);
        ctx.clip();
        const baseBarkImg = (this.growthFrames && this.growthFrames[0] && this.growthFrames[0].complete)
          ? this.growthFrames[0]
          : this.cherryTreeImg;
        ctx.drawImage(baseBarkImg, -trunkAnchorX, -fullH, fullW, fullH);
        ctx.restore();

        // Growth sparks riding the climbing tip
        const tipY = -visibleBarkH;
        for (let i = 0; i < 5; i++) {
          const px = Math.round((Math.sin(this.time * 9 + i * 1.4)) * 14);
          const py = tipY + Math.round(Math.cos(this.time * 10 + i * 1.2) * 5);
          ctx.fillStyle = i % 2 === 0 ? "#fde047" : "#4ade80";
          ctx.fillRect(px, py, 2, 2);
        }
      } else {
        // Phase 2: THE LEAVES GROW OUTWARD FROM THE BRANCHES!
        // Progress from 0.0 (bare tree) to 1.0 (full grand blossom)
        const leafProgress = Math.min(1.0, (growProgress - 0.28) / 0.72);
        const rawIdx = leafProgress * 15;
        const frameIdx = Math.min(14, Math.floor(rawIdx));
        const nextIdx = Math.min(15, frameIdx + 1);
        const frac = rawIdx - frameIdx;

        const curFrame = (this.growthFrames && this.growthFrames[frameIdx] && this.growthFrames[frameIdx].complete)
          ? this.growthFrames[frameIdx]
          : this.cherryTreeImg;
        const nextFrame = (this.growthFrames && this.growthFrames[nextIdx] && this.growthFrames[nextIdx].complete)
          ? this.growthFrames[nextIdx]
          : curFrame;

        // Render base current growth stage
        ctx.drawImage(curFrame, -trunkAnchorX, -fullH, fullW, fullH);

        // Smoothly crossfade next growth stage so leaves swell and unfurl continuously
        if (frac > 0.01 && nextFrame !== curFrame) {
          ctx.save();
          ctx.globalAlpha = frac;
          ctx.drawImage(nextFrame, -trunkAnchorX, -fullH, fullW, fullH);
          ctx.restore();
        }

        // Sparkling golden pollen & blossom spores popping along the expanding foliage perimeter
        for (let i = 0; i < 6; i++) {
          const spreadY = -120 - leafProgress * 150;
          const spreadX = (leafProgress * 180) * Math.sin(this.time * 6 + i * 1.5);
          const px = Math.round(spreadX);
          const py = Math.round(spreadY + Math.cos(this.time * 7 + i * 1.3) * 25);
          ctx.fillStyle = i % 2 === 0 ? "#ffbed2" : "#fde047";
          ctx.fillRect(px, py, 2, 2);
        }
      }

      ctx.restore();
    }

    // 4. Carved Romantic Initials on the trunk bark (perfectly centered to the trunk width)
    if (growProgress > 0.45) {
      const config = window.GARDEN_CONFIG || {};
      const carvingText = config.treeCarvingText || (config.initials ? (config.initials.includes("♡") ? config.initials : `${config.initials} ♡`) : "A + A ♡");
      const initAlpha = Math.min(1.0, (growProgress - 0.45) * 2.5);
      ctx.save();
      ctx.fillStyle = `rgba(253, 230, 138, ${initAlpha})`;
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      // Exact visual trunk center at rootY - 36 is rootX - 0.5 (leaving equal margins on both bark sides)
      ctx.fillText(carvingText, rootX - 0.5, rootY - 36);
      ctx.restore();
    }

    // 5. Shimmering Starlight Glints across the Canopy
    if (growProgress > 0.75) {
      this.canopyGlints.forEach(g => {
        const twinkle = Math.sin(this.time * g.speed + g.phase);
        if (twinkle > 0.86) {
          const gx = Math.round(rootX + g.relX * 1.76);
          const gy = Math.round(rootY + g.relY * 1.76);
          if (gy < rootY) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(gx, gy, 1, 1);
          }
        }
      });
    }

    // 6. Celestial Crown Halo of Starlight Spores
    if (growProgress > 0.88) {
      ctx.fillStyle = PALETTE.sakuraPale || "#fbcfe8";
      for (let i = 0; i < 9; i++) {
        const mAngle = (this.time * 0.35 + i * 0.7) % (Math.PI * 2);
        const mRad = 150 + Math.sin(this.time * 2.2 + i) * 16;
        const mx = Math.round(rootX + Math.cos(mAngle) * mRad);
        const my = Math.round(rootY - fullH * 0.82 + Math.sin(mAngle) * (mRad * 0.48));
        ctx.fillRect(mx, my, 1, 1);
      }
    }
  }

  /**
   * Interactive Diverse Botanical Flowers
   */
  renderFlowers(ctx) {
    const camX = this.renderer.cameraX * 0.75;
    const camY = this.renderer.cameraY * 0.7;

    this.flowers.forEach(fl => {
      const fx = Math.round(fl.x + camX);
      const fy = Math.round(fl.y + camY);

      const spr = this.sprites.getFlowerSprite(fl.type, fl.bloomRatio, fl.currentSway);
      ctx.drawImage(spr, fx, fy);
    });
  }

  /**
   * Living Field of Grass (Hundreds of waving blades with traveling wind waves & glints)
   */
  renderGrassField(ctx) {
    const camX = this.renderer.cameraX * 0.8;
    const camY = this.renderer.cameraY * 0.75;

    // Wind wave velocity and gust strength
    const waveSpeed = this.time * 2.8;
    const breezeFactor = 1.0 + this.breeze * 2.5;

    this.grassField.forEach(b => {
      // Traveling sinusoidal wave rolling across the meadow
      const wave = Math.sin(waveSpeed - b.windPhase) * (1.2 * breezeFactor);
      const totalSway = wave + b.naturalCurve + b.bend;

      const gx = Math.round(b.x + camX);
      const gy = Math.round(b.y + camY);
      const h = b.height;

      // Draw curved, tapering organic grass blade
      ctx.fillStyle = b.color;

      // Base segment (anchored into meadow earth)
      ctx.fillRect(gx, gy - Math.round(h * 0.35), b.baseWidth, Math.round(h * 0.35));

      // Mid segment (bending with wind)
      const midOffset = Math.round(totalSway * 0.5);
      const midW = Math.max(1, b.baseWidth - 1);
      ctx.fillRect(gx + midOffset, gy - Math.round(h * 0.75), midW, Math.round(h * 0.4));

      // Tip segment (whipping with breeze)
      const tipOffset = Math.round(totalSway);
      ctx.fillRect(gx + tipOffset, gy - h, 1, Math.round(h * 0.3));

      // Moonlight glint on waving grass peaks
      if (b.depth > 0.55 && wave > 0.85) {
        ctx.fillStyle = PALETTE.grassMoonlit;
        ctx.fillRect(gx + tipOffset, gy - h, 1, 1);
      }
    });
  }

  /**
   * Vintage Watering Can Sprite & Falling Droplet Stream
   */
  renderWateringCan(ctx) {
    const camX = this.renderer.cameraX * 0.8;
    const camY = this.renderer.cameraY * 0.75;
    const can = this.wateringCan;

    const cx = Math.round(can.x + (can.isDragging ? 0 : camX));
    const cy = Math.round(can.y + (can.isDragging ? 0 : camY));

    // Render watering can sprite
    const spr = this.sprites.getWateringCanSprite(can.isPouring);
    ctx.drawImage(spr, cx, cy);

    // Render water drops stream
    ctx.fillStyle = PALETTE.waterSparkle;
    can.drops.forEach(d => {
      ctx.fillRect(Math.round(d.x), Math.round(d.y), 2, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
    });
  }

  /**
   * Butterflies, Pollen & Leaves
   */
  renderCrittersAndParticles(ctx) {
    const camX = this.renderer.cameraX * 0.7;
    const camY = this.renderer.cameraY * 0.65;

    // Butterflies
    this.butterflies.forEach(b => {
      const spr = this.sprites.getButterflySprite(b.frame, b.variant);
      ctx.drawImage(spr, Math.round(b.x + camX - 8), Math.round(b.y + camY - 8));
    });

    // Pollen & Leaves
    this.pollenParticles.forEach(p => {
      ctx.fillStyle = p.color;
      if (p.isLeaf) {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 2);
      } else {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
    });

    // Drifting Blossom Petals tumbling in the breeze from the Great Tree
    this.driftingBlossoms.forEach(b => {
      const bx = Math.round(b.x + camX * 0.5);
      const by = Math.round(b.y + camY * 0.5);
      const w = Math.max(1, Math.round(Math.abs(Math.cos(b.rot)) * 3));

      ctx.fillStyle = b.color;
      ctx.fillRect(bx, by, w, 2);
      if (w >= 2) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx, by, 1, 1);
      }
    });
  }

  /**
   * Pixel Fireflies Sharp Glowing Cores
   */
  renderFireflies(ctx) {
    this.fireflies.forEach(f => {
      if (f.alpha > 0.1) {
        const fx = Math.round(f.x);
        const fy = Math.round(f.y);

        // Core white/lime pixel
        ctx.fillStyle = PALETTE.flameCore;
        ctx.fillRect(fx, fy, 2, 2);

        // Outer warm halo ring
        ctx.fillStyle = PALETTE.flameInner;
        ctx.fillRect(fx - 1, fy, 1, 2);
        ctx.fillRect(fx + 2, fy, 1, 2);
        ctx.fillRect(fx, fy - 1, 2, 1);
        ctx.fillRect(fx, fy + 2, 2, 1);
      }
    });
  }

  /**
   * Subtle cursor stardust mote
   */
  renderCursorMote(ctx) {
    const cx = Math.round(this.cursor.x);
    const cy = Math.round(this.cursor.y);

    ctx.fillStyle = "rgba(254, 240, 138, 0.4)";
    ctx.fillRect(cx - 1, cy, 3, 1);
    ctx.fillRect(cx, cy - 1, 1, 3);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx, cy, 1, 1);
  }
}

// Global initialization on DOM load
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("garden-canvas");
  if (canvas) {
    window.livingGarden = new LivingGarden(canvas);
    window.garden = window.livingGarden;
  }
});

// Utility helper to reset garden progress if visitor wants a fresh play
window.resetGardenProgress = () => {
  if (window.garden) {
    window.garden.resetProgress();
  }
};
