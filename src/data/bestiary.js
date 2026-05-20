// src/data/bestiary.js
// Kompletní bestiář — všechny příšery, boss příšery, Pan Zla

// ── TYPY PŘÍŠER ───────────────────────────────────────────────────────────────
export const CREATURE_TYPES = {
  beast:    { name:'Zvíře',        emoji:'🐾', weakTo:'fire',    resistTo:'poison' },
  undead:   { name:'Nemrtvý',      emoji:'💀', weakTo:'holy',    resistTo:'poison' },
  humanoid: { name:'Humanoid',     emoji:'👤', weakTo:'none',    resistTo:'none'   },
  magical:  { name:'Magický',      emoji:'✨', weakTo:'physical',resistTo:'magic'  },
  dragon:   { name:'Drak',         emoji:'🐉', weakTo:'ice',     resistTo:'fire'   },
  construct:{ name:'Konstrukt',    emoji:'⚙️', weakTo:'magic',   resistTo:'physical'},
  spirit:   { name:'Duch',         emoji:'👻', weakTo:'holy',    resistTo:'physical'},
};

// ── BESTIÁŘ PODLE ZÓN ────────────────────────────────────────────────────────

export const BESTIARY = {

  // ══ ZÓNA 1 — Klidná krajina ════════════════════════════════════════════════
  1: [
    {
      id: 'wild_boar', name: 'Divoký kanec', emoji: '🐗',
      type: 'beast', zone: 1, rarity: 'common',
      str: 2, life: 3, xp: 1, gold: 0,
      tameble: true, tameRep: 'any', tameThreshold: 0.25,
      abilities: [
        { id:'charge', name:'Náboj', trigger:'first_attack', desc:'První útok +2 Síla.' },
      ],
      loot: [{ item:'Kančí kly', emoji:'🦷', chance:0.3, bonus:'str', val:1 }],
      petStats: { str:2, life:4, move:2, ability:'Náboj — první útok v souboji +1.' },
      desc: 'Zuřivý kanec z polí. Nebezpečný hlavně při prvním útoku.',
      flavor: 'Ohrožený kanec útočí bez přemýšlení — jen zuby a kopyta.',
    },
    {
      id: 'wolf', name: 'Vlk', emoji: '🐺',
      type: 'beast', zone: 1, rarity: 'common',
      str: 2, life: 3, xp: 1, gold: 0,
      tameble: true, tameRep: 'neutral', tameThreshold: 0.25,
      abilities: [
        { id:'pack', name:'Smečka', trigger:'always', desc:'Pokud je na poli jiný vlk, +1 Síla.' },
      ],
      loot: [{ item:'Vlčí kůže', emoji:'🧥', chance:0.35, bonus:'defense', val:1 }],
      petStats: { str:3, life:4, move:3, ability:'Stopování — vidíš typ příští karty.' },
      desc: 'Šedý vlk. Nebezpečnější ve smečce.',
      flavor: 'Vlci jsou chytřejší než vypadají. Vždy útočí ve správný moment.',
    },
    {
      id: 'forest_pest', name: 'Lesní škůdce', emoji: '🦝',
      type: 'beast', zone: 1, rarity: 'common',
      str: 1, life: 2, xp: 1, gold: 1,
      tameble: false, tameRep: null, tameThreshold: null,
      abilities: [
        { id:'steal', name:'Krádež', trigger:'on_win', desc:'Ukradne 1 zlato pokud vyhraje.' },
      ],
      loot: [],
      desc: 'Drobný zloděj lesa. Snadno porazitelný.',
      flavor: 'Jejich malé tlapky jsou překvapivě zručné.',
    },
    {
      id: 'bandit', name: 'Bandit', emoji: '🥷',
      type: 'humanoid', zone: 1, rarity: 'common',
      str: 3, life: 4, xp: 2, gold: 2,
      tameble: false, tameRep: null, tameThreshold: null,
      abilities: [
        { id:'rob', name:'Loupež', trigger:'on_win', desc:'Ukradne 2 zlata pokud vyhraje.' },
        { id:'ambush', name:'Přepadení', trigger:'first_round', desc:'Iniciativa +2 v prvním kole.' },
      ],
      loot: [{ item:'Banditský meč', emoji:'🗡️', chance:0.4, bonus:'str', val:1 }],
      desc: 'Ozbrojený lupič. Chce jen tvé zlato.',
      flavor: 'Říká se, že byl kdysi vojákem. Válka ho zlomila.',
    },
    {
      id: 'snake', name: 'Had', emoji: '🐍',
      type: 'beast', zone: 1, rarity: 'uncommon',
      str: 2, life: 2, xp: 1, gold: 0,
      tameble: true, tameRep: 'evil', tameThreshold: 0.25,
      abilities: [
        { id:'poison', name:'Jed', trigger:'on_hit', desc:'Při zásahu způsobí status Otrava (−1 ŽP/tah, 3 tahy).' },
      ],
      loot: [{ item:'Hadí jed', emoji:'☠️', chance:0.5, bonus:'skill', val:1, note:'Použitelný na zbraň' }],
      petStats: { str:2, life:3, move:2, ability:'Jedový útok — každý útok peta způsobí Otravu.' },
      desc: 'Jedovatý had. Malý, ale zákeřný.',
      flavor: 'Hadi nepotřebují velikost. Stačí jedna kapka jedu.',
    },
    {
      id: 'bear', name: 'Medvěd', emoji: '🐻',
      type: 'beast', zone: 1, rarity: 'rare',
      str: 4, life: 6, xp: 3, gold: 0,
      tameble: true, tameRep: 'good', tameThreshold: 0.25,
      abilities: [
        { id:'maul', name:'Roztrhání', trigger:'on_crit', desc:'Kritický zásah způsobí Krvácení (−1 ŽP/tah, 2 tahy).' },
        { id:'tough', name:'Odolný', trigger:'passive', desc:'Každý útok způsobí o 1 méně poškození.' },
      ],
      loot: [{ item:'Medvědí kůže', emoji:'🧸', chance:0.25, bonus:'defense', val:2 }],
      petStats: { str:4, life:7, move:1, ability:'Tank — přesměruje 1 útok na sebe.' },
      desc: 'Obrovský medvěd. Silný a odolný — ale ochočitelný pro dobré postavy.',
      flavor: 'Matka medvědice chrání svá mláďata za cenu vlastního života.',
    },
    {
      id: 'fox_spirit', name: 'Liščí duch', emoji: '🦊',
      type: 'spirit', zone: 1, rarity: 'rare',
      str: 1, life: 2, xp: 2, gold: 0,
      tameble: true, tameRep: 'good', tameThreshold: 0.25,
      abilities: [
        { id:'luck', name:'Štěstěna', trigger:'passive', desc:'Hráč +1 Osud pokud je v zóně 1.' },
      ],
      loot: [],
      petStats: { str:1, life:3, move:3, ability:'Štěstí — majitel +1 k hodu jednou za tah.' },
      desc: 'Vzácný duch lesa. Přináší štěstí svému pánu.',
      flavor: 'Liščí duchové jsou poslové lesa. Naslouchají tajemstvím stromů.',
    },
  ],

  // ══ ZÓNA 2 — Pohraniční království ════════════════════════════════════════
  2: [
    {
      id: 'goblin', name: 'Skřet', emoji: '👺',
      type: 'humanoid', zone: 2, rarity: 'common',
      str: 3, life: 4, xp: 2, gold: 1,
      tameble: false,
      abilities: [
        { id:'call_kin', name:'Přivolání', trigger:'on_low_hp', desc:'Pod 50% ŽP přivolá dalšího skřeta.' },
      ],
      loot: [{ item:'Skřetí zlaté', emoji:'🪙', chance:0.6, bonus:'gold', val:1 }],
      desc: 'Malý a záludný. V nouzi přivolá posilu.',
      flavor: 'Skřeti jsou zbabělci, ale v hordách jsou smrtelní.',
    },
    {
      id: 'skeleton', name: 'Kostlivec', emoji: '💀',
      type: 'undead', zone: 2, rarity: 'common',
      str: 3, life: 5, xp: 2, gold: 1,
      tameble: false,
      abilities: [
        { id:'poison_immune', name:'Imunita jedu', trigger:'passive', desc:'Imunní vůči jedu a krvácení.' },
        { id:'brittle', name:'Křehké kosti', trigger:'passive', desc:'Magické útoky způsobují +2 damage.' },
      ],
      loot: [{ item:'Kostěná zbroj', emoji:'🦴', chance:0.2, bonus:'defense', val:1 }],
      desc: 'Nemrtvý bojovník. Imunní vůči jedu.',
      flavor: 'Smrt je jen začátek. Kostlivci bojují bez strachu a bolesti.',
    },
    {
      id: 'troll', name: 'Troll', emoji: '🧌',
      type: 'beast', zone: 2, rarity: 'uncommon',
      str: 5, life: 8, xp: 3, gold: 2,
      tameble: false,
      abilities: [
        { id:'regen', name:'Regenerace', trigger:'start_of_round', desc:'Obnoví 1 ŽP na začátku každého kola.' },
        { id:'smash', name:'Drtivý úder', trigger:'every_2_rounds', desc:'Každé 2. kolo útok +2 Síla.' },
      ],
      loot: [{ item:'Trollí krev', emoji:'💚', chance:0.3, bonus:'heal', val:2, note:'Lektvar' }],
      desc: 'Obří troll s regenerací. Zabij ho rychle!',
      flavor: 'Trollí krev je zelená a kyselá. A hojí rány jako nic jiného.',
    },
    {
      id: 'harpy', name: 'Harpia', emoji: '🦅',
      type: 'beast', zone: 2, rarity: 'uncommon',
      str: 4, life: 4, xp: 2, gold: 1,
      tameble: false,
      abilities: [
        { id:'steal_item', name:'Krádež předmětu', trigger:'on_win', desc:'Ukradne náhodný předmět z inventáře.' },
        { id:'fly', name:'Let', trigger:'passive', desc:'Nelze ji postihnout zemními pastmi.' },
      ],
      loot: [],
      desc: 'Okřídlená stvůra. Krade předměty!',
      flavor: 'Harpie jsou přitahovány lesklými věcmi jako vrány.',
    },
    {
      id: 'swamp_croc', name: 'Bažinný krokodýl', emoji: '🐊',
      type: 'beast', zone: 2, rarity: 'uncommon',
      str: 4, life: 6, xp: 3, gold: 0,
      tameble: true, tameRep: 'evil', tameThreshold: 0.25,
      abilities: [
        { id:'death_roll', name:'Rotační úder', trigger:'on_crit', desc:'Kritický zásah znehybní nepřítele na 1 kolo.' },
        { id:'ambush_water', name:'Záloha', trigger:'first_round', desc:'Iniciativa vždy +3 v bažinách.' },
      ],
      petStats: { str:5, life:7, move:1, ability:'Pohlcení — jednou za souboj může okamžitě sežrat slabou příšeru (do 2 Síly).' },
      desc: 'Starý krokodýl z bažin. Pro zlé postavy ochočitelný.',
      flavor: 'Krokodýli existují miliony let. Mají důvod.',
    },
    {
      id: 'bandit_lord', name: 'Vůdce loupežníků', emoji: '🗡️',
      type: 'humanoid', zone: 2, rarity: 'rare',
      str: 5, life: 7, xp: 4, gold: 5,
      tameble: false,
      abilities: [
        { id:'battle_cry', name:'Bojový pokřik', trigger:'first_round', desc:'Spojenci dostají +1 Síla.' },
        { id:'loot_all', name:'Vyloupit', trigger:'on_win', desc:'Vezme veškeré zlato, ne jen část.' },
      ],
      loot: [{ item:'Vůdcův meč', emoji:'⚔️', chance:0.5, bonus:'str', val:2 }],
      desc: 'Velitel banditů. Silný a chamtivý.',
      flavor: 'Říkal si král lesa. Nikdo se mu neodvážil odporovat — než ty.',
    },
  ],

  // ══ ZÓNA 3 — Divoká divočina ══════════════════════════════════════════════
  3: [
    {
      id: 'mountain_troll', name: 'Horský troll', emoji: '🧌',
      type: 'beast', zone: 3, rarity: 'common',
      str: 6, life: 10, xp: 4, gold: 2,
      tameble: false,
      abilities: [
        { id:'boulder', name:'Hod kamenem', trigger:'every_3_rounds', desc:'Každé 3. kolo dálkový útok +4.' },
        { id:'tough_skin', name:'Kamenná kůže', trigger:'passive', desc:'-1 na všechny fyzické útoky.' },
      ],
      loot: [{ item:'Trollí kamen', emoji:'🪨', chance:0.25, bonus:'defense', val:2 }],
      desc: 'Obrovský horský troll s kamennou kůží.',
      flavor: 'Horské trolové jsou staří jako samotné hory. A stejně tvrdí.',
    },
    {
      id: 'griffin', name: 'Gryf', emoji: '🦁',
      type: 'beast', zone: 3, rarity: 'rare',
      str: 6, life: 8, xp: 5, gold: 0,
      tameble: true, tameRep: 'good', tameThreshold: 0.25,
      abilities: [
        { id:'dive', name:'Skok z výšky', trigger:'first_round', desc:'Útok z výšky ignoruje obranu v prvním kole.' },
        { id:'noble', name:'Ušlechtilý', trigger:'passive', desc:'Nelze ho ochočit zlými postavami.' },
      ],
      petStats: { str:5, life:8, move:3, ability:'Let — každý tah se může přesunout na libovolné pole stejné zóny.' },
      desc: 'Majestátní gryf. Vzácný a mocný — jen pro čestné hrdiny.',
      flavor: 'Gryf nikdy neslouží zbabělcům. Cítí záměry svého pána.',
    },
    {
      id: 'young_dragon', name: 'Mladý drak', emoji: '🐲',
      type: 'dragon', zone: 3, rarity: 'rare',
      str: 7, life: 12, xp: 6, gold: 8,
      tameble: false,
      abilities: [
        { id:'fire_breath', name:'Ohnivý dech', trigger:'every_2_rounds', desc:'Každé 2. kolo AoE útok +3, zasáhne všechny na poli.' },
        { id:'scales', name:'Dračí šupiny', trigger:'passive', desc:'-2 na všechny útoky díky šupinám.' },
        { id:'dragon_fear', name:'Dračí strach', trigger:'first_round', desc:'Nepřítel musí hodit 4+ nebo ztratí 1 akci.' },
      ],
      loot: [
        { item:'Dračí šupina', emoji:'🐲', chance:0.4, bonus:'defense', val:2 },
        { item:'Dračí dráp', emoji:'🔱', chance:0.2, bonus:'str', val:3 },
      ],
      desc: 'Mladý, ale smrtelně nebezpečný drak. Ohnivý dech zasáhne celé pole.',
      flavor: 'I mladý drak je starodávný. Jeho zuby zažily bitvy tvých prarodičů.',
    },
    {
      id: 'stone_golem', name: 'Kamenný golem', emoji: '🗿',
      type: 'construct', zone: 3, rarity: 'uncommon',
      str: 7, life: 14, xp: 5, gold: 0,
      tameble: false,
      abilities: [
        { id:'magic_weak', name:'Zranitelný magií', trigger:'passive', desc:'Magické útoky způsobují +3 damage.' },
        { id:'weapon_resist', name:'Odolnost zbraním', trigger:'passive', desc:'-2 na fyzické útoky.' },
        { id:'slow', name:'Pomalý', trigger:'passive', desc:'Iniciativa vždy -2.' },
      ],
      loot: [{ item:'Kamenné srdce', emoji:'💎', chance:0.15, bonus:'defense', val:3 }],
      desc: 'Magický konstrukt. Odolný vůči zbraním, zranitelný magií.',
      flavor: 'Hlídá poklady svého tvůrce. Tvůrce je dávno mrtvý. Golem stále hlídá.',
    },
    {
      id: 'ice_bear', name: 'Ledový medvěd', emoji: '🐻‍❄️',
      type: 'beast', zone: 3, rarity: 'uncommon',
      str: 6, life: 9, xp: 4, gold: 0,
      tameble: true, tameRep: 'neutral', tameThreshold: 0.25,
      abilities: [
        { id:'freeze', name:'Zmražení', trigger:'on_hit', desc:'Každý útok může zmrazit nepřítele (hod 4+) na 1 kolo.' },
        { id:'cold_aura', name:'Ledová aura', trigger:'passive', desc:'Nepřátelé blízko ztrácejí 1 pohyb.' },
      ],
      petStats: { str:5, life:10, move:2, ability:'Ledová aura — každý nepřítel v souboji -1 Pohyb a iniciativa.' },
      desc: 'Medvěd z věčně zamrzlých hor. Zmrazí každého svým dotekem.',
      flavor: 'V jeho očích vidíš zimu věčnosti.',
    },
    {
      id: 'giant_scorpion', name: 'Obří škorpión', emoji: '🦂',
      type: 'beast', zone: 3, rarity: 'uncommon',
      str: 5, life: 6, xp: 4, gold: 1,
      tameble: true, tameRep: 'evil', tameThreshold: 0.25,
      abilities: [
        { id:'venom', name:'Smrtelný jed', trigger:'on_hit', desc:'Jed způsobuje −2 ŽP/tah místo −1.' },
        { id:'pinch', name:'Klepeta', trigger:'on_crit', desc:'Kritický zásah paralyzuje na 1 kolo.' },
      ],
      petStats: { str:4, life:6, move:2, ability:'Smrtelný jed — všechny útoky peta způsobují status Otrava.' },
      desc: 'Obrovský škorpión s paralyzujícím jedem.',
      flavor: 'Škorpión čeká. Škorpión vždy čeká.',
    },
  ],

  // ══ ZÓNA 4 — Prokletá země ════════════════════════════════════════════════
  4: [
    {
      id: 'dark_knight', name: 'Temný rytíř', emoji: '⚫',
      type: 'undead', zone: 4, rarity: 'common',
      str: 8, life: 12, xp: 7, gold: 5,
      tameble: false,
      abilities: [
        { id:'mirror', name:'Zrcadlový útok', trigger:'on_hit', desc:'Vrátí 50% obdrženého poškození útočníkovi.' },
        { id:'dark_aura', name:'Temná aura', trigger:'passive', desc:'Snižuje Osud nepřátel o 1 po dobu souboje.' },
      ],
      loot: [
        { item:'Temná zbroj', emoji:'⚫', chance:0.3, bonus:'defense', val:3 },
        { item:'Prokletý meč', emoji:'🗡️', chance:0.25, bonus:'str', val:4 },
      ],
      desc: 'Padlý rytíř. Vrací část poškození útočníkovi.',
      flavor: 'Kdysi chránil království. Nyní ho ohrožuje.',
    },
    {
      id: 'shadow_assassin', name: 'Stínový vrah', emoji: '🗡️',
      type: 'spirit', zone: 4, rarity: 'uncommon',
      str: 7, life: 8, xp: 6, gold: 3,
      tameble: false,
      abilities: [
        { id:'first_strike', name:'První úder', trigger:'first_round', desc:'Vždy útočí první bez ohledu na iniciativu.' },
        { id:'shadow_meld', name:'Splývání se stínem', trigger:'passive', desc:'Po prohraném kole zmizí — souboj se opakuje.' },
      ],
      loot: [{ item:'Stínový plášť', emoji:'🧥', chance:0.35, bonus:'skill', val:3 }],
      desc: 'Útočí vždy první. Zmizí ve stínu pokud prohraje.',
      flavor: 'Neexistuje jako bytost. Je jen prodloužení tmy.',
    },
    {
      id: 'bone_warrior', name: 'Kostěný válečník', emoji: '🦴',
      type: 'undead', zone: 4, rarity: 'uncommon',
      str: 8, life: 10, xp: 6, gold: 2,
      tameble: false,
      abilities: [
        { id:'undying', name:'Nezničitelný', trigger:'on_death', desc:'Při prvním "zabití" vstane znovu s 3 ŽP.' },
        { id:'bone_shield', name:'Kostěný štít', trigger:'passive', desc:'+2 Obrana díky kostěné výzbroji.' },
      ],
      loot: [{ item:'Starověká kost', emoji:'🦴', chance:0.4, bonus:'str', val:1, note:'Magická zbraň' }],
      desc: 'Vstane znovu po prvním zabití. Zabij ho dvakrát!',
      flavor: 'Smrt ho jednou nepodolala. Proč by to zvládla teď?',
    },
    {
      id: 'dark_mage', name: 'Temný kouzelník', emoji: '🔮',
      type: 'magical', zone: 4, rarity: 'rare',
      str: 7, life: 9, xp: 7, gold: 4,
      tameble: false,
      abilities: [
        { id:'mana_drain', name:'Vysát manu', trigger:'on_hit', desc:'Každý útok krade 2 Manu místo ŽP.' },
        { id:'spell_reflect', name:'Odraz kouzla', trigger:'passive', desc:'50% šance odrazit magický útok zpět.' },
        { id:'curse', name:'Prokletí', trigger:'on_win', desc:'Pokud vyhraje, hráč dostane status Prokletý (−2 Osud, 3 tahy).' },
      ],
      loot: [{ item:'Temná kniha kouzel', emoji:'📕', chance:0.2, bonus:'skill', val:3 }],
      desc: 'Krade Manu místo životů. Nebezpečný pro mágy.',
      flavor: 'Prodal duši za moc. Kouzelník si nemyslí, že udělal špatně.',
    },
  ],

  // ══ ZÓNA 5 — Citadela (Bossové) ═══════════════════════════════════════════
  5: [
    {
      id: 'gate_guardian', name: 'Strážce brány', emoji: '👁️',
      type: 'construct', zone: 5, rarity: 'boss',
      str: 9, life: 18, xp: 10, gold: 5,
      tameble: false,
      abilities: [
        { id:'summon_guards', name:'Posily', trigger:'every_2_rounds', desc:'Každé 2 kola přivolá 2 strážce (Síla 4).' },
        { id:'eye_beam', name:'Paprsek oka', trigger:'on_low_hp', desc:'Pod 50% ŽP útočí dvakrát za kolo.' },
      ],
      loot: [{ item:'Klíč od citadely', emoji:'🗝️', chance:1.0, bonus:'unlock', val:1 }],
      desc: 'Boss Zóny 5 — vstupní brána. Coop nutný.',
      flavor: 'Pan Zla stvořil tohoto strážce z tisíců padlých duší.',
    },
  ],
};

