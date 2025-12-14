const expenses = [];

function addExpense(expense) {
  expenses.push(expense);
  return expense;
}

function getExpenses() {
  return expenses;
}

function removeExpense(id) {
  const index = expenses.findIndex((expense) => expense.id === id);
  if (index === -1) {
    return false;
  }
  expenses.splice(index, 1);
  return true;
}

module.exports = {
  addExpense,
  getExpenses,
  removeExpense,
};
