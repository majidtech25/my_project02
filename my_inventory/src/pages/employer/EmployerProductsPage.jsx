import React, { useEffect, useState, useCallback } from "react";
import { getProducts, createProduct, updateProduct } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import { toast } from "react-toastify";
import { FiBox, FiAlertTriangle } from "react-icons/fi";

export default function EmployerProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0 });

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "", price: "", stock: "" });

  // ✅ Fetch products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const data = res.data || [];
      setProducts(data);
      setStats({
        total: data.length,
        lowStock: data.filter((p) => p.stock < 10).length,
      });
    } catch (err) {
      console.error("Error loading products:", err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Save product
  const handleSave = async () => {
    try {
      if (editing) {
        await updateProduct(editing.id, form);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(form);
        toast.success("Product added successfully!");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", sku: "", category: "", price: "", stock: "" });
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Products & Categories</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI icon={FiBox} label="Total Products" value={stats.total} />
        </Card>
        <Card>
          <KPI
            icon={FiAlertTriangle}
            label="Low Stock (<10)"
            value={stats.lowStock}
          />
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Product List</h2>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Product
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "sku", label: "SKU" },
            { key: "category", label: "Category" },
            { key: "price", label: "Price (KES)", sortable: true },
            {
              key: "stock",
              label: "Stock",
              sortable: true,
              render: (row) => (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.stock < 10
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {row.stock}
                </span>
              ),
            },
          ]}
          data={products}
          loading={loading}
          rowActions={(row) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(row);
                setForm({
                  name: row.name,
                  sku: row.sku,
                  category: row.category,
                  price: row.price,
                  stock: row.stock,
                });
                setShowForm(true);
              }}
            >
              Edit
            </Button>
          )}
        />
      </Card>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">
              {editing ? "Edit Product" : "Add Product"}
            </h2>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}