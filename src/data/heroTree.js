// src/data/heroTree.js
// Strom hrdinů — upgrade z základní třídy do 2. a 3. formy

// ── PODMÍNKY UPGRADU ──────────────────────────────────────────────────────────
// level:      minimální level postavy
// trophies:   minimální počet trofejí
// reputation: 'good' (>= 5) | 'evil' (<= -5) | 'any'
// quest:      ID questu, který musí být splněn (budoucí fáze)
// zone:       minimální zóna, které musí být dosaženo

export const HERO_TREE = {

  // ══ RYTÍŘ ══════════════════════════════════════════════════════════════════
  knight: {
    upgrades: [
      {
        id: 'paladin',
        name: 'Paladin',
        emoji: '✨',
        path: 'Světlo',
        description: 'Spojil sílu a víru. Léčí spojence a ničí temné nepřátele světelnou magií.',
        conditions: { level: 5, trophies: 10, reputation: 'good', zone: 2 },
        statBonus: { str: 1, skill: 2, life: 2, mana: 3, defense: 1 },
        newAbilities: [
          { id: 'holy_strike',  name: 'Svatý úder',     type: 'active',  manaCost: 2, desc: '+3 Síla vs. temné příšery, léčí 1 ŽP.' },
          { id: 'heal_aura',    name: 'Léčivá aura',    type: 'active',  manaCost: 3, desc: 'Všichni spojenci obnoví 2 ŽP.' },
          { id: 'divine_shield',name: 'Božský štít',    type: 'active',  manaCost: 2, desc: 'Imunita vůči 1 útoku, trvá 1 tah.' },
          { id: 'blessed',      name: 'Požehnaný',      type: 'passive', manaCost: 0, desc: '+1 Osud, +1 k hodu v zónách 1-2.' },
        ],
        color: '#f0e060',
      },
      {
        id: 'barbarian',
        name: 'Barbar',
        emoji: '🪖',
        path: 'Zuřivost',
        description: 'Zahodil zbroj i rozum. Dvojnásobná síla, ale žádná obrana. Čistá destrukce.',
        conditions: { level: 5, trophies: 10, reputation: 'any', zone: 2 },
        statBonus: { str: 4, life: 3, defense: -2, mana: -1 },
        newAbilities: [
          { id: 'rage',         name: 'Zuřivost',       type: 'active',  manaCost: 0, desc: 'Síla +3, Obrana -2 na 2 tahy. Bez many.' },
          { id: 'berserker',    name: 'Berserk',        type: 'active',  manaCost: 0, desc: 'Útočíš 2x za kolo, ale nepřítel také.' },
          { id: 'warcry',       name: 'Válečný pokřik', type: 'active',  manaCost: 0, desc: 'Zastraší nepřítele, -1 Síla na 1 kolo.' },
          { id: 'iron_will',    name: 'Železná vůle',   type: 'passive', manaCost: 0, desc: 'Přežiješ smrtelný úder 1x se 1 ŽP.' },
        ],
        color: '#e05050',
      },
    ],
  },

  // ══ ČARODĚJ ════════════════════════════════════════════════════════════════
  wizard: {
    upgrades: [
      {
        id: 'archmage',
        name: 'Arcimág',
        emoji: '🌟',
        path: 'Síla magie',
        description: 'Ovládl tajemství vesmíru. Kouzla devastují celá pole.',
        conditions: { level: 5, trophies: 8, reputation: 'any', zone: 2 },
        statBonus: { skill: 3, mana: 4, life: 1, defense: 1 },
        newAbilities: [
          { id: 'meteor',       name: 'Meteor',          type: 'active',  manaCost: 4, desc: 'Útočí na všechny nepřátele na poli.' },
          { id: 'time_stop',    name: 'Zastavení času',  type: 'active',  manaCost: 5, desc: 'Přeskočí 1 tah nepřítele.' },
          { id: 'mana_surge',   name: 'Příval many',     type: 'active',  manaCost: 0, desc: 'Obnoví 4 many okamžitě.' },
          { id: 'arcane_mind',  name: 'Mystická mysl',   type: 'passive', manaCost: 0, desc: 'Kouzla stojí -1 many (min 1).' },
        ],
        color: '#9b59b6',
      },
      {
        id: 'runecaster',
        name: 'Runový kovář',
        emoji: '🔱',
        path: 'Runy',
        description: 'Vytesal runy na každou zbraň a zbroj. Posiluje celou skupinu.',
        conditions: { level: 5, trophies: 8, reputation: 'any', zone: 2 },
        statBonus: { skill: 2, mana: 2, defense: 2 },
        newAbilities: [
          { id: 'rune_weapon',  name: 'Runová zbraň',   type: 'active',  manaCost: 2, desc: 'Enchantuje zbraň spojence: +2 Síla 3 tahy.' },
          { id: 'rune_armor',   name: 'Runové brnění',  type: 'active',  manaCost: 2, desc: 'Enchantuje zbroj spojence: +2 Obrana 3 tahy.' },
          { id: 'rune_blast',   name: 'Runový výbuch',  type: 'active',  manaCost: 3, desc: 'Exploduje runu: silný útok +4.' },
          { id: 'master_rune',  name: 'Mistrovská runa',type: 'passive', manaCost: 0, desc: 'Enchantmenty trvají o 2 tahy déle.' },
        ],
        color: '#3498db',
      },
    ],
  },

  // ══ ELF ════════════════════════════════════════════════════════════════════
  elf: {
    upgrades: [
      {
        id: 'forest_guardian',
        name: 'Lesní strážce',
        emoji: '🌳',
        path: 'Příroda',
        description: 'Stal se hlasem lesa. Zvířata ho poslouchají, příroda ho chrání.',
        conditions: { level: 5, trophies: 8, reputation: 'good', zone: 2 },
        statBonus: { skill: 2, fate: 2, life: 2, move: 1 },
        newAbilities: [
          { id: 'animal_command',name:'Velení zvířatům', type: 'active',  manaCost: 2, desc: 'Pet zaútočí 2x tento tah.' },
          { id: 'camouflage',   name: 'Maskování',      type: 'active',  manaCost: 2, desc: 'Neviditelný v lese a na pláních.' },
          { id: 'nature_heal',  name: 'Příroda léčí',   type: 'active',  manaCost: 1, desc: 'Obnov 2 ŽP sobě nebo spojenci.' },
          { id: 'wild_sense',   name: 'Smysly divočiny',type: 'passive', manaCost: 0, desc: 'Vždy vidíš typ karty před vytažením.' },
        ],
        color: '#2ecc71',
      },
      {
        id: 'arrow_master',
        name: 'Šípový mistr',
        emoji: '🎯',
        path: 'Přesnost',
        description: 'Žádný terč mu neunikne. Kritické zásahy a jedovaté šípy jsou jeho specialita.',
        conditions: { level: 5, trophies: 8, reputation: 'any', zone: 2 },
        statBonus: { skill: 3, str: 1, fate: 2 },
        newAbilities: [
          { id: 'crit_shot',    name: 'Kritický zásah', type: 'active',  manaCost: 1, desc: '50% šance na dvojitý damage.' },
          { id: 'poison_arrow', name: 'Otravný šíp',    type: 'active',  manaCost: 2, desc: 'Nepřítel ztrácí 1 ŽP/tah po 3 tahy.' },
          { id: 'multishot',    name: 'Salva',           type: 'active',  manaCost: 3, desc: 'Útočí na 3 nepřátele najednou.' },
          { id: 'eagle_eye',    name: 'Orlí zrak',       type: 'passive', manaCost: 0, desc: 'Dálkové útoky ignorují obranu.' },
        ],
        color: '#27ae60',
      },
    ],
  },

  // ══ TRPASLÍK ═══════════════════════════════════════════════════════════════
  dwarf: {
    upgrades: [
      {
        id: 'warlord',
        name: 'Válečný mistr',
        emoji: '⚒️',
        path: 'Válka',
        description: 'Encyklopedie zbraní. Každá zbraň v jeho rukou je smrtonosná.',
        conditions: { level: 5, trophies: 10, reputation: 'any', zone: 2 },
        statBonus: { str: 3, defense: 1, life: 2 },
        newAbilities: [
          { id: 'weapon_mastery',name:'Mistrovství zbraní',type:'active', manaCost: 1, desc: 'Zvol: útok Silou nebo Dovedností.' },
          { id: 'armor_break',  name: 'Rozbití zbroje',  type: 'active',  manaCost: 2, desc: 'Nepřítel ztratí 2 Obranu na 2 tahy.' },
          { id: 'battle_shout', name: 'Bojový výkřik',   type: 'active',  manaCost: 1, desc: 'Všichni spojenci +1 Síla tento tah.' },
          { id: 'veteran',      name: 'Veterán',          type: 'passive', manaCost: 0, desc: '+1 k hodu za každé 5 trofejí.' },
        ],
        color: '#e67e22',
      },
      {
        id: 'rune_guardian',
        name: 'Runový strážce',
        emoji: '🔮',
        path: 'Runy',
        description: 'Vytesal ochranné runy na svou zbroj. Magie ho nezraní.',
        conditions: { level: 5, trophies: 10, reputation: 'any', zone: 2 },
        statBonus: { defense: 3, mana: 3, skill: 2 },
        newAbilities: [
          { id: 'rune_ward',    name: 'Runový ochranný kruh', type: 'active', manaCost: 3, desc: 'Blokuje magický útok.' },
          { id: 'earth_rune',   name: 'Runa země',        type: 'active',  manaCost: 2, desc: 'Zpomalí nepřítele, -2 Pohyb.' },
          { id: 'forge_rune',   name: 'Kovářská runa',    type: 'active',  manaCost: 2, desc: 'Opraví zbroj, +1 Obrana trvale.' },
          { id: 'stone_fortress',name:'Kamenná pevnost',  type: 'passive', manaCost: 0, desc: 'Magické útoky způsobují -1 damage.' },
        ],
        color: '#95a5a6',
      },
    ],
  },

  // ══ HRANIČÁŘ ═══════════════════════════════════════════════════════════════
  ranger: {
    upgrades: [
      {
        id: 'assassin',
        name: 'Vrah',
        emoji: '🗡️',
        path: 'Stín',
        description: 'Pohybuje se ve stínech. Jeden výstřel, jeden mrtvý.',
        conditions: { level: 5, trophies: 8, reputation: 'evil', zone: 2 },
        statBonus: { skill: 3, str: 2, fate: 1 },
        newAbilities: [
          { id: 'backstab',     name: 'Zákeřný úder',   type: 'active',  manaCost: 2, desc: '+4 Síla při útoku ze skrývání.' },
          { id: 'poison_blade', name: 'Jedová čepel',   type: 'active',  manaCost: 1, desc: 'Nepřítel -1 ŽP/tah, 4 tahy.' },
          { id: 'smoke_bomb',   name: 'Dýmovnice',       type: 'active',  manaCost: 2, desc: 'Unikneš z souboje bez penalizace.' },
          { id: 'shadow_walk',  name: 'Chůze stínem',   type: 'passive', manaCost: 0, desc: 'Přeskočíš 1 pole bez karty 1x/kolo.' },
        ],
        color: '#8e44ad',
      },
      {
        id: 'monster_hunter',
        name: 'Lovec příšer',
        emoji: '🏹',
        path: 'Lov',
        description: 'Studoval každou příšeru. Ví přesně jak je zabít.',
        conditions: { level: 5, trophies: 8, reputation: 'any', zone: 2 },
        statBonus: { str: 2, skill: 2, fate: 1, move: 1 },
        newAbilities: [
          { id: 'monster_lore', name: 'Znalost příšer',  type: 'active',  manaCost: 0, desc: 'Vidíš statistiky nepřítele před soubojem.' },
          { id: 'silver_arrow', name: 'Stříbrný šíp',    type: 'active',  manaCost: 2, desc: '+5 vs. nemrtví a magické příšery.' },
          { id: 'beast_trap',   name: 'Bestia past',     type: 'active',  manaCost: 1, desc: 'Ochočení je 2x lehčí tento tah.' },
          { id: 'hunter_mark',  name: 'Značka lovce',    type: 'passive', manaCost: 0, desc: '+2 Síla vs. příšery zóny 3+.' },
        ],
        color: '#d35400',
      },
    ],
  },

  // ══ BARD ═══════════════════════════════════════════════════════════════════
  bard: {
    upgrades: [
      {
        id: 'war_bard',
        name: 'Válečný bard',
        emoji: '🎺',
        path: 'Boj',
        description: 'Píseň jako meč. Inspiruje spojence k nadlidským výkonům.',
        conditions: { level: 5, trophies: 6, reputation: 'any', zone: 2 },
        statBonus: { str: 2, skill: 1, fate: 2, mana: 1 },
        newAbilities: [
          { id: 'battle_hymn',  name: 'Hymna bitvy',     type: 'active',  manaCost: 3, desc: 'Všichni spojenci +2 Síla na 2 tahy.' },
          { id: 'requiem',      name: 'Rekviem',          type: 'active',  manaCost: 2, desc: 'Nepřítel -2 Síla na 2 tahy.' },
          { id: 'anthem',       name: 'Antifóna',         type: 'active',  manaCost: 2, desc: 'Spojenec dostane okamžitě extra akci.' },
          { id: 'heroic_song',  name: 'Hrdinská píseň',  type: 'passive', manaCost: 0, desc: 'Spojenci v souboji +1 k hodu.' },
        ],
        color: '#e91e63',
      },
      {
        id: 'shaman',
        name: 'Šaman',
        emoji: '🌀',
        path: 'Duchové',
        description: 'Komunikuje s duchy přírody. Věštby, kletby a ochrana ze záhrobí.',
        conditions: { level: 5, trophies: 6, reputation: 'any', zone: 2 },
        statBonus: { skill: 2, fate: 3, mana: 3 },
        newAbilities: [
          { id: 'prophecy',     name: 'Věštba',           type: 'active',  manaCost: 1, desc: 'Zjistíš typ příštích 2 karet.' },
          { id: 'spirit_ward',  name: 'Duchová ochrana',  type: 'active',  manaCost: 3, desc: 'Spojenec je chráněn před smrtí 1x.' },
          { id: 'curse',        name: 'Kletba',           type: 'active',  manaCost: 2, desc: 'Nepřítel -2 k hodu po dobu 3 tahů.' },
          { id: 'spirit_link',  name: 'Pouto duchů',      type: 'passive', manaCost: 0, desc: 'Vidíš stav všech hráčů na telefonu.' },
        ],
        color: '#00bcd4',
      },
    ],
  },

  // ══ MNICH ══════════════════════════════════════════════════════════════════
  monk: {
    upgrades: [
      {
        id: 'grandmaster',
        name: 'Velmistr',
        emoji: '🥷',
        path: 'Dokonalost',
        description: 'Dosáhl vrcholu bojových umění. Každý pohyb je smrtonosný.',
        conditions: { level: 5, trophies: 8, reputation: 'good', zone: 2 },
        statBonus: { str: 2, skill: 2, fate: 2, move: 1 },
        newAbilities: [
          { id: 'perfect_combo', name: 'Perfektní combo', type: 'active', manaCost: 3, desc: '3 útoky za 1 akci.' },
          { id: 'deflect',       name: 'Odražení',        type: 'active', manaCost: 2, desc: 'Vrátíš útok zpět na nepřítele.' },
          { id: 'ki_blast',      name: 'Ki výbuch',       type: 'active', manaCost: 3, desc: 'Energetický útok, ignoruje zbroj +4.' },
          { id: 'iron_body',     name: 'Železné tělo',    type: 'passive',manaCost: 0, desc: '-1 damage od fyzických útoků.' },
        ],
        color: '#ff9800',
      },
      {
        id: 'shadow_fighter',
        name: 'Stínový bojovník',
        emoji: '👤',
        path: 'Stín',
        description: 'Pohybuje se mezi světem živých a stínů. Teleport, zákeřnost.',
        conditions: { level: 5, trophies: 8, reputation: 'evil', zone: 2 },
        statBonus: { skill: 3, fate: 2, move: 2 },
        newAbilities: [
          { id: 'shadow_step',   name: 'Stínový krok',   type: 'active', manaCost: 2, desc: 'Teleport na libovolné pole zóny.' },
          { id: 'vanish',        name: 'Zmizení',         type: 'active', manaCost: 1, desc: 'Okamžitě unikni z souboje.' },
          { id: 'shadow_clone',  name: 'Stínový klon',   type: 'active', manaCost: 4, desc: 'Klon přijme 1 útok místo tebe.' },
          { id: 'darkness',      name: 'Tma',             type: 'passive',manaCost: 0, desc: 'Skrývání trvá 2x déle.' },
        ],
        color: '#607d8b',
      },
    ],
  },

  // ══ OBCHODNÍK ══════════════════════════════════════════════════════════════
  merchant: {
    upgrades: [
      {
        id: 'golddigger',
        name: 'Zlatokop',
        emoji: '⛏️',
        path: 'Zlato',
        description: 'Zlato vidí všude. Umí vytěžit bohatství z každé situace.',
        conditions: { level: 5, trophies: 5, reputation: 'any', zone: 2 },
        statBonus: { gold: 5, fate: 2, skill: 1 },
        newAbilities: [
          { id: 'treasure_hunt', name: 'Lov pokladů',    type: 'active', manaCost: 0, desc: 'Prohledej lokaci: šance na +3 zlata.' },
          { id: 'negotiation',   name: 'Vyjednávání',    type: 'active', manaCost: 0, desc: 'Kup předmět za polovinu ceny 1x.' },
          { id: 'golden_touch',  name: 'Zlatý dotyk',    type: 'active', manaCost: 0, desc: 'Zpeněž předmět za jeho hodnotu.' },
          { id: 'wealth',        name: 'Bohatství',      type: 'passive',manaCost: 0, desc: '+2 zlata za každý souboj.' },
        ],
        color: '#ffc107',
      },
      {
        id: 'guild_master',
        name: 'Šéf cechu',
        emoji: '🏛️',
        path: 'Cechy',
        description: 'Řídí síť informátorů a obchodníků. Pasivní příjem a NPC spojenci.',
        conditions: { level: 5, trophies: 5, reputation: 'any', zone: 2 },
        statBonus: { gold: 3, fate: 3, skill: 2 },
        newAbilities: [
          { id: 'hire_guard',    name: 'Najmout strážce', type: 'active', manaCost: 0, desc: 'Zaplať 3 zlata → strážce bojuje za tebe.' },
          { id: 'market_intel',  name: 'Tržní zpravodaj', type: 'active', manaCost: 0, desc: 'Zjistíš obsah dalších 3 karet.' },
          { id: 'guild_tithe',   name: 'Cechy daní',      type: 'active', manaCost: 0, desc: 'Vyber 1 zlato od každého hráče.' },
          { id: 'passive_income',name: 'Pasivní příjem',  type: 'passive',manaCost: 0, desc: '+1 zlato na začátku každého tahu.' },
        ],
        color: '#795548',
      },
    ],
  },
};

