// src/components/PetDetail.jsx
// Detailní karta peta — statistiky, schopnost, level, propuštění

import { ref, set } from 'firebase/database';
import { db } from '../firebase';
import { addLog, updatePlayerStats } from '../game/gameState';
import { checkLevelUp } from '../game/progression';

const S = {
  wrap: { padding:'16px' },
  card: {
    background:'linear-gradient(135deg,#16140e,#1c1a12)',
    border:'1px solid #2a2418', borderRadius:'16px',
    padding:'20px', textAlign:'center', marginBottom:'14px',
  },
  emoji: { fontSize:'52px', marginBottom:'10px' },
  name: { fontFamily:"'Cinzel',serif", fontSize:'20px', fontWeight:900, color:'#c0932a', marginBottom:'4px' },
  type: { fontSize:'12px', color:'#7a6a4a', marginBottom:'14px' },
  statRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' },
  statBox: (color='#c0932a') => ({ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:'10px', padding:'10px 6px', textAlign:'center' }),
  statVal: { fontSize:'20px', fontWeight:700, color:'#e0d5c0' },
  statLbl: { fontSize:'10px', color:'#7a6a4a', marginTop:'2px' },
  abilityBox: { background:'#0d0b07', border:'1px solid #1e1a12', borderRadius:'10px', padding:'12px', marginBottom:'14px' },
  xpBar: { height:'6px', background:'#1e1a12', borderRadius:'3px', overflow:'hidden', marginTop:'6px' },
  lifeBar: { height:'8px', background:'#1e0a0a', borderRadius:'4px', overflow:'hidden', marginBottom:'6px' },
  btn: (color='#e05050') => ({
    width:'100%', padding:'13px', borderRadius:'11px',
    fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'13px',
    background:`linear-gradient(135deg,${color},${color}bb)`,
    color:'#0c0c0e', border:'none', cursor:'pointer', marginBottom:'8px',
  }),
  tipBox: { background:'#0d0d0f', border:'1px solid #1a1a1a', borderRadius:'10px', padding:'12px', fontSize:'12px', color:'#5a4a2a', lineHeight:1.7 },
  tameRep: (rep) => ({
    display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'11px',
    background: rep==='good'?'#0d1a0d': rep==='evil'?'#1a0d0d':'#0d0d1a',
    border:`1px solid ${rep==='good'?'#2a5a2a':rep==='evil'?'#5a2a2a':'#2a2a5a'}`,
    color: rep==='good'?'#4caf50':rep==='evil'?'#e05050':'#6060c0',
  }),
};

const PET_XP_TABLE = [0, 5, 12, 22, 35, 50];

