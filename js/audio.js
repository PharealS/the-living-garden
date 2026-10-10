/**
 * ====================================================================
 *   THE LIVING GARDEN - PROCEDURAL AUDIO ENGINE
 * ====================================================================
 * Pure Web Audio API procedural soundscape & soundtrack.
 * - Zero external dependencies / no broken links.
 * - Dynamic music inspired by Ludovico Einaudi ("Nuvole Bianche") & indie games.
 * - Evolving layers tied to garden awakening.
 * - Custom physical modeling for wind chimes, water, lantern, blooms & breeze.
 */

class GardenAudio {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.isMuted = false;

    // Master Gains
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambienceGain = null;

    // Effects
    this.reverbNode = null;

    // Musical Engine
    this.musicPlaying = false;
    this.currentChordIndex = 0;
    this.musicTimer = null;
    this.arpTimer = null;
    this.padOscillators = [];
    this.padGain = null;
    this.padFilter = null;
    this.melodyTimer = null;

    // Awakening level (0.0 to 1.0)
    this.awakening = 0.0;
    this.isTransforming = false;
    this.transformed = false;

    // Chime Scale (Pentatonic Major / Lydian magical tones)
    this.chimePitches = [659.25, 739.99, 830.61, 987.77, 1108.73, 1318.51, 1479.98]; // E5, F#5, G#5, B5, C#6, E6, F#6

    // Music Chord Progression (Emotional, nostalgic, reminiscent of Nuvole Bianche in F#m/A or Dm/F)
    // We'll use a gorgeous D minor / F major progression:
    // Dm (D, F, A) -> Bb (Bb, D, F) -> F (F, A, C) -> C (C, E, G)
    // with emotional extensions (Dm9, Bbmaj7, Fmaj9, Cadd9)
    this.chords = [
      { root: 146.83, notes: [220.00, 261.63, 329.63, 440.00], bass: 73.42 }, // Dm9 (A3, C4, E4, A4, D2)
      { root: 116.54, notes: [233.08, 293.66, 349.23, 440.00], bass: 58.27 }, // Bbmaj7 (Bb3, D4, F4, A4, Bb1)
      { root: 174.61, notes: [261.63, 329.63, 349.23, 523.25], bass: 87.31 }, // Fmaj9 (C4, E4, F4, C5, F2)
      { root: 130.81, notes: [246.94, 261.63, 329.63, 392.00], bass: 65.41 }  // Cadd9 (B3, C4, E4, G4, C2)
    ];

    // Transformation chord progression (transcendent, uplifting, radiant in D Major / B minor)
    this.transformChords = [
      { root: 146.83, notes: [293.66, 369.99, 440.00, 587.33], bass: 73.42 }, // Dmaj9
      { root: 164.81, notes: [246.94, 329.63, 392.00, 493.88], bass: 82.41 }, // Em9
      { root: 123.47, notes: [293.66, 369.99, 440.00, 493.88], bass: 61.74 }, // Bm7
      { root: 196.00, notes: [293.66, 392.00, 440.00, 587.33], bass: 98.00 }  // Gmaj9
    ];

