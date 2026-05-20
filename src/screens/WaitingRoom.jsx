// src/screens/WaitingRoom.jsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { listenGame, setPlayerReady, startGame, addLog } from '../game/gameState';

const S = {
  bg: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 0%, #1a1208 0%, #0c0c0e 70%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px', fontFamily: "'Crimson Text', Georgia, serif",
  },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px,4vw,32px)',
    fontWeight: 900, color: '#c0932a', letterSpacing: '3px',
    textAlign: 'center', marginBottom: '4px', marginTop: '20px',
  },
  subtitle: {
    color: '#7a6a4a', fontSize: '13px', letterSpacing: '4px',
    textTransform: 'uppercase', textAlign: 'center', marginBottom: '24px',
  },
  card: {
    background: 'linear-gradient(135deg, #16140e 0%, #1a1810 100%)',
    border: '1px solid #2a2418', borderRadius: '16px',
    padding: '24px', width: '100%', maxWidth: '520px', marginBottom: '16px',
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '12px', letterSpacing: '3px',
    color: '#7a6a4a', textTransform: 'uppercase', marginBottom: '14px',
    borderBottom: '1px solid #1e1a12', paddingBottom: '8px',
  },
  playerRow: (connected) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '10px', marginBottom: '8px',
    background: connected ? '#0d1a0d' : '#0d0b07',
    border: `1px solid ${connected ? '#1e3a1e' : '#1e1a12'}`,
  }),
  btn: (variant = 'primary') => ({
    padding: '13px 24px', borderRadius: '10px', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '14px',
    letterSpacing: '1px', border: 'none', width: '100%', marginBottom: '10px',
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #c0932a, #a07820)'
      : 'transparent',
    color: variant === 'primary' ? '#0c0c0e' : '#c0932a',
    border: variant !== 'primary' ? '1px solid #2a2418' : 'none',
    opacity: variant === 'disabled' ? 0.5 : 1,
  }),
  codeBig: {
    fontFamily: "'Cinzel', serif", fontSize: '36px', fontWeight: 900,
    color: '#c0932a', letterSpacing: '10px', textAlign: 'center',
    padding: '16px', background: '#0d0b07', borderRadius: '10px',
    border: '1px solid #2a2418', marginBottom: '12px',
  },
  qrWrap: {
    display: 'flex', justifyContent: 'center', padding: '16px',
    background: '#fff', borderRadius: '12px', marginBottom: '12px',
  },
  modeTag: (mode) => ({
    display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
    fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 600,
    background: mode === 'coop' ? '#0d1a0d' : '#1a0d0d',
    border: `1px solid ${mode === 'coop' ? '#2a5a2a' : '#5a2a2a'}`,
    color: mode === 'coop' ? '#4caf50' : '#e05050',
    marginBottom: '16px',
  }),
};

function getJoinUrl(gameId) {
  const base = window.location.origin + window.location.pathname;
  return `${base}?join=${gameId}`;
}

export default function WaitingRoom({ session, onGameStart }) {
  const { gameId, playerId, isHost } = session;
  const [game, setGame] = useState(null);

  useEffect(() => {
    const unsub = listenGame(gameId, setGame);
    return unsub;
  }, [gameId]);

  useEffect(() => {
    if (game?.status === 'playing') {
      onGameStart(game);
    }
  }, [game?.status]);

  if (!game) return (
    <div style={S.bg}>
      <div style={S.title}>Načítám...</div>
    </div>
  );

  const players    = Object.values(game.players || {});
  const allReady   = players.length >= 2 && players.every(p => p.ready || p.id === playerId && isHost);
  const myPlayer   = game.players?.[playerId];
  const joinUrl    = getJoinUrl(gameId);

  const handleReady = () => setPlayerReady(gameId, playerId, !myPlayer?.ready);

  const handleStart = async () => {
    await addLog(gameId, '⚔️ Dobrodružství začíná!', 'turn');
    await startGame(gameId, game.mode || 'coop');
  };

  return (
    <div style={S.bg}>
      <div style={S.title}>Čekárna</div>
      <div style={S.subtitle}>Hra #{gameId}</div>

      {/* Kód hry + QR */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Kód hry — sdílej s ostatními</div>
        <div style={S.codeBig}>{gameId}</div>

        <div style={S.qrWrap}>
          <QRCodeSVG value={joinUrl} size={160} level="M"
            fgColor="#0c0c0e" bgColor="#ffffff" />
        </div>

        <div style={{ fontSize: '12px', color: '#5a4a2a', textAlign: 'center' }}>
          Ostatní hráči naskenují QR nebo zadají kód ručně
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <span style={S.modeTag(game.mode || 'coop')}>
            {game.mode === 'pvp' ? '⚔️ PvP — všichni proti všem' : '🤝 Coop — společný cíl'}
          </span>
        </div>
      </div>

      {/* Seznam hráčů */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Hráči ({players.length}/6)</div>
        {players.map(p => (
          <div key={p.id} style={S.playerRow(p.connected)}>
            <span style={{ fontSize: '24px' }}>{p.character?.emoji || '❓'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '13px',
                            color: '#c0932a', fontWeight: 700 }}>
                {p.name}
                {p.id === playerId && <span style={{ color: '#5a4a2a', fontSize: '11px' }}> (ty)</span>}
                {p.isHost && <span style={{ color: '#7a6a4a', fontSize: '11px' }}> 👑</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#5a4a2a' }}>
                {p.character?.name} · {p.character?.faction}
              </div>
            </div>
            <div style={{ fontSize: '12px', fontFamily: "'Cinzel',serif",
                          color: p.ready ? '#4caf50' : '#7a6a4a' }}>
              {p.ready ? '✅ Připraven' : '⏳ Čeká'}
            </div>
          </div>
        ))}

        {players.length < 2 && (
          <div style={{ textAlign: 'center', color: '#5a4a2a', fontSize: '13px',
                        padding: '12px', fontStyle: 'italic' }}>
            Čeká se na dalšího hráče...
          </div>
        )}
      </div>

      {/* Tlačítka */}
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {!isHost && (
          <button style={S.btn(myPlayer?.ready ? 'ghost' : 'primary')}
                  onClick={handleReady}>
            {myPlayer?.ready ? '⏳ Zrušit připravenost' : '✅ Jsem připraven!'}
          </button>
        )}

        {isHost && (
          <button
            style={{ ...S.btn(allReady ? 'primary' : 'ghost'),
                     opacity: allReady ? 1 : 0.5,
                     cursor: allReady ? 'pointer' : 'not-allowed' }}
            onClick={allReady ? handleStart : undefined}
          >
            {allReady
              ? '⚔️ Spustit hru!'
              : `Čeká se na hráče (${players.filter(p => p.ready).length}/${players.length - 1})`}
          </button>
        )}
      </div>

      <div style={{ color: '#3a3020', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
        {isHost ? 'Jako hostitel spustíš hru až budou všichni připraveni.' : 'Hostitel spustí hru.'}
      </div>
    </div>
  );
}
