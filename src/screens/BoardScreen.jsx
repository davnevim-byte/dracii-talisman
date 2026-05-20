// src/screens/BoardScreen.jsx
import { useState, useEffect, useRef } from 'react';
import {
  listenGame, updatePlayerStats, updatePlayerPosition,
  addItemToInventory, addLog, setPhase, nextTurn
} from '../game/gameState';
import { drawCard } from '../game/worldData';
import {
  advanceWorldState, checkGlobalEvents, tickGlobalEvent,
  getEffectiveMove, getEnemyStrBonus, applyWeatherDamage, applyFactionPassives
} from '../game/worldManager';
import { ZONES, ZONE_LOCATIONS, WEATHER, getTimeOfDay } from '../data/mapData';
import { getRandomEnemy } from '../data/bestiary';
import { useNarrator } from '../game/useNarrator';
import GameMap                from '../components/GameMap';
import LocationPanel          from '../components/LocationPanel';
import CombatScreen           from '../components/CombatScreen';
import NarratorBox            from '../components/NarratorBox';
import PlayerInteractionPanel from '../components/PlayerInteractionPanel';
import GameChat               from '../components/GameChat';
import { checkVictoryConditions } from '../game/multiplayerEngine';
import { play } from '../game/soundEngine';

const S = {
  bg: { minHeight:'100vh', background:'#0c0c0e', fontFamily:"'Crimson Text',Georgia,serif", display:'flex', flexDirection:'column' },
  topBar: { background:'linear-gradient(135deg,#16140e,#1a1810)', borderBottom:'1px solid #2a2418', padding:'10px 18px', display:'flex', alignItems:'center', gap:'10px', fontFamily:"'Cinzel',serif", flexWrap:'wrap', position:'sticky', top:0, zIndex:20 },
  main: { display:'flex', flex:1, overflow:'hidden', minHeight:0 },
  mapArea: { flex:1, padding:'16px', overflowY:'auto' },
  sidePanel: { width:'280px', borderLeft:'1px solid #1e1a12', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 },
  playerChip: (color, active) => ({ background:active?`${color}20`:`${color}08`, border:`1px solid ${active?color:color+'30'}`, borderRadius:'10px', padding:'9px 11px', marginBottom:'7px', boxShadow:active?`0 0 14px ${color}30`:'none', transition:'all 0.3s' }),
  logEntry: (type) => ({ fontSize:'12px', padding:'4px 0', borderBottom:'1px solid #0f0f0f', color:{ ok:'#4caf50', bad:'#e05050', dice:'#f0c040', turn:'#5b8dd9', ev:'#c0932a', info:'#9a8a6a', narrator:'#c0932a60' }[type]||'#9a8a6a', lineHeight:1.4, fontStyle: type === 'narrator' ? 'italic' : 'normal' }),
  phaseBox: { background:'#16140e', border:'1px solid #2a2418', borderRadius:'14px', padding:'16px', marginBottom:'14px' },
  phaseTitle: { fontFamily:"'Cinzel',serif", fontSize:'12px', color:'#7a6a4a', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px', borderBottom:'1px solid #1e1a12', paddingBottom:'6px' },
  btn: (color='#c0932a', disabled=false) => ({ padding:'11px 18px', borderRadius:'10px', fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'13px', letterSpacing:'1px', border:'none', cursor:disabled?'not-allowed':'pointer', background:disabled?'#1a1810':`linear-gradient(135deg,${color},${color}bb)`, color:disabled?'#3a3020':'#0c0c0e', opacity:disabled?0.6:1, marginRight:'8px', marginBottom:'8px' }),
  diceResult: { display:'inline-block', background:'#c0932a', color:'#000', borderRadius:'8px', padding:'5px 16px', fontWeight:700, fontSize:'20px', fontFamily:"'Cinzel',serif", margin:'6px 0' },
  globalBanner: { background:'linear-gradient(135deg,#1a1208,#251a08)', border:'1px solid #c0932a60', borderRadius:'12px', padding:'12px 16px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' },
  tabRow: { display:'flex', background:'#0d0b07', borderRadius:'8px', border:'1px solid #2a2418', overflow:'hidden' },
  tabBtn: (active) => ({ padding:'5px 12px', border:'none', cursor:'pointer', fontSize:'11px', fontFamily:"'Cinzel',serif", background:active?'#c0932a':'transparent', color:active?'#000':'#7a6a4a' }),
  enemyCard: { background:'#1a0d0d', border:'1px solid #5a1a1a', borderRadius:'12px', padding:'14px', marginBottom:'14px' },
  enemyAbility: { background:'#0d0808', border:'1px solid #2a1010', borderRadius:'8px', padding:'8px 10px', fontSize:'12px', color:'#9a6a6a', marginBottom:'6px' },
};

function die6() { return Math.floor(Math.random() * 6) + 1; }

function PlayerChip({ player, active }) {
  const color   = player.character?.color || '#c0932a';
  const lifePct = Math.max(0, (player.stats.life / player.stats.maxLife) * 100);
  return (
    <div style={S.playerChip(color, active)}>
      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
        <span style={{ fontSize:'20px' }}>{player.character?.emoji||'❓'}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', color, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {player.name}{active && <span style={{ color:'#4caf50', fontSize:'10px' }}> ⚡</span>}
          </div>
          <div style={{ fontSize:'10px', color:'#5a4a2a' }}>
            ❤️{player.stats.life}/{player.stats.maxLife} · ⚔️{player.stats.str} · 🪙{player.stats.gold} · Z{player.zone||1}
            {player.pet && <span style={{ color:'#4caf50' }}> · {player.pet.emoji}</span>}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:'10px', color:'#7a6a4a' }}>Lv.{player.stats.level||1}</div>
          <div style={{ fontSize:'10px', color:'#7a6a4a' }}>🏆{player.stats.trophies||0}</div>
        </div>
      </div>
      <div style={{ height:'3px', background:'#1e1a12', borderRadius:'2px', marginTop:'5px' }}>
        <div style={{ height:'100%', borderRadius:'2px', width:`${lifePct}%`, background:lifePct>50?'#4caf50':lifePct>25?'#f0c040':'#e05050', transition:'width 0.3s' }} />
      </div>
    </div>
  );
}

