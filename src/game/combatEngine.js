// src/game/combatEngine.js
// Kompletní soubojový systém — iniciativa, kola, schopnosti, peti, ochočování

import { ref, set, update } from 'firebase/database';
import { db } from '../firebase';
import { updatePlayerStats, addLog, addItemToInventory } from './gameState';
import { checkLevelUp } from './progression';
import { canTame, rollTame } from '../data/bestiary';
import { STATUS_EFFECTS } from './progression';

// ── INICIATIVA ────────────────────────────────────────────────────────────────

export function rollInitiative(playerStats, enemy, timeOfDay, weather) {
  const playerRoll = Math.floor(Math.random() * 6) + 1 + (playerStats.fate || 0);
  const enemyRoll  = Math.floor(Math.random() * 6) + 1;
  const timeMod    = { dawn:-1, morning:0, day:0, evening:1, night:2 }[timeOfDay] || 0;
  const enemyTotal = enemyRoll + (enemy.str || 0) * 0.3 + timeMod;
  return { playerFirst: playerRoll >= enemyTotal, playerRoll, enemyRoll };
}

// ── VÝPOČET POŠKOZENÍ ─────────────────────────────────────────────────────────

export function calcDamage(attackerTotal, defenderTotal, defenseBonus = 0) {
  const raw = attackerTotal - defenderTotal;
  return Math.max(0, raw - defenseBonus);
}

// ── EFEKTIVNÍ STATISTIKY HRÁČE V SOUBOJI ────────────────────────────────────

export function getCombatStats(player) {
  const base      = player.stats || {};
  const inventory = player.inventory || [];
  const effects   = player.statusEffects || [];

  const strBonus  = inventory.filter(i => i.type === 'passive' && i.bonus === 'str')
                             .reduce((s, i) => s + (i.val || 0), 0);
  const defBonus  = inventory.filter(i => i.type === 'passive' && i.bonus === 'defense')
                             .reduce((s, i) => s + (i.val || 0), 0);
  const skillBonus= inventory.filter(i => i.type === 'passive' && i.bonus === 'skill')
                             .reduce((s, i) => s + (i.val || 0), 0);

  // Status efekty
  let strMod = 0, defMod = 0;
  effects.forEach(eff => {
    if (eff.stat === 'str')     strMod += eff.val || 0;
    if (eff.stat === 'defense') defMod += eff.val || 0;
  });

  return {
    str:     (base.str || 0)     + strBonus  + strMod,
    skill:   (base.skill || 0)   + skillBonus,
    defense: (base.defense || 0) + defBonus  + defMod,
    fate:    base.fate   || 0,
    life:    base.life   || 1,
    maxLife: base.maxLife|| 1,
    mana:    base.mana   || 0,
  };
}

// ── SOUBOJOVÉ KOLO ────────────────────────────────────────────────────────────

export async function resolveCombatRound(gameId, playerId, player, enemy, playerRoll, enemyRoll, usePet = false) {
  const cs = getCombatStats(player);

  // Pet bonus
  const pet     = player.pet;
  const petBonus= usePet && pet ? (pet.str || 0) : 0;

  const playerTotal = playerRoll + cs.str + petBonus;
  const enemyTotal  = enemyRoll  + (enemy.str || 0);

  const result = { playerTotal, enemyTotal, petUsed: usePet && !!pet };

  if (playerTotal > enemyTotal) {
    result.outcome = 'win';
    result.dmg     = 0;
  } else if (enemyTotal > playerTotal) {
    result.outcome = 'lose';
    result.dmg     = Math.max(1, 1 - cs.defense);
  } else {
    result.outcome = 'draw';
    result.dmg     = 0;
  }

  return result;
}

// ── VYŘÍZENÍ VÝHRY ───────────────────────────────────────────────────────────

