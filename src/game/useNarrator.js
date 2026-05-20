// src/game/useNarrator.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { onValue, off } from 'firebase/database';
import {
  narrateLocation, narrateEnemyEncounter, narrateCombatWin,
  narrateCombatLoss, narrateTaming, narrateSafeLocation,
  narrateGlobalEvent, narrateLevelUp, narrateClassUpgrade,
  narrateDarkLordPhase, narrateVictory, narrateQuietMoment,
  narrateNpcDialog, narrateCardEvent,
} from './narrator';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

export function useNarrator(gameId) {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const saveToFirebase = useCallback(async (narration) => {
    if (!gameId || !narration) return;
    try {
      await set(ref(db, `games/${gameId}/narrator`), { text: narration, ts: Date.now() });
    } catch (e) { console.error('Narrator Firebase save error:', e); }
  }, [gameId]);

  const setNarration = useCallback((narration) => {
    if (!narration) return;
    setText(narration);
    setHistory(h => [...h.slice(-15), narration]);
    saveToFirebase(narration);
  }, [saveToFirebase]);

  const narrate = useCallback(async (fn, ...args) => {
    setLoading(true);
    try {
      const result = await fn(...args);
      if (result) {
        setText(result);
        setHistory(h => [...h.slice(-15), result]);
        saveToFirebase(result);
      }
    } catch (e) { console.error('Narrator error:', e); }
    finally { setLoading(false); }
  }, [saveToFirebase]);

  const onLocation     = useCallback((loc, zone, weather, timeOfDay, player) =>
    narrate(narrateLocation, loc.name, loc.type, zone.name, weather, timeOfDay, player.name, player.character?.name), [narrate]);
  const onEnemy        = useCallback((enemy, zoneName, timeOfDay, player) =>
    narrate(narrateEnemyEncounter, enemy.name, enemy.desc, enemy.flavor, zoneName, timeOfDay, player.name), [narrate]);
  const onWin          = useCallback((player, enemy, xp, gold) =>
    narrate(narrateCombatWin, player.name, enemy.name, xp, gold), [narrate]);
  const onLoss         = useCallback((player, enemy) =>
    narrate(narrateCombatLoss, player.name, enemy.name, player.stats.life, player.stats.maxLife), [narrate]);
  const onTame         = useCallback((player, pet, success) =>
    narrate(narrateTaming, player.name, pet.name, pet.emoji, success), [narrate]);
  const onSafeLocation = useCallback((loc, player) =>
    narrate(narrateSafeLocation, loc.type, loc.name, player.name, player.character?.name), [narrate]);
  const onGlobalEvent  = useCallback((event) =>
    narrate(narrateGlobalEvent, event.name, event.desc, true), [narrate]);
  const onLevelUp      = useCallback((player, newLevel) =>
    narrate(narrateLevelUp, player.name, player.character?.name, newLevel), [narrate]);
  const onClassUpgrade = useCallback((player, oldClass, newClass, path) =>
    narrate(narrateClassUpgrade, player.name, oldClass, newClass, path), [narrate]);
  const onDarkLordPhase= useCallback((phase, players) =>
    narrate(narrateDarkLordPhase, phase, players.map(p => p.name)), [narrate]);
  const onVictory      = useCallback((players, turns) =>
    narrate(narrateVictory, players.map(p => p.name), turns), [narrate]);
  const onQuietMoment  = useCallback((player, locName, timeOfDay, weather) =>
    narrate(narrateQuietMoment, player.name, locName, timeOfDay, weather), [narrate]);
  const onNpc          = useCallback((npc, player, questHint) =>
    narrate(narrateNpcDialog, npc.name, npc.type || 'NPC', player.name, player.stats.reputation || 0, questHint), [narrate]);
  const onCardEvent    = useCallback((event, player) =>
    narrate(narrateCardEvent, event.name, event.desc, player.name), [narrate]);

  return {
    text, loading, history, setNarration,
    onLocation, onEnemy, onWin, onLoss, onTame,
    onSafeLocation, onGlobalEvent, onLevelUp, onClassUpgrade,
    onDarkLordPhase, onVictory, onQuietMoment, onNpc, onCardEvent,
  };
}

export function useNarratorReader(gameId) {
  const [text,    setText]    = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!gameId) return;
    const r = ref(db, `games/${gameId}/narrator`);
    onValue(r, snap => {
      const data = snap.val();
      if (data?.text) {
        setText(data.text);
        setHistory(h => {
          const last = h[h.length - 1];
          if (last === data.text) return h;
          return [...h.slice(-15), data.text];
        });
      }
    });
    return () => off(r);
  }, [gameId]);

  return { text, history };
}
