// src/pages/manager/ManagerProductsPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  getCategories,
  getSuppliers,
  createCategory,
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
  category_name: "",
  supplier_id: "",
  image_url: "",
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
  return (base || "PROD") + "-" + suffix;
};

const placeholderImg = "https://via.placeholder.com/80x80.png?text=No+Image";

export default function ManagerProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0 });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT_FORM });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const data = res.data || [];
      setProducts(data);
      setStats({
        total: data.length,
        lowStock: data.filter((p) => Number(p.stock) < 10).length,
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
    products.forEach((prod) => {
      if (prod.category?.id && prod.category?.name) {
        map.set(prod.category.id, prod.category.name);
      }
    });
    return map;
  }, [categories, products]);

  const supplierLookup = useMemo(() => {
    const map = new Map();
    suppliers.forEach((sup) => map.set(sup.id, sup.name));
    products.forEach((prod) => {
      if (prod.supplier?.id && prod.supplier?.name) {
        map.set(prod.supplier.id, prod.supplier.name);
      }
    });
    return map;
  }, [suppliers, products]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(Array.from(categoryLookup.values()).filter(Boolean))).sort(),
    [categoryLookup]
  );

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
      for (const [id, label] of categoryLookup.entries()) {
        if (!label) continue;
        const labelLower = label.toLowerCase();
        if (nameLower.includes(labelLower)) {
          return String(id);
        }
      }
      return "";
    },
    [categoryLookup]
  );

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...EMPTY_PRODUCT_FORM });
    setShowForm(true);
  };

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
          const suggested = suggestCategoryId(value);
          if (suggested) {
            nextState.category_id = suggested;
            nextState.category_name = getCategoryName(Number(suggested));
          }
        }
        return nextState;
      }
      if (name === "category_name") {
        const match = categories.find(
          (cat) => cat.name.toLowerCase() === value.toLowerCase()
        );
        return {
          ...prev,
          category_name: value,
          category_id: match ? String(match.id) : "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSupplierChange = (e) => {
    setForm((prev) => ({ ...prev, supplier_id: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setForm((prev) => ({ ...prev, image_url: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image_url: reader.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error("Product name is required.");
      return;
    }

    const priceValue = Number(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const stockValue = Number(form.stock);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    if (!form.supplier_id) {
      toast.error("Please select a supplier.");
      return;
    }

    let categoryId = form.category_id ? Number(form.category_id) : undefined;
    const categoryName = form.category_name.trim();

    if (!categoryId && categoryName) {
      const matched = categories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (matched) {
        categoryId = matched.id;
      } else {
        try {
          const newCategory = await createCategory({ name: categoryName });
          if (newCategory?.id) {
            categoryId = newCategory.id;
            setCategories((prev) => [...prev, newCategory]);
          }
        } catch (err) {
          console.error("Could not create category", err);
          toast.error(
            "Unable to create category automatically. Choose an existing one."
          );
          return;
        }
      }
    }

    if (!categoryId) {
      toast.error("Select or enter a category for this product.");
      return;
    }

    const payload = {
      name: trimmedName,
      sku: (form.sku && form.sku.trim()) || generateSku(trimmedName),
      price: priceValue,
      stock: stockValue,
      category_id: categoryId,
      supplier_id: Number(form.supplier_id),
      image_url: form.image_url || null,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><KPI icon={FiBox} label="Total Products" value={stats.total} /></Card>
        <Card><KPI icon={FiAlertTriangle} label="Low Stock (&lt;10)" value={stats.lowStock} /></Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Product List</h2>
          <Button variant="primary" onClick={openCreateModal}>
            Add Product
          </Button>
        </div>

        <DataTable
          columns={[
            {
              key: "image_url",
              label: "Image",
              render: (row) => (
                <img
                  src={row.image_url || placeholderImg}
                  alt={row.name}
                  className="h-10 w-10 rounded object-cover border"
                />
              ),
            },
            { key: "name", label: "Name", sortable: true },
            { key: "sku", label: "SKU" },
            {
              key: "category_id",
              label: "Category",
              render: (row) =>
                row.category?.name || getCategoryName(row.category_id),
            },
            {
              key: "supplier_id",
              label: "Supplier",
              render: (row) =>
                row.supplier?.name || getSupplierName(row.supplier_id),
            },
            { key: "price", label: "Price (KES)", sortable: true },
            {
              key: "stock",
              label: "Stock",
              sortable: true,
              render: (row) => {
                const pillClass =
                  Number(row.stock) < 10
                    ? "px-2 py-1 rounded text-xs bg-red-100 text-red-700"
                    : "px-2 py-1 rounded text-xs bg-green-100 text-green-700";
                return <span className={pillClass}>{row.stock}</span>;
              },
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
                  name: row.name || "",
                  sku: row.sku || "",
                  price: row.price ?? "",
                  stock: row.stock ?? "",
                  category_id: row.category_id ? String(row.category_id) : "",
                  category_name:
                    row.category?.name || getCategoryName(row.category_id),
                  supplier_id: row.supplier_id ? String(row.supplier_id) : "",
                  image_url: row.image_url || "",
                });
                setShowForm(true);
              }}
            >
              Edit
            </Button>
          )}
        />
      </Card>

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
              <input
                list="manager-category-options"
                name="category_name"
                value={form.category_name}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                placeholder="Start typing to search"
              />
              <datalist id="manager-category-options">
                {categoryOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <span className="text-xs text-gray-500">
                We remember categories you have used previously.
              </span>
            </div>

            <div className="grid gap-1">
              <label className="font-medium">Supplier</label>
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleSupplierChange}
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
              <label className="font-medium">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border rounded px-3 py-2"
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="h-20 w-20 rounded object-cover border"
                />
              )}
              <span className="text-xs text-gray-500">
                Supported formats: PNG, JPG. We store the image with the product for staff to preview.
              </span>
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
