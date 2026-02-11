function safeAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  return Ctx ? new Ctx() : null;
}

function now(ctx) {
  return ctx.currentTime;
}

function env(gainNode, t0, { peak = 0.2, a = 0.005, d = 0.08, s = 0.0, r = 0.06 } = {}) {
  const g = gainNode.gain;
  g.cancelScheduledValues(t0);
  g.setValueAtTime(0.0001, t0);
  g.exponentialRampToValueAtTime(Math.max(0.0001, peak), t0 + a);
  g.exponentialRampToValueAtTime(Math.max(0.0001, peak * s), t0 + a + d);
  g.exponentialRampToValueAtTime(0.0001, t0 + a + d + r);
}

function tone(ctx, { type = "sine", freq = 440, duration = 0.12, gain = 0.25, slideTo = null } = {}) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now(ctx));
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, now(ctx) + duration);
  }
  // Actual amplitude is shaped by env(); keep node quiet until scheduled.
  g.gain.setValueAtTime(0.0001, now(ctx));
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(now(ctx) + duration);
  return { osc, g };
}

export class AudioManager {
  constructor({ soundOn, musicOn }) {
    this.soundOn = !!soundOn;
    this.musicOn = !!musicOn;
    this.ctx = null;
    this.musicTimer = null;
    this._musicStep = 0;
  }

  ensure() {
    if (this.ctx) return this.ctx;
    this.ctx = safeAudioContext();
    return this.ctx;
  }

  setSoundOn(on) {
    this.soundOn = !!on;
  }

  setMusicOn(on) {
    this.musicOn = !!on;
    if (!this.musicOn) this.stopMusic();
  }

  play(name) {
    if (!this.soundOn) return;
    const ctx = this.ensure();
    if (!ctx) return;

    // Some browsers start suspended until a user gesture. If play() is called
    // too early, just no-op; the first Start click will create/resume anyway.
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const t0 = now(ctx);

    if (name === "button") {
      const { g } = tone(ctx, { type: "triangle", freq: 660, duration: 0.06, gain: 0.12 });
      env(g, t0, { peak: 0.12, a: 0.003, d: 0.03, r: 0.03 });
      return;
    }
    if (name === "pop") {
      const { g } = tone(ctx, { type: "sine", freq: 920, duration: 0.1, gain: 0.18, slideTo: 1400 });
      env(g, t0, { peak: 0.12, a: 0.004, d: 0.04, r: 0.05 });
      return;
    }
    if (name === "bonk") {
      const { g } = tone(ctx, { type: "sine", freq: 220, duration: 0.12, gain: 0.22, slideTo: 160 });
      env(g, t0, { peak: 0.16, a: 0.004, d: 0.05, r: 0.07 });
      return;
    }
    if (name === "bonus") {
      const { g } = tone(ctx, { type: "triangle", freq: 523.25, duration: 0.14, gain: 0.16, slideTo: 880 });
      env(g, t0, { peak: 0.12, a: 0.004, d: 0.06, r: 0.08 });
      return;
    }
    if (name === "oops") {
      const { g } = tone(ctx, { type: "square", freq: 280, duration: 0.14, gain: 0.12, slideTo: 120 });
      env(g, t0, { peak: 0.08, a: 0.004, d: 0.07, r: 0.1 });
      return;
    }
  }

  startMusic() {
    if (!this.musicOn) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (this.musicTimer) return;

    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const step = () => {
      if (!this.musicOn) return;
      const chord = [
        [261.63, 329.63, 392.0], // C
        [293.66, 369.99, 440.0], // Dm-ish
        [246.94, 311.13, 392.0], // Bdim-ish (softened)
        [220.0, 277.18, 329.63], // Am
      ][this._musicStep % 4];

      const t0 = now(ctx);
      for (const f of chord) {
        const { g } = tone(ctx, { type: "sine", freq: f, duration: 0.28, gain: 0.03 });
        env(g, t0, { peak: 0.03, a: 0.01, d: 0.08, s: 0.15, r: 0.1 });
      }

      this._musicStep++;
      this.musicTimer = window.setTimeout(step, 420);
    };

    step();
  }

  stopMusic() {
    if (this.musicTimer) window.clearTimeout(this.musicTimer);
    this.musicTimer = null;
  }
}
