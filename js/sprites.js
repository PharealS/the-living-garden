/**
 * ====================================================================
 *   THE LIVING GARDEN - PIXEL ART SPRITE & ART ENGINE
 * ====================================================================
 * Handcrafted pixel art sprites and procedural drawing routines.
 * Authentic palette, dithering, and retro aesthetics.
 */

const PALETTE = {
  // Dusk Sky & Atmosphere
  skyTop: "#090d1f",
  skyMid: "#141c38",
  skyLow: "#2a274a",
  skyDusk: "#4a3556",
  skyWarm: "#734458",
  moon: "#fef8dd",
  moonGlow: "#fed7aa",
  star: "#e2e8f0",
  starTwinkle: "#fef08a",

  // Mountains & Distant Forest
  mountainFar: "#151b36",
  mountainMid: "#19243f",
  treeSilhouette: "#0f1a2e",

  // Rolling Meadow & Field of Grass
  meadowHillFar: "#142d2a",
  meadowHillMid: "#193f35",
  meadowHillNear: "#225642",
  grassDark: "#102a24",
  grassMid: "#1a4638",
  grassLush: "#24604b",
  grassBright: "#337d5c",
  grassHighlight: "#4ea373",
  grassMoonlit: "#7cd49a",
  cloverColor: "#3c9265",
  buttercupGold: "#fde047",
  soilDry: "#1e2e26",
  soilWet: "#121f1a",
  woodDark: "#261a12",
  woodMid: "#452d1d",
  woodLight: "#6e4a30",

  // Water & Reflections
  waterDeep: "#0e2329",
  waterMid: "#153a42",
  waterLight: "#275963",
  waterSparkle: "#7ee4e6",

  // Lantern & Warm Glows
  brassDark: "#4a3319",
  brassMid: "#825828",
  brassLight: "#c48e3a",
  lanternGlass: "#2e3b4a",
  flameCore: "#ffffff",
  flameInner: "#fef08a",
  flameMid: "#f59e0b",
  flameOuter: "#b45309",

  // Flowers & Flora
  lilyWhite: "#f8fafc",
  lilyCyan: "#a5f3fc",
  lilyGold: "#fde047",
  bellBlue: "#60a5fa",
  bellLavender: "#c084fc",
  poppyCoral: "#fb7185",
  poppyRed: "#e11d48",
  jasmineStar: "#fef9c3",

  // Magical / Transformation
  magicGold: "#fde68a",
  magicEmerald: "#6ee7b7",
  magicLavender: "#d8b4fe",
  wisteriaPink: "#f472b6",
  wisteriaPurple: "#a855f7",
  wisteriaWhite: "#fdf4ff",

  // High-Detail Spirit Blossom & Foliage Palette
  blossomShadow: "#2e1065",       // Deep midnight violet shadow
  blossomDeep: "#581c87",         // Rich imperial purple
  blossomMid: "#7e22ce",          // Vibrant wisteria purple
  blossomBright: "#a855f7",       // Luminous lavender
  blossomPinkShadow: "#831843",   // Deep ruby rose shadow
  blossomPink: "#db2777",         // Vibrant magenta petal
  blossomPinkLight: "#f472b6",    // Soft sakura rose
  blossomGlow: "#fbcfe8",         // Pastel blossom glow
  blossomWhite: "#ffffff",        // Starlight tip highlight
  blossomGold: "#fde047",         // Celestial stamen gold
  leafEmeraldDark: "#064e3b",     // Deep forest emerald shadow
  leafEmeraldMid: "#059669",      // Lush emerald body
  leafEmeraldBright: "#34d399",   // Vibrant spring leaf
  leafEmeraldGlow: "#a7f3d0",     // Translucent leaf highlight

  // Authentic Cherry Blossom (Sakura) Palette from Reference Image
  sakuraShadowDeep: "#4e172a",    // Deepest wine under-shadow at bottom edges of blossom masses
  sakuraShadow: "#7b2844",        // Rich rose shadow beneath puffs
  sakuraWine: "#9e3b5e",          // Mauve wine transition
  sakuraDeep: "#c2557b",          // Deep rose petal
  sakuraMid: "#de6e93",           // Vibrant classic sakura petal
  sakuraPink: "#ee8ba9",          // Rich sakura body
  sakuraBright: "#f9a7bf",        // Illuminated blossom petal
  sakuraLight: "#ffbed2",         // Soft peach-pink highlight
  sakuraPale: "#fedde6",          // Pale pastel puff highlight
  sakuraCream: "#fff0f4",         // Creamy crown petal
  sakuraWhite: "#ffffff",         // Sunlit blossom rim
  sakuraStamen: "#fde047",        // Soft yellow-gold stamen center
  sakuraBarkDeep: "#201215",      // Deepest bark shadow
  sakuraBarkDark: "#331a20",      // Trunk bark
  sakuraBarkMid: "#4a272f",       // Bark body
  sakuraBarkLight: "#663943",     // Bark highlight edge
  sakuraBarkWarm: "#824c58"       // Twilight rim on boughs
};

