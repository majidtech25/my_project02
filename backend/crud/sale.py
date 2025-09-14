# backend/crud/sale.py
from sqlalchemy.orm import Session
from datetime import date, datetime
import models
from schemas.sale import SaleCreate, SaleUpdate


# ========= HELPERS =========
def validate_employee_active(db: Session, employee_id: int):
    """Ensure employee exists and is active."""
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise ValueError("Employee not found")
    if employee.status != "active":
        raise ValueError("Employee is not active")
    return employee


def validate_day_open(db: Session):
    """Ensure there is an open day today."""
    today = date.today()
    day = db.query(models.Day).filter(models.Day.date == today, models.Day.is_open == True).first()
    if not day:
        raise ValueError("No open day found. Please open the day first")
    return day


def calculate_total_and_items(db: Session, items):
    """Calculate total + prepare SaleItem objects, adjusting stock safely."""
    total_amount = 0.0
    sale_items = []

    for item in items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise ValueError(f"Product with ID {item.product_id} not found")
        if product.stock < item.quantity:
            raise ValueError(f"Not enough stock for product {product.name} (available: {product.stock})")

        # Deduct stock
        product.stock -= item.quantity

        # Create item
        sale_item = models.SaleItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price,  # always system price
        )
        sale_items.append(sale_item)
        total_amount += product.price * item.quantity

    return total_amount, sale_items


# ========= CRUD =========
def get_sales(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all sales."""
    return db.query(models.Sale).offset(skip).limit(limit).all()


def get_sale(db: Session, sale_id: int):
    """Retrieve one sale by ID."""
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()


def create_sale(db: Session, sale: SaleCreate):
    """Create a sale, deduct stock, and create credit if applicable."""
    validate_day_open(db)
    employee = validate_employee_active(db, sale.employee_id)

    try:
        total_amount, sale_items = calculate_total_and_items(db, sale.items)

        db_sale = models.Sale(
            date=date.today(),
            total_amount=total_amount,
            employee_id=employee.id,
            items=sale_items,
        )
        db.add(db_sale)
        db.commit()
        db.refresh(db_sale)

        # Handle credit
        if sale.is_credit:
            if db_sale.credit:
                raise ValueError("This sale already has a credit record")
            db_credit = models.Credit(
                sale_id=db_sale.id,
                employee_id=employee.id,
                amount=total_amount,
                status="open",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(db_credit)
            db.commit()
            db.refresh(db_credit)

        return db_sale
    except Exception:
        db.rollback()
        raise


def update_sale(db: Session, sale_id: int, sale: SaleUpdate):
    """Update sale items & re-sync credit amount if exists."""
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return None

    try:
        if sale.items:
            # Restore stock from old items
            for old_item in db_sale.items:
                product = db.query(models.Product).filter(models.Product.id == old_item.product_id).first()
                if product:
                    product.stock += old_item.quantity
                db.delete(old_item)

            db.commit()

            # Add new items
            total_amount, new_items = calculate_total_and_items(db, sale.items)
            db_sale.total_amount = total_amount
            db_sale.items.extend(new_items)

            # Update credit if exists
            if db_sale.credit:
                db_sale.credit.amount = total_amount
                db_sale.credit.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_sale)
        return db_sale
    except Exception:
        db.rollback()
        raise


def delete_sale(db: Session, sale_id: int):
    """Delete sale, restore stock, and cascade delete credit if exists."""
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return False

    try:
        # restore stock
        for item in db_sale.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity

        db.delete(db_sale)  # credit + items cascade delete (models.py has cascade)
        db.commit()
        return True
    except Exception:
        db.rollback()
        raise
