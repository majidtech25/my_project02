# backend/schemas/sale.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


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


class SaleUpdate(BaseModel):
    """Schema for updating a sale (only items can change)."""
    items: Optional[List[SaleItemCreate]] = None


class SaleOut(SaleBase):
    id: int
    date: date
    total_amount: float = Field(..., ge=0, description="Total amount of the sale")
    items: List[SaleItemOut]

    class Config:
        from_attributes = True
