// src/game/worldData.js
// Herní data — balíček karet, exporty pro kompatibilitu

export { ZONES, ZONE_LOCATIONS, WEATHER as WEATHER_EFFECTS, TIME_OF_DAY as TIME_EFFECTS }
  from '../data/mapData';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── PŘÍŠERY ───────────────────────────────────────────────────────────────────
export const ENEMIES_BY_ZONE = {
  1: [
    { name:'Divoký kanec',  emoji:'🐗', str:2, xp:1, gold:0, tameble:true,  tameRep:'any',  ability:'Nabíjí — přeskočí obranu.' },
    { name:'Vlk',           emoji:'🐺', str:2, xp:1, gold:0, tameble:true,  tameRep:'neutral',ability:'Útočí ve smečce.' },
    { name:'Lesní škůdce',  emoji:'🦝', str:1, xp:1, gold:1, tameble:false, ability:'Krade 1 zlato.' },
    { name:'Bandit',        emoji:'🥷', str:3, xp:2, gold:2, tameble:false, ability:'Krade zlato při výhře.' },
    { name:'Had',           emoji:'🐍', str:2, xp:1, gold:0, tameble:true,  tameRep:'evil',  ability:'Jedovatý — ztráta 1 ŽP/tah.' },
    { name:'Medvěd',        emoji:'🐻', str:4, xp:3, gold:0, tameble:true,  tameRep:'good',  ability:'Silný útok.' },
    { name:'Divoký liščák', emoji:'🦊', str:1, xp:1, gold:0, tameble:true,  tameRep:'good',  ability:'+1 Osud pokud ochočen.' },
  ],
  2: [
    { name:'Skřet',         emoji:'👺', str:3, xp:2, gold:1, tameble:false, ability:'Přivolá posilu.' },
    { name:'Kostlivec',     emoji:'💀', str:3, xp:2, gold:1, tameble:false, ability:'Imunní vůči jedu.' },
    { name:'Troll',         emoji:'🧌', str:5, xp:3, gold:2, tameble:false, ability:'Regeneruje 1 ŽP/kolo.' },
    { name:'Harpia',        emoji:'🦅', str:4, xp:2, gold:1, tameble:false, ability:'Může ukrást předmět.' },
    { name:'Bažinný krokodýl',emoji:'🐊',str:4,xp:3,gold:0, tameble:true,  tameRep:'evil',  ability:'Pohlcení slabých.' },
    { name:'Vůdce loupežníků',emoji:'🗡️',str:5,xp:4,gold:5,tameble:false, ability:'Vezme celou kapsu.' },
  ],
  3: [
    { name:'Horský troll',  emoji:'🧌', str:6, xp:4, gold:2, tameble:false, ability:'Drtivý úder.' },
    { name:'Gryf',          emoji:'🦁', str:6, xp:5, gold:0, tameble:true,  tameRep:'good',  ability:'Útok z výšky.' },
    { name:'Mladý drak',    emoji:'🐲', str:7, xp:6, gold:8, tameble:false, ability:'Ohnivý dech.' },
    { name:'Kamenný golem', emoji:'🗿', str:7, xp:5, gold:0, tameble:false, ability:'-2 na zbraňové útoky.' },
    { name:'Ledový medvěd', emoji:'🐻‍❄️',str:6,xp:4, gold:0, tameble:true,  tameRep:'neutral',ability:'Zmrazí na 1 kolo.' },
    { name:'Obří škorpión', emoji:'🦂', str:5, xp:4, gold:1, tameble:true,  tameRep:'evil',  ability:'Jedovatý ocas.' },
  ],
  4: [
    { name:'Temný rytíř',   emoji:'⚫', str:8, xp:7, gold:5, tameble:false, ability:'Kopíruje útok hráče.' },
    { name:'Stínový vrah',  emoji:'🗡️', str:7, xp:6, gold:3, tameble:false, ability:'Útočí z neviditelna.' },
    { name:'Kostěný válečník',emoji:'🦴',str:8,xp:6,gold:2, tameble:false, ability:'Povstane znovu 1x.' },
    { name:'Temný kouzelník',emoji:'🔮',str:7, xp:7, gold:4, tameble:false, ability:'Krade Manu místo ŽP.' },
  ],
  5: [
    { name:'Strážce brány', emoji:'👁️', str:9, xp:10,gold:5, tameble:false, ability:'Volá posily.' },
    { name:'Pan Zla — Fáze 1',emoji:'👑',str:10,xp:20,gold:20,tameble:false,ability:'Armáda — nejdřív vyčisti vojáky.' },
    { name:'Pan Zla — Fáze 2',emoji:'😈',str:12,xp:0,gold:0,tameble:false, ability:'Osobní souboj se schopnostmi.' },
    { name:'Pan Zla — Fáze 3',emoji:'💀',str:14,xp:0,gold:0,tameble:false, ability:'Zoufalý AoE útok každé kolo.' },
  ],
};