// ── PAN ZLA — FINÁLNÍ BOSS ────────────────────────────────────────────────────

export const DARK_LORD = {
  id: 'dark_lord',
  name: 'Pan Zla',
  emoji: '👑',
  title: 'Vládce temnoty',
  lore: 'Kdysi byl nejmocnějším králem světa. Pak ztratil vše — a odpovědí na ztrátu se stala temnota. Nyní vládne ze své citadely a jeho stín padá na celý svět.',

  phases: [
    {
      phase: 1, name: 'Armáda Pana Zla', emoji: '⚔️',
      str: 10, life: 20,
      desc: 'Nejdřív musí hráči porazit jeho armádu. Strážci mají Síla 5 každý.',
      abilities: [
        { id:'army', name:'Armáda', trigger:'always', desc:'Přivolává 3 strážce (Síla 5) — musí být poraženi před souboji s Pánem.' },
        { id:'taunt', name:'Posměch', trigger:'passive', desc:'Hráči −1 k hodu, dokud stojí mimo dosah Pána.' },
      ],
      deathMsg: 'Armáda padla! Pan Zla vstupuje do boje!',
    },
    {
      phase: 2, name: 'Pan Zla — Osobní souboj', emoji: '😈',
      str: 12, life: 25,
      desc: 'Přímý souboj. Používá schopnosti každé kolo.',
      abilities: [
        { id:'shadow_bolt', name:'Stínový blesk', trigger:'every_round', desc:'Každé kolo způsobí 2 damage navíc.' },
        { id:'drain_life', name:'Vysát životy', trigger:'on_hit', desc:'Každý útok léčí Pána o 1 ŽP.' },
        { id:'despair', name:'Zoufalství', trigger:'passive', desc:'Všichni hráči −1 Osud po dobu boje.' },
      ],
      deathMsg: 'Pan Zla byl zasažen! Zuří zoufalstvím...',
    },
    {
      phase: 3, name: 'Pan Zla — Zoufalý útok', emoji: '💀',
      str: 14, life: 15,
      desc: 'Zoufalá fáze. AoE útok každé kolo — zasáhne všechny hráče.',
      abilities: [
        { id:'aoe_rage', name:'Zoufalá zuřivost', trigger:'every_round', desc:'AoE útok Síla 6 každé kolo — zasáhne VŠECHNY hráče na poli.' },
        { id:'last_stand', name:'Poslední vzdor', trigger:'passive', desc:'Síla +1 za každého mrtvého hráče.' },
        { id:'world_end', name:'Konec světa', trigger:'on_low_hp', desc:'Pod 30% ŽP: další kolo způsobí 10 damage všem — je to countdown.' },
      ],
      deathMsg: '👑 PAN ZLA BYL PORAŽEN! SVĚT JE ZACHRÁNĚN!',
    },
  ],
};

