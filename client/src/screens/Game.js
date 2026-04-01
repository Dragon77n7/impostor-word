import React, { useState, useEffect } from 'react';
import PlayerList from '../components/PlayerList';
import AnswerInput from '../components/AnswerInput';
import VotingPanel from '../components/VotingPanel';

export default function Game({ socket, roomCode, playerId, roomState, myQuestion, isHost }) {
  const phase = roomState?.phase;
  const [hasAnswered, setHasAnswered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setHasAnswered(false);
    setHasVoted(false);
    setError('');
  }, [roomState?.currentRound]);

  const handleAnswer = (answer) => {
    socket.emit('submit_answer', { roomCode, playerId, answer }, (res) => {
      if (res.error) return setError(res.error);
      setHasAnswered(true);
      setError('');
    });
  };

  const handleVote = (targetId) => {
    socket.emit('submit_vote', { roomCode, voterId: playerId, targetId }, (res) => {
      if (res.error) return setError(res.error);
      setHasVoted(true);
      setError('');
    });
  };

  const handleMoveToVoting = () => {
    socket.emit('move_to_voting', { roomCode }, (res) => {
      if (res && res.error) setError(res.error);
    });
  };

  const handleNextRound = () => {
    socket.emit('next_round', { roomCode });
  };

  const players = roomState?.players || [];
  const myPlayer = players.find(p => p.id === playerId);
  const roundResult = roomState?.roundResult;
  const connectedCount = players.filter(p => p.connected !== false).length;

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="tag tag-muted">Runda {roomState?.currentRound} / {roomState?.totalRounds}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent2)' }}>
            {myPlayer?.name}
          </span>
          <span className="tag tag-accent">{myPlayer?.score || 0} pkt</span>
        </div>
      </div>

      {/* ANSWERING */}
      {phase === 'answering' && (
        <>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
            <span className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Twoje pytanie</span>
            <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 700, marginTop: 10, lineHeight: 1.5 }}>
              {myQuestion?.question || 'Ladowanie pytania...'}
            </p>
          </div>
          {!hasAnswered ? (
            <AnswerInput onSubmit={handleAnswer} />
          ) : (
            <div style={{ textAlign: 'center', padding: 24, background: 'rgba(77,255,180,0.06)', borderRadius: 10, border: '1px solid rgba(77,255,180,0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent2)' }}>Odpowiedz wyslana!</p>
              <p className="muted" style={{ marginTop: 8 }}>Czekamy na graczy... ({roomState?.answersCount} / {connectedCount})</p>
            </div>
          )}
          {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}
        </>
      )}

      {/* REVEAL */}
      {phase === 'reveal' && (
        <>
          <h2 style={{ marginBottom: 6 }}>Odpowiedzi wszystkich</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Czy ktos odpowiedzial inaczej niz reszta?</p>

          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <span className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Pytanie (dla wiekszosci):</span>
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginTop: 6 }}>
              {roomState?.normalQuestion || myQuestion?.question || '...'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {Object.entries(roomState?.answers || {}).map(([pid, answer]) => {
              const player = players.find(p => p.id === pid);
              return (
                <div key={pid} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent2)', whiteSpace: 'nowrap', minWidth: 80 }}>
                    {player?.name || '?'}
                  </span>
                  <span style={{ color: 'var(--text)', lineHeight: 1.4 }}>{answer}</span>
                </div>
              );
            })}
          </div>

          {/* TYLKO HOST widzi przycisk */}
          {isHost ? (
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.05rem', padding: '14px' }} onClick={handleMoveToVoting}>
              🗳️ Rozpocznij glosowanie
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: 16, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <p className="muted">Czekaj az host rozpocznie glosowanie...</p>
            </div>
          )}

          {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}
        </>
      )}

      {/* VOTING */}
      {phase === 'voting' && (
        <>
          <h2 style={{ marginBottom: 6 }}>Kto jest impostorem?</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Czyja odpowiedz brzmiala inaczej niz pozostalych?</p>
          {!hasVoted ? (
            <VotingPanel
              players={players.filter(p => p.id !== playerId && p.connected !== false)}
              onVote={handleVote}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 24, background: 'rgba(77,255,180,0.06)', borderRadius: 10, border: '1px solid rgba(77,255,180,0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🗳️</div>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent2)' }}>Zaglosowano!</p>
              <p className="muted" style={{ marginTop: 8 }}>Czekamy na graczy... ({roomState?.votesCount} / {connectedCount})</p>
            </div>
          )}
          {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}
        </>
      )}

      {/* RESULT */}
      {phase === 'result' && roundResult && (
        <>
          <h2 style={{ marginBottom: 20 }}>Wyniki rundy {roomState.currentRound}</h2>
          <div style={{
            background: roundResult.impostorCaught ? 'rgba(77,255,180,0.08)' : 'rgba(255,77,109,0.08)',
            border: '1px solid ' + (roundResult.impostorCaught ? 'rgba(77,255,180,0.3)' : 'rgba(255,77,109,0.3)'),
            borderRadius: 10, padding: 20, marginBottom: 20, textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
              {roundResult.impostorCaught ? '🎯' : roundResult.isDraw ? '🤝' : '🕵️'}
            </div>
            <h3 style={{ color: roundResult.impostorCaught ? 'var(--accent2)' : 'var(--accent)' }}>
              {roundResult.impostorCaught ? 'Impostor zlapany!' : roundResult.isDraw ? 'Remis! Impostor ucieka!' : 'Impostor ucieka!'}
            </h3>
            <p className="muted" style={{ marginTop: 6 }}>
              {roundResult.impostorCaught
                ? 'Wszyscy gracze (oprocz impostora) dostaja +1 pkt'
                : roundResult.isDraw
                  ? 'Brak jednoznacznego wskazania — impostor dostaje +2 pkt'
                  : 'Zly wybor — impostor dostaje +2 pkt'}
            </p>
          </div>

          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
            <p className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 8 }}>Impostor:</p>
            <span className="tag tag-accent">{players.find(p => p.id === roundResult.impostorId)?.name || '?'}</span>
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
              Ich pytanie: <em style={{ color: 'var(--text)' }}>"{roundResult.impostorQuestion}"</em>
            </p>
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
              Normalne pytanie: <em style={{ color: 'var(--text)' }}>"{roundResult.normalQuestion}"</em>
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 10 }}>Glosy:</p>
            {Object.entries(roundResult.voteCounts || {}).map(([pid, count]) => {
              const p = players.find(pl => pl.id === pid);
              const isImpostor = pid === roundResult.impostorId;
              return (
                <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, minWidth: 90, fontSize: '0.9rem' }}>{p?.name}</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${count > 0 ? (count / connectedCount) * 100 : 0}%`, height: '100%', background: isImpostor ? 'var(--accent)' : 'var(--accent2)', borderRadius: 5, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, minWidth: 16 }}>{count}</span>
                  {isImpostor && <span className="tag tag-accent" style={{ fontSize: '0.65rem' }}>imp</span>}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
            <p className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 10 }}>Aktualny ranking:</p>
            <PlayerList players={[...players].sort((a, b) => (b.score || 0) - (a.score || 0))} showScore />
          </div>

          {/* TYLKO HOST przechodzi dalej */}
          {isHost ? (
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.05rem', padding: '14px' }} onClick={handleNextRound}>
              {roomState.currentRound >= roomState.totalRounds ? '🏆 Zakoncz gre' : '▶ Nastepna runda ' + (roomState.currentRound + 1)}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: 16, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <p className="muted">Czekaj az host przejdzie do nastepnej rundy...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
