import { useEffect, useState } from 'react';

async function fetchSession() {
  const res = await fetch('/api/session');
  return res.json();
}

async function fetchQuestions() {
  const res = await fetch('/api/questions');
  return res.json();
}

async function submitAnswer(payload) {
  const res = await fetch('/api/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export default function Quiz() {
  const [name, setName] = useState('');
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const n = localStorage.getItem('quiz_name');
    if (!n) {
      alert('ابتدا نام خود را در صفحه ورود وارد کنید.');
      window.location.href = '/join';
      return;
    }
    setName(n);

    // initial load
    (async () => {
      const s = await fetchSession();
      const q = await fetchQuestions();
      setSession(s);
      setQuestions(q.questions || []);
    })();

    // polling
    const interval = setInterval(async () => {
      const s = await fetchSession();
      setSession(s);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!session || !questions.length) return;
    const aq = questions.find(q => q.id === session.activeQuestionId);
    setActiveQuestion(aq || null);
    setFeedback(null);
  }, [session, questions]);

  const handleSubmit = async (optionIndex) => {
    if (!activeQuestion || busy) return;
    setBusy(true);
    const result = await submitAnswer({
      name,
      questionId: activeQuestion.id,
      optionIndex
    });
    if (result.error) {
      setFeedback({ type: 'error', text: result.error });
    } else {
      setFeedback({ type: result.isCorrect ? 'ok' : 'wrong', text: result.isCorrect ? 'درست!' : 'نادرست.' });
    }
    setBusy(false);
  };

  if (!session) return <main style={{ padding: 24 }}>در حال بارگذاری...</main>;

  if (!session.isOpen) {
    return (
      <main style={{ padding: 24 }}>
        <h2>آزمون بسته است</h2>
        <p>منتظر باز شدن آزمون توسط معلم باشید.</p>
      </main>
    );
  }

  if (!activeQuestion) {
    return (
      <main style={{ padding: 24 }}>
        <h2>سؤالی فعال نیست</h2>
        <p>منتظر فعال شدن سؤال بعدی توسط معلم باشید.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>سؤال: {activeQuestion.question}</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {activeQuestion.options.map((opt, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <button
              disabled={busy}
              onClick={() => handleSubmit(idx)}
              style={{ padding: '8px 12px', background: '#11998e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', minWidth: 120 }}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      {feedback && (
        <p style={{ color: feedback.type === 'ok' ? 'green' : feedback.type === 'wrong' ? 'crimson' : '#555' }}>
          {feedback.text}
        </p>
      )}
      <a href="/scoreboard" style={{ display: 'inline-block', marginTop: 16, padding: '8px 16px', background: '#0d7377', color: 'white', textDecoration: 'none', borderRadius: 8 }}>
        مشاهده رتبه‌بندی
      </a>
    </main>
  );
}
