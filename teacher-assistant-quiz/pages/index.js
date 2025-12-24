import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Teacher Assistant Quiz</h1>
      <p>برای شروع، نام خود را وارد کنید.</p>
      <Link href="/join" style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: '#11998e', color: 'white', textDecoration: 'none', borderRadius: 8 }}>
        ورود به آزمون
      </Link>
      <div style={{ marginTop: 12 }}>
        <Link href="/scoreboard" style={{ display: 'inline-block', padding: '8px 16px', background: '#0d7377', color: 'white', textDecoration: 'none', borderRadius: 8 }}>
          مشاهده رتبه‌بندی
        </Link>
      </div>
    </main>
  );
}
