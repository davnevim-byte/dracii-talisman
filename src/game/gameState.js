// src/game/gameState.js
// Veškerá komunikace s Firebase — čtení a zápis stavu hry

import { db } from '../firebase';
import {
  ref, set, get, update, onValue, push, serverTimestamp, off
} from 'firebase/database';

// ── ID generátory ─────────────────────────────────────────────────────────────

export function generateGameId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function generatePlayerId() {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

// ── Výchozí stav hry ──────────────────────────────────────────────────────────

export function defaultGameState(gameId, hostId) {
  return {
    id: gameId,
    hostId,
    status: 'lobby',       // lobby | playing | finished
    mode: null,            // coop | pvp
    turn: 0,
    currentPlayerId: null,
    phase: 'roll',         // roll | draw | combat | done
    weather: 'sunny',
    timeOfDay: 'morning',  // morning | day | evening | night
    hourOfDay: 6,
    log: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function defaultPlayerState(playerId, name, character, isHost) {
  return {
    id: playerId,
    name,
    character,
    isHost,
    connected: true,
    ready: false,
    position: 0,
    zone: 1,
    stats: {
      str:     character.stats.str,
      skill:   character.stats.skill,
      life:    character.stats.life,
      maxLife: character.stats.life,
      fate:    character.stats.fate,
      gold:    character.stats.gold,
      mana:    character.stats.mana,
      maxMana: character.stats.mana,
      move:    character.stats.move,
      defense: character.stats.defense,
      xp:      0,
      level:   1,
      trophies: 0,
      reputation: character.reputation ?? 0,
    },
    inventory: [],
    pet: null,
    abilities: character.abilities || [],
    statusEffects: [],
    joinedAt: serverTimestamp(),
  };
}

// ── Firebase operace ──────────────────────────────────────────────────────────

// Vytvoří novou hru
export async function createGame(hostId, hostName, character) {
  const gameId = generateGameId();
  const gameRef = ref(db, `games/${gameId}`);
  const state   = defaultGameState(gameId, hostId);
  const player  = defaultPlayerState(hostId, hostName, character, true);

  await set(gameRef, {
    ...state,
    players: { [hostId]: player },
  });

  return gameId;
}

// Připojí hráče ke hře
export async function joinGame(gameId, playerId, playerName, character) {
  const gameRef   = ref(db, `games/${gameId}`);
  const snapshot  = await get(gameRef);

  if (!snapshot.exists()) throw new Error('Hra nenalezena');

  const game = snapshot.val();
  if (game.status !== 'lobby') throw new Error('Hra již začala');

  const playerCount = Object.keys(game.players || {}).length;
  if (playerCount >= 6) throw new Error('Hra je plná (max 6 hráčů)');

  const player = defaultPlayerState(playerId, playerName, character, false);
  await update(ref(db, `games/${gameId}/players/${playerId}`), player);
  return game;
}

// Nastaví hráče jako připraveného
export async function setPlayerReady(gameId, playerId, ready = true) {
  await update(ref(db, `games/${gameId}/players/${playerId}`), { ready });
}

// Spustí hru (jen host)
export async function startGame(gameId, mode) {
  const snap    = await get(ref(db, `games/${gameId}/players`));
  const players = snap.val() || {};
  const ids     = Object.keys(players);
  const firstId = ids[Math.floor(Math.random() * ids.length)];

  await update(ref(db, `games/${gameId}`), {
    status: 'playing',
    mode,
    turn: 1,
    currentPlayerId: firstId,
    phase: 'roll',
    updatedAt: serverTimestamp(),
  });
}

// Aktualizuje statistiky hráče
export async function updatePlayerStats(gameId, playerId, statUpdates) {
  await update(ref(db, `games/${gameId}/players/${playerId}/stats`), statUpdates);
  await update(ref(db, `games/${gameId}`), { updatedAt: serverTimestamp() });
}

// Aktualizuje pozici hráče
export async function updatePlayerPosition(gameId, playerId, position, zone) {
  await update(ref(db, `games/${gameId}/players/${playerId}`), { position, zone });
}

// Přidá předmět do inventáře
export async function addItemToInventory(gameId, playerId, item) {
  const invRef  = ref(db, `games/${gameId}/players/${playerId}/inventory`);
  const snap    = await get(invRef);
  const current = snap.val() || [];
  await set(invRef, [...current, { ...item, id: Date.now() }]);
}

// Nastaví fázi kola
export async function setPhase(gameId, phase) {
  await update(ref(db, `games/${gameId}`), { phase, updatedAt: serverTimestamp() });
}

// Posune tah na dalšího hráče
export async function nextTurn(gameId) {
  const snap    = await get(ref(db, `games/${gameId}`));
  const game    = snap.val();
  const players = Object.keys(game.players || {});
  const idx     = players.indexOf(game.currentPlayerId);
  const nextIdx = (idx + 1) % players.length;

  // Aktualizuj čas (1 tah = 1 hodina)
  let hour = (game.hourOfDay || 6) + 1;
  let timeOfDay = game.timeOfDay;
  if (hour >= 24) hour = 0;
  if (hour >= 6  && hour < 12) timeOfDay = 'morning';
  if (hour >= 12 && hour < 18) timeOfDay = 'day';
  if (hour >= 18 && hour < 22) timeOfDay = 'evening';
  if (hour >= 22 || hour < 6)  timeOfDay = 'night';

  // Náhodné počasí (občas se změní)
  const weathers = ['sunny','sunny','sunny','rain','storm','fog','snow'];
  const weather  = Math.random() < 0.15
    ? weathers[Math.floor(Math.random() * weathers.length)]
    : game.weather;

  await update(ref(db, `games/${gameId}`), {
    currentPlayerId: players[nextIdx],
    turn: game.turn + 1,
    phase: 'roll',
    hourOfDay: hour,
    timeOfDay,
    weather,
    updatedAt: serverTimestamp(),
  });
}

// Přidá zprávu do logu
export async function addLog(gameId, msg, type = 'info') {
  const logRef = ref(db, `games/${gameId}/log`);
  const snap   = await get(logRef);
  const current = snap.val() || [];
  const entry  = { msg, type, ts: Date.now() };
  // Uchováme max 80 zpráv
  const next = [...current, entry].slice(-80);
  await set(logRef, next);
}

// ── Listeners ─────────────────────────────────────────────────────────────────

// Naslouchá celé hře v reálném čase
export function listenGame(gameId, callback) {
  const r = ref(db, `games/${gameId}`);
  onValue(r, snap => callback(snap.val()));
  return () => off(r);
}

// Naslouchá jen jednomu hráči
export function listenPlayer(gameId, playerId, callback) {
  const r = ref(db, `games/${gameId}/players/${playerId}`);
  onValue(r, snap => callback(snap.val()));
  return () => off(r);
}

// Nastaví připojení hráče
export async function setConnected(gameId, playerId, connected) {
  await update(ref(db, `games/${gameId}/players/${playerId}`), { connected });
}