export async function handleCombatWin(gameId, playerId, player, enemy) {
  const s          = player.stats;
  const g          = enemy.gold || 0;
  const xpGain     = enemy.xp   || 1;
  const oldXp      = s.xp || 0;
  const newXp      = oldXp + xpGain;
  const newTrophies= (s.trophies || 0) + 1;
  const strUp      = newTrophies % 3 === 0 ? 1 : 0;

  const updates = {
    gold:     (s.gold || 0) + g,
    xp:       newXp,
    trophies: newTrophies,
    str:      (s.str || 0) + strUp,
  };

  if (strUp)  await addLog(gameId, `🏆 ${player.name}: 3 trofeje → +1 Síla!`, 'ok');
  if (g > 0)  await addLog(gameId, `💰 ${player.name} získal ${g} zlatých.`, 'ok');
  await addLog(gameId, `⚔️ ${player.name} porazil ${enemy.emoji} ${enemy.name}! +${xpGain} XP`, 'ok');

  await updatePlayerStats(gameId, playerId, updates);

  // Level up
  await checkLevelUp(gameId, playerId, oldXp, newXp, { ...s, ...updates });

  // Loot
  if (enemy.loot) {
    for (const lootEntry of enemy.loot) {
      if (Math.random() < (lootEntry.chance || 0)) {
        const lootItem = {
          name: lootEntry.item, emoji: lootEntry.emoji,
          type: lootEntry.bonus === 'heal' ? 'use' : 'passive',
          bonus: lootEntry.bonus, val: lootEntry.val,
          desc: lootEntry.note || `+${lootEntry.val} ${lootEntry.bonus}`,
        };
        await addItemToInventory(gameId, playerId, lootItem);
        await addLog(gameId, `🎁 ${player.name} nalezl: ${lootItem.emoji} ${lootItem.name}!`, 'ok');
      }
    }
  }

  return updates;
}

// ── VYŘÍZENÍ PROHRY ──────────────────────────────────────────────────────────

export async function handleCombatLoss(gameId, playerId, player, enemy, dmg) {
  const s       = player.stats;
  const defense = getCombatStats(player).defense;
  const realDmg = Math.max(1, dmg - defense);
  const newLife = Math.max(0, (s.life || 0) - realDmg);

  await addLog(gameId, `💔 ${player.name} prohrál! −${realDmg} ŽP${defense > 0 ? ` (obrana snížila o ${defense})` : ''}`, 'bad');
  await updatePlayerStats(gameId, playerId, { life: newLife });

  if (newLife <= 0) {
    await addLog(gameId, `💀 ${player.name} zahynul! Vrací se na start zóny.`, 'bad');
    // Ztráta 50% zlata (zaokrouhleno dolů)
    const goldLost = Math.floor((s.gold || 0) / 2);
    await updatePlayerStats(gameId, playerId, {
      life:     s.maxLife,   // obnov životy
      position: 0,           // zpět na start zóny
      gold:     (s.gold || 0) - goldLost,
    });
    if (goldLost > 0) {
      await addLog(gameId, `💸 ${player.name} ztratil ${goldLost} zlatých.`, 'bad');
    }
  }

  // Speciální efekty příšer při výhře
  if (enemy.abilities) {
    for (const ab of enemy.abilities) {
      if (ab.trigger === 'on_win') {
        if (ab.id === 'rob' || ab.id === 'loot_all') {
          const stolen = ab.id === 'loot_all' ? (s.gold || 0) : Math.min(2, s.gold || 0);
          await updatePlayerStats(gameId, playerId, { gold: Math.max(0, (s.gold || 0) - stolen) });
          await addLog(gameId, `💸 ${enemy.name} ukradl ${stolen} zlatých!`, 'bad');
        }
        if (ab.id === 'steal_item' && (player.inventory || []).length > 0) {
          const inv = [...(player.inventory || [])];
          const idx = Math.floor(Math.random() * inv.length);
          const stolen = inv.splice(idx, 1)[0];
          await set(ref(db, `games/${gameId}/players/${playerId}/inventory`), inv);
          await addLog(gameId, `💨 ${enemy.name} ukradl ${stolen.emoji} ${stolen.name}!`, 'bad');
        }
        if (ab.id === 'curse' || ab.id === 'on_win') {
          // Přidej status efekt Prokletý
          const effects = [...(player.statusEffects || [])];
          effects.push({ ...STATUS_EFFECTS.cursed, turnsLeft: 3 });
          await set(ref(db, `games/${gameId}/players/${playerId}/statusEffects`), effects);
          await addLog(gameId, `💜 ${enemy.name} proklet ${player.name}!`, 'bad');
        }
      }
    }
  }

  return { newLife, realDmg };
}

// ── OCHOČOVÁNÍ ────────────────────────────────────────────────────────────────

export async function attemptTame(gameId, playerId, player, enemy) {
  const rep     = player.stats.reputation || 0;
  const check   = canTame(enemy, rep, player.character?.id);

  if (!check.ok) {
    await addLog(gameId, `🐾 ${player.name} se pokusil ochočit ${enemy.name}: ${check.reason}`, 'bad');
    return { success: false, reason: check.reason };
  }

  // Zkontroluj práh životů — příšera musí být pod 25%
  if ((enemy.currentLife || enemy.life) > enemy.life * 0.25) {
    await addLog(gameId, `🐾 ${enemy.name} je ještě příliš silný! Oslab ho na méně než 25% ŽP.`, 'bad');
    return { success: false, reason: 'Příšera není dostatečně oslabena.' };
  }

  // Zkontroluj jestli má hráč už peta
  if (player.pet) {
    await addLog(gameId, `🐾 Máš už společníka (${player.pet.name}). Propusť ho nejdřív.`, 'bad');
    return { success: false, reason: 'Máš už společníka.' };
  }

  // Faction bonus pro Elfy (Les)
  const factionBonus = player.character?.faction === 'Les' ? 2 : 0;
  const roll         = rollTame(enemy, player.stats.skill || 0, player.stats.fate || 0, factionBonus);

  await addLog(gameId,
    `🐾 ${player.name} se pokouší ochočit ${enemy.emoji} ${enemy.name}… hod ${roll.roll}+${roll.bonus}=${roll.total} (potřeba ${roll.needed})`,
    'dice');

  if (roll.success) {
    // Vytvoř peta
    const petData = {
      id:      enemy.id,
      name:    enemy.name,
      emoji:   enemy.emoji,
      str:     enemy.petStats?.str    || Math.max(1, (enemy.str || 1) - 1),
      life:    enemy.petStats?.life   || (enemy.life || 3),
      maxLife: enemy.petStats?.life   || (enemy.life || 3),
      move:    enemy.petStats?.move   || 1,
      ability: enemy.petStats?.ability|| enemy.abilities?.[0]?.desc || 'Bojuje po boku svého pána.',
      level:   1,
      xp:      0,
      type:    enemy.type,
    };

    await set(ref(db, `games/${gameId}/players/${playerId}/pet`), petData);
    await addLog(gameId, `🎉 ${player.name} ochočil ${enemy.emoji} ${enemy.name}!`, 'ok');

    // Reputační dopad
    const repChange = enemy.tameRep === 'evil' ? -1 : 1;
    await updatePlayerStats(gameId, playerId, {
      reputation: Math.min(10, Math.max(-10, (player.stats.reputation || 0) + repChange)),
    });

    return { success: true, pet: petData };
  } else {
    // Neúspěch — příšera zaútočí zuřivě
    await addLog(gameId, `💢 Ochočení selhalo! ${enemy.name} útočí zuřivě (+2 Síla)!`, 'bad');
    const rage = Math.floor(Math.random() * 6) + 1 + (enemy.str || 0) + 2;
    const playerRoll = Math.floor(Math.random() * 6) + 1 + (player.stats.str || 0);
    if (rage > playerRoll) {
      await handleCombatLoss(gameId, playerId, player, enemy, 2);
    } else {
      await addLog(gameId, `${player.name} ustál zuřivý útok!`, 'ok');
    }
    return { success: false, reason: 'Selhalo — příšera zaútočila.' };
  }
}

