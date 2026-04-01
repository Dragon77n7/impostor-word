import React from 'react';

export default function PlayerList({ players, showScore = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {players.map(player => (
        <div key={player.id} style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: player.connected === false ? 0.4 : 1,
          transition: 'opacity 0.2s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: player.connected === false ? 'var(--muted)' : 'var(--accent2)'
            }} />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600 }}>
              {player.name}
            </span>
            {player.connected === false && (
              <span className="tag tag-muted" style={{ fontSize: '0.65rem' }}>rozłączony</span>
            )}
          </div>
          {showScore && (
            <span style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 800,
              color: 'var(--accent2)',
              fontSize: '1.1rem'
            }}>
              {player.score} pkt
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
