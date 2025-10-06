from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models.flight import Flight
from ...models.airline_company import AirlineCompany
from ...models.ticket import Ticket
from ...schemas.company import FlightCreate, CompanyStatsOut
from ...schemas.flight import FlightOut
from ...core.deps import get_current_user, require_role
from ...models.user import UserRole, User
from datetime import datetime
from typing import List, Optional

from ...schemas.ticket import TicketOut

router = APIRouter(dependencies=[Depends(require_role(UserRole.COMPANY_MANAGER))])

@router.post("/flights", response_model=FlightOut)
def create_flight(payload: FlightCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = db.query(AirlineCompany).filter(AirlineCompany.manager_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="No company assigned")
    flight = Flight(company_id=company.id, **payload.dict())
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return flight

@router.put("/flights/{id}", response_model=FlightOut)
def edit_flight(id: int, payload: FlightCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = db.query(AirlineCompany).filter(AirlineCompany.manager_id == current_user.id).first()
    flight = db.query(Flight).filter(Flight.id == id, Flight.company_id == company.id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    for key, value in payload.dict().items():
        setattr(flight, key, value)
    db.commit()
    db.refresh(flight)
    return flight

@router.delete("/flights/{id}")
def delete_flight(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = db.query(AirlineCompany).filter(AirlineCompany.manager_id == current_user.id).first()
    flight = db.query(Flight).filter(Flight.id == id, Flight.company_id == company.id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    db.delete(flight)
    db.commit()
    return {"ok": True}

@router.get("/flights", response_model=List[FlightOut])
def list_flights(upcoming: Optional[bool] = Query(None), completed: Optional[bool] = Query(None), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = db.query(AirlineCompany).filter(AirlineCompany.manager_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="No company assigned")
    query = db.query(Flight).filter(Flight.company_id == company.id)
    now = datetime.utcnow()
    if upcoming:
        query = query.filter(Flight.departure_time > now)
    if completed:
        query = query.filter(Flight.departure_time <= now)
    return query.all()

@router.get("/flights/{id}/passengers")
def flight_passengers(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = db.query(AirlineCompany).filter(AirlineCompany.manager_id == current_user.id).first()
    flight = db.query(Flight).filter(Flight.id == id, Flight.company_id == company.id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    tickets = db.query(Ticket).filter(Ticket.flight_id == flight.id).all()
    # Enrich with user info
    user_map = {u.id: u for u in db.query(User).filter(User.id.in_([t.user_id for t in tickets])).all()}
    out = []
    for t in tickets:
        u = user_map.get(t.user_id)
        out.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_name": (u.name if u else None),
            "user_email": (u.email if u else None),
            "flight_id": t.flight_id,
            "status": str(t.status.value if hasattr(t.status, 'value') else t.status),
            "confirmation_id": t.confirmation_id,
            "price_paid": float(t.price_paid),
            "purchased_at": t.purchased_at.isoformat(),
            "canceled_at": (t.canceled_at.isoformat() if t.canceled_at else None),
        })
    return out

@router.get("/stats", response_model=CompanyStatsOut)
def company_stats(start: Optional[str] = Query(None), end: Optional[str] = Query(None), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    company = db.query(AirlineCompany).filter(AirlineCompany.manager_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=403, detail="No company assigned")
    query = db.query(Flight).filter(Flight.company_id == company.id)
    now = datetime.utcnow()
    if start:
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        query = query.filter(Flight.departure_time >= start_dt)
    if end:
        end_dt = datetime.strptime(end, "%Y-%m-%d")
        query = query.filter(Flight.departure_time <= end_dt)
    flights = query.all()
    total_flights = len(flights)
    active_flights = len([f for f in flights if f.departure_time > now])
    completed_flights = len([f for f in flights if f.departure_time <= now])
    tickets = db.query(Ticket).join(Flight).filter(Flight.company_id == company.id).all()
    total_passengers = len(tickets)
    total_revenue = sum([float(t.price_paid) for t in tickets if t.status == "PAID"])
    return CompanyStatsOut(
        total_flights=total_flights,
        active_flights=active_flights,
        completed_flights=completed_flights,
        total_passengers=total_passengers,
        total_revenue=total_revenue,
    )
