from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.ticket import TicketStatus

class PassengerIn(BaseModel):
    name: str
    birthdate: Optional[str] = None

class TicketOut(BaseModel):
    id: int
    user_id: int
    flight_id: int
    status: TicketStatus
    confirmation_id: str
    price_paid: float
    purchased_at: datetime
    canceled_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BookingRequest(BaseModel):
    passengers: List[PassengerIn]
    payment_method: Optional[str] = "placeholder"

class BookingResponse(BaseModel):
    confirmation_id: str
    tickets: List[TicketOut]
