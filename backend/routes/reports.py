# backend/routes/reports.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from db import get_db
from crud import report as crud_report
from schemas.report import (
    ReportOut,
    InventoryReportItem,
    SupplierBalanceItem,
    TopProductItem,
)
from auth.dependencies import require_role

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/daily", response_model=ReportOut)
def daily_report(
    report_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """📊 Daily sales report"""
    try:
        return crud_report.daily_sales_report(db, report_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/period", response_model=ReportOut)
def sales_report_period(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """📈 Report for a custom date range"""
    try:
        return crud_report.sales_report_period(db, start_date, end_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/credits")
def credit_reports(
    status: str = "open",
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """💳 Credits report"""
    return crud_report.credit_report(db, status=status)


@router.get("/inventory", response_model=list[InventoryReportItem])
def inventory_reports(
    threshold: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """📦 Low stock report"""
    return crud_report.inventory_report(db, threshold)


@router.get("/suppliers", response_model=list[SupplierBalanceItem])
def supplier_reports(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """🧾 Supplier balances"""
    return crud_report.supplier_balances(db)


@router.get("/top-products", response_model=list[TopProductItem])
def top_products_reports(
    start_date: date,
    end_date: date,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["employer", "manager"]))
):
    """🔥 Top-selling products"""
    return crud_report.top_products_report(db, start_date, end_date, limit)
