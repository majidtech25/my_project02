// src/pages/manager/ManagerProductsPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  getCategories,
  getSuppliers,
} from "../../services/api";
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

const generateSku = (name) => {
  const base = name
    ? name
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 8)
        .toUpperCase()
    : "PROD";
  const suffix = Date.now().toString().slice(-4);
  return `${base || "PROD"}-${suffix}`;
};

export default function ManagerProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0 });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

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

  const loadMetadata = useCallback(async () => {
    try {
      const [catRes, supplierRes] = await Promise.all([
        getCategories(),
        getSuppliers({ limit: 200 }),
      ]);
      setCategories(Array.isArray(catRes) ? catRes : []);
      const supplierList = Array.isArray(supplierRes?.data)
        ? supplierRes.data
        : [];
      setSuppliers(supplierList);
    } catch (err) {
      console.error("Error loading product metadata:", err);
      toast.error("Failed to load categories or suppliers.");
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadMetadata();
  }, [loadProducts, loadMetadata]);

  const categoryLookup = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const supplierLookup = useMemo(() => {
    const map = new Map();
    suppliers.forEach((sup) => map.set(sup.id, sup.name));
    return map;
  }, [suppliers]);

  const getCategoryName = useCallback(
    (categoryId) => categoryLookup.get(categoryId) || "Unassigned",
    [categoryLookup]
  );

  const getSupplierName = useCallback(
    (supplierId) => supplierLookup.get(supplierId) || "—",
    [supplierLookup]
  );

  const suggestCategoryId = useCallback(
    (productName) => {
      if (!productName) return "";
      const nameLower = productName.toLowerCase();
      let bestMatch = "";
      categories.forEach((cat) => {
        const catName = String(cat.name || "").toLowerCase();
        if (catName && nameLower.includes(catName)) {
          bestMatch = String(cat.id);
        } else {
          const tokens = catName.split(/\s+/).filter((token) => token.length > 2);
          if (
            tokens.length &&
            tokens.some((token) => token && nameLower.includes(token))
          ) {
            bestMatch = String(cat.id);
          }
        }
      });
      return bestMatch;
    },
    [categories]
  );

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...EMPTY_PRODUCT_FORM, sku: "" });
    setShowForm(true);
  };

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "name") {
        const nextState = {
          ...prev,
          name: value,
        };
        if (!editing) {
          nextState.sku = generateSku(value);
        }
        const suggested = suggestCategoryId(value);
        if (!editing && suggested) {
          nextState.category_id = suggested;
        }
        return nextState;
      }
      return { ...prev, [name]: value };
    });
  };

  // ✅ Save product
  const handleSave = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error("Product name is required.");
      return;
    }

    const priceValue = form.price === "" ? undefined : Number(form.price);
    if (priceValue === undefined || Number.isNaN(priceValue) || priceValue < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const stockValue = form.stock === "" ? undefined : Number(form.stock);
    if (stockValue === undefined || Number.isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    if (!form.category_id) {
      toast.error("Select a category for this product.");
      return;
    }

    if (!form.supplier_id) {
      toast.error("Select a supplier for this product.");
      return;
    }

    const payload = {
      name: trimmedName,
      sku: (form.sku && form.sku.trim()) || generateSku(trimmedName),
      price: priceValue,
      stock: stockValue,
      category_id: Number(form.category_id),
      supplier_id: Number(form.supplier_id),
    };

    try {
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
          <Button variant="primary" onClick={openCreateModal}>
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
              render: (row) => getCategoryName(row.category_id),
            },
            {
              key: "supplier_id",
              label: "Supplier",
              render: (row) => getSupplierName(row.supplier_id),
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
          <div className="space-y-4 text-sm">
            <div className="grid gap-1">
              <label className="font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                placeholder="e.g. Coca Cola 500ml"
              />
            </div>
            <div className="grid gap-1 text-xs text-gray-500">
              <span>SKU (auto-generated)</span>
              <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                {form.sku || "Will generate once the name is provided"}
              </span>
            </div>
            <div className="grid gap-1">
              <label className="font-medium">Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">
                We attempt to suggest a category from the product name. Adjust as needed.
              </span>
            </div>
            <div className="grid gap-1">
              <label className="font-medium">Supplier</label>
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Select supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="font-medium">Price (KES)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid gap-1">
              <label className="font-medium">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                min="0"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