// ── PET ÚTOK ─────────────────────────────────────────────────────────────────

export async function petAttack(gameId, playerId, player, enemy) {
  const pet = player.pet;
  if (!pet) return { ok: false };

  const petRoll    = Math.floor(Math.random() * 6) + 1 + (pet.str || 0);
  const enemyRoll  = Math.floor(Math.random() * 6) + 1 + (enemy.str || 0);

  await addLog(gameId,
    `🐾 ${pet.emoji} ${pet.name} útočí! Hod ${petRoll} vs ${enemyRoll}`,
    'dice');

  if (petRoll > enemyRoll) {
    await addLog(gameId, `🐾 ${pet.name} zasáhl ${enemy.name}!`, 'ok');
    return { ok: true, win: true };
  } else if (enemyRoll > petRoll) {
    // Pet dostane damage
    const newPetLife = Math.max(0, (pet.life || 1) - 1);
    await set(ref(db, `games/${gameId}/players/${playerId}/pet/life`), newPetLife);
    await addLog(gameId, `🐾 ${pet.name} byl zraněn! (${newPetLife}/${pet.maxLife} ŽP)`, 'bad');
    if (newPetLife <= 0) {
      await set(ref(db, `games/${gameId}/players/${playerId}/pet`), null);
      await addLog(gameId, `💀 ${pet.name} padl v boji. Navždy.`, 'bad');
    }
    return { ok: true, win: false };
  }
  await addLog(gameId, `🤝 Remíza peta!`, 'info');
  return { ok: true, win: false };
}

// ── ZVLÁŠTNÍ SCHOPNOSTI V SOUBOJI ─────────────────────────────────────────────

export async function useAbilityInCombat(gameId, playerId, player, abilityId, enemy) {
  const ability = (player.abilities || []).find(a => a.id === abilityId);
  if (!ability) return { ok: false, reason: 'Schopnost nenalezena.' };
  if ((player.stats.mana || 0) < (ability.manaCost || 0)) {
    return { ok: false, reason: 'Nedostatek many.' };
  }

  // Odečti manu
  await updatePlayerStats(gameId, playerId, {
    mana: (player.stats.mana || 0) - (ability.manaCost || 0),
  });

  const results = { ok: true, abilityName: ability.name };

  // Efekty schopností
  switch (abilityId) {
    case 'fireball':
    case 'ki_blast':
    case 'crit_shot':
      results.bonusDmg = 3;
      await addLog(gameId, `⚡ ${player.name} používá ${ability.name}! +3 damage!`, 'ok');
      break;

    case 'shield_bash':
    case 'stun':
      results.stunEnemy = true;
      await addLog(gameId, `⚡ ${player.name} omráčí ${enemy.name} na 1 kolo!`, 'ok');
      break;

    case 'magic_shield':
    case 'divine_shield':
      results.blockNext = true;
      await addLog(gameId, `⚡ ${player.name} aktivuje štít — blokuje příští útok!`, 'ok');
      break;

    case 'rage':
    case 'berserker': {
      const effects = [...(player.statusEffects || [])];
      effects.push({ ...STATUS_EFFECTS.enraged, turnsLeft: 2 });
      await set(ref(db, `games/${gameId}/players/${playerId}/statusEffects`), effects);
      await addLog(gameId, `⚡ ${player.name} vstoupil do zuřivosti! +3 Síla, −2 Obrana`, 'ok');
      results.buffApplied = true;
      break;
    }

    case 'heal_aura': {
      // Vyléčí všechny hráče ve hře
      results.healAll = 2;
      await addLog(gameId, `⚡ ${player.name} léčí všechny spojence! +2 ŽP`, 'ok');
      break;
    }

    case 'poison_arrow':
    case 'poison_blade': {
      const effects = [...(player.statusEffects || [])];
      effects.push({ id:'nextPoisoned', name:'Jedový útok', emoji:'☠️', nextAttackPoison: true });
      await set(ref(db, `games/${gameId}/players/${playerId}/statusEffects`), effects);
      await addLog(gameId, `⚡ ${player.name} připravuje jedový útok!`, 'ok');
      results.nextAttackPoison = true;
      break;
    }

    default:
      await addLog(gameId, `⚡ ${player.name} používá ${ability.name}!`, 'ok');
      results.bonusDmg = 1;
  }

  return results;
}

