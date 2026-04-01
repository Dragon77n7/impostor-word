import React, { useState } from 'react';

export default function AnswerInput({ onSubmit }) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer.trim());
  };

  return (
    <div>
      <textarea
        placeholder="Wpisz swoją odpowiedź..."
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        rows={3}
        style={{ resize: 'vertical', marginBottom: 12 }}
        maxLength={300}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
        }}
      />
      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={handleSubmit}
        disabled={!answer.trim()}
      >
        ✓ Wyślij odpowiedź
      </button>
      <p className="muted" style={{ fontSize: '0.75rem', marginTop: 8, textAlign: 'center' }}>
        Ctrl+Enter aby wysłać
      </p>
    </div>
  );
}