class PixelSpriteEngine {
  constructor() {
    this.cache = {};
  }

  /**
   * Helper to create a crisp offscreen pixel canvas
   */
  createCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  /**
   * ------------------------------------------------------------------
   * WATERING CAN SPRITE
   * Hand-drawn vintage copper/brass watering can
   * ------------------------------------------------------------------
   */
  getWateringCanSprite(isPouring = false) {
    const key = `watering_can_${isPouring}`;
    if (this.cache[key]) return this.cache[key];

    const w = 32, h = 26;
    const { canvas, ctx } = this.createCanvas(w, h);

    // If pouring, draw tilted
    ctx.save();
    if (isPouring) {
      ctx.translate(16, 16);
      ctx.rotate(-0.48); // tilt forward ~28 degrees
      ctx.translate(-16, -16);
    }

    // Colors
    const dark = PALETTE.brassDark;
    const mid = PALETTE.brassMid;
    const light = PALETTE.brassLight;
    const highlight = "#ebd294";

    // 1. Can Body (barrel)
    ctx.fillStyle = dark;
    ctx.fillRect(8, 11, 14, 12);
    ctx.fillStyle = mid;
    ctx.fillRect(9, 12, 12, 10);
    ctx.fillStyle = light;
    ctx.fillRect(10, 13, 8, 8);
    ctx.fillStyle = highlight;
    ctx.fillRect(11, 14, 2, 6);

    // 2. Base rim
    ctx.fillStyle = dark;
    ctx.fillRect(7, 23, 16, 2);
    ctx.fillStyle = mid;
    ctx.fillRect(8, 23, 14, 1);

    // 3. Top rim & opening
    ctx.fillStyle = dark;
    ctx.fillRect(9, 10, 12, 2);
    ctx.fillStyle = mid;
    ctx.fillRect(10, 10, 10, 1);

    // 4. Handle (arched from top to back)
    ctx.fillStyle = dark;
    ctx.fillRect(5, 7, 2, 12);
    ctx.fillRect(6, 6, 8, 2);
    ctx.fillStyle = light;
    ctx.fillRect(6, 7, 6, 1);

    // 5. Spout (reaching up and to the right)
    ctx.fillStyle = dark;
    ctx.fillRect(21, 17, 3, 3);
    ctx.fillRect(23, 14, 3, 4);
    ctx.fillRect(25, 11, 3, 4);
    ctx.fillRect(27, 8, 3, 4);

    ctx.fillStyle = mid;
    ctx.fillRect(22, 18, 2, 2);
    ctx.fillRect(24, 15, 2, 3);
    ctx.fillRect(26, 12, 2, 3);
    ctx.fillRect(28, 9, 2, 3);

    // 6. Rose (sprinkler head)
    ctx.fillStyle = dark;
    ctx.fillRect(28, 6, 4, 4);
    ctx.fillStyle = light;
    ctx.fillRect(29, 6, 2, 3);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(30, 7, 1, 1);

    ctx.restore();

    this.cache[key] = canvas;
    return canvas;
  }

