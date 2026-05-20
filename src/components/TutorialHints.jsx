// src/components/TutorialHints.jsx
// Nápověda a tutoriál pro nové hráče

import { useState } from 'react';

const HINTS = {
  roll: {
    title: '🎲 Hod kostkou',
    steps: [
      'Klikni na "Hodit kostkou" — přesune tě na novou lokaci.',
      'Počasí a denní doba ovlivní tvůj pohyb (déšť = −1, ráno = +1).',
      'Po hodu vždy táhni kartu setkání.',
    ],
  },
  combat: {
    title: '⚔️ Souboj',
    steps: [
      'Ty hodíš 1k6 + Síla. Nepřítel hodí 1k6 + jeho Síla.',
      'Vyšší výsledek vyhraje kolo. Remíza = nikdo neztrácí životy.',
      'Souboj trvá, dokud nepřítel nespadne na 0 ŽP.',
      'Používej schopnosti pro bonus — stojí Manu.',
      'Pet přidá svou Sílu nebo může útočit samostatně.',
    ],
  },
  tame: {
    title: '🐾 Ochočení',
    steps: [
      'Oslab příšeru na méně než 25% životů.',
      'Poté se zobrazí tlačítko "Ochočit".',
      'Hod Dovednosti + Osud musí překonat práh příšery.',
      'Dobrá reputace = příroda; Zlá = temné příšery.',
      'Máš-li peta, musíš ho nejdřív propustit.',
    ],
  },
  upgrade: {
    title: '⬆️ Upgrade třídy',
    steps: [
      'Na levelu 5 se odemknou 2 upgrady pro tvou třídu.',
      'Každá cesta má jiné podmínky (reputace, trofeje, zóna).',
      'Upgrade je nevratný — zvol moudře!',
      'Dostaneš 4 nové schopnosti a silnější statistiky.',
    ],
  },
  multiplayer: {
    title: '👥 Multiplayer',
    steps: [
      'Tablet = hrací deska. Telefon = karta postavy.',
      'Na začátku hry hlasujte: Coop nebo PvP.',
      'Coop: všichni proti Pánu Zla, sdílíte kořist.',
      'PvP: můžeš napadnout hráče na stejném poli.',
      'Chat je v záložce 💬 na tvém telefonu.',
    ],
  },
  zones: {
    title: '🗺️ Zóny',
    steps: [
      'Zóna 1: Klidná krajina — slabé příšery, bezpečná místa.',
      'Zóna 2: Pohraniční království — trolové, kostlivci.',
      'Zóna 3+: Pro zkušené hrdiny. Vyžaduje level a trofeje.',
      'Zóna 5: Citadela Pana Zla — finální boss.',
    ],
  },
};

const S = {
  overlay: {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
    zIndex:150, display:'flex', justifyContent:'center', alignItems:'center',
    fontFamily:"'Crimson Text',Georgia,serif",
  },
  panel: {
    background:'linear-gradient(135deg,#1a1810,#16140e)',
    border:'1px solid #2a2418', borderRadius:'16px',
    padding:'24px', maxWidth:'400px', width:'100%', margin:'20px',
  },
  title: {
    fontFamily:"'Cinzel',serif", fontSize:'16px', fontWeight:700,
    color:'#c0932a', marginBottom:'16px',
    display:'flex', justifyContent:'space-between',
  },
  step: {
    display:'flex', gap:'10px', alignItems:'flex-start',
    padding:'8px 0', borderBottom:'1px solid #0f0f0f',
  },
  stepNum: {
    fontFamily:"'Cinzel',serif", fontSize:'11px', color:'#c0932a',
    fontWeight:700, minWidth:'18px', marginTop:'2px',
  },
  stepText: { fontSize:'14px', color:'#d0c5a0', lineHeight:1.6 },
  nav: {
    display:'flex', gap:'8px', marginTop:'16px', justifyContent:'space-between',
  },
  btn: (primary) => ({
    padding:'10px 18px', borderRadius:'9px', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'12px',
    background: primary ? 'linear-gradient(135deg,#c0932a,#a07820)' : '#0d0b07',
    color: primary ? '#0c0c0e' : '#7a6a4a',
    border: primary ? 'none' : '1px solid #2a2418',
    flex: primary ? 1 : 'auto',
  }),
  topicRow: {
    display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px',
  },
  topicBtn: (active) => ({
    padding:'6px 12px', borderRadius:'20px', cursor:'pointer',
    fontSize:'12px', fontFamily:"'Cinzel',serif",
    background: active ? '#c0932a20' : '#0d0b07',
    border:`1px solid ${active ? '#c0932a50' : '#2a2418'}`,
    color: active ? '#c0932a' : '#5a4a2a',
  }),
};

export default function TutorialHints({ onClose }) {
  const [topic, setTopic] = useState('roll');
  const hint = HINTS[topic];

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.panel}>
        <div style={S.title}>
          📖 Nápověda
          <button style={{ background:'none', border:'none', color:'#7a6a4a',
                            fontSize:'20px', cursor:'pointer' }} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={S.topicRow}>
          {Object.entries(HINTS).map(([key, h]) => (
            <button key={key} style={S.topicBtn(topic === key)}
                    onClick={() => setTopic(key)}>
              {h.title.split(' ')[0]} {key === 'roll' ? 'Pohyb' : key === 'combat' ? 'Boj' :
                key === 'tame' ? 'Pet' : key === 'upgrade' ? 'Upgrade' :
                key === 'multiplayer' ? 'Multi' : 'Zóny'}
            </button>
          ))}
        </div>

        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'13px',
                       color:'#c0932a', fontWeight:700, marginBottom:'12px' }}>
          {hint.title}
        </div>

        {hint.steps.map((step, i) => (
          <div key={i} style={S.step}>
            <div style={S.stepNum}>{i + 1}.</div>
            <div style={S.stepText}>{step}</div>
          </div>
        ))}

        <div style={S.nav}>
          <button style={S.btn(false)} onClick={onClose}>Zavřít</button>
          <button style={S.btn(true)} onClick={onClose}>Jasné, hraju!</button>
        </div>
      </div>
    </div>
  );
}
