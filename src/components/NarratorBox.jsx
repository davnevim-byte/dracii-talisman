// src/components/NarratorBox.jsx
// Zobrazuje text AI vypravěče na hrací desce

import { useState, useEffect, useRef } from 'react';

const S = {
  wrap: {
    background: 'linear-gradient(135deg, #1a1208, #12100a)',
    border: '1px solid #c0932a30',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '14px',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute', top: 0, left: '-100%',
    width: '60%', height: '100%',
    background: 'linear-gradient(90deg, transparent, #c0932a08, transparent)',
    animation: 'shimmer 2s infinite',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '10px',
  },
  headerTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '11px',
    letterSpacing: '3px', color: '#7a6a4a',
    textTransform: 'uppercase',
  },
  dot: (active) => ({
    width: '6px', height: '6px', borderRadius: '50%',
    background: active ? '#c0932a' : '#3a3020',
    transition: 'background 0.3s',
    animation: active ? 'pulse 1.5s infinite' : 'none',
  }),
  text: {
    fontFamily: "'Crimson Text', Georgia, serif",
    fontSize: '15px', lineHeight: 1.7,
    color: '#d0c5a0', fontStyle: 'italic',
    minHeight: '42px',
  },
  loading: {
    display: 'flex', gap: '4px', alignItems: 'center',
    padding: '4px 0',
  },
  loadDot: (i) => ({
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#c0932a60',
    animation: `bounce 1.2s ${i * 0.2}s infinite`,
  }),
  history: {
    marginTop: '12px', paddingTop: '10px',
    borderTop: '1px solid #1e1a12',
    maxHeight: '120px', overflowY: 'auto',
  },
  histItem: {
    fontSize: '12px', color: '#5a4a2a', lineHeight: 1.5,
    marginBottom: '6px', fontStyle: 'italic',
    fontFamily: "'Crimson Text', serif",
  },
  toggleBtn: {
    fontSize: '11px', color: '#5a4a2a', background: 'none',
    border: 'none', cursor: 'pointer', marginTop: '6px',
    fontFamily: "'Cinzel', serif", letterSpacing: '1px',
  },
};

// CSS animace injektované jednou
const injectStyles = () => {
  if (document.getElementById('narrator-styles')) return;
  const style = document.createElement('style');
  style.id = 'narrator-styles';
  style.textContent = `
    @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  `;
  document.head.appendChild(style);
};

export default function NarratorBox({ text, loading, history = [], showHistory = false }) {
  const [expanded, setExpanded] = useState(showHistory);
  const textRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (text && textRef.current) {
      textRef.current.style.animation = 'none';
      void textRef.current.offsetHeight;
      textRef.current.style.animation = 'fadeIn 0.5s ease';
    }
  }, [text]);

  if (!text && !loading && history.length === 0) return null;

  return (
    <div style={S.wrap}>
      <div style={S.shimmer} />

      {/* Hlavička */}
      <div style={S.header}>
        <span style={{ fontSize: '16px' }}>📖</span>
        <span style={S.headerTitle}>Vypravěč</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <div style={S.dot(loading)} />
        </div>
      </div>

      {/* Aktuální text */}
      {loading ? (
        <div style={S.loading}>
          {[0, 1, 2].map(i => <div key={i} style={S.loadDot(i)} />)}
        </div>
      ) : (
        <div ref={textRef} style={S.text}>
          {text || '…'}
        </div>
      )}

      {/* Historie */}
      {history.length > 0 && (
        <>
          <button style={S.toggleBtn} onClick={() => setExpanded(e => !e)}>
            {expanded ? '▲ Skrýt historii' : `▼ Historie (${history.length})`}
          </button>
          {expanded && (
            <div style={S.history}>
              {[...history].reverse().slice(0, 8).map((h, i) => (
                <div key={i} style={S.histItem}>„{h}"</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
