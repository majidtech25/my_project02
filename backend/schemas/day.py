# backend/schemas/report.py
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional


# ===== Sales Report =====
class SalesSummary(BaseModel):
    total_sales: float = Field(..., description="Total sales amount for the period")
    total_credits: float = Field(..., description="Total credit sales amount")
    total_cash: float = Field(..., description="Total cash sales amount")
    number_of_sales: int = Field(..., description="Number of sales transactions")


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
    from_date: date = Field(..., description="Report start date")
    to_date: date = Field(..., description="Report end date (same as from_date if single day)")
    sales_summary: SalesSummary
    sales_by_employee: List[SalesByEmployee]
    sales_by_category: List[SalesByCategory]
    credit_summary: CreditSummary
    day_report: Optional[DayReport] = None  # may be None for multi-day ranges
