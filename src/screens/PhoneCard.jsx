// src/screens/PhoneCard.jsx
import { useState, useEffect, useRef } from 'react';
import PetDetail          from '../components/PetDetail';
import GameChat           from '../components/GameChat';
import SettingsPanel      from '../components/SettingsPanel';
import TutorialHints      from '../components/TutorialHints';
import AchievementsScreen, { AchievementToast, useAchievementToasts } from '../components/AchievementToast';
import DiceRoller         from '../components/DiceRoller';
import PhoneCombat        from '../components/PhoneCombat';
import { listenGame, listenPlayer, updatePlayerStats, addLog } from '../game/gameState';
import { useNarratorReader } from '../game/useNarrator';
import NarratorBox        from '../components/NarratorBox';
import { getLevel, xpToNextLevel, XP_TABLE } from '../data/heroTree';
import { getReputationLabel, computeEffectiveStats } from '../game/progression';
import UpgradeScreen      from './UpgradeScreen';
import { play }           from '../game/soundEngine';
import { useSettings }    from '../components/SettingsPanel';
import { ref, set, update } from 'firebase/database';
import { db } from '../firebase';

const S = {
  bg: { minHeight:'100vh', background:'#0c0c0e', fontFamily:"'Crimson Text',Georgia,serif", display:'flex', flexDirection:'column' },
  header: { background:'linear-gradient(135deg,#16140e,#1a1810)', borderBottom:'1px solid #2a2418', padding:'14px 18px', display:'flex', alignItems:'center', gap:'12px', position:'sticky', top:0, zIndex:10 },
  tab: (a) => ({ flex:1, padding:'11px 4px', textAlign:'center', fontFamily:"'Cinzel',serif", fontSize:'10px', letterSpacing:'0.5px', textTransform:'uppercase', color:a?'#c0932a':'#5a4a2a', borderBottom:`2px solid ${a?'#c0932a':'transparent'}`, cursor:'pointer', transition:'all 0.2s' }),
  section: { padding:'14px 18px' },
  sectionTitle: { fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px', color:'#7a6a4a', textTransform:'uppercase', marginBottom:'10px', borderBottom:'1px solid #1e1a12', paddingBottom:'6px' },
  statCard: (color='#c0932a') => ({ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:'10px', padding:'10px 6px', textAlign:'center' }),
  statVal: { fontSize:'20px', fontWeight:700, color:'#e0d5c0' },
  statLbl: { fontSize:'10px', color:'#7a6a4a', marginTop:'2px' },
  itemCard: { background:'#16140e', border:'1px solid #2a2418', borderRadius:'10px', padding:'11px 13px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'11px' },
  abilityCard: (u) => ({ background:u?'#1a1408':'#0d0b07', border:`1px solid ${u?'#c0932a30':'#1e1a12'}`, borderRadius:'10px', padding:'11px 13px', marginBottom:'8px' }),
  actionBtn: (color='#c0932a', disabled=false) => ({ width:'100%', padding:'13px', borderRadius:'11px', fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'13px', letterSpacing:'1px', border:'none', marginBottom:'9px', background:disabled?'#1a1810':`linear-gradient(135deg,${color},${color}aa)`, color:disabled?'#3a3020':'#0c0c0e', cursor:disabled?'not-allowed':'pointer' }),
  lifeDot: (a) => ({ width:'13px', height:'13px', borderRadius:'50%', background:a?'#e05050':'#1a1010', border:`1px solid ${a?'#c03030':'#2a1a1a'}`, display:'inline-block', margin:'2px' }),
  manaDot: (f) => ({ width:'11px', height:'11px', borderRadius:'50%', background:f?'#5b8dd9':'#0d1020', border:`1px solid ${f?'#3a6ab0':'#1a1a2a'}`, display:'inline-block', margin:'2px' }),
  xpBar: { height:'5px', background:'#1e1a12', borderRadius:'3px', overflow:'hidden', marginTop:'6px' },
  upgradeBanner: { background:'linear-gradient(135deg,#1a1408,#252010)', border:'1px solid #c0932a60', borderRadius:'12px', padding:'14px', textAlign:'center', marginBottom:'14px', cursor:'pointer' },
  turnBanner: { background:'linear-gradient(135deg,#1a1408,#252010)', border:'1px solid #c0932a40', borderRadius:'12px', padding:'14px', textAlign:'center', marginBottom:'14px' },
  statusChip: (color) => ({ display:'inline-flex', alignItems:'center', gap:'4px', background:`${color}15`, border:`1px solid ${color}40`, borderRadius:'20px', padding:'3px 10px', fontSize:'12px', color, marginRight:'6px', marginBottom:'6px' }),
};

function XpBar({ xp }) {
  const level  = getLevel(xp || 0);
  const xpNext = xpToNextLevel(xp || 0);
  const xpPrev = level > 1 ? XP_TABLE[level - 1] : 0;
  const xpTop  = level < 10 ? XP_TABLE[level] : XP_TABLE[XP_TABLE.length-1];
  const pct    = level >= 10 ? 100 : Math.min(100, (((xp||0) - xpPrev) / (xpTop - xpPrev)) * 100);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#5a4a2a', marginBottom:'2px' }}>
        <span>📜 Level {level}</span>
        <span>{level < 10 ? `${xpNext} XP do lvl ${level+1}` : 'MAX'}</span>
      </div>
      <div style={S.xpBar}>
        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#c0932a,#f0c040)', borderRadius:'3px', transition:'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function PhoneCard({ session }) {
  const { gameId, playerId } = session;
  const [game,        setGame]        = useState(null);
  const [player,      setPlayer]      = useState(null);
  const [tab,         setTab]         = useState('stats');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSettings,setShowSettings]= useState(false);
  const [showHints,   setShowHints]   = useState(false);
  const [showAchs,    setShowAchs]    = useState(false);
  const { text: narratorText, history: narratorHistory } = useNarratorReader(gameId);
  const { settings, update: updateSetting } = useSettings();
  const { toasts } = useAchievementToasts();
  const prevStatsRef = useRef(null);

  useEffect(() => {
    const u1 = listenGame(gameId, setGame);
    const u2 = listenPlayer(gameId, playerId, (p) => {
      setPlayer(prev => {
        // Zvuky při změnách
        if (prev && p) {
          if ((p.stats?.life || 0) < (prev.stats?.life || 0)) play('damage');
          if ((p.stats?.xp   || 0) > (prev.stats?.xp   || 0) &&
              (p.stats?.level || 1) > (prev.stats?.level || 1)) play('levelUp');
          if ((p.stats?.gold || 0) > (prev.stats?.gold || 0)) play('gold');
          if (p.pet && !prev.pet) play('tame');
        }
        prevStatsRef.current = p;
        return p;
      });
    });
    return () => { u1(); u2(); };
  }, [gameId, playerId]);

  if (!game || !player) return (
    <div style={{ ...S.bg, justifyContent:'center', alignItems:'center' }}>
      <div style={{ color:'#7a6a4a', fontFamily:"'Cinzel',serif" }}>Načítám...</div>
    </div>
  );

  if (showUpgrade) return (
    <UpgradeScreen session={session} player={player} onClose={async () => {
      setShowUpgrade(false);
      await set(ref(db, `games/${gameId}/players/${playerId}/upgradeAvailable`), false);
    }} />
  );

  const { stats, character, inventory, pet, abilities, statusEffects, upgradeAvailable } = player;
  const isMyTurn = game.currentPlayerId === playerId;
  const level    = getLevel(stats.xp || 0);
  const repLabel = getReputationLabel(stats.reputation || 0);
  const effStats = computeEffectiveStats(stats, inventory, character?.faction, player.zone || 1, statusEffects);
  const PHASES   = { roll:'🎲 Hod kostkou', draw:'🃏 Táhni kartu', combat:'⚔️ Souboj', done:'✅ Hotovo' };

  const handleItem = async (item, idx) => {
    if (!isMyTurn) return;
    if (item.bonus === 'heal') {
      const newLife = Math.min(effStats.maxLife, stats.life + item.val);
      await updatePlayerStats(gameId, playerId, { life: newLife });
      const newInv = (inventory || []).filter((_, i) => i !== idx);
      await set(ref(db, `games/${gameId}/players/${playerId}/inventory`), newInv);
      await addLog(gameId, `${player.name} použil ${item.emoji} ${item.name} (+${item.val} ŽP) 💚`, 'ok');
    }
  };

  return (
    <div style={S.bg}>
      {/* Modaly */}
      {showSettings && (
        <SettingsPanel settings={settings} onUpdate={updateSetting} onClose={() => setShowSettings(false)} />
      )}
      {showHints && <TutorialHints onClose={() => setShowHints(false)} />}
      {showAchs && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:150, overflowY:'auto' }}>
          <div style={{ background:'#0c0c0e', minHeight:'100vh' }}>
            <div style={{ padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #1e1a12' }}>
              <span style={{ fontFamily:"'Cinzel',serif", color:'#c0932a', fontSize:'15px', fontWeight:700 }}>🏅 Achievementy</span>
              <button onClick={() => setShowAchs(false)} style={{ background:'none', border:'none', color:'#7a6a4a', fontSize:'20px', cursor:'pointer' }}>✕</button>
            </div>
            <AchievementsScreen earned={player?.achievements || []} />
          </div>
        </div>
      )}
      {/* Achievement toasty */}
      <AchievementToast toasts={toasts} />
      {/* Hlavička */}
      <div style={S.header}>
        <span style={{ fontSize:'30px' }}>{character?.emoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:character?.color||'#c0932a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {player.name}
          </div>
          <div style={{ fontSize:'11px', color:'#7a6a4a' }}>{character?.name} · Lv.{level} · {character?.faction}</div>
          <XpBar xp={stats.xp || 0} />
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', color:isMyTurn?'#4caf50':'#5a4a2a', background:isMyTurn?'#0d1a0d':'#0d0b07', border:`1px solid ${isMyTurn?'#2a5a2a':'#1e1a12'}`, borderRadius:'6px', padding:'4px 8px' }}>
            {isMyTurn ? '⚡ Tvůj tah!' : '⏳ Čekáš'}
          </div>
          <div style={{ display:'flex', gap:'4px', marginTop:'4px', justifyContent:'flex-end' }}>
            <button onClick={() => setShowHints(true)}
                    style={{ fontSize:'12px', background:'none', border:'none', cursor:'pointer', color:'#5a4a2a' }}>❓</button>
            <button onClick={() => setShowAchs(true)}
                    style={{ fontSize:'12px', background:'none', border:'none', cursor:'pointer', color:'#5a4a2a' }}>🏅</button>
            <button onClick={() => setShowSettings(true)}
                    style={{ fontSize:'12px', background:'none', border:'none', cursor:'pointer', color:'#5a4a2a' }}>⚙️</button>
          </div>
        </div>
      </div>

      {/* Záložky */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e1a12', background:'#0d0b07' }}>
        {['stats','abilities','inventory','pet','chat'].map(t => (
          <div key={t} style={S.tab(tab===t)} onClick={() => setTab(t)}>
            {{ stats:'📊 Stats', abilities:'⚡ Schop.', inventory:'🎒 Věci', pet:'🐾 Pet', chat:'💬 Chat' }[t]}
          </div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>

        {/* STATS */}
        {tab === 'stats' && (
          <div style={S.section}>
            {/* Vypravěč */}
            {narratorText && (
              <NarratorBox text={narratorText} loading={false} history={narratorHistory} />
            )}
            {upgradeAvailable && (
              <div style={S.upgradeBanner} onClick={() => setShowUpgrade(true)}>
                <div style={{ fontSize:'22px', marginBottom:'4px' }}>⬆️</div>
                <div style={{ fontFamily:"'Cinzel',serif", color:'#c0932a', fontSize:'14px', fontWeight:700 }}>Upgrade třídy dostupný!</div>
                <div style={{ fontSize:'12px', color:'#9a8a6a', marginTop:'4px' }}>Klepni pro výběr cesty</div>
              </div>
            )}
            {/* SOUBOJ — zobrazí se automaticky když probíhá */}
            <PhoneCombat
              gameId={gameId}
              playerId={playerId}
              player={player}
              diceMode={settings?.diceMode || 'virtual'}
            />

            {isMyTurn && (
              <div style={{ ...S.turnBanner, padding:'0' }}>
                {/* Hlavička tahu */}
                <div style={{ padding:'14px 14px 10px', borderBottom: game.phase === 'roll' ? '1px solid #2a2010' : 'none' }}>
                  <div style={{ fontFamily:"'Cinzel',serif", color:'#c0932a', fontSize:'14px', fontWeight:700, marginBottom:'3px' }}>⚡ Je tvůj tah!</div>
                  <div style={{ fontSize:'13px', color:'#9a8a6a' }}>Fáze: <strong style={{ color:'#e0d5c0' }}>{PHASES[game.phase]||game.phase}</strong></div>
                </div>

                {/* KOSTKA — jen ve fázi roll */}
                {game.phase === 'roll' && <DiceRoller gameId={gameId} playerId={playerId} player={player} game={game} settings={settings} />}
              </div>
            )}
            {/* Životy + mana */}
            <div style={{ marginBottom:'14px' }}>
              <div style={{ fontSize:'12px', color:'#7a6a4a', marginBottom:'4px' }}>❤️ Životy {stats.life}/{stats.maxLife}</div>
              <div style={{ marginBottom:'8px' }}>
                {Array.from({ length: stats.maxLife }).map((_,i) => <span key={i} style={S.lifeDot(i < stats.life)} />)}
              </div>
              <div style={{ fontSize:'12px', color:'#7a6a4a', marginBottom:'4px' }}>💧 Mana {stats.mana}/{stats.maxMana}</div>
              <div>
                {Array.from({ length: stats.maxMana }).map((_,i) => <span key={i} style={S.manaDot(i < stats.mana)} />)}
              </div>
            </div>
            {/* Stat grid 3×2 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'7px' }}>
              {[
                ['⚔️','Síla',   stats.str,     effStats.str,     '#c0932a'],
                ['🔮','Doved.', stats.skill,   effStats.skill,   '#5b8dd9'],
                ['⭐','Osud',   stats.fate,    effStats.fate,    '#e8c840'],
                ['🏃','Pohyb',  stats.move,    effStats.move,    '#4caf50'],
                ['🛡️','Obrana', stats.defense, effStats.defense, '#9a8a6a'],
                ['🪙','Zlato',  stats.gold,    stats.gold,       '#f0c040'],
              ].map(([emoji,lbl,base,eff,color]) => {
                const boosted = eff > base;
                return (
                  <div key={lbl} style={S.statCard(color)}>
                    <div style={{ fontSize:'16px' }}>{emoji}</div>
                    <div style={{ ...S.statVal, color:boosted?color:'#e0d5c0' }}>
                      {eff}{boosted && <span style={{ fontSize:'10px', color }}>+{eff-base}</span>}
                    </div>
                    <div style={S.statLbl}>{lbl}</div>
                  </div>
                );
              })}
            </div>
            {/* Trofeje + reputace */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'10px' }}>
              <div style={S.statCard('#c0932a')}>
                <div style={{ fontSize:'20px', fontWeight:700, color:'#e0d5c0' }}>{stats.trophies||0}</div>
                <div style={S.statLbl}>🏆 Trofeje</div>
              </div>
              <div style={{ ...S.statCard(repLabel.color), cursor:'default' }}>
                <div style={{ fontSize:'18px' }}>{repLabel.emoji}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:repLabel.color }}>{repLabel.label}</div>
              </div>
            </div>
            {/* Reputace bar */}
            <div style={{ marginTop:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'11px', color:'#e05050' }}>😈</span>
              <div style={{ flex:1, height:'5px', background:'#1e1a12', borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'3px', width:`${((stats.reputation+10)/20)*100}%`, background:repLabel.color, transition:'width 0.3s' }} />
              </div>
              <span style={{ fontSize:'11px', color:'#4caf50' }}>😇</span>
              <span style={{ fontSize:'11px', color:'#5a4a2a' }}>{stats.reputation>0?'+':''}{stats.reputation||0}</span>
            </div>
            {/* Status efekty */}
            {(statusEffects||[]).length > 0 && (
              <div style={{ marginTop:'12px' }}>
                <div style={S.sectionTitle}>Aktivní efekty</div>
                {(statusEffects||[]).map((eff,i) => (
                  <span key={i} style={S.statusChip(eff.val<0?'#e05050':'#4caf50')}>
                    {eff.emoji} {eff.name} <span style={{ opacity:0.7 }}>·{eff.turnsLeft||eff.duration}t</span>
                  </span>
                ))}
              </div>
            )}
            {/* Stav světa */}
            <div style={{ marginTop:'14px' }}>
              <div style={S.sectionTitle}>Stav světa</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {[
                  [({ sunny:'☀️',rain:'🌧️',storm:'⛈️',fog:'🌫️',snow:'❄️' })[game.weather]||'☀️','Počasí'],
                  [({ morning:'🌅',day:'☀️',evening:'🌆',night:'🌙' })[game.timeOfDay]||'☀️','Čas'],
                  [`Z${player.zone||1}`,'Zóna'],
                ].map(([v,l]) => (
                  <div key={l} style={{ ...S.statCard(), flex:1 }}>
                    <div style={{ fontSize:l==='Zóna'?'14px':'18px', fontWeight:l==='Zóna'?700:'normal', color:'#e0d5c0' }}>{v}</div>
                    <div style={S.statLbl}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCHOPNOSTI */}
        {tab === 'abilities' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Aktivní</div>
            {(abilities||[]).filter(a=>a.type==='active').map(a => {
              const canUse = isMyTurn && stats.mana >= a.manaCost;
              return (
                <div key={a.id} style={S.abilityCard(canUse)}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', color:'#c0932a', fontWeight:700 }}>⚡ {a.name}</span>
                    <span style={{ fontSize:'12px', color:'#5b8dd9' }}>💧 {a.manaCost}</span>
                  </div>
                  <div style={{ fontSize:'13px', color:'#9a8a6a', marginBottom:canUse?'8px':0 }}>{a.desc}</div>
                  {canUse && <button style={{ ...S.actionBtn('#5b8dd9'), padding:'8px', fontSize:'12px', marginBottom:0 }} onClick={() => alert(`"${a.name}" přijde ve Fázi 4!`)}>Použít</button>}
                  {!canUse && isMyTurn && stats.mana < a.manaCost && <div style={{ fontSize:'11px', color:'#5a4a2a', marginTop:'4px' }}>Nedostatek many ({stats.mana}/{a.manaCost})</div>}
                </div>
              );
            })}
            <div style={{ ...S.sectionTitle, marginTop:'16px' }}>Pasivní</div>
            {(abilities||[]).filter(a=>a.type==='passive').map(a => (
              <div key={a.id} style={{ ...S.abilityCard(false), opacity:0.8 }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', color:'#7a6a4a', fontWeight:700, marginBottom:'3px' }}>🔒 {a.name}</div>
                <div style={{ fontSize:'13px', color:'#6a5a3a' }}>{a.desc}</div>
              </div>
            ))}
            {upgradeAvailable && (
              <div style={{ marginTop:'16px' }}>
                <button style={S.actionBtn('#c0932a')} onClick={() => setShowUpgrade(true)}>⬆️ Odemknout upgrade třídy</button>
              </div>
            )}
          </div>
        )}

        {/* INVENTÁŘ */}
        {tab === 'inventory' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Inventář ({(inventory||[]).length} předmětů)</div>
            {(!inventory||inventory.length===0) && (
              <div style={{ textAlign:'center', color:'#5a4a2a', fontSize:'14px', padding:'32px 0', fontStyle:'italic' }}>
                Inventář je prázdný.<br />Sbírej předměty na cestě.
              </div>
            )}
            {(inventory||[]).map((item,idx) => (
              <div key={idx} style={S.itemCard}>
                <span style={{ fontSize:'22px' }}>{item.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', color:'#c0932a', fontWeight:700 }}>{item.name}</div>
                  <div style={{ fontSize:'12px', color:'#7a6a4a' }}>{item.desc}</div>
                  <div style={{ fontSize:'11px', color:'#5a4a2a', marginTop:'2px' }}>{item.type==='use'?'🔵 Jednorázový':`🟡 Pasivní · +${item.val} ${item.bonus}`}</div>
                </div>
                {item.type==='use' && (
                  <button style={{ ...S.actionBtn('#4caf50',!isMyTurn), width:'auto', padding:'8px 12px', fontSize:'12px', marginBottom:0 }} onClick={() => handleItem(item,idx)}>Použít</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PET */}
        {tab === 'pet' && (
          <PetDetail session={session} player={player} />
        )}

        {/* CHAT */}
        {tab === 'chat' && (
          <div style={{ height:'calc(100vh - 160px)' }}>
            <GameChat gameId={gameId} currentPlayer={player} />
          </div>
        )}
      </div>
    </div>
  );
}