// ── COOP SOUBOJ ───────────────────────────────────────────────────────────────

export async function resolveCoopCombat(gameId, activePlayers, enemy) {
  // Všichni útočí — sumujeme hody
  let totalPlayerPower = 0;
  const rolls = [];

  for (const player of activePlayers) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const cs   = getCombatStats(player);
    const total= roll + cs.str;
    rolls.push({ player, roll, total });
    totalPlayerPower += total;
    await addLog(gameId, `${player.name} hodil ${roll} (+${cs.str}) = ${total}`, 'dice');
  }

  const enemyRoll  = Math.floor(Math.random() * 6) + 1;
  const enemyTotal = enemyRoll + (enemy.str || 0);
  await addLog(gameId, `${enemy.emoji} ${enemy.name} hodil ${enemyRoll} (+${enemy.str}) = ${enemyTotal}`, 'dice');

  // Průměr hráčů vs nepřítel
  const avgPlayer = Math.floor(totalPlayerPower / activePlayers.length);

  if (avgPlayer > enemyTotal) {
    await addLog(gameId, `⚔️ COOP výhra! Tým porazil ${enemy.name}!`, 'ok');
    // Rozděl kořist
    const xpShare   = Math.floor((enemy.xp || 1) / activePlayers.length);
    const goldShare = Math.floor((enemy.gold || 0) / activePlayers.length);
    for (const player of activePlayers) {
      const oldXp = player.stats.xp || 0;
      const newXp = oldXp + xpShare;
      await updatePlayerStats(gameId, player.id, {
        xp:   newXp,
        gold: (player.stats.gold || 0) + goldShare,
        trophies: (player.stats.trophies || 0) + 1,
      });
      await checkLevelUp(gameId, player.id, oldXp, newXp, player.stats);
    }
    if (goldShare > 0) await addLog(gameId, `💰 Každý hráč získal ${goldShare} zlatých a ${xpShare} XP.`, 'ok');
    return { outcome: 'win' };
  } else {
    await addLog(gameId, `💔 Tým prohrál coop souboj!`, 'bad');
    for (const player of activePlayers) {
      await handleCombatLoss(gameId, player.id, player, enemy, 1);
    }
    return { outcome: 'lose' };
  }
}

// ── SPECIÁLNÍ BOSS MECHANIKY ─────────────────────────────────────────────────

export async function checkBossSpecials(gameId, boss, bossCurrentLife, playersOnField) {
  // Undying — kostěný válečník
  if (boss.id === 'bone_warrior' && bossCurrentLife <= 0 && !boss.undeadUsed) {
    await addLog(gameId, `💀 ${boss.name} vstává znovu! Musíš ho zabít ještě jednou!`, 'bad');
    await set(ref(db, `games/${gameId}/combatState/boss/currentLife`), 3);
    await set(ref(db, `games/${gameId}/combatState/boss/undeadUsed`), true);
    return true; // pokračuj v souboji
  }

  // Pan Zla fáze přechody
  if (boss.id === 'dark_lord' && bossCurrentLife <= 0) {
    const currentPhase = boss.phase || 1;
    if (currentPhase < 3) {
      await addLog(gameId, `👑 Pan Zla přechází do fáze ${currentPhase + 1}!`, 'turn');
      return true;
    }
  }

  return false;
}
