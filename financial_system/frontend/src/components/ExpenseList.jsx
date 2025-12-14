function ExpenseList({ expenses, onDelete }) {
  if (!expenses.length) {
    return <p className="empty-state">هنوز هزینه ای ثبت نشده است.</p>;
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <li key={expense.id} className="expense-item">
          <div>
            <p className="expense-title">
              {expense.payer} → {expense.category}
            </p>
            <p className="expense-meta">
              مبلغ: {expense.amount.toLocaleString()} تومان | افراد: {expense.participants.join(", ")}
            </p>
            {expense.description && (
              <p className="expense-description">{expense.description}</p>
            )}
          </div>
          <button type="button" onClick={() => onDelete(expense.id)}>
            حذف
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ExpenseList;
