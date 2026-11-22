class SoundEffects {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    endFreq?: number,
    delay = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Safe fallback when audio is blocked
    }
  }

  playPlaceShip() {
    this.playTone(320, 0.08, 'triangle', 0.07, 480);
  }

  playSplash() {
    this.playTone(260, 0.16, 'sine', 0.06, 110);
  }

  playSonarPing() {
    this.playTone(880, 0.18, 'sine', 0.05, 660);
  }

  playHit() {
    this.playTone(180, 0.18, 'sawtooth', 0.09, 65);
    this.playTone(440, 0.12, 'triangle', 0.06, 220, 0.05);
  }

  playShieldBreak() {
    this.playTone(523.25, 0.12, 'triangle', 0.08);
    this.playTone(659.25, 0.15, 'triangle', 0.08, undefined, 0.08);
  }

  playShieldDeflect() {
    this.playTone(392, 0.14, 'sine', 0.07, 293.66);
    this.playTone(293.66, 0.18, 'sine', 0.06, 196, 0.1);
  }

  playSunk() {
    this.playTone(220, 0.22, 'sawtooth', 0.09, 80);
    this.playTone(150, 0.28, 'sawtooth', 0.09, 55, 0.14);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.08, undefined, idx * 0.11);
    });
  }
}

export const soundFX = new SoundEffects();
