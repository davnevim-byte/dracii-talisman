// src/game/soundEngine.js
// Zvukový systém — Web Audio API, žádné externí soubory

let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── Základní tón ──────────────────────────────────────────────────────────────

function playTone({ freq = 440, type = 'sine', duration = 0.2, volume = 0.3,
                    attack = 0.01, decay = 0.1, delay = 0 }) {
  try {
    const ctx  = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch {}
}

function playNoise({ duration = 0.1, volume = 0.15, delay = 0 }) {
  try {
    const ctx        = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    const gain   = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type      = 'bandpass';
    filter.frequency.value = 800;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    source.start(ctx.currentTime + delay);
    source.stop(ctx.currentTime + delay + duration + 0.05);
  } catch {}
}

// ── HERNÍ ZVUKY ───────────────────────────────────────────────────────────────

export const SFX = {

  // 🎲 Hod kostkou
  dice() {
    [0, 0.05, 0.1, 0.15].forEach((d, i) => {
      playNoise({ duration: 0.06, volume: 0.12, delay: d });
    });
    playTone({ freq: 320, type: 'triangle', duration: 0.15, volume: 0.2, delay: 0.1 });
  },

  // ⚔️ Útok / zásah
  hit() {
    playNoise({ duration: 0.08, volume: 0.25 });
    playTone({ freq: 180, type: 'sawtooth', duration: 0.12, volume: 0.15, delay: 0.03 });
  },

  // ✅ Výhra v souboji
  win() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((f, i) => {
      playTone({ freq: f, type: 'sine', duration: 0.15, volume: 0.25, delay: i * 0.12 });
    });
  },

  // 💔 Prohra / zranění
  damage() {
    playTone({ freq: 200, type: 'sawtooth', duration: 0.3, volume: 0.3 });
    playTone({ freq: 150, type: 'sawtooth', duration: 0.2, volume: 0.2, delay: 0.1 });
  },

  // ⬆️ Level up
  levelUp() {
    const notes = [262, 330, 392, 523, 659, 784];
    notes.forEach((f, i) => {
      playTone({ freq: f, type: 'sine', duration: 0.18, volume: 0.3, delay: i * 0.1 });
    });
    playTone({ freq: 1047, type: 'sine', duration: 0.4, volume: 0.35, delay: 0.6 });
  },

  // 🪙 Získání zlata
  gold() {
    playTone({ freq: 880, type: 'sine', duration: 0.08, volume: 0.2 });
    playTone({ freq: 1100, type: 'sine', duration: 0.1, volume: 0.25, delay: 0.06 });
    playTone({ freq: 1320, type: 'sine', duration: 0.15, volume: 0.2, delay: 0.12 });
  },

  // 🐾 Ochočení peta
  tame() {
    const notes = [330, 415, 523, 659];
    notes.forEach((f, i) => {
      playTone({ freq: f, type: 'sine', duration: 0.2, volume: 0.22, delay: i * 0.15 });
    });
    playTone({ freq: 880, type: 'sine', duration: 0.3, volume: 0.2, delay: 0.65 });
  },

  // 🃏 Táhnutí karty
  cardDraw() {
    playNoise({ duration: 0.05, volume: 0.1 });
    playTone({ freq: 600, type: 'sine', duration: 0.08, volume: 0.12, delay: 0.03 });
  },

  // 🔮 Použití schopnosti / magie
  magic() {
    [440, 554, 659, 880].forEach((f, i) => {
      playTone({ freq: f, type: 'sine', duration: 0.12, volume: 0.18, delay: i * 0.06 });
    });
    playNoise({ duration: 0.15, volume: 0.08, delay: 0.2 });
  },

  // 🍺 Vstup do hospody / bezpečného místa
  safe() {
    playTone({ freq: 392, type: 'sine', duration: 0.15, volume: 0.15 });
    playTone({ freq: 494, type: 'sine', duration: 0.15, volume: 0.15, delay: 0.12 });
    playTone({ freq: 523, type: 'sine', duration: 0.25, volume: 0.2,  delay: 0.24 });
  },

  // 💀 Smrt postavy
  death() {
    [300, 260, 220, 180].forEach((f, i) => {
      playTone({ freq: f, type: 'sawtooth', duration: 0.25, volume: 0.2, delay: i * 0.2 });
    });
  },

  // 👑 Pan Zla přichází
  darkLord() {
    [110, 98, 87, 73].forEach((f, i) => {
      playTone({ freq: f, type: 'sawtooth', duration: 0.4, volume: 0.3, delay: i * 0.3 });
      playTone({ freq: f * 3, type: 'sine', duration: 0.3, volume: 0.1, delay: i * 0.3 });
    });
  },

  // 🎉 Výhra hry (finální)
  victory() {
    const fanfare = [
      { f:523, d:0 }, { f:659, d:0.12 }, { f:784, d:0.24 },
      { f:1047, d:0.36 }, { f:784, d:0.54 }, { f:1047, d:0.66 },
    ];
    fanfare.forEach(n => playTone({ freq: n.f, type: 'sine', duration: 0.22, volume: 0.3, delay: n.d }));
    [0, 0.1, 0.2].forEach(d => playNoise({ duration: 0.15, volume: 0.1, delay: 1 + d }));
  },

  // 💬 Chat zpráva
  chat() {
    playTone({ freq: 880, type: 'sine', duration: 0.06, volume: 0.12 });
    playTone({ freq: 1100, type: 'sine', duration: 0.06, volume: 0.1, delay: 0.05 });
  },

  // ⚔️ PvP výzva
  pvpChallenge() {
    playTone({ freq: 220, type: 'sawtooth', duration: 0.15, volume: 0.25 });
    playTone({ freq: 330, type: 'sawtooth', duration: 0.15, volume: 0.25, delay: 0.15 });
    playNoise({ duration: 0.1, volume: 0.2, delay: 0.3 });
  },

  // 🔔 Oznámení / upozornění
  notify() {
    playTone({ freq: 880, type: 'sine', duration: 0.1, volume: 0.2 });
    playTone({ freq: 1100, type: 'sine', duration: 0.15, volume: 0.2, delay: 0.1 });
  },

  // 🗺️ Pohyb po mapě
  move() {
    playTone({ freq: 440, type: 'sine', duration: 0.06, volume: 0.1 });
    playTone({ freq: 494, type: 'sine', duration: 0.06, volume: 0.1, delay: 0.05 });
  },
};

// ── Správa hlasitosti ─────────────────────────────────────────────────────────

let masterVolume = 0.7;
let sfxEnabled   = true;

export function setVolume(v) { masterVolume = Math.max(0, Math.min(1, v)); }
export function toggleSfx(v) { sfxEnabled = v !== undefined ? v : !sfxEnabled; }
export function isSfxEnabled() { return sfxEnabled; }

// Wrapper s kontrolou volume
export function play(name) {
  if (!sfxEnabled) return;
  const fn = SFX[name];
  if (fn) fn();
}

// ── Ambientní atmosféra ───────────────────────────────────────────────────────

let ambientInterval = null;

export function startAmbient(locationType) {
  stopAmbient();
  // Jemný opakující se pulz pro atmosféru
  if (locationType === 'dangerous') {
    ambientInterval = setInterval(() => {
      if (!sfxEnabled) return;
      playTone({ freq: 60 + Math.random() * 20, type: 'sine', duration: 1.5, volume: 0.03 });
    }, 4000);
  }
}

export function stopAmbient() {
  if (ambientInterval) { clearInterval(ambientInterval); ambientInterval = null; }
}
