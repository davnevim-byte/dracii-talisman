// src/game/multiplayerEngine.js
// Multiplayer logika — PvP souboje, coop, obchod, výherní podmínky

import { ref, set, update, get } from 'firebase/database';
import { db } from '../firebase';
import { updatePlayerStats, addLog } from './gameState';
import { getCombatStats } from './combatEngine';
import { checkLevelUp } from './progression';

// ── PvP SOUBOJ ────────────────────────────────────────────────────────────────

export async function startPvpChallenge(gameId, attackerId, defenderId) {
  // Zkontroluj cooldown
  const snap      = await get(ref(db, `games/${gameId}/pvpCooldowns/${attackerId}_${defenderId}`));
  const cooldown  = snap.val();
  const now       = Date.now();
  if (cooldown && now - cooldown < 3 * 60 * 1000) {
    const remaining = Math.ceil((3 * 60 * 1000 - (now - cooldown)) / 60000);
    return { ok: false, reason: `Cooldown — počkej ještě ${remaining} min.` };
  }

  await set(ref(db, `games/${gameId}/pvpChallenge`), {
    attackerId,
    defenderId,
    status:    'pending',
    timestamp: now,
  });

  return { ok: true };
}

export async function acceptPvpChallenge(gameId) {
  await update(ref(db, `games/${gameId}/pvpChallenge`), { status: 'active' });
}

export async function resolvePvpCombat(gameId, attacker, defender, attackerRoll, defenderRoll) {
  const acs = getCombatStats(attacker);
  const dcs = getCombatStats(defender);

  const attackerTotal = attackerRoll + acs.str;
  const defenderTotal = defenderRoll + dcs.str;

  await addLog(gameId,
    `⚔️ PvP: ${attacker.name} (${attackerRoll}+${acs.str}=${attackerTotal}) vs ${defender.name} (${defenderRoll}+${dcs.str}=${defenderTotal})`,
    'dice'
  );

  let winnerId = null, loserId = null;
  let winnerName = '', loserName = '';

  if (attackerTotal > defenderTotal) {
    winnerId   = attacker.id;  loserId   = defender.id;
    winnerName = attacker.name; loserName = defender.name;
  } else if (defenderTotal > attackerTotal) {
    winnerId   = defender.id;  loserId   = attacker.id;
    winnerName = defender.name; loserName = attacker.name;
  } else {
    await addLog(gameId, `🤝 PvP remíza — nikdo neztrácí nic.`, 'info');
    await clearPvpState(gameId, attacker.id, defender.id);
    return { outcome: 'draw' };
  }

  const loser  = winnerId === attacker.id ? defender : attacker;
  const winner = winnerId === attacker.id ? attacker : defender;

  // Poražený ztratí 1 ŽP a vrátí se na start zóny
  const newLife = Math.max(1, (loser.stats.life || 1) - 1);
  await updatePlayerStats(gameId, loserId, {
    life:     newLife,
    position: 0,
  });
  await addLog(gameId, `💔 ${loserName} prohrál PvP souboj! −1 ŽP, vrací se na start zóny.`, 'bad');

  // Vítěz může ukrást 1 náhodný předmět
  const loserInv = loser.inventory || [];
  let stolenItem = null;
  if (loserInv.length > 0) {
    const idx  = Math.floor(Math.random() * loserInv.length);
    stolenItem = loserInv[idx];
    const newLoserInv  = loserInv.filter((_, i) => i !== idx);
    const newWinnerInv = [...(winner.inventory || []), stolenItem];
    await set(ref(db, `games/${gameId}/players/${loserId}/inventory`),  newLoserInv);
    await set(ref(db, `games/${gameId}/players/${winnerId}/inventory`), newWinnerInv);
    await addLog(gameId, `🎁 ${winnerName} ukradl ${stolenItem.emoji} ${stolenItem.name} od ${loserName}!`, 'ok');
  }

  // Vítěz dostane XP
  const oldXp = winner.stats.xp || 0;
  const newXp = oldXp + 3;
  await updatePlayerStats(gameId, winnerId, { xp: newXp });
  await checkLevelUp(gameId, winnerId, oldXp, newXp, winner.stats);
  await addLog(gameId, `🏆 ${winnerName} vyhrál PvP! +3 XP`, 'ok');

  // Nastav cooldown
  await set(ref(db, `games/${gameId}/pvpCooldowns/${attacker.id}_${defender.id}`), Date.now());
  await set(ref(db, `games/${gameId}/pvpCooldowns/${defender.id}_${attacker.id}`), Date.now());

  await clearPvpState(gameId, attacker.id, defender.id);

  return { outcome: 'resolved', winnerId, loserId, stolenItem };
}

