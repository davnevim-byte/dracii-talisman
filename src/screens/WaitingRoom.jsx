// src/screens/WaitingRoom.jsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { listenGame, setPlayerReady, startGame, addLog } from '../game/gameState';

const S = {
  bg: {
    minHeight:'100vh',
    background:'radial-gradient(ellipse at 50% 0%, #1a1208 0%, #0c0c0e 70%)',
    display:'flex', flexDirection:'column', alignItems:'center',
    padding:'20px', fontFamily:"'Crimson Text',Georgia,serif",
  },
  title: {
    fontFamily:"'Cinzel',serif", fontSize:'clamp(20px,4vw,30px)',
    fontWeight:900, color:'#c0932a', letterSpacing:'3px',
    textAlign:'center', marginBottom:'4px', marginTop:'20px',
  },
  sub: { color:'#7a6a4a', fontSize:'13px', letterSpacing:'3px', textTransform:'uppercase', textAlign:'center', marginBottom:'24px' },
  card: {
    background:'linear-gradient(135deg,#16140e,#1a1810)',
    border:'1px solid #2a2418', borderRadius:'16px',
    padding:'24px', width:'100%', maxWidth:'500px', marginBottom:'14px',
  },
  sectionTitle: {
    fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px',
    color:'#7a6a4a', textTransform:'uppercase',
    marginBottom:'12px', borderBottom:'1px solid #1e1a12', paddingBottom:'6px',
  },
  codeDisplay: {
    fontFamily:"'Cinzel',serif", fontSize:'44px', fontWeight:900,
    color:'#c0932a', letterSpacing:'14px', textAlign:'center',
    padding:'20px', background:'#0d0b07', borderRadius:'12px',
    border:'2px solid #2a2418', marginBottom:'16px',
    textShadow:'0 0 30px #c0932a55',
  },
  qrWrap: {
    background:'#fff', borderRadius:'14px', padding:'18px',
    display:'flex', justifyContent:'center', marginBottom:'14px',
  },
  playerRow: (connected, color='#c0932a') => ({
    display:'flex', alignItems:'center', gap:'12px',
    padding:'12px', borderRadius:'10px', marginBottom:'8px',
    background: connected ? `${color}10` : '#0a0908',
    border:`1px solid ${connected ? color+'30' : '#1e1a12'}`,
  }),
  btn: (variant='primary', disabled=false) => ({
    padding:'14px 24px', borderRadius:'12px', cursor:disabled?'not-allowed':'pointer',
    fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'14px',
    letterSpacing:'1px', border:'none', width:'100%', marginBottom:'10px',
    background: disabled ? '#1a1810' :
      variant==='primary' ? 'linear-gradient(135deg,#c0932a,#a07820)' : 'transparent',
    color: disabled ? '#3a3020' : variant==='ghost' ? '#c0932a' : '#0c0c0e',
    border: variant==='ghost' ? '1px solid #2a2418' : 'none',
    opacity: disabled ? 0.6 : 1,
  }),
  modeTag: (mode) => ({
    display:'inline-flex', alignItems:'center', gap:'6px',
    padding:'6px 16px', borderRadius:'20px',
    fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:600,
    background: mode==='coop' ? '#0d1a0d' : '#1a0d0d',
    border:`1px solid ${mode==='coop' ? '#2a5a2a' : '#5a2a2a'}`,
    color: mode==='coop' ? '#4caf50' : '#e05050',
  }),
  urlBox: {
    fontSize:'11px', color:'#5a4a2a', background:'#0d0b07',
    borderRadius:'8px', padding:'8px 12px', wordBreak:'break-all',
    marginBottom:'10px', lineHeight:1.5,
  },
};

function getJoinUrl(gameId) {
  return window.location.origin + window.location.pathname + '?join=' + gameId;
}

