// src/screens/EndScreen.jsx
// Obrazovka výhry nebo prohry — s AI narací finálního momentu

import { useState, useEffect } from 'react';
import { narrateVictory } from '../game/narrator';

const S = {
  bg: {
    minHeight: '100vh',
    background: '#0c0c0e',
    fontFamily: "'Crimson Text', Georgia, serif",
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', textAlign: 'center',
  },
  victoryBg: {
    background: 'radial-gradient(ellipse at 50% 30%, #1a1208 0%, #0c0c0e 70%)',
  },
  defeatBg: {
    background: 'radial-gradient(ellipse at 50% 30%, #1a0808 0%, #0c0c0e 70%)',
  },
  mainEmoji: { fontSize: '72px', marginBottom: '16px' },
  title: (win) => ({
    fontFamily: "'Cinzel', serif", fontWeight: 900,
    fontSize: 'clamp(28px,6vw,48px)',
    color: win ? '#c0932a' : '#e05050',
    textShadow: `0 0 40px ${win ? '#c0932a' : '#e05050'}55`,
    letterSpacing: '3px', marginBottom: '8px',
  }),
  subtitle: {
    color: '#7a6a4a', fontSize: '14px', letterSpacing: '3px',
    textTransform: 'uppercase', marginBottom: '32px',
  },
  narratorBox: {
    background: 'linear-gradient(135deg,#1a1208,#12100a)',
    border: '1px solid #c0932a30',
    borderRadius: '14px', padding: '20px 24px',
    maxWidth: '520px', width: '100%',
    marginBottom: '28px',
    fontFamily: "'Crimson Text', serif",
    fontSize: '16px', lineHeight: 1.8,
    color: '#d0c5a0', fontStyle: 'italic',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
    gap: '10px', maxWidth: '380px', width: '100%', marginBottom: '28px',
  },
  statBox: (color='#c0932a') => ({
    background: `${color}10`, border: `1px solid ${color}30`,
    borderRadius: '12px', padding: '14px',
    textAlign: 'center',
  }),
  statVal: { fontSize: '24px', fontWeight: 700, color: '#e0d5c0' },
  statLbl: { fontSize: '11px', color: '#7a6a4a', marginTop: '4px' },
  playerList: {
    display: 'flex', flexWrap: 'wrap', gap: '10px',
    justifyContent: 'center', marginBottom: '28px',
  },
  playerChip: (color) => ({
    background: `${color}15`, border: `1px solid ${color}40`,
    borderRadius: '20px', padding: '6px 16px',
    fontFamily: "'Cinzel',serif", fontSize: '13px', color,
  }),
  btn: (variant='primary') => ({
    padding: '14px 32px', borderRadius: '12px',
    fontFamily: "'Cinzel',serif", fontWeight: 700,
    fontSize: '14px', letterSpacing: '1px',
    border: 'none', cursor: 'pointer', marginBottom: '10px',
    background: variant === 'primary'
      ? 'linear-gradient(135deg,#c0932a,#a07820)'
      : '#1a1810',
    color: variant === 'primary' ? '#0c0c0e' : '#c0932a',
    border: variant !== 'primary' ? '1px solid #2a2418' : 'none',
    display: 'block', width: '100%', maxWidth: '300px',
  }),
  loading: {
    display: 'flex', gap: '6px', justifyContent: 'center',
    alignItems: 'center', padding: '20px',
  },
  loadDot: (i) => ({
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#c0932a60',
    animation: `bounce 1.2s ${i * 0.2}s infinite`,
  }),
};

// Inject bounce animation
if (!document.getElementById('endscreen-styles')) {
  const s = document.createElement('style');
  s.id = 'endscreen-styles';
  s.textContent = `@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`;
  document.head.appendChild(s);
}

export default function EndScreen({ outcome, players, turns, mode, onPlayAgain }) {
  const [narration, setNarration] = useState('');
  const [loading,   setLoading]   = useState(true);

  const isVictory = outcome === 'victory';
  const playerNames = (players || []).map(p => p.name);

  useEffect(() => {
    async function fetchNarration() {
      setLoading(true);
      try {
        if (isVictory) {
          const text = await narrateVictory(playerNames, turns || 0);
          setNarration(text || defaultVictoryText(playerNames));
        } else {
          setNarration(defaultDefeatText(playerNames));
        }
      } catch {
        setNarration(isVictory
          ? defaultVictoryText(playerNames)
          : defaultDefeatText(playerNames));
      }
      setLoading(false);
    }
    fetchNarration();
  }, []);

  // Souhrnné statistiky
  const totalTrophies = (players||[]).reduce((s,p) => s + (p.stats?.trophies||0), 0);
  const totalGold     = (players||[]).reduce((s,p) => s + (p.stats?.gold||0), 0);
  const maxLevel      = Math.max(...(players||[]).map(p => p.stats?.level||1));

  return (
    <div style={{ ...S.bg, ...(isVictory ? S.victoryBg : S.defeatBg) }}>
      <div style={S.mainEmoji}>{isVictory ? '👑' : '💀'}</div>

      <div style={S.title(isVictory)}>
        {isVictory ? 'Talisman nalezen!' : 'Temnota zvítězila'}
      </div>
      <div style={S.subtitle}>
        {isVictory
          ? `Po ${turns} tazích · Mód: ${mode === 'pvp' ? 'PvP' : 'Coop'}`
          : 'Hrdinové padli'}
      </div>

      {/* Narátorský text */}
      {loading ? (
        <div style={S.narratorBox}>
          <div style={S.loading}>
            {[0,1,2].map(i => <div key={i} style={S.loadDot(i)} />)}
          </div>
        </div>
      ) : (
        <div style={S.narratorBox}>
          📖 {narration}
        </div>
      )}

      {/* Hráči */}
      <div style={S.playerList}>
        {(players||[]).map(p => (
          <div key={p.id} style={S.playerChip(p.character?.color||'#c0932a')}>
            {p.character?.emoji} {p.name} · Lv.{p.stats?.level||1}
          </div>
        ))}
      </div>

      {/* Statistiky */}
      <div style={S.statsGrid}>
        {[
          ['⚔️','Tahy',     turns,         '#c0932a'],
          ['🏆','Trofeje',  totalTrophies, '#e8c840'],
          ['🪙','Zlato',    totalGold,     '#f0c040'],
          ['📜','Max level',maxLevel,      '#5b8dd9'],
        ].map(([e,l,v,c]) => (
          <div key={l} style={S.statBox(c)}>
            <div style={{ fontSize:'22px' }}>{e}</div>
            <div style={S.statVal}>{v}</div>
            <div style={S.statLbl}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tlačítka */}
      <button style={S.btn('primary')} onClick={onPlayAgain}>
        ⚔️ Hrát znovu
      </button>
      <button style={S.btn('ghost')} onClick={() => window.location.reload()}>
        ← Hlavní menu
      </button>
    </div>
  );
}

function defaultVictoryText(names) {
  const heroes = names.join(' a ');
  return `${heroes} porazili Pána Zla a přinesli Talisman zpět do světa světla. Jejich jména budou vyryty do kamene na věčné časy. Království slaví, temné hrady se drolí a svět se pomalu léčí.`;
}

function defaultDefeatText(names) {
  return `Hrdinové padli. Temnota se rozlévá krajem. Ale legendy říkají, že odvaha nikdy neumírá úplně — a možná se jednou noví hrdinové vydají vstříc témuž osudu.`;
}
