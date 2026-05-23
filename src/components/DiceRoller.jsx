// src/components/DiceRoller.jsx
// Kostka na telefonu hráče — virtuální nebo fyzická

import { useState } from 'react';
import { updatePlayerPosition, addLog, setPhase, updatePlayerStats } from '../game/gameState';
import { ZONE_LOCATIONS } from '../data/mapData';
import { getEffectiveMove } from '../game/worldManager';
import { addItemToInventory } from '../game/gameState';
import { drawCard } from '../game/worldData';
import { getRandomEnemy } from '../data/bestiary';
import { getEnemyStrBonus } from '../game/worldManager';
import { play } from '../game/soundEngine';

const S = {
  wrap: { padding:'14px' },
  diceBtn: {
    width:'100%', padding:'20px', borderRadius:'14px',
    fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:'18px',
    letterSpacing:'2px', border:'none', cursor:'pointer',
    background:'linear-gradient(135deg,#c0932a,#a07820)',
    color:'#0c0c0e',
    boxShadow:'0 4px 20px #c0932a40',
    transition:'all 0.15s',
    marginBottom:'10px',
    display:'flex', alignItems:'center', justifyContent:'center', gap:'12px',
  },
  resultBox: {
    textAlign:'center', padding:'16px',
    background:'#0d0b07', borderRadius:'12px',
    border:'1px solid #2a2418', marginBottom:'10px',
  },
  resultNum: {
    fontFamily:"'Cinzel',serif", fontSize:'52px', fontWeight:900,
    color:'#c0932a', lineHeight:1,
    textShadow:'0 0 30px #c0932a80',
  },
  resultSub: { fontSize:'12px', color:'#7a6a4a', marginTop:'6px' },
  physWrap: { marginBottom:'10px' },
  physInput: {
    width:'100%', padding:'14px', boxSizing:'border-box',
    background:'#0d0b07', border:'2px solid #2a2418', borderRadius:'10px',
    color:'#e0d5c0', fontSize:'24px', textAlign:'center',
    fontFamily:"'Cinzel',serif", fontWeight:700, outline:'none',
    marginBottom:'8px',
  },
  confirmBtn: {
    width:'100%', padding:'14px', borderRadius:'10px',
    fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'14px',
    border:'none', cursor:'pointer',
    background:'linear-gradient(135deg,#4caf50,#2e7d32)',
    color:'#fff', marginBottom:'8px',
  },
  modeToggle: {
    display:'flex', gap:'6px', marginBottom:'12px',
  },
  modeBtn: (active) => ({
    flex:1, padding:'8px', borderRadius:'8px', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:'11px', fontWeight:600,
    background: active ? '#c0932a20' : '#0d0b07',
    border:`1px solid ${active ? '#c0932a' : '#2a2418'}`,
    color: active ? '#c0932a' : '#5a4a2a',
  }),
  locPreview: {
    display:'flex', alignItems:'center', gap:'10px',
    padding:'10px 12px', background:'#0d1a0d',
    border:'1px solid #1e3a1e', borderRadius:'10px',
    marginTop:'8px',
  },
};

function die6() { return Math.floor(Math.random() * 6) + 1; }

export default function DiceRoller({ gameId, playerId, player, game, settings }) {
  const [result,    setResult]    = useState(null);
  const [physVal,   setPhysVal]   = useState('');
  const [mode,      setMode]      = useState(settings?.diceMode || 'virtual');
  const [rolling,   setRolling]   = useState(false);
  const [newLoc,    setNewLoc]    = useState(null);

  const doRoll = async (roll) => {
    if (rolling) return;
    setRolling(true);
    play('dice');

    const zone     = player.zone || 1;
    const baseMove = player.stats?.move || 1;
    const finalMove= getEffectiveMove(baseMove, game.weather, game.timeOfDay, zone);
    const zoneLocs = ZONE_LOCATIONS[zone] || ZONE_LOCATIONS[1];
    const newPos   = (player.position + roll) % zoneLocs.length;
    const loc      = zoneLocs[newPos];

    setResult(roll);
    setNewLoc(loc);

    await addLog(gameId, `${player.name} hodil ${roll} 🎲 → ${loc.emoji} ${loc.name}`, 'dice');
    await updatePlayerPosition(gameId, playerId, newPos, zone);
    await setPhase(gameId, 'draw');

    setRolling(false);
  };

  const handleVirtual = () => {
    const roll = die6();
    doRoll(roll);
  };

  const handlePhysical = () => {
    const n = parseInt(physVal);
    if (!n || n < 1 || n > 6) return;
    doRoll(n);
    setPhysVal('');
  };

  // Pokud už je výsledek, zobraz jen lokaci
  if (result && newLoc) {
    return (
      <div style={S.wrap}>
        <div style={S.resultBox}>
          <div style={S.resultNum}>{result}</div>
          <div style={S.resultSub}>🎲 Hod kostkou</div>
        </div>
        <div style={S.locPreview}>
          <span style={{ fontSize:'28px' }}>{newLoc.emoji}</span>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', color:'#c0932a', fontWeight:700 }}>
              {newLoc.name}
            </div>
            <div style={{ fontSize:'12px', color:'#7a6a4a' }}>
              {newLoc.type === 'safe' ? '✅ Bezpečné' :
               newLoc.type === 'inn' ? '🍺 Hospoda' :
               newLoc.type === 'temple' ? '⛪ Chrám' :
               newLoc.type === 'smithy' ? '⚒️ Kovárna' :
               '⚠️ Nebezpečné'}
            </div>
          </div>
        </div>
        <div style={{ fontSize:'12px', color:'#5a4a2a', textAlign:'center', marginTop:'10px' }}>
          Táhni kartu na hrací desce nebo počkej...
        </div>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      {/* Přepínač mód */}
      <div style={S.modeToggle}>
        <button style={S.modeBtn(mode==='virtual')}  onClick={() => setMode('virtual')}>🎲 Virtuální</button>
        <button style={S.modeBtn(mode==='physical')} onClick={() => setMode('physical')}>🎯 Fyzická</button>
      </div>

      {mode === 'virtual' ? (
        <button style={{ ...S.diceBtn, opacity: rolling ? 0.7 : 1 }}
                onClick={handleVirtual} disabled={rolling}>
          <span style={{ fontSize:'28px' }}>🎲</span>
          <span>{rolling ? 'Házím...' : 'Hodit kostkou'}</span>
        </button>
      ) : (
        <div style={S.physWrap}>
          <div style={{ fontSize:'12px', color:'#7a6a4a', marginBottom:'8px', textAlign:'center' }}>
            Hoď fyzickou kostkou a zadej výsledek:
          </div>
          <input
            style={S.physInput}
            type="number" min="1" max="6"
            placeholder="1 – 6"
            value={physVal}
            onChange={e => setPhysVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePhysical()}
          />
          <button style={S.confirmBtn} onClick={handlePhysical}
                  disabled={!physVal || parseInt(physVal) < 1 || parseInt(physVal) > 6}>
            ✅ Potvrdit hod
          </button>
        </div>
      )}

      <div style={{ fontSize:'11px', color:'#3a3020', textAlign:'center' }}>
        Pohyb: {player.stats?.move || 1} základní
        {game.weather === 'rain'  && ' · 🌧️ Déšť −1'}
        {game.weather === 'storm' && ' · ⛈️ Bouře −2'}
        {game.timeOfDay === 'morning' && ' · 🌅 Ráno +1'}
        {game.timeOfDay === 'night'   && ' · 🌙 Noc −1'}
      </div>
    </div>
  );
}
