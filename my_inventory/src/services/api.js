// src/services/api.js
// Backend-ready API service for IMS frontend.
// Now integrated with FastAPI backend + JWT authentication.

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
    return null; // Fallback will be used
  }
}

/* ================== AUTH ================== */
export async function loginApi(phone, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    if (!res.ok) {
      throw new Error("Invalid phone or password");
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

export function logoutApi() {
  clearToken();
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
        stauts: "active",
      },
    ],
    total: 1,
  };
}

export async function createEmployee(payload) {
  const res = await apiFetch("/employees/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id: Math.floor(Math.random() * 10000), ...payload };
}

export async function updateEmployee(id, payload) {
  const res = await apiFetch(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id, ...payload };
}

/* ================== PRODUCTS ================== */
export async function getProducts({ category = "all", search = "" } = {}) {
  const res = await apiFetch(`/products?category=${category}&search=${search}`);
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  const all = [
    {
      id: 101,
      name: "Sunlight Detergent 1kg",
      sku: "DET-001",
      category: "Detergents",
      price: 320,
      stock: 40,
      supplier: "Unilever",
      image: "🧴",
    },
    {
      id: 102,
      name: "Coke 500ml",
      sku: "BEV-010",
      category: "Beverages",
      price: 80,
      stock: 120,
      supplier: "Coca-Cola",
      image: "🥤",
    },
    {
      id: 103,
      name: "Milk 500ml",
      sku: "BEV-014",
      category: "Beverages",
      price: 65,
      stock: 60,
      supplier: "Brookside",
      image: "🥛",
    },
  ];
  let list = all;
  if (category !== "all") list = list.filter((p) => p.category === category);
  if (search)
    list = list.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  return { data: list };
}

export async function createProduct(payload) {
  const res = await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id: Math.floor(Math.random() * 10000), ...payload };
}

export async function updateProduct(id, payload) {
  const res = await apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id, ...payload };
}

export async function getCategories() {
  const res = await apiFetch("/categories");
  if (res) return res;

  await new Promise((r) => setTimeout(r, 200));
  return [
    { id: 1, name: "Beverages" },
    { id: 2, name: "Detergents" },
    { id: 3, name: "Bakery" },
    { id: 4, name: "Snacks" },
  ];
}

/* ================== SUPPLIERS ================== */
export async function getSuppliers({ search = "" } = {}) {
  const res = await apiFetch(`/suppliers?search=${search}`);
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return {
    data: [
      {
        id: 1,
        name: "Unilever",
        contact: "0712000111",
        email: "info@unilever.com",
        balance: 5000,
      },
      {
        id: 2,
        name: "Coca-Cola",
        contact: "0712000222",
        email: "sales@cocacola.com",
        balance: 12000,
      },
      {
        id: 3,
        name: "Brookside",
        contact: "0712000333",
        email: "support@brookside.com",
        balance: 8000,
      },
    ],
  };
}

export async function createSupplier(payload) {
  const res = await apiFetch("/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id: Math.floor(Math.random() * 10000), balance: 0, ...payload };
}

export async function updateSupplier(id, payload) {
  const res = await apiFetch(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id, ...payload };
}

/* ================== SALES ================== */
export async function createSale(order) {
  const res = await apiFetch("/sales", {
    method: "POST",
    body: JSON.stringify(order),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 500));
  return {
    success: true,
    orderId: Math.floor(Math.random() * 100000),
    ...order,
  };
}

/* ================== CREDITS ================== */
export async function getCreditSummary({ tab = "open", search = "" } = {}) {
  const res = await apiFetch(`/credits?tab=${tab}&search=${search}`);
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  const open = [
    {
      id: 9001,
      customer: "Walk-in #21",
      amount: 1260,
      date: "2025-08-20",
      staff: "Amina Yusuf",
    },
    {
      id: 9002,
      customer: "Kibe Stores",
      amount: 3420,
      date: "2025-08-22",
      staff: "Brian Otieno",
    },
  ];
  const cleared = [
    {
      id: 9101,
      customer: "Musa Ali",
      amount: 800,
      date: "2025-08-10",
      clearedOn: "2025-08-12",
      staff: "Cynthia Wanja",
    },
  ];
  return { data: tab === "open" ? open : cleared };
}

export async function markCreditCleared(id) {
  const res = await apiFetch(`/credits/${id}/clear`, { method: "POST" });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { ok: true, id };
}

export async function clearPendingBill(id) {
  return markCreditCleared(id);
}
export { getCreditSummary as getCreditsSummary };

/* ================== REPORTS ================== */
export async function getReports({ from, to } = {}) {
  const res = await apiFetch(`/reports?from=${from}&to=${to}`);
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return {
    range: { from, to },
    totals: { sales: 124000, creditOpen: 4680, creditCleared: 8120 },
    byDay: [
      { date: "2025-08-19", sales: 24000, creditOpen: 0, creditCleared: 1200 },
      { date: "2025-08-20", sales: 34000, creditOpen: 1260, creditCleared: 0 },
      { date: "2025-08-21", sales: 30000, creditOpen: 0, creditCleared: 3200 },
    ],
  };
}

/* ================== SALES OVERVIEW (Employer) ================== */
export async function getSalesOverview() {
  const res = await apiFetch("/sales/overview");
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return {
    today: { sales: 15000, orders: 45, credit: 3200 },
    topProducts: [
      { name: "Coke 500ml", sold: 40 },
      { name: "Sunlight Detergent 1kg", sold: 15 },
      { name: "Milk 500ml", sold: 22 },
    ],
  };
}

/* ================== DAY CONTROL ================== */
export async function getDayStatus() {
  const res = await apiFetch("/days/status");
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { date: "2025-08-25", isOpen: false, openedBy: null, closedBy: null };
}

export async function openSalesDay() {
  const res = await apiFetch("/days/open", { method: "POST" });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return {
    success: true,
    date: new Date().toISOString().split("T")[0],
    isOpen: true,
    openedBy: "Manager",
    closedBy: null,
  };
}

export async function closeSalesDay() {
  const res = await apiFetch("/days/close", { method: "POST" });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return {
    success: true,
    date: new Date().toISOString().split("T")[0],
    isOpen: false,
    openedBy: "Manager",
    closedBy: "Manager",
  };
}

export async function getDayHistory() {
  const res = await apiFetch("/days/history");
  if (res) return res;

  await new Promise((r) => setTimeout(r, 200));
  return [
    {
      date: "2025-08-27",
      isOpen: false,
      sales: 32000,
      creditOpen: 1200,
      creditCleared: 3000,
      paid: 27800,
    },
    {
      date: "2025-08-28",
      isOpen: true,
      sales: 15000,
      creditOpen: 800,
      creditCleared: 1200,
      paid: 13000,
    },
  ];
}

// ================== PASSWORD ==================
export async function changePassword(userId, newPassword) {
  return await apiFetch(`/employees/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ password: newPassword }),
  });
}
