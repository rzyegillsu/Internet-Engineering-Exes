import { useEffect, useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import BalanceSummary from "./components/BalanceSummary";
import SettlementList from "./components/SettlementList";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchBalance,
} from "./services/api";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [expenseData, balanceData] = await Promise.all([
        fetchExpenses(),
        fetchBalance(),
      ]);
      setExpenses(expenseData.reverse());
      setBalances(balanceData?.balances || []);
      setSettlements(balanceData?.settlements || []);
    } catch (loadError) {
      setError(loadError.message || "دریافت اطلاعات انجام نشد");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const refreshBalance = async () => {
    const balanceData = await fetchBalance();
    setBalances(balanceData?.balances || []);
    setSettlements(balanceData?.settlements || []);
  };

  const handleAddExpense = async (payload) => {
    setError("");
    const newExpense = await createExpense(payload);
    setExpenses((prev) => [newExpense, ...prev]);
    await refreshBalance();
  };

  const handleDeleteExpense = async (id) => {
    setError("");
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    await refreshBalance();
  };

  return (
    <div className="app">
      <header>
        <p className="tag">گروه یا خوابگاه</p>
        <h1>مدیریت هزینه های مشترک</h1>
        <p className="subtitle">
          هزینه ها را ثبت کنید، سهم هر نفر را ببینید و سریع تسویه کنید.
        </p>
      </header>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="loading">در حال بارگذاری...</p>
      ) : (
        <>
          <div className="grid">
            <section className="panel">
              <h2>ثبت هزینه جدید</h2>
              <ExpenseForm onSubmit={handleAddExpense} />
            </section>

            <section className="panel">
              <h2>مانده هر نفر</h2>
              <BalanceSummary balances={balances} />
              <h3>پیشنهاد تسویه</h3>
              <SettlementList settlements={settlements} />
            </section>
          </div>

          <section className="panel">
            <div className="panel-header">
              <h2>تاریخچه هزینه ها</h2>
              <button type="button" onClick={loadAll}>
                بروزرسانی
              </button>
            </div>
            <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
          </section>
        </>
      )}
    </div>
  );
}

export default App;
