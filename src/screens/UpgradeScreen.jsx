// src/screens/UpgradeScreen.jsx
// Zobrazí se na telefonu hráče, když dosáhne podmínek upgradu

import { useState } from 'react';
import { HERO_TREE, canUpgrade, applyUpgrade, getLevel, xpToNextLevel, XP_TABLE } from '../data/heroTree';
import { updatePlayerStats, addLog } from '../game/gameState';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

const S = {
  bg: {
    minHeight: '100vh', background: '#0c0c0e',
    fontFamily: "'Crimson Text', Georgia, serif",
    padding: '0 0 40px',
  },
  header: {
    background: 'linear-gradient(135deg, #1a1208, #0c0c0e)',
    borderBottom: '1px solid #2a2418', padding: '20px',
    textAlign: 'center',
  },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: '22px', fontWeight: 900,
    color: '#c0932a', letterSpacing: '2px',
  },
  sub: { color: '#7a6a4a', fontSize: '13px', marginTop: '4px' },
  xpBar: {
    height: '6px', background: '#1e1a12', borderRadius: '3px',
    overflow: 'hidden', margin: '12px 20px 0',
  },
  section: { padding: '16px 20px' },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '11px', letterSpacing: '3px',
    color: '#7a6a4a', textTransform: 'uppercase',
    marginBottom: '14px', borderBottom: '1px solid #1e1a12', paddingBottom: '6px',
  },
  pathCard: (color, selected, locked) => ({
    background: selected ? `${color}15` : locked ? '#0a0908' : '#16140e',
    border: `2px solid ${selected ? color : locked ? '#1a1510' : '#2a2418'}`,
    borderRadius: '16px', padding: '20px', marginBottom: '14px',
    opacity: locked ? 0.6 : 1, cursor: locked ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    boxShadow: selected ? `0 0 24px ${color}30` : 'none',
  }),
  pathHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  pathEmoji: { fontSize: '32px' },
  pathName: (color) => ({
    fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 700, color,
  }),
  pathLabel: { fontSize: '12px', color: '#7a6a4a', marginTop: '2px' },
  desc: { fontSize: '14px', color: '#9a8a6a', lineHeight: 1.6, marginBottom: '12px' },
  statGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px',
    marginBottom: '12px',
  },
  statPill: (positive) => ({
    textAlign: 'center', padding: '6px 4px', borderRadius: '8px',
    background: positive ? '#0d1a0d' : '#1a0d0d',
    border: `1px solid ${positive ? '#2a5a2a' : '#5a2a2a'}`,
    fontSize: '12px', color: positive ? '#4caf50' : '#e05050',
  }),
  abilityRow: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    padding: '8px', background: '#0d0b07', borderRadius: '8px',
    marginBottom: '6px',
  },
  lockTag: {
    background: '#1a1510', border: '1px solid #2a2010',
    borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
    color: '#5a4a2a', marginBottom: '6px', display: 'inline-block',
  },
  confirmBtn: (color, disabled) => ({
    width: '100%', padding: '16px', borderRadius: '12px',
    fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '15px',
    letterSpacing: '1px', border: 'none', marginTop: '8px',
    background: disabled ? '#1a1810' : `linear-gradient(135deg, ${color}, ${color}bb)`,
    color: disabled ? '#3a3020' : '#0c0c0e',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  cancelBtn: {
    width: '100%', padding: '13px', borderRadius: '12px',
    fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: '13px',
    border: '1px solid #2a2418', background: 'transparent',
    color: '#7a6a4a', cursor: 'pointer', marginTop: '8px',
  },
};

function StatChange({ label, val }) {
  const pos = val > 0;
  const zero = val === 0;
  if (zero) return null;
  return (
    <div style={S.statPill(pos)}>
      <div style={{ fontSize: '16px', fontWeight: 700 }}>
        {pos ? '+' : ''}{val}
      </div>
      <div>{label}</div>
    </div>
  );
}

export default function UpgradeScreen({ session, player, onClose, onNarrate }) {
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const charId   = player?.character?.id;
  const tree     = HERO_TREE[charId];
  const upgrades = tree?.upgrades || [];

  const stats    = player?.stats || {};
  const zone     = player?.zone  || 1;
  const level    = getLevel(stats.xp || 0);
  const xpNext   = xpToNextLevel(stats.xp || 0);
  const xpPct    = level >= 10 ? 100
    : ((stats.xp - (level > 1 ? XP_TABLE[level - 1] : 0))
      / (xpNext + (stats.xp - (level > 1 ? XP_TABLE[level - 1] : 0)))) * 100;

  const handleUpgrade = async () => {
    if (!selected) return;
    const { newStats, newAbilities } = applyUpgrade(stats, player.abilities || [], selected);

    // Ulož do Firebase
    await updatePlayerStats(session.gameId, session.playerId, newStats);
    await set(
      ref(db, `games/${session.gameId}/players/${session.playerId}/abilities`),
      newAbilities
    );
    await set(
      ref(db, `games/${session.gameId}/players/${session.playerId}/character/name`),
      selected.name
    );
    await set(
      ref(db, `games/${session.gameId}/players/${session.playerId}/character/emoji`),
      selected.emoji
    );
    await set(
      ref(db, `games/${session.gameId}/players/${session.playerId}/upgradePath`),
      selected.id
    );
    await addLog(
      session.gameId,
      `⬆️ ${player.name} se stal ${selected.emoji} ${selected.name}!`,
      'ok'
    );

    // Narrator callback (volitelný — pokud je předán)
    if (typeof onNarrate === 'function') {
      onNarrate(player.character?.name, selected.name, selected.path);
    }

    setDone(true);
  };

  if (done) return (
    <div style={{ ...S.bg, display: 'flex', flexDirection: 'column',
                   justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
                   textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '60px', marginBottom: '16px' }}>{selected?.emoji}</div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '24px',
                     fontWeight: 900, color: '#c0932a', marginBottom: '8px' }}>
        Upgrade dokončen!
      </div>
      <div style={{ color: '#9a8a6a', fontSize: '15px', marginBottom: '24px' }}>
        Stal ses {selected?.name}
      </div>
      <button style={S.confirmBtn(selected?.color || '#c0932a', false)}
              onClick={onClose}>
        Pokračovat ve hře →
      </button>
    </div>
  );

  return (
    <div style={S.bg}>
      {/* Hlavička */}
      <div style={S.header}>
        <div style={S.title}>⬆️ Upgrade postavy</div>
        <div style={S.sub}>Dosáhl jsi level {level} — vyber svou cestu</div>
        <div style={S.xpBar}>
          <div style={{ height: '100%', width: `${Math.min(100, xpPct)}%`,
                         background: 'linear-gradient(90deg, #c0932a, #f0c040)',
                         borderRadius: '3px', transition: 'width 0.5s' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#5a4a2a', marginTop: '6px' }}>
          {level < 10 ? `${xpNext} XP do dalšího levelu` : 'Maximální level!'}
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Vyber svou cestu</div>

        {upgrades.length === 0 && (
          <div style={{ textAlign: 'center', color: '#5a4a2a', padding: '40px 0' }}>
            Pro tuto postavu není upgrade dostupný.
          </div>
        )}

        {upgrades.map(upg => {
          const check = canUpgrade(upg, stats, zone);
          const isSel = selected?.id === upg.id;

          return (
            <div key={upg.id}
                 style={S.pathCard(upg.color, isSel, !check.ok)}
                 onClick={() => check.ok && setSelected(isSel ? null : upg)}>

              <div style={S.pathHeader}>
                <span style={S.pathEmoji}>{upg.emoji}</span>
                <div>
                  <div style={S.pathName(upg.color)}>{upg.name}</div>
                  <div style={S.pathLabel}>Cesta: {upg.path}</div>
                </div>
                {!check.ok && (
                  <div style={{ marginLeft: 'auto', fontSize: '20px' }}>🔒</div>
                )}
                {check.ok && isSel && (
                  <div style={{ marginLeft: 'auto', fontSize: '20px', color: upg.color }}>✓</div>
                )}
              </div>

              <div style={S.desc}>{upg.description}</div>

              {/* Stat bonusy */}
              <div style={S.statGrid}>
                {Object.entries(upg.statBonus || {}).map(([key, val]) => {
                  const labels = { str:'Síla', skill:'Doved.', life:'Životy',
                                   mana:'Mana', defense:'Obrana', fate:'Osud',
                                   gold:'Zlato', move:'Pohyb' };
                  return <StatChange key={key} label={labels[key] || key} val={val} />;
                })}
              </div>

              {/* Nové schopnosti */}
              <div style={{ ...S.sectionTitle, marginTop: '8px' }}>Nové schopnosti</div>
              {(upg.newAbilities || []).map(a => (
                <div key={a.id} style={S.abilityRow}>
                  <span style={{ fontSize: '16px' }}>{a.type === 'active' ? '⚡' : '🔒'}</span>
                  <div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:'12px',
                                   color: upg.color, fontWeight:700 }}>
                      {a.name}
                      {a.manaCost > 0 && <span style={{ color:'#5b8dd9', fontWeight:'normal' }}> · 💧{a.manaCost}</span>}
                    </div>
                    <div style={{ fontSize:'12px', color:'#7a6a4a' }}>{a.desc}</div>
                  </div>
                </div>
              ))}

              {/* Podmínky zámku */}
              {!check.ok && (
                <div style={{ marginTop: '10px' }}>
                  <span style={S.lockTag}>🔒 {check.reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Potvrzení */}
      {selected && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}30`,
                         borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px',
                           color: selected.color, marginBottom:'6px' }}>
              Vybráno: {selected.emoji} {selected.name}
            </div>
            <div style={{ fontSize:'13px', color:'#9a8a6a' }}>
              Tato volba je <strong style={{ color:'#e05050' }}>nevratná</strong>. Budeš mít druhou třídu navždy.
            </div>
          </div>
          <button style={S.confirmBtn(selected.color, false)} onClick={handleUpgrade}>
            ✅ Potvrdit upgrade → {selected.name}
          </button>
          <button style={S.cancelBtn} onClick={() => setSelected(null)}>
            Zrušit výběr
          </button>
        </div>
      )}

      {!selected && (
        <div style={{ padding: '0 20px' }}>
          <button style={S.cancelBtn} onClick={onClose}>
            ← Zpět ke kartě postavy
          </button>
        </div>
      )}
    </div>
  );
}
