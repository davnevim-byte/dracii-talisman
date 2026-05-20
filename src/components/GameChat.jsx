// src/components/GameChat.jsx
// Herní chat — hráči si mohou psát zprávy

import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { sendChatMessage } from '../game/multiplayerEngine';

const S = {
  wrap: {
    display:'flex', flexDirection:'column',
    height:'100%', fontFamily:"'Crimson Text',Georgia,serif",
  },
  header: {
    padding:'8px 12px', background:'#0d0b07',
    borderBottom:'1px solid #1e1a12',
    fontFamily:"'Cinzel',serif", fontSize:'10px',
    color:'#5a4a2a', letterSpacing:'3px', textTransform:'uppercase',
    display:'flex', alignItems:'center', gap:'6px',
  },
  messages: {
    flex:1, overflowY:'auto', padding:'10px 12px',
    display:'flex', flexDirection:'column', gap:'6px',
  },
  msgBubble: (isMe, color) => ({
    maxWidth:'80%', padding:'7px 11px', borderRadius:'12px',
    alignSelf: isMe ? 'flex-end' : 'flex-start',
    background: isMe ? `${color}20` : '#16140e',
    border:`1px solid ${isMe ? color+'40' : '#2a2418'}`,
    fontSize:'13px', lineHeight:1.4,
  }),
  msgName: (color) => ({
    fontFamily:"'Cinzel',serif", fontSize:'10px',
    color, fontWeight:700, marginBottom:'2px',
  }),
  msgText: { color:'#d0c5a0' },
  msgTime: { fontSize:'10px', color:'#3a3020', marginTop:'2px' },
  inputRow: {
    display:'flex', gap:'6px', padding:'10px 12px',
    borderTop:'1px solid #1e1a12', background:'#0d0b07',
  },
  input: {
    flex:1, padding:'8px 12px', background:'#141210',
    border:'1px solid #2a2418', borderRadius:'8px',
    color:'#e0d5c0', fontSize:'13px',
    fontFamily:"'Crimson Text',serif", outline:'none',
  },
  sendBtn: {
    padding:'8px 14px', background:'#c0932a20',
    border:'1px solid #c0932a40', borderRadius:'8px',
    color:'#c0932a', cursor:'pointer', fontSize:'16px',
    fontWeight:700,
  },
};

function fmtTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

export default function GameChat({ gameId, currentPlayer }) {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;
    const r = ref(db, `games/${gameId}/chat`);
    onValue(r, snap => setMessages(snap.val() || []));
    return () => off(r);
  }, [gameId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !currentPlayer) return;
    setInput('');
    await sendChatMessage(
      gameId,
      currentPlayer.id,
      currentPlayer.name,
      currentPlayer.character?.emoji || '👤',
      text
    );
  };

  const myId    = currentPlayer?.id;
  const myColor = currentPlayer?.character?.color || '#c0932a';

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        💬 <span>Chat</span>
        <span style={{ marginLeft:'auto', color:'#3a3020', fontSize:'9px' }}>
          {messages.length} zpráv
        </span>
      </div>

      <div style={S.messages}>
        {messages.length === 0 && (
          <div style={{ fontSize:'12px', color:'#3a3020', textAlign:'center',
                         padding:'20px 0', fontStyle:'italic' }}>
            Zatím žádné zprávy...
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.playerId === myId;
          // Barva jiných hráčů — pro jednoduchost zlatá
          const color = isMe ? myColor : '#7a6a4a';
          return (
            <div key={i} style={S.msgBubble(isMe, color)}>
              {!isMe && (
                <div style={S.msgName(color)}>
                  {msg.emoji} {msg.playerName}
                </div>
              )}
              <div style={S.msgText}>{msg.text}</div>
              <div style={S.msgTime}>{fmtTime(msg.ts)}</div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div style={S.inputRow}>
        <input
          style={S.input}
          placeholder="Napiš zprávu..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          maxLength={120}
        />
        <button style={S.sendBtn} onClick={handleSend}>➤</button>
      </div>
    </div>
  );
}
