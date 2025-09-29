# backend/schemas/credit.py
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime
from enum import Enum

from .sale import PaymentMethod


# ====== ENUM ======
class CreditStatus(str, Enum):
    open = "open"
    cleared = "cleared"


# ====== BASE ======
class CreditBase(BaseModel):
    amount: float = Field(..., gt=0, description="Credit amount (system-set from sale)")
    status: CreditStatus = Field(default=CreditStatus.open, description="Credit status")


# ====== CREATE ======
class CreditCreate(BaseModel):
    """When creating a credit, amount comes from Sale (system-set)."""
    sale_id: int = Field(..., description="Associated sale ID")
    employee_id: int = Field(..., description="Employee who handled the sale")


# ====== UPDATE ======
class CreditUpdate(BaseModel):
    """Only status updates are allowed, and only to 'cleared'."""
    status: Optional[CreditStatus] = Field(None, description="Can only be updated to 'cleared'")
    payment_method: Optional[PaymentMethod] = Field(
        None,
        description="Required when clearing a credit to capture payment method",
    )

    @field_validator("status")
    def validate_update_status(cls, v: Optional[CreditStatus]):
        if v and v != CreditStatus.cleared:
            raise ValueError("Credit status can only be updated to 'cleared'")
        return v

    @model_validator(mode="after")
    def validate_payment_method(cls, values):
        if values.status == CreditStatus.cleared and not values.payment_method:
            raise ValueError("Payment method is required when clearing a credit")
        return values


# ====== OUT ======
class CreditOut(CreditBase):
    id: int
    sale_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