export default function PetDetail({ session, player }) {
  const pet      = player?.pet;
  const { gameId, playerId } = session;

  if (!pet) return (
    <div style={S.wrap}>
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:'52px', marginBottom:'14px' }}>🐾</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'18px', color:'#7a6a4a', marginBottom:'12px' }}>
          Nemáš společníka
        </div>
        <div style={{ fontSize:'13px', color:'#5a4a2a', lineHeight:1.8 }}>
          Jak ochočit příšeru:<br /><br />
          <strong style={{ color:'#9a8a6a' }}>1.</strong> Potkej ochočitelnou příšeru v souboji<br />
          <strong style={{ color:'#9a8a6a' }}>2.</strong> Oslab ji na méně než 25% životů<br />
          <strong style={{ color:'#9a8a6a' }}>3.</strong> Klikni na <em>Ochočit</em> místo útoku<br />
          <strong style={{ color:'#9a8a6a' }}>4.</strong> Hod Dovednosti + Osud musí překonat práh<br /><br />
          Typ příšery závisí na tvé reputaci!
        </div>

        <div style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'8px', alignItems:'center' }}>
          {[
            { rep:'good',    label:'😇 Dobrá rep.',   examples:'🐺 Vlk · 🐻 Medvěd · 🦁 Gryf' },
            { rep:'neutral', label:'😐 Neutrální',     examples:'🐗 Kanec · 🐻‍❄️ Ledový medvěd' },
            { rep:'evil',    label:'😈 Zlá rep.',      examples:'🐍 Had · 🐊 Krokodýl · 🦂 Škorpión' },
          ].map(r => (
            <div key={r.rep} style={{ background:'#0d0b07', border:'1px solid #1e1a12', borderRadius:'10px', padding:'10px 16px', width:'100%', textAlign:'left' }}>
              <span style={S.tameRep(r.rep)}>{r.label}</span>
              <div style={{ fontSize:'12px', color:'#7a6a4a', marginTop:'6px' }}>{r.examples}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // XP bar
  const petLevel   = pet.level || 1;
  const petXp      = pet.xp    || 0;
  const xpNeeded   = PET_XP_TABLE[Math.min(petLevel, PET_XP_TABLE.length - 1)] || 50;
  const xpPrev     = PET_XP_TABLE[Math.min(petLevel - 1, PET_XP_TABLE.length - 1)] || 0;
  const xpPct      = petLevel >= 5 ? 100 : Math.min(100, ((petXp - xpPrev) / (xpNeeded - xpPrev)) * 100);
  const lifePct    = Math.max(0, (pet.life / pet.maxLife) * 100);

  const handleRelease = async () => {
    if (!window.confirm(`Opravdu propustit ${pet.name}? Tato akce je nevratná.`)) return;
    await set(ref(db, `games/${gameId}/players/${playerId}/pet`), null);
    await addLog(gameId, `${player.name} propustil ${pet.emoji} ${pet.name}. 🐾`, 'info');
  };

  return (
    <div style={S.wrap}>
      {/* Karta peta */}
      <div style={S.card}>
        <div style={S.emoji}>{pet.emoji}</div>
        <div style={S.name}>{pet.name}</div>
        <div style={S.type}>
          Level {petLevel} společník
          {pet.type && ` · ${pet.type}`}
        </div>

        {/* Životy */}
        <div style={{ textAlign:'left', marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#7a6a4a', marginBottom:'4px' }}>
            <span>❤️ Životy</span>
            <span>{pet.life}/{pet.maxLife}</span>
          </div>
          <div style={S.lifeBar}>
            <div style={{ height:'100%', borderRadius:'4px', width:`${lifePct}%`,
                           background: lifePct > 50 ? '#4caf50' : lifePct > 25 ? '#f0c040' : '#e05050',
                           transition:'width 0.3s' }} />
          </div>
        </div>

        {/* XP */}
        <div style={{ textAlign:'left', marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#5a4a2a', marginBottom:'3px' }}>
            <span>📜 Zkušenosti</span>
            <span>{petLevel < 5 ? `${petXp}/${xpNeeded} XP` : 'MAX'}</span>
          </div>
          <div style={S.xpBar}>
            <div style={{ height:'100%', width:`${xpPct}%`, background:'linear-gradient(90deg,#c0932a,#f0c040)', borderRadius:'3px' }} />
          </div>
        </div>

        {/* Statistiky */}
        <div style={S.statRow}>
          {[
            ['⚔️','Síla',   pet.str,  '#c0932a'],
            ['🏃','Pohyb',  pet.move, '#4caf50'],
            ['📜','Level',  petLevel, '#e8c840'],
          ].map(([e,l,v,c]) => (
            <div key={l} style={S.statBox(c)}>
              <div style={{ fontSize:'16px' }}>{e}</div>
              <div style={S.statVal}>{v}</div>
              <div style={S.statLbl}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schopnost */}
      <div style={S.abilityBox}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'3px', color:'#7a6a4a', textTransform:'uppercase', marginBottom:'8px' }}>
          Schopnost
        </div>
        <div style={{ fontSize:'14px', color:'#e0d5c0', lineHeight:1.6 }}>
          🐾 {pet.ability || 'Bojuje po boku svého pána.'}
        </div>
      </div>

      {/* Jak pet funguje v souboji */}
      <div style={S.tipBox}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'2px', color:'#7a6a4a', marginBottom:'8px' }}>
          JAK PET FUNGUJE
        </div>
        🎲 <strong style={{ color:'#c0932a' }}>Zapoj do útoku</strong> — přidá svou Sílu k tvému hodu<br />
        ⚡ <strong style={{ color:'#c0932a' }}>Samostatný útok</strong> — hodí vlastní hod proti nepříteli<br />
        💔 <strong style={{ color:'#e05050' }}>Zranění</strong> — pokud pet prohraje kolo, ztratí 1 ŽP<br />
        💀 <strong style={{ color:'#e05050' }}>Smrt peta</strong> — pokud dojdou životy, zmizí navždy<br />
        ⬆️ <strong style={{ color:'#4caf50' }}>Level up</strong> — pet roste s tebou (+XP za každý souboj)
      </div>

      {/* Nový pet */}
      <div style={{ ...S.tipBox, marginTop:'10px', border:'1px solid #2a2010', color:'#7a6a4a' }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', letterSpacing:'2px', color:'#7a6a4a', marginBottom:'8px' }}>
          VÝMĚNA SPOLEČNÍKA
        </div>
        Chceš nového peta? Propusť tohoto a v příštím vhodném souboji ochočuj znovu.<br /><br />
        <strong style={{ color:'#c06060' }}>⚠️</strong> Propuštění je nevratné!
      </div>

      {/* Propuštění */}
      <div style={{ marginTop:'14px' }}>
        <button style={S.btn('#e05050')} onClick={handleRelease}>
          Propustit {pet.emoji} {pet.name}
        </button>
      </div>
    </div>
  );
}
