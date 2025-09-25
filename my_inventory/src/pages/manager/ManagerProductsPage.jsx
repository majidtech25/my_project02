// src/pages/manager/ManagerProductsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getProducts, createProduct, updateProduct } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import Button from "../../components/shared/Button";
import DataTable from "../../components/shared/DataTable";
import ModalCard from "../../components/shared/ModalCard";
import { toast } from "react-toastify";
import { FiBox, FiAlertTriangle } from "react-icons/fi";

const EMPTY_PRODUCT_FORM = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  category_id: "",
  supplier_id: "",
};

export default function ManagerProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0 });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT_FORM });

  // ✅ Load products
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

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save product
  const handleSave = async () => {
    try {
      const payload = {
        name: form.name?.trim(),
        sku: form.sku?.trim(),
        price: form.price ? Number(form.price) : undefined,
        stock: form.stock ? Number(form.stock) : undefined,
        category_id: form.category_id
          ? Number(form.category_id)
          : undefined,
        supplier_id: form.supplier_id
          ? Number(form.supplier_id)
          : undefined,
      };

      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(payload);
        toast.success("Product added successfully!");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY_PRODUCT_FORM });
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Products & Categories (Manager)</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><KPI icon={FiBox} label="Total Products" value={stats.total} /></Card>
        <Card><KPI icon={FiAlertTriangle} label="Low Stock (<10)" value={stats.lowStock} /></Card>
      </div>

      {/* Products Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Product List</h2>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY_PRODUCT_FORM });
              setShowForm(true);
            }}
          >
            Add Product
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "sku", label: "SKU" },
            {
              key: "category_id",
              label: "Category",
              render: (row) =>
                typeof row.category_id === "number"
                  ? `Category #${row.category_id}`
                  : "Unassigned",
            },
            { key: "price", label: "Price (KES)", sortable: true },
            {
              key: "stock",
              label: "Stock",
              sortable: true,
              render: (row) => (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    row.stock < 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
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
                  price: row.price,
                  stock: row.stock,
                  category_id:
                    typeof row.category_id === "number"
                      ? String(row.category_id)
                      : "",
                  supplier_id:
                    typeof row.supplier_id === "number"
                      ? String(row.supplier_id)
                      : "",
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
        <ModalCard
          title={editing ? "Edit Product" : "Add Product"}
          onClose={() => setShowForm(false)}
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-40 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-medium">SKU:</span>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-40 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Category ID:</span>
              <input
                type="number"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-40 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Supplier ID:</span>
              <input
                type="number"
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-40 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Price (KES):</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-40 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Stock:</span>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-40 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </ModalCard>
      )}
    </div>
  );
}
