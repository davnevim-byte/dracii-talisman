// src/game/progression.js
// Level up, XP, upgrade triggery, frakční bonusy

import { getLevel, xpToNextLevel, XP_TABLE } from '../data/heroTree';
import { updatePlayerStats, addLog } from './gameState';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase';

// ── Level up check ────────────────────────────────────────────────────────────
// Zavolej pokaždé po přidání XP
export async function checkLevelUp(gameId, playerId, oldXp, newXp, playerStats) {
  const oldLevel = getLevel(oldXp);
  const newLevel = getLevel(newXp);

  if (newLevel > oldLevel) {
    // Level up!
    const bonuses = getLevelUpBonus(newLevel);
    const updatedStats = {
      ...playerStats,
      level: newLevel,
      life: Math.min(playerStats.maxLife + bonuses.life, playerStats.maxLife + bonuses.life),
      maxLife: playerStats.maxLife + bonuses.life,
      mana: Math.min(playerStats.maxMana + bonuses.mana, playerStats.maxMana + bonuses.mana),
      maxMana: playerStats.maxMana + bonuses.mana,
      ...bonuses.statIncrease,
    };

    await updatePlayerStats(gameId, playerId, updatedStats);
    await addLog(gameId,
      `⬆️ Level up! Level ${newLevel} dosažen! +${bonuses.life} MaxŽP, +${bonuses.mana} MaxMana`,
      'ok'
    );

    // Označ že upgrade je dostupný (level 5+)
    if (newLevel >= 5) {
      await set(ref(db, `games/${gameId}/players/${playerId}/upgradeAvailable`), true);
      await addLog(gameId, `✨ Upgrade třídy je nyní dostupný! Zkontroluj svou kartu postavy.`, 'ok');
    }

    return { leveledUp: true, newLevel, bonuses };
  }
  return { leveledUp: false };
}

// Bonusy za level up
function getLevelUpBonus(level) {
  const base = { life: 1, mana: 1, statIncrease: {} };
  // Každý 2. level = +1 Síla nebo Dovednost (střídavě)
  if (level % 2 === 0) base.statIncrease.str = 1;
  // Každý 3. level = +1 Osud
  if (level % 3 === 0) base.statIncrease.fate = 1;
  // Level 5, 8, 10 = větší bonusy
  if (level === 5)  { base.life = 2; base.mana = 2; }
  if (level === 8)  { base.life = 2; base.mana = 2; base.statIncrease.defense = 1; }
  if (level === 10) { base.life = 3; base.mana = 3; }
  return base;
}

// ── Frakční bonusy ────────────────────────────────────────────────────────────
// Aplikuj při startu hry nebo změně zóny

export function getFactionBonus(faction, zone) {
  const bonuses = {
    'Království':     zone <= 2 ? { defense: 2 } : {},
    'Akademie':       { mana: 2 },
    'Les':            { tamBonus: 2 },  // bonus k ochočení
    'Hory':           { str: 1 },
    'Divoká příroda': { trapBonus: 2 }, // bonus k pastím
    'Volná města':    { fate: 1 },
    'Klášter':        { manaRegen: 1 }, // mana regen za tah
    'Cechy':          { goldPerLoc: 1 },// zlato za lokaci
  };
  return bonuses[faction] || {};
}

// ── Reputační systém ──────────────────────────────────────────────────────────

export const REPUTATION_LABELS = [
  { min: 8,  max: 10, label: 'Světec',    emoji: '😇', color: '#f0f080' },
  { min: 5,  max: 7,  label: 'Hrdina',    emoji: '✨', color: '#4caf50' },
  { min: 2,  max: 4,  label: 'Dobrý',     emoji: '😊', color: '#8bc34a' },
  { min: -1, max: 1,  label: 'Neutrální', emoji: '😐', color: '#9a9a9a' },
  { min: -4, max: -2, label: 'Podezřelý', emoji: '😒', color: '#ff9800' },
  { min: -7, max: -5, label: 'Zlý',       emoji: '😠', color: '#e05050' },
  { min: -10,max: -8, label: 'Démon',     emoji: '😈', color: '#8b0000' },
];

export function getReputationLabel(rep) {
  return REPUTATION_LABELS.find(r => rep >= r.min && rep <= r.max)
    || { label: 'Neutrální', emoji: '😐', color: '#9a9a9a' };
}

