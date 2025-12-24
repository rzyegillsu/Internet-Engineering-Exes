import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Join() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('quiz_name', name.trim());
    router.push('/quiz');
  };

  return (
    <main style={{ padding: 24 }}>
      <h2>ورود به آزمون</h2>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="نام شما"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, width: 240, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button style={{ marginLeft: 8, padding: '8px 16px', background: '#11998e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }} type="submit">
          ورود
        </button>
      </form>
    </main>
  );
}
