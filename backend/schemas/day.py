# backend/schemas/day.py
from pydantic import BaseModel, Field
from datetime import date as dt_date
from typing import Optional


# ===== BASE =====
class DayBase(BaseModel):
    date: dt_date = Field(..., description="Business day date")


# ===== CREATE =====
class DayCreate(DayBase):
    """Used for opening a business day."""
    pass


# ===== UPDATE =====
class DayUpdate(BaseModel):
    is_open: Optional[bool] = Field(None, description="True=open, False=closed")
    closed_by_id: Optional[int] = Field(None, description="Employee ID who closed the day")


# ===== OUT =====
class DayOut(BaseModel):
    id: int
    date: dt_date
    is_open: bool
    opened_by_id: Optional[int]
    closed_by_id: Optional[int]

    class Config:
        from_attributes = True
