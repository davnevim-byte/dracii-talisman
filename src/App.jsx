// src/App.jsx
import { useState, useEffect } from 'react';
import LobbyScreen  from './screens/LobbyScreen';
import WaitingRoom  from './screens/WaitingRoom';
import BoardScreen  from './screens/BoardScreen';
import PhoneCard    from './screens/PhoneCard';
import EndScreen    from './screens/EndScreen';
import { setConnected, listenGame } from './game/gameState';

function isTabletOrPC() {
  return window.innerWidth >= 768;
}

function getJoinCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('join') || null;
}

export default function App() {
  const [session,  setSession]  = useState(null);
  const [screen,   setScreen]   = useState('lobby');  // lobby|waiting|game|end
  const [gameData, setGameData] = useState(null);
  const [endData,  setEndData]  = useState(null);
  const isBoard = isTabletOrPC();

  // Auto-join z QR kódu
  useEffect(() => {
    const joinCode = getJoinCodeFromUrl();
    if (joinCode) window._autoJoinCode = joinCode;
  }, []);

  // Sledování stavu hry pro detekci konce
  useEffect(() => {
    if (!session || screen !== 'game') return;
    const unsub = listenGame(session.gameId, (game) => {
      if (!game) return;
      if (game.status === 'finished') {
        const players = Object.values(game.players || {});
        setEndData({
          outcome: game.outcome || 'defeat',
          players,
          turns:   game.turn   || 0,
          mode:    game.mode   || 'coop',
        });
        setScreen('end');
      }
    });
    return unsub;
  }, [session, screen]);

  // Odpojení při zavření
  useEffect(() => {
    if (!session) return;
    const handleUnload = () => setConnected(session.gameId, session.playerId, false);
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [session]);

  const handleGameJoined = (sess) => {
    setSession(sess);
    setScreen('waiting');
  };

  const handleGameStart = (game) => {
    setGameData(game);
    setScreen('game');
  };

  const handlePlayAgain = () => {
    setSession(null);
    setGameData(null);
    setEndData(null);
    setScreen('lobby');
  };

  // ── Routing ──────────────────────────────────────────────────────────────

  if (screen === 'lobby') return (
    <LobbyScreen onGameJoined={handleGameJoined} isBoard={isBoard} />
  );

  if (screen === 'waiting' && session) return (
    <WaitingRoom session={session} onGameStart={handleGameStart} />
  );

  if (screen === 'end' && endData) return (
    <EndScreen
      outcome={endData.outcome}
      players={endData.players}
      turns={endData.turns}
      mode={endData.mode}
      onPlayAgain={handlePlayAgain}
    />
  );

  if (screen === 'game' && session) {
    return isBoard
      ? <BoardScreen session={session} />
      : <PhoneCard   session={session} />;
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', justifyContent:'center',
                   alignItems:'center', background:'#0c0c0e',
                   color:'#c0932a', fontFamily:"'Cinzel',serif", fontSize:'18px' }}>
      Načítám...
    </div>
  );
}
