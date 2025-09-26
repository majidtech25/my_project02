// src/services/api.js
// Backend-ready API service for IMS frontend.
// Integrated with FastAPI backend + JWT authentication.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// ===== Token Helpers =====
function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

// ===== Central Fetch Wrapper =====
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      clearToken();
      throw new Error("Unauthorized, please login again");
    }

    if (res.status === 204) {
      return null;
    }

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(`API error: ${res.status} - ${errMsg}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.warn(
      "API request failed, falling back to mock:",
      endpoint,
      err.message
    );
    return null;
  }
}

/* ================== AUTH ================== */
export async function loginApi(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ✅ use username instead of phone
    });

    if (!res.ok) {
      throw new Error("Invalid username or password");
    }

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  } catch (err) {
    throw new Error(err.message || "Login failed");
  }
}


/* ================== EMPLOYEES ================== */
export async function getEmployees({ skip = 0, limit = 10 } = {}) {
  const res = await apiFetch(`/employees?skip=${skip}&limit=${limit}`);
  const data = Array.isArray(res) ? res : [];
  return {
    data,
    total: data.length,
  };
}

export async function createEmployee(payload) {
  return await apiFetch("/employees/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(id, payload) {
  return await apiFetch(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 🔑 Change password (self-service)
export async function changePassword(newPassword) {
  return await apiFetch(`/employees/me/password`, {
    method: "PUT",
    body: JSON.stringify({ new_password: newPassword }),
  });
}

/* ================== PRODUCTS ================== */
export async function getProducts({ skip = 0, limit = 100 } = {}) {
  const res = await apiFetch(`/products?skip=${skip}&limit=${limit}`);
  const data = Array.isArray(res) ? res : [];
  return {
    data,
    total: data.length,
  };
}

export async function createProduct(payload) {
  return await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id, payload) {
  return await apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getCategories() {
  return await apiFetch("/categories");
}

export async function createCategory(payload) {
  return await apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ================== SUPPLIERS ================== */
export async function getSuppliers({ skip = 0, limit = 100 } = {}) {
  const res = await apiFetch(`/suppliers?skip=${skip}&limit=${limit}`);
  const data = Array.isArray(res) ? res : [];
  return {
    data,
    total: data.length,
  };
}

export async function createSupplier(payload) {
  return await apiFetch("/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSupplier(id, payload) {
  return await apiFetch(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ================== SALES ================== */
export async function createSale(order) {
  const payload = {
    employee_id: order.employee_id,
    items: Array.isArray(order.items)
      ? order.items
          .map((item) => ({
            product_id:
              item.product_id ?? item.productId ?? item.id ?? item.product,
            quantity: item.quantity ?? item.qty ?? 1,
          }))
          .map((item) => ({
            product_id: item.product_id ? Number(item.product_id) : undefined,
            quantity: Number(item.quantity) || 1,
          }))
          .filter((item) => Number.isFinite(item.product_id))
      : [],
    is_credit: Boolean(order.is_credit),
  };

  return await apiFetch("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ================== CREDITS ================== */
export async function getCreditSummary({ tab = "open" } = {}) {
  const res = await apiFetch(`/credits?skip=0&limit=500`);
  const list = Array.isArray(res) ? res : [];
  const normalizedTab = tab === "cleared" ? "cleared" : "open";
  const rows = list
    .filter((credit) =>
      normalizedTab === "cleared"
        ? credit.status === "cleared"
        : credit.status !== "cleared"
    )
    .map((credit) => ({
      id: credit.id,
      customer: `Sale #${credit.sale_id}`,
      amount: credit.amount,
      date: credit.created_at,
      staff: credit.employee_id ? `Employee #${credit.employee_id}` : "—",
      clearedOn: credit.updated_at,
      status: credit.status,
    }));

  return {
    data: rows,
    total: rows.length,
  };
}

export async function markCreditCleared(id) {
  return await apiFetch(`/credits/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cleared" }),
  });
}

export async function clearPendingBill(id) {
  return markCreditCleared(id);
}

export { getCreditSummary as getCreditsSummary };

/* ================== REPORTS ================== */
export async function getReports({ from, to } = {}) {
  if (from && to) {
    return await apiFetch(
      `/reports/period?start_date=${encodeURIComponent(from)}&end_date=${encodeURIComponent(
        to
      )}`
    );
  }

  const dateParam = from ? `?report_date=${encodeURIComponent(from)}` : "";
  return await apiFetch(`/reports/daily${dateParam}`);
}

/* ================== SALES OVERVIEW (Employer) ================== */
export async function getSalesOverview() {
  return await apiFetch("/sales/overview");
}

/* ================== DAY CONTROL ================== */
export async function getDayStatus() {
  const res = await apiFetch("/days?skip=0&limit=30");
  if (!Array.isArray(res) || res.length === 0) {
    return null;
  }

  const sorted = [...res].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const openDay = sorted.find((day) => day.is_open);

  if (openDay) {
    return {
      id: openDay.id,
      isOpen: true,
      date: openDay.date,
    };
  }

  const latest = sorted[0];
  return {
    id: latest?.id ?? null,
    isOpen: false,
    date: latest?.date ?? null,
  };
}

export async function openSalesDay() {
  return await apiFetch("/days/open", { method: "POST" });
}

export async function closeSalesDay() {
  return await apiFetch("/days/close", { method: "POST" });
}

export async function getDayHistory() {
  const res = await apiFetch("/days?skip=0&limit=30");
  if (!Array.isArray(res)) {
    return [];
  }

  return res
    .map((day) => ({
      id: day.id,
      date: day.date,
      is_open: day.is_open,
      opened_by_id: day.opened_by_id,
      closed_by_id: day.closed_by_id,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
/* ================== AUTH HELPERS ================== */
export function logoutApi() {
  clearToken();
}