// ── PŘEDMĚTY ──────────────────────────────────────────────────────────────────
export const ITEMS = [
  { name:'Krátký meč',      emoji:'🗡️', type:'passive', bonus:'str',    val:1, desc:'+1 Síla v boji.' },
  { name:'Dlouhý meč',      emoji:'⚔️', type:'passive', bonus:'str',    val:2, desc:'+2 Síla v boji.' },
  { name:'Elfský luk',      emoji:'🏹', type:'passive', bonus:'skill',  val:2, desc:'+2 Dovednost.' },
  { name:'Válečná sekera',  emoji:'🪓', type:'passive', bonus:'str',    val:2, desc:'+2 Síla, ignoruje zbroj.' },
  { name:'Kožená zbroj',    emoji:'🥋', type:'passive', bonus:'defense',val:1, desc:'+1 Obrana.' },
  { name:'Kroužková zbroj', emoji:'⛓️', type:'passive', bonus:'defense',val:2, desc:'+2 Obrana.' },
  { name:'Plná zbroj',      emoji:'🛡️', type:'passive', bonus:'defense',val:3, desc:'+3 Obrana.' },
  { name:'Amulet síly',     emoji:'💪', type:'passive', bonus:'str',    val:1, desc:'+1 Síla.' },
  { name:'Prsten osudu',    emoji:'💍', type:'passive', bonus:'fate',   val:2, desc:'+2 Osud.' },
  { name:'Boty větru',      emoji:'👟', type:'passive', bonus:'move',   val:1, desc:'+1 Pohyb.' },
  { name:'Plášť neviditeln.',emoji:'🧥',type:'passive', bonus:'skill',  val:2, desc:'+2 Dovednost.' },
  { name:'Lektvar léčení',  emoji:'🧪', type:'use',     bonus:'heal',   val:3, desc:'Obnoví 3 životy.' },
  { name:'Lektvar síly',    emoji:'💉', type:'use',     bonus:'str',    val:2, desc:'+2 Síla na 1 tah.' },
  { name:'Elixír moudrosti',emoji:'✨', type:'use',     bonus:'skill',  val:2, desc:'+2 Dovednost na 1 tah.' },
  { name:'Mapa oblasti',    emoji:'🗺️', type:'use',     bonus:'map',    val:1, desc:'Odkryje skrytá místa.' },
  { name:'Zlatý klíč',      emoji:'🗝️', type:'use',     bonus:'unlock', val:1, desc:'Odemkne truhlu nebo bránu.' },
  { name:'Runový meč',      emoji:'🌟', type:'passive', bonus:'str',    val:3, desc:'+3 Síla, magický útok.' },
  { name:'Dračí kopí',      emoji:'🔱', type:'passive', bonus:'str',    val:4, desc:'+4 Síla, +1 Obrana.' },
  { name:'Mystická hůl',    emoji:'🪄', type:'passive', bonus:'skill',  val:3, desc:'+3 Dovednost, +1 Mana/tah.' },
  { name:'Štít rytíře',     emoji:'🛡️', type:'passive', bonus:'defense',val:2, desc:'+2 Obrana, +1 ŽP.' },
];

// ── UDÁLOSTI ──────────────────────────────────────────────────────────────────
export const EVENTS = [
  { name:'Zlatá mince',     emoji:'🪙', desc:'Najdeš minci na cestě.',            fx:'gold',  val:1  },
  { name:'Poklad',          emoji:'💰', desc:'Odkryješ truhlu s pokladem!',       fx:'gold',  val:3  },
  { name:'Past',            emoji:'🪤', desc:'Šlápneš do pasti!',                 fx:'dmg',   val:1  },
  { name:'Požehnání',       emoji:'✨', desc:'Kněz ti požehná.',                  fx:'fate',  val:1  },
  { name:'Léčivý pramen',   emoji:'💚', desc:'Nalezneš čistý pramen.',            fx:'heal',  val:2  },
  { name:'Přepadení',       emoji:'💸', desc:'Bandité ukradnou tvé zlato!',       fx:'gold',  val:-2 },
  { name:'Tajemná kniha',   emoji:'📖', desc:'Získáš tajné znalosti.',            fx:'skill', val:1  },
  { name:'Výcvik',          emoji:'💪', desc:'Tvrdě cvičíš celý den.',            fx:'str',   val:1  },
  { name:'Klid',            emoji:'😌', desc:'Poklidný den bez dobrodružství.',   fx:'none',  val:0  },
  { name:'Dobrý skutek',    emoji:'🤝', desc:'Pomáháš vesničanům.',               fx:'rep',   val:1  },
  { name:'Temné pokušení',  emoji:'😈', desc:'Podléháš temnému pokušení.',        fx:'rep',   val:-1 },
  { name:'Ztracený kupec',  emoji:'🛒', desc:'Zachráníš kupce. Odmění tě.',       fx:'gold',  val:2  },
  { name:'Záhadný stařec',  emoji:'🧓', desc:'Stařec ti věnuje moudrost.',        fx:'fate',  val:2  },
  { name:'Zloděj v noci',   emoji:'🌙', desc:'Někdo ti ukradl v noci.',           fx:'gold',  val:-1 },
  { name:'Tajný poklad',    emoji:'🗝️', desc:'Najdeš skrytou truhlu.',            fx:'gold',  val:4  },
  { name:'Kletba pohybem',  emoji:'💜', desc:'Prokletí zpomalí tvé kroky.',       fx:'none',  val:0  },
  { name:'Hrdinský čin',    emoji:'🦸', desc:'Zachráníš vesničana — sláva!',      fx:'rep',   val:2  },
];

// ── BALÍČEK KARET ─────────────────────────────────────────────────────────────
const DECKS = {};

function buildDeck(zone = 1) {
  const cards   = [];
  const enemies = ENEMIES_BY_ZONE[zone] || ENEMIES_BY_ZONE[1];
  enemies.forEach(e => {
    cards.push({ type:'enemy', data:e });
    cards.push({ type:'enemy', data:e });
  });
  shuffle(ITEMS).slice(0, 8).forEach(i => {
    cards.push({ type:'item', data:i });
  });
  EVENTS.forEach(e => {
    cards.push({ type:'event', data:e });
  });
  return shuffle(cards);
}

export function drawCard(zone = 1) {
  if (!DECKS[zone] || DECKS[zone].length === 0) DECKS[zone] = buildDeck(zone);
  return DECKS[zone].shift() || buildDeck(zone).shift();
}
