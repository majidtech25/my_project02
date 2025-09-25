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

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(`API error: ${res.status} - ${errMsg}`);
    }

    return await res.json();
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
  if (res) return res;

  // Mock fallback
  await new Promise((r) => setTimeout(r, 250));
  return {
    data: [
      {
        id: 1,
        name: "Deno Employer",
        role: "employer",
        phone: "0712000111",
        status: "active",
      },
    ],
    total: 1,
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
export async function getProducts({ category = "all", search = "" } = {}) {
  return await apiFetch(`/products?category=${category}&search=${search}`);
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

/* ================== SUPPLIERS ================== */
export async function getSuppliers({ search = "" } = {}) {
  return await apiFetch(`/suppliers?search=${search}`);
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
  return await apiFetch("/sales", {
    method: "POST",
    body: JSON.stringify(order),
  });
}

/* ================== CREDITS ================== */
export async function getCreditSummary({ tab = "open", search = "" } = {}) {
  return await apiFetch(`/credits?tab=${tab}&search=${search}`);
}

export async function markCreditCleared(id) {
  return await apiFetch(`/credits/${id}/clear`, { method: "POST" });
}

export async function clearPendingBill(id) {
  return markCreditCleared(id);
}

export { getCreditSummary as getCreditsSummary };

/* ================== REPORTS ================== */
export async function getReports({ from, to } = {}) {
  return await apiFetch(`/reports?from=${from}&to=${to}`);
}

/* ================== SALES OVERVIEW (Employer) ================== */
export async function getSalesOverview() {
  return await apiFetch("/sales/overview");
}

/* ================== DAY CONTROL ================== */
export async function getDayStatus() {
  return await apiFetch("/days/status");
}

export async function openSalesDay() {
  return await apiFetch("/days/open", { method: "POST" });
}

export async function closeSalesDay() {
  return await apiFetch("/days/close", { method: "POST" });
}

export async function getDayHistory() {
  return await apiFetch("/days/history");
}
/* ================== AUTH HELPERS ================== */
export function logoutApi() {
  clearToken();
}

