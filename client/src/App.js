import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './screens/Lobby';
import Game from './screens/Game';
import Results from './screens/Results';

const socket = io('https://impostor-word-production.up.railway.app');

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f;
    --surface: #13131a;
    --surface2: #1e1e2a;
    --border: #2a2a3a;
    --accent: #ff4d6d;
    --accent2: #4dffb4;
    --text: #f0f0f5;
    --muted: #7a7a9a;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 12px;
    --shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }
  .app {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 20px;
    background: radial-gradient(ellipse at 20% 20%, rgba(255,77,109,0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(77,255,180,0.06) 0%, transparent 50%), var(--bg);
  }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; width: 100%; max-width: 580px; box-shadow: var(--shadow); }
  h1 { font-family: var(--font-head); font-size: 2.4rem; font-weight: 800; }
  h2 { font-family: var(--font-head); font-size: 1.6rem; font-weight: 700; }
  h3 { font-family: var(--font-head); font-size: 1.2rem; font-weight: 700; }
  .btn { display: inline-block; padding: 12px 28px; border: none; border-radius: 8px; font-family: var(--font-head); font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.18s; letter-spacing: 0.02em; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #ff6b84; transform: translateY(-1px); }
  .btn-primary:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; transform: none; }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent2); color: var(--accent2); }
  .btn-green { background: var(--accent2); color: #0a0a0f; }
  .btn-green:hover { background: #6fffbf; transform: translateY(-1px); }
  input, textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: var(--font-body); font-size: 1rem; padding: 12px 16px; outline: none; transition: border-color 0.18s; }
  input:focus, textarea:focus { border-color: var(--accent2); }
  .tag { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; font-family: var(--font-head); letter-spacing: 0.06em; text-transform: uppercase; }
  .tag-accent { background: rgba(255,77,109,0.15); color: var(--accent); border: 1px solid var(--accent); }
  .tag-green { background: rgba(77,255,180,0.12); color: var(--accent2); border: 1px solid var(--accent2); }
  .tag-muted { background: var(--surface2); color: var(--muted); border: 1px solid var(--border); }
  .error-msg { color: var(--accent); font-size: 0.9rem; margin-top: 8px; padding: 10px 14px; background: rgba(255,77,109,0.08); border-radius: 8px; border: 1px solid rgba(255,77,109,0.2); }
  .muted { color: var(--muted); font-size: 0.9rem; }
`;

export default function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [myQuestion, setMyQuestion] = useState(null);

  useEffect(() => {
    socket.on('room_state', (state) => {
      console.log('room_state odebrano:', state.phase, state);
      setRoomState(state);
    });

    socket.on('your_question', (data) => {
      console.log('your_question odebrano:', data);
      setMyQuestion(data);
    });

    return () => {
      socket.off('room_state');
      socket.off('your_question');
    };
  }, []);

  const phase = roomState?.phase;

  console.log('RENDER: roomCode=', roomCode, 'phase=', phase);

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {!roomCode ? (
          <Lobby
            socket={socket}
            setRoomCode={setRoomCode}
            setPlayerId={setPlayerId}
            setIsHost={setIsHost}
            roomState={roomState}
          />
        ) : phase === 'finished' ? (
          <Results roomState={roomState} socket={socket} roomCode={roomCode} playerId={playerId} />
        ) : (
          <Game
            socket={socket}
            roomCode={roomCode}
            playerId={playerId}
            roomState={roomState}
            myQuestion={myQuestion}
            isHost={isHost}
          />
        )}
      </div>
    </>
  );
}
