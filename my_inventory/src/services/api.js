// UI-only mocked API. Replace implementations in Step 4 with real fetch calls.

export async function getEmployees({ search = "", page = 1, pageSize = 10 } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  const all = [
    { id: 1, name: "Amina Yusuf", role: "Cashier", phone: "0712 000111", status: "active" },
    { id: 2, name: "Brian Otieno", role: "Cashier", phone: "0712 000222", status: "inactive" },
    { id: 3, name: "Cynthia Wanja", role: "Supervisor", phone: "0712 000333", status: "active" },
  ];
  const filtered = all.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
  return { data: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function createEmployee(payload) {
  await new Promise((r) => setTimeout(r, 250));
  return { id: Math.floor(Math.random() * 10000), ...payload };
}

export async function updateEmployee(id, payload) {
  await new Promise((r) => setTimeout(r, 250));
  return { id, ...payload };
}

export async function getProducts({ category = "all", search = "" } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  const all = [
    { id: 101, name: "Sunlight Detergent 1kg", sku: "DET-001", category: "Detergents", price: 320, stock: 40 },
    { id: 102, name: "Coke 500ml", sku: "BEV-010", category: "Beverages", price: 80, stock: 120 },
    { id: 103, name: "Milk 500ml", sku: "BEV-014", category: "Beverages", price: 65, stock: 60 },
  ];
  let list = all;
  if (category !== "all") list = list.filter((p) => p.category === category);
  if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
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

export async function getCreditSummary({ tab = "open", search = "" } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  const open = [
    { id: 9001, customer: "Walk-in #21", amount: 1260, date: "2025-08-20", staff: "Amina Yusuf" },
    { id: 9002, customer: "Kibe Stores", amount: 3420, date: "2025-08-22", staff: "Brian Otieno" },
  ];
  const cleared = [
    { id: 9101, customer: "Musa Ali", amount: 800, date: "2025-08-10", clearedOn: "2025-08-12", staff: "Cynthia Wanja" },
  ];
  let list = tab === "open" ? open : cleared;
  if (search) list = list.filter((x) => x.customer.toLowerCase().includes(search.toLowerCase()));
  return { data: list };
}

export async function markCreditCleared(id) {
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true, id };
}

export async function getReports({ from, to } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  return {
    range: { from, to },
    totals: { sales: 124000, creditOpen: 4680, creditCleared: 8120 },
    byDay: [
      { date: "2025-08-19", sales: 24000, creditOpen: 0, creditCleared: 1200 },
      { date: "2025-08-20", sales: 34000, creditOpen: 1260, creditCleared: 0 },
      { date: "2025-08-21", sales: 30000, creditOpen: 0, creditCleared: 3200 },
      { date: "2025-08-22", sales: 36000, creditOpen: 3420, creditCleared: 3720 },
    ],
  };
}