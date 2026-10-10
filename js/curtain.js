/**
 * ====================================================================
 *   THE LIVING GARDEN - ENCHANTED BIRTHDAY CURTAIN & COUNTDOWN
 * ====================================================================
 * 
 * Velvet theatrical drapes draped over the garden until Ara's birthday
 * (August 7, 2027). Features:
 * - Real-time countdown (Days : Hours : Minutes : Seconds)
 * - Theatrical silk drape parting physics with gold valance & tassels
 * - Automatic unlock when the countdown reaches zero on her birthday
 * - Atharv Dev Preview bypass (Ctrl + Shift + P or Preview button)
 */

class BirthdayCurtain {
  constructor() {
    this.config = window.GARDEN_CONFIG || {};
    // Target: August 7, 2027 00:00:00 local time
    const targetStr = this.config.birthdayTargetDate || "2027-08-07T00:00:00";
    this.targetDate = new Date(targetStr);
    
    this.container = document.getElementById("birthday-curtain");
    this.leftDrape = document.getElementById("curtain-left");
    this.rightDrape = document.getElementById("curtain-right");
    this.valance = document.getElementById("curtain-valance");
    this.content = document.getElementById("curtain-content");
    this.audioToggle = document.getElementById("curtain-audio-toggle");
    this.audioLabel = document.getElementById("curtain-audio-label");
    this.previewBanner = document.getElementById("curtain-preview-banner");
    this.redrapeBtn = document.getElementById("curtain-redrape-btn");

    this.daysEl = document.getElementById("cd-days");
    this.hoursEl = document.getElementById("cd-hours");
    this.minsEl = document.getElementById("cd-mins");
    this.secsEl = document.getElementById("cd-secs");

    this.isLifted = false;
    this.isPreviewMode = false;
    this.timerInterval = null;

    this.init();
  }

