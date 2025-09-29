// src/pages/employee/PendingBillsPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getCreditSummary, markCreditCleared, getMySales } from "../../services/api";
import Card from "../../components/shared/Card";
import KPI from "../../components/shared/KPI";
import DataTable from "../../components/shared/DataTable";
import Button from "../../components/shared/Button";
import { toast } from "react-toastify";
import { FiCreditCard, FiDollarSign, FiPrinter, FiRefreshCcw } from "react-icons/fi";
import { PAYMENT_METHODS, resolvePaymentLabel } from "../../config/paymentMethods";
import { useAuth } from "../../context/AuthContext";

const DISMISSED_KEY = "ims:pendingReceipts:dismissed";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString() + " " + parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReceiptHtml({ sale, employeeName }) {
  const rows = sale.items
    .map((item) => {
      const lineTotal = (item.price || 0) * (item.quantity || 0);
      const label = item.product_name || ("Product #" + item.product_id);
      return (
        "<tr>" +
        "<td>" + escapeHtml(label) + "</td>" +
        "<td class=\"right\">" + item.quantity + "</td>" +
        "<td class=\"right\">" + (item.price || 0).toFixed(2) + "</td>" +
        "<td class=\"right\">" + lineTotal.toFixed(2) + "</td>" +
        "</tr>"
      );
    })
    .join("");

  const paymentLabel = resolvePaymentLabel(sale.payment_method);

  const parts = [
    "<!DOCTYPE html>",
    "<html>",
    "  <head>",
    "    <meta charset=\"utf-8\" />",
    "    <title>Sale #" + sale.id + " Receipt</title>",
    "    <style>",
    "      body { font-family: Arial, sans-serif; margin: 0; padding: 16px; color: #111; }",
    "      h1 { font-size: 18px; margin-bottom: 4px; }",
    "      table { width: 100%; border-collapse: collapse; }",
    "      th, td { padding: 4px 0; font-size: 12px; }",
    "      th { text-align: left; border-bottom: 1px solid #ccc; }",
    "      td.right { text-align: right; }",
    "      .meta { font-size: 12px; margin-bottom: 12px; }",
    "      .total { font-size: 14px; font-weight: bold; margin-top: 12px; text-align: right; }",
    "      .footer { font-size: 11px; margin-top: 24px; text-align: center; color: #555; }",
    "    </style>",
    "  </head>",
    "  <body>",
    "    <h1>Inventory POS Receipt</h1>",
    "    <div class=\"meta\">",
    "      <div>Sale #: <strong>" + sale.id + "</strong></div>",
    "      <div>Date: <strong>" + escapeHtml(formatDate(sale.date)) + "</strong></div>",
    "      <div>Cashier: <strong>" + escapeHtml(employeeName) + "</strong></div>",
    "      <div>Payment Method: <strong>" + escapeHtml(paymentLabel) + "</strong></div>",
    "    </div>",
    "    <table>",
    "      <thead>",
    "        <tr>",
    "          <th>Item</th>",
    "          <th class=\"right\">Qty</th>",
    "          <th class=\"right\">Price</th>",
    "          <th class=\"right\">Amount</th>",
    "        </tr>",
    "      </thead>",
    "      <tbody>" + rows + "</tbody>",
    "    </table>",
    "    <div class=\"total\">Total: " + formatCurrency(sale.total_amount) + "</div>",
    "    <div class=\"footer\">Thank you for your purchase!</div>",
    "  </body>",
    "</html>",
  ];

  return parts.join("\n");
}

