from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FlightOut(BaseModel):
    id: int
    company_id: int
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    stops: int
    price: float
    seats_total: int
    seats_available: int
    active: bool

    class Config:
        from_attributes = True

class FlightSearchParams(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD
    passengers: Optional[int] = 1
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    stops: Optional[int] = None
    airline: Optional[str] = None
    sort: Optional[str] = None
    limit: Optional[int] = 10
    offset: Optional[int] = 0
