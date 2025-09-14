# backend/crud/report.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
import models


# ===== DAILY REPORT =====
def daily_sales_report(db: Session, report_date: date | None = None):
    report_date = report_date or date.today()

    total_sales = (
        db.query(func.sum(models.Sale.total_amount))
        .filter(models.Sale.date == report_date)
        .scalar() or 0.0
    )

    number_of_sales = (
        db.query(func.count(models.Sale.id))
        .filter(models.Sale.date == report_date)
        .scalar() or 0
    )

    # Credits breakdown
    credits = (
        db.query(models.Credit.status, func.sum(models.Credit.amount))
        .join(models.Sale)
        .filter(models.Sale.date == report_date)
        .group_by(models.Credit.status)
        .all()
    )
    total_credits = sum([c[1] for c in credits if c[0] == "open"]) or 0.0
    cleared_credits = sum([c[1] for c in credits if c[0] == "cleared"]) or 0.0
    total_cash = total_sales - total_credits

    return {
        "sales_summary": {
            "total_sales": float(total_sales),
            "total_credits": float(total_credits),
            "total_cash": float(total_cash),
            "number_of_sales": number_of_sales,
        },
        "sales_by_employee": [],
        "sales_by_category": [],
        "credit_summary": {
            "open_credits": float(total_credits),
            "cleared_credits": float(cleared_credits),
            "number_of_open_credits": len([c for c in credits if c[0] == "open"]),
            "number_of_cleared_credits": len([c for c in credits if c[0] == "cleared"]),
        },
        "day_report": {
            "date": report_date,
            "is_open": 1,
            "opened_by": "System",
            "closed_by": None,
            "total_sales": float(total_sales),
            "total_credits": float(total_credits),
            "total_cash": float(total_cash),
        },
    }


# ===== PERIOD REPORT =====
def sales_report_period(db: Session, start_date: date, end_date: date):
    total_sales = (
        db.query(func.sum(models.Sale.total_amount))
        .filter(models.Sale.date >= start_date, models.Sale.date <= end_date)
        .scalar() or 0.0
    )

    number_of_sales = (
        db.query(func.count(models.Sale.id))
        .filter(models.Sale.date >= start_date, models.Sale.date <= end_date)
        .scalar() or 0
    )

    return {
        "sales_summary": {
            "total_sales": float(total_sales),
            "total_credits": 0.0,
            "total_cash": float(total_sales),
            "number_of_sales": number_of_sales,
        },
        "sales_by_employee": [],
        "sales_by_category": [],
        "credit_summary": {
            "open_credits": 0.0,
            "cleared_credits": 0.0,
            "number_of_open_credits": 0,
            "number_of_cleared_credits": 0,
        },
        "day_report": None,
    }


# ===== CREDIT REPORT =====
def credit_report(db: Session, status: str = "open"):
    return db.query(models.Credit).filter(models.Credit.status == status).all()


# ===== INVENTORY REPORT =====
def inventory_report(db: Session, threshold: int = 10):
    return db.query(models.Product).filter(models.Product.stock <= threshold).all()


# ===== SUPPLIER BALANCES =====
def supplier_balances(db: Session):
    return db.query(models.Supplier).filter(models.Supplier.balance > 0).all()


# ===== TOP PRODUCTS REPORT =====
def top_products_report(db: Session, start_date: date, end_date: date, limit: int = 5):
    top_products = (
        db.query(
            models.Product.name,
            func.sum(models.SaleItem.quantity).label("total_qty"),
            func.sum(models.SaleItem.quantity * models.SaleItem.price).label("total_sales"),
        )
        .join(models.SaleItem, models.SaleItem.product_id == models.Product.id)
        .join(models.Sale, models.Sale.id == models.SaleItem.sale_id)
        .filter(models.Sale.date >= start_date, models.Sale.date <= end_date)
        .group_by(models.Product.name)
        .order_by(func.sum(models.SaleItem.quantity).desc())
        .limit(limit)
        .all()
    )

    return [
        {"product": p, "quantity": int(qty), "total_sales": float(total)}
        for p, qty, total in top_products
    ]
