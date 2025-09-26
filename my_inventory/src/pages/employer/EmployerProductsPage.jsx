// src/pages/employer/EmployerProductsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getProducts, getCategories, getSuppliers } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import { FiBox, FiLayers } from "react-icons/fi";
import { toast } from "react-toastify";

export default function EmployerProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({ total: 0 });

  // ✅ Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const data = res.data || [];
      setProducts(data);
      setStats({ total: data.length });
    } catch (err) {
      console.error("Error loading products:", err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load categories
  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("Failed to load categories.");
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
    (async () => {
      try {
        const supRes = await getSuppliers({ limit: 200 });
        setSuppliers(Array.isArray(supRes?.data) ? supRes.data : []);
      } catch (err) {
        console.error("Error loading suppliers:", err);
      }
    })();
  }, [loadProducts, loadCategories]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Products & Categories (Employer)
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <KPI icon={FiBox} label="Total Products" value={stats.total} />
        </Card>
        <Card>
          <KPI
            icon={FiLayers}
            label="Total Categories"
            value={categories.length}
          />
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
        <ul className="space-y-2 text-sm">
          {categories.length === 0 ? (
            <li className="text-gray-500">No categories available.</li>
          ) : (
            categories.map((cat) => (
              <li
                key={cat.id}
                className="px-3 py-2 border rounded-lg flex justify-between items-center"
              >
                <span>{cat.name}</span>
              </li>
            ))
          )}
        </ul>
      </Card>

      {/* Products Table */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Products</h2>
        <DataTable
          columns={[
            {
              key: "image_url",
              label: "Image",
              render: (row) => (
                <img
                  src={row.image_url || "https://via.placeholder.com/60x60.png?text=No+Image"}
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
              render: (row) => {
                const match = categories.find((cat) => cat.id === row.category_id);
                return match?.name || "Unassigned";
              },
            },
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
            {
              key: "supplier_id",
              label: "Supplier",
              render: (row) => {
                const supplier = suppliers.find((sup) => sup.id === row.supplier_id);
                return supplier?.name || "—";
              },
            },
          ]}
          data={products}
          loading={loading}
          rowActions={null} // 🚫 Employer cannot edit
        />
      </Card>
    </div>
  );
}
