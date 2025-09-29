# backend/crud/credit.py
from sqlalchemy.orm import Session
from datetime import datetime
import models
from schemas.credit import CreditCreate, CreditUpdate, CreditStatus


# ========= HELPERS =========
def validate_sale_exists(db: Session, sale_id: int):
    """Ensure the sale exists before attaching credit."""
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise ValueError("Sale not found")
    return sale


def validate_employee_active(db: Session, employee_id: int):
    """Ensure employee exists and is active."""
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise ValueError("Employee not found")
    if employee.status != "active":
        raise ValueError("Employee is not active")
    return employee


# ========= CRUD =========
def get_credits(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all credits."""
    return db.query(models.Credit).offset(skip).limit(limit).all()


def get_credit(db: Session, credit_id: int):
    """Retrieve one credit by ID."""
    return db.query(models.Credit).filter(models.Credit.id == credit_id).first()


def create_credit(db: Session, credit: CreditCreate):
    """
    Create a credit tied to a sale.
    - Amount always = sale.total_amount (not user input).
    - Only one credit per sale.
    """
    sale = validate_sale_exists(db, credit.sale_id)
    employee = validate_employee_active(db, credit.employee_id)

    existing_credit = db.query(models.Credit).filter(models.Credit.sale_id == sale.id).first()
    if existing_credit:
        raise ValueError("Credit already exists for this sale")

    db_credit = models.Credit(
        sale_id=sale.id,
        employee_id=employee.id,
        amount=sale.total_amount,
        status=CreditStatus.open.value,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_credit)

    # ensure sale reflects credit status
    sale.is_credit = True
    sale.is_paid = False
    sale.payment_method = None

    db.commit()
    db.refresh(db_credit)
    return db_credit


def update_credit(db: Session, credit_id: int, credit: CreditUpdate):
    """
    Update credit:
    - Only allowed to mark status → 'cleared'.
    """
    db_credit = get_credit(db, credit_id)
    if not db_credit:
        return None

    if credit.status and credit.status == CreditStatus.cleared:
        if not credit.payment_method:
            raise ValueError("Payment method is required when clearing a credit")

        payment_method_value = (
            credit.payment_method.value
            if hasattr(credit.payment_method, "value")
            else credit.payment_method
        )

        db_credit.status = CreditStatus.cleared.value
        db_credit.updated_at = datetime.utcnow()

        # update linked sale to reflect payment completion
        sale = db_credit.sale
        sale.is_credit = False
        sale.is_paid = True
        sale.payment_method = models.PaymentMethod(payment_method_value)
    else:
        raise ValueError("Only status update to 'cleared' is allowed")

    db.commit()
    db.refresh(db_credit)
    return db_credit


def delete_credit(db: Session, credit_id: int):
    """
    Delete (revoke) a credit.
    IMS rules:
    - Only Manager/Employer should call this (enforced at route).
    - Only if the sales day is still open.
    """
    db_credit = get_credit(db, credit_id)
    if not db_credit:
        return False

    sale = db_credit.sale
    day = db.query(models.Day).filter(models.Day.date == sale.date).first()
    if day and not day.is_open:
        raise ValueError("Cannot delete credit: the sales day is already closed")

    db.delete(db_credit)
    sale = db_credit.sale
    if sale:
        sale.is_credit = False
        sale.is_paid = False
        sale.payment_method = None
    db.commit()
    return True
