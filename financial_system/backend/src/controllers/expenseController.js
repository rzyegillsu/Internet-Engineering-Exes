const { v4: uuid } = require("uuid");
const store = require("../data/store");
const { calculateBalances } = require("../services/balanceService");

function normalizeParticipants(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => entry && entry.toString().trim())
      .filter((entry) => entry);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry);
  }

  return [];
}

function listExpenses(_req, res) {
  res.json(store.getExpenses());
}

function createExpense(req, res) {
  const { payer, amount, category, description, participants } = req.body;

  if (!payer || !amount) {
    return res.status(400).json({ error: "payer and amount are required" });
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const members = normalizeParticipants(participants);
  if (!members.length) {
    return res
      .status(400)
      .json({ error: "at least one participant must be provided" });
  }

  const expense = {
    id: uuid(),
    payer: payer.trim(),
    amount: Number(numericAmount.toFixed(2)),
    category: category ? category.trim() : "General",
    description: description ? description.trim() : "",
    participants: members,
    createdAt: new Date().toISOString(),
  };

  store.addExpense(expense);

  res.status(201).json(expense);
}

function deleteExpense(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "id parameter is required" });
  }

  const removed = store.removeExpense(id);
  if (!removed) {
    return res.status(404).json({ error: "expense not found" });
  }

  res.json({ message: "expense removed" });
}

function getBalance(_req, res) {
  const expenses = store.getExpenses();
  const result = calculateBalances(expenses);
  res.json(result);
}

module.exports = {
  listExpenses,
  createExpense,
  deleteExpense,
  getBalance,
};