  /**
   * ------------------------------------------------------------------
   * LANTERN SPRITE
   * Rustic stone pedestal + forged iron lantern (unlit & lit states)
   * ------------------------------------------------------------------
   */
  getLanternSprite(isLit = false, flameFrame = 0) {
    const key = `lantern_${isLit}_${flameFrame}`;
    if (this.cache[key]) return this.cache[key];

    const w = 24, h = 42;
    const { canvas, ctx } = this.createCanvas(w, h);

    // 1. Rustic Timber Stake Rooted in Meadow Grass
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(8, 28, 8, 14);
    ctx.fillStyle = PALETTE.woodMid;
    ctx.fillRect(9, 28, 6, 14);
    ctx.fillStyle = PALETTE.woodLight;
    ctx.fillRect(10, 28, 2, 14);

    // Sweet meadow clover and ivy climbing the post
    ctx.fillStyle = PALETTE.cloverColor;
    ctx.fillRect(7, 36, 4, 3);
    ctx.fillRect(12, 33, 4, 3);
    ctx.fillRect(7, 30, 3, 2);
    ctx.fillStyle = PALETTE.grassBright;
    ctx.fillRect(8, 38, 5, 4);
    ctx.fillRect(11, 37, 4, 5);

    // 2. Iron Lantern Base plate
    ctx.fillStyle = "#1e2430";
    ctx.fillRect(6, 26, 12, 2);
    ctx.fillStyle = "#333d4d";
    ctx.fillRect(7, 26, 10, 1);

    // 3. Lantern Glass Chamber
    const glassColor = isLit ? "#5c4028" : PALETTE.lanternGlass;
    ctx.fillStyle = glassColor;
    ctx.fillRect(7, 13, 10, 13);

    // 4. Glass reflection or flame
    if (!isLit) {
      // Gentle dusk reflection stripe on glass
      ctx.fillStyle = "#3d4b61";
      ctx.fillRect(9, 14, 2, 10);
      ctx.fillStyle = "#556782";
      ctx.fillRect(10, 15, 1, 6);
    } else {
      // Animated warm pixel flame
      const fShift = (flameFrame % 3) - 1;
      // Flame outer
      ctx.fillStyle = PALETTE.flameOuter;
      ctx.fillRect(10 + fShift, 17, 4, 7);
      ctx.fillRect(11, 16, 2, 2);
      // Flame mid
      ctx.fillStyle = PALETTE.flameMid;
      ctx.fillRect(11 + fShift, 18, 2, 5);
      // Flame inner
      ctx.fillStyle = PALETTE.flameInner;
      ctx.fillRect(11, 19, 2, 3);
      // White hot core
      ctx.fillStyle = PALETTE.flameCore;
      ctx.fillRect(11, 20, 1, 2);

      // Glass inner glow
      ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
      ctx.fillRect(8, 14, 8, 11);
    }

    // 5. Iron Corner Pillars & Frame
    ctx.fillStyle = "#161b24";
    ctx.fillRect(6, 13, 2, 13);
    ctx.fillRect(16, 13, 2, 13);
    ctx.fillRect(11, 13, 1, 13); // center strut

    // 6. Lantern Roof (pyramidal cap)
    ctx.fillStyle = "#161b24";
    ctx.fillRect(5, 11, 14, 2);
    ctx.fillRect(7, 8, 10, 3);
    ctx.fillRect(9, 6, 6, 2);
    ctx.fillRect(11, 4, 2, 2);

    ctx.fillStyle = "#2c3545";
    ctx.fillRect(6, 11, 12, 1);
    ctx.fillRect(8, 9, 8, 1);
    ctx.fillRect(10, 7, 4, 1);

    // 7. Top hanging ring
    ctx.fillStyle = "#161b24";
    ctx.fillRect(10, 2, 4, 2);
    ctx.fillRect(10, 1, 4, 1);
    ctx.fillRect(11, 2, 2, 1);

    this.cache[key] = canvas;
    return canvas;
  }

  /**
   * ------------------------------------------------------------------
   * WIND CHIME SPRITE
   * Detailed hanging metallic wind chime with clapper and wind sail
   * ------------------------------------------------------------------
   */
  getWindChimeSprite(angle = 0) {
    const w = 36, h = 60;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Branch attachment knot
    ctx.fillStyle = "#281b17";
    ctx.fillRect(16, 2, 4, 3);

    // Main hanging cord
    ctx.fillStyle = "#8a7863";
    ctx.fillRect(17, 5, 2, 7);

    // Top circular wooden plate
    ctx.fillStyle = "#4a3525";
    ctx.fillRect(11, 12, 14, 3);
    ctx.fillStyle = "#70533b";
    ctx.fillRect(12, 12, 12, 1);

    // Apply rotation for swinging motion
    ctx.save();
    ctx.translate(18, 14);
    ctx.rotate(angle);
    ctx.translate(-18, -14);

    // 4 Metallic Tubular Chimes (bronze/silver with light reflection)
    const chimes = [
      { x: 13, len: 24, col: "#94a3b8", hl: "#e2e8f0" },
      { x: 16, len: 32, col: "#cbd5e1", hl: "#f8fafc" },
      { x: 19, len: 28, col: "#94a3b8", hl: "#cbd5e1" },
      { x: 22, len: 20, col: "#64748b", hl: "#94a3b8" }
    ];

    chimes.forEach(c => {
      // Suspension cord
      ctx.fillStyle = "#8a7863";
      ctx.fillRect(c.x, 15, 1, 4);

      // Hollow metal pipe
      ctx.fillStyle = "#334155";
      ctx.fillRect(c.x - 1, 19, 3, c.len);
      ctx.fillStyle = c.col;
      ctx.fillRect(c.x - 1, 19, 2, c.len);
      ctx.fillStyle = c.hl;
      ctx.fillRect(c.x, 19, 1, c.len);
      // Hollow bottom
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(c.x - 1, 19 + c.len - 1, 3, 1);
    });

    // Center Clapper (wood striker bead)
    ctx.fillStyle = "#8a7863";
    ctx.fillRect(17, 15, 1, 15);
    ctx.fillStyle = "#5c3d28";
    ctx.fillRect(16, 28, 4, 4);
    ctx.fillStyle = "#8a5c3a";
    ctx.fillRect(17, 28, 2, 2);

    // Lower Cord & Wooden Wind Sail (pendulum catch)
    ctx.fillStyle = "#8a7863";
    ctx.fillRect(17, 32, 1, 14);

    // Delicate decorative carved leaf sail
    ctx.fillStyle = "#4a3525";
    ctx.fillRect(16, 46, 4, 10);
    ctx.fillRect(15, 48, 6, 6);
    ctx.fillStyle = "#70533b";
    ctx.fillRect(16, 48, 3, 5);
    ctx.fillStyle = "#9c724e";
    ctx.fillRect(17, 49, 1, 3);

    ctx.restore();

    return canvas;
  }

  /**
   * ------------------------------------------------------------------
   * MYSTERIOUS SEED SPRITE
   * Ancient mystical acorn/seed nestled in sacred moss
   * ------------------------------------------------------------------
   */
  getSeedSprite(pulse = 0.0, awakened = false) {
    const w = 24, h = 24;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Fairy ring of lush clover & meadow grass nest
    ctx.fillStyle = PALETTE.grassDark;
    ctx.fillRect(3, 17, 18, 5);
    ctx.fillStyle = PALETTE.cloverColor;
    ctx.fillRect(2, 16, 6, 4);
    ctx.fillRect(16, 16, 6, 4);
    ctx.fillRect(5, 18, 14, 3);
    ctx.fillStyle = PALETTE.grassBright;
    ctx.fillRect(4, 15, 3, 3);
    ctx.fillRect(17, 15, 3, 3);
    // Tiny golden buttercup petal
    ctx.fillStyle = PALETTE.buttercupGold;
    ctx.fillRect(3, 17, 2, 2);
    ctx.fillRect(19, 18, 2, 2);

    // Seed Body
    const baseColor = awakened ? "#524424" : "#3b3024";
    const shellColor = awakened ? "#8a6d38" : "#594630";
    const coreColor = awakened ? PALETTE.magicGold : "#917758";

    // Outer contour
    ctx.fillStyle = "#1e1610";
    ctx.fillRect(8, 7, 8, 11);
    ctx.fillRect(9, 5, 6, 14);
    ctx.fillRect(10, 4, 4, 16);

    // Shell
    ctx.fillStyle = baseColor;
    ctx.fillRect(9, 7, 6, 9);
    ctx.fillRect(10, 6, 4, 11);

    ctx.fillStyle = shellColor;
    ctx.fillRect(10, 8, 4, 7);

    // Carved Runic Veins / Glowing Heart
    if (pulse > 0.05) {
      ctx.fillStyle = `rgba(253, 230, 138, ${Math.min(1.0, 0.4 + pulse * 0.6)})`;
      ctx.fillRect(11, 9, 2, 4);
      ctx.fillRect(10, 11, 4, 1);
      ctx.fillRect(11, 6, 2, 1); // tiny sprout tip
    } else {
      ctx.fillStyle = coreColor;
      ctx.fillRect(11, 9, 2, 4);
    }

    // If awakened, tiny green ethereal sprout leaf
    if (awakened) {
      ctx.fillStyle = PALETTE.magicEmerald;
      ctx.fillRect(12, 3, 2, 3);
      ctx.fillRect(13, 2, 3, 2);
      ctx.fillStyle = "#a7f3d0";
      ctx.fillRect(14, 2, 1, 1);
    }

    return canvas;
  }

