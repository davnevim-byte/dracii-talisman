// src/game/narrator.js
// AI Vypravěč — volá Anthropic API pro příběhové popisy

const MODEL = 'claude-sonnet-4-20250514';

// ── Systémový prompt vypravěče ────────────────────────────────────────────────

const NARRATOR_SYSTEM = `Jsi epický vypravěč fantasy RPG hry Dračí Talisman. 
Vyprávíš příběh skupině hráčů kteří sedí u stolu a hrají deskovou hru.

STYL:
- Dramatický, atmosférický, středověko-fantasy
- Krátké a výstižné — max 2-3 věty na scénu
- Přímé oslovení hráče ("Vstoupil jsi...", "Před tebou se tyčí...")
- Žádná krev, žádná démonistika, žádná přímá hrůza
- Napětí místo hrůzy, dobrodružství místo násilí
- Divoká příroda, mystika, magie, hrdinství

FORMÁT:
- Odpovídej POUZE příběhovým textem, žádné meta-komentáře
- Bez uvozovek kolem celé odpovědi
- Emoji povoleny na začátku max 1x pro atmosféru`;

// ── Helper: volání API ────────────────────────────────────────────────────────

async function callNarrator(prompt, maxTokens = 120) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: NARRATOR_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    return text.trim();
  } catch (err) {
    console.error('Narrator error:', err);
    return null;
  }
}

// ── KONKRÉTNÍ NARÁTORSKÉ FUNKCE ───────────────────────────────────────────────

/**
 * Popis příchodu do lokace
 */
export async function narrateLocation(locationName, locationType, zoneName, weather, timeOfDay, playerName, playerClass) {
  const timeMap = { dawn:'svítání', morning:'ráno', day:'poledne', evening:'večer', night:'noc' };
  const weatherMap = { sunny:'slunečno', rain:'déšť', storm:'bouře', fog:'hustá mlha', snow:'sněžení', cloudy:'zataženo', heatwave:'dusné vedro' };

  const prompt = `${playerName} (${playerClass}) přichází do lokace: ${locationName} (${locationType === 'safe' ? 'bezpečné místo' : locationType === 'dangerous' ? 'nebezpečná oblast' : locationType}).
Zóna: ${zoneName}. Počasí: ${weatherMap[weather] || weather}. Čas: ${timeMap[timeOfDay] || timeOfDay}.
Popiš příchod do tohoto místa — 2 věty, atmosféricky.`;

  return callNarrator(prompt, 100);
}

/**
 * Popis setkání s příšerou
 */
export async function narrateEnemyEncounter(enemyName, enemyDesc, enemyFlavor, zoneName, timeOfDay, playerName) {
  const prompt = `${playerName} se setkává s: ${enemyName}.
Popis příšery: ${enemyDesc || ''}. Příběhový detail: ${enemyFlavor || ''}.
Místo: ${zoneName}. Čas: ${timeOfDay === 'night' ? 'temná noc' : timeOfDay}.
Popiš dramatické setkání — 2 věty. Žádná krev, jen napětí.`;

  return callNarrator(prompt, 100);
}

/**
 * Výsledek souboje — výhra
 */
export async function narrateCombatWin(playerName, enemyName, xpGained, goldGained) {
  const prompt = `${playerName} právě porazil ${enemyName} v souboji.
Získal ${xpGained} zkušeností${goldGained > 0 ? ` a ${goldGained} zlatých` : ''}.
Popiš vítězný moment — 1-2 věty. Hrdinský a triumfální tón.`;

  return callNarrator(prompt, 80);
}

/**
 * Výsledek souboje — prohra / zranění
 */
export async function narrateCombatLoss(playerName, enemyName, lifeLeft, maxLife) {
  const severity = lifeLeft <= 1 ? 'téměř smrtelné zranění' : lifeLeft <= maxLife * 0.3 ? 'vážné zranění' : 'zranění';
  const prompt = `${playerName} prohrál souboj s ${enemyName} a utrpěl ${severity}.
Zbývá mu ${lifeLeft} z ${maxLife} životů.
Popiš moment porážky — 1-2 věty. Dramaticky, ale bez hrůzy.`;

  return callNarrator(prompt, 80);
}

/**
 * Ochočení peta
 */
export async function narrateTaming(playerName, petName, petEmoji, success) {
  if (success) {
    const prompt = `${playerName} právě ochočil ${petEmoji} ${petName} — příšera se stala jeho věrným společníkem.
Popiš moment ochočení — 1-2 věty. Magický, dojemný.`;
    return callNarrator(prompt, 80);
  } else {
    const prompt = `${playerName} se pokusil ochočit ${petEmoji} ${petName}, ale selhal.
Příšera zuří. Popiš moment neúspěchu — 1 věta.`;
    return callNarrator(prompt, 60);
  }
}

/**
 * Příchod do bezpečné lokace — hospoda, chrám, kovárna
 */
export async function narrateSafeLocation(locationType, locationName, playerName, playerClass) {
  const typeMap = {
    inn:    'hospoda',
    temple: 'posvátný chrám',
    smithy: 'kovárna',
    shop:   'obchod',
    safe:   'bezpečné místo',
  };
  const prompt = `${playerName} (${playerClass}) vstupuje do: ${locationName} (${typeMap[locationType] || locationType}).
Popiš vítající atmosféru tohoto místa — 1-2 věty.`;

  return callNarrator(prompt, 80);
}

/**
 * Globální událost
 */
export async function narrateGlobalEvent(eventName, eventDesc, affectsAll) {
  const prompt = `Globální událost postihuje celý herní svět: ${eventName}.
Popis: ${eventDesc}.
${affectsAll ? 'Zasahuje všechny hráče.' : ''}
Popiš tuto světovou událost dramaticky — 1-2 věty jako hlasatel osudu.`;

  return callNarrator(prompt, 90);
}

/**
 * Level up
 */
export async function narrateLevelUp(playerName, playerClass, newLevel) {
  const prompt = `${playerName} (${playerClass}) dosáhl level ${newLevel}!
Popiš tento moment růstu a síly — 1 věta. Hrdinský tón.`;

  return callNarrator(prompt, 60);
}

/**
 * Upgrade třídy
 */
export async function narrateClassUpgrade(playerName, oldClass, newClass, path) {
  const prompt = `${playerName} právě provedl upgrade z ${oldClass} na ${newClass} (cesta: ${path}).
Popiš tuto transformaci postavy — 1-2 věty. Epická, magická chvíle.`;

  return callNarrator(prompt, 80);
}

/**
 * Pan Zla — přechod fáze
 */
export async function narrateDarkLordPhase(phase, playerNames) {
  const phaseDesc = {
    1: 'jeho armáda padla a teď vstupuje sám do boje',
    2: 'je zraněn ale zuří ještě více',
    3: 'v zoufalství spouští svůj poslední ničivý útok',
  };
  const prompt = `Pan Zla vstupuje do fáze ${phase} — ${phaseDesc[phase]}.
Hráči v boji: ${playerNames.join(', ')}.
Popiš co říká Pan Zla a jak vypadá — 2-3 věty. Epický a hrozivý monolog.`;

  return callNarrator(prompt, 150);
}

/**
 * Výhra nad Pánem Zla — finále hry
 */
export async function narrateVictory(playerNames, turns) {
  const prompt = `Skupina hrdinů ${playerNames.join(', ')} porazila Pána Zla po ${turns} tazích!
Svět je zachráněn. Popiš tuto epickou finální scénu — 3-4 věty. 
Triumfální, dojemná, hodná legend.`;

  return callNarrator(prompt, 200);
}

/**
 * Náhodný komentář vypravěče během klidného tahu
 */
export async function narrateQuietMoment(playerName, locationName, timeOfDay, weather) {
  const timeMap = { dawn:'při svítání', morning:'za jasného rána', day:'v poledním slunci', evening:'za soumraku', night:'za temné noci' };
  const weatherMap = { sunny:'', rain:'za deště', storm:'v bouři', fog:'v mlze', snow:'ve sněhu' };
  const prompt = `${playerName} se pohybuje krajinou ${timeMap[timeOfDay] || ''} ${weatherMap[weather] || ''}.
Lokace: ${locationName}. 
Napiš krátký poetický popis atmosféry — 1 věta.`;

  return callNarrator(prompt, 60);
}

/**
 * NPC dialog
 */
export async function narrateNpcDialog(npcName, npcType, playerName, playerRep, questHint) {
  const repDesc = playerRep >= 5 ? 'slavný hrdina' : playerRep <= -5 ? 'obávaný padouch' : 'neznámý cestovatel';
  const prompt = `NPC: ${npcName} (${npcType}) mluví s ${playerName}, který je znám jako ${repDesc}.
${questHint ? `Naznač tuto informaci: ${questHint}` : ''}
Napiš 1 repliku NPC — autentická středověká mluva, max 2 věty.`;

  return callNarrator(prompt, 80);
}

/**
 * Popis události z balíčku karet
 */
export async function narrateCardEvent(eventName, eventEffect, playerName) {
  const prompt = `${playerName} narazil na událost: ${eventName}.
Efekt: ${eventEffect}.
Popiš tuto událost příběhově — 1-2 věty.`;

  return callNarrator(prompt, 80);
}
