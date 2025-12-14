const { suggestSettlements } = require("../utils/settlement");

function ensureParticipants(participants, payer) {
  const list = Array.isArray(participants) ? participants : [];
  const sanitized = list
    .map((person) => person && person.toString().trim())
    .filter((person) => person);

  if (!sanitized.includes(payer)) {
    sanitized.push(payer);
  }

  return sanitized;
}

function calculateBalances(expenses) {
  const balances = {};

  expenses.forEach((expense) => {
    const { payer, amount, participants } = expense;

    if (!amount || amount <= 0 || !payer) {
      return;
    }

    const involved = ensureParticipants(participants, payer);
    if (!involved.length) {
      return;
    }

    const share = amount / involved.length;

    involved.forEach((member) => {
      balances[member] = (balances[member] || 0) - share;
    });

    balances[payer] = (balances[payer] || 0) + amount;
  });

  const summary = Object.entries(balances)
    .map(([member, balance]) => ({
      member,
      balance: Number(balance.toFixed(2)),
    }))
    .sort((a, b) => a.member.localeCompare(b.member));

  const settlements = suggestSettlements(summary);

  return { balances: summary, settlements };
}

module.exports = {
  calculateBalances,
};
