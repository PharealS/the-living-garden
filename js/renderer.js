/**
 * ====================================================================
 *   THE LIVING GARDEN - PIXEL RENDERER & LIGHTING SYSTEM
 * ====================================================================
 * High-aesthetic retro canvas renderer with:
 * - Fixed 640x360 virtual resolution for crisp pixel fidelity
 * - Bayer-dithered dusk sky gradient
 * - Multi-layer parallax
 * - Dynamic 2D pixel lighting buffer (lantern glow, fireflies, blooms)
 * - Atmospheric particle rendering
 */

class PixelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    // Fixed virtual pixel resolution (16:9 cinematic indie retro)
    this.width = 640;
    this.height = 360;

    // Offscreen virtual canvas
    this.virtualCanvas = document.createElement("canvas");
    this.virtualCanvas.width = this.width;
    this.virtualCanvas.height = this.height;
    this.vCtx = this.virtualCanvas.getContext("2d");
    this.vCtx.imageSmoothingEnabled = false;

    // Lighting Buffer
    this.lightCanvas = document.createElement("canvas");
    this.lightCanvas.width = this.width;
    this.lightCanvas.height = this.height;
    this.lightCtx = this.lightCanvas.getContext("2d");
    this.lightCtx.imageSmoothingEnabled = false;

    // Camera & Parallax
    this.cameraX = 0;
    this.cameraY = 0;
    this.targetCameraX = 0;
    this.targetCameraY = 0;

    // Bayer 4x4 Dithering Matrix for retro sky transitions
    this.bayer4x4 = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    // Pre-generate background stars
    this.stars = [];
    this.initStars();

    // Drifting clouds
    this.clouds = [
      { x: 30, y: 45, w: 90, h: 22, speed: 0.08, opacity: 0.35 },
      { x: 280, y: 70, w: 140, h: 28, speed: 0.05, opacity: 0.4 },
      { x: 490, y: 35, w: 110, h: 24, speed: 0.07, opacity: 0.3 }
    ];

    // Shooting star system
    this.shootingStar = null;
    this.lastShootingStarTime = Date.now();

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 55; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * 160, // upper sky
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        isCross: Math.random() > 0.8
      });
    }
  }

  /**
   * Updates camera parallax based on normalized cursor position (-1 to 1)
   */
  updateCamera(cursorNormX, cursorNormY) {
    this.targetCameraX = cursorNormX * 8; // subtle max 8 virtual pixels
    this.targetCameraY = cursorNormY * 5; // subtle max 5 virtual pixels

    this.cameraX += (this.targetCameraX - this.cameraX) * 0.05;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.05;
  }

  /**
   * Clears buffers and begins a new frame
   */
  beginFrame() {
    this.vCtx.clearRect(0, 0, this.width, this.height);
    this.lightCtx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * -------------------------------------------------------------
   * SKY & ASTRONOMY PASS
   * -------------------------------------------------------------
   */
  renderSky(time, awakening = 0.0, transformed = false) {
    const ctx = this.vCtx;
    const camX = this.cameraX * 0.15;
    const camY = this.cameraY * 0.15;

    // 1. Dusk Gradient with Dithering
    // Sky bands: Midnight Deep Indigo -> Twilight Navy -> Dusk Violet -> Warm Rose
    const bands = [
      { y: 0, h: 50, col: PALETTE.skyTop },
      { y: 50, h: 50, col: PALETTE.skyMid },
      { y: 100, h: 60, col: PALETTE.skyLow },
      { y: 160, h: 50, col: PALETTE.skyDusk },
      { y: 210, h: 50, col: PALETTE.skyWarm }
    ];

    bands.forEach(b => {
      ctx.fillStyle = b.col;
      ctx.fillRect(0, b.y, this.width, b.h);
    });

    // Dithered transitions between bands
    this.renderDitherBands(ctx, [
      { y: 48, c1: PALETTE.skyTop, c2: PALETTE.skyMid },
      { y: 98, c1: PALETTE.skyMid, c2: PALETTE.skyLow },
      { y: 158, c1: PALETTE.skyLow, c2: PALETTE.skyDusk },
      { y: 208, c1: PALETTE.skyDusk, c2: PALETTE.skyWarm }
    ]);

    // 2. Crescent Moon with gentle glow
    const moonX = 520 + camX * 0.5;
    const moonY = 55 + camY * 0.5;
    this.renderMoon(ctx, moonX, moonY, time, transformed);

    // 3. Twinkling Stars
    this.stars.forEach(s => {
      const alpha = s.brightness * (0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinklePhase));
      const sx = Math.round(s.x + camX * 0.3);
      const sy = Math.round(s.y + camY * 0.3);

      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(sx, sy, 1, 1);

      if (s.isCross && alpha > 0.6) {
        ctx.fillStyle = `rgba(254, 240, 138, ${alpha * 0.45})`;
        ctx.fillRect(sx - 1, sy, 1, 1);
        ctx.fillRect(sx + 1, sy, 1, 1);
        ctx.fillRect(sx, sy - 1, 1, 1);
        ctx.fillRect(sx, sy + 1, 1, 1);
      }
    });

    // 4. Drifting Dusk Clouds
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > this.width + 40) c.x = -c.w - 40;
      this.renderPixelCloud(ctx, c.x + camX * 0.2, c.y + camY * 0.2, c.w, c.h, c.opacity);
    });

    // 5. Shooting Star trigger
    if (!this.shootingStar && Date.now() - this.lastShootingStarTime > 14000) {
      if (Math.random() < 0.6) {
        this.triggerShootingStar();
      }
      this.lastShootingStarTime = Date.now();
    }


    if (this.shootingStar) {
      const ss = this.shootingStar;
      const progress = ss.life / ss.maxLife;
      ctx.fillStyle = `rgba(254, 240, 138, ${progress})`;
      ctx.fillRect(Math.round(ss.x), Math.round(ss.y), 2, 2);
      ctx.fillStyle = `rgba(224, 231, 255, ${progress * 0.5})`;
      ctx.fillRect(Math.round(ss.x - ss.vx), Math.round(ss.y - ss.vy), 3, 2);
      ctx.fillRect(Math.round(ss.x - ss.vx * 2), Math.round(ss.y - ss.vy * 2), 2, 1);

      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life--;
      if (ss.life <= 0) this.shootingStar = null;
    }
  }

  /**
   * Spawns a shooting star across the twilight sky
   */
  triggerShootingStar(startX = null, startY = null) {
    this.shootingStar = {
      x: startX !== null ? startX : 80 + Math.random() * 260,
      y: startY !== null ? startY : 15 + Math.random() * 35,
      vx: 4.8 + Math.random() * 2.0,
      vy: 2.2 + Math.random() * 1.1,
      life: 38,
      maxLife: 38
    };
  }

  /**
   * Renders retro Bayer ordered dithering line
   */
  renderDitherBands(ctx, bands) {
    bands.forEach(b => {
      for (let x = 0; x < this.width; x += 2) {
        const ditherVal = this.bayer4x4[(b.y % 4)][(x % 4)];
        if (ditherVal > 7) {
          ctx.fillStyle = b.c2;
          ctx.fillRect(x, b.y, 2, 2);
        }
      }
    });
  }

  /**
   * Renders Crescent Moon with pixel craters
   */
  renderMoon(ctx, cx, cy, time, transformed = false) {
    cx = Math.round(cx);
    cy = Math.round(cy);

    // Subtle moon glow ring
    const glowColor = transformed ? "rgba(254, 215, 170, 0.22)" : "rgba(254, 240, 138, 0.12)";
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 8, 22, 0, Math.PI * 2);
    ctx.fill();

    // Outer moon circle
    ctx.fillStyle = PALETTE.moon;
    const r = 13;
    for (let dy = -r; dy <= r; dy++) {
      const dx = Math.round(Math.sqrt(r * r - dy * dy));
      ctx.fillRect(cx - dx + 8, cy + dy + 8, dx * 2, 1);
    }

    // Cutout circle for elegant crescent shape
    ctx.fillStyle = PALETTE.skyTop;
    const cr = 12;
    const offX = -5, offY = -2;
    for (let dy = -cr; dy <= cr; dy++) {
      const dx = Math.round(Math.sqrt(cr * cr - dy * dy));
      ctx.fillRect(cx + offX - dx + 8, cy + offY + dy + 8, dx * 2, 1);
    }

    // Faint craters on moon tip
    ctx.fillStyle = "#ebd596";
    ctx.fillRect(cx + 12, cy + 7, 2, 2);
    ctx.fillRect(cx + 14, cy + 12, 1, 2);
  }

  /**
   * Renders soft pixelated dusk clouds
   */
  renderPixelCloud(ctx, x, y, w, h, opacity) {
    ctx.fillStyle = `rgba(88, 62, 92, ${opacity})`;
    const rx = Math.round(x);
    const ry = Math.round(y);

    // Stepped rounded cloud shape
    ctx.fillRect(rx + 8, ry, w - 16, h);
    ctx.fillRect(rx, ry + 4, w, h - 8);
    ctx.fillRect(rx + 4, ry - 3, Math.round(w * 0.4), 6);
    ctx.fillRect(rx + Math.round(w * 0.45), ry - 5, Math.round(w * 0.35), 8);

    // Warm dusk cloud under-tint
    ctx.fillStyle = `rgba(142, 85, 108, ${opacity * 0.6})`;
    ctx.fillRect(rx + 4, ry + h - 3, w - 8, 3);
  }

  /**
   * -------------------------------------------------------------
   * DISTANT MOUNTAINS & HORIZON
   * -------------------------------------------------------------
   */
  renderMountains() {
    const ctx = this.vCtx;
    const camX = this.cameraX * 0.3;
    const camY = this.cameraY * 0.25;

    // Far mountain ridge
    ctx.fillStyle = PALETTE.mountainFar;
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.lineTo(0, 185 + camY);
    ctx.lineTo(80 + camX, 160 + camY);
    ctx.lineTo(190 + camX, 195 + camY);
    ctx.lineTo(310 + camX, 155 + camY);
    ctx.lineTo(440 + camX, 180 + camY);
    ctx.lineTo(540 + camX, 150 + camY);
    ctx.lineTo(640, 175 + camY);
    ctx.lineTo(640, 240);
    ctx.closePath();
    ctx.fill();

    // Mid mountain ridge
    ctx.fillStyle = PALETTE.mountainMid;
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(0, 198 + camY * 1.2);
    ctx.lineTo(130 + camX * 1.2, 172 + camY * 1.2);
    ctx.lineTo(240 + camX * 1.2, 202 + camY * 1.2);
    ctx.lineTo(380 + camX * 1.2, 168 + camY * 1.2);
    ctx.lineTo(510 + camX * 1.2, 192 + camY * 1.2);
    ctx.lineTo(640, 182 + camY * 1.2);
    ctx.lineTo(640, 250);
    ctx.closePath();
    ctx.fill();

    // Distant tree line silhouettes
    ctx.fillStyle = PALETTE.treeSilhouette;
    for (let x = 0; x < this.width; x += 12) {
      const th = 18 + ((x * 17) % 15);
      const ty = 205 - th + camY * 1.4;
      ctx.fillRect(Math.round(x + camX * 1.4), Math.round(ty), 10, th + 25);
    }
  }

  /**
   * -------------------------------------------------------------
   * DYNAMIC 2D LIGHTING PASS
   * Blends warm amber lantern glow, firefly glows, and floral bloom
   * onto the virtual scene.
   * -------------------------------------------------------------
   */
  applyLightingPass(lanternLit, lanternPos, fireflies, flowers, awakening = 0.0, transformed = false) {
    const lCtx = this.lightCtx;

    // Ambient dusk darkness
    // Transformed state is luminous and warmer
    const baseAlpha = transformed ? 0.38 : Math.max(0.48, 0.72 - awakening * 0.22);
    lCtx.fillStyle = `rgba(13, 17, 35, ${baseAlpha})`;
    lCtx.fillRect(0, 0, this.width, this.height);

    // Set composite operation to cut light into ambient shadow
    lCtx.globalCompositeOperation = "destination-out";

    // 1. Lantern Warm Light
    if (lanternLit && lanternPos) {
      const lx = lanternPos.x + this.cameraX * 0.6;
      const ly = lanternPos.y + this.cameraY * 0.6;
      const radius = transformed ? 190 : 130 + Math.sin(Date.now() * 0.005) * 6;

      const grad = lCtx.createRadialGradient(lx, ly, 4, lx, ly, radius);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.95)");
      grad.addColorStop(0.35, "rgba(0, 0, 0, 0.75)");
      grad.addColorStop(0.7, "rgba(0, 0, 0, 0.35)");
      grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

      lCtx.fillStyle = grad;
      lCtx.beginPath();
      lCtx.arc(lx, ly, radius, 0, Math.PI * 2);
      lCtx.fill();
    }

    // 2. Firefly Glow Pinpoints
    fireflies.forEach(f => {
      if (f.alpha > 0.1) {
        const rad = Math.round(f.glowRadius * (0.8 + 0.4 * f.pulse));
        const grad = lCtx.createRadialGradient(f.x, f.y, 1, f.x, f.y, rad);
        grad.addColorStop(0, `rgba(0, 0, 0, ${f.alpha * 0.85})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

        lCtx.fillStyle = grad;
        lCtx.beginPath();
        lCtx.arc(f.x, f.y, rad, 0, Math.PI * 2);
        lCtx.fill();
      }
    });

    // 3. Bloomed Flowers Bioluminescence
    flowers.forEach(fl => {
      if (fl.bloomRatio > 0.3) {
        const rad = Math.round(18 * fl.bloomRatio);
        const grad = lCtx.createRadialGradient(fl.x + 12, fl.y + 10, 2, fl.x + 12, fl.y + 10, rad);
        grad.addColorStop(0, `rgba(0, 0, 0, ${fl.bloomRatio * 0.45})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

        lCtx.fillStyle = grad;
        lCtx.beginPath();
        lCtx.arc(fl.x + 12, fl.y + 10, rad, 0, Math.PI * 2);
        lCtx.fill();
      }
    });

    // Reset composite operation on lighting canvas
    lCtx.globalCompositeOperation = "source-over";

    // Warm amber tint overlay where light hits
    if (lanternLit && lanternPos) {
      const lx = lanternPos.x + this.cameraX * 0.6;
      const ly = lanternPos.y + this.cameraY * 0.6;
      const radius = transformed ? 190 : 135;

      const warmGrad = this.vCtx.createRadialGradient(lx, ly, 4, lx, ly, radius);
      warmGrad.addColorStop(0, "rgba(254, 240, 138, 0.28)");
      warmGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.16)");
      warmGrad.addColorStop(1, "rgba(180, 83, 9, 0.0)");

      this.vCtx.fillStyle = warmGrad;
      this.vCtx.beginPath();
      this.vCtx.arc(lx, ly, radius, 0, Math.PI * 2);
      this.vCtx.fill();
    }

    // Blend lighting darkness buffer onto virtual canvas
    this.vCtx.drawImage(this.lightCanvas, 0, 0);
  }

  /**
   * Final Presentation: Blits virtual pixel canvas to screen preserving crisp pixels
   */
  present() {
    const sw = this.canvas.width;
    const sh = this.canvas.height;

    // Calculate scale to fill screen while preserving pixel art proportion
    const scaleX = sw / this.width;
    const scaleY = sh / this.height;
    const scale = Math.max(scaleX, scaleY); // Fill viewport completely

    const scaledW = Math.round(this.width * scale);
    const scaledH = Math.round(this.height * scale);
    const destX = Math.round((sw - scaledW) / 2);
    const destY = Math.round((sh - scaledH) / 2);

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, sw, sh);
    this.ctx.drawImage(this.virtualCanvas, destX, destY, scaledW, scaledH);
  }

  /**
   * Captures the crystal-clear garden canvas without UI and triggers download
   */
  takeSnapshot() {
    try {
      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = this.width;
      snapCanvas.height = this.height;
      const sCtx = snapCanvas.getContext("2d");
      sCtx.imageSmoothingEnabled = false;
      // Copy virtual canvas
      sCtx.drawImage(this.virtualCanvas, 0, 0);

      // Discreet aesthetic watermark in bottom-left corner
      sCtx.fillStyle = "rgba(254, 240, 138, 0.75)";
      sCtx.font = "9px 'Cinzel', serif";
      sCtx.fillText("The Living Garden · Ara & Atharv", 14, this.height - 14);

      const link = document.createElement("a");
      link.download = `The-Living-Garden-Ara-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = snapCanvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      console.error("Snapshot error:", e);
      return false;
    }
  }

  /**
   * Convert client window mouse coordinates to virtual canvas (640x360) space
   */
  screenToVirtual(screenX, screenY) {
    const sw = this.canvas.width;
    const sh = this.canvas.height;
    const scale = Math.max(sw / this.width, sh / this.height);
    const scaledW = this.width * scale;
    const scaledH = this.height * scale;
    const destX = (sw - scaledW) / 2;
    const destY = (sh - scaledH) / 2;

    const vx = (screenX - destX) / scale;
    const vy = (screenY - destY) / scale;

    return { x: vx, y: vy };
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.PixelRenderer = PixelRenderer;
}