export default function BoardScreen({ session }) {
  const { gameId, playerId } = session;
  const [game,       setGame]       = useState(null);
  const [activeEnemy,setActiveEnemy]= useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [mapView,    setMapView]    = useState('map');
  const [sideTab,    setSideTab]    = useState('log'); // log|chat
  const logEndRef = useRef(null);

  // AI Vypravěč
  const narrator = useNarrator(gameId);

  useEffect(() => { return listenGame(gameId, setGame); }, [gameId]);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [game?.log]);

  if (!game) return (
    <div style={{ ...S.bg, justifyContent:'center', alignItems:'center' }}>
      <div style={{ color:'#7a6a4a', fontFamily:"'Cinzel',serif" }}>Načítám desku...</div>
    </div>
  );

  const players       = Object.values(game.players || {});
  const currentPlayer = game.players?.[game.currentPlayerId];
  const log           = game.log || [];
  const weather       = WEATHER[game.weather || 'sunny'];
  const timeObj       = getTimeOfDay(game.hourOfDay || 8);
  const globalEvent   = game.activeGlobalEvent;
  const currentZone   = ZONES[currentPlayer?.zone || 1];

  // ── Hod kostkou ──────────────────────────────────────────────────────────
  const handleRoll = async () => {
    play('dice');
    const roll     = die6();
    const zone     = currentPlayer.zone || 1;
    const zoneLocs = ZONE_LOCATIONS[zone] || ZONE_LOCATIONS[1];
    const newPos   = (currentPlayer.position + roll) % zoneLocs.length;
    const newLoc   = zoneLocs[newPos];

    setDiceResult(roll);
    setCurrentLoc({ ...newLoc, zoneId: zone, locIdx: newPos });
    setActiveEnemy(null);

    await addLog(gameId, `${currentPlayer.name} hodil ${roll} 🎲 → ${newLoc.emoji} ${newLoc.name}`, 'dice');
    await updatePlayerPosition(gameId, game.currentPlayerId, newPos, zone);
    await applyFactionPassives(gameId, players);
    await setPhase(gameId, 'draw');

    // AI narace příchodu
    if (['inn','temple','smithy','shop'].includes(newLoc.type)) {
      play('safe');
      narrator.onSafeLocation(newLoc, currentPlayer);
    } else {
      narrator.onLocation(newLoc, currentZone || { name:`Zóna ${zone}` }, game.weather, game.timeOfDay, currentPlayer);
    }
  };

  // ── Táhnutí karty ────────────────────────────────────────────────────────
  const handleDraw = async () => {
    play('cardDraw');
    if (currentLoc && ['safe','inn','temple','smithy','shop'].includes(currentLoc.type)) {
      await addLog(gameId, `${currentPlayer.name} využívá ${currentLoc.emoji} ${currentLoc.name}.`, 'ev');
      await setPhase(gameId, 'done');
      return;
    }

    const zone     = currentPlayer.zone || 1;
    const card     = drawCard(zone);
    const enemyMod = getEnemyStrBonus(game.timeOfDay, game.weather, zone);

    if (card.type === 'enemy') {
      const base  = getRandomEnemy(zone);
      const enemy = { ...base, str: (base.str || 2) + enemyMod, life: base.life || 3, gold: base.gold ?? 0, xp: base.xp ?? 1 };
      setActiveEnemy(enemy);
      await addLog(gameId, `${currentPlayer.name} narazil na ${enemy.emoji} ${enemy.name}! (Síla ${enemy.str})`, 'bad');
      await setPhase(gameId, 'combat');
      // AI narace setkání
      narrator.onEnemy(enemy, currentZone?.name || `Zóna ${zone}`, game.timeOfDay, currentPlayer);

    } else if (card.type === 'item') {
      await addLog(gameId, `${currentPlayer.name} nalezl: ${card.data.emoji} ${card.data.name}`, 'ok');
      await addItemToInventory(gameId, game.currentPlayerId, card.data);
      await setPhase(gameId, 'done');
      narrator.setNarration(`✨ ${currentPlayer.name} našel ${card.data.name}. ${card.data.desc}`);

    } else {
      const ev = card.data;
      await addLog(gameId, `${ev.emoji} ${ev.name}: ${ev.desc}`, 'ev');
      const s = currentPlayer.stats;
      const upd = {};
      if (ev.fx === 'gold')  upd.gold       = Math.max(0, s.gold + ev.val);
      if (ev.fx === 'heal')  upd.life       = Math.min(s.maxLife, s.life + ev.val);
      if (ev.fx === 'dmg')   upd.life       = Math.max(0, s.life - ev.val);
      if (ev.fx === 'fate')  upd.fate       = Math.max(0, s.fate + ev.val);
      if (ev.fx === 'str')   upd.str        = s.str + ev.val;
      if (ev.fx === 'skill') upd.skill      = s.skill + ev.val;
      if (ev.fx === 'rep')   upd.reputation = Math.min(10, Math.max(-10, (s.reputation||0) + ev.val));
      if (Object.keys(upd).length > 0) {
        await updatePlayerStats(gameId, game.currentPlayerId, upd);
      }
      await setPhase(gameId, 'done');
      // AI narace události
      narrator.onCardEvent(ev, currentPlayer);
    }
  };

  // ── Konec souboje ─────────────────────────────────────────────────────────
  const handleCombatEnd = () => setActiveEnemy(null);

  // ── Konec tahu ────────────────────────────────────────────────────────────
  const handleNextTurn = async () => {
    const { newWeather } = await advanceWorldState(gameId, game);

    const events = await checkGlobalEvents(gameId, game.turn + 1, players);
    await tickGlobalEvent(gameId, game);
    await applyWeatherDamage(gameId, players, game.weather);

    // Narace globální události (pokud nastala)
    if (game.activeGlobalEvent) {
      narrator.onGlobalEvent(game.activeGlobalEvent);
    }

    // Občasný klidný komentář (každých 5 tahů)
    if (game.turn % 5 === 0 && !game.activeGlobalEvent && currentLoc) {
      narrator.onQuietMoment(currentPlayer, currentLoc.name, game.timeOfDay, game.weather);
    }

    setDiceResult(null); setCurrentLoc(null); setActiveEnemy(null);
    await nextTurn(gameId);
    await addLog(gameId, `─── Tah ${game.turn + 1} ───`, 'turn');

    // Zkontroluj výherní podmínky
    await checkVictoryConditions(gameId, game);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.bg}>

      {/* Top bar */}
      <div style={S.topBar}>
        <span style={{ color:'#c0932a', fontWeight:900, fontSize:'15px' }}>⚔️ Dračí Talisman</span>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', alignItems:'center', gap:'5px', background:`${weather.color}15`, border:`1px solid ${weather.color}40`, borderRadius:'20px', padding:'3px 10px', fontSize:'12px', color:weather.color }}>
          {weather.emoji} {weather.name}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', background:`${timeObj.color}15`, border:`1px solid ${timeObj.color}40`, borderRadius:'20px', padding:'3px 10px', fontSize:'12px', color:timeObj.color }}>
          {timeObj.emoji} {timeObj.name} {game.hourOfDay||8}:00
        </div>
        <span style={{ fontSize:'12px', color:'#7a6a4a' }}>Tah {game.turn}</span>
        <span style={{ background:game.mode==='pvp'?'#3a0d0d':'#0d1a0d', border:`1px solid ${game.mode==='pvp'?'#5a2a2a':'#2a5a2a'}`, color:game.mode==='pvp'?'#e05050':'#4caf50', borderRadius:'6px', padding:'3px 9px', fontSize:'12px' }}>
          {game.mode==='pvp'?'⚔️ PvP':'🤝 Coop'}
        </span>
        <div style={S.tabRow}>
          {['map','phase'].map(v => (
            <button key={v} style={S.tabBtn(mapView===v)} onClick={() => setMapView(v)}>
              {v==='map'?'🗺️ Mapa':'⚡ Tah'}
            </button>
          ))}
        </div>
      </div>

      <div style={S.main}>

        {/* ── Hlavní oblast ── */}
        <div style={S.mapArea}>

          {/* Globální událost */}
          {globalEvent && (
            <div style={S.globalBanner}>
              <span style={{ fontSize:'22px' }}>{globalEvent.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', color:'#c0932a', fontWeight:700 }}>🌍 {globalEvent.name}</div>
                <div style={{ fontSize:'12px', color:'#9a8a6a' }}>{globalEvent.desc}{globalEvent.turnsLeft>0&&` · ${globalEvent.turnsLeft} tahů`}</div>
              </div>
            </div>
          )}

          {/* MAPA */}
          {mapView === 'map' && (
            <>
              {/* Vypravěč nad mapou */}
              <NarratorBox text={narrator.text} loading={narrator.loading} history={narrator.history} />
              <GameMap game={game} />
            </>
          )}

          {/* TAH */}
          {mapView === 'phase' && (
            <>
              {/* Vypravěč */}
              <NarratorBox text={narrator.text} loading={narrator.loading} history={narrator.history} showHistory />

              {/* Hráčské interakce */}
              <PlayerInteractionPanel
                currentPlayer={currentPlayer}
                otherPlayers={players.filter(p => p.id !== game.currentPlayerId)}
                game={game}
                session={session}
                isMyTurn={true}
              />
                <LocationPanel locId={currentLoc.id} zoneId={currentLoc.zoneId}
                  player={currentPlayer} session={session} isMyTurn={true} onDone={()=>{}} />
              )}

              {/* Souboj */}
              {game.phase === 'combat' && activeEnemy && (
                <>
                  <div style={S.enemyCard}>
                    <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'10px' }}>
                      <span style={{ fontSize:'36px' }}>{activeEnemy.emoji}</span>
                      <div>
                        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', color:'#e05050', fontWeight:700 }}>{activeEnemy.name}</div>
                        <div style={{ fontSize:'12px', color:'#7a6a4a', marginTop:'2px' }}>{activeEnemy.desc}</div>
                        <div style={{ display:'flex', gap:'10px', marginTop:'6px', fontSize:'12px' }}>
                          <span style={{ color:'#c0932a' }}>⚔️ {activeEnemy.str}</span>
                          <span style={{ color:'#e05050' }}>❤️ {activeEnemy.life}</span>
                          <span style={{ color:'#f0c040' }}>🪙 {activeEnemy.gold}</span>
                          <span style={{ color:'#4caf50' }}>⭐ {activeEnemy.xp} XP</span>
                        </div>
                      </div>
                    </div>
                    {(activeEnemy.abilities||[]).map(a => (
                      <div key={a.id} style={S.enemyAbility}>
                        <strong style={{ color:'#c06060' }}>{a.name}</strong> — {a.desc}
                      </div>
                    ))}
                    {activeEnemy.tameble && (
                      <div style={{ fontSize:'11px', color:'#4caf50', marginTop:'6px' }}>
                        🐾 Ochočitelný — oslab na {'<'}25% ŽP{activeEnemy.tameRep !== 'any' && ` · Reputace: ${activeEnemy.tameRep}`}
                      </div>
                    )}
                  </div>
                  <CombatScreen
                    game={game} session={session}
                    player={currentPlayer} enemy={activeEnemy}
                    onCombatEnd={handleCombatEnd}
                    onWin={(xp, gold) => narrator.onWin(currentPlayer, activeEnemy, xp, gold)}
                    onLoss={()  => narrator.onLoss(currentPlayer, activeEnemy)}
                    onTame={(pet, ok) => narrator.onTame(currentPlayer, pet, ok)}
                  />
                </>
              )}

              {/* Fáze tahu */}
              {game.phase !== 'combat' && (
                <div style={S.phaseBox}>
                  <div style={S.phaseTitle}>
                    Na tahu: {currentPlayer?.name}
                    <span style={{ color:'#3a3020', fontWeight:'normal' }}> · {game.phase}</span>
                  </div>

                  {game.phase === 'roll' && (
                    <div>
                      <p style={{ fontSize:'13px', color:'#9a8a6a', marginBottom:'12px' }}>
                        Pohyb: {currentPlayer?.stats.move||1}
                        {weather.effects?.move !== 0 && ` ${weather.effects.move>0?'+':''}${weather.effects.move} (${weather.emoji})`}
                      </p>
                      <button style={S.btn()} onClick={handleRoll}>🎲 Hodit kostkou</button>
                      {diceResult && <span style={S.diceResult}>{diceResult}</span>}
                    </div>
                  )}

                  {game.phase === 'draw' && (
                    <div>
                      <p style={{ fontSize:'13px', color:'#9a8a6a', marginBottom:'12px' }}>
                        {currentLoc && ['inn','temple','smithy','shop','safe'].includes(currentLoc.type)
                          ? 'Bezpečné místo — využij akce nebo pokračuj.'
                          : 'Táhni kartu setkání.'}
                      </p>
                      <button style={S.btn('#5b8dd9')} onClick={handleDraw}>🃏 Táhnout kartu</button>
                    </div>
                  )}

                  {game.phase === 'done' && (
                    <div>
                      <p style={{ fontSize:'13px', color:'#9a8a6a', marginBottom:'12px' }}>Tah dokončen.</p>
                      <button style={S.btn('#4caf50')} onClick={handleNextTurn}>✅ Další tah →</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Postranní panel ── */}
        <div style={S.sidePanel}>
          <div style={{ padding:'12px', borderBottom:'1px solid #1e1a12', overflowY:'auto', maxHeight:'45%' }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', color:'#5a4a2a', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>
              Hráči ({players.length})
            </div>
            {players.map(p => (
              <PlayerChip key={p.id} player={p} active={p.id === game.currentPlayerId} />
            ))}
          </div>
          {/* Log + Chat tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #0f0f0f', background:'#0d0b07' }}>
            {['log','chat'].map(t => (
              <div key={t} style={{ flex:1, padding:'8px', textAlign:'center', cursor:'pointer',
                                     fontFamily:"'Cinzel',serif", fontSize:'10px', letterSpacing:'2px',
                                     textTransform:'uppercase',
                                     color:sideTab===t?'#c0932a':'#5a4a2a',
                                     borderBottom:`2px solid ${sideTab===t?'#c0932a':'transparent'}` }}
                   onClick={() => setSideTab(t)}>
                {t === 'log' ? '📜 Deník' : '💬 Chat'}
              </div>
            ))}
          </div>
          {sideTab === 'log' && (
            <div style={{ flex:1, overflowY:'auto', padding:'8px 12px' }}>
              {log.map((e, i) => <div key={i} style={S.logEntry(e.type)}>{e.msg}</div>)}
              <div ref={logEndRef} />
              {log.length === 0 && <div style={{ color:'#3a3020', fontSize:'12px', fontStyle:'italic' }}>Zatím žádné záznamy...</div>}
            </div>
          )}
          {sideTab === 'chat' && (
            <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <GameChat gameId={gameId} currentPlayer={currentPlayer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
