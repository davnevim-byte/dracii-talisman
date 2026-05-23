// src/screens/LobbyScreen.jsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CHARACTERS, FACTIONS } from '../data/characters';
import { createGame, joinGame, generatePlayerId } from '../game/gameState';

// ── Styly ─────────────────────────────────────────────────────────────────────
const S = {
  bg: {
    minHeight:'100vh',
    background:'radial-gradient(ellipse at 50% 0%, #1a1208 0%, #0c0c0e 70%)',
    display:'flex', flexDirection:'column', alignItems:'center',
    padding:'20px', fontFamily:"'Crimson Text',Georgia,serif",
  },
  logo: {
    marginTop:'40px', marginBottom:'8px', fontSize:'52px', textAlign:'center',
  },
  title: {
    fontFamily:"'Cinzel',serif", fontSize:'clamp(26px,5vw,44px)', fontWeight:900,
    color:'#c0932a', textShadow:'0 0 40px #c0932a44', letterSpacing:'3px',
    textAlign:'center', marginBottom:'6px',
  },
  subtitle: {
    color:'#5a4a2a', fontSize:'13px', letterSpacing:'4px',
    textTransform:'uppercase', textAlign:'center', marginBottom:'32px',
  },
  card: {
    background:'linear-gradient(135deg,#16140e,#1a1810)',
    border:'1px solid #2a2418', borderRadius:'16px',
    padding:'28px', width:'100%', maxWidth:'500px', marginBottom:'16px',
  },
  sectionTitle: {
    fontFamily:"'Cinzel',serif", fontSize:'12px', letterSpacing:'3px',
    color:'#7a6a4a', textTransform:'uppercase',
    marginBottom:'14px', borderBottom:'1px solid #1e1a12', paddingBottom:'8px',
  },
  btn: (variant='primary', disabled=false) => ({
    padding:'14px 28px', borderRadius:'12px', cursor:disabled?'not-allowed':'pointer',
    fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'14px',
    letterSpacing:'1px', border:'none', width:'100%', marginBottom:'10px',
    background: disabled ? '#1a1810' :
      variant==='primary' ? 'linear-gradient(135deg,#c0932a,#a07820)' :
      variant==='danger'  ? 'linear-gradient(135deg,#8b2020,#6b1010)' : '#141210',
    color: disabled ? '#3a3020' : variant==='ghost' ? '#c0932a' : '#0c0c0e',
    border: variant==='ghost' ? '1px solid #2a2418' : 'none',
    opacity: disabled ? 0.6 : 1,
    transition:'all 0.2s',
  }),
  input: {
    width:'100%', padding:'12px 16px', boxSizing:'border-box',
    background:'#0d0b07', border:'1px solid #2a2418', borderRadius:'10px',
    color:'#e0d5c0', fontSize:'16px', fontFamily:"'Crimson Text',serif",
    outline:'none', marginBottom:'12px',
  },
  charGrid: {
    display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'10px',
  },
  charCard: (selected, color) => ({
    background: selected ? `${color}18` : '#0d0b07',
    border:`2px solid ${selected ? color : '#1e1a12'}`,
    borderRadius:'12px', padding:'14px 8px', cursor:'pointer',
    textAlign:'center', transition:'all 0.2s',
    boxShadow: selected ? `0 0 20px ${color}35` : 'none',
  }),
  modeBtn: (selected) => ({
    flex:1, padding:'16px', borderRadius:'10px', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:'13px', fontWeight:600,
    background: selected ? '#c0932a20' : '#0d0b07',
    border:`2px solid ${selected ? '#c0932a' : '#2a2418'}`,
    color: selected ? '#c0932a' : '#6a5a3a',
    transition:'all 0.2s', textAlign:'center',
  }),
  error: {
    background:'#3a100a', border:'1px solid #5a2018',
    borderRadius:'8px', padding:'10px 14px', color:'#e07060',
    fontSize:'14px', marginBottom:'12px',
  },
  qrWrap: {
    background:'#fff', borderRadius:'14px', padding:'16px',
    display:'flex', justifyContent:'center', marginBottom:'16px',
  },
  codeDisplay: {
    fontFamily:"'Cinzel',serif", fontSize:'42px', fontWeight:900,
    color:'#c0932a', letterSpacing:'12px', textAlign:'center',
    padding:'18px', background:'#0d0b07', borderRadius:'12px',
    border:'1px solid #2a2418', marginBottom:'12px',
  },
};

function CharacterSelect({ selected, onSelect }) {
  return (
    <div>
      <div style={S.sectionTitle}>Vyber postavu</div>
      <div style={S.charGrid}>
        {CHARACTERS.map(c => (
          <div key={c.id} style={S.charCard(selected?.id===c.id, c.color)}
               onClick={() => onSelect(c)}>
            <div style={{ fontSize:'30px' }}>{c.emoji}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'12px',
                          color:c.color, fontWeight:700, margin:'5px 0 3px' }}>{c.name}</div>
            <div style={{ fontSize:'11px', color:'#5a4a2a', marginBottom:'8px', minHeight:'30px', lineHeight:1.3 }}>{c.desc}</div>
            <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', justifyContent:'center', fontSize:'11px' }}>
              <span style={{ color:'#c0932a' }}>⚔️{c.stats.str}</span>
              <span style={{ color:'#5b8dd9' }}>🔮{c.stats.skill}</span>
              <span style={{ color:'#e05050' }}>❤️{c.stats.life}</span>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop:'14px', padding:'14px', background:'#0d0b07',
                      borderRadius:'10px', border:`1px solid ${selected.color}30` }}>
          <div style={{ color:selected.color, fontFamily:"'Cinzel',serif",
                        fontSize:'14px', fontWeight:700, marginBottom:'6px' }}>
            {selected.emoji} {selected.name} · {FACTIONS[selected.faction]?.emoji} {selected.faction}
          </div>
          <div style={{ fontSize:'13px', color:'#9a8a6a', lineHeight:1.6 }}>{selected.description}</div>
        </div>
      )}
    </div>
  );
}

