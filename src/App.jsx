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
  const [screen,   setScreen]   = useState('lobby');
  const [gameData, setGameData] = useState(null);
  const [endData,  setEndData]  = useState(null);

  // Zjisti typ zařízení — ale nech session přepsat isBoard
  const deviceIsBoard = window.innerWidth >= 768;

  // Auto-join z QR kódu — přesměruj na telefon view
  useEffect(() => {
    const joinCode = getJoinCodeFromUrl();
    if (joinCode) {
      window._autoJoinCode = joinCode;
    }
  }, []);

  // Sledování konce hry
  useEffect(() => {
    if (!session || screen !== 'game') return;
    const unsub = listenGame(session.gameId, (game) => {
      if (!game) return;
      if (game.status === 'finished') {
        const players = Object.values(game.players || {}).filter(p => p.character);
        setEndData({
          outcome: game.outcome || 'defeat',
          players,
          turns:   game.turn || 0,
          mode:    game.mode || 'coop',
        });
        setScreen('end');
      }
    });
    return unsub;
  }, [session, screen]);

  // Odpojení při zavření
  useEffect(() => {
    if (!session) return;
    const handleUnload = () => {
      if (!session.isBoard) {
        setConnected(session.gameId, session.playerId, false);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [session]);

  const handleGameJoined = (sess) => {
    // sess.isBoard přichází z LobbyScreen
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

  // Lobby — isBoard podle zařízení NEBO pokud je v URL ?join= tak vždy telefon
  if (screen === 'lobby') {
    const joinCode  = getJoinCodeFromUrl();
    const showBoard = !joinCode && deviceIsBoard;
    return (
      <LobbyScreen
        onGameJoined={handleGameJoined}
        isBoard={showBoard}
        autoJoinCode={joinCode}
      />
    );
  }

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
    // isBoard z session — ne ze zařízení
    // (umožní testování na PC jako hráč přes ?join=)
    const showBoard = session.isBoard;
    return showBoard
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