  init() {
    if (!this.container) return;

    // Check URL parameters for developer bypass (?preview=1 or ?unlock=1)
    const urlParams = new URLSearchParams(window.location.search);
    const hasPreviewParam = urlParams.has("preview") || urlParams.has("unlock") || urlParams.get("curtain") === "open";

    // Populate ambient stardust particles on the curtain
    this.createCurtainStardust();

    // Setup ambient music for curtain screen
    this.setupCurtainAudio();

    // Setup redrape button click on preview banner
    if (this.redrapeBtn) {
      this.redrapeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.redrapeCurtain();
      });
    }

    // Keyboard shortcut for Atharv: Ctrl + Shift + P to toggle curtain
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p" || e.code === "KeyP")) {
        e.preventDefault();
        if (this.isLifted) {
          this.redrapeCurtain();
        } else {
          this.enablePreviewMode();
        }
      }
    });

    // Check if birthday has already arrived
    const now = Date.now();
    const remaining = this.targetDate.getTime() - now;

    if (remaining <= 0) {
      // Birthday is here! Lift curtain with grand celebration
      this.container.classList.add("curtain-birthday-arrived");
      setTimeout(() => {
        this.liftCurtain(false);
      }, 1200);
      return;
    }

    // If developer preview param was provided in URL:
    if (hasPreviewParam) {
      this.enablePreviewMode();
      return;
    }

    // Otherwise, actively run the countdown
    this.updateCountdown();
    this.timerInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  setupCurtainAudio() {
    const startAudio = () => {
      if (window.gardenAudio) {
        if (!window.gardenAudio.initialized) {
          window.gardenAudio.init();
        } else if (window.gardenAudio.ctx && window.gardenAudio.ctx.state === "suspended") {
          window.gardenAudio.ctx.resume();
        }
        this.updateAudioPillUI();
      }
    };

    // Auto-start ambient music on first touch/click/key anywhere on curtain
    ["pointerdown", "click", "keydown", "touchstart"].forEach(evt => {
      window.addEventListener(evt, startAudio, { once: true, passive: true });
    });

    if (this.audioToggle) {
      this.audioToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!window.gardenAudio) return;

        if (!window.gardenAudio.initialized) {
          window.gardenAudio.init();
          this.updateAudioPillUI();
        } else {
          const isMuted = window.gardenAudio.toggleMute();
          if (isMuted) {
            this.audioToggle.classList.remove("sound-playing");
            this.audioToggle.classList.add("sound-muted");
            if (this.audioLabel) this.audioLabel.textContent = "Ambient Sound · Muted";
          } else {
            this.audioToggle.classList.add("sound-playing");
            this.audioToggle.classList.remove("sound-muted");
            if (this.audioLabel) this.audioLabel.textContent = "Ambient Sound · Playing";
          }
        }
      });
    }
  }

  updateAudioPillUI() {
    if (!this.audioToggle) return;
    if (window.gardenAudio && !window.gardenAudio.isMuted) {
      this.audioToggle.classList.add("sound-playing");
      this.audioToggle.classList.remove("sound-muted");
      if (this.audioLabel) this.audioLabel.textContent = "Ambient Sound · Playing";
    }
  }

  createCurtainStardust() {
    const stardustContainer = document.getElementById("curtain-stardust");
    if (!stardustContainer) return;

    const count = 28;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "curtain-star-particle";
      const size = Math.random() * 3 + 1.5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const dur = Math.random() * 6 + 4;
      const delay = Math.random() * 5;
      const op = Math.random() * 0.6 + 0.3;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.animationDuration = `${dur}s`;
      star.style.animationDelay = `${delay}s`;
      star.style.opacity = op;

      stardustContainer.appendChild(star);
    }
  }

  updateCountdown() {
    const now = Date.now();
    const diff = this.targetDate.getTime() - now;

    if (diff <= 0) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.daysEl) this.daysEl.textContent = "00";
      if (this.hoursEl) this.hoursEl.textContent = "00";
      if (this.minsEl) this.minsEl.textContent = "00";
      if (this.secsEl) this.secsEl.textContent = "00";
      
      // Auto-lift curtain on birthday!
      this.liftCurtain(false);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (this.daysEl) this.daysEl.textContent = String(days).padStart(2, "0");
    if (this.hoursEl) this.hoursEl.textContent = String(hours).padStart(2, "0");
    if (this.minsEl) this.minsEl.textContent = String(mins).padStart(2, "0");
    if (this.secsEl) this.secsEl.textContent = String(secs).padStart(2, "0");
  }

  liftCurtain(isPreview = false) {
    if (this.isLifted) return;
    this.isLifted = true;
    this.isPreviewMode = isPreview;

    if (!this.container) return;

    // Trigger grand theatrical parting animation
    this.container.classList.add("curtain-opening");

    // Play subtle chime sound if audio system is ready
    if (window.gardenAudio && window.gardenAudio.playChime) {
      try {
        window.gardenAudio.playChime(659.25, 0.4);
      } catch (err) {}
    }

    // After animation finishes, allow clicks through to garden
    setTimeout(() => {
      this.container.classList.add("curtain-hidden");
      this.container.style.pointerEvents = "none";

      if (isPreview && this.previewBanner) {
        this.previewBanner.classList.add("visible");
      }
    }, 2400);
  }

  redrapeCurtain() {
    if (!this.isLifted) return;
    this.isLifted = false;
    this.isPreviewMode = false;

    if (this.previewBanner) {
      this.previewBanner.classList.remove("visible");
    }

    if (!this.container) return;

    this.container.style.pointerEvents = "auto";
    this.container.classList.remove("curtain-hidden");
    void this.container.offsetWidth; // Force reflow
    this.container.classList.remove("curtain-opening");

    // Clear any lingering hover entities and tooltips from garden
    if (window.garden && window.garden.clearHoverEntity) {
      window.garden.clearHoverEntity();
    }
    const tooltip = document.getElementById("cursor-tooltip");
    if (tooltip) tooltip.classList.remove("visible");
  }

  enablePreviewMode() {
    this.liftCurtain(true);
  }
}

// Instantiate upon DOM loaded
window.addEventListener("DOMContentLoaded", () => {
  window.birthdayCurtain = new BirthdayCurtain();
});
