import { useState } from "react";

const defaultForm = {
  payer: "",
  amount: "",
  category: "General",
  participants: "",
  description: "",
};

function ExpenseForm({ onSubmit }) {
  const [formState, setFormState] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formState.payer.trim()) {
      setError("نام پرداخت کننده را وارد کنید");
      return;
    }

    if (!formState.amount || Number(formState.amount) <= 0) {
      setError("مبلغ معتبر نیست");
      return;
    }

    const participants = formState.participants
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry);

    if (!participants.length) {
      setError("حداقل یک نفر باید در هزینه شرکت داشته باشد");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        payer: formState.payer.trim(),
        amount: Number(formState.amount),
        category: formState.category.trim() || "General",
        participants,
        description: formState.description.trim(),
      });
      setFormState(defaultForm);
    } catch (submitError) {
      setError(submitError.message || "ارسال انجام نشد");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <label>
        پرداخت کننده
        <input
          name="payer"
          value={formState.payer}
          onChange={handleChange}
          placeholder="مثال: سارا"
        />
      </label>

      <label>
        مبلغ (تومان)
        <input
          name="amount"
          type="number"
          min="0"
          step="5000"
          value={formState.amount}
          onChange={handleChange}
          placeholder="60000"
        />
      </label>

      <label>
        دسته بندی
        <input
          name="category"
          value={formState.category}
          onChange={handleChange}
          placeholder="مواد غذایی"
        />
      </label>

      <label>
        افراد درگیر (با کاما جدا کنید)
        <input
          name="participants"
          value={formState.participants}
          onChange={handleChange}
          placeholder="علی, سارا, مجتبی"
        />
      </label>

      <label>
        توضیحات
        <textarea
          name="description"
          rows="2"
          value={formState.description}
          onChange={handleChange}
          placeholder="خرید برای شام"
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "در حال ارسال..." : "ثبت هزینه"}
      </button>
    </form>
  );
}

export default ExpenseForm;