  /**
   * ------------------------------------------------------------------
   * FLOWER SPRITES
   * Several distinct botanical species with multi-frame bloom states
   * ------------------------------------------------------------------
   */
  getFlowerSprite(type, bloomRatio = 0.0, swayOffset = 0) {
    const w = 24, h = 32;
    const { canvas, ctx } = this.createCanvas(w, h);

    const stemColor = PALETTE.grassMid;
    const stemLight = PALETTE.grassBright;

    // Stem with gentle bend
    ctx.fillStyle = stemColor;
    const ox = swayOffset;
    ctx.fillRect(11 + ox * 0.3, 16, 2, 14);
    ctx.fillRect(11 + ox * 0.6, 10, 2, 7);

    // Stem leaves
    ctx.fillStyle = stemLight;
    ctx.fillRect(8 + ox * 0.3, 18, 3, 2);
    ctx.fillRect(13 + ox * 0.4, 21, 3, 2);

    const cx = Math.round(12 + ox);
    const cy = 9;

    if (type === "star_lily") {
      // Star Lily: Closed teal/lavender bud -> Radiant cyan/white star
      if (bloomRatio < 0.3) {
        // Closed bud
        ctx.fillStyle = "#1e3a40";
        ctx.fillRect(cx - 2, cy - 3, 4, 7);
        ctx.fillStyle = "#3b8296";
        ctx.fillRect(cx - 1, cy - 2, 2, 5);
        ctx.fillStyle = "#a5f3fc";
        ctx.fillRect(cx, cy - 1, 1, 2);
      } else {
        // Bloomed Star Lily
        const spread = Math.round(bloomRatio * 5);
        // Outer petals
        ctx.fillStyle = PALETTE.lilyCyan;
        ctx.fillRect(cx - spread, cy - 1, spread * 2 + 1, 3);
        ctx.fillRect(cx - 1, cy - spread, 3, spread * 2 + 1);
        ctx.fillRect(cx - spread + 1, cy - spread + 1, 2, 2);
        ctx.fillRect(cx + spread - 2, cy - spread + 1, 2, 2);
        ctx.fillRect(cx - spread + 1, cy + spread - 2, 2, 2);
        ctx.fillRect(cx + spread - 2, cy + spread - 2, 2, 2);

        // Center white petals
        ctx.fillStyle = PALETTE.lilyWhite;
        ctx.fillRect(cx - 2, cy - 2, 5, 5);

        // Radiant golden stamen
        ctx.fillStyle = PALETTE.lilyGold;
        ctx.fillRect(cx - 1, cy - 1, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx, cy, 1, 1);
      }
    } else if (type === "bluebell") {
      // Bluebell: Drooping cluster of delicate bells
      const bColor = bloomRatio > 0.4 ? PALETTE.bellLavender : PALETTE.bellBlue;
      const bCore = bloomRatio > 0.4 ? "#f3e8ff" : "#dbeafe";

      // Branch stem
      ctx.fillStyle = stemLight;
      ctx.fillRect(cx - 3, cy - 2, 4, 2);
      ctx.fillRect(cx - 4, cy, 2, 3);

      // Bell shape
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(cx - 6, cy + 2, 6, 6);
      ctx.fillStyle = bColor;
      ctx.fillRect(cx - 5, cy + 2, 4, 5);
      ctx.fillRect(cx - 6, cy + 6, 6, 2); // fluted lip

      ctx.fillStyle = bCore;
      ctx.fillRect(cx - 4, cy + 3, 2, 3);

      if (bloomRatio > 0.6) {
        // Second bell
        ctx.fillStyle = bColor;
        ctx.fillRect(cx + 1, cy + 4, 4, 5);
        ctx.fillRect(cx, cy + 8, 6, 2);
        ctx.fillStyle = bCore;
        ctx.fillRect(cx + 2, cy + 5, 2, 2);
      }
    } else if (type === "poppy") {
      // Twilight Poppy: Deep coral / ruby petals
      if (bloomRatio < 0.3) {
        ctx.fillStyle = "#4c0519";
        ctx.fillRect(cx - 2, cy - 2, 4, 5);
        ctx.fillStyle = PALETTE.poppyRed;
        ctx.fillRect(cx - 1, cy - 1, 2, 3);
      } else {
        const rad = Math.round(2 + bloomRatio * 3);
        ctx.fillStyle = "#4c0519"; // shadow outline
        ctx.fillRect(cx - rad - 1, cy - rad, (rad * 2) + 3, (rad * 2) + 1);

        ctx.fillStyle = PALETTE.poppyRed;
        ctx.fillRect(cx - rad, cy - rad + 1, rad * 2 + 1, rad * 2 - 1);

        ctx.fillStyle = PALETTE.poppyCoral;
        ctx.fillRect(cx - rad + 1, cy - rad + 2, rad * 2 - 1, rad);

        // Dark center
        ctx.fillStyle = "#1c0d12";
        ctx.fillRect(cx - 1, cy - 1, 3, 3);
        ctx.fillStyle = PALETTE.magicGold;
        ctx.fillRect(cx, cy, 1, 1);
      }
    } else {
      // Night Jasmine: sweet fragrant star cluster
      ctx.fillStyle = PALETTE.jasmineStar;
      ctx.fillRect(cx - 2, cy - 2, 5, 5);
      ctx.fillRect(cx - 3, cy, 7, 1);
      ctx.fillRect(cx, cy - 3, 1, 7);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 1, cy - 1, 3, 3);
      ctx.fillStyle = PALETTE.magicGold;
      ctx.fillRect(cx, cy, 1, 1);

      if (bloomRatio > 0.5) {
        // Tiny buddy blossoms
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(cx + 4, cy - 2, 3, 3);
        ctx.fillRect(cx - 5, cy + 2, 3, 3);
      }
    }

