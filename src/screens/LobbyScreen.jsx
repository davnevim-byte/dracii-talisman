// src/screens/LobbyScreen.jsx
import { useState } from 'react';
import { CHARACTERS, FACTIONS } from '../data/characters';
import { createGame, joinGame, generatePlayerId } from '../game/gameState';

const S = {
  bg: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 0%, #1a1208 0%, #0c0c0e 70%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px', fontFamily: "'Crimson Text', Georgia, serif",
  },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(28px,6vw,52px)',
    fontWeight: 900, color: '#c0932a',
    textShadow: '0 0 40px #c0932a55, 0 2px 4px #000',
    letterSpacing: '3px', textAlign: 'center', marginBottom: '4px',
  },
  subtitle: {
    color: '#7a6a4a', fontSize: '13px', letterSpacing: '4px',
    textTransform: 'uppercase', textAlign: 'center', marginBottom: '32px',
  },
  card: {
    background: 'linear-gradient(135deg, #16140e 0%, #1a1810 100%)',
    border: '1px solid #2a2418', borderRadius: '16px',
    padding: '28px', width: '100%', maxWidth: '520px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '13px', letterSpacing: '3px',
    color: '#7a6a4a', textTransform: 'uppercase', marginBottom: '16px',
    borderBottom: '1px solid #1e1a12', paddingBottom: '8px',
  },
  input: {
    width: '100%', padding: '12px 16px',
    background: '#0d0b07', border: '1px solid #2a2418', borderRadius: '10px',
    color: '#e0d5c0', fontSize: '16px', fontFamily: "'Crimson Text', serif",
    outline: 'none', marginBottom: '12px',
  },
  btn: (variant = 'primary') => ({
    padding: '13px 24px', borderRadius: '10px', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '14px',
    letterSpacing: '1px', border: 'none', width: '100%',
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #c0932a, #a07820)'
      : variant === 'ghost'
      ? 'transparent'
      : '#1a1810',
    color: variant === 'primary' ? '#0c0c0e' : '#c0932a',
    border: variant === 'ghost' ? '1px solid #2a2418' : 'none',
    marginBottom: '10px',
  }),
  charGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))',
    gap: '10px',
  },
  charCard: (selected, color) => ({
    background: selected ? `${color}15` : '#0d0b07',
    border: `1px solid ${selected ? color : '#1e1a12'}`,
    borderRadius: '12px', padding: '14px 8px', cursor: 'pointer',
    textAlign: 'center', transition: 'all 0.2s',
    boxShadow: selected ? `0 0 20px ${color}30` : 'none',
  }),
  modeBtn: (selected) => ({
    flex: 1, padding: '14px', borderRadius: '10px', cursor: 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 600,
    background: selected ? '#c0932a20' : '#0d0b07',
    border: `1px solid ${selected ? '#c0932a' : '#2a2418'}`,
    color: selected ? '#c0932a' : '#6a5a3a',
    transition: 'all 0.2s', textAlign: 'center',
  }),
  error: {
    background: '#3a100a', border: '1px solid #5a2018',
    borderRadius: '8px', padding: '10px 14px', color: '#e07060',
    fontSize: '14px', marginBottom: '12px',
  },
  statRow: {
    display: 'flex', gap: '6px', flexWrap: 'wrap',
    justifyContent: 'center', marginTop: '8px',
  },
  statPill: (color) => ({
    background: `${color}20`, border: `1px solid ${color}40`,
    borderRadius: '20px', padding: '2px 8px', fontSize: '11px', color,
  }),
};

