// src/components/LocationPanel.jsx
// Panel akcí pro speciální lokace (hospoda, chrám, kovárna, obchod)

import { useState } from 'react';
import { ZONE_LOCATIONS, LOCATION_ACTIONS, NPC_CHARACTERS } from '../data/mapData';
import { updatePlayerStats, addLog, addItemToInventory } from '../game/gameState';
import { ITEMS } from '../game/worldData';

const S = {
  wrap: {
    background: '#16140e', border: '1px solid #2a2418',
    borderRadius: '14px', padding: '16px', marginBottom: '14px',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
  },
  locTitle: {
    fontFamily: "'Cinzel', serif", fontSize: '15px', fontWeight: 700, color: '#c0932a',
  },
  locType: { fontSize: '12px', color: '#7a6a4a', marginTop: '2px' },
  locDesc: { fontSize: '13px', color: '#9a8a6a', lineHeight: 1.6, marginBottom: '14px' },
  actionBtn: (color = '#c0932a', disabled = false) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 14px', borderRadius: '10px', marginBottom: '8px',
    background: disabled ? '#0d0b07' : `${color}15`,
    border: `1px solid ${disabled ? '#1a1810' : color + '40'}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, width: '100%', textAlign: 'left',
    transition: 'all 0.2s',
  }),
  actionName: (color) => ({
    fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 700, color,
  }),
  actionDesc: { fontSize: '12px', color: '#7a6a4a', marginTop: '2px' },
  actionCost: (canAfford) => ({
    marginLeft: 'auto', fontSize: '13px', fontWeight: 700,
    color: canAfford ? '#f0c040' : '#e05050', flexShrink: 0,
  }),
  npcBox: {
    background: '#0d0b07', border: '1px solid #1e1a12',
    borderRadius: '10px', padding: '12px', marginBottom: '12px',
  },
  npcName: {
    fontFamily: "'Cinzel', serif", fontSize: '13px', color: '#c0932a',
    fontWeight: 700, marginBottom: '4px',
  },
  dialogue: {
    fontSize: '13px', color: '#9a8a6a', fontStyle: 'italic',
    lineHeight: 1.5, marginBottom: '8px',
    borderLeft: '2px solid #2a2418', paddingLeft: '10px',
  },
  feedback: (ok) => ({
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
    background: ok ? '#0d1a0d' : '#1a0d0d',
    border: `1px solid ${ok ? '#2a5a2a' : '#5a2a2a'}`,
    color: ok ? '#4caf50' : '#e05050', marginTop: '8px',
  }),
  typeColors: {
    inn:     '#a09030',
    temple:  '#6060c0',
    smithy:  '#9a7030',
    shop:    '#9050a0',
    special: '#4080a0',
    safe:    '#4a8a4a',
  },
};

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getRandomItem(type) {
  const weapons = ITEMS.filter(i => i.bonus === 'str' || i.bonus === 'skill');
  const armors  = ITEMS.filter(i => i.bonus === 'defense');
  const potions = ITEMS.filter(i => i.type === 'use');
  if (type === 'weapon') return rnd(weapons);
  if (type === 'armor')  return rnd(armors);
  if (type === 'potion') return rnd(potions);
  return rnd(ITEMS);
}

export default function LocationPanel({ locId, zoneId, player, session, isMyTurn, onDone }) {
  const [feedback, setFeedback] = useState(null);
  const [usedActions, setUsedActions] = useState(new Set());

  const locs = ZONE_LOCATIONS[zoneId] || [];
  const loc  = locs.find(l => l.id === locId);
  if (!loc) return null;

  const actions  = LOCATION_ACTIONS[loc.type] || [];
  const color    = S.typeColors[loc.type] || '#7a6a4a';
  const stats    = player?.stats || {};

  // Najdi NPC pro tuto lokaci
  const npc = NPC_CHARACTERS.find(n => n.locations.includes(loc.id));
  const npcDialogue = npc ? rnd(npc.dialogues) : null;

  const doAction = async (action) => {
    if (!isMyTurn || usedActions.has(action.id)) return;

    const cost = action.cost || {};
    if (cost.gold && stats.gold < cost.gold) {
      setFeedback({ ok: false, msg: `Nemáš dost zlatých (potřebuješ ${cost.gold}).` });
      return;
    }

    let updates = {};
    let msg = '';

    // Odečti cenu
    if (cost.gold) updates.gold = stats.gold - cost.gold;

    // Aplikuj efekt
    const eff = action.effect || {};

    if (eff.heal === 'full') {
      updates.life = stats.maxLife;
      msg = `Obnoven na plné životy!`;
    } else if (eff.heal) {
      updates.life = Math.min(stats.maxLife, stats.life + eff.heal);
      msg = `+${eff.heal} životů.`;
    }

    if (eff.fate)     { updates.fate    = (stats.fate    || 0) + eff.fate;    msg += ` +${eff.fate} Osud.`; }
    if (eff.str)      { updates.str     = (stats.str     || 0) + eff.str;     msg += ` +${eff.str} Síla.`; }
    if (eff.defense)  { updates.defense = (stats.defense || 0) + eff.defense; msg += ` +${eff.defense} Obrana.`; }
    if (eff.rep)      { updates.reputation = Math.min(10, (stats.reputation || 0) + eff.rep); msg += ` +${eff.rep} Reputace.`; }
    if (eff.xp)       { updates.xp = (stats.xp || 0) + eff.xp; msg += ` +${eff.xp} XP.`; }
    if (eff.mana === 'full') { updates.mana = stats.maxMana; msg += ` Mana obnovena.`; }

    if (eff.gamble) {
      const win = Math.random() < 0.5;
      if (win) {
        updates.gold = (updates.gold || stats.gold) + 2;
        msg = `Vyhráváš! +2 zlaté. 🎲`;
      } else {
        msg = `Prohráváš sázku. 🎲`;
      }
      setFeedback({ ok: win, msg });
    }

    if (eff.item) {
      const item = getRandomItem(eff.item);
      await addItemToInventory(session.gameId, session.playerId, item);
      msg += ` Získal jsi: ${item.emoji} ${item.name}.`;
    }

    if (Object.keys(updates).length > 0) {
      await updatePlayerStats(session.gameId, session.playerId, updates);
    }

    const fullMsg = `${player.name} v ${loc.emoji} ${loc.name}: ${action.name}. ${msg}`;
    await addLog(session.gameId, fullMsg, 'ok');

    setUsedActions(prev => new Set([...prev, action.id]));
    if (!eff.gamble) setFeedback({ ok: true, msg });
  };

  return (
    <div style={S.wrap}>
      {/* Hlavička lokace */}
      <div style={S.header}>
        <span style={{ fontSize:'28px' }}>{loc.emoji}</span>
        <div>
          <div style={S.locTitle}>{loc.name}</div>
          <div style={S.locType} >{
            { safe:'🟢 Bezpečné', dangerous:'🔴 Nebezpečné', inn:'🍺 Hostinec',
              temple:'⛪ Chrám', smithy:'⚒️ Kovárna', shop:'🛒 Obchod',
              special:'✨ Speciální' }[loc.type] || loc.type
          }</div>
        </div>
      </div>

      <div style={S.locDesc}>{loc.desc}</div>

      {/* NPC */}
      {npc && (
        <div style={S.npcBox}>
          <div style={S.npcName}>{npc.emoji} {npc.name}</div>
          <div style={S.dialogue}>„{npcDialogue}"</div>
          {npc.actions?.map(a => {
            const cost     = a.cost || {};
            const canAfford = !cost.gold || stats.gold >= cost.gold;
            const used      = usedActions.has(a.id);
            return (
              <div key={a.id} style={S.actionBtn('#9a8a6a', !isMyTurn || !canAfford || used)}
                   onClick={() => isMyTurn && canAfford && !used && doAction(a)}>
                <div style={{ flex: 1 }}>
                  <div style={S.actionName('#c0932a')}>{a.name}</div>
                  <div style={S.actionDesc}>{a.desc}</div>
                </div>
                {cost.gold
                  ? <div style={S.actionCost(canAfford)}>🪙{cost.gold}</div>
                  : <div style={{ ...S.actionCost(true), color:'#4caf50' }}>Zdarma</div>}
                {used && <div style={{ fontSize:'11px', color:'#4caf50', marginLeft:'8px' }}>✓</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Akce lokace */}
      {actions.length > 0 && (
        <>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', color:'#7a6a4a',
                         letterSpacing:'3px', textTransform:'uppercase',
                         marginBottom:'10px', borderBottom:'1px solid #1e1a12', paddingBottom:'6px' }}>
            Dostupné akce
          </div>
          {actions.map(a => {
            const cost      = a.cost || {};
            const canAfford = !cost.gold || stats.gold >= cost.gold;
            const used      = usedActions.has(a.id);
            return (
              <div key={a.id} style={S.actionBtn(color, !isMyTurn || !canAfford || used)}
                   onClick={() => isMyTurn && canAfford && !used && doAction(a)}>
                <div style={{ flex: 1 }}>
                  <div style={S.actionName(color)}>{a.name}</div>
                  <div style={S.actionDesc}>{a.desc}</div>
                </div>
                {cost.gold
                  ? <div style={S.actionCost(canAfford)}>🪙 {cost.gold}</div>
                  : <div style={{ ...S.actionCost(true), color:'#4caf50' }}>Zdarma</div>}
                {used && <div style={{ fontSize:'11px', color:'#4caf50', marginLeft:'4px' }}>✓</div>}
              </div>
            );
          })}
        </>
      )}

      {/* Feedback */}
      {feedback && <div style={S.feedback(feedback.ok)}>{feedback.ok ? '✅' : '❌'} {feedback.msg}</div>}

      {!isMyTurn && (
        <div style={{ fontSize:'12px', color:'#5a4a2a', marginTop:'8px', fontStyle:'italic' }}>
          Akce jsou dostupné jen na tvém tahu.
        </div>
      )}
    </div>
  );
}