    return canvas;
  }

  /**
   * ------------------------------------------------------------------
   * POND LILYPAD & LOTUS SPRITE
   * ------------------------------------------------------------------
   */
  getWaterLilySprite(isBloomed = false, bloomRatio = 0.0) {
    const w = 28, h = 18;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Dark water rim / pad shadow
    ctx.fillStyle = PALETTE.waterDeep;
    ctx.fillRect(2, 6, 24, 9);
    ctx.fillRect(4, 5, 20, 11);

    // Lilypad leaf (circular with classic V-slit)
    ctx.fillStyle = PALETTE.grassMid;
    ctx.fillRect(3, 7, 22, 7);
    ctx.fillRect(5, 6, 18, 9);
    ctx.fillStyle = PALETTE.grassBright;
    ctx.fillRect(4, 7, 19, 5);

    // V-notch cut
    ctx.fillStyle = PALETTE.waterMid;
    ctx.fillRect(13, 8, 3, 5);
    ctx.fillRect(14, 6, 2, 2);

    // Dewdrop on pad
    ctx.fillStyle = PALETTE.waterSparkle;
    ctx.fillRect(8, 8, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(8, 8, 1, 1);

    // Floating Lotus Flower
    if (bloomRatio > 0.05) {
      const cx = 17, cy = 6;
      if (bloomRatio < 0.4) {
        // Closed pink bud
        ctx.fillStyle = "#831843";
        ctx.fillRect(cx - 2, cy - 4, 4, 5);
        ctx.fillStyle = "#f472b6";
        ctx.fillRect(cx - 1, cy - 3, 2, 4);
        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(cx, cy - 2, 1, 2);
      } else {
        // Full radiant water lotus
        const spread = Math.round(bloomRatio * 4);
        // Outer petals
        ctx.fillStyle = "#f472b6";
        ctx.fillRect(cx - spread - 1, cy - 2, spread * 2 + 3, 4);
        ctx.fillRect(cx - 2, cy - spread - 1, 5, spread + 2);

        // Inner glowing white petals
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 2, cy - 3, 5, 4);

        // Golden center
        ctx.fillStyle = PALETTE.lilyGold;
        ctx.fillRect(cx - 1, cy - 2, 3, 2);
      }
    }

    return canvas;
  }

  /**
   * ------------------------------------------------------------------
   * PIXEL BUTTERFLY SPRITE
   * Animated 4-frame flapping wings
   * ------------------------------------------------------------------
   */
  getButterflySprite(frame = 0, variant = "lavender") {
    const key = `butterfly_${variant}_${frame % 4}`;
    if (this.cache[key]) return this.cache[key];

    const w = 16, h = 16;
    const { canvas, ctx } = this.createCanvas(w, h);

    const f = frame % 4;
    // Wing elevation heights: 0: full spread, 1: mid, 2: folded up, 3: mid
    const wingY = [1, 2, 4, 2][f];
    const wingH = [6, 5, 3, 5][f];
    const wingW = [6, 5, 3, 5][f];

    const mainCol = variant === "lavender" ? "#c084fc" : "#38bdf8";
    const lightCol = variant === "lavender" ? "#f3e8ff" : "#bae6fd";
    const edgeCol = "#1e1b4b";

    // Left Wing
    ctx.fillStyle = edgeCol;
    ctx.fillRect(7 - wingW, 7 - wingY, wingW, wingH);
    ctx.fillStyle = mainCol;
    ctx.fillRect(8 - wingW, 8 - wingY, wingW - 1, wingH - 2);
    ctx.fillStyle = lightCol;
    ctx.fillRect(8 - wingW + 1, 8 - wingY + 1, 2, 2);

    // Right Wing
    ctx.fillStyle = edgeCol;
    ctx.fillRect(9, 7 - wingY, wingW, wingH);
    ctx.fillStyle = mainCol;
    ctx.fillRect(9, 8 - wingY, wingW - 1, wingH - 2);
    ctx.fillStyle = lightCol;
    ctx.fillRect(10, 8 - wingY + 1, 2, 2);

    // Butterfly Body & Antennae
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(7, 6, 2, 6);
    ctx.fillRect(6, 4, 1, 2); // left antenna
    ctx.fillRect(9, 4, 1, 2); // right antenna

    this.cache[key] = canvas;
    return canvas;
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.pixelSprites = new PixelSpriteEngine();
}
