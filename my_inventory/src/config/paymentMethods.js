export const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "mpesa", label: "M-Pesa" },
  { id: "card", label: "Card" },
];

export function resolvePaymentLabel(id) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
}
