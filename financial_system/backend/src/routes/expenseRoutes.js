const express = require("express");
const {
  listExpenses,
  createExpense,
  deleteExpense,
  getBalance,
} = require("../controllers/expenseController");

const router = express.Router();

router.get("/expenses", listExpenses);
router.post("/expenses", createExpense);
router.delete("/expenses/:id", deleteExpense);

// Aliases that follow the singular naming used in the spec document
router.get("/expense", listExpenses);
router.post("/expense", createExpense);
router.delete("/expense/:id", deleteExpense);
router.get("/balance", getBalance);

module.exports = router;
