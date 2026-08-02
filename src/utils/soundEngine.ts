export class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playClick(freq = 450) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public playBubble() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const startFreq = 200 + Math.random() * 350;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 450, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  }

  public playReaction(reactivity: 'mild' | 'moderate' | 'vigorous' | 'explosive') {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(
        reactivity === 'explosive' ? 1400 : reactivity === 'vigorous' ? 800 : 400,
        t
      );

      const gain = this.ctx.createGain();
      const peakGain = reactivity === 'explosive' ? 0.45 : reactivity === 'vigorous' ? 0.28 : 0.12;
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(peakGain, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 1.5);

      if (reactivity === 'explosive' || reactivity === 'vigorous') {
        const osc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(reactivity === 'explosive' ? 120 : 90, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.8);
        subGain.gain.setValueAtTime(0.35, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(subGain);
        subGain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.8);
      }
    } catch {
      // Audio fallback
    }
  }
}

export const sound = new SoundEngine();
