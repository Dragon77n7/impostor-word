import React, { useState } from 'react';
import PlayerList from '../components/PlayerList';

export default function Lobby({ socket, setRoomCode, setPlayerId, setIsHost, roomState }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState(null);
  const [error, setError] = useState('');
  const [myRoomCode, setMyRoomCode] = useState(null);
  const [hostState, setHostState] = useState(false);
  const [rounds, setRounds] = useState(3);

  React.useEffect(() => {
    if (roomState && roomState.phase !== 'lobby' && myRoomCode) {
      setRoomCode(myRoomCode);
    }
  }, [roomState?.phase, myRoomCode]);

  const handleCreate = () => {
    if (!name.trim()) return setError('Wpisz swoj nick.');
    socket.emit('create_room', { name: name.trim() }, (res) => {
      if (res.error) return setError(res.error);
      setMyRoomCode(res.roomCode);
      setPlayerId(res.playerId);
      setIsHost(true);
      setHostState(true);
      setError('');
    });
  };

  const handleJoin = () => {
    if (!name.trim()) return setError('Wpisz swoj nick.');
    if (!code.trim()) return setError('Wpisz kod pokoju.');
    socket.emit('join_room', { name: name.trim(), roomCode: code.trim() }, (res) => {
      if (res.error) return setError(res.error);
      setMyRoomCode(res.roomCode);
      setPlayerId(res.playerId);
      setIsHost(false);
      setHostState(false);
      setError('');
    });
  };

  const handleStart = () => {
    socket.emit('start_game', { roomCode: myRoomCode, rounds: rounds }, (res) => {
      if (res && res.error) setError(res.error);
    });
  };

  if (myRoomCode && roomState) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className="muted">Kod pokoju</span>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.8rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--accent2)', marginTop: 4 }}>
            {myRoomCode}
          </div>
          <span className="muted" style={{ fontSize: '0.8rem' }}>Pokaz innym, zeby dolaczyli</span>
        </div>

        <h3 style={{ marginBottom: 12 }}>Gracze ({roomState.players.length})</h3>
        <PlayerList players={roomState.players} />

        {error && <div className="error-msg">{error}</div>}

        {hostState ? (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Liczba rund
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 20px', fontSize: '1.4rem', lineHeight: 1 }}
                  onClick={() => setRounds(r => Math.max(1, r - 1))}
                >
                  −
                </button>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent2)', minWidth: 40, textAlign: 'center' }}>
                  {rounds}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 20px', fontSize: '1.4rem', lineHeight: 1 }}
                  onClick={() => setRounds(r => Math.min(20, r + 1))}
                >
                  +
                </button>
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  {rounds === 1 ? '1 runda' : rounds + ' rundy/rund'}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
              onClick={handleStart}
              disabled={roomState.players.length < 2}
            >
              {roomState.players.length < 2 ? 'Czekaj na graczy... (min. 2)' : 'Rozpocznij gre'}
            </button>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 24, textAlign: 'center' }}>
            Czekaj, az host rozpocznie gre...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ color: 'var(--accent)', marginBottom: 8 }}>IMPOSTOR</h1>
        <p className="muted">Gra imprezowa dla znajomych</p>
      </div>

      {!mode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Twoj nick..." value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (!name.trim()) return setError('Wpisz nick.'); setMode('create'); }}>
              Stworz pokoj
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { if (!name.trim()) return setError('Wpisz nick.'); setMode('join'); }}>
              Dolacz
            </button>
          </div>
          {error && <div className="error-msg">{error}</div>}
        </div>
      ) : mode === 'create' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Twoj nick..." value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          <button className="btn btn-primary" onClick={handleCreate}>Stworz pokoj</button>
          <button className="btn btn-secondary" onClick={() => setMode(null)}>Wróc</button>
          {error && <div className="error-msg">{error}</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Twoj nick..." value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          <input
            placeholder="Kod pokoju..."
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ letterSpacing: '0.2em', fontWeight: 700 }}
          />
          <button className="btn btn-primary" onClick={handleJoin}>Dolacz do pokoju</button>
          <button className="btn btn-secondary" onClick={() => setMode(null)}>Wróc</button>
          {error && <div className="error-msg">{error}</div>}
        </div>
      )}
    </div>
  );
}
