function normalizeAmount(value) {
  return Number(value.toFixed(2));
}

function suggestSettlements(balanceSummary) {
  const creditors = [];
  const debtors = [];

  balanceSummary.forEach(({ member, balance }) => {
    if (balance > 0.01) {
      creditors.push({ member, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ member, amount: Math.abs(balance) });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];

  while (creditors.length && debtors.length) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const payment = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: debtor.member,
      to: creditor.member,
      amount: normalizeAmount(payment),
    });

    creditor.amount = normalizeAmount(creditor.amount - payment);
    debtor.amount = normalizeAmount(debtor.amount - payment);

    if (creditor.amount <= 0.01) {
      creditors.shift();
    }

    if (debtor.amount <= 0.01) {
      debtors.shift();
    }
  }

  return settlements;
}

module.exports = {
  suggestSettlements,
};