// ── ZÓNOVÍ BOSSOVÉ ────────────────────────────────────────────────────────────
export const ZONE_BOSSES = {
  2: {
    id: 'swamp_king', name: 'Bažinný král', emoji: '👑',
    str: 7, life: 15, xp: 8, gold: 8,
    abilities: [
      { id:'poison_swamp', name:'Jedovaté bažiny', trigger:'always', desc:'Každé kolo všichni hráči −1 ŽP ze smogu.' },
      { id:'mud_grab', name:'Bahno', trigger:'every_2_rounds', desc:'Zastaví náhodného hráče na 1 kolo.' },
    ],
    desc: 'Boss Zóny 2. Ovládá bažiny a jedy.',
    loot: [{ item:'Koruna bažinného krále', emoji:'👑', chance:1.0, bonus:'fate', val:3 }],
  },
  3: {
    id: 'ancient_dragon', name: 'Starý drak', emoji: '🐉',
    str: 9, life: 20, xp: 12, gold: 15,
    abilities: [
      { id:'inferno', name:'Infernum', trigger:'every_2_rounds', desc:'AoE ohnivý útok — zasáhne všechny hráče +4.' },
      { id:'wing_blast', name:'Úder křídlem', trigger:'every_3_rounds', desc:'Odhodí hráče zpět na začátek zóny.' },
      { id:'ancient_scales', name:'Prastaré šupiny', trigger:'passive', desc:'-3 na všechny útoky díky šupinám.' },
    ],
    desc: 'Boss Zóny 3. Prastarý drak s ohnivým dechem.',
    loot: [{ item:'Dračí srdce', emoji:'🔥', chance:1.0, bonus:'str', val:4 }],
  },
  4: {
    id: 'lich_king', name: 'Lichův král', emoji: '💀',
    str: 10, life: 22, xp: 15, gold: 12,
    abilities: [
      { id:'phylactery', name:'Fylaktérium', trigger:'on_death', desc:'Vstane znovu jednou — zničte fylaktérium (speciální akce) pro trvalou smrt.' },
      { id:'undead_army', name:'Armáda nemrtvých', trigger:'every_3_rounds', desc:'Přivolá 3 kostlivce.' },
      { id:'soul_rend', name:'Trhání duší', trigger:'on_hit', desc:'Každý útok snižuje max ŽP o 1.' },
    ],
    desc: 'Boss Zóny 4. Vstane znovu — zničte phylaktérium!',
    loot: [{ item:'Temná koruna', emoji:'💀', chance:1.0, bonus:'skill', val:4 }],
  },
};

