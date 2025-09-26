import React, { useEffect, useState, useCallback } from "react";
import Card from "../../components/shared/Card";
import { getProducts, getCategories, createSale } from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function NewSalePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      setCategories(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("Failed to load categories");
    }
  }, []);

  // ✅ Fetch products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const data = Array.isArray(res?.data) ? res.data : [];

      const filteredByCategory = (() => {
        if (category === "all") return data;
        const id = Number(category);
        if (!Number.isFinite(id)) return data;
        return data.filter((item) => item.category_id === id);
      })();

      const filtered = search
        ? filteredByCategory.filter((item) => {
            const name = item.name?.toLowerCase() ?? "";
            const sku = item.sku?.toLowerCase() ?? "";
            const query = search.toLowerCase();
            return name.includes(query) || sku.includes(query);
          })
        : filteredByCategory;

      setProducts(filtered);
    } catch (err) {
      console.error("Error loading products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  const getCategoryName = useCallback(
    (categoryId) => {
      const match = categories.find((cat) => cat.id === categoryId);
      return match?.name ?? "Unassigned";
    },
    [categories]
  );

  // ✅ Add product to cart
  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  // ✅ Remove product from cart
  function removeFromCart(id) {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  // ✅ Place order
  async function handleNewOrder() {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    try {
      if (!user?.id) {
        toast.error("You need to be logged in to record a sale.");
        return;
      }

      await createSale({
        employee_id: Number(user.id),
        items: cart.map((c) => ({
          product_id: c.id,
          quantity: c.qty,
        })),
      });

      toast.success("Sale created successfully");
      setCart([]);
      await loadProducts();
    } catch (err) {
      console.error("Error creating sale:", err);
      toast.error("Failed to create sale");
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Product Section */}
      <div className="lg:col-span-3 space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product…"
            className="border px-3 py-2 rounded flex-1"
          />
          <button onClick={loadProducts} className="btn btn-primary">
            Apply
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <p>Loading products…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Card
                key={p.id}
                className="p-3 flex flex-col items-center cursor-pointer hover:shadow-lg"
                onClick={() => addToCart(p)}
              >
                <img
                  src={p.image_url || "https://via.placeholder.com/100"}
                  alt={p.name}
                  className="w-20 h-20 object-cover mb-2"
                />
                <h3 className="text-sm font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-500">
                  {getCategoryName(p.category_id)}
                </p>
                <p className="font-bold">KES {p.price}</p>
                <p className="text-xs text-gray-400">Stock: {p.stock}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items in cart</p>
          ) : (
            <ul className="space-y-2">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border-b pb-1"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.qty} × KES {item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      KES {item.qty * item.price}
                    </span>
                    <button
                      className="text-red-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="mt-4">
              <p className="font-bold mb-2">
                Total: KES {cart.reduce((sum, c) => sum + c.price * c.qty, 0)}
              </p>
              <button
                onClick={handleNewOrder}
                className="btn btn-primary w-full"
              >
                Place Order
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
