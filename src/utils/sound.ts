// Web Audio API Synthesizer for instant, zero-asset, kid-friendly sound effects on iPad

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Ensure audio context is ready on first user touch/tap on iPad
export function unlockAudio(): void {
  getAudioContext();
}

// 1. Playful "Pop" (when toggling a chore or button)
export function playPopSound(soundEnabled = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

// 2. Cheerful Coin / Star Chime (when earning a star)
export function playStarChime(soundEnabled = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [587.33, 880, 1174.66]; // D5, A5, D6 arpeggio

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.07);

    gain.gain.setValueAtTime(0, now + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.25, now + i * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.07);
    osc.stop(now + i * 0.07 + 0.35);
  });
}

// 3. Victory / Celebration Fanfare (when completing a whole routine)
export function playFanfare(soundEnabled = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5, E5, G5, C6 triumphant chords
  const melody = [
    { freq: 523.25, time: 0, dur: 0.12 },
    { freq: 659.25, time: 0.12, dur: 0.12 },
    { freq: 783.99, time: 0.24, dur: 0.12 },
    { freq: 1046.5, time: 0.36, dur: 0.4 },
  ];

  melody.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now + note.time);

    gain.gain.setValueAtTime(0.25, now + note.time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + note.dur);
  });
}

// 4. Cute Pet Squeak / Purr (when tapping or feeding pet)
export function playPetSqueak(soundEnabled = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const now = ctx.currentTime;

  osc.frequency.setValueAtTime(600, now);
  osc.frequency.linearRampToValueAtTime(950, now + 0.08);
  osc.frequency.linearRampToValueAtTime(1200, now + 0.15);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.18);
}

// 5. Reward Purchase Fanfare (sparkly magical sound)
export function playRewardPurchaseSound(soundEnabled = true): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 554.37, 659.25, 830.61, 880, 1108.73];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    gain.gain.setValueAtTime(0.2, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.25);
  });
}
