// src/components/GameMap.jsx
// Vizuální mapa světa pro hrací desku

import { ZONES, ZONE_LOCATIONS, WEATHER, TIME_OF_DAY, getTimeOfDay } from '../data/mapData';

const S = {
  wrap: {
    width: '100%',
    fontFamily: "'Crimson Text', Georgia, serif",
  },
  worldHeader: {
    display: 'flex', alignItems: 'center', gap: '16px',
    marginBottom: '14px', flexWrap: 'wrap',
  },
  worldTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 700,
    color: '#7a6a4a', letterSpacing: '3px', textTransform: 'uppercase',
  },
  weatherChip: (color) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    background: `${color}15`, border: `1px solid ${color}40`,
    borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color,
  }),
  timeChip: (color) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    background: `${color}15`, border: `1px solid ${color}40`,
    borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color,
  }),
  zoneRow: (color, isActive) => ({
    background: isActive ? `${color}08` : '#0f0e0b',
    border: `1px solid ${isActive ? color + '40' : '#1a1710'}`,
    borderRadius: '14px', padding: '12px 14px', marginBottom: '10px',
    transition: 'all 0.3s',
  }),
  zoneHeader: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px',
  },
  zoneTitle: (color) => ({
    fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 700, color,
    flex: 1,
  }),
  difficulty: { fontSize: '12px', color: '#5a4a2a' },
  locGrid: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
  },
  locTile: (type, hasPlayers, isLocked) => {
    const typeColors = {
      safe:      { bg: '#0d150d', border: '#1e3a1e', text: '#4a8a4a' },
      dangerous: { bg: '#150d0d', border: '#3a1e1e', text: '#8a4a4a' },
      inn:       { bg: '#15130a', border: '#3a3010', text: '#a09030' },
      temple:    { bg: '#0d0d18', border: '#1e1e40', text: '#6060c0' },
      smithy:    { bg: '#130f0a', border: '#3a2a10', text: '#9a7030' },
      shop:      { bg: '#130d15', border: '#351a35', text: '#9050a0' },
      special:   { bg: '#0d1215', border: '#1a3040', text: '#4080a0' },
    };
    const c = typeColors[type] || typeColors.safe;
    return {
      background: hasPlayers ? '#252010' : isLocked ? '#0a0908' : c.bg,
      border: `1px solid ${hasPlayers ? '#c0932a80' : isLocked ? '#141210' : c.border}`,
      borderRadius: '8px', padding: '7px 8px', minWidth: '74px',
      textAlign: 'center', fontSize: '11px',
      color: hasPlayers ? '#c0932a' : isLocked ? '#2a2520' : c.text,
      opacity: isLocked ? 0.5 : 1,
      boxShadow: hasPlayers ? '0 0 10px #c0932a25' : 'none',
      transition: 'all 0.2s', cursor: 'default', position: 'relative',
    };
  },
  playerAvatars: {
    display: 'flex', justifyContent: 'center',
    gap: '1px', marginTop: '3px', flexWrap: 'wrap',
  },
  zoneLockedOverlay: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', color: '#3a3020', fontStyle: 'italic', marginTop: '6px',
    padding: '6px 10px', background: '#0d0b07', borderRadius: '6px',
  },
  legendWrap: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
    marginBottom: '14px',
  },
  legendItem: (color) => ({
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '11px', color, opacity: 0.8,
  }),
  weatherEffect: {
    fontSize: '11px', color: '#7a6a4a', fontStyle: 'italic',
    padding: '6px 10px', background: '#0d0b07', borderRadius: '6px',
    marginBottom: '10px',
  },
};

function typeLabel(type) {
  return { safe:'🟢 Bezp.', dangerous:'🔴 Nebez.', inn:'🍺 Hospoda',
    temple:'⛪ Chrám', smithy:'⚒️ Kovárna', shop:'🛒 Obchod', special:'✨ Spec.' }[type] || type;
}

export default function GameMap({ game }) {
  const players    = Object.values(game?.players || {});
  const weather    = WEATHER[game?.weather || 'sunny'];
  const timeObj    = getTimeOfDay(game?.hourOfDay || 8);
  const currentPId = game?.currentPlayerId;
  const globalTurn = game?.turn || 1;

  // Zjisti max zónu jakéhokoli hráče (pro zobrazení odemčených zón)
  const maxPlayerZone = Math.max(1, ...players.map(p => p.zone || 1));

  return (
    <div style={S.wrap}>
      {/* Hlavička — počasí + čas */}
      <div style={S.worldHeader}>
        <div style={S.worldTitle}>Mapa světa</div>

        <div style={S.weatherChip(weather.color)}>
          <span>{weather.emoji}</span>
          <span>{weather.name}</span>
        </div>

        <div style={S.timeChip(timeObj.color)}>
          <span>{timeObj.emoji}</span>
          <span>{timeObj.name}</span>
          <span style={{ opacity:0.6 }}>({game?.hourOfDay || 8}:00)</span>
        </div>

        <div style={{ fontSize:'12px', color:'#5a4a2a' }}>
          Tah {globalTurn}
        </div>
      </div>

      {/* Efekty počasí */}
      {(weather.effects.move !== 0 || weather.effects.strMod !== 0 ||
        weather.effects.coldDmg || weather.effects.hideCards) && (
        <div style={S.weatherEffect}>
          ⚠️ {weather.desc}
          {weather.effects.move   !== 0 && ` · Pohyb ${weather.effects.move > 0 ? '+' : ''}${weather.effects.move}`}
          {weather.effects.strMod !== 0 && ` · Síla ${weather.effects.strMod > 0 ? '+' : ''}${weather.effects.strMod}`}
          {weather.effects.coldDmg && ` · Chlad -${weather.effects.coldDmg} ŽP/tah`}
          {weather.effects.hideCards && ' · Karty skryté'}
        </div>
      )}

      {/* Efekty denní doby */}
      {(timeObj.effects.enemyStr !== 0 || timeObj.effects.move !== 0) && (
        <div style={{ ...S.weatherEffect, borderColor: timeObj.color + '30', color: timeObj.color }}>
          {timeObj.emoji} {timeObj.desc}
          {timeObj.effects.enemyStr !== 0 && ` · Příšery ${timeObj.effects.enemyStr > 0 ? '+' : ''}${timeObj.effects.enemyStr} Síla`}
          {timeObj.effects.move     !== 0 && ` · Pohyb ${timeObj.effects.move > 0 ? '+' : ''}${timeObj.effects.move}`}
        </div>
      )}

      {/* Legenda */}
      <div style={S.legendWrap}>
        {[
          ['🟢','#4a8a4a','Bezpečné'],
          ['🔴','#8a4a4a','Nebezpečné'],
          ['🍺','#a09030','Hospoda'],
          ['⛪','#6060c0','Chrám'],
          ['⚒️','#9a7030','Kovárna'],
          ['🛒','#9050a0','Obchod'],
          ['✨','#4080a0','Speciální'],
        ].map(([e,c,l]) => (
          <div key={l} style={S.legendItem(c)}>{e} {l}</div>
        ))}
      </div>

      {/* Zóny */}
      {Object.entries(ZONES).map(([zoneId, zone]) => {
        const zNum     = parseInt(zoneId);
        const locs     = ZONE_LOCATIONS[zNum] || [];
        const isActive = zNum <= maxPlayerZone + 1; // vidíme i příští zónu
        const isLocked = zNum > maxPlayerZone + 1;

        // Hráči v této zóně
        const zonePlayers = players.filter(p => (p.zone || 1) === zNum);

        return (
          <div key={zoneId} style={S.zoneRow(zone.color, zonePlayers.length > 0)}>
            <div style={S.zoneHeader}>
              <span style={{ fontSize:'20px' }}>{zone.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={S.zoneTitle(zone.color)}>
                  Zóna {zoneId} — {zone.name}
                </div>
                <div style={S.difficulty}>
                  {'⭐'.repeat(zone.difficulty)}
                  {zonePlayers.length > 0 && (
                    <span style={{ marginLeft:'8px', color:'#c0932a' }}>
                      · {zonePlayers.map(p => p.character?.emoji).join('')} zde
                    </span>
                  )}
                </div>
              </div>
              {isLocked && <span style={{ fontSize:'16px', opacity:0.4 }}>🔒</span>}
            </div>

            {/* Lokace */}
            <div style={S.locGrid}>
              {locs.map((loc, locIdx) => {
                const herePlayers = players.filter(
                  p => (p.zone||1) === zNum && p.position === locIdx
                );
                const isCurrentTurn = herePlayers.some(p => p.id === currentPId);

                return (
                  <div key={loc.id} style={S.locTile(loc.type, herePlayers.length > 0, isLocked)}
                       title={loc.desc}>
                    <div style={{ fontSize:'16px' }}>{loc.emoji}</div>
                    <div style={{ marginTop:'2px', lineHeight:'1.2', fontSize:'10px' }}>
                      {loc.name}
                    </div>
                    <div style={{ fontSize:'9px', opacity:0.7, marginTop:'1px' }}>
                      {typeLabel(loc.type)}
                    </div>

                    {herePlayers.length > 0 && (
                      <div style={S.playerAvatars}>
                        {herePlayers.map(p => (
                          <span key={p.id} style={{ fontSize:'14px',
                            filter: p.id === currentPId ? 'drop-shadow(0 0 4px #c0932a)' : 'none' }}>
                            {p.character?.emoji || '👤'}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Speciální ikony míst */}
                    {loc.type === 'inn'    && <div style={{ fontSize:'9px', color:'#a09030', marginTop:'1px' }}>Léčení</div>}
                    {loc.type === 'temple' && <div style={{ fontSize:'9px', color:'#6060c0', marginTop:'1px' }}>Požehnání</div>}
                    {loc.type === 'smithy' && <div style={{ fontSize:'9px', color:'#9a7030', marginTop:'1px' }}>Upgrade</div>}
                  </div>
                );
              })}
            </div>

            {/* Požadavek pro vstup */}
            {zNum > 1 && (
              <div style={S.zoneLockedOverlay}>
                {isLocked
                  ? `🔒 Podmínky vstupu — přijde ve Fázi 3`
                  : `✅ Zóna přístupná`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