// ── HELPER FUNKCE ─────────────────────────────────────────────────────────────

export function getEnemyById(id, zone) {
  const zoneEnemies = BESTIARY[zone] || [];
  return zoneEnemies.find(e => e.id === id) || null;
}

export function getRandomEnemy(zone) {
  const enemies = BESTIARY[zone] || BESTIARY[1];
  const weights = enemies.map(e => ({
    rare: 0.05, uncommon: 0.2, common: 0.6, boss: 0.05,
  }[e.rarity] || 0.3));
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < enemies.length; i++) {
    r -= weights[i];
    if (r <= 0) return enemies[i];
  }
  return enemies[0];
}

export function canTame(enemy, playerRep, playerClass) {
  if (!enemy.tameble) return { ok: false, reason: 'Tato příšera nejde ochočit.' };
  if (enemy.tameRep === 'good'    && playerRep < 3)  return { ok: false, reason: 'Potřebuješ dobrou reputaci (+3).' };
  if (enemy.tameRep === 'evil'    && playerRep > -3) return { ok: false, reason: 'Potřebuješ zlou reputaci (−3).' };
  if (enemy.tameRep === 'neutral' && Math.abs(playerRep) > 6) return { ok: false, reason: 'Příliš extrémní reputace.' };
  return { ok: true };
}

export function rollTame(enemy, playerSkill, playerFate, factionBonus = 0) {
  const roll     = Math.floor(Math.random() * 6) + 1;
  const bonus    = Math.floor((playerSkill + playerFate) / 3) + factionBonus;
  const needed   = enemy.str + 2;
  const success  = (roll + bonus) >= needed;
  return { roll, bonus, needed, success, total: roll + bonus };
}
