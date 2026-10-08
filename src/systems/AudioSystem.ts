/** All sounds are synthesized here; no third-party music or sound assets. */
export class AudioSystem {
  enabled = false;
  private context?: AudioContext;
  private ambience?: { osc: OscillatorNode; gain: GainNode }[];
  async toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.startAmbience();
      this.play("bell");
    } else this.stopAmbience();
    return this.enabled;
  }
  async unlock() {
    if (this.enabled) {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.startAmbience();
    }
  }
  play(
    kind: "bell" | "cup" | "pour" | "seal" | "coin" | "bad" | "step" | "select",
  ) {
    if (!this.enabled || !this.context) return;
    const ctx = this.context,
      t = ctx.currentTime;
    const notes =
      kind === "coin"
        ? [660, 880, 1320]
        : kind === "bell"
          ? [523.25, 783.99]
          : kind === "bad"
            ? [220, 164.81]
            : kind === "seal"
              ? [90, 65]
              : kind === "pour"
                ? [390, 440]
                : kind === "step"
                  ? [80]
                  : [440];
    notes.forEach((frequency, i) => {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.type = kind === "seal" || kind === "step" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(frequency, t + i * 0.09);
      gain.gain.setValueAtTime(0.0001, t + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(
        kind === "step" ? 0.015 : 0.065,
        t + i * 0.09 + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.19);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.22);
    });
  }
  private startAmbience() {
    if (this.ambience || !this.context) return;
    const ctx = this.context;
    this.ambience = [130.81, 196, 261.63].map((frequency, i) => {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.value = 0.006 / (i + 1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      return { osc, gain };
    });
  }
  private stopAmbience() {
    this.ambience?.forEach(({ osc }) => osc.stop());
    this.ambience = undefined;
  }
  dispose() {
    this.stopAmbience();
    void this.context?.close();
  }
}
