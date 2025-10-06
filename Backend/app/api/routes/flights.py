from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models.flight import Flight
from ...models.airline_company import AirlineCompany
from ...schemas.flight import FlightOut
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=List[FlightOut])
def search_flights(
    origin: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    passengers: Optional[int] = Query(1),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    stops: Optional[int] = Query(None),
    airline: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Flight)
    if origin:
        query = query.filter(Flight.origin.ilike(f"%{origin}%"))
    if destination:
        query = query.filter(Flight.destination.ilike(f"%{destination}%"))
    if date:
        try:
            day_start = datetime.strptime(date, "%Y-%m-%d")
            day_end = day_start + timedelta(days=1)
            query = query.filter(Flight.departure_time >= day_start, Flight.departure_time < day_end)
        except Exception:
            pass
    if min_price is not None:
        query = query.filter(Flight.price >= min_price)
    if max_price is not None:
        query = query.filter(Flight.price <= max_price)
    if stops is not None:
        query = query.filter(Flight.stops == stops)
    if airline:
        query = query.join(AirlineCompany).filter(AirlineCompany.name.ilike(f"%{airline}%"))
    if sort == "price":
        query = query.order_by(Flight.price)
    elif sort == "departure_time":
        query = query.order_by(Flight.departure_time)
    query = query.offset(offset).limit(limit)
    flights = query.all()
    # Optionally filter by seats_available >= passengers
    if passengers:
        flights = [f for f in flights if f.seats_available >= passengers]
    return flights

@router.get("/{flight_id}", response_model=FlightOut)
def get_flight_details(flight_id: int, db: Session = Depends(get_db)):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        return None
    return flight
