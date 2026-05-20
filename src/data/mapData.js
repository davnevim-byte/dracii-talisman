// src/data/mapData.js
// Kompletní herní mapa — zóny, lokace, speciální místa, NPC, obchody

// ── ZÓNY ─────────────────────────────────────────────────────────────────────

export const ZONES = {
  1: {
    id: 1, name: 'Klidná krajina', emoji: '🌾',
    difficulty: 1, color: '#4caf50',
    desc: 'Zelené pastviny, přátelské vesnice a tiché lesy. Ideální místo pro začátek dobrodružství.',
    nightDanger: 1,   // bonus síla příšer v noci
    weatherChance: 0.10,
  },
  2: {
    id: 2, name: 'Pohraniční království', emoji: '🏰',
    difficulty: 2, color: '#c0932a',
    desc: 'Opevněné hrady, temné bažiny a staré hřbitovy. Bandité a nemrtví číhají za každým rohem.',
    nightDanger: 2,
    weatherChance: 0.15,
  },
  3: {
    id: 3, name: 'Divoká divočina', emoji: '🌋',
    difficulty: 3, color: '#e07030',
    desc: 'Drsné hory, sopečné pláně a dračí hnízda. Pouze silní přežijí.',
    nightDanger: 3,
    weatherChance: 0.20,
  },
  4: {
    id: 4, name: 'Prokletá země', emoji: '💀',
    difficulty: 4, color: '#9b59b6',
    desc: 'Staré bojiště, pláně kostí, temné věže. Místo kde živí nemají co hledat.',
    nightDanger: 4,
    weatherChance: 0.25,
  },
  5: {
    id: 5, name: 'Citadela Pana Zla', emoji: '👑',
    difficulty: 5, color: '#e05050',
    desc: 'Sídlo samotného Pana Zla. Kdo sem vstoupí, buď odchází jako hrdina — nebo vůbec.',
    nightDanger: 5,
    weatherChance: 0.30,
  },
};

// ── LOKACE PODLE ZÓNY ─────────────────────────────────────────────────────────
// type: 'safe' | 'dangerous' | 'shop' | 'inn' | 'temple' | 'smithy' | 'special'

