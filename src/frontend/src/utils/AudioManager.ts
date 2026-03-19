// ─── Centralized Audio Engine ──────────────────────────────────────────────
// Uses Web Audio API only — no external files needed. All sounds are synthesized.

type AudioCategory = "ambient" | "planet" | "event" | "ui" | "mission";

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  // Category gain nodes
  private categoryGains: Record<AudioCategory, GainNode | null> = {
    ambient: null,
    planet: null,
    event: null,
    ui: null,
    mission: null,
  };

  private categoryMuted: Record<AudioCategory, boolean> = {
    ambient: false,
    planet: false,
    event: false,
    ui: false,
    mission: false,
  };

  // Active ambient nodes
  private ambientNodes: AudioNode[] = [];
  private blackHoleNodes: AudioNode[] = [];
  private blackHoleGain: GainNode | null = null;

  // ── Init ───────────────────────────────────────────────────────────────────
  init() {
    if (this.initialized) {
      this.ctx?.resume();
      return;
    }
    this.initialized = true;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(this.ctx.destination);

    // Create per-category gain nodes
    const cats: AudioCategory[] = [
      "ambient",
      "planet",
      "event",
      "ui",
      "mission",
    ];
    for (const cat of cats) {
      const g = this.ctx.createGain();
      g.gain.value = 1.0;
      g.connect(this.masterGain);
      this.categoryGains[cat] = g;
    }

    this.startSolarSystemAmbient();
  }

  private getCtx(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  private getCategoryGain(cat: AudioCategory): GainNode | null {
    return this.categoryGains[cat];
  }

  // ── White/Pink Noise Buffer ────────────────────────────────────────────────
  private createNoiseBuffer(
    color: "white" | "pink" | "brown" = "white",
    duration = 1,
  ): AudioBuffer | null {
    const ctx = this.getCtx();
    if (!ctx) return null;
    const bufSize = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);

    if (color === "white") {
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (color === "pink") {
      // Pink noise via Paul Kellet's algorithm
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // Brown noise
      let lastOut = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    return buf;
  }

  // ── Solar System Ambient ───────────────────────────────────────────────────
  startSolarSystemAmbient() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("ambient");
    if (!ctx || !destGain) return;

    this.stopAllAmbient();

    const nodes: AudioNode[] = [];

    // Two sub-bass drones: 40Hz + 60Hz
    for (const freq of [40, 60]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.035;
      osc.connect(g);
      g.connect(destGain);
      osc.start();
      nodes.push(osc, g);
    }

    // Very quiet space noise
    const buf = this.createNoiseBuffer("pink", 2);
    if (buf) {
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 120;
      const ng = ctx.createGain();
      ng.gain.value = 0.02;
      noise.connect(filter);
      filter.connect(ng);
      ng.connect(destGain);
      noise.start();
      nodes.push(noise, filter, ng);
    }

    this.ambientNodes = nodes;
  }

  // ── Galaxy View Ambient ────────────────────────────────────────────────────
  startGalaxyAmbient() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("ambient");
    if (!ctx || !destGain) return;

    this.stopAllAmbient();
    const nodes: AudioNode[] = [];

    for (const freq of [30, 50]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.025;
      osc.connect(g);
      g.connect(destGain);
      osc.start();
      nodes.push(osc, g);
    }

    this.ambientNodes = nodes;
  }

  stopAllAmbient() {
    for (const node of this.ambientNodes) {
      try {
        if (
          node instanceof OscillatorNode ||
          node instanceof AudioBufferSourceNode
        ) {
          node.stop();
        }
        node.disconnect();
      } catch (_) {
        // already stopped
      }
    }
    this.ambientNodes = [];
  }

  // ── Universe Ambients ──────────────────────────────────────────────────────
  setUniverseAmbient(universeName: string) {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("ambient");
    if (!ctx || !destGain) return;

    this.stopAllAmbient();
    const nodes: AudioNode[] = [];

    if (universeName === "Our Universe") {
      this.startSolarSystemAmbient();
      return;
    }

    if (universeName === "Dark Matter") {
      // 25Hz sub-bass pulse
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 25;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.4;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;
      const g = ctx.createGain();
      g.gain.value = 0.04;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(g);
      g.connect(destGain);
      osc.start();
      lfo.start();
      nodes.push(osc, lfo, lfoGain, g);
    } else if (universeName === "Binary Star") {
      // warm harmonic: 110, 220, 330 Hz
      for (const [freq, vol] of [
        [110, 0.04],
        [220, 0.025],
        [330, 0.015],
      ] as [number, number][]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = vol;
        osc.connect(g);
        g.connect(destGain);
        osc.start();
        nodes.push(osc, g);
      }
    } else if (universeName === "Crystal Universe") {
      // Crystal bells: 1000, 1500, 2000 Hz with long decay
      for (const freq of [1000, 1500, 2000]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.3 + freq / 10000;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.008;
        const g = ctx.createGain();
        g.gain.value = 0.018;
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);
        osc.connect(g);
        g.connect(destGain);
        osc.start();
        lfo.start();
        nodes.push(osc, lfo, lfoGain, g);
      }
    } else if (universeName === "Antimatter") {
      // Dissonant 200Hz + 207Hz beat frequency
      for (const freq of [200, 207]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = 0.02;
        osc.connect(g);
        g.connect(destGain);
        osc.start();
        nodes.push(osc, g);
      }
    } else if (universeName === "Nebula") {
      // Slow sweep 80-200Hz with pink noise blend
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 8);
      const g = ctx.createGain();
      g.gain.value = 0.035;
      osc.connect(g);
      g.connect(destGain);
      osc.start();
      nodes.push(osc, g);

      const buf = this.createNoiseBuffer("pink", 2);
      if (buf) {
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 150;
        filter.Q.value = 0.5;
        const ng = ctx.createGain();
        ng.gain.value = 0.015;
        noise.connect(filter);
        filter.connect(ng);
        ng.connect(destGain);
        noise.start();
        nodes.push(noise, filter, ng);
      }
    }

    this.ambientNodes = nodes;
  }

  // ── Black Hole Audio ───────────────────────────────────────────────────────
  playBlackHoleAmbient() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("ambient");
    if (!ctx || !destGain) return;

    // Stop if already playing
    this.stopBlackHoleAmbient();

    const nodes: AudioNode[] = [];
    const masterBH = ctx.createGain();
    masterBH.gain.value = 0.0;
    masterBH.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 3);
    masterBH.connect(destGain);
    this.blackHoleGain = masterBH;

    // Sub-bass drone 20Hz
    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 20;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.06;
    drone.connect(droneGain);
    droneGain.connect(masterBH);
    drone.start();
    nodes.push(drone, droneGain);

    // Slow sweep 30-60Hz
    const sweep = ctx.createOscillator();
    sweep.type = "sine";
    sweep.frequency.setValueAtTime(30, ctx.currentTime);
    sweep.frequency.linearRampToValueAtTime(60, ctx.currentTime + 10);
    sweep.frequency.linearRampToValueAtTime(30, ctx.currentTime + 20);
    const sweepGain = ctx.createGain();
    sweepGain.gain.value = 0.04;
    sweep.connect(sweepGain);
    sweepGain.connect(masterBH);
    sweep.start();
    nodes.push(sweep, sweepGain);

    // Occasional deep thud - using intervals for irregular pulses
    const scheduleThud = () => {
      if (!this.ctx || this.blackHoleNodes.length === 0) return;
      const delay = 2000 + Math.random() * 5000;
      setTimeout(() => {
        const c = this.getCtx();
        if (!c || !this.blackHoleGain) return;
        const thud = c.createOscillator();
        thud.type = "sine";
        thud.frequency.setValueAtTime(40, c.currentTime);
        thud.frequency.exponentialRampToValueAtTime(15, c.currentTime + 0.8);
        const thudGain = c.createGain();
        thudGain.gain.setValueAtTime(0.08, c.currentTime);
        thudGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
        thud.connect(thudGain);
        thudGain.connect(this.blackHoleGain);
        thud.start();
        thud.stop(c.currentTime + 0.8);
        scheduleThud();
      }, delay);
    };
    scheduleThud();

    // Brown noise ambience
    const buf = this.createNoiseBuffer("brown", 2);
    if (buf) {
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 80;
      const ng = ctx.createGain();
      ng.gain.value = 0.04;
      noise.connect(filter);
      filter.connect(ng);
      ng.connect(masterBH);
      noise.start();
      nodes.push(noise, filter, ng);
    }

    this.blackHoleNodes = nodes;
  }

  stopBlackHoleAmbient() {
    const ctx = this.ctx;
    if (this.blackHoleGain && ctx) {
      this.blackHoleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    }
    setTimeout(() => {
      for (const node of this.blackHoleNodes) {
        try {
          if (
            node instanceof OscillatorNode ||
            node instanceof AudioBufferSourceNode
          ) {
            node.stop();
          }
          node.disconnect();
        } catch (_) {}
      }
      this.blackHoleNodes = [];
      this.blackHoleGain = null;
    }, 1600);
  }

  // ── Planet Sounds ──────────────────────────────────────────────────────────
  playPlanetSound(planetName: string) {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("planet");
    if (!ctx || !destGain || this.categoryMuted.planet) return;

    const now = ctx.currentTime;

    switch (planetName) {
      case "Mercury": {
        // Short crackling noise bursts — rapid random FM
        for (let i = 0; i < 8; i++) {
          const t = now + i * 0.25 + Math.random() * 0.1;
          const osc = ctx.createOscillator();
          osc.type = "square";
          osc.frequency.setValueAtTime(400 + Math.random() * 1600, t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.07, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          osc.connect(g);
          g.connect(destGain);
          osc.start(t);
          osc.stop(t + 0.07);
        }
        break;
      }
      case "Venus": {
        // Slow sine sweep 200-400Hz, eerie
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(400, now + 1.5);
        osc.frequency.linearRampToValueAtTime(200, now + 3);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0, now);
        g.gain.linearRampToValueAtTime(0.12, now + 0.3);
        g.gain.linearRampToValueAtTime(0.0, now + 3);
        const detune = ctx.createOscillator();
        detune.type = "sine";
        detune.frequency.value = 201;
        const dg = ctx.createGain();
        dg.gain.setValueAtTime(0.0, now);
        dg.gain.linearRampToValueAtTime(0.06, now + 0.3);
        dg.gain.linearRampToValueAtTime(0.0, now + 3);
        osc.connect(g);
        detune.connect(dg);
        g.connect(destGain);
        dg.connect(destGain);
        osc.start(now);
        detune.start(now);
        osc.stop(now + 3);
        detune.stop(now + 3);
        break;
      }
      case "Earth": {
        // Gentle 528Hz + 432Hz chord
        for (const freq of [528, 432, 264]) {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = freq;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0, now);
          g.gain.linearRampToValueAtTime(0.06, now + 0.4);
          g.gain.linearRampToValueAtTime(0.0, now + 2.5);
          osc.connect(g);
          g.connect(destGain);
          osc.start(now);
          osc.stop(now + 2.5);
        }
        break;
      }
      case "Mars": {
        // Low 80Hz rumble with brown noise
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 80;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0, now);
        g.gain.linearRampToValueAtTime(0.1, now + 0.2);
        g.gain.linearRampToValueAtTime(0.0, now + 2);
        osc.connect(g);
        g.connect(destGain);
        osc.start(now);
        osc.stop(now + 2);

        const buf = this.createNoiseBuffer("brown", 2);
        if (buf) {
          const noise = ctx.createBufferSource();
          noise.buffer = buf;
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 150;
          const ng = ctx.createGain();
          ng.gain.setValueAtTime(0.0, now);
          ng.gain.linearRampToValueAtTime(0.08, now + 0.2);
          ng.gain.linearRampToValueAtTime(0.0, now + 2);
          noise.connect(filter);
          filter.connect(ng);
          ng.connect(destGain);
          noise.start(now);
          noise.stop(now + 2);
        }
        break;
      }
      case "Jupiter": {
        // Powerful 40-100Hz sweep, loud
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(40, now);
        osc.frequency.linearRampToValueAtTime(100, now + 1);
        osc.frequency.linearRampToValueAtTime(40, now + 2);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0, now);
        g.gain.linearRampToValueAtTime(0.18, now + 0.3);
        g.gain.linearRampToValueAtTime(0.0, now + 2.5);
        osc.connect(g);
        g.connect(destGain);
        osc.start(now);
        osc.stop(now + 2.5);
        break;
      }
      case "Saturn": {
        // Harmonic bells 200, 400, 600 Hz (ring resonance)
        for (const [freq, vol] of [
          [200, 0.1],
          [400, 0.06],
          [600, 0.04],
        ] as [number, number][]) {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = freq;
          const g = ctx.createGain();
          g.gain.setValueAtTime(vol, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
          osc.connect(g);
          g.connect(destGain);
          osc.start(now);
          osc.stop(now + 2.5);
        }
        break;
      }
      case "Uranus": {
        // High 800-2000Hz whistle sweep
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(2000, now + 1.5);
        osc.frequency.linearRampToValueAtTime(800, now + 2.5);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0, now);
        g.gain.linearRampToValueAtTime(0.07, now + 0.3);
        g.gain.linearRampToValueAtTime(0.0, now + 2.5);
        osc.connect(g);
        g.connect(destGain);
        osc.start(now);
        osc.stop(now + 2.5);
        break;
      }
      case "Neptune": {
        // 150Hz howl with vibrato
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 150;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 5;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0, now);
        g.gain.linearRampToValueAtTime(0.1, now + 0.4);
        g.gain.linearRampToValueAtTime(0.0, now + 2.5);
        osc.connect(g);
        g.connect(destGain);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 2.5);
        lfo.stop(now + 2.5);
        break;
      }
      default:
        break;
    }
  }

  // ── UI Click ───────────────────────────────────────────────────────────────
  playUIClick() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("ui");
    if (!ctx || !destGain || this.categoryMuted.ui) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(g);
    g.connect(destGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // ── Comet Whoosh ───────────────────────────────────────────────────────────
  playCometWhoosh() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("event");
    if (!ctx || !destGain || this.categoryMuted.event) return;
    const now = ctx.currentTime;
    const buf = this.createNoiseBuffer("white", 1.5);
    if (!buf) return;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.linearRampToValueAtTime(4000, now + 1.5);
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.3);
    g.gain.linearRampToValueAtTime(0.0, now + 1.5);
    noise.connect(filter);
    filter.connect(g);
    g.connect(destGain);
    noise.start(now);
    noise.stop(now + 1.5);
  }

  // ── Solar Flare ────────────────────────────────────────────────────────────
  playSolarFlare() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("event");
    if (!ctx || !destGain || this.categoryMuted.event) return;
    const now = ctx.currentTime;
    // FM burst: carrier 200Hz, mod 150Hz
    const carrier = ctx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = 200;
    const modulator = ctx.createOscillator();
    modulator.type = "sine";
    modulator.frequency.value = 150;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(200, now);
    modGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    carrier.connect(g);
    g.connect(destGain);
    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + 0.5);
    modulator.stop(now + 0.5);
  }

  // ── Mission Sounds ─────────────────────────────────────────────────────────
  playMissionBeep() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("mission");
    if (!ctx || !destGain || this.categoryMuted.mission) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 880;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(g);
    g.connect(destGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playMissionLaunch() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("mission");
    if (!ctx || !destGain || this.categoryMuted.mission) return;
    const now = ctx.currentTime;
    // Low rumble noise
    const buf = this.createNoiseBuffer("brown", 2);
    if (buf) {
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0, now);
      ng.gain.linearRampToValueAtTime(0.25, now + 2);
      noise.connect(filter);
      filter.connect(ng);
      ng.connect(destGain);
      noise.start(now);
      noise.stop(now + 2);
    }
    // 60Hz oscillator ramping up
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(120, now + 2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, now);
    g.gain.linearRampToValueAtTime(0.15, now + 2);
    osc.connect(g);
    g.connect(destGain);
    osc.start(now);
    osc.stop(now + 2);
  }

  playMissionStatic() {
    const ctx = this.getCtx();
    const destGain = this.getCategoryGain("mission");
    if (!ctx || !destGain || this.categoryMuted.mission) return;
    const now = ctx.currentTime;
    const buf = this.createNoiseBuffer("white", 0.2);
    if (!buf) return;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = 0.08;
    noise.connect(filter);
    filter.connect(g);
    g.connect(destGain);
    noise.start(now);
    noise.stop(now + 0.2);
  }

  // ── Master Volume ──────────────────────────────────────────────────────────
  setMasterVolume(v: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, v)),
        this.ctx.currentTime + 0.05,
      );
    }
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 0.6;
  }

  // ── Category Mute ──────────────────────────────────────────────────────────
  setCategoryMuted(cat: AudioCategory, muted: boolean) {
    this.categoryMuted[cat] = muted;
    const g = this.categoryGains[cat];
    if (g && this.ctx) {
      g.gain.linearRampToValueAtTime(muted ? 0 : 1, this.ctx.currentTime + 0.1);
    }
  }

  getCategoryMuted(cat: AudioCategory): boolean {
    return this.categoryMuted[cat];
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton export
export const audioManager = new AudioManagerClass();
export type { AudioCategory };
