import React, { useState } from 'react';

export default function VotingPanel({ players, onVote }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    setConfirmed(true);
    onVote(selected);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {players.map(player => (
          <button
            key={player.id}
            onClick={() => !confirmed && setSelected(player.id)}
            style={{
              background: selected === player.id ? 'rgba(255,77,109,0.15)' : 'var(--surface2)',
              border: `2px solid ${selected === player.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '12px 16px',
              color: 'var(--text)',
              fontFamily: 'var(--font-head)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: confirmed ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              opacity: player.connected === false ? 0.5 : 1
            }}
          >
            {selected === player.id ? '→ ' : ''}{player.name}
          </button>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={handleConfirm}
        disabled={!selected || confirmed}
      >
        {confirmed ? '✓ Zagłosowano' : selected ? `Oddaj głos na ${players.find(p => p.id === selected)?.name}` : 'Wybierz gracza'}
      </button>
    </div>
  );
}
