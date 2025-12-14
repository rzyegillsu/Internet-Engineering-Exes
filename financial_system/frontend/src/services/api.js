const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

export function fetchExpenses() {
  return request("/expenses");
}

export function createExpense(payload) {
  return request("/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, {
    method: "DELETE",
  });
}

export function fetchBalance() {
  return request("/balance");
}
