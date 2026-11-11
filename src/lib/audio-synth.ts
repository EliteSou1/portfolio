/**
 * Procedural Space & Sculk Atmosphere Synthesizer
 * Generates an evolving, subtle, deep cosmic drone using native Web Audio API.
 * No external copyrighted assets, zero latency, runs smoothly with user consent.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;
  private isMuted = true;
  private droneOscillators: OscillatorNode[] = [];
  private lfoNode: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Low pass filter for warm, dark, ancient-stone resonance
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(140, this.ctx.currentTime); // very dark cutoff
      this.filterNode.Q.setValueAtTime(3.5, this.ctx.currentTime); // subtle resonance
      this.filterNode.connect(this.masterGain);

      // Slow LFO for organic breathing filter cutoff
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = 'sine';
      this.lfoNode.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12-second cycle breathing
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(45, this.ctx.currentTime);
      this.lfoNode.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      this.lfoNode.start();

      // Deep Drone Cluster (tuned to a dark ancient ambient chord: A0, E1, A1, C2)
      // 55Hz (A1), 82.4Hz (E2), 110Hz (A2), 65.4Hz (C2)
      const frequencies = [55.0, 55.4, 82.4, 110.2];

      frequencies.forEach((freq, i) => {
        if (!this.ctx || !this.filterNode) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Low individual gains so it stays subtle background ambiance
        oscGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(this.filterNode);
        osc.start();
        this.droneOscillators.push(osc);
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio could not initialize:', e);
    }
  }

  public async setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended' && !muted) {
      try { await this.ctx.resume(); }
      catch { this.isMuted = true; }
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);

    if (this.isMuted) {
      // Smooth fade out
      this.masterGain.gain.setTargetAtTime(0.0, now, 0.4);
    } else {
      // Smooth fade in
      this.masterGain.gain.setTargetAtTime(0.35, now, 0.8);
    }
  }

  public async toggle(): Promise<boolean> {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.ctx || !this.masterGain || this.ctx.state === 'closed') return false;
    await this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Subtle micro-sound on section jump: a soft sub-resonant pitch pulse
   */
  public playSectionTransition(sectionIndex: number) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Harmonic series based on section
      const basePitch = 110 + sectionIndex * 18;
      osc.frequency.setValueAtTime(basePitch, now);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 0.7, now + 0.6);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain ?? this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Micro-feedback on UI hover: whisper of soft ancient stone resonance
   */
  public playHoverTone() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain ?? this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  /**
   * Selection confirmation feedback
   */
  public playSelectTone() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain ?? this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }
}

export const audioSynth = new AudioSynthesizer();
