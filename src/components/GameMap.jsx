// src/components/GameMap.jsx
import { ZONES, ZONE_LOCATIONS, WEATHER, TIME_OF_DAY, getTimeOfDay } from '../data/mapData';

const ZONE_COLORS = {
  1: { main:'#4caf50', bg:'#0d1a0d', border:'#1e3a1e', text:'#4caf50' },
  2: { main:'#c0932a', bg:'#1a1408', border:'#3a2808', text:'#c0932a' },
  3: { main:'#e07030', bg:'#1a0e08', border:'#3a2010', text:'#e07030' },
  4: { main:'#9b59b6', bg:'#12080f', border:'#2a1030', text:'#9b59b6' },
  5: { main:'#e05050', bg:'#1a0808', border:'#3a1010', text:'#e05050' },
};

const TYPE_CONFIG = {
  safe:      { icon:'🟢', bg:'#0d1a0d', border:'#1e3a1e' },
  dangerous: { icon:'🔴', bg:'#1a0d0d', border:'#3a1010' },
  inn:       { icon:'🍺', bg:'#1a1408', border:'#3a2808' },
  temple:    { icon:'⛪', bg:'#0d0d1a', border:'#10103a' },
  smithy:    { icon:'⚒️', bg:'#0f0d08', border:'#302808' },
  shop:      { icon:'🛒', bg:'#10081a', border:'#28103a' },
  special:   { icon:'✨', bg:'#08100f', border:'#10302a' },
};

const S = {
  wrap: { width:'100%', fontFamily:"'Crimson Text',Georgia,serif" },
  worldBar: {
    display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap',
    marginBottom:'14px', padding:'12px 16px',
    background:'#16140e', border:'1px solid #2a2418', borderRadius:'12px',
  },
  weatherPill: (color) => ({
    display:'flex', alignItems:'center', gap:'6px',
    background:`${color}15`, border:`1px solid ${color}50`,
    borderRadius:'20px', padding:'5px 14px', fontSize:'13px', color,
    fontFamily:"'Cinzel',serif", fontWeight:600,
  }),
  zoneWrap: (zNum) => ({
    background: ZONE_COLORS[zNum]?.bg || '#0d0b07',
    border:`2px solid ${ZONE_COLORS[zNum]?.border || '#1a1710'}`,
    borderRadius:'14px', padding:'14px', marginBottom:'12px',
    transition:'all 0.3s',
  }),
  zoneHeader: {
    display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px',
  },
  zoneTitle: (zNum) => ({
    fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700,
    color: ZONE_COLORS[zNum]?.main || '#c0932a', flex:1,
  }),
  tilesGrid: {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fill, minmax(90px, 1fr))',
    gap:'8px',
  },
  tile: (type, hasPlayers, locked) => {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.safe;
    return {
      background: hasPlayers ? '#252010' : locked ? '#080706' : cfg.bg,
      border:`2px solid ${hasPlayers ? '#c0932a80' : locked ? '#141210' : cfg.border}`,
      borderRadius:'10px', padding:'10px 6px', textAlign:'center',
      cursor:'default', minHeight:'80px',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:'3px',
      boxShadow: hasPlayers ? '0 0 16px #c0932a30' : 'none',
      opacity: locked ? 0.4 : 1,
      transition:'all 0.2s',
      position:'relative',
    };
  },
  tileEmoji: { fontSize:'22px' },
  tileName: (hasPlayers, type) => ({
    fontSize:'10px', lineHeight:1.2, color: hasPlayers ? '#c0932a' :
      (TYPE_CONFIG[type]?.border ? '#7a6a4a' : '#5a4a2a'),
    fontWeight: hasPlayers ? 700 : 'normal',
  }),
  tileType: { fontSize:'9px', color:'#3a3020', marginTop:'1px' },
  playerAvatars: {
    display:'flex', gap:'1px', flexWrap:'wrap',
    justifyContent:'center', marginTop:'3px',
  },
  playerAvatar: (isActive) => ({
    fontSize:'14px',
    filter: isActive ? 'drop-shadow(0 0 5px #c0932a)' : 'none',
  }),
  legend: {
    display:'flex', flexWrap:'wrap', gap:'8px',
    marginBottom:'12px',
  },
  legendItem: (color) => ({
    display:'flex', alignItems:'center', gap:'4px',
    fontSize:'11px', color, fontFamily:"'Cinzel',serif",
  }),
  weatherEffect: {
    fontSize:'12px', color:'#7a6a4a', fontStyle:'italic',
    padding:'8px 12px', background:'#0d0b07', borderRadius:'8px',
    marginBottom:'10px', border:'1px solid #1e1a12',
  },
};

