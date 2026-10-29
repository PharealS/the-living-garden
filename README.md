# 🌸 The Living Garden · Dedicated to Ara

> *"A secret corner of the world created just for you—somewhere quiet, peaceful, and full of life."*

A bespoke, indie-aesthetic interactive pixel art living garden built with pure vanilla HTML5 Canvas, Web Audio API, and CSS.

---

## ✨ Features

- **Persistent Progress Caching (`localStorage`)**: Nurtured flowers, blooming lotuses, lantern illumination, awakening progress, and the grand bloomed cherry tree persist across visits and reloads.
- **Procedural Web Audio Engine**: Zero-dependency synthesizer generating dynamic piano chords (inspired by Ludovico Einaudi's *Nuvole Bianche*), celestial bells, wind chimes, and ambient evening wind.
- **16-Frame Continuous Sakura Growth**: An organic growth system where the tree trunk shoots upward out of the soil and foliage unfurls continuously into full bloom.
- **Carved Trunk Inscription**: Romantic initials (`A + A ♡`) engraved into the bark.
- **Interactive Meadow Ecosystem**:
  - Drag-and-drop watering can that waters buds into colorful blooming wildflowers.
  - Ancient glowing stone lantern with real-time dynamic light halos.
  - Serene ripple-reactive pond with floating lily pads and lotus blooms.
  - Tuned pentatonic wind chimes with harmonic physics.
- **Wax-Sealed Keepsake Letter**: Romantic birthday note with embossed wax seal badge (`A ♡ A`) and `.txt` keepsake download export.
- **Memory Snapshot Photo Camera**: Takes clean canvas photo snapshots watermarked with *"The Living Garden · Ara & Atharv"*.

---

## 🛠️ Tech Stack

- **Graphics**: HTML5 2D Canvas (640×360 retro pixel-fidelity with crisp subpixel presentation)
- **Audio**: Web Audio API (FM synthesis, convolver reverb, algorithmic bandpass wind)
- **Styles**: Glassmorphism, CSS 3D transforms, custom fairy stardust cursor
- **Dependencies**: None (100% vanilla JavaScript, zero external libraries)

---

## 🚀 Running Locally

Simply serve the root directory with any static HTTP server:

```bash
# Python 3
python -m http.server 8080

# Or with Node.js npx
npx serve .
```

Open `http://localhost:8080/` in your browser.

---

## 🗝️ Shortcuts & Utilities

- **`Spacebar`**: Make a wish upon a shooting star.
- **`M`**: Mute / unmute soundtrack.
- **`Esc`**: Dismiss letter overlay.
- **`window.resetGardenProgress()`**: In browser DevTools console to reset progress and start fresh.

---

*Made with love by Atharv for Ara.*
