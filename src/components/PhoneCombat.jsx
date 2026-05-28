// src/components/PhoneCombat.jsx
// Souboj synchronizovaný na telefonu hráče

import { useState, useEffect } from 'react';
import { listenCombat, setCombatState, clearCombatState, addLog } from '../game/gameState';
import { handleCombatWin, handleCombatLoss, attemptTame, petAttack } from '../game/combatEngine';
import { play } from '../game/soundEngine';

const S = {
  wrap: {
    background: 'linear-gradient(135deg, #1a0808, #120505)',
    border: '2px solid #5a1a1a',
    borderRadius: '16px', padding: '16px',
    marginBottom: '12px',
  },
  title: {
    fontFamily: "'Cinzel',serif", fontSize: '15px', fontWeight: 700,
    color: '#e05050', textAlign: 'center', letterSpacing: '3px',
    marginBottom: '14px',
  },
  fighters: {
    display: 'flex', justifyContent: 'space-around',
    alignItems: 'flex-start', gap: '10px', marginBottom: '14px',
  },
  fighter: { textAlign: 'center', flex: 1 },
  fighterEmoji: { fontSize: '38px', marginBottom: '5px' },
  fighterName: (color) => ({
    fontFamily: "'Cinzel',serif", fontSize: '12px',
    fontWeight: 700, color, marginBottom: '4px',
  }),
  fighterStat: { fontSize: '11px', color: '#7a6a4a' },
  lifeBar: {
    height: '8px', background: '#1e0808',
    borderRadius: '4px', overflow: 'hidden', margin: '5px 0',
  },
  lifeBarFill: (pct, color) => ({
    height: '100%', borderRadius: '4px',
    width: `${Math.max(0, Math.min(100, pct))}%`,
    background: color, transition: 'width 0.4s',
  }),
  vs: {
    color: '#e05050', fontWeight: 700, fontSize: '18px',
    alignSelf: 'center', flexShrink: 0,
  },
  rollBadge: (color) => ({
    display: 'inline-block', background: color, color: '#fff',
    borderRadius: '8px', padding: '5px 14px', fontWeight: 700,
    fontSize: '20px', fontFamily: "'Cinzel',serif",
    margin: '5px 0', boxShadow: `0 0 12px ${color}60`,
  }),
  totalText: { fontSize: '11px', color: '#9a8a6a', marginTop: '2px' },
  phaseText: {
    textAlign: 'center', fontSize: '13px', color: '#9a8a6a',
    margin: '10px 0', fontStyle: 'italic',
  },
  diceBtn: {
    width: '100%', padding: '16px', borderRadius: '12px',
    fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: '16px',
    border: 'none', cursor: 'pointer', marginBottom: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    transition: 'all 0.15s',
  },
  physInput: {
    width: '100%', padding: '14px', boxSizing: 'border-box',
    background: '#0d0b07', border: '2px solid #2a2418', borderRadius: '10px',
    color: '#e0d5c0', fontSize: '24px', textAlign: 'center',
    fontFamily: "'Cinzel',serif", fontWeight: 700, outline: 'none',
    marginBottom: '8px',
  },
  abilityRow: {
    display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px',
  },
  abilityBtn: (canUse) => ({
    padding: '7px 12px', borderRadius: '8px', cursor: canUse ? 'pointer' : 'not-allowed',
    fontFamily: "'Cinzel',serif", fontSize: '11px', fontWeight: 600,
    background: canUse ? '#c0932a20' : '#0d0b07',
    border: `1px solid ${canUse ? '#c0932a60' : '#1e1a12'}`,
    color: canUse ? '#c0932a' : '#3a3020',
    opacity: canUse ? 1 : 0.6,
  }),
  resultBox: (win) => ({
    textAlign: 'center', padding: '16px', borderRadius: '12px',
    background: win ? '#0d1a0d' : '#1a0808',
    border: `2px solid ${win ? '#2a5a2a' : '#5a2a2a'}`,
    marginBottom: '10px',
  }),
  resultEmoji: { fontSize: '36px', marginBottom: '8px' },
  resultTitle: (win) => ({
    fontFamily: "'Cinzel',serif", fontSize: '16px', fontWeight: 700,
    color: win ? '#4caf50' : '#e05050', marginBottom: '4px',
  }),
  resultSub: { fontSize: '12px', color: '#7a6a4a' },
  tameBox: {
    background: '#0d150d', border: '1px solid #2a5a2a',
    borderRadius: '10px', padding: '12px', marginBottom: '8px',
  },
  tameTitle: {
    fontFamily: "'Cinzel',serif", fontSize: '13px',
    color: '#4caf50', fontWeight: 700, marginBottom: '6px',
  },
  tameBtn: {
    width: '100%', padding: '12px', borderRadius: '10px',
    fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '13px',
    background: 'linear-gradient(135deg,#2e7d32,#4caf50)',
    color: '#fff', border: 'none', cursor: 'pointer', marginBottom: '6px',
  },
  continueBtn: {
    width: '100%', padding: '10px', borderRadius: '10px',
    fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: '12px',
    background: 'transparent', color: '#7a6a4a',
    border: '1px solid #2a2418', cursor: 'pointer',
  },
  modeRow: {
    display: 'flex', gap: '6px', marginBottom: '10px',
  },
  modeBtn: (active) => ({
    flex: 1, padding: '6px', borderRadius: '8px', cursor: 'pointer',
    fontFamily: "'Cinzel',serif", fontSize: '10px', fontWeight: 600,
    background: active ? '#e0505020' : '#0d0b07',
    border: `1px solid ${active ? '#e0505060' : '#1e1a12'}`,
    color: active ? '#e05050' : '#5a4a2a',
  }),
};

