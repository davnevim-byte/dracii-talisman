// src/components/SettingsPanel.jsx
// Nastavení hry — zvuk, kostka, vzhled

import { useState, useEffect } from 'react';
import { setVolume, toggleSfx, isSfxEnabled, play } from '../game/soundEngine';

const STORAGE_KEY = 'draci_talisman_settings';

function loadSettings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export const DEFAULT_SETTINGS = {
  sfxEnabled:    true,
  volume:        0.7,
  diceMode:      'virtual',   // virtual | physical
  fontSize:      'normal',    // small | normal | large
  darkMode:      true,
  showNarrator:  true,
  showHints:     true,
  animationsOn:  true,
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = loadSettings();
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    saveSettings(settings);
    toggleSfx(settings.sfxEnabled);
    setVolume(settings.volume);
  }, [settings]);

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  return { settings, update };
}

// ── Komponenta ─────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
    zIndex:100, display:'flex', justifyContent:'center', alignItems:'center',
    fontFamily:"'Crimson Text',Georgia,serif",
  },
  panel: {
    background:'linear-gradient(135deg,#1a1810,#16140e)',
    border:'1px solid #2a2418', borderRadius:'18px',
    padding:'24px', width:'100%', maxWidth:'420px',
    maxHeight:'90vh', overflowY:'auto', margin:'20px',
  },
  title: {
    fontFamily:"'Cinzel',serif", fontSize:'18px', fontWeight:900,
    color:'#c0932a', letterSpacing:'2px', marginBottom:'20px',
    display:'flex', justifyContent:'space-between', alignItems:'center',
  },
  closeBtn: {
    background:'none', border:'none', color:'#7a6a4a',
    fontSize:'20px', cursor:'pointer', padding:'0',
  },
  section: { marginBottom:'20px' },
  sectionTitle: {
    fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px',
    color:'#7a6a4a', textTransform:'uppercase',
    marginBottom:'12px', borderBottom:'1px solid #1e1a12', paddingBottom:'6px',
  },
  row: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    marginBottom:'12px', gap:'12px',
  },
  label: { fontSize:'14px', color:'#d0c5a0', flex:1 },
  sublabel: { fontSize:'11px', color:'#7a6a4a', marginTop:'2px' },
  toggle: (on) => ({
    width:'44px', height:'24px', borderRadius:'12px', cursor:'pointer',
    background: on ? '#c0932a' : '#2a2418', border:'none',
    position:'relative', transition:'background 0.25s', flexShrink:0,
  }),
  toggleDot: (on) => ({
    position:'absolute', top:'3px',
    left: on ? '22px' : '3px',
    width:'18px', height:'18px', borderRadius:'50%',
    background:'#fff', transition:'left 0.25s',
  }),
  slider: {
    width:'100%', accentColor:'#c0932a',
    background:'transparent', cursor:'pointer',
  },
  optionGroup: { display:'flex', gap:'8px', flexWrap:'wrap' },
  optionBtn: (active) => ({
    padding:'8px 16px', borderRadius:'8px', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:600,
    background: active ? '#c0932a20' : '#0d0b07',
    border:`1px solid ${active ? '#c0932a60' : '#2a2418'}`,
    color: active ? '#c0932a' : '#7a6a4a',
    transition:'all 0.2s',
  }),
  testBtn: {
    padding:'8px 16px', borderRadius:'8px', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:'11px', fontWeight:600,
    background:'#0d0b07', border:'1px solid #2a2418', color:'#7a6a4a',
  },
  versionTag: {
    textAlign:'center', fontSize:'11px', color:'#3a3020',
    marginTop:'16px', letterSpacing:'1px',
  },
};

function Toggle({ on, onChange }) {
  return (
    <button style={S.toggle(on)} onClick={() => onChange(!on)}>
      <div style={S.toggleDot(on)} />
    </button>
  );
}

export default function SettingsPanel({ settings, onUpdate, onClose }) {
  const testSound = (name) => { play(name); };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.panel}>
        <div style={S.title}>
          ⚙️ Nastavení
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Zvuk */}
        <div style={S.section}>
          <div style={S.sectionTitle}>🔊 Zvuk</div>

          <div style={S.row}>
            <div>
              <div style={S.label}>Zvukové efekty</div>
              <div style={S.sublabel}>Kostky, souboje, level-up</div>
            </div>
            <Toggle on={settings.sfxEnabled} onChange={v => onUpdate('sfxEnabled', v)} />
          </div>

          {settings.sfxEnabled && (
            <>
              <div style={S.row}>
                <div style={S.label}>Hlasitost</div>
                <input type="range" min="0" max="1" step="0.05"
                  value={settings.volume}
                  onChange={e => onUpdate('volume', parseFloat(e.target.value))}
                  style={{ ...S.slider, width:'120px' }} />
              </div>

              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                <button style={S.testBtn} onClick={() => testSound('dice')}>🎲 Kostka</button>
                <button style={S.testBtn} onClick={() => testSound('win')}>⚔️ Výhra</button>
                <button style={S.testBtn} onClick={() => testSound('levelUp')}>⬆️ Level</button>
                <button style={S.testBtn} onClick={() => testSound('gold')}>🪙 Zlato</button>
                <button style={S.testBtn} onClick={() => testSound('magic')}>🔮 Magie</button>
              </div>
            </>
          )}
        </div>

        {/* Kostka */}
        <div style={S.section}>
          <div style={S.sectionTitle}>🎲 Kostka</div>
          <div style={S.row}>
            <div>
              <div style={S.label}>Typ kostky</div>
              <div style={S.sublabel}>Virtuální = kliknutí, Fyzická = zadáš číslo</div>
            </div>
          </div>
          <div style={S.optionGroup}>
            {[
              { id:'virtual',  label:'🎲 Virtuální' },
              { id:'physical', label:'🎯 Fyzická' },
            ].map(o => (
              <button key={o.id} style={S.optionBtn(settings.diceMode === o.id)}
                      onClick={() => onUpdate('diceMode', o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zobrazení */}
        <div style={S.section}>
          <div style={S.sectionTitle}>🖥️ Zobrazení</div>

          <div style={S.row}>
            <div>
              <div style={S.label}>AI Vypravěč</div>
              <div style={S.sublabel}>Příběhové popisy lokací a soubojů</div>
            </div>
            <Toggle on={settings.showNarrator} onChange={v => onUpdate('showNarrator', v)} />
          </div>

          <div style={S.row}>
            <div>
              <div style={S.label}>Herní nápovědy</div>
              <div style={S.sublabel}>Tipy pro nové hráče</div>
            </div>
            <Toggle on={settings.showHints} onChange={v => onUpdate('showHints', v)} />
          </div>

          <div style={S.row}>
            <div>
              <div style={S.label}>Animace</div>
              <div style={S.sublabel}>Přechody a efekty (vypni na slabším hw)</div>
            </div>
            <Toggle on={settings.animationsOn} onChange={v => onUpdate('animationsOn', v)} />
          </div>

          <div style={{ marginTop:'10px' }}>
            <div style={{ ...S.label, marginBottom:'8px' }}>Velikost písma</div>
            <div style={S.optionGroup}>
              {[
                { id:'small',  label:'Malé' },
                { id:'normal', label:'Normální' },
                { id:'large',  label:'Velké' },
              ].map(o => (
                <button key={o.id} style={S.optionBtn(settings.fontSize === o.id)}
                        onClick={() => onUpdate('fontSize', o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={S.versionTag}>
          ⚔️ Dračí Talisman · Fáze 7 · zdarma pro všechny
        </div>
      </div>
    </div>
  );
}
