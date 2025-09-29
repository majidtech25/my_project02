import React, { useEffect, useState, useCallback } from "react";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import {
  getProducts,
  getCategories,
  createSale,
  getDayStatus,
} from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  PAYMENT_METHODS,
  resolvePaymentLabel,
} from "../../config/paymentMethods";

export default function NewSalePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saleType, setSaleType] = useState("paid"); // 'paid' | 'credit'
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  const [recentSale, setRecentSale] = useState(null);
  const [dayOpen, setDayOpen] = useState(false);
  const [dayInfo, setDayInfo] = useState(null);
  const [checkingDay, setCheckingDay] = useState(true);

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

  const refreshDayStatus = useCallback(async () => {
    setCheckingDay(true);
    try {
      const status = await getDayStatus();
      setDayOpen(Boolean(status?.isOpen));
      setDayInfo(status);
    } catch (err) {
      console.error("Failed to load day status", err);
        toast.error("Unable to verify if the sales day is open.");
      setDayOpen(false);
      setDayInfo(null);
    } finally {
      setCheckingDay(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();
    refreshDayStatus();
  }, [loadCategories, loadProducts, refreshDayStatus]);

  const getCategoryName = useCallback(
    (categoryId) => {
      const match = categories.find((cat) => cat.id === categoryId);
      return match?.name ?? "Unassigned";
    },
    [categories]
  );

  // ✅ Add product to cart
  function addToCart(product) {
    if (submitting || !dayOpen) return;
    setRecentSale(null);
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      const currentQty = existing?.qty ?? 0;
      const available = Math.max(0, (product.stock ?? 0) - currentQty);
      if (available <= 0) {
        toast.warn(`No more stock left for ${product.name}.`);
        return prev;
      }
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      if ((product.stock ?? 0) <= 0) {
        toast.warn(`Product ${product.name} is out of stock.`);
        return prev;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  // ✅ Remove product from cart
  function removeFromCart(id) {
    if (submitting) return;
    setRecentSale(null);
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSaleTypeChange(nextType) {
    if (submitting) return;
    setSaleType(nextType);
    if (nextType === "credit") {
      setPaymentMethod(null);
    } else if (!paymentMethod) {
      setPaymentMethod("cash");
    }
  }

  // ✅ Place order
  async function handleNewOrder() {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!dayOpen) {
      toast.error("Cannot create sales while the day is closed. Ask a manager to open the day first.");
      return;
    }

    if (!user?.id) {
      toast.error("You need to be logged in to record a sale.");
      return;
    }

    if (saleType === "paid" && !paymentMethod) {
      toast.error("Select a payment method to complete this sale.");
      return;
    }

    const orderPayload = {
      employee_id: Number(user.id),
      items: cart.map((c) => ({
        product_id: c.id,
        quantity: c.qty,
      })),
      is_credit: saleType === "credit",
    };

    if (saleType === "paid") {
      orderPayload.payment_method = paymentMethod;
    }

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
    setSubmitting(true);
    try {
      const result = await createSale(orderPayload);
      const isCredit = Boolean(result?.is_credit ?? saleType === "credit");
      const resolvedPaymentMethod = result?.payment_method ?? (isCredit ? null : paymentMethod);
      const paymentLabel = resolvedPaymentMethod
        ? resolvePaymentLabel(resolvedPaymentMethod)
        : null;
      const saleId = result?.id ?? null;
      const recordedTotal = result?.total_amount ?? cartTotal;

      toast.success(
        isCredit
          ? "Order saved as credit. Remember to clear it once paid."
          : `Sale recorded and paid via ${paymentLabel}.`
      );

      setRecentSale({
        id: saleId,
        total: recordedTotal,
        isCredit,
        paymentMethod: resolvedPaymentMethod,
        timestamp: result?.date ?? new Date().toISOString(),
      });

      try {
        window.localStorage.setItem(
          "ims:sale:created",
          String(Date.now())
        );
        window.dispatchEvent(new CustomEvent("ims:sale:created"));
      } catch (err) {
        console.warn("Failed to broadcast sale creation", err);
      }

      setCart([]);
      await loadProducts();
      setSaleType("paid");
      setPaymentMethod("cash");
      refreshDayStatus();
    } catch (err) {
      console.error("Error creating sale:", err);
      toast.error(err?.message ?? "Failed to create sale");
    } finally {
      setSubmitting(false);
    }
  }

  const cartTotalValue = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const selectedMethodLabel = resolvePaymentLabel(paymentMethod) || "Pay";

  const getReservedQty = useCallback(
    (productId) => cart.find((item) => item.id === productId)?.qty ?? 0,
    [cart]
  );

  const getDisplayStock = useCallback(
    (product) => {
      const reserved = getReservedQty(product.id);
      const baseStock = product.stock ?? 0;
      return Math.max(0, baseStock - reserved);
    },
    [getReservedQty]
  );

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
                onClick={() => {
                  if (!dayOpen) {
                    toast.error("Sales day is closed. Cannot add items.");
                    return;
                  }
                  addToCart(p);
                }}
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
                <p className="text-xs text-gray-400">
                  Stock: {getDisplayStock(p)} / {p.stock ?? 0}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Cart</h2>
          <div className="mb-3 text-sm">
            {checkingDay ? (
              <span className="text-gray-500">Checking day status…</span>
            ) : dayOpen ? (
              <span className="text-green-600">
                Day open{dayInfo?.date ? ` (${dayInfo.date})` : ""}. You're good to go.
              </span>
            ) : (
              <span className="text-red-600">
                Day is closed. Ask a manager to open today before recording sales.
              </span>
            )}
          </div>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items in cart</p>
          ) : (
            <>
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
                        className="text-red-500 disabled:opacity-50"
                        onClick={() => removeFromCart(item.id)}
                        disabled={submitting}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Payment timing
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleSaleTypeChange("paid")}
                      className={`border rounded px-3 py-2 text-sm font-medium transition ${
                        saleType === "paid"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:border-blue-400"
                      } disabled:opacity-50`}
                      disabled={submitting}
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleSaleTypeChange("credit")}
                      className={`border rounded px-3 py-2 text-sm font-medium transition ${
                        saleType === "credit"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-700 hover:border-amber-400"
                      } disabled:opacity-50`}
                      disabled={submitting}
                    >
                      Record as Credit
                    </button>
                  </div>
                </div>

                {saleType === "paid" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Payment method
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`border rounded px-2 py-2 text-sm font-medium transition text-center ${
                            paymentMethod === method.id
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 hover:border-blue-400"
                          } disabled:opacity-50`}
                          disabled={submitting}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>KES {cartTotalValue}</span>
                </div>

                <button
                  onClick={handleNewOrder}
                  className="btn btn-primary w-full disabled:opacity-50"
                  disabled={
                    submitting ||
                    !dayOpen ||
                    (saleType === "paid" && !paymentMethod)
                  }
                >
                  {submitting
                    ? "Saving order..."
                    : saleType === "credit"
                    ? "Save as Credit"
                    : `Complete (${selectedMethodLabel})`}
                </button>
              </div>
            </>
          )}
        </Card>
        {!dayOpen && !checkingDay && (
          <Card className="p-4 mt-4 bg-amber-50 border border-amber-200">
            <h3 className="text-md font-semibold text-amber-700">Sales day is closed</h3>
            <p className="text-sm text-amber-600">
              You cannot create new sales until a manager opens today&apos;s sales day.
            </p>
            <Button
              onClick={refreshDayStatus}
              className="mt-3"
            >
              Check Again
            </Button>
          </Card>
        )}
        {recentSale && (
          <Card className="p-4 mt-4 space-y-3 border border-dashed">
            <h3 className="text-md font-semibold">Latest order recap</h3>
            <div className="text-sm space-y-1">
              {recentSale.id && (
                <p>
                  <span className="font-medium text-gray-600">Sale ID:</span> #{recentSale.id}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-600">Total:</span> KES {recentSale.total}
              </p>
              <p>
                <span className="font-medium text-gray-600">Status:</span>{" "}
                {recentSale.isCredit ? (
                  <span className="text-amber-600 font-semibold">Pending payment (credit)</span>
                ) : (
                  <span className="text-green-600 font-semibold">
                    Paid via {resolvePaymentLabel(recentSale.paymentMethod)}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                Recorded on {new Date(recentSale.timestamp).toLocaleString()}
              </p>
            </div>
            {recentSale.isCredit && (
              <p className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded px-3 py-2">
                Take payment from the <span className="font-semibold">Pending Bills</span> screen once the customer clears the balance.
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