// ── Výběr postavy ─────────────────────────────────────────────────────────────
function CharacterSelect({ selected, onSelect }) {
  return (
    <div>
      <div style={S.sectionTitle}>Vyber postavu</div>
      <div style={S.charGrid}>
        {CHARACTERS.map(c => (
          <div key={c.id} style={S.charCard(selected?.id === c.id, c.color)}
               onClick={() => onSelect(c)}>
            <div style={{ fontSize: '28px' }}>{c.emoji}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '11px',
                          color: c.color, fontWeight: 700, margin: '4px 0 2px' }}>
              {c.name}
            </div>
            <div style={{ fontSize: '11px', color: '#5a4a2a', lineHeight: 1.3 }}>
              {FACTIONS[c.faction]?.emoji} {c.faction}
            </div>
            <div style={S.statRow}>
              <span style={S.statPill('#c0932a')}>⚔️{c.stats.str}</span>
              <span style={S.statPill('#5b8dd9')}>🔮{c.stats.skill}</span>
              <span style={S.statPill('#e05050')}>❤️{c.stats.life}</span>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop: '16px', padding: '14px',
                      background: '#0d0b07', borderRadius: '10px',
                      border: `1px solid ${selected.color}30` }}>
          <div style={{ color: selected.color, fontFamily: "'Cinzel',serif",
                        fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
            {selected.emoji} {selected.name}
          </div>
          <div style={{ fontSize: '14px', color: '#9a8a6a', lineHeight: 1.5 }}>
            {selected.description}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selected.abilities.map(a => (
              <span key={a.id} style={{ ...S.statPill(selected.color), fontSize: '12px', padding: '3px 10px' }}>
                {a.type === 'active' ? '⚡' : '🔒'} {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hlavní Lobby ──────────────────────────────────────────────────────────────
export default function LobbyScreen({ onGameJoined, isBoard }) {
  const [view,      setView]      = useState('home');   // home|create|join
  const [name,      setName]      = useState('');
  const [char,      setChar]      = useState(null);
  const [gameCode,  setGameCode]  = useState('');
  const [mode,      setMode]      = useState('coop');   // coop|pvp
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const validate = () => {
    if (!name.trim())  { setError('Zadej své jméno.'); return false; }
    if (!char)         { setError('Vyber postavu.'); return false; }
    setError('');
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const playerId = generatePlayerId();
      const gameId   = await createGame(playerId, name.trim(), char);
      onGameJoined({ gameId, playerId, isHost: true, character: char, playerName: name.trim() });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!validate()) return;
    if (!gameCode.trim()) { setError('Zadej kód hry.'); return; }
    setLoading(true);
    try {
      const playerId = generatePlayerId();
      await joinGame(gameCode.toUpperCase().trim(), playerId, name.trim(), char);
      onGameJoined({ gameId: gameCode.toUpperCase().trim(), playerId, isHost: false, character: char, playerName: name.trim() });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Domovská obrazovka ────────────────────────────────────────────────────
  if (view === 'home') return (
    <div style={S.bg}>
      <div style={{ marginTop: '40px', marginBottom: '8px', fontSize: '48px' }}>⚔️</div>
      <div style={S.title}>Dračí Talisman</div>
      <div style={S.subtitle}>Místní multiplayer RPG</div>

      <div style={S.card}>
        <div style={{ color: '#9a8a6a', fontSize: '15px', lineHeight: 1.7,
                      textAlign: 'center', marginBottom: '24px' }}>
          Vydejte se na společné dobrodružství.<br />
          Jeden tablet jako hrací deska, telefony jako karty postav.
        </div>

        {isBoard ? (
          <>
            <button style={S.btn('primary')} onClick={() => setView('create')}>
              Vytvořit hru (Hostitel)
            </button>
            <button style={S.btn('ghost')} onClick={() => setView('join')}>
              Připojit se ke hře
            </button>
          </>
        ) : (
          <>
            <button style={S.btn('primary')} onClick={() => setView('join')}>
              Připojit se ke hře
            </button>
            <button style={S.btn('ghost')} onClick={() => setView('create')}>
              Vytvořit hru (Hostitel)
            </button>
          </>
        )}
      </div>

      <div style={{ color: '#3a3020', fontSize: '12px', textAlign: 'center' }}>
        Hra běží přes Firebase — potřebuješ WiFi připojení
      </div>
    </div>
  );

  // ── Vytvoření hry ─────────────────────────────────────────────────────────
  if (view === 'create') return (
    <div style={S.bg}>
      <div style={{ ...S.title, fontSize: 'clamp(20px,4vw,32px)', marginTop: '24px' }}>
        Vytvořit hru
      </div>
      <div style={S.subtitle}>Hostitel hry</div>

      <div style={S.card}>
        <div style={S.sectionTitle}>Tvoje jméno</div>
        <input style={S.input} placeholder="Jak ti říkají..."
               value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div style={{ ...S.card, maxWidth: '520px', width: '100%' }}>
        <CharacterSelect selected={char} onSelect={setChar} />
      </div>

      <div style={S.card}>
        <div style={S.sectionTitle}>Herní mód</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={S.modeBtn(mode === 'coop')} onClick={() => setMode('coop')}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🤝</div>
            <div>Coop</div>
            <div style={{ fontSize: '11px', color: '#5a4a2a', marginTop: '4px' }}>
              Společný cíl
            </div>
          </div>
          <div style={S.modeBtn(mode === 'pvp')} onClick={() => setMode('pvp')}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>⚔️</div>
            <div>PvP</div>
            <div style={{ fontSize: '11px', color: '#5a4a2a', marginTop: '4px' }}>
              Všichni proti všem
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        {error && <div style={S.error}>{error}</div>}
        <button style={S.btn('primary')} onClick={handleCreate} disabled={loading}>
          {loading ? 'Vytváření...' : '⚔️ Vytvořit hru'}
        </button>
        <button style={S.btn('ghost')} onClick={() => setView('home')}>
          ← Zpět
        </button>
      </div>
    </div>
  );

  // ── Připojení ke hře ──────────────────────────────────────────────────────
  if (view === 'join') return (
    <div style={S.bg}>
      <div style={{ ...S.title, fontSize: 'clamp(20px,4vw,32px)', marginTop: '24px' }}>
        Připojit se
      </div>
      <div style={S.subtitle}>Zadej kód nebo naskenuj QR</div>

      <div style={S.card}>
        <div style={S.sectionTitle}>Kód hry</div>
        <input style={{ ...S.input, fontSize: '24px', textAlign: 'center',
                        textTransform: 'uppercase', letterSpacing: '6px' }}
               placeholder="ABC123"
               value={gameCode}
               onChange={e => setGameCode(e.target.value.toUpperCase().slice(0, 6))} />
        <div style={S.sectionTitle}>Tvoje jméno</div>
        <input style={S.input} placeholder="Jak ti říkají..."
               value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div style={{ ...S.card, maxWidth: '520px', width: '100%' }}>
        <CharacterSelect selected={char} onSelect={setChar} />
      </div>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        {error && <div style={S.error}>{error}</div>}
        <button style={S.btn('primary')} onClick={handleJoin} disabled={loading}>
          {loading ? 'Připojování...' : '🚪 Vstoupit do hry'}
        </button>
        <button style={S.btn('ghost')} onClick={() => setView('home')}>
          ← Zpět
        </button>
      </div>
    </div>
  );
}
