import { useEffect, useState } from 'react';

async function fetchScores() {
  const res = await fetch('/api/scores');
  return res.json();
}

export default function Scoreboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    (async () => {
      const s = await fetchScores();
      setScores(s.scores || []);
    })();
    const interval = setInterval(async () => {
      const s = await fetchScores();
      setScores(s.scores || []);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h2>رتبه‌بندی</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 600 }}>
        <thead>
          <tr style={{ background: '#11998e', color: 'white' }}>
            <th>رتبه</th>
            <th>نام</th>
            <th>صحیح</th>
            <th>کل پاسخ‌ها</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i}>
              <td style={{ textAlign: 'center' }}>{i + 1}</td>
              <td>{s.name}</td>
              <td style={{ textAlign: 'center' }}>{s.correct}</td>
              <td style={{ textAlign: 'center' }}>{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {scores.length === 0 && <p style={{ marginTop: 16, color: '#666' }}>هنوز هیچ پاسخی ثبت نشده است.</p>}
      <a href="/quiz" style={{ display: 'inline-block', marginTop: 16, padding: '8px 16px', background: '#0d7377', color: 'white', textDecoration: 'none', borderRadius: 8 }}>
        بازگشت به آزمون
      </a>
    </main>
  );
}