async function clearPvpState(gameId, p1, p2) {
  await set(ref(db, `games/${gameId}/pvpChallenge`), null);
}

// ── COOP SOUBOJ NA STEJNÉM POLI ───────────────────────────────────────────────

export async function inviteCoopCombat(gameId, initiatorId, partnerIds, enemy) {
  await set(ref(db, `games/${gameId}/coopCombat`), {
    initiatorId,
    partnerIds,
    enemy,
    rolls:     {},
    status:    'pending',
    timestamp: Date.now(),
  });
  await addLog(gameId,
    `🤝 Coop souboj s ${enemy.emoji} ${enemy.name} zahájen! Čeká se na hody...`,
    'turn'
  );
}

export async function submitCoopRoll(gameId, playerId, roll) {
  await update(ref(db, `games/${gameId}/coopCombat/rolls`), { [playerId]: roll });
}

export async function resolveCoopCombatIfReady(gameId, game, players) {
  const coopState = game.coopCombat;
  if (!coopState || coopState.status !== 'pending') return null;

  const allIds = [coopState.initiatorId, ...(coopState.partnerIds || [])];
  const rolls  = coopState.rolls || {};
  const allRolled = allIds.every(id => rolls[id] !== undefined);
  if (!allRolled) return null;

  // Počítej průměr
  const participants = allIds.map(id => game.players[id]).filter(Boolean);
  let totalPower = 0;
  for (const p of participants) {
    const cs    = getCombatStats(p);
    const roll  = rolls[p.id] || 1;
    const total = roll + cs.str;
    totalPower += total;
    await addLog(gameId, `${p.name}: ${roll}+${cs.str}=${total}`, 'dice');
  }

  const avgPower  = Math.floor(totalPower / participants.length);
  const enemy     = coopState.enemy;
  const enemyRoll = Math.floor(Math.random() * 6) + 1;
  const enemyT    = enemyRoll + (enemy.str || 0);

  await addLog(gameId, `${enemy.emoji} ${enemy.name}: ${enemyRoll}+${enemy.str}=${enemyT}`, 'dice');

  if (avgPower > enemyT) {
    await addLog(gameId, `⚔️ Tým porazil ${enemy.name}!`, 'ok');
    const xpShare   = Math.max(1, Math.floor((enemy.xp || 1) / participants.length));
    const goldShare = Math.floor((enemy.gold || 0) / participants.length);
    for (const p of participants) {
      const oldXp = p.stats.xp || 0;
      const newXp = oldXp + xpShare;
      await updatePlayerStats(gameId, p.id, {
        xp:       newXp,
        gold:     (p.stats.gold || 0) + goldShare,
        trophies: (p.stats.trophies || 0) + 1,
      });
      await checkLevelUp(gameId, p.id, oldXp, newXp, p.stats);
    }
    if (goldShare > 0)
      await addLog(gameId, `💰 Každý hráč získal ${goldShare} zlatých a ${xpShare} XP.`, 'ok');
    await set(ref(db, `games/${gameId}/coopCombat`), null);
    return { outcome: 'win' };
  } else {
    await addLog(gameId, `💔 Tým prohrál coop souboj!`, 'bad');
    for (const p of participants) {
      const newLife = Math.max(1, (p.stats.life || 1) - 1);
      await updatePlayerStats(gameId, p.id, { life: newLife });
    }
    await set(ref(db, `games/${gameId}/coopCombat`), null);
    return { outcome: 'lose' };
  }
}

