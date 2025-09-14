from sqlalchemy import (
    Column, Integer, String, Float, Date, Enum, ForeignKey, DateTime, Boolean, UniqueConstraint
)
from sqlalchemy.orm import relationship
from db import Base
import enum
from datetime import datetime, date


# ================= ENUMS =================
class EmployeeRole(enum.Enum):
    employer = "employer"
    manager = "manager"
    employee = "employee"


# ================= EMPLOYEE =================
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    role = Column(Enum(EmployeeRole), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    status = Column(String(20), default="active")
    password_hash = Column(String, nullable=False)  # now required

    # Relationships
    sales = relationship("Sale", back_populates="employee", cascade="all, delete-orphan")
    credits = relationship("Credit", back_populates="employee", cascade="all, delete-orphan")
    days_opened = relationship("Day", back_populates="opened_by_emp", foreign_keys="Day.opened_by_id")
    days_closed = relationship("Day", back_populates="closed_by_emp", foreign_keys="Day.closed_by_id")

    # __table_args__ = (
    #     # Business rule: only ONE employer and ONE manager
    #     UniqueConstraint("role", name="unique_employer_role", condition=(role == EmployeeRole.employer)),
    #     UniqueConstraint("role", name="unique_manager_role", condition=(role == EmployeeRole.manager)),
    # )

    def __repr__(self):
        return f"<Employee(name={self.name}, role={self.role.value}, status={self.status})>"


# ================= CATEGORY =================
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Category(name={self.name})>"


# ================= SUPPLIER =================
class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    contact = Column(String(100), nullable=True)
    email = Column(String(150), nullable=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = relationship("Product", back_populates="supplier")

    def __repr__(self):
        return f"<Supplier(name={self.name}, balance={self.balance})>"


# ================= PRODUCT =================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(50), unique=True, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)

    category_id = Column(Integer, ForeignKey("categories.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))

    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")

    def __repr__(self):
        return f"<Product(name={self.name}, sku={self.sku}, stock={self.stock})>"


# ================= SALE =================
class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False)

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    employee = relationship("Employee", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    credit = relationship("Credit", uselist=False, back_populates="sale", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Sale(id={self.id}, total={self.total_amount})>"


# ================= SALE ITEM =================
class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")

    def __repr__(self):
        return f"<SaleItem(product={self.product_id}, qty={self.quantity}, price={self.price})>"


# ================= CREDIT =================
class Credit(Base):
    __tablename__ = "credits"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sale = relationship("Sale", back_populates="credit")
    employee = relationship("Employee", back_populates="credits")

    def __repr__(self):
        return f"<Credit(amount={self.amount}, status={self.status})>"


# ================= DAY =================
class Day(Base):
    __tablename__ = "days"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, default=date.today)
    is_open = Column(Boolean, default=True)

    opened_by_id = Column(Integer, ForeignKey("employees.id"))
    closed_by_id = Column(Integer, ForeignKey("employees.id"))

    opened_by_emp = relationship("Employee", back_populates="days_opened", foreign_keys=[opened_by_id])
    closed_by_emp = relationship("Employee", back_populates="days_closed", foreign_keys=[closed_by_id])

    def __repr__(self):
        return f"<Day(date={self.date}, is_open={self.is_open})>"