function typeLabel(type) {
  return {
    safe:'Bezpečné', dangerous:'Nebez.', inn:'Hospoda',
    temple:'Chrám', smithy:'Kovárna', shop:'Obchod', special:'Spec.',
  }[type] || type;
}

export default function GameMap({ game }) {
  const players    = Object.values(game?.players || {}).filter(p => p.character);
  const weather    = WEATHER[game?.weather || 'sunny'];
  const timeObj    = getTimeOfDay(game?.hourOfDay || 8);
  const currentPId = game?.currentPlayerId;
  const maxZone    = Math.max(1, ...players.map(p => p.zone || 1));

  const hasWeatherEffect = weather.effects.move !== 0 || weather.effects.strMod !== 0 ||
                           weather.effects.coldDmg || weather.effects.hideCards;
  const hasTimeEffect = timeObj.effects.enemyStr !== 0 || timeObj.effects.move !== 0;

  return (
    <div style={S.wrap}>
      {/* Stavový bar */}
      <div style={S.worldBar}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', color:'#5a4a2a',
                       letterSpacing:'2px', textTransform:'uppercase' }}>Svět</div>
        <div style={{ flex:1 }} />
        <div style={S.weatherPill(weather.color)}>{weather.emoji} {weather.name}</div>
        <div style={S.weatherPill(timeObj.color)}>{timeObj.emoji} {timeObj.name} · {game?.hourOfDay||8}:00</div>
        <div style={{ fontSize:'12px', color:'#5a4a2a' }}>Tah {game?.turn||1}</div>
      </div>

      {/* Efekty */}
      {(hasWeatherEffect || hasTimeEffect) && (
        <div style={S.weatherEffect}>
          {hasWeatherEffect && <span>{weather.emoji} {weather.desc} </span>}
          {weather.effects.move !== 0 && <span>· Pohyb {weather.effects.move>0?'+':''}{weather.effects.move} </span>}
          {hasTimeEffect && <span>· {timeObj.emoji} Příšery {timeObj.effects.enemyStr>0?'+':''}{timeObj.effects.enemyStr} Síla</span>}
        </div>
      )}

      {/* Legenda */}
      <div style={S.legend}>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} style={S.legendItem('#7a6a4a')}>
            <span>{cfg.icon}</span>
            <span>{typeLabel(type)}</span>
          </div>
        ))}
      </div>

      {/* Zóny */}
      {Object.entries(ZONES).map(([zId, zone]) => {
        const zNum      = parseInt(zId);
        const locs      = ZONE_LOCATIONS[zNum] || [];
        const zonePlayers = players.filter(p => (p.zone||1) === zNum);
        const locked    = zNum > maxZone + 1;
        const colors    = ZONE_COLORS[zNum];

        return (
          <div key={zId} style={S.zoneWrap(zNum)}>
            <div style={S.zoneHeader}>
              <span style={{ fontSize:'22px' }}>{zone.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={S.zoneTitle(zNum)}>
                  Zóna {zId} — {zone.name}
                  {locked && <span style={{ fontSize:'14px', marginLeft:'8px', opacity:0.5 }}>🔒</span>}
                </div>
                <div style={{ fontSize:'11px', color:'#5a4a2a' }}>
                  {'⭐'.repeat(zone.difficulty)}
                  {zonePlayers.length > 0 && (
                    <span style={{ marginLeft:'8px', color:colors?.main }}>
                      {zonePlayers.map(p => p.character?.emoji).join('')} zde
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={S.tilesGrid}>
              {locs.map((loc, locIdx) => {
                const herePlayers = players.filter(
                  p => (p.zone||1) === zNum && p.position === locIdx
                );
                const isActive = herePlayers.length > 0;

                return (
                  <div key={loc.id} style={S.tile(loc.type, isActive, locked)}
                       title={`${loc.name} — ${loc.desc}`}>
                    <div style={S.tileEmoji}>{loc.emoji}</div>
                    <div style={S.tileName(isActive, loc.type)}>{loc.name}</div>
                    <div style={S.tileType}>{TYPE_CONFIG[loc.type]?.icon} {typeLabel(loc.type)}</div>

                    {isActive && (
                      <div style={S.playerAvatars}>
                        {herePlayers.map(p => (
                          <span key={p.id} style={S.playerAvatar(p.id === currentPId)}>
                            {p.character?.emoji || '👤'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
