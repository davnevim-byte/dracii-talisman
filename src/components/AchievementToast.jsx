// src/components/AchievementToast.jsx
// Pop-up notifikace při získání achievementu + přehled všech achievementů

import { useState, useEffect } from 'react';
import { ACHIEVEMENTS, getAchievementProgress } from '../game/achievements';

// ── Toast notifikace ──────────────────────────────────────────────────────────

const TOAST_S = {
  wrap: {
    position:'fixed', bottom:'20px', right:'20px',
    zIndex:200, display:'flex', flexDirection:'column', gap:'10px',
    pointerEvents:'none',
  },
  toast: {
    background:'linear-gradient(135deg,#1a1408,#252010)',
    border:'1px solid #c0932a60',
    borderRadius:'14px', padding:'14px 18px',
    display:'flex', alignItems:'center', gap:'14px',
    boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
    animation:'slideInToast 0.4s ease',
    minWidth:'260px', maxWidth:'340px',
  },
  emoji: { fontSize:'28px', flexShrink:0 },
  text: { flex:1 },
  title: {
    fontFamily:"'Cinzel',serif", fontSize:'12px', letterSpacing:'2px',
    color:'#c0932a', fontWeight:700, marginBottom:'2px',
    textTransform:'uppercase',
  },
  name: { fontSize:'14px', color:'#e0d5c0', fontWeight:600 },
  desc: { fontSize:'11px', color:'#7a6a4a', marginTop:'2px' },
};

if (!document.getElementById('toast-styles')) {
  const s = document.createElement('style');
  s.id = 'toast-styles';
  s.textContent = `
    @keyframes slideInToast {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    @keyframes fadeOutToast {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(120%); }
    }
  `;
  document.head.appendChild(s);
}

export function AchievementToast({ toasts }) {
  return (
    <div style={TOAST_S.wrap}>
      {toasts.map(t => (
        <div key={t.id} style={TOAST_S.toast}>
          <div style={TOAST_S.emoji}>{t.emoji}</div>
          <div style={TOAST_S.text}>
            <div style={TOAST_S.title}>🏅 Achievement odemčen!</div>
            <div style={TOAST_S.name}>{t.name}</div>
            <div style={TOAST_S.desc}>{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Hook pro správu toastů ────────────────────────────────────────────────────

export function useAchievementToasts() {
  const [toasts, setToasts] = useState([]);

  const showAchievement = (ach) => {
    const id = `${ach.id}_${Date.now()}`;
    setToasts(prev => [...prev, { ...ach, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return { toasts, showAchievement };
}

// ── Přehled achievementů ──────────────────────────────────────────────────────

const LIST_S = {
  wrap: { padding:'16px', fontFamily:"'Crimson Text',Georgia,serif" },
  progress: {
    background:'linear-gradient(135deg,#1a1408,#252010)',
    border:'1px solid #c0932a40', borderRadius:'12px',
    padding:'16px', marginBottom:'16px', textAlign:'center',
  },
  progressBar: {
    height:'8px', background:'#1e1a12', borderRadius:'4px',
    overflow:'hidden', margin:'10px 0',
  },
  progressFill: (pct) => ({
    height:'100%', borderRadius:'4px',
    width:`${pct}%`,
    background:'linear-gradient(90deg,#c0932a,#f0c040)',
    transition:'width 0.5s',
  }),
  grid: {
    display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',
    gap:'10px',
  },
  achCard: (earned) => ({
    background: earned ? '#1a1408' : '#0a0908',
    border:`1px solid ${earned ? '#c0932a50' : '#1a1710'}`,
    borderRadius:'12px', padding:'12px',
    opacity: earned ? 1 : 0.5, textAlign:'center',
    transition:'all 0.2s',
  }),
  achEmoji: (earned) => ({
    fontSize:'28px', marginBottom:'6px',
    filter: earned ? 'none' : 'grayscale(100%)',
  }),
  achName: (earned) => ({
    fontFamily:"'Cinzel',serif", fontSize:'11px', fontWeight:700,
    color: earned ? '#c0932a' : '#5a4a2a',
    marginBottom:'4px', lineHeight:1.3,
  }),
  achDesc: { fontSize:'10px', color:'#5a4a2a', lineHeight:1.4 },
  earnedBadge: {
    display:'inline-block', fontSize:'9px', color:'#4caf50',
    background:'#0d1a0d', border:'1px solid #2a5a2a',
    borderRadius:'10px', padding:'2px 6px', marginTop:'4px',
  },
  catTitle: {
    fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px',
    color:'#7a6a4a', textTransform:'uppercase',
    marginBottom:'10px', marginTop:'16px',
    borderBottom:'1px solid #1e1a12', paddingBottom:'6px',
  },
};

const CATEGORIES = [
  { id:'combat',  label:'⚔️ Souboj',     ids:['first_kill','veteran','champion','legend','dark_lord_slayer'] },
  { id:'char',    label:'🦸 Postava',     ids:['level5','level10','upgraded','wealthy','pacifist'] },
  { id:'pet',     label:'🐾 Peti',        ids:['first_pet','rare_pet','pet_survivor'] },
  { id:'explore', label:'🗺️ Průzkum',     ids:['zone3','zone5','safe_player','holy_pilgrim'] },
  { id:'multi',   label:'👥 Multiplayer', ids:['first_pvp','pvp_champion','thief','diplomat','trader'] },
  { id:'special', label:'✨ Speciální',   ids:['survivor','lucky','unlucky','night_owl','weather_warrior','full_health','mana_master'] },
];

export default function AchievementsScreen({ earned = [] }) {
  const { total, earned: earnedCount, percent } = getAchievementProgress({}, earned);

  return (
    <div style={LIST_S.wrap}>
      {/* Celkový progress */}
      <div style={LIST_S.progress}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', color:'#c0932a', fontWeight:700 }}>
          🏅 Achievementy
        </div>
        <div style={LIST_S.progressBar}>
          <div style={LIST_S.progressFill(percent)} />
        </div>
        <div style={{ fontSize:'13px', color:'#9a8a6a' }}>
          {earnedCount} z {total} odemčeno · {percent}%
        </div>
      </div>

      {/* Kategorie */}
      {CATEGORIES.map(cat => {
        const catAchs = ACHIEVEMENTS.filter(a => cat.ids.includes(a.id));
        return (
          <div key={cat.id}>
            <div style={LIST_S.catTitle}>{cat.label}</div>
            <div style={LIST_S.grid}>
              {catAchs.map(ach => {
                const isEarned = earned.includes(ach.id);
                return (
                  <div key={ach.id} style={LIST_S.achCard(isEarned)}>
                    <div style={LIST_S.achEmoji(isEarned)}>{ach.emoji}</div>
                    <div style={LIST_S.achName(isEarned)}>{ach.name}</div>
                    <div style={LIST_S.achDesc}>{ach.desc}</div>
                    {isEarned && <div style={LIST_S.earnedBadge}>✓ Odemčeno</div>}
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
