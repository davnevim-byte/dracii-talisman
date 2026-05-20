// src/game/achievements.js
// Achievementy — odznaky a milníky

export const ACHIEVEMENTS = [
  // ── Souboj ──────────────────────────────────────────────────────────────
  { id:'first_kill',     emoji:'⚔️',  name:'První krev',       desc:'Poraz svou první příšeru.',                    condition: s => s.trophies >= 1 },
  { id:'veteran',        emoji:'🗡️',  name:'Veterán',           desc:'Poraz 10 příšer.',                             condition: s => s.trophies >= 10 },
  { id:'champion',       emoji:'🏆',  name:'Šampion',           desc:'Poraz 25 příšer.',                             condition: s => s.trophies >= 25 },
  { id:'legend',         emoji:'👑',  name:'Legenda',           desc:'Poraz 50 příšer.',                             condition: s => s.trophies >= 50 },
  { id:'dark_lord_slayer',emoji:'💀', name:'Vrah Pána Zla',     desc:'Poraz samotného Pána Zla.',                    condition: s => s.darkLordDefeated },

  // ── Postava ──────────────────────────────────────────────────────────────
  { id:'level5',         emoji:'⬆️',  name:'Zkušený hrdina',    desc:'Dosáhni levelu 5.',                            condition: s => (s.level || 1) >= 5 },
  { id:'level10',        emoji:'🌟',  name:'Mistr',             desc:'Dosáhni levelu 10.',                           condition: s => (s.level || 1) >= 10 },
  { id:'upgraded',       emoji:'🦸',  name:'Proměna',           desc:'Proveď upgrade třídy.',                        condition: s => !!s.upgradePath },
  { id:'wealthy',        emoji:'💰',  name:'Boháč',             desc:'Nahromadi 20 zlatých.',                        condition: s => s.gold >= 20 },
  { id:'pacifist',       emoji:'☮️',  name:'Pacifista',         desc:'Dostaň se do Zóny 3 bez PvP souboje.',         condition: s => s.zone >= 3 && !s.pvpFought },

  // ── Peti ────────────────────────────────────────────────────────────────
  { id:'first_pet',      emoji:'🐾',  name:'Ochočovatel',       desc:'Ochočuj svého prvního společníka.',            condition: s => !!s.firstPet },
  { id:'rare_pet',       emoji:'🦁',  name:'Vzácný nález',      desc:'Ochočuj vzácného tvora (gryf nebo liška).',    condition: s => ['griffin','fox_spirit'].includes(s.petId) },
  { id:'pet_survivor',   emoji:'🛡️',  name:'Chránit a sloužit', desc:'Pet přežil 5 soubojů.',                       condition: s => s.petSurvivedFights >= 5 },

  // ── Průzkum ──────────────────────────────────────────────────────────────
  { id:'zone3',          emoji:'🌋',  name:'Odvážný průzkumník',desc:'Dosáhni Zóny 3.',                              condition: s => s.zone >= 3 },
  { id:'zone5',          emoji:'🏰',  name:'U bran pekla',      desc:'Dosáhni Zóny 5 — Citadely.',                  condition: s => s.zone >= 5 },
  { id:'safe_player',    emoji:'🍺',  name:'Hostinský host',    desc:'Navštiv hospodu 5×.',                          condition: s => s.tavernVisits >= 5 },
  { id:'holy_pilgrim',   emoji:'⛪',  name:'Poutník',           desc:'Navštiv 3 různé chrámy.',                      condition: s => s.templeVisits >= 3 },

  // ── Multiplayer ──────────────────────────────────────────────────────────
  { id:'first_pvp',      emoji:'⚔️',  name:'Soupeř',            desc:'Sveď svůj první PvP souboj.',                 condition: s => s.pvpFights >= 1 },
  { id:'pvp_champion',   emoji:'🥊',  name:'Arena mistr',       desc:'Vyhraj 5 PvP soubojů.',                       condition: s => s.pvpWins >= 5 },
  { id:'thief',          emoji:'🥷',  name:'Zloděj',            desc:'Ukradni předmět v PvP.',                      condition: s => s.stolenItems >= 1 },
  { id:'diplomat',       emoji:'🤝',  name:'Diplomat',          desc:'Uzavři alianci s jiným hráčem.',              condition: s => s.alliancesFormed >= 1 },
  { id:'trader',         emoji:'🛒',  name:'Obchodník',         desc:'Dokončí 3 obchody s jinými hráči.',            condition: s => s.tradesCompleted >= 3 },

  // ── Speciální ────────────────────────────────────────────────────────────
  { id:'survivor',       emoji:'💪',  name:'Nezlomný',          desc:'Přežij souboj s 1 životem.',                  condition: s => s.survivedOnOne },
  { id:'lucky',          emoji:'⭐',  name:'Šťastlivec',        desc:'Vyhraj 3 souboje za sebou.',                  condition: s => s.winStreak >= 3 },
  { id:'unlucky',        emoji:'💜',  name:'Prokletý',          desc:'Prohraj 3 souboje za sebou.',                  condition: s => s.loseStreak >= 3 },
  { id:'night_owl',      emoji:'🌙',  name:'Noční tvor',        desc:'Vyhraj 5 soubojů v noci.',                    condition: s => s.nightWins >= 5 },
  { id:'weather_warrior',emoji:'⛈️',  name:'Bouřkový válečník', desc:'Vyhraj souboj v bouři.',                      condition: s => s.stormWin },
  { id:'full_health',    emoji:'❤️',  name:'Nesmrtelný',        desc:'Dokonči kolo s plnými životy 10×.',           condition: s => s.fullHealthRounds >= 10 },
  { id:'mana_master',    emoji:'💧',  name:'Arcimág',           desc:'Použij 20 many v soubojích.',                 condition: s => s.manaSpent >= 20 },
];

// ── Správa achievementů ───────────────────────────────────────────────────────

export function checkAchievements(playerStats, existingAchievements = []) {
  const unlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (existingAchievements.includes(ach.id)) continue;
    try {
      if (ach.condition(playerStats)) unlocked.push(ach.id);
    } catch {}
  }
  return unlocked;
}

export function getAchievement(id) {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
}

export function getAchievementProgress(playerStats, existingAchievements = []) {
  const total   = ACHIEVEMENTS.length;
  const earned  = existingAchievements.length;
  const percent = Math.round((earned / total) * 100);
  return { total, earned, percent };
}

// ── Herní statistiky pro achivementy ─────────────────────────────────────────
// Tyhle se udržují v player.achievStats

export function buildAchievStats(player, game) {
  const s   = player.stats   || {};
  const pet = player.pet;
  return {
    trophies:         s.trophies      || 0,
    level:            s.level         || 1,
    gold:             s.gold          || 0,
    zone:             player.zone     || 1,
    upgradePath:      player.upgradePath,
    firstPet:         player.firstPet,
    petId:            pet?.id,
    petSurvivedFights:player.petSurvivedFights || 0,
    tavernVisits:     player.tavernVisits      || 0,
    templeVisits:     player.templeVisits      || 0,
    pvpFights:        player.pvpFights         || 0,
    pvpWins:          player.pvpWins           || 0,
    pvpFought:        (player.pvpFights        || 0) > 0,
    stolenItems:      player.stolenItems       || 0,
    alliancesFormed:  player.alliancesFormed   || 0,
    tradesCompleted:  player.tradesCompleted   || 0,
    survivedOnOne:    player.survivedOnOne     || false,
    winStreak:        player.winStreak         || 0,
    loseStreak:       player.loseStreak        || 0,
    nightWins:        player.nightWins         || 0,
    stormWin:         player.stormWin          || false,
    fullHealthRounds: player.fullHealthRounds  || 0,
    manaSpent:        player.manaSpent         || 0,
    darkLordDefeated: game?.darkLordDefeated   || false,
  };
}