// Co se mění podle reputace
export function getReputationEffects(rep) {
  return {
    canTameGood:   rep >= 5,    // ochočení dobrých zvířat
    canTameNeutral:rep >= -4,   // ochočení neutrálních
    canTameEvil:   rep <= -5,   // ochočení zlých tvorů
    shopDiscount:  rep >= 7 ? 1 : 0,   // sleva v obchodě
    shopPenalty:   rep <= -7 ? 1 : 0,  // přirážka v obchodě
    npcFriendly:   rep >= 3,    // NPC ochotní pomoci
    npcHostile:    rep <= -6,   // NPC nepřátelští
  };
}

// ── Výpočet celkových statistik ───────────────────────────────────────────────
// Základ + předměty + frakce + efekty

export function computeEffectiveStats(baseStats, inventory, faction, zone, statusEffects = []) {
  let s = { ...baseStats };

  // Předměty (pasivní)
  (inventory || []).forEach(item => {
    if (item.type === 'passive' && item.bonus && item.val) {
      s[item.bonus] = (s[item.bonus] || 0) + item.val;
    }
  });

  // Frakce
  const fb = getFactionBonus(faction, zone);
  Object.entries(fb).forEach(([key, val]) => {
    if (typeof val === 'number') s[key] = (s[key] || 0) + val;
  });

  // Status efekty (jed, buff, debuff...)
  (statusEffects || []).forEach(eff => {
    if (eff.stat && eff.val) s[eff.stat] = (s[eff.stat] || 0) + eff.val;
  });

  // Minimální hodnoty
  s.str     = Math.max(1, s.str     || 1);
  s.skill   = Math.max(1, s.skill   || 1);
  s.defense = Math.max(0, s.defense || 0);
  s.life    = Math.max(0, s.life    || 0);
  s.mana    = Math.max(0, s.mana    || 0);

  return s;
}

// ── Status efekty ─────────────────────────────────────────────────────────────

export const STATUS_EFFECTS = {
  poison:   { id:'poison',   name:'Otrava',     emoji:'☠️',  stat:'life',    val:-1, duration:3, desc:'Ztrácíš 1 ŽP každý tah.' },
  freeze:   { id:'freeze',   name:'Zmražení',   emoji:'❄️',  stat:'move',    val:-2, duration:1, desc:'-2 Pohyb, nemůžeš použít schopnosti.' },
  bleed:    { id:'bleed',    name:'Krvácení',   emoji:'🩸',  stat:'life',    val:-1, duration:2, desc:'Ztrácíš 1 ŽP každý tah.' },
  inspired: { id:'inspired', name:'Inspirován', emoji:'✨',  stat:'str',     val:2,  duration:2, desc:'+2 Síla na 2 tahy.' },
  cursed:   { id:'cursed',   name:'Prokletý',   emoji:'💜',  stat:'fate',    val:-2, duration:3, desc:'-2 Osud na 3 tahy.' },
  blessed:  { id:'blessed',  name:'Požehnaný',  emoji:'🌟',  stat:'fate',    val:2,  duration:2, desc:'+2 Osud na 2 tahy.' },
  stunned:  { id:'stunned',  name:'Omráčený',   emoji:'💫',  stat:'defense', val:-3, duration:1, desc:'-3 Obrana na 1 tah.' },
  enraged:  { id:'enraged',  name:'Rozzuřený',  emoji:'🔥',  stat:'str',     val:3,  duration:2, desc:'+3 Síla, ale -2 Obrana.' },
};

// Zpracuj status efekty na začátku tahu
export async function processStatusEffects(gameId, playerId, player) {
  const effects = player.statusEffects || [];
  if (effects.length === 0) return;

  const newEffects = [];
  let lifeChange = 0;

  for (const eff of effects) {
    // Aplikuj efekt
    if (eff.stat === 'life') lifeChange += eff.val;

    // Sníž duration
    const remaining = (eff.turnsLeft || eff.duration) - 1;
    if (remaining > 0) {
      newEffects.push({ ...eff, turnsLeft: remaining });
    } else {
      await addLog(gameId, `${eff.emoji} ${eff.name} pominul.`, 'info');
    }
  }

  // Ulož nové efekty a změnu životů
  if (lifeChange !== 0) {
    const newLife = Math.max(0, (player.stats.life || 0) + lifeChange);
    await updatePlayerStats(gameId, playerId, { life: newLife });
    if (lifeChange < 0) {
      await addLog(gameId, `☠️ Status efekt způsobil ${Math.abs(lifeChange)} poškození.`, 'bad');
    }
  }

  await set(ref(db, `games/${gameId}/players/${playerId}/statusEffects`), newEffects);
}
