// Short, original mechanical cues, synthesized locally without audio downloads.
let context;
let enabled = true;
let lastHover = -Infinity;
const effectVolume = 2.5;
const listeners = new Set();
export const subscribeSounds = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const soundsEnabled = () => enabled;
export function toggleSounds() {
  enabled = !enabled;
  listeners.forEach(listener => listener());
  if (enabled) playSound('click');
}
export function playSound(cue) {
  if (!enabled || document.hidden) return;
  if (cue === 'hover') {
    const time = performance.now();
    if (time - lastHover < 90) return;
    lastHover = time;
  }
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    context.resume().catch(() => {});
    const now = context.currentTime;
    function tone(delay, frequency, duration, volume, end = frequency) {
      const source = context.createOscillator(), gain = context.createGain();
      source.type = 'sine';
      source.frequency.setValueAtTime(frequency, now + delay);
      source.frequency.exponentialRampToValueAtTime(end, now + delay + duration);
      gain.gain.setValueAtTime(volume * effectVolume, now + delay);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
      source.connect(gain).connect(context.destination);
      source.start(now + delay); source.stop(now + delay + duration);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
    }
    function tick(delay, frequency, duration, volume) {
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
      source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = frequency;
      gain.gain.setValueAtTime(volume * effectVolume, now + delay);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
      source.connect(filter).connect(gain).connect(context.destination);
      source.start(now + delay);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    }
    if (cue === 'hover') {
      tick(0, 3600, .025, .045); tone(.005, 420, .035, .025, 260);
    } else if (cue === 'open' || cue === 'close') {
      tick(0, 2200, .045, .12); tone(.02, 180, .09, .07, 90);
      for (let i = 0; i < 4; i++) tick(.06 + i * .045, 2800 + i * 250, .02, .035);
      tick(.27, 1600, .035, .08);
    } else if (cue === 'lift') {
      tick(0, 3200, .035, .08); tone(.01, 280, .05, .035, 160);
    } else if (cue === 'insert') {
      tick(0, 1900, .06, .12); tone(0, 160, .1, .09, 80);
      for (let i = 0; i < 4; i++) { tick(.06 + i * .025, 950, .02, .035); tone(.06 + i * .025, 100 + i * 12, .025, .035); }
    } else if (cue === 'boot') {
      tone(0, 110, .12, .09, 50); tick(.01, 700, .12, .07);
      tick(.08, 5500, .055, .025); tone(.12, 1800, .12, .012, 2700);
    } else {
      tick(0, 3000, .025, .07); tone(0, 240, .04, .04, 150);
    }
  } catch { /* Sound is optional when the browser blocks audio. */ }
}
