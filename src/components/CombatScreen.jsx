// src/components/CombatScreen.jsx
// Soubojová obrazovka — hod, schopnosti, pet, ochočování

import { useState } from 'react';
import { resolveCombatRound, handleCombatWin, handleCombatLoss,
         attemptTame, petAttack, useAbilityInCombat as applyAbilityInCombat, getCombatStats } from '../game/combatEngine';
import { addLog, setPhase } from '../game/gameState';

const S = {
  wrap: {
    background:'#1a0d0d', border:'1px solid #5a1a1a',
    borderRadius:'16px', padding:'20px', marginBottom:'14px',
  },
  title: {
    fontFamily:"'Cinzel',serif", fontSize:'16px', fontWeight:700,
    color:'#e05050', textAlign:'center', letterSpacing:'3px', marginBottom:'16px',
  },
  fighters: {
    display:'flex', justifyContent:'space-around', alignItems:'flex-start',
    gap:'16px', marginBottom:'16px',
  },
  fighter: { textAlign:'center', flex:1 },
  fighterEmoji: { fontSize:'36px', marginBottom:'6px' },
  fighterName: (color) => ({
    fontFamily:"'Cinzel',serif", fontSize:'13px', fontWeight:700, color,
    marginBottom:'4px',
  }),
  fighterStat: { fontSize:'12px', color:'#7a6a4a', marginBottom:'2px' },
  rollBadge: (color='#c0932a') => ({
    display:'inline-block', background:color, color:'#fff',
    borderRadius:'8px', padding:'5px 16px', fontWeight:700,
    fontSize:'20px', fontFamily:"'Cinzel',serif", margin:'6px 0',
    boxShadow:`0 0 16px ${color}60`,
  }),
  totalBadge: { fontSize:'12px', color:'#9a8a6a', marginTop:'2px' },
  divider: {
    color:'#e05050', fontWeight:700, fontSize:'20px',
    alignSelf:'center', flexShrink:0,
  },
  lifeBar: (pct) => ({
    height:'6px', background:'#1e0a0a', borderRadius:'3px',
    overflow:'hidden', marginTop:'4px',
  }),
  lifeBarFill: (pct, color='#e05050') => ({
    height:'100%', borderRadius:'3px',
    width:`${Math.max(0, Math.min(100, pct))}%`,
    background:color, transition:'width 0.4s',
  }),
  section: { marginBottom:'14px' },
  sectionTitle: {
    fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px',
    color:'#7a6a4a', textTransform:'uppercase',
    marginBottom:'8px', borderBottom:'1px solid #2a1010', paddingBottom:'4px',
  },
  btn: (color='#c0932a', disabled=false, size='normal') => ({
    padding: size==='sm' ? '8px 14px' : '12px 20px',
    borderRadius:'10px', cursor:disabled?'not-allowed':'pointer',
    fontFamily:"'Cinzel',serif", fontWeight:700,
    fontSize: size==='sm' ? '11px' : '13px',
    letterSpacing:'1px', border:'none',
    background:disabled?'#1a1810':`linear-gradient(135deg,${color},${color}bb)`,
    color:disabled?'#3a3020':'#0c0c0e',
    opacity:disabled?0.6:1, marginRight:'6px', marginBottom:'6px',
    transition:'all 0.2s',
  }),
  abilityBtn: (canUse) => ({
    display:'flex', alignItems:'center', gap:'8px',
    padding:'9px 12px', borderRadius:'9px', marginBottom:'6px',
    background:canUse?'#1a1408':'#0d0b07',
    border:`1px solid ${canUse?'#c0932a40':'#1e1a12'}`,
    cursor:canUse?'pointer':'not-allowed',
    opacity:canUse?1:0.5, width:'100%', textAlign:'left',
  }),
  resultBox: (win) => ({
    padding:'16px', borderRadius:'12px', textAlign:'center',
    background:win?'#0d1a0d':'#1a0d0d',
    border:`1px solid ${win?'#2a5a2a':'#5a2a2a'}`,
    marginBottom:'12px',
  }),
  tameBox: {
    background:'#0d150d', border:'1px solid #2a5a2a',
    borderRadius:'12px', padding:'14px', marginBottom:'12px',
  },
  log: {
    background:'#0d0b07', borderRadius:'8px', padding:'10px',
    maxHeight:'120px', overflowY:'auto', fontSize:'12px',
    color:'#9a8a6a', lineHeight:1.6,
  },
};

function die6() { return Math.floor(Math.random() * 6) + 1; }