function die6() { return Math.floor(Math.random() * 6) + 1; }

export default function PhoneCombat({ gameId, playerId, player, diceMode = 'virtual' }) {
  const [combat,   setCombat]   = useState(null);
  const [physVal,  setPhysVal]  = useState('');
  const [mode,     setMode]     = useState(diceMode);
  const [result,   setResult]   = useState(null); // win|lose|draw|tame|flee
  const [rolling,  setRolling]  = useState(false);
  const [tamePhase,setTamePhase]= useState(false);

  useEffect(() => {
    const unsub = listenCombat(gameId, (data) => {
      setCombat(data);
      setResult(null);
      setTamePhase(false);
    });
    return unsub;
  }, [gameId]);

  if (!combat) return null;

  const isMyTurn    = combat.currentFighter === playerId;
  const enemy       = combat.enemy;
  const enemyLife   = combat.enemyLife ?? enemy?.life ?? 0;
  const enemyLifePct= (enemyLife / (enemy?.life || 1)) * 100;
  const playerLife  = player?.stats?.life || 0;
  const playerMaxLife = player?.stats?.maxLife || 1;
  const playerLifePct = (playerLife / playerMaxLife) * 100;
  const myRoll      = combat.rolls?.[playerId];
  const enemyRoll   = combat.enemyRoll;
  const canTame     = enemyLife <= (enemy?.life || 1) * 0.25 && enemy?.tameble && !player?.pet;

  // ── Hod ──────────────────────────────────────────────────────────────────
  const doRoll = async (roll) => {
    if (rolling || !isMyTurn) return;
    setRolling(true);
    play('dice');

    const str       = player?.stats?.str || 1;
    const petBonus  = combat.petUsed && player?.pet ? (player.pet.str || 0) : 0;
    const playerT   = roll + str + petBonus;
    const eRoll     = die6();
    const enemyT    = eRoll + (enemy?.str || 0);

    await addLog(gameId,
      `${player.name} hodil ${roll}+${str}=${playerT} | ${enemy.name} hodil ${eRoll}+${enemy.str}=${enemyT}`,
      'dice'
    );

    let newEnemyLife = enemyLife;
    let outcome = 'draw';

    if (playerT > enemyT) {
      newEnemyLife = Math.max(0, enemyLife - 1);
      outcome = newEnemyLife <= 0 ? 'win' : 'hit';
      play('hit');
    } else if (enemyT > playerT) {
      outcome = 'lose_round';
      play('damage');
    }

    // Aktualizuj combat state
    const newCombat = {
      ...combat,
      rolls:     { ...(combat.rolls||{}), [playerId]: roll },
      enemyRoll: eRoll,
      enemyLife: newEnemyLife,
      lastResult: outcome,
      currentFighter: null, // čeká se na výsledek
    };

    if (outcome === 'win') {
      // Nepřítel mrtev
      await handleCombatWin(gameId, playerId, player, enemy);
      await clearCombatState(gameId);
      setResult('win');
      play('win');
    } else if (outcome === 'lose_round') {
      await handleCombatLoss(gameId, playerId, player, enemy, 1);
      await clearCombatState(gameId);
      setResult('lose');
    } else {
      // Pokračuj — příšera ještě žije
      await setCombatState(gameId, {
        ...newCombat,
        rolls: {},
        enemyRoll: null,
        currentFighter: playerId, // znovu na tahu
      });

      // Zkontroluj možnost ochočení
      if (newEnemyLife <= (enemy?.life || 1) * 0.25 && enemy?.tameble) {
        setTamePhase(true);
      }
    }

    setPhysVal('');
    setRolling(false);
  };

  const handleVirtual = () => { const r = die6(); doRoll(r); };
  const handlePhysical = () => {
    const n = parseInt(physVal);
    if (!n || n < 1 || n > 6) return;
    doRoll(n);
  };

  const handleTame = async () => {
    const enemyWithLife = { ...enemy, currentLife: enemyLife };
    const res = await attemptTame(gameId, playerId, player, enemyWithLife);
    await clearCombatState(gameId);
    setResult(res.success ? 'tame' : 'lose');
    setTamePhase(false);
    if (res.success) play('tame');
  };

  const handleFlee = async () => {
    const roll = die6();
    if (roll >= 4) {
      await addLog(gameId, `🏃 ${player.name} utekl ze souboje!`, 'info');
      await clearCombatState(gameId);
      setResult('flee');
    } else {
      await addLog(gameId, `🏃 Útěk selhal! ${player.name} ztratil 1 ŽP.`, 'bad');
      await handleCombatLoss(gameId, playerId, player, { ...enemy, str: 0 }, 1);
    }
  };

  // ── Výsledek ──────────────────────────────────────────────────────────────
  if (result) {
    const configs = {
      win:  { emoji: '⚔️', title: 'Vítězství!',     sub: `${enemy?.name} poražen!`,    win: true  },
      tame: { emoji: '🐾', title: 'Ochočeno!',       sub: `${enemy?.name} je tvůj!`,    win: true  },
      lose: { emoji: '💔', title: 'Porážka!',        sub: 'Ztratil jsi 1 ŽP.',          win: false },
      draw: { emoji: '🤝', title: 'Remíza',          sub: 'Nikdo neztrácí životy.',      win: true  },
      flee: { emoji: '🏃', title: 'Utekl jsi!',      sub: 'Bezpečně jsi uprchl.',        win: true  },
    };
    const cfg = configs[result] || configs.win;
    return (
      <div style={S.wrap}>
        <div style={S.resultBox(cfg.win)}>
          <div style={S.resultEmoji}>{cfg.emoji}</div>
          <div style={S.resultTitle(cfg.win)}>{cfg.title}</div>
          <div style={S.resultSub}>{cfg.sub}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <div style={S.title}>⚔️ SOUBOJ</div>

      {/* Bojovníci */}
      <div style={S.fighters}>
        {/* Hráč */}
        <div style={S.fighter}>
          <div style={S.fighterEmoji}>{player?.character?.emoji}</div>
          <div style={S.fighterName('#c0932a')}>{player?.name}</div>
          <div style={S.fighterStat}>⚔️ {player?.stats?.str}</div>
          <div style={S.lifeBar}>
            <div style={S.lifeBarFill(playerLifePct, playerLifePct > 50 ? '#4caf50' : playerLifePct > 25 ? '#f0c040' : '#e05050')} />
          </div>
          <div style={{ fontSize: '11px', color: '#7a6a4a' }}>❤️ {playerLife}/{playerMaxLife}</div>
          {myRoll != null && (
            <>
              <div style={S.rollBadge('#c0932a')}>{myRoll}</div>
              <div style={S.totalText}>= {myRoll + (player?.stats?.str||0)} celkem</div>
            </>
          )}
        </div>

        <div style={S.vs}>VS</div>

        {/* Nepřítel */}
        <div style={S.fighter}>
          <div style={S.fighterEmoji}>{enemy?.emoji}</div>
          <div style={S.fighterName('#e05050')}>{enemy?.name}</div>
          <div style={S.fighterStat}>⚔️ {enemy?.str}</div>
          <div style={S.lifeBar}>
            <div style={S.lifeBarFill(enemyLifePct, '#e05050')} />
          </div>
          <div style={{ fontSize: '11px', color: '#7a6a4a' }}>❤️ {enemyLife}/{enemy?.life}</div>
          {enemyRoll != null && (
            <>
              <div style={S.rollBadge('#e05050')}>{enemyRoll}</div>
              <div style={S.totalText}>= {enemyRoll + (enemy?.str||0)} celkem</div>
            </>
          )}
          {canTame && (
            <div style={{ fontSize: '10px', color: '#4caf50', marginTop: '4px' }}>
              🐾 Ochočit!
            </div>
          )}
        </div>
      </div>

      {/* Ochočení */}
      {tamePhase && !player?.pet && (
        <div style={S.tameBox}>
          <div style={S.tameTitle}>🐾 Příšera je oslabena!</div>
          <div style={{ fontSize: '12px', color: '#7a6a4a', marginBottom: '8px' }}>
            {enemy?.petStats?.ability || 'Bojuje po tvém boku.'}
          </div>
          <button style={S.tameBtn} onClick={handleTame}>Ochočit {enemy?.emoji} {enemy?.name}</button>
          <button style={S.continueBtn} onClick={() => setTamePhase(false)}>Pokračovat v boji</button>
        </div>
      )}

      {/* Akce */}
      {isMyTurn && !tamePhase && (
        <>
          <div style={S.modeRow}>
            <button style={S.modeBtn(mode==='virtual')}  onClick={() => setMode('virtual')}>🎲 Virtuální</button>
            <button style={S.modeBtn(mode==='physical')} onClick={() => setMode('physical')}>🎯 Fyzická</button>
          </div>

          {mode === 'virtual' ? (
            <button
              style={{ ...S.diceBtn, background: rolling ? '#1a1810' : 'linear-gradient(135deg,#e05050,#c03030)', color: rolling ? '#5a4a2a' : '#fff' }}
              onClick={handleVirtual}
              disabled={rolling}
            >
              <span style={{ fontSize: '24px' }}>🎲</span>
              <span>{rolling ? 'Hážu...' : 'Hodit v souboji'}</span>
            </button>
          ) : (
            <>
              <input
                style={S.physInput}
                type="number" min="1" max="6"
                placeholder="1 – 6"
                value={physVal}
                onChange={e => setPhysVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePhysical()}
              />
              <button
                style={{ ...S.diceBtn, background: 'linear-gradient(135deg,#4caf50,#2e7d32)', color: '#fff' }}
                onClick={handlePhysical}
              >
                ✅ Potvrdit hod
              </button>
            </>
          )}

          <button style={{ ...S.diceBtn, background: '#0d0b07', color: '#7a6a4a',
                            border: '1px solid #2a2418', fontSize: '13px', padding: '10px' }}
                  onClick={handleFlee}>
            🏃 Zkusit utéct
          </button>
        </>
      )}

      {!isMyTurn && (
        <div style={S.phaseText}>
          Čekej na svůj hod...
        </div>
      )}
    </div>
  );
}