// ── OBCHOD MEZI HRÁČI ─────────────────────────────────────────────────────────

export async function proposeTradeRequest(gameId, fromId, toId, offeredItemIdx, requestedItemIdx) {
  await set(ref(db, `games/${gameId}/tradeRequest`), {
    fromId, toId,
    offeredItemIdx, requestedItemIdx,
    status:    'pending',
    timestamp: Date.now(),
  });
}

export async function acceptTrade(gameId, game) {
  const trade    = game.tradeRequest;
  if (!trade || trade.status !== 'pending') return { ok: false };

  const fromPlayer = game.players[trade.fromId];
  const toPlayer   = game.players[trade.toId];
  if (!fromPlayer || !toPlayer) return { ok: false };

  const fromInv = [...(fromPlayer.inventory || [])];
  const toInv   = [...(toPlayer.inventory   || [])];

  const offeredItem   = fromInv[trade.offeredItemIdx];
  const requestedItem = toInv[trade.requestedItemIdx];
  if (!offeredItem || !requestedItem) return { ok: false, reason: 'Předmět nenalezen.' };

  // Prohoď předměty
  fromInv[trade.offeredItemIdx]   = requestedItem;
  toInv[trade.requestedItemIdx]   = offeredItem;

  await set(ref(db, `games/${gameId}/players/${trade.fromId}/inventory`), fromInv);
  await set(ref(db, `games/${gameId}/players/${trade.toId}/inventory`),   toInv);
  await set(ref(db, `games/${gameId}/tradeRequest`), null);

  await addLog(gameId,
    `🤝 Obchod: ${fromPlayer.name} dal ${offeredItem.emoji} ${offeredItem.name} za ${requestedItem.emoji} ${requestedItem.name} od ${toPlayer.name}.`,
    'ok'
  );
  return { ok: true };
}

export async function rejectTrade(gameId) {
  await set(ref(db, `games/${gameId}/tradeRequest`), null);
}

// ── VÝHERNÍ PODMÍNKY ──────────────────────────────────────────────────────────

export async function checkVictoryConditions(gameId, game) {
  const players = Object.values(game.players || {});
  const mode    = game.mode || 'coop';

  // COOP — porazit Pána Zla (zone 5 s trofejemi)
  if (mode === 'coop') {
    const darkLordDefeated = game.darkLordDefeated;
    if (darkLordDefeated) {
      await declareVictory(gameId, 'victory', players);
      return { victory: true, reason: 'Pan Zla poražen!' };
    }
  }

  // PvP — poslední přeživší nebo první kdo porazí Pána Zla
  if (mode === 'pvp') {
    const alivePlayers = players.filter(p => (p.stats.life || 0) > 0);
    if (alivePlayers.length === 1) {
      await declareVictory(gameId, 'pvp_win', players, alivePlayers[0].id);
      return { victory: true, reason: `${alivePlayers[0].name} je poslední přeživší!`, winnerId: alivePlayers[0].id };
    }
    if (game.darkLordDefeated) {
      await declareVictory(gameId, 'pvp_win', players, game.darkLordDefeaterId);
      return { victory: true, reason: 'První porazil Pána Zla!', winnerId: game.darkLordDefeaterId };
    }
  }

  // Prohra — všichni mrtví
  const allDead = players.every(p => (p.stats.life || 0) <= 0);
  if (allDead) {
    await declareVictory(gameId, 'defeat', players);
    return { victory: false, reason: 'Všichni hrdinové padli.' };
  }

  return null;
}