export const ZONE_LOCATIONS = {
  1: [
    { id:'village',    name:'Vesnice',        emoji:'🏘️', type:'safe',      desc:'Přátelské místo. Obchodníci, quest-giveři a klid.' },
    { id:'fields',     name:'Obilná pole',    emoji:'🌾', type:'safe',      desc:'Klidná pole. Sem tam se zatoulá divoká zvěř.' },
    { id:'dark_woods', name:'Temný les',      emoji:'🌲', type:'dangerous', desc:'Husté stromy skrývají nebezpečí. Opatrně.' },
    { id:'river',      name:'Řeka',           emoji:'🏞️', type:'safe',      desc:'Čistá řeka. Rybáři a kupci tábořící na břehu.' },
    { id:'road',       name:'Selská cesta',   emoji:'🛤️', type:'safe',      desc:'Dobře udržovaná cesta. Sem tam bandit.' },
    { id:'tavern',     name:'Hospoda "U draka"',emoji:'🍺',type:'inn',      desc:'Teplo, jídlo, pití. A občas porvačka.' },
    { id:'chapel',     name:'Kaple sv. Světla',emoji:'⛪', type:'temple',   desc:'Posvátné místo. Léčení a požehnání.' },
    { id:'pasture',    name:'Pastviště',       emoji:'🐑', type:'safe',      desc:'Ovce, pastýři. Divoká zvěř se sem zatoulá.' },
    { id:'mill',       name:'Mlýn',            emoji:'⚙️', type:'shop',     desc:'Mlynář prodává zásoby a základní vybavení.' },
    { id:'forest_edge',name:'Okraj lesa',      emoji:'🌳', type:'dangerous',desc:'Kde les začíná temnat. Zvířata a bandité.' },
  ],
  2: [
    { id:'castle',     name:'Hrad Kamenný',   emoji:'🏰', type:'safe',      desc:'Opevněný hrad. Rytíři a obchodníci uvítají hrdiny.' },
    { id:'swamp',      name:'Bažina',         emoji:'🟤', type:'dangerous', desc:'Bahno, mlha a nebezpečné příšery skryté v tůních.' },
    { id:'trade_road', name:'Obchodní cesta', emoji:'🛣️', type:'shop',      desc:'Kupci prodávají zboží ze vzdálených krajin.' },
    { id:'watchtower', name:'Strážní věž',    emoji:'🗼', type:'safe',      desc:'Strážci hlídají kraj. Relativně bezpečné.' },
    { id:'graveyard',  name:'Hřbitov',        emoji:'⚰️', type:'dangerous', desc:'Nemrtví vstávají za soumraku. Riziko v noci x2.' },
    { id:'cave',       name:'Jeskyně',        emoji:'🕳️', type:'dangerous', desc:'Temné průchody, kde žijí trollové a slíďi.' },
    { id:'smithy',     name:'Trpasličí kovárna',emoji:'⚒️',type:'smithy',  desc:'Nejlepší kovář v kraji. Zbraně a zbroje na míru.' },
    { id:'ruins',      name:'Ruiny starého hradu',emoji:'🏚️',type:'dangerous',desc:'Padlé zdi skrývají poklady i nebezpečí.' },
    { id:'bridge',     name:'Kamenný most',   emoji:'🌉', type:'safe',      desc:'Přechod přes řeku. Výběrčí mýta — 1 zlato.' },
    { id:'hermit',     name:'Poustevníkova chýše',emoji:'🛖',type:'special',desc:'Moudrý starý poustevník. Dá radu, nebo kouzlo.' },
  ],
  3: [
    { id:'mountains',  name:'Hory Drak\'ův hřbet',emoji:'⛰️',type:'dangerous',desc:'Skalní útesy a průsmyky. Obři a draci.' },
    { id:'troll_cave', name:'Trollí jeskyně',  emoji:'🕳️', type:'dangerous', desc:'Domov horských trollů. Poklady, ale i smrt.' },
    { id:'dragon_nest',name:'Dračí hnízdo',    emoji:'🐲', type:'dangerous', desc:'Mladý drak hlídá vejce. Extrémně nebezpečné.' },
    { id:'old_ruins',  name:'Starodávné ruiny',emoji:'🏛️', type:'special',   desc:'Ruiny prastaré civilizace. Magické artefakty.' },
    { id:'ice_plains', name:'Ledová pláň',     emoji:'❄️', type:'dangerous', desc:'Věčný mráz. Ledoví tvorové a mráz -1 ŽP/tah.' },
    { id:'volcano',    name:'Úpatí sopky',     emoji:'🌋', type:'dangerous', desc:'Sopečná horko. Ohnivé příšery se tu cítí doma.' },
    { id:'temple',     name:'Skrytý chrám',    emoji:'⛩️', type:'temple',    desc:'Zapomenutý chrám horských mnichů. Mocné požehnání.' },
    { id:'pass',       name:'Horský průsmyk',  emoji:'🏔️', type:'dangerous', desc:'Jediný průchod do dalších zón. Střežen.' },
  ],
  4: [
    { id:'battlefield',name:'Staré bojiště',  emoji:'💀', type:'dangerous', desc:'Tisíce padlých. Nemrtví povstávají každou noc.' },
    { id:'dark_tower', name:'Temná věž',      emoji:'🗼', type:'dangerous', desc:'Sídlo temného kouzelníka. Nebezpečná magie.' },
    { id:'bone_plains',name:'Pláně kostí',    emoji:'🦴', type:'dangerous', desc:'Nekonečné pláně pokryté kostmi padlých armád.' },
    { id:'dead_forest',name:'Zkamenělý les',  emoji:'🪨', type:'dangerous', desc:'Les proměněný kletbou v kámen. Duchy a přízraky.' },
    { id:'black_lake', name:'Černé jezero',   emoji:'🖤', type:'dangerous', desc:'Temná voda bez dna. Co žije pod hladinou?' },
    { id:'obsidian_fortress',name:'Obsidiánová pevnost',emoji:'🏯',type:'special',desc:'Poslední zastávka před citadelou. Ultimátní výzbroj.' },
  ],
  5: [
    { id:'citadel_gate',name:'Brána citadely',emoji:'🚪',type:'dangerous', desc:'Vstupní brána. Posílená stráž Pana Zla.' },
    { id:'guard_towers',name:'Strážní věže',  emoji:'🗼', type:'dangerous', desc:'Nekonečné vlny strážců. Coop nutný.' },
    { id:'throne_room', name:'Trůnní síň',    emoji:'👑', type:'dangerous', desc:'Samotný trůn Pana Zla. Finální boss.' },
  ],
};

// ── SPECIÁLNÍ LOKACE — akce ───────────────────────────────────────────────────

export const LOCATION_ACTIONS = {
  // INN — hostinec
  inn: [
    { id:'rest',    name:'Odpočinout',   cost:{ gold:2 }, effect:{ heal:'full' },  desc:'Přenocuj za 2 zlata → plné ŽP.' },
    { id:'meal',    name:'Najíst se',    cost:{ gold:1 }, effect:{ heal:2 },       desc:'Jídlo za 1 zlato → +2 ŽP.' },
    { id:'rumor',   name:'Poslouchat drby',cost:{},       effect:{ info:true },    desc:'Zdarma — zjistíš typ příší karty.' },
    { id:'gamble',  name:'Hazardovat',   cost:{ gold:2 }, effect:{ gamble:true }, desc:'Vsaď 2 zlata — šance x2 nebo ztráta.' },
  ],
  // TEMPLE — chrám
  temple: [
    { id:'pray',    name:'Modlit se',    cost:{},         effect:{ fate:1 },       desc:'Zdarma — +1 Osud.' },
    { id:'heal',    name:'Léčení',       cost:{ gold:1 }, effect:{ heal:'full' },  desc:'1 zlato → plné ŽP.' },
    { id:'bless',   name:'Požehnání',    cost:{ gold:2 }, effect:{ blessed:true }, desc:'2 zlata → status "Požehnaný" 3 tahy.' },
    { id:'repent',  name:'Kajícnost',    cost:{},         effect:{ rep:2 },        desc:'Zdarma — +2 Reputace (jen pro záporné).' },
  ],
  // SMITHY — kovárna
  smithy: [
    { id:'repair',  name:'Opravit zbroj',cost:{ gold:2 }, effect:{ defense:1 },   desc:'2 zlata → +1 Obrana trvale.' },
    { id:'sharpen', name:'Naostřit zbraň',cost:{ gold:1 },effect:{ str:1, temp:true },desc:'1 zlato → +1 Síla na 3 tahy.' },
    { id:'upgrade_armor',name:'Vylepšit zbroj',cost:{ gold:4 },effect:{ defense:2 },desc:'4 zlata → +2 Obrana trvale.' },
  ],
  // SHOP — obchod
  shop: [
    { id:'buy_potion',name:'Lektvar léčení',cost:{ gold:2 },effect:{ item:'potion' },desc:'2 zlata → Lektvar léčení do inventáře.' },
    { id:'buy_weapon',name:'Zbraň',         cost:{ gold:3 },effect:{ item:'weapon' },desc:'3 zlata → náhodná zbraň.' },
    { id:'buy_armor', name:'Zbroj',         cost:{ gold:3 },effect:{ item:'armor' }, desc:'3 zlata → náhodná zbroj.' },
  ],
  // SPECIAL — speciální
  special: [
    { id:'explore',  name:'Prohledat',    cost:{},         effect:{ draw:true },    desc:'Táhni 2 karty, vyber 1.' },
    { id:'meditate', name:'Meditovat',    cost:{},         effect:{ mana:'full' },  desc:'Obnov veškerou Manu.' },
  ],
};

// ── PŘECHODOVÁ PODMÍNKA ZÓNY ──────────────────────────────────────────────────
// Co musí hráč splnit aby mohl přejít do další zóny

export const ZONE_ENTRY_REQUIREMENTS = {
  2: { level: 2,  trophies: 3,  desc: 'Level 2 a 3 trofeje' },
  3: { level: 4,  trophies: 8,  desc: 'Level 4 a 8 trofejí' },
  4: { level: 6,  trophies: 15, desc: 'Level 6 a 15 trofejí' },
  5: { level: 8,  trophies: 25, desc: 'Level 8 a 25 trofejí' },
};

// ── POČASÍ ────────────────────────────────────────────────────────────────────

export const WEATHER = {
  sunny: {
    id: 'sunny', name: 'Slunečno', emoji: '☀️', color: '#f0c040',
    desc: 'Jasný den. Ideální podmínky pro dobrodružství.',
    effects: { move: 0, strMod: 0, skillMod: 0, rangedMod: 0 },
  },
  cloudy: {
    id: 'cloudy', name: 'Zataženo', emoji: '⛅', color: '#9a9a9a',
    desc: 'Oblačno, ale sucho. Trochu dusno.',
    effects: { move: 0, strMod: 0, skillMod: 0, rangedMod: -1 },
  },
  rain: {
    id: 'rain', name: 'Déšť', emoji: '🌧️', color: '#5b8dd9',
    desc: 'Déšť zpomaluje pohyb. Lučištníci mají smůlu.',
    effects: { move: -1, strMod: 0, skillMod: 0, rangedMod: -2 },
  },
  storm: {
    id: 'storm', name: 'Bouře', emoji: '⛈️', color: '#7a6a9a',
    desc: 'Silná bouře. Pohyb velmi ztížen, kouzla nestabilní.',
    effects: { move: -2, strMod: 0, skillMod: -1, rangedMod: -3, spellRandom: true },
  },
  fog: {
    id: 'fog', name: 'Mlha', emoji: '🌫️', color: '#c0c0c0',
    desc: 'Hustá mlha. Nevidíš co tě čeká dopředu.',
    effects: { move: 0, strMod: 0, skillMod: 0, rangedMod: -2, hideCards: true },
  },
  snow: {
    id: 'snow', name: 'Sněžení', emoji: '❄️', color: '#a0d0f0',
    desc: 'Sněhová vánice. Pohyb ztížen, studený vítr ubírá zdraví.',
    effects: { move: -1, strMod: -1, skillMod: 0, rangedMod: 0, coldDmg: 1 },
  },
  heatwave: {
    id: 'heatwave', name: 'Vedro', emoji: '🔆', color: '#e07030',
    desc: 'Spalující horko. Fyzická námaha je náročnější.',
    effects: { move: -1, strMod: -1, skillMod: 0, rangedMod: 0 },
  },
};

// Přechody počasí (pravděpodobnosti)
export const WEATHER_TRANSITIONS = {
  sunny:    { sunny:0.5, cloudy:0.3, rain:0.1, fog:0.1 },
  cloudy:   { sunny:0.3, cloudy:0.3, rain:0.2, storm:0.1, fog:0.1 },
  rain:     { sunny:0.2, cloudy:0.3, rain:0.3, storm:0.2 },
  storm:    { rain:0.4, cloudy:0.3, storm:0.2, sunny:0.1 },
  fog:      { sunny:0.3, cloudy:0.3, fog:0.3, rain:0.1 },
  snow:     { snow:0.4, cloudy:0.3, sunny:0.2, fog:0.1 },
  heatwave: { heatwave:0.4, sunny:0.4, cloudy:0.2 },
};

export function getNextWeather(current, zone) {
  const transitions = WEATHER_TRANSITIONS[current] || WEATHER_TRANSITIONS.sunny;
  const r = Math.random();
  let cum = 0;
  for (const [weather, prob] of Object.entries(transitions)) {
    cum += prob;
    if (r < cum) {
      // V zóně 3+ může sněžit
      if (weather === 'snow' && zone < 3) return 'cloudy';
      return weather;
    }
  }
  return 'sunny';
}

// ── DENNÍ DOBA ────────────────────────────────────────────────────────────────

export const TIME_OF_DAY = {
  dawn: {
    id: 'dawn', name: 'Svítání', emoji: '🌄', color: '#f0a030',
    hours: [5, 6, 7],
    desc: 'Příšery ustupují, den začíná. Bonus k pohybu.',
    effects: { move: 1, enemyStr: -1, shopOpen: false, healRegen: 1 },
  },
  morning: {
    id: 'morning', name: 'Ráno', emoji: '🌅', color: '#f0c040',
    hours: [8, 9, 10, 11],
    desc: 'Nejbezpečnější část dne. Obchody otevřeny.',
    effects: { move: 1, enemyStr: -1, shopOpen: true, healRegen: 0 },
  },
  day: {
    id: 'day', name: 'Den', emoji: '☀️', color: '#e8c840',
    hours: [12, 13, 14, 15, 16],
    desc: 'Normální stav. Nic zvláštního.',
    effects: { move: 0, enemyStr: 0, shopOpen: true, healRegen: 0 },
  },
  evening: {
    id: 'evening', name: 'Večer', emoji: '🌆', color: '#e07030',
    hours: [17, 18, 19, 20],
    desc: 'Obchody zavírají. Bandité aktivnější.',
    effects: { move: 0, enemyStr: 1, shopOpen: false, healRegen: 0 },
  },
  night: {
    id: 'night', name: 'Noc', emoji: '🌙', color: '#5b6db0',
    hours: [21, 22, 23, 0, 1, 2, 3, 4],
    desc: 'Příšery silnější. Tábořiště nutné pro regeneraci.',
    effects: { move: -1, enemyStr: 2, shopOpen: false, healRegen: 0, undead: true },
  },
};

export function getTimeOfDay(hour) {
  if (hour >= 5  && hour <= 7)  return TIME_OF_DAY.dawn;
  if (hour >= 8  && hour <= 11) return TIME_OF_DAY.morning;
  if (hour >= 12 && hour <= 16) return TIME_OF_DAY.day;
  if (hour >= 17 && hour <= 20) return TIME_OF_DAY.evening;
  return TIME_OF_DAY.night;
}

// Posun hodiny — 1 tah = 1 hodina
export function advanceHour(currentHour) {
  return (currentHour + 1) % 24;
}

// ── GLOBÁLNÍ UDÁLOSTI ─────────────────────────────────────────────────────────
// Spouštějí se jednou za X tahů pro všechny hráče

export const GLOBAL_EVENTS = [
  {
    id: 'dragon_sighting',
    name: 'Přelet draka',
    emoji: '🐉',
    desc: 'Obrovský drak přelétá krajinou. Všechny příšery v zóně 3 mají +2 Sílu na 3 tahy.',
    trigger: { everyTurns: 20 },
    effect: { zone: 3, enemyBuff: 2, duration: 3 },
  },
  {
    id: 'merchants_caravan',
    name: 'Kupecká karavana',
    emoji: '🛒',
    desc: 'Velká karavana projíždí krajem. Všechny obchody mají slevu -1 zlato na 2 tahy.',
    trigger: { everyTurns: 15 },
    effect: { shopDiscount: 1, duration: 2 },
  },
  {
    id: 'dark_lords_curse',
    name: 'Kletba Pana Zla',
    emoji: '💜',
    desc: 'Pan Zla seslal kletbu! Všichni hráči ztrácejí 1 Osud.',
    trigger: { everyTurns: 10 },
    effect: { allPlayers: { fate: -1 } },
  },
  {
    id: 'full_moon',
    name: 'Úplněk',
    emoji: '🌕',
    desc: 'Úplněk! Vlci a nemrtví jsou silnější, ale šance na taming je +2.',
    trigger: { everyTurns: 12 },
    effect: { undeadBuff: 2, tamBonus: 2, duration: 3 },
  },
  {
    id: 'harvest_festival',
    name: 'Slavnost sklizně',
    emoji: '🎉',
    desc: 'Vesnice slaví sklizeň! Všichni hráči v Zóně 1 dostávají +2 zlata.',
    trigger: { everyTurns: 18 },
    effect: { zone: 1, allPlayers: { gold: 2 } },
  },
  {
    id: 'earthquake',
    name: 'Zemětřesení',
    emoji: '💥',
    desc: 'Silné zemětřesení! Všichni hráči se přesunou o 1 pole zpět.',
    trigger: { everyTurns: 25 },
    effect: { moveBack: 1 },
  },
  {
    id: 'magic_surge',
    name: 'Příval divoké magie',
    emoji: '🌀',
    desc: 'Divoká magie zaplavuje svět! Všichni čarodějové a čarodějky +3 Mana.',
    trigger: { everyTurns: 16 },
    effect: { classBonus: { wizard: { mana: 3 }, archmage: { mana: 4 } } },
  },
];

// ── NPC POSTAVY ───────────────────────────────────────────────────────────────

export const NPC_CHARACTERS = [
  {
    id: 'old_sage',
    name: 'Moudrý stařec',
    emoji: '🧙',
    locations: ['hermit', 'chapel', 'old_ruins'],
    dialogues: [
      'Opatruj se v temném lese, mladý dobrodruhu.',
      'Pan Zla sílí. Poražte ho dřív než bude pozdě.',
      'Legenda praví, že Talisman leží v srdci citadely.',
    ],
    actions: [
      { id:'wisdom',  name:'Radu',       cost:{},        effect:{ xp:5 },    desc:'Získáš 5 XP z jeho moudrosti.' },
      { id:'prophecy',name:'Věštbu',     cost:{ gold:2 },effect:{ info:true },desc:'Za 2 zlata zjistíš příští kartu.' },
    ],
  },
  {
    id: 'traveling_merchant',
    name: 'Cestující kupec',
    emoji: '🛒',
    locations: ['road', 'trade_road', 'bridge'],
    dialogues: [
      'Psst! Hledáš vzácné zboží? Mám všechno!',
      'Dnes levně prodávám. Sklad musím vyčistit.',
      'Opatrně na bandity na severní cestě.',
    ],
    actions: [
      { id:'buy_item', name:'Koupit zboží', cost:{ gold:2 }, effect:{ item:'random' }, desc:'Náhodný předmět za 2 zlata.' },
      { id:'sell_item',name:'Prodat předmět',cost:{},        effect:{ sell:true },     desc:'Prodej předmět za jeho hodnotu.' },
    ],
  },
  {
    id: 'knight_captain',
    name: 'Rytířský kapitán',
    emoji: '⚔️',
    locations: ['castle', 'watchtower', 'citadel_gate'],
    dialogues: [
      'Hledáme statečné bojovníky pro tažení proti Panu Zlu.',
      'Kdo porazí třetí zónu, dostane královské odměny.',
      'Vaše trofeje svědčí o vaší statečnosti.',
    ],
    actions: [
      { id:'quest',   name:'Přijmout úkol', cost:{},         effect:{ quest:true },  desc:'Speciální quest s odměnou.' },
      { id:'training',name:'Trénovat',      cost:{ gold:3 }, effect:{ str:1 },       desc:'3 zlata → +1 Síla trvale.' },
    ],
  },
  {
    id: 'witch',
    name: 'Lesní čarodějka',
    emoji: '🧝',
    locations: ['dark_woods', 'swamp', 'dead_forest'],
    dialogues: [
      'Příroda mluví, ale jen ti, kdo naslouchají, slyší.',
      'Chceš sílu? Vše má svou cenu.',
      'Tvůj pet tě nikdy nezradí — na rozdíl od lidí.',
    ],
    actions: [
      { id:'brew',    name:'Uvařit lektvar', cost:{ gold:2 }, effect:{ item:'potion' }, desc:'2 zlata → silný lektvar.' },
      { id:'curse_enemy', name:'Proklít nepřítele', cost:{ gold:3 }, effect:{ nextEnemy:-2 }, desc:'Příští příšera -2 Síla.' },
    ],
  },
];

// ── TÁBOŘIŠTĚ ─────────────────────────────────────────────────────────────────
// Hráč může tábořit na bezpečných místech v noci

export const CAMP_EFFECTS = {
  basic:  { healAmount: 2, manaAmount: 2, cost: 0,   name: 'Jednoduché tábořiště' },
  good:   { healAmount: 3, manaAmount: 3, cost: 1,   name: 'Dobré tábořiště' },
  luxury: { healAmount: 'full', manaAmount: 'full', cost: 3, name: 'Luxusní tábořiště' },
};
