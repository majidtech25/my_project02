# backend/schemas/sale.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from enum import Enum


# ====== PAYMENT METHOD ======
class PaymentMethod(str, Enum):
    cash = "cash"
    mpesa = "mpesa"
    card = "card"


# ====== SALE ITEM ======
class SaleItemBase(BaseModel):
    product_id: int = Field(..., gt=0, description="Valid product ID required")
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class SaleItemCreate(SaleItemBase):
    """Schema for creating a sale item (system auto-assigns price)."""
    pass


class SaleItemOut(SaleItemBase):
    id: int
    price: float = Field(..., gt=0, le=1_000_000, description="Price per unit at sale time")
    product_name: Optional[str] = Field(
        None, description="Snapshot of the product name at time of sale"
    )

    class Config:
        from_attributes = True


# ====== SALE ======
class SaleBase(BaseModel):
    employee_id: int = Field(..., gt=0, description="Valid employee ID required")


class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    is_credit: Optional[bool] = Field(
        False, description="Mark sale as credit (default: False)"
    )
    payment_method: Optional[PaymentMethod] = Field(
        None,
        description="Required when sale is paid. One of: cash, mpesa, card",
    )


class SaleUpdate(BaseModel):
    """Schema for updating a sale (only items can change)."""
    items: Optional[List[SaleItemCreate]] = None


class SaleOut(SaleBase):
    id: int
    date: date
    total_amount: float = Field(..., ge=0, description="Total amount of the sale")
    items: List[SaleItemOut]
    payment_method: Optional[PaymentMethod]
    is_paid: bool
    is_credit: bool

    class Config:
        from_attributes = True