export default function CombatScreen({ game, session, player, enemy: initialEnemy, onCombatEnd, onWin, onLoss, onTame }) {
  const [phase,       setLocalPhase] = useState('init');   // init|player_roll|enemy_roll|result|tame
  const [playerRoll,  setPlayerRoll] = useState(null);
  const [enemyRoll,   setEnemyRoll]  = useState(null);
  const [result,      setResult]     = useState(null);     // win|lose|draw
  const [combatLog,   setCombatLog]  = useState([]);
  const [enemy,       setEnemy]      = useState(initialEnemy);
  const [enemyLife,   setEnemyLife]  = useState(initialEnemy?.life || 3);
  const [round,       setRound]      = useState(1);
  const [blocked,     setBlocked]    = useState(false);    // magický štít
  const [petUsed,     setPetUsed]    = useState(false);
  const [tamePhase,   setTamePhase]  = useState(false);
  const [tameResult,  setTameResult] = useState(null);
  const [usedAbility, setUsedAbility]= useState(null);

  const { gameId, playerId } = session;
  const cs  = getCombatStats(player);
  const pet = player?.pet;
  const hasPet = !!pet;
  const abilities = (player?.abilities || []).filter(a => a.type === 'active');
  const mana = player?.stats?.mana || 0;

  const clog = (msg) => setCombatLog(prev => [...prev.slice(-8), msg]);

  // ── Použití schopnosti ───────────────────────────────────────────────────
  const handleAbility = async (ability) => {
    if (mana < ability.manaCost || usedAbility) return;
    const res = await applyAbilityInCombat(gameId, playerId, player, ability.id, enemy);
    setUsedAbility(ability.id);
    clog(`⚡ ${ability.name}: ${res.ok ? 'Aktivováno!' : res.reason}`);
    if (res.blockNext) setBlocked(true);
  };

  // ── Hod hráče ────────────────────────────────────────────────────────────
  const handlePlayerRoll = async () => {
    const roll = die6();
    setPlayerRoll(roll);
    const bonus = usedAbility === 'rage' || usedAbility === 'berserker' ? 3 : 0;
    clog(`🎲 Ty: ${roll} + ${cs.str + bonus} Síla = ${roll + cs.str + bonus}${hasPet && petUsed ? ` + ${pet.str} pet` : ''}`);
    setLocalPhase('enemy_roll');
  };

  // ── Hod nepřítele ────────────────────────────────────────────────────────
  const handleEnemyRoll = async () => {
    const roll = die6();
    setEnemyRoll(roll);
    const petBonus   = hasPet && petUsed ? (pet.str || 0) : 0;
    const strBonus   = usedAbility === 'rage' || usedAbility === 'berserker' ? 3 : 0;
    const playerT    = playerRoll + cs.str + petBonus + strBonus;
    const enemyT     = roll + (enemy.str || 0);

    clog(`🎲 ${enemy.name}: ${roll} + ${enemy.str} Síla = ${enemyT}`);

    if (playerT > enemyT) {
      // Hráč vyhrál kolo — zranění nepřítele
      const newLife = Math.max(0, enemyLife - 1);
      setEnemyLife(newLife);
      clog(`⚔️ Zasáhl jsi! ${enemy.name}: ${newLife}/${enemy.life} ŽP`);

      if (newLife <= 0) {
        // Nepřítel mrtev
        await handleCombatWin(gameId, playerId, player, enemy);
        setResult('win');
        setLocalPhase('result');
        await setPhase(gameId, 'done');
      } else {
        // Zkontroluj, jestli je pod 25% → možnost ochočení
        if (newLife <= enemy.life * 0.25 && enemy.tameble) {
          setTamePhase(true);
          clog(`🐾 ${enemy.name} je oslaben — možnost ochočení!`);
        }
        // Další kolo
        setPlayerRoll(null); setEnemyRoll(null);
        setRound(r => r + 1);
        setLocalPhase('player_roll');
      }
    } else if (enemyT > playerT) {
      if (blocked) {
        clog(`🛡️ Magický štít zachytil útok!`);
        setBlocked(false);
        setPlayerRoll(null); setEnemyRoll(null);
        setRound(r => r + 1);
        setLocalPhase('player_roll');
      } else {
        await handleCombatLoss(gameId, playerId, player, enemy, 1);
        if (typeof onLoss === 'function') onLoss();
        setResult('lose');
        setLocalPhase('result');
        await setPhase(gameId, 'done');
      }
    } else {
      clog(`🤝 Remíza — nikdo není zraněn.`);
      setPlayerRoll(null); setEnemyRoll(null);
      setRound(r => r + 1);
      setLocalPhase('player_roll');
    }
    setUsedAbility(null);
  };

  // ── Pet útok ─────────────────────────────────────────────────────────────
  const handlePetAttack = async () => {
    const res = await petAttack(gameId, playerId, player, enemy);
    if (res.win) {
      const newLife = Math.max(0, enemyLife - 1);
      setEnemyLife(newLife);
      if (newLife <= 0) {
        await handleCombatWin(gameId, playerId, player, enemy);
        if (typeof onWin === 'function') onWin(enemy.xp || 1, enemy.gold || 0);
        setResult('win');
        setLocalPhase('result');
        await setPhase(gameId, 'done');
      }
    }
  };

  // ── Ochočení ─────────────────────────────────────────────────────────────
  const handleTame = async () => {
    const enemyWithLife = { ...enemy, currentLife: enemyLife };
    const res = await attemptTame(gameId, playerId, player, enemyWithLife);
    setTameResult(res);
    if (res.success) {
      if (typeof onTame === 'function') onTame(res.pet, true);
      setLocalPhase('result');
      setResult('tame');
      await setPhase(gameId, 'done');
    } else {
      setTamePhase(false);
      setLocalPhase('player_roll');
    }
  };

  // ── Útěk ─────────────────────────────────────────────────────────────────
  const handleFlee = async () => {
    const roll = die6();
    if (roll >= 4 + (player.stats.skill || 0) * 0 - Math.floor((player.stats.fate || 0) / 3)) {
      await addLog(gameId, `🏃 ${player.name} utekl ze souboje!`, 'info');
      setResult('flee');
      setLocalPhase('result');
      await setPhase(gameId, 'done');
    } else {
      // Neúspěšný útěk — ztráta kola
      const dmg = 1;
      await handleCombatLoss(gameId, playerId, player, { ...enemy, str: enemy.str - 2 }, dmg);
      clog(`🏃 Útěk selhal! Ztráta 1 ŽP.`);
      setLocalPhase('player_roll');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.wrap}>
      <div style={S.title}>⚔️ SOUBOJ — Kolo {round}</div>

      {/* Bojovníci */}
      <div style={S.fighters}>
        {/* Hráč */}
        <div style={S.fighter}>
          <div style={S.fighterEmoji}>{player?.character?.emoji || '👤'}</div>
          <div style={S.fighterName('#c0932a')}>{player?.name}</div>
          <div style={S.fighterStat}>Síla: {cs.str}{hasPet && petUsed ? `+${pet.str}🐾` : ''}</div>
          <div style={S.fighterStat}>Obrana: {cs.defense}</div>
          {/* Life bar */}
          <div style={S.lifeBar()}>
            <div style={S.lifeBarFill((player?.stats?.life / player?.stats?.maxLife) * 100, '#e05050')} />
          </div>
          <div style={{ fontSize:'11px', color:'#7a6a4a', marginTop:'2px' }}>
            ❤️ {player?.stats?.life}/{player?.stats?.maxLife}
          </div>
          {playerRoll != null && (
            <>
              <div style={S.rollBadge('#c0932a')}>{playerRoll}</div>
              <div style={S.totalBadge}>= {playerRoll + cs.str} celkem</div>
            </>
          )}
        </div>

        <div style={S.divider}>VS</div>

        {/* Nepřítel */}
        <div style={S.fighter}>
          <div style={S.fighterEmoji}>{enemy?.emoji}</div>
          <div style={S.fighterName('#e05050')}>{enemy?.name}</div>
          <div style={S.fighterStat}>Síla: {enemy?.str}</div>
          <div style={S.fighterStat}>{enemy?.desc?.slice(0, 30)}…</div>
          {/* Life bar nepřítele */}
          <div style={S.lifeBar()}>
            <div style={S.lifeBarFill((enemyLife / enemy?.life) * 100, '#e05050')} />
          </div>
          <div style={{ fontSize:'11px', color:'#7a6a4a', marginTop:'2px' }}>
            ❤️ {enemyLife}/{enemy?.life}
            {enemyLife <= (enemy?.life || 0) * 0.25 && enemy?.tameble &&
              <span style={{ color:'#4caf50' }}> ← OCHOČIT!</span>}
          </div>
          {enemyRoll != null && (
            <>
              <div style={S.rollBadge('#e05050')}>{enemyRoll}</div>
              <div style={S.totalBadge}>= {enemyRoll + enemy.str} celkem</div>
            </>
          )}
        </div>
      </div>

      {/* VÝSLEDEK */}
      {phase === 'result' && result && (
        <div style={S.resultBox(result === 'win' || result === 'tame')}>
          <div style={{ fontSize:'28px', marginBottom:'8px' }}>
            {result==='win'?'⚔️':result==='tame'?'🐾':result==='flee'?'🏃':'💔'}
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700,
                         color:result==='win'||result==='tame'?'#4caf50':'#e05050' }}>
            {result==='win'  && 'Vítězství!'}
            {result==='lose' && 'Porážka!'}
            {result==='tame' && `${enemy?.emoji} ${enemy?.name} ochočen!`}
            {result==='flee' && 'Unikl jsi!'}
          </div>
          <button style={{ ...S.btn('#c0932a'), marginTop:'12px' }} onClick={onCombatEnd}>
            Pokračovat →
          </button>
        </div>
      )}

      {/* OCHOČENÍ */}
      {tamePhase && phase !== 'result' && (
        <div style={S.tameBox}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px',
                         color:'#4caf50', fontWeight:700, marginBottom:'6px' }}>
            🐾 Příšera je oslabena — můžeš ji ochočit!
          </div>
          {hasPet ? (
            <div style={{ fontSize:'12px', color:'#7a6a4a' }}>
              Máš už společníka ({pet?.name}). Propusť ho nejdřív.
            </div>
          ) : (
            <>
              <div style={{ fontSize:'12px', color:'#9a8a6a', marginBottom:'8px' }}>
                Pet schopnost: <em>{enemy?.petStats?.ability || '—'}</em>
              </div>
              <button style={S.btn('#4caf50')} onClick={handleTame}>
                🐾 Ochočit {enemy?.name}
              </button>
              <button style={S.btn('#7a6a4a')} onClick={() => setTamePhase(false)}>
                Pokračovat v boji
              </button>
            </>
          )}
        </div>
      )}

      {/* AKCE */}
      {phase !== 'result' && (
        <>
          {/* Schopnosti */}
          {abilities.length > 0 && phase === 'player_roll' && (
            <div style={S.section}>
              <div style={S.sectionTitle}>Schopnosti (💧{mana} many)</div>
              {abilities.slice(0, 4).map(a => {
                const canUse = mana >= a.manaCost && !usedAbility;
                return (
                  <div key={a.id} style={S.abilityBtn(canUse)}
                       onClick={() => canUse && handleAbility(a)}>
                    <span style={{ fontSize:'16px' }}>⚡</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:'12px',
                                     color:canUse?'#c0932a':'#5a4a2a', fontWeight:700 }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize:'11px', color:'#7a6a4a' }}>{a.desc}</div>
                    </div>
                    <span style={{ fontSize:'11px', color:'#5b8dd9', flexShrink:0 }}>
                      💧{a.manaCost}
                    </span>
                    {usedAbility === a.id && <span style={{ color:'#4caf50' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pet */}
          {hasPet && phase === 'player_roll' && (
            <div style={S.section}>
              <div style={S.sectionTitle}>Společník — {pet?.emoji} {pet?.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <span style={{ fontSize:'24px' }}>{pet?.emoji}</span>
                <div>
                  <div style={{ fontSize:'12px', color:'#c0932a', fontWeight:700 }}>{pet?.name}</div>
                  <div style={{ fontSize:'11px', color:'#7a6a4a' }}>
                    Síla: {pet?.str} · ŽP: {pet?.life}/{pet?.maxLife}
                  </div>
                </div>
                <label style={{ marginLeft:'auto', display:'flex', alignItems:'center',
                                 gap:'6px', fontSize:'12px', color:'#9a8a6a', cursor:'pointer' }}>
                  <input type="checkbox" checked={petUsed}
                         onChange={e => setPetUsed(e.target.checked)} />
                  Zapojen do útoku
                </label>
              </div>
              <button style={S.btn('#4caf50', false, 'sm')} onClick={handlePetAttack}>
                🐾 Pet samostatně zaútočí
              </button>
            </div>
          )}

          {/* Hlavní akce */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {(phase === 'init' || phase === 'player_roll') && (
              <button style={S.btn('#c0932a')} onClick={handlePlayerRoll}>
                🎲 Hod hráče
              </button>
            )}
            {phase === 'enemy_roll' && (
              <button style={S.btn('#e05050')} onClick={handleEnemyRoll}>
                🎲 Hod nepřítele
              </button>
            )}
            {(phase === 'init' || phase === 'player_roll') && (
              <button style={S.btn('#7a6a4a', false, 'sm')} onClick={handleFlee}>
                🏃 Útěk
              </button>
            )}
          </div>
        </>
      )}

      {/* Combat log */}
      {combatLog.length > 0 && (
        <div style={{ marginTop:'12px' }}>
          <div style={S.sectionTitle}>Průběh souboje</div>
          <div style={S.log}>
            {combatLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
