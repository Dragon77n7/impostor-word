import React from 'react';

export default function Results({ roomState, socket, roomCode }) {
  const players = roomState?.players || [];
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const handleRestart = () => {
    socket.emit('restart_game', { roomCode });
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏆</div>
        <h1 style={{ color: 'var(--accent2)', marginBottom: 4 }}>Koniec gry!</h1>
        <p className="muted">Wygrał(a): <strong style={{ color: 'var(--text)' }}>{winner?.name}</strong> z {winner?.score} punktami</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {sorted.map((player, idx) => (
          <div key={player.id} style={{
            background: idx === 0 ? 'rgba(77,255,180,0.08)' : 'var(--surface2)',
            border: `1px solid ${idx === 0 ? 'rgba(77,255,180,0.3)' : 'var(--border)'}`,
            borderRadius: 10,
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>{medals[idx] || `#${idx + 1}`}</span>
              <span style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: idx === 0 ? 'var(--accent2)' : 'var(--text)'
              }}>
                {player.name}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: idx === 0 ? 'var(--accent2)' : 'var(--text)'
            }}>
              {player.score} pkt
            </span>
          </div>
        ))}
      </div>

      <button className="btn btn-green" style={{ width: '100%', fontSize: '1.05rem' }} onClick={handleRestart}>
        🔁 Zagraj ponownie
      </button>
    </div>
  );
}
