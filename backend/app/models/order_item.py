from pydantic import BaseModel, condecimal
from typing import Optional
from decimal import Decimal

class OrderItem(BaseModel):
    order_id: str
    item_id: str
    request_item: str
    quantity: int
    uom: Optional[str]
    price_per_unit: Optional[Decimal]  # Use Decimal instead of float
    amount: Optional[Decimal]  # Use Decimal instead of float
    matches: Optional[str] = None  # New field

class OrderItemCreate(BaseModel):
    request_item: str
    quantity: int
    uom: Optional[str] = None
    price_per_unit: Optional[Decimal] = None  # Use Decimal instead of float
    amount: Optional[Decimal] = None  # Use Decimal instead of float
    matches: Optional[str] = None  # New field