async function declareVictory(gameId, outcome, players, winnerId = null) {
  await update(ref(db, `games/${gameId}`), {
    status:   'finished',
    outcome,
    winnerId,
    finishedAt: Date.now(),
  });
  const msg = outcome === 'victory'    ? '🎉 VÍTĚZSTVÍ! Talisman je v bezpečí!'
            : outcome === 'pvp_win'    ? `👑 VÍTĚZ: ${players.find(p=>p.id===winnerId)?.name || '?'}!`
            : '💀 Temnota zvítězila. Příště to bude lepší.';
  await addLog(gameId, msg, 'turn');
}

// ── CHAT / HLASOVÁNÍ ─────────────────────────────────────────────────────────

export async function sendChatMessage(gameId, playerId, playerName, emoji, text) {
  const msgRef = ref(db, `games/${gameId}/chat`);
  const snap   = await get(msgRef);
  const msgs   = snap.val() || [];
  const newMsg = { playerId, playerName, emoji, text, ts: Date.now() };
  await set(msgRef, [...msgs.slice(-30), newMsg]);
}

export async function voteModeChange(gameId, playerId, vote) {
  await set(ref(db, `games/${gameId}/votes/${playerId}`), vote);
}

// ── ALIANCE (PvP) ─────────────────────────────────────────────────────────────

export async function proposeAlliance(gameId, fromId, toId) {
  await set(ref(db, `games/${gameId}/alliances/${fromId}_${toId}`), {
    status: 'pending', fromId, toId, ts: Date.now(),
  });
  await addLog(gameId, `🤝 Alliance nabídnuta`, 'info');
}

export async function acceptAlliance(gameId, fromId, toId) {
  await set(ref(db, `games/${gameId}/alliances/${fromId}_${toId}`), {
    status: 'active', fromId, toId, ts: Date.now(),
  });
  await addLog(gameId, `🤝 Alliance uzavřena!`, 'ok');
}

export async function breakAlliance(gameId, fromId, toId) {
  await set(ref(db, `games/${gameId}/alliances/${fromId}_${toId}`), null);
  await set(ref(db, `games/${gameId}/alliances/${toId}_${fromId}`), null);
  await addLog(gameId, `💔 Alliance zrušena.`, 'bad');
}

export function areAllied(game, id1, id2) {
  const a = game.alliances || {};
  return (a[`${id1}_${id2}`]?.status === 'active') ||
         (a[`${id2}_${id1}`]?.status === 'active');
}

// ── SDÍLENÉ TÁBOŘIŠTĚ ─────────────────────────────────────────────────────────

export async function setUpCamp(gameId, playerId, playerName, position, zone) {
  await set(ref(db, `games/${gameId}/camps/${playerId}`), {
    playerId, playerName, position, zone,
    ts: Date.now(),
  });
  await addLog(gameId, `⛺ ${playerName} si zřídil tábořiště.`, 'info');
}

export async function joinCamp(gameId, joiningPlayer, hostPlayerId, game) {
  const camp = game.camps?.[hostPlayerId];
  if (!camp) return { ok: false, reason: 'Tábořiště neexistuje.' };
  if (camp.position !== joiningPlayer.position || camp.zone !== (joiningPlayer.zone||1)) {
    return { ok: false, reason: 'Tábořiště není na stejném poli.' };
  }
  // Regenerace
  const newLife = Math.min(joiningPlayer.stats.maxLife, (joiningPlayer.stats.life||0) + 2);
  const newMana = Math.min(joiningPlayer.stats.maxMana, (joiningPlayer.stats.mana||0) + 2);
  await updatePlayerStats(gameId, joiningPlayer.id, { life: newLife, mana: newMana });
  await addLog(gameId, `⛺ ${joiningPlayer.name} odpočívá u tábořiště (+2 ŽP, +2 Mana).`, 'ok');
  return { ok: true };
}
