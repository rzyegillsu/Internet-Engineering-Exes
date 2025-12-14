function SettlementList({ settlements }) {
  if (!settlements.length) {
    return (
      <p className="empty-state">همه حساب ها تسویه است یا نیاز به پرداختی نیست.</p>
    );
  }

  return (
    <ul className="settlement-list">
      {settlements.map((item, index) => (
        <li key={`${item.from}-${item.to}-${index}`}>
          {item.from} باید {item.amount.toLocaleString()} تومان به {item.to} بدهد.
        </li>
      ))}
    </ul>
  );
}

export default SettlementList;
