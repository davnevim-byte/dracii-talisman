// src/game/worldManager.js
// Správce světa — počasí, čas, globální události, přechody zón

import { ref, update, set, get } from 'firebase/database';
import { db } from '../firebase';
import { addLog, updatePlayerStats } from './gameState';
import { getNextWeather, getTimeOfDay, advanceHour,
         GLOBAL_EVENTS, ZONE_ENTRY_REQUIREMENTS } from '../data/mapData';
import { getLevel } from '../data/heroTree';

// ── Aktualizace světa každý tah ───────────────────────────────────────────────

export async function advanceWorldState(gameId, game) {
  const newHour    = advanceHour(game.hourOfDay || 8);
  const timeObj    = getTimeOfDay(newHour);
  const newWeather = Math.random() < 0.15
    ? getNextWeather(game.weather || 'sunny', 1)
    : game.weather || 'sunny';

  await update(ref(db, `games/${gameId}`), {
    hourOfDay:  newHour,
    timeOfDay:  timeObj.id,
    weather:    newWeather,
    updatedAt:  Date.now(),
  });

  // Log změn
  if (newWeather !== game.weather) {
    const WEATHER_NAMES = { sunny:'☀️ Slunečno', cloudy:'⛅ Zataženo', rain:'🌧️ Déšť',
      storm:'⛈️ Bouře', fog:'🌫️ Mlha', snow:'❄️ Sněžení', heatwave:'🔆 Vedro' };
    await addLog(gameId, `Počasí se změnilo: ${WEATHER_NAMES[newWeather] || newWeather}`, 'ev');
  }

  if (newHour === 21) await addLog(gameId, '🌙 Padá noc — příšery sílí!', 'ev');
  if (newHour === 5)  await addLog(gameId, '🌄 Svítá — nový den.', 'ev');

  return { newHour, newWeather, timeObj };
}

// ── Globální události ─────────────────────────────────────────────────────────

export async function checkGlobalEvents(gameId, turn, players) {
  for (const event of GLOBAL_EVENTS) {
    if (turn % event.trigger.everyTurns === 0) {
      await addLog(gameId, `🌍 GLOBÁLNÍ UDÁLOST: ${event.emoji} ${event.name} — ${event.desc}`, 'ev');
      await applyGlobalEvent(gameId, event, players);
    }
  }
}

async function applyGlobalEvent(gameId, event, players) {
  const eff = event.effect || {};

  if (eff.allPlayers) {
    for (const player of players) {
      const updates = {};
      Object.entries(eff.allPlayers).forEach(([key, val]) => {
        updates[key] = Math.max(0, (player.stats[key] || 0) + val);
      });
      if (Object.keys(updates).length > 0) {
        await updatePlayerStats(gameId, player.id, updates);
      }
    }
  }

  if (eff.zone && eff.allPlayers) {
    const zonePlayers = players.filter(p => (p.zone || 1) === eff.zone);
    for (const player of zonePlayers) {
      const updates = {};
      Object.entries(eff.allPlayers).forEach(([key, val]) => {
        updates[key] = Math.max(0, (player.stats[key] || 0) + val);
      });
      await updatePlayerStats(gameId, player.id, updates);
    }
  }

  // Ulož aktivní globální efekt do stavu hry
  if (eff.duration) {
    await set(ref(db, `games/${gameId}/activeGlobalEvent`), {
      ...event,
      turnsLeft: eff.duration,
    });
  }
}

// Sníž duration globálního efektu
export async function tickGlobalEvent(gameId, game) {
  const ev = game.activeGlobalEvent;
  if (!ev) return;
  const remaining = (ev.turnsLeft || 1) - 1;
  if (remaining <= 0) {
    await set(ref(db, `games/${gameId}/activeGlobalEvent`), null);
    await addLog(gameId, `Globální efekt ${ev.emoji} ${ev.name} skončil.`, 'info');
  } else {
    await update(ref(db, `games/${gameId}/activeGlobalEvent`), { turnsLeft: remaining });
  }
}

// ── Přechod zóny ──────────────────────────────────────────────────────────────

export function canEnterZone(targetZone, playerStats, currentZone) {
  if (targetZone <= currentZone) return { ok: true }; // zpět lze vždy
  const req = ZONE_ENTRY_REQUIREMENTS[targetZone];
  if (!req) return { ok: true };

  const level = getLevel(playerStats.xp || 0);
  if (level < req.level) {
    return { ok: false, reason: `Potřebuješ level ${req.level} (máš ${level})` };
  }
  if ((playerStats.trophies || 0) < req.trophies) {
    return { ok: false, reason: `Potřebuješ ${req.trophies} trofejí (máš ${playerStats.trophies || 0})` };
  }
  return { ok: true };
}

export async function enterZone(gameId, playerId, targetZone, playerStats) {
  await update(ref(db, `games/${gameId}/players/${playerId}`), {
    zone:     targetZone,
    position: 0,
  });
  await addLog(gameId,
    `⚡ Hráč vstoupil do Zóny ${targetZone}!`,
    'turn'
  );
}

// ── Aplikuj efekty počasí na pohyb ───────────────────────────────────────────

export function getEffectiveMove(baseMove, weather, timeOfDay, zone) {
  const WEATHER_MAP = { sunny:0, cloudy:0, rain:-1, storm:-2, fog:0, snow:-1, heatwave:-1 };
  const TIME_MAP    = { dawn:1, morning:1, day:0, evening:0, night:-1 };
  const weatherMod  = WEATHER_MAP[weather]    || 0;
  const timeMod     = TIME_MAP[timeOfDay]      || 0;
  return Math.max(1, baseMove + weatherMod + timeMod);
}

// ── Aplikuj noční bonus příšerám ──────────────────────────────────────────────

export function getEnemyStrBonus(timeOfDay, weather, zone) {
  const TIME_BONUS = { dawn:-1, morning:-1, day:0, evening:1, night:2 };
  const timeMod  = TIME_BONUS[timeOfDay] || 0;
  const stormMod = weather === 'storm' ? 1 : 0;
  return timeMod + stormMod;
}

// ── Chlad ze sněhu ────────────────────────────────────────────────────────────

export async function applyWeatherDamage(gameId, players, weather) {
  if (weather !== 'snow') return;
  for (const player of players) {
    if ((player.stats.life || 0) > 1) {
      await updatePlayerStats(gameId, player.id, { life: (player.stats.life || 1) - 1 });
      await addLog(gameId, `❄️ ${player.name} trpí zimou (-1 ŽP).`, 'bad');
    }
  }
}

// ── Regenerace many v klášteře / meditace ────────────────────────────────────

export async function applyFactionPassives(gameId, players) {
  for (const player of players) {
    const faction = player.character?.faction;
    if (faction === 'Klášter') {
      // +1 mana za tah
      const newMana = Math.min(player.stats.maxMana || 4, (player.stats.mana || 0) + 1);
      if (newMana > player.stats.mana) {
        await updatePlayerStats(gameId, player.id, { mana: newMana });
      }
    }
    if (faction === 'Cechy') {
      // +1 zlato za tah
      await updatePlayerStats(gameId, player.id, { gold: (player.stats.gold || 0) + 1 });
    }
  }
}

// ── Výpočet pořadí tahů ───────────────────────────────────────────────────────

export function determineInitiative(player, weather, timeOfDay) {
  const timeMod    = timeOfDay === 'night' ? -1 : timeOfDay === 'morning' ? 1 : 0;
  const weatherMod = weather === 'storm' ? -1 : 0;
  const base       = Math.floor(Math.random() * 6) + 1;
  return base + (player.stats.fate || 0) + timeMod + weatherMod;
}