    this.windNoiseNode = null;
    this.windGain = null;
    this.cicadaNode = null;
  }

  /**
   * Initializes AudioContext on first user interaction.
   */
  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Channel gains
      const config = window.GARDEN_CONFIG || {};
      const baseMusicVol = (config.musicVolume !== undefined) ? config.musicVolume : 0.65;
      const baseSfxVol = (config.sfxVolume !== undefined) ? config.sfxVolume : 0.75;

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(baseMusicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(baseSfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      // Create synthetic lush impulse response for reverb
      this.createReverb();

      // Start ambient wind & cicadas
      this.startAmbience();

      // Start calm musical journey
      this.startMusic();

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio initialization deferred:", e);
    }
  }

  /**
   * Creates an ethereal algorithmic impulse response for dreamy spaciousness.
   */
  createReverb() {
    const rate = this.ctx.sampleRate;
    const length = rate * 2.8; // 2.8 second decay
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (rate * 0.95));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }

    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = impulse;

    // Connect reverb in parallel to master
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    this.reverbNode.connect(reverbGain);
    reverbGain.connect(this.masterGain);
  }

  /**
   * Starts subtle natural evening atmosphere (whispering breeze + distant cicadas)
   */
  startAmbience() {
    if (!this.ctx) return;

    // Filtered pink noise for whispering wind
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    whiteNoise.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.ambienceGain);
    whiteNoise.start();

    // Gentle cicadas / crickets
    const config = window.GARDEN_CONFIG || {};
    if (config.enableNightCicadas !== false) {
      this.startCicadas();
    }
  }

  /**
   * Generates gentle rhythmic dusk cicada pulses
   */
  startCicadas() {
    const cicadaInterval = () => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() > 0.4) {
        this.playCicadaChirp();
      }
      const nextTime = 1500 + Math.random() * 3000;
      setTimeout(cicadaInterval, nextTime);
    };
    cicadaInterval();
  }

  playCicadaChirp() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(4600 + Math.random() * 400, t);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(4800, t);
    filter.Q.setValueAtTime(6.0, t);

    const dur = 0.4 + Math.random() * 0.3;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.015, t + dur * 0.3);
    gain.gain.linearRampToValueAtTime(0.0001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  /**
   * Dynamically modulates wind when cursor moves fast or chime is touched
   */
  gustWind(strength = 1.0) {
    if (!this.ctx || !this.windGain) return;
    const t = this.ctx.currentTime;
    const current = this.windGain.gain.value;
    const target = Math.min(0.22, 0.04 + strength * 0.12);
    this.windGain.gain.cancelScheduledValues(t);
    this.windGain.gain.setValueAtTime(current, t);
    this.windGain.gain.linearRampToValueAtTime(target, t + 0.4);
    this.windGain.gain.exponentialRampToValueAtTime(0.04, t + 2.5);
  }

  /**
   * Piano Voice Synthesizer
   * Creates a warm, organic indie-piano / Rhodes tone with soft hammers and wooden resonance.
   */
  playPianoNote(freq, velocity = 0.5, duration = 3.5, dest = null) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const out = dest || this.musicGain;

    // Fundamental oscillator (sine with subtle warm saturation)
    const osc1 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, t);

    // Warm second harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, t);

    // Subtle felt hammer click (filtered burst)
    const hammer = this.ctx.createOscillator();
    hammer.type = "triangle";
    hammer.frequency.setValueAtTime(freq * 0.5, t);

    // Warm Lowpass filter (dynamically responds to velocity)
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    const cutoff = Math.min(2800, 600 + (velocity * 1600) + (this.awakening * 900));
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.4), t + duration);

    // Amplitude envelope
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    const masterNoteGain = this.ctx.createGain();

    const maxAmp = velocity * 0.22;
    masterNoteGain.gain.setValueAtTime(0.0001, t);
    masterNoteGain.gain.linearRampToValueAtTime(maxAmp, t + 0.018); // soft hammer attack
    masterNoteGain.gain.exponentialRampToValueAtTime(maxAmp * 0.4, t + 0.8);
    masterNoteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    gain1.gain.setValueAtTime(0.85, t);
    gain2.gain.setValueAtTime(0.18, t);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);

    filter.connect(masterNoteGain);
    masterNoteGain.connect(out);

    // Also send a touch to lush reverb
    if (this.reverbNode) {
      const sendReverb = this.ctx.createGain();
      sendReverb.gain.setValueAtTime(0.35, t);
      filter.connect(sendReverb);
      sendReverb.connect(this.reverbNode);
    }

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration + 0.1);
    osc2.stop(t + duration + 0.1);
  }

  /**
   * Delicate Celestial Music Box / Celesta Synthesizer
   * Creates a crystal, lullaby chime tone for the birthday curtain atmosphere.
   */
  playMusicBoxNote(freq, velocity = 0.35, duration = 2.6) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, t);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.756, t); // gentle crystalline inharmonic chime

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq * 1.4, t);
    filter.Q.setValueAtTime(3.2, t);

    const noteGain = this.ctx.createGain();
    const maxAmp = velocity * 0.16;
    noteGain.gain.setValueAtTime(0.0001, t);
    noteGain.gain.linearRampToValueAtTime(maxAmp, t + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(noteGain);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    if (this.reverbNode) {
      const sendRev = this.ctx.createGain();
      sendRev.gain.setValueAtTime(0.42, t);
      noteGain.connect(sendRev);
      sendRev.connect(this.reverbNode);
    }

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration + 0.05);
    osc2.stop(t + duration + 0.05);
  }

  /**
   * Synthesizes warm strings / ethereal pad layer that emerges as garden awakens
   */
  startPadLayer() {
    if (!this.ctx || this.padGain) return;
    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.setValueAtTime(550, this.ctx.currentTime);

    this.padGain.connect(this.padFilter);
    this.padFilter.connect(this.musicGain);
    if (this.reverbNode) {
      this.padFilter.connect(this.reverbNode);
    }
  }

  /**
   * Main peaceful music loop
   */
  startMusic() {
    this.musicPlaying = true;
    this.startPadLayer();

    const stepDuration = 3800; // Peaceful slow tempo ~ 63 bpm

    const playChordStep = () => {
      if (!this.musicPlaying || !this.ctx) return;

      const activeChordList = this.transformed ? this.transformChords : this.chords;
      const chord = activeChordList[this.currentChordIndex % activeChordList.length];
      const t = this.ctx.currentTime;

      // 1. Play deep warm root bass
      this.playPianoNote(chord.bass, 0.45, 4.2);

      // 2. Play warm root octave
      this.playPianoNote(chord.root, 0.4, 3.8);

      // 3. Play gentle arpeggiated piano melody notes across the bar
      const arpNotes = [...chord.notes];
      arpNotes.forEach((noteFreq, idx) => {
        const noteDelay = 550 + idx * 720 + (Math.random() * 80);
        setTimeout(() => {
          if (!this.musicPlaying || !this.ctx) return;
          const vel = 0.28 + Math.random() * 0.15;
          this.playPianoNote(noteFreq, vel, 2.8);

          // If curtain is draped, add celestial lullaby music box tones
          if (window.birthdayCurtain && !window.birthdayCurtain.isLifted) {
            if (idx % 2 === 0 || Math.random() > 0.4) {
              setTimeout(() => {
                this.playMusicBoxNote(noteFreq * 2, 0.24, 2.5);
              }, 220);
            }
          }
          // If garden is awakening or transformed, occasionally sprinkle a high octave bell
          else if ((this.awakening > 0.4 || this.transformed) && Math.random() > 0.45) {
            setTimeout(() => {
              this.playPianoNote(noteFreq * 2, 0.2, 2.2);
            }, 320);
          }
        }, noteDelay);
      });

      // Update warm pad volume based on awakening level
      if (this.padGain) {
        const targetPad = Math.max(0.03, this.awakening * 0.18 + (this.transformed ? 0.12 : 0.0));
        this.padGain.gain.linearRampToValueAtTime(targetPad, t + 1.5);
      }

      this.currentChordIndex++;
      this.musicTimer = setTimeout(playChordStep, stepDuration);
    };

    // Begin first chord after a gentle 1.2s fade-in
    setTimeout(playChordStep, 1200);
  }

  /**
   * Updates garden awakening factor (0.0 to 1.0) to naturally enrich the audio
   */
  setAwakeningLevel(level) {
    this.awakening = Math.max(0.0, Math.min(1.0, level));
  }

  /**
   * -------------------------------------------------------------
   * INTERACTION SOUND EFFECTS
   * -------------------------------------------------------------
   */

  /**
   * Realistic metallic wind chime with inharmonic overtone resonance.
   */
  playWindChime(pitchIdx = null) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const basePitch = pitchIdx !== null && this.chimePitches[pitchIdx]
      ? this.chimePitches[pitchIdx]
      : this.chimePitches[Math.floor(Math.random() * this.chimePitches.length)];

    // Inharmonic bell partials: 1.0, 2.76, 5.4, 8.93
    const partials = [1.0, 2.756, 5.404];
    const partialGains = [0.22, 0.09, 0.04];
    const decay = 2.4 + Math.random() * 0.6;

    partials.forEach((mult, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(basePitch * mult, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(partialGains[i], t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay / (mult * 0.8));

      osc.connect(gain);
      gain.connect(this.sfxGain);

      if (this.reverbNode) {
        gain.connect(this.reverbNode);
      }

      osc.start(t);
      osc.stop(t + decay + 0.1);
    });

    // Environmental reaction: rustle nearby breeze
    this.gustWind(0.6);
  }

  /**
   * Soft, refreshing water droplets / pouring stream
   */
  playWaterStream() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Bubble droplet generator: rapid sequence of tiny frequency-swept chirps
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Droplet pitch sweep
        const startFreq = 600 + Math.random() * 500;
        const endFreq = startFreq + 250 + Math.random() * 200;

        osc.type = "sine";
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
      }, i * 75);
    }
  }

  /**
   * Pond surface water ripple sound
   */
  playWaterRipple() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 420 + Math.random() * 220;
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, t + 0.09);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    if (this.reverbNode) {
      gain.connect(this.reverbNode);
    }

    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Mechanical flint click + warm ignition glow sound for lantern
   */
  playLanternIgnite() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1. Mechanical click (sharp bandpass pulse)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();

    clickFilter.type = "bandpass";
    clickFilter.frequency.setValueAtTime(2400, t);
    clickFilter.Q.setValueAtTime(3.0, t);

    clickOsc.type = "sawtooth";
    clickOsc.frequency.setValueAtTime(180, t);

    clickGain.gain.setValueAtTime(0.25, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.sfxGain);

    clickOsc.start(t);
    clickOsc.stop(t + 0.08);

    // 2. Warm flame whoosh + warm resonant harmonic hum
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const humOsc = this.ctx.createOscillator();
      const humGain = this.ctx.createGain();

      humOsc.type = "triangle";
      humOsc.frequency.setValueAtTime(146.83, now); // D3
      humOsc.frequency.linearRampToValueAtTime(220.00, now + 0.4);

      humGain.gain.setValueAtTime(0.0001, now);
      humGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      humOsc.connect(humGain);
      humGain.connect(this.sfxGain);

      if (this.reverbNode) {
        humGain.connect(this.reverbNode);
      }

      humOsc.start(now);
      humOsc.stop(now + 1.9);
    }, 45);
  }

  /**
   * Gentle, magical chime when a flower blooms or receives care
   */
  playFlowerBloom() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const notes = [880, 1108.73, 1318.51, 1760]; // A5, C#6, E6, A6
    const baseFreq = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    if (this.reverbNode) {
      gain.connect(this.reverbNode);
    }

    osc.start(t);
    osc.stop(t + 1.5);
  }

  /**
   * Delicate crystal sparkle for firefly interactions
   */
  playFireflySparkle() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const freq = 1800 + Math.random() * 800;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * The Great Transformation:
   * 1. The Stillness ("Calm before magic"): audio fades softly
   * 2. The Sprout & Growth: rising warm harmonic pad, ascending harp-like glissando
   * 3. The Grand Flourish: resonant golden chords & shimmering bells
   */
  triggerTransformationSequence(onPeakCallback = null) {
    if (!this.ctx || this.isTransforming) return;
    this.isTransforming = true;

    const t = this.ctx.currentTime;

    // Step 1: Gentle hush / pause
    if (this.musicGain) {
      this.musicGain.gain.linearRampToValueAtTime(0.1, t + 1.8);
    }

    // Step 2: After 2 seconds, the seed begins to hum and pulse
    setTimeout(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Deep earth pulse
      const pulseOsc = this.ctx.createOscillator();
      const pulseGain = this.ctx.createGain();
      pulseOsc.type = "sine";
      pulseOsc.frequency.setValueAtTime(80, now);
      pulseOsc.frequency.exponentialRampToValueAtTime(220, now + 3.0);

      pulseGain.gain.setValueAtTime(0.001, now);
      pulseGain.gain.linearRampToValueAtTime(0.28, now + 1.5);
      pulseGain.gain.linearRampToValueAtTime(0.001, now + 3.2);

      pulseOsc.connect(pulseGain);
      pulseGain.connect(this.masterGain);
      pulseOsc.start(now);
      pulseOsc.stop(now + 3.3);

      // Cascading harp-like arpeggios rising upward as the tree grows
      const harpScale = [
        293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00, 2349.32
      ];

      harpScale.forEach((note, index) => {
        setTimeout(() => {
          if (!this.ctx) return;
          this.playPianoNote(note, 0.35 + (index * 0.02), 2.8);
        }, 600 + index * 240);
      });

      // Step 3: Peak Bloom & Transformation Complete
      setTimeout(() => {
        this.transformed = true;
        this.currentChordIndex = 0;

        // Restore music with brighter, majestic volume
        if (this.musicGain) {
          const config = window.GARDEN_CONFIG || {};
          const fullVol = (config.musicVolume !== undefined) ? config.musicVolume * 1.15 : 0.8;
          this.musicGain.gain.linearRampToValueAtTime(fullVol, this.ctx.currentTime + 2.0);
        }

        // Chime celebration flourish
        for (let c = 0; c < 5; c++) {
          setTimeout(() => {
            this.playWindChime(c % this.chimePitches.length);
          }, c * 320);
        }

        if (onPeakCallback) {
          onPeakCallback();
        }
      }, 3400);

    }, 2000);
  }

  /**
   * Sound effect for taking a garden memory photo snapshot
   */
  playSnapshot() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Camera click transient
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);

    // Warm following chime
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      this.playPianoNote(880, 0.2, 1.2);
    }, 90);
  }

  /**
   * Magical shooting star wish glissando
   */
  playWishStar() {
    if (!this.ctx || this.isMuted) return;
    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        if (this.reverbNode) gain.connect(this.reverbNode);
        osc.start(now);
        osc.stop(now + 1.3);
      }, i * 65);
    });
  }

  /**
   * Gentle, warm harp swell when the letter opens
   */
  playLetterOpen() {
    if (!this.ctx || this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        this.playPianoNote(freq, 0.18, 2.0);
      }, idx * 110);
    });
  }

  /**
   * Duck music volume smoothly for intimate moments (e.g., reading the letter)
   */
  duckMusic(ratio = 0.35, duration = 1.2) {
    if (!this.ctx || !this.musicGain) return;
    const config = window.GARDEN_CONFIG || {};
    const baseVol = (config.musicVolume !== undefined) ? config.musicVolume : 0.65;
    this.musicGain.gain.linearRampToValueAtTime(baseVol * ratio, this.ctx.currentTime + duration);
  }

  /**
   * Restore music volume smoothly
   */
  unduckMusic(duration = 1.6) {
    if (!this.ctx || !this.musicGain) return;
    const config = window.GARDEN_CONFIG || {};
    const baseVol = (config.musicVolume !== undefined) ? config.musicVolume : 0.65;
    this.musicGain.gain.linearRampToValueAtTime(baseVol, this.ctx.currentTime + duration);
  }

  /**
   * Sound Mute / Unmute Toggle
   */
  toggleMute() {
    if (!this.ctx) {
      this.init();
      return false;
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0.0 : 1.0,
        this.ctx.currentTime + 0.3
      );
    }
    return this.isMuted;
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.gardenAudio = new GardenAudio();
}
