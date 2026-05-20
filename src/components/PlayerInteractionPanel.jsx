// src/components/PlayerInteractionPanel.jsx
// Panel interakcí mezi hráči na stejném poli

import { useState } from 'react';
import {
  startPvpChallenge, proposeTradeRequest,
  proposeAlliance, breakAlliance, areAllied,
  setUpCamp, joinCamp,
} from '../game/multiplayerEngine';
import { addLog } from '../game/gameState';

const S = {
  wrap: {
    background:'#16140e', border:'1px solid #2a2418',
    borderRadius:'14px', padding:'16px', marginBottom:'14px',
  },
  header: {
    fontFamily:"'Cinzel',serif", fontSize:'12px', letterSpacing:'3px',
    color:'#7a6a4a', textTransform:'uppercase',
    marginBottom:'12px', borderBottom:'1px solid #1e1a12', paddingBottom:'6px',
    display:'flex', alignItems:'center', gap:'8px',
  },
  playerRow: (color) => ({
    display:'flex', alignItems:'center', gap:'12px',
    background:`${color}08`, border:`1px solid ${color}25`,
    borderRadius:'10px', padding:'10px 12px', marginBottom:'8px',
  }),
  playerName: (color) => ({
    fontFamily:"'Cinzel',serif", fontSize:'13px', color, fontWeight:700, flex:1,
  }),
  actionGroup: {
    display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'8px',
  },
  btn: (color='#c0932a', variant='normal') => ({
    padding: variant==='sm' ? '6px 12px' : '9px 16px',
    borderRadius:'8px', border:'none', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontWeight:700,
    fontSize: variant==='sm' ? '11px' : '12px',
    background:`${color}20`, color,
    border:`1px solid ${color}40`,
    transition:'all 0.2s',
  }),
  tradePanel: {
    background:'#0d0b07', border:'1px solid #1e1a12',
    borderRadius:'10px', padding:'12px', marginTop:'10px',
  },
  itemPill: (selected) => ({
    display:'inline-flex', alignItems:'center', gap:'4px',
    padding:'5px 10px', borderRadius:'20px', margin:'3px',
    background:selected?'#c0932a20':'#1a1810',
    border:`1px solid ${selected?'#c0932a60':'#2a2418'}`,
    color:selected?'#c0932a':'#7a6a4a', fontSize:'12px', cursor:'pointer',
  }),
  feedback: (ok) => ({
    padding:'8px 12px', borderRadius:'8px', fontSize:'12px', marginTop:'8px',
    background:ok?'#0d1a0d':'#1a0d0d',
    border:`1px solid ${ok?'#2a5a2a':'#5a2a2a'}`,
    color:ok?'#4caf50':'#e05050',
  }),
  campBox: {
    background:'#0d0d0f', border:'1px solid #1e1a12',
    borderRadius:'10px', padding:'12px', marginTop:'10px',
  },
  allianceTag: {
    display:'inline-flex', alignItems:'center', gap:'4px',
    background:'#0d1a0d', border:'1px solid #2a5a2a',
    borderRadius:'20px', padding:'3px 10px', fontSize:'11px', color:'#4caf50',
  },
};

function die6() { return Math.floor(Math.random() * 6) + 1; }

export default function PlayerInteractionPanel({
  currentPlayer, otherPlayers, game, session, isMyTurn
}) {
  const [feedback,        setFeedback]        = useState(null);
  const [tradeTarget,     setTradeTarget]     = useState(null);
  const [myItemIdx,       setMyItemIdx]       = useState(null);
  const [theirItemIdx,    setTheirItemIdx]    = useState(null);
  const [pvpTarget,       setPvpTarget]       = useState(null);
  const [pvpRolls,        setPvpRolls]        = useState({ me: null, them: null });
  const [campMode,        setCampMode]        = useState(false);

  const { gameId, playerId } = session;
  const mode = game.mode || 'coop';

  if (!otherPlayers || otherPlayers.length === 0) return null;

  const fb = (ok, msg) => { setFeedback({ ok, msg }); setTimeout(() => setFeedback(null), 3000); };

  // ── PvP výzva ──────────────────────────────────────────────────────────
  const handlePvpChallenge = async (target) => {
    setPvpTarget(target);
    const res = await startPvpChallenge(gameId, playerId, target.id);
    if (!res.ok) { fb(false, res.reason); setPvpTarget(null); }
    else await addLog(gameId, `⚔️ ${currentPlayer.name} vyzval ${target.name} na PvP souboj!`, 'ev');
  };

  const handlePvpRoll = async (isMe) => {
    const roll = die6();
    setPvpRolls(prev => ({ ...prev, [isMe ? 'me' : 'them']: roll }));
    return roll;
  };

  // ── Obchod ─────────────────────────────────────────────────────────────
  const handleProposeTrade = async () => {
    if (myItemIdx === null || theirItemIdx === null || !tradeTarget) {
      fb(false, 'Vyber předmět svůj i cílový.'); return;
    }
    await proposeTradeRequest(gameId, playerId, tradeTarget.id, myItemIdx, theirItemIdx);
    await addLog(gameId, `🤝 ${currentPlayer.name} nabídl obchod s ${tradeTarget.name}.`, 'info');
    fb(true, 'Nabídka odeslána — čeká se na přijetí.');
    setTradeTarget(null); setMyItemIdx(null); setTheirItemIdx(null);
  };

  // ── Aliance ────────────────────────────────────────────────────────────
  const handleAlliance = async (target) => {
    if (areAllied(game, playerId, target.id)) {
      await breakAlliance(gameId, playerId, target.id);
      fb(true, `Alliance s ${target.name} zrušena.`);
    } else {
      await proposeAlliance(gameId, playerId, target.id);
      fb(true, `Nabídka aliance odeslána ${target.name}.`);
    }
  };

  // ── Tábořiště ──────────────────────────────────────────────────────────
  const handleCamp = async () => {
    await setUpCamp(gameId, playerId, currentPlayer.name, currentPlayer.position, currentPlayer.zone || 1);
    fb(true, 'Tábořiště zřízeno — spoluhráči se mohou přidat.');
    setCampMode(false);
  };

  const handleJoinCamp = async (hostId) => {
    const host = game.players[hostId];
    if (!host) return;
    const res = await joinCamp(gameId, currentPlayer, hostId, game);
    fb(res.ok, res.ok ? 'Odpočíváš u tábořiště (+2 ŽP, +2 Mana).' : res.reason);
  };

  // ── Sdílená informace – zobrazíme jen hráče na stejném poli ─────────────
  const sameTilePlayers = otherPlayers.filter(
    p => p.position === currentPlayer.position && (p.zone||1) === (currentPlayer.zone||1)
  );
  const nearbyCamps = Object.values(game.camps || {}).filter(
    c => c.position === currentPlayer.position && c.zone === (currentPlayer.zone||1) && c.playerId !== playerId
  );

  if (sameTilePlayers.length === 0 && nearbyCamps.length === 0) return null;

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span>👥</span>
        <span>Hráči na stejném poli</span>
        {mode === 'pvp' && <span style={{ color:'#e05050', fontSize:'10px' }}>⚔️ PvP</span>}
        {mode === 'coop' && <span style={{ color:'#4caf50', fontSize:'10px' }}>🤝 Coop</span>}
      </div>

      {sameTilePlayers.map(other => {
        const allied = areAllied(game, playerId, other.id);
        const color  = other.character?.color || '#c0932a';
        return (
          <div key={other.id}>
            <div style={S.playerRow(color)}>
              <span style={{ fontSize:'22px' }}>{other.character?.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={S.playerName(color)}>
                  {other.name}
                  {allied && <span style={{ marginLeft:'8px', ...S.allianceTag }}>🤝 Spojenec</span>}
                </div>
                <div style={{ fontSize:'11px', color:'#5a4a2a' }}>
                  {other.character?.name} · Lv.{other.stats.level||1} ·
                  ❤️{other.stats.life}/{other.stats.maxLife} · ⚔️{other.stats.str}
                  {other.pet && ` · ${other.pet.emoji}`}
                </div>
              </div>
            </div>

            {isMyTurn && (
              <div style={S.actionGroup}>
                {/* COOP — společný souboj */}
                {mode === 'coop' && game.phase === 'combat' && (
                  <button style={S.btn('#4caf50')}
                          onClick={() => addLog(gameId, `🤝 ${currentPlayer.name} a ${other.name} bojují společně!`, 'ok')}>
                    ⚔️ Bojovat společně
                  </button>
                )}

                {/* Obchod */}
                <button style={S.btn('#c0932a')}
                        onClick={() => setTradeTarget(tradeTarget?.id === other.id ? null : other)}>
                  🔄 Obchod
                </button>

                {/* PvP výzva */}
                {mode === 'pvp' && !allied && (
                  <button style={S.btn('#e05050')} onClick={() => handlePvpChallenge(other)}>
                    ⚔️ Vyzvat k souboji
                  </button>
                )}

                {/* Aliance (PvP) */}
                {mode === 'pvp' && (
                  <button style={S.btn(allied ? '#e05050' : '#4caf50', 'sm')}
                          onClick={() => handleAlliance(other)}>
                    {allied ? '💔 Zrušit alianci' : '🤝 Nabídnout alianci'}
                  </button>
                )}
              </div>
            )}

            {/* Obchodní panel */}
            {tradeTarget?.id === other.id && (
              <div style={S.tradePanel}>
                <div style={{ fontSize:'12px', color:'#7a6a4a', marginBottom:'8px', fontFamily:"'Cinzel',serif" }}>
                  MŮJ PŘEDMĚT
                </div>
                <div>
                  {(currentPlayer.inventory || []).length === 0
                    ? <span style={{ fontSize:'12px', color:'#5a4a2a' }}>Prázdný inventář</span>
                    : (currentPlayer.inventory || []).map((item, i) => (
                      <span key={i} style={S.itemPill(myItemIdx === i)} onClick={() => setMyItemIdx(i)}>
                        {item.emoji} {item.name}
                      </span>
                    ))
                  }
                </div>
                <div style={{ fontSize:'12px', color:'#7a6a4a', margin:'10px 0 8px', fontFamily:"'Cinzel',serif" }}>
                  ZA JEJICH PŘEDMĚT
                </div>
                <div>
                  {(other.inventory || []).length === 0
                    ? <span style={{ fontSize:'12px', color:'#5a4a2a' }}>Prázdný inventář</span>
                    : (other.inventory || []).map((item, i) => (
                      <span key={i} style={S.itemPill(theirItemIdx === i)} onClick={() => setTheirItemIdx(i)}>
                        {item.emoji} {item.name}
                      </span>
                    ))
                  }
                </div>
                <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                  <button style={S.btn('#4caf50')} onClick={handleProposeTrade}>
                    ✅ Nabídnout obchod
                  </button>
                  <button style={S.btn('#e05050', 'sm')} onClick={() => setTradeTarget(null)}>
                    Zrušit
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Tábořiště v okolí */}
      {nearbyCamps.length > 0 && (
        <div style={S.campBox}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', color:'#7a6a4a', letterSpacing:'2px', marginBottom:'8px' }}>
            ⛺ TÁBOŘIŠTĚ V OKOLÍ
          </div>
          {nearbyCamps.map(camp => (
            <div key={camp.playerId} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <span style={{ fontSize:'14px', color:'#9a8a6a' }}>⛺ {camp.playerName}</span>
              {isMyTurn && (
                <button style={S.btn('#4caf50', 'sm')} onClick={() => handleJoinCamp(camp.playerId)}>
                  Přidat se (+2 ŽP)
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Možnost zřídit tábořiště */}
      {isMyTurn && game.phase === 'done' && (
        <div style={{ marginTop:'10px' }}>
          <button style={S.btn('#9a8a6a', 'sm')} onClick={handleCamp}>
            ⛺ Zřídit tábořiště
          </button>
        </div>
      )}

      {feedback && (
        <div style={S.feedback(feedback.ok)}>{feedback.ok ? '✅' : '❌'} {feedback.msg}</div>
      )}
    </div>
  );
}
