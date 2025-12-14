function BalanceSummary({ balances }) {
  if (!balances.length) {
    return <p className="empty-state">نتیجه ای برای نمایش وجود ندارد.</p>;
  }

  return (
    <ul className="balance-list">
      {balances.map((entry) => (
        <li key={entry.member}>
          <span>{entry.member}</span>
          <span
            className={entry.balance >= 0 ? "positive" : "negative"}
          >
            {entry.balance.toLocaleString()} تومان
          </span>
        </li>
      ))}
    </ul>
  );
}

export default BalanceSummary;
