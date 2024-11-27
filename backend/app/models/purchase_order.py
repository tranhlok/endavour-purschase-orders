from enum import Enum
from pydantic import BaseModel

class OrderStatus(str, Enum):
    PROCESSING = "Processing"
    REVIEW = "Review"
    PROCESSED = "Processed"
    FINALIZED = "Finalized"

class StatusUpdate(BaseModel):
    status: OrderStatus