// ── XP TABULKA ────────────────────────────────────────────────────────────────
// Kolik XP je potřeba pro každý level

export const XP_TABLE = [
  0,    // level 1
  10,   // level 2
  25,   // level 3
  45,   // level 4
  70,   // level 5  ← upgrade dostupný
  100,  // level 6
  140,  // level 7
  190,  // level 8
  250,  // level 9
  320,  // level 10 ← max
];

export function getLevel(xp) {
  let level = 1;
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) level = i + 1;
  }
  return Math.min(level, 10);
}

export function xpToNextLevel(xp) {
  const level = getLevel(xp);
  if (level >= 10) return 0;
  return XP_TABLE[level] - xp;
}

// ── FUNKCE: Zkontroluj podmínky upgradu ──────────────────────────────────────

export function canUpgrade(upgrade, playerStats, playerZone) {
  const c = upgrade.conditions;
  const level = getLevel(playerStats.xp || 0);
  const rep   = playerStats.reputation || 0;

  if (level < c.level)                               return { ok: false, reason: `Potřebuješ level ${c.level}` };
  if ((playerStats.trophies || 0) < c.trophies)     return { ok: false, reason: `Potřebuješ ${c.trophies} trofejí` };
  if ((playerZone || 1) < (c.zone || 1))             return { ok: false, reason: `Dosáhni zóny ${c.zone}` };
  if (c.reputation === 'good'  && rep < 5)           return { ok: false, reason: 'Potřebuješ reputaci ≥ +5 (Dobrý)' };
  if (c.reputation === 'evil'  && rep > -5)          return { ok: false, reason: 'Potřebuješ reputaci ≤ -5 (Zlý)' };

  return { ok: true };
}

// ── FUNKCE: Aplikuj upgrade na postavu ───────────────────────────────────────

export function applyUpgrade(currentStats, currentAbilities, upgrade) {
  const newStats = { ...currentStats };

  // Aplikuj statbonusy
  Object.entries(upgrade.statBonus || {}).forEach(([key, val]) => {
    newStats[key] = (newStats[key] || 0) + val;
    if (key === 'life') newStats.maxLife = (newStats.maxLife || 0) + val;
    if (key === 'mana') newStats.maxMana = (newStats.maxMana || 0) + val;
  });

  // Přidej nové schopnosti
  const newAbilities = [...currentAbilities, ...(upgrade.newAbilities || [])];

  return { newStats, newAbilities };
}