// ── Čekárna pro HRACÍ DESKU (PC/Tablet) ─────────────────────────────────────
function BoardWaiting({ session, game, onGameStart }) {
  const { gameId } = session;
  const players   = Object.values(game.players || {}).filter(p => !p.isBoard);
  const joinUrl   = getJoinUrl(gameId);
  const allReady  = players.length >= 1 && players.every(p => p.ready);

  const handleStart = async () => {
    await addLog(gameId, '⚔️ Dobrodružství začíná!', 'turn');
    await startGame(gameId, game.mode || 'coop');
  };

  return (
    <div style={S.bg}>
      <div style={{ fontSize:'36px', marginTop:'30px' }}>🗺️</div>
      <div style={S.title}>Čekárna</div>
      <div style={S.sub}>Hrací deska · {gameId}</div>

      {/* QR kód — hlavní prvek */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Hráči se připojí přes QR kód</div>
        <div style={S.codeDisplay}>{gameId}</div>
        <div style={S.qrWrap}>
          <QRCodeSVG value={joinUrl} size={200} level="M" fgColor="#0c0c0e" bgColor="#ffffff" />
        </div>
        <div style={S.urlBox}>📱 {joinUrl}</div>
        <div style={{ textAlign:'center' }}>
          <span style={S.modeTag(game.mode||'coop')}>
            {game.mode==='pvp' ? '⚔️ PvP — všichni proti všem' : '🤝 Coop — společný cíl'}
          </span>
        </div>
      </div>

      {/* Připojení hráči */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Připojení hráči ({players.length})</div>
        {players.length === 0 && (
          <div style={{ textAlign:'center', color:'#5a4a2a', fontSize:'13px', padding:'20px 0', fontStyle:'italic' }}>
            Čeká se na hráče... Naskenujte QR kód.
          </div>
        )}
        {players.map(p => (
          <div key={p.id} style={S.playerRow(p.connected, p.character?.color)}>
            <span style={{ fontSize:'22px' }}>{p.character?.emoji || '❓'}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px',
                            color:p.character?.color||'#c0932a', fontWeight:700 }}>
                {p.name}
              </div>
              <div style={{ fontSize:'11px', color:'#5a4a2a' }}>
                {p.character?.name} · {p.character?.faction}
              </div>
            </div>
            <div style={{ fontSize:'12px', fontFamily:"'Cinzel',serif",
                          color: p.ready ? '#4caf50' : '#7a6a4a' }}>
              {p.ready ? '✅ Připraven' : '⏳ Čeká'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ width:'100%', maxWidth:'500px' }}>
        <button style={S.btn('primary', !allReady)} onClick={allReady ? handleStart : undefined}>
          {allReady ? '⚔️ Spustit hru!' : `Čeká se na hráče (${players.filter(p=>p.ready).length}/${players.length})`}
        </button>
        {!allReady && players.length > 0 && (
          <div style={{ textAlign:'center', fontSize:'12px', color:'#5a4a2a', marginTop:'4px' }}>
            Všichni hráči musí potvrdit připravenost na telefonu.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Čekárna pro TELEFON ───────────────────────────────────────────────────────
function PhoneWaiting({ session, game, onGameStart }) {
  const { gameId, playerId } = session;
  const myPlayer = game.players?.[playerId];
  const players  = Object.values(game.players || {}).filter(p => !p.isBoard);

  const handleReady = () => setPlayerReady(gameId, playerId, !myPlayer?.ready);

  return (
    <div style={S.bg}>
      <div style={{ fontSize:'36px', marginTop:'30px' }}>{myPlayer?.character?.emoji || '⚔️'}</div>
      <div style={S.title}>{myPlayer?.name || 'Hráč'}</div>
      <div style={S.sub}>{myPlayer?.character?.name} · Čekárna</div>

      <div style={S.card}>
        <div style={S.sectionTitle}>Čekáme na ostatní hráče</div>
        {players.map(p => (
          <div key={p.id} style={S.playerRow(p.connected, p.character?.color)}>
            <span style={{ fontSize:'20px' }}>{p.character?.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px',
                            color:p.character?.color||'#c0932a', fontWeight:700 }}>
                {p.name} {p.id === playerId && <span style={{ color:'#5a4a2a', fontSize:'11px' }}>(ty)</span>}
              </div>
              <div style={{ fontSize:'11px', color:'#5a4a2a' }}>{p.character?.name}</div>
            </div>
            <div style={{ fontSize:'12px', color: p.ready ? '#4caf50' : '#7a6a4a' }}>
              {p.ready ? '✅' : '⏳'}
            </div>
          </div>
        ))}
        <div style={{ textAlign:'center', marginTop:'12px' }}>
          <span style={S.modeTag(game.mode||'coop')}>
            {game.mode==='pvp' ? '⚔️ PvP' : '🤝 Coop'}
          </span>
        </div>
      </div>

      <div style={{ width:'100%', maxWidth:'500px' }}>
        <button style={S.btn(myPlayer?.ready ? 'ghost' : 'primary')} onClick={handleReady}>
          {myPlayer?.ready ? '⏳ Zrušit připravenost' : '✅ Jsem připraven!'}
        </button>
      </div>

      <div style={{ color:'#3a3020', fontSize:'12px', marginTop:'8px', textAlign:'center' }}>
        Hostitel spustí hru až budou všichni připraveni.
      </div>
    </div>
  );
}

// ── HLAVNÍ KOMPONENTA ─────────────────────────────────────────────────────────
export default function WaitingRoom({ session, onGameStart }) {
  const { gameId } = session;
  const [game, setGame] = useState(null);

  useEffect(() => {
    const unsub = listenGame(gameId, setGame);
    return unsub;
  }, [gameId]);

  useEffect(() => {
    if (game?.status === 'playing') onGameStart(game);
  }, [game?.status]);

  if (!game) return (
    <div style={{ ...S.bg, justifyContent:'center', alignItems:'center' }}>
      <div style={{ color:'#7a6a4a', fontFamily:"'Cinzel',serif" }}>Načítám...</div>
    </div>
  );

  return session.isBoard
    ? <BoardWaiting session={session} game={game} onGameStart={onGameStart} />
    : <PhoneWaiting session={session} game={game} onGameStart={onGameStart} />;
}
