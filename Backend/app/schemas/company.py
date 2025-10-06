from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyStatsOut(BaseModel):
    total_flights: int
    active_flights: int
    completed_flights: int
    total_passengers: int
    total_revenue: float

class FlightCreate(BaseModel):
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    stops: int = 0
    price: float
    seats_total: int
    seats_available: int
    active: bool = True
