import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct } from "../../services/api";

const CATEGORIES = ["all", "Detergents", "Beverages"];

export default function EmployerProductsPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function refresh() {
    setLoading(true);
    const res = await getProducts({ category, search });
    setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      sku: form.get("sku"),
      category: form.get("category"),
      price: Number(form.get("price")),
      stock: Number(form.get("stock")),
    };
    if (editing) await updateProduct(editing.id, payload);
    else await createProduct(payload);
    setModalOpen(false);
    setEditing(null);
    await refresh();
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="px-3 py-2 rounded-2xl shadow bg-black text-white"
        >
          Add Product
        </button>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="inline-flex rounded-xl border overflow-hidden">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 ${category === c ? "bg-gray-900 text-white" : "bg-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product…"
          className="border rounded-xl px-3 py-2"
          aria-label="Search products"
        />
        <button onClick={refresh} className="px-3 py-2 rounded-xl border">
          Apply
        </button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  No results
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.sku}</td>
                  <td className="p-3">{r.category}</td>
                  <td className="p-3 text-right">{r.price}</td>
                  <td className="p-3 text-right">{r.stock}</td>
                  <td className="p-3 text-right">
                    <button
                      className="px-2 py-1 rounded-lg border"
                      onClick={() => {
                        setEditing(r);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{editing ? "Edit Product" : "Add Product"}</h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="px-2 py-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <input
                name="name"
                defaultValue={editing?.name || ""}
                placeholder="Name"
                className="border rounded-xl px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="sku"
                  defaultValue={editing?.sku || ""}
                  placeholder="SKU"
                  className="border rounded-xl px-3 py-2"
                  required
                />
                <select
                  name="category"
                  defaultValue={editing?.category || "Detergents"}
                  className="border rounded-xl px-3 py-2"
                >
                  <option>Detergents</option>
                  <option>Beverages</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editing?.price ?? 0}
                  placeholder="Price"
                  className="border rounded-xl px-3 py-2"
                  required
                />
                <input
                  name="stock"
                  type="number"
                  defaultValue={editing?.stock ?? 0}
                  placeholder="Stock"
                  className="border rounded-xl px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  className="px-3 py-2 rounded-xl border"
                >
                  Cancel
                </button>
                <button className="px-3 py-2 rounded-2xl shadow bg-black text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}