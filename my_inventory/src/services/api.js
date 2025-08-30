// src/services/api.js
// Backend-ready API service for IMS frontend.
// Uses Flask backend if available, else falls back to mock data.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Small helper for backend requests
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(
      "API request failed, falling back to mock:",
      endpoint,
      err.message
    );
    return null; // Signals fallback
  }
}

/* ================== EMPLOYEES ================== */
export async function getEmployees({
  search = "",
  page = 1,
  pageSize = 10,
} = {}) {
  const res = await apiFetch(
    `/employees?search=${search}&page=${page}&pageSize=${pageSize}`
  );
  if (res) return res;

  // Mock fallback
  await new Promise((r) => setTimeout(r, 250));
  const all = [
    {
      id: 1,
      name: "Amina Yusuf",
      role: "Cashier",
      phone: "0712 000111",
      status: "active",
    },
    {
      id: 2,
      name: "Brian Otieno",
      role: "Cashier",
      phone: "0712 000222",
      status: "inactive",
    },
    {
      id: 3,
      name: "Cynthia Wanja",
      role: "Supervisor",
      phone: "0712 000333",
      status: "active",
    },
  ];
  const filtered = all.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );
  return {
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
  };
}

export async function createEmployee(payload) {
  const res = await apiFetch("/employees", {
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

export async function recordSupplierPayment(id, amount) {
  const res = await apiFetch(`/suppliers/${id}/payments`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { id, balance: 0 };
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

/* ================== CREDIT ================== */
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
      {
        date: "2025-08-22",
        sales: 36000,
        creditOpen: 3420,
        creditCleared: 3720,
      },
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
    recent: [
      { date: "2025-08-23", employee: "Alice", payment: "Cash", total: 2500 },
      { date: "2025-08-23", employee: "Brian", payment: "Card", total: 4000 },
    ],
  };
}

/* ================== DAY CONTROL ================== */
export async function getDayStatus() {
  const res = await apiFetch("/day/status");
  if (res) return res;

  await new Promise((r) => setTimeout(r, 250));
  return { date: "2025-08-25", isOpen: false, openedBy: null, closedBy: null };
}

export async function openSalesDay() {
  const res = await apiFetch("/day/open", { method: "POST" });
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
  const res = await apiFetch("/day/close", { method: "POST" });
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
  const res = await apiFetch("/day/history");
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
   