function printReceipt({ sale, employeeName }) {
  const html = buildReceiptHtml({ sale, employeeName });
  const printWindow = window.open("", "PRINT", "height=600,width=420");
  if (!printWindow) {
    toast.error("Please allow pop-ups to print receipts.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

export default function PendingBillsPage() {
  const { user } = useAuth();
  const [creditLoading, setCreditLoading] = useState(false);
  const [credits, setCredits] = useState([]);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [clearing, setClearing] = useState({ id: null, method: null });
  const [dismissedIds, setDismissedIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn("Failed to read dismissed receipts from storage", err);
      return [];
    }
  });

  const role = (user?.role || "").toString().toLowerCase();
  const canRestore = role && role !== "employee";
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedIds));
    } catch (err) {
      console.warn("Failed to persist dismissed receipts", err);
    }
  }, [dismissedIds]);

  const loadCredits = useCallback(async () => {
    setCreditLoading(true);
    try {
      const res = await getCreditSummary({ tab: "open" });
      setCredits(res?.data || []);
    } catch (err) {
      console.error("Error loading credit bills:", err);
      toast.error("Failed to load credit bills.");
    } finally {
      setCreditLoading(false);
    }
  }, []);

  const loadReceipts = useCallback(async () => {
    setReceiptLoading(true);
    try {
      const res = await getMySales({ startDate: todayKey, endDate: todayKey });
      setReceipts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading receipts:", err);
      toast.error("Failed to load receipts.");
    } finally {
      setReceiptLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadCredits();
    loadReceipts();
  }, [loadCredits, loadReceipts]);

  const todaysReceipts = useMemo(() => {
    return receipts.filter((sale) => {
      if (!sale?.date) return false;
      const saleDate = new Date(sale.date);
      if (Number.isNaN(saleDate.getTime())) return false;
      return saleDate.toISOString().slice(0, 10) === todayKey;
    });
  }, [receipts, todayKey]);

  const visibleReceipts = todaysReceipts.filter(
    (sale) => !dismissedIds.includes(sale.id)
  );
  const printableReceipts = visibleReceipts.filter(
    (sale) => sale.is_paid && !sale.is_credit
  );
  const outstandingCreditValue = credits.reduce(
    (sum, bill) => sum + (bill.amount || 0),
    0
  );

  const stats = {
    receipts: visibleReceipts.length,
    printable: printableReceipts.length,
    creditCount: credits.length,
    creditValue: outstandingCreditValue,
  };

  const handlePrintReceipt = (sale) => {
    if (sale.is_credit || !sale.is_paid) {
      toast.warn("This sale is marked as credit. Clear payment before printing a receipt.");
      return;
    }
    printReceipt({ sale, employeeName: user?.name || "Cashier" });
  };

  const handleDismissReceipt = (id) => {
    setDismissedIds((prev) => {
      if (prev.includes(id)) return prev;
      return prev.concat(id);
    });
    toast.info("Receipt cleared from this screen.");
  };

  const handleRestoreReceipts = () => {
    if (!canRestore) return;
    setDismissedIds([]);
    toast.success("All receipts restored.");
  };

  const handleRefresh = () => {
    loadReceipts();
    loadCredits();
  };

  const handleClearCredit = async (id, methodId) => {
    setClearing({ id, method: methodId });
    try {
      await markCreditCleared(id, methodId);
      toast.success(
        "Bill #" + id + " cleared via " + resolvePaymentLabel(methodId) + "."
      );
      await loadCredits();
      await loadReceipts();
    } catch (err) {
      console.error("Failed to clear credit:", err);
      toast.error(err?.message || "Unable to clear this credit right now.");
    } finally {
      setClearing({ id: null, method: null });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pending Bills & Receipts</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <FiRefreshCcw /> Refresh
          </Button>
          {dismissedIds.length > 0 && canRestore && (
            <Button
              variant="secondary"
              onClick={handleRestoreReceipts}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600"
            >
              Restore Hidden
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <KPI icon={FiPrinter} label="Receipts Waiting" value={stats.receipts} />
        </Card>
        <Card>
          <KPI icon={FiDollarSign} label="Ready to Print" value={stats.printable} />
        </Card>
        <Card>
          <KPI icon={FiCreditCard} label="Open Credits" value={stats.creditCount} />
        </Card>
        <Card>
          <KPI
            icon={FiDollarSign}
            label="Credit Value (KES)"
            value={formatCurrency(stats.creditValue)}
          />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today&apos;s Receipts</h2>
          <span className="text-sm text-gray-500">
            Showing sales recorded on {todayKey}
          </span>
        </div>

        {receiptLoading ? (
          <p className="text-gray-500">Loading receipts…</p>
        ) : visibleReceipts.length === 0 ? (
          <p className="text-gray-500">
            No pending receipts for today. Completed sales will appear here instantly.
          </p>
        ) : (
          <div className="space-y-4">
            {visibleReceipts.map((sale) => {
              const isPrintable = sale.is_paid && !sale.is_credit;
              return (
                <div key={sale.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="text-md font-semibold">Sale #{sale.id}</h3>
                      <p className="text-sm text-gray-500">Recorded {formatDate(sale.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {sale.is_credit ? "Status: Credit" : "Status: Paid"}
                      </p>
                      <p className="font-semibold text-lg">{formatCurrency(sale.total_amount)}</p>
                      {!sale.is_credit && sale.payment_method ? (
                        <p className="text-xs text-gray-500">
                          {resolvePaymentLabel(sale.payment_method)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2">Item</th>
                          <th className="py-2 text-right">Qty</th>
                          <th className="py-2 text-right">Price</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.map((item) => {
                          const label = item.product_name || ("Product #" + item.product_id);
                          const lineAmount = (item.price || 0) * (item.quantity || 0);
                          return (
                            <tr key={item.id} className="border-b last:border-b-0">
                              <td className="py-2 pr-4">{label}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.price || 0)}</td>
                      <td className="py-2 text-right">{formatCurrency(lineAmount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => handlePrintReceipt(sale)}
                      disabled={!isPrintable}
                      className="flex items-center gap-2"
                    >
                      <FiPrinter /> Print Receipt
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDismissReceipt(sale.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Clear from Screen
                    </Button>
                    {sale.is_credit ? (
                      <p className="text-xs text-amber-600 bg-amber-100 border border-amber-200 rounded px-2 py-1">
                        Credit sales must be cleared before printing.
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-2">Open Credit Bills</h2>
        <DataTable
          columns={[
            { key: "customer", label: "Customer" },
            { key: "amount", label: "Amount (KES)", sortable: true },
            { key: "date", label: "Date", sortable: true },
            { key: "staff", label: "Handled By" },
          ]}
          data={credits}
          loading={creditLoading}
          rowActions={(row) => (
            <div className="flex flex-col gap-1">
              {PAYMENT_METHODS.map((method) => {
                const isBusy = clearing.id === row.id && clearing.method === method.id;
                const disabled = (clearing.id && clearing.id !== row.id) || isBusy;
                const baseClass = "text-xs px-2 py-1 border rounded transition ";
                const activeClass = isBusy
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-400";
                return (
                  <button
                    key={method.id}
                    onClick={() => handleClearCredit(row.id, method.id)}
                    disabled={disabled}
                    className={baseClass + activeClass + (disabled ? " disabled:opacity-50" : "")}
                  >
                    {isBusy ? "Clearing..." : "Clear as " + method.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </Card>
    </div>
  );
}