// ── PC/TABLET: Vytvoření hry ──────────────────────────────────────────────────
function CreateBoard({ onCreated }) {
  const [mode,    setMode]    = useState('coop');
  const [loading, setLoading] = useState(false);
  const [gameId,  setGameId]  = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const hostId = 'board_' + Math.random().toString(36).slice(2, 8);
      const id     = await createGame(hostId, 'Hrací deska', null, mode);
      setGameId(id);
      onCreated({ gameId: id, playerId: hostId, isHost: true, isBoard: true });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ width:'100%', maxWidth:'500px' }}>
      <div style={S.card}>
        <div style={S.sectionTitle}>Herní mód</div>
        <div style={{ display:'flex', gap:'12px', marginBottom:'8px' }}>
          <div style={S.modeBtn(mode==='coop')} onClick={() => setMode('coop')}>
            <div style={{ fontSize:'28px', marginBottom:'6px' }}>🤝</div>
            <div style={{ fontWeight:700 }}>Coop</div>
            <div style={{ fontSize:'11px', color:'#5a4a2a', marginTop:'4px' }}>Společně proti Pánu Zla</div>
          </div>
          <div style={S.modeBtn(mode==='pvp')} onClick={() => setMode('pvp')}>
            <div style={{ fontSize:'28px', marginBottom:'6px' }}>⚔️</div>
            <div style={{ fontWeight:700 }}>PvP</div>
            <div style={{ fontSize:'11px', color:'#5a4a2a', marginTop:'4px' }}>Všichni proti všem</div>
          </div>
        </div>
      </div>
      <button style={S.btn('primary', loading)} onClick={handleCreate}>
        {loading ? 'Vytváření hry...' : '⚔️ Vytvořit hru'}
      </button>
    </div>
  );
}

// ── TELEFON: Připojení ke hře ─────────────────────────────────────────────────
function JoinPhone({ onJoined }) {
  const [step,    setStep]    = useState('code'); // code | character
  const [code,    setCode]    = useState(window._autoJoinCode || '');
  const [name,    setName]    = useState('');
  const [char,    setChar]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleJoin = async () => {
    if (!name.trim()) { setError('Zadej své jméno.'); return; }
    if (!char)        { setError('Vyber postavu.'); return; }
    if (!code.trim()) { setError('Zadej kód hry.'); return; }
    setLoading(true); setError('');
    try {
      const playerId = generatePlayerId();
      await joinGame(code.toUpperCase().trim(), playerId, name.trim(), char);
      onJoined({ gameId: code.toUpperCase().trim(), playerId, isHost: false, character: char, playerName: name.trim(), isBoard: false });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ width:'100%', maxWidth:'500px' }}>
      {/* Kód */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Kód hry</div>
        <input style={{ ...S.input, fontSize:'28px', textAlign:'center',
                        textTransform:'uppercase', letterSpacing:'8px' }}
               placeholder="ABC123" value={code}
               onChange={e => setCode(e.target.value.toUpperCase().slice(0,6))} />
      </div>

      {/* Jméno */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Tvoje jméno</div>
        <input style={S.input} placeholder="Jak ti říkají..."
               value={name} onChange={e => setName(e.target.value)} />
      </div>

      {/* Postava */}
      <div style={S.card}>
        <CharacterSelect selected={char} onSelect={setChar} />
      </div>

      {error && <div style={S.error}>{error}</div>}
      <button style={S.btn('primary', loading || !code || !name || !char)} onClick={handleJoin}>
        {loading ? 'Připojování...' : '🚪 Vstoupit do hry'}
      </button>
    </div>
  );
}

// ── HLAVNÍ LOBBY ──────────────────────────────────────────────────────────────
export default function LobbyScreen({ onGameJoined, isBoard }) {
  return (
    <div style={S.bg}>
      <div style={S.logo}>{isBoard ? '🗺️' : '⚔️'}</div>
      <div style={S.title}>Dračí Talisman</div>
      <div style={S.subtitle}>{isBoard ? 'Hrací deska' : 'Karta hráče'}</div>

      {isBoard ? (
        // PC/TABLET — jen vytvoření hry
        <div style={{ width:'100%', maxWidth:'500px', textAlign:'center' }}>
          <div style={{ ...S.card, textAlign:'left' }}>
            <div style={{ color:'#9a8a6a', fontSize:'15px', lineHeight:1.7, marginBottom:'16px' }}>
              Tato obrazovka je <strong style={{ color:'#c0932a' }}>hrací deska</strong>.<br />
              Hráči se připojí přes QR kód na svých telefonech.
            </div>
            <div style={{ display:'flex', gap:'12px', fontSize:'13px', color:'#5a4a2a' }}>
              <span>📱 Telefon = karta hráče</span>
              <span>🗺️ Tablet/PC = mapa</span>
            </div>
          </div>
          <CreateBoard onCreated={onGameJoined} />
        </div>
      ) : (
        // TELEFON — připojení + výběr postavy
        <JoinPhone onJoined={onGameJoined} />
      )}
    </div>
  );
}
