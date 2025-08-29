// Mock API service for IMS frontend (UI-only).
// Replace with real Flask endpoints later.

// ================== EMPLOYEES ==================
export async function getEmployees({
  search = "",
  page = 1,
  pageSize = 10,
} = {}) {
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
  await new Promise((r) => setTimeout(r, 250));
  return { id: Math.floor(Math.random() * 10000), ...payload };
}

export async function updateEmployee(id, payload) {
  await new Promise((r) => setTimeout(r, 250));
  return { id, ...payload };
}

// ================== PRODUCTS ==================
export async function getProducts({ category = "all", search = "" } = {}) {
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
  await new Promise((r) => setTimeout(r, 250));
  return { id: Math.floor(Math.random() * 10000), ...payload };
}

export async function updateProduct(id, payload) {
  await new Promise((r) => setTimeout(r, 250));
  return { id, ...payload };
}

export async function getCategories() {
  await new Promise((r) => setTimeout(r, 200));
  return [
    { id: 1, name: "Beverages" },
    { id: 2, name: "Detergents" },
    { id: 3, name: "Bakery" },
    { id: 4, name: "Snacks" },
  ];
}

// ================== SUPPLIERS ==================
let suppliers = [
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
];

export async function getSuppliers({ search = "" } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  let list = suppliers;
  if (search) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contact.includes(search)
    );
  }
  return { data: list };
}

export async function createSupplier(payload) {
  await new Promise((r) => setTimeout(r, 250));
  const newSupplier = {
    id: Math.floor(Math.random() * 10000),
    balance: 0,
    ...payload,
  };
  suppliers.push(newSupplier);
  return newSupplier;
}

export async function updateSupplier(id, payload) {
  await new Promise((r) => setTimeout(r, 250));
  suppliers = suppliers.map((s) => (s.id === id ? { ...s, ...payload } : s));
  return suppliers.find((s) => s.id === id);
}

export async function recordSupplierPayment(id, amount) {
  await new Promise((r) => setTimeout(r, 250));
  suppliers = suppliers.map((s) =>
    s.id === id ? { ...s, balance: Math.max(0, s.balance - amount) } : s
  );
  return suppliers.find((s) => s.id === id);
}

// ================== SALES / POS ==================
export async function createSale(order) {
  await new Promise((r) => setTimeout(r, 500));
  return {
    success: true,
    orderId: Math.floor(Math.random() * 100000),
    ...order,
  };
}
// ================== CREDIT ==================
export async function getCreditSummary({ tab = "open", search = "" } = {}) {
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
  let list = tab === "open" ? open : cleared;
  if (search)
    list = list.filter((x) =>
      x.customer.toLowerCase().includes(search.toLowerCase())
    );
  return { data: list };
}

export async function markCreditCleared(id) {
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true, id };
}

export async function clearPendingBill(id) {
  // ✅ Alias for Employee page
  return markCreditCleared(id);
}
// Alias to match existing imports
export { getCreditSummary as getCreditsSummary };

// ================== REPORTS ==================
export async function getReports({ from, to } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  return {
    range: { from, to },
    totals: { sales: 124000, creditOpen: 4680, creditCleared: 8120 },
    byDay: [
      {
        date: "2025-08-19",
        sales: 24000,
        creditOpen: 0,
        creditCleared: 1200,
      },
      {
        date: "2025-08-20",
        sales: 34000,
        creditOpen: 1260,
        creditCleared: 0,
      },
      {
        date: "2025-08-21",
        sales: 30000,
        creditOpen: 0,
        creditCleared: 3200,
      },
      {
        date: "2025-08-22",
        sales: 36000,
        creditOpen: 3420,
        creditCleared: 3720,
      },
    ],
  };
}

// ================== SALES OVERVIEW (Employer) ==================
export async function getSalesOverview() {
  await new Promise((r) => setTimeout(r, 250));
  return {
    today: { sales: 15000, orders: 45, credit: 3200 },
    topProducts: [
      { name: "Coke 500ml", sold: 40 },
      { name: "Sunlight Detergent 1kg", sold: 15 },
      { name: "Milk 500ml", sold: 22 },
    ],
    recent: [
      {
        date: "2025-08-23",
        employee: "Alice",
        payment: "Cash",
        total: 2500,
      },
      {
        date: "2025-08-23",
        employee: "Brian",
        payment: "Card",
        total: 4000,
      },
    ],
  };
}

// ================== DAY CONTROL ==================
let currentDay = {
  date: "2025-08-25",
  isOpen: false,
  openedBy: null,
  closedBy: null,
};

let history = [
  {
    date: "2025-08-20",
    openedBy: "Manager A",
    closedBy: "Manager A",
    status: "Closed",
  },
  {
    date: "2025-08-21",
    openedBy: "Manager B",
    closedBy: "Manager B",
    status: "Closed",
  },
  {
    date: "2025-08-22",
    openedBy: "Manager C",
    closedBy: "Manager C",
    status: "Closed",
  },
];

export async function getDayStatus() {
  await new Promise((r) => setTimeout(r, 250));
  return currentDay;
}

export async function openSalesDay() {
  await new Promise((r) => setTimeout(r, 250));
  if (currentDay.isOpen) {
    return { success: false, message: "Day already open" };
  }
  currentDay = {
    date: new Date().toISOString().split("T")[0],
    isOpen: true,
    openedBy: "Manager",
    closedBy: null,
  };
  history.unshift({
    date: currentDay.date,
    openedBy: currentDay.openedBy,
    closedBy: null,
    status: "Open",
  });
  return { success: true, ...currentDay };
}

export async function closeSalesDay() {
  await new Promise((r) => setTimeout(r, 250));
  if (!currentDay.isOpen) {
    return { success: false, message: "No open day to close" };
  }
  currentDay.isOpen = false;
  currentDay.closedBy = "Manager";
  history = history.map((h) =>
    h.date === currentDay.date
      ? { ...h, closedBy: "Manager", status: "Closed" }
      : h
  );
  return { success: true, ...currentDay };
}

export async function getDayHistory() {
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
