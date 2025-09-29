# backend/schemas/report.py
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional


# ===== Sales Report =====
class SalesSummary(BaseModel):
    total_sales: float
    total_credits: float
    total_cash: float
    number_of_sales: int


class SalesByEmployee(BaseModel):
    employee_id: int
    employee_name: str
    total_sales: float
    total_credits: float
    total_cash: float
    number_of_sales: int


class SalesByCategory(BaseModel):
    category_id: int
    category_name: str
    total_sales: float
    number_of_items: int


class SalesByPaymentMethod(BaseModel):
    payment_method: str
    total_sales: float
    number_of_sales: int


# ===== Credit Report =====
class CreditSummary(BaseModel):
    open_credits: float
    cleared_credits: float
    number_of_open_credits: int
    number_of_cleared_credits: int


# ===== Day Report =====
class DayReport(BaseModel):
    date: date
    is_open: int = Field(..., description="1=open, 0=closed")
    opened_by: str
    closed_by: Optional[str] = None
    total_sales: float
    total_credits: float
    total_cash: float


# ===== Final Combined Report =====
class ReportOut(BaseModel):
    sales_summary: SalesSummary
    sales_by_employee: List[SalesByEmployee]
    sales_by_category: List[SalesByCategory]
    sales_by_payment_method: List[SalesByPaymentMethod]
    credit_summary: CreditSummary
    day_report: Optional[DayReport] = None


# ===== Inventory Report =====
class InventoryReportItem(BaseModel):
    product: str
    sku: str
    stock: int
    category: Optional[str]
    supplier: Optional[str]


# ===== Supplier Balances =====
class SupplierBalanceItem(BaseModel):
    supplier: str
    balance: float


# ===== Top Products =====
class TopProductItem(BaseModel):
    product: str
    quantity: int
    total_sales: float
