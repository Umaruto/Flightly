from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ...core.database import get_db
from ...core.deps import get_current_user, require_role
from ...models.user import User, UserRole
from ...models.airline_company import AirlineCompany
from ...models.flight import Flight
from ...models.ticket import Ticket, TicketStatus
from ...models.banner import Banner
from ...schemas.admin import (
    UserUpdate, UserListOut, CompanyCreate, CompanyUpdate, CompanyOut,
    BannerCreate, BannerOut, BannerUpdate, PlatformStatsOut, BookingAggregateOut
)

router = APIRouter(dependencies=[Depends(require_role(UserRole.ADMIN))])

# User Management
@router.get("/users", response_model=List[UserListOut])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List all users with optional filtering"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserListOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get specific user details"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserListOut)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user details (block/unblock, role change, etc.)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Soft delete user (deactivate)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    return {"message": "User deactivated successfully"}


# Company Management
@router.get("/companies", response_model=List[CompanyOut])
def list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List all companies with optional filtering"""
    query = db.query(AirlineCompany)
    
    if is_active is not None:
        query = query.filter(AirlineCompany.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()


@router.post("/companies", response_model=CompanyOut)
def create_company(company_data: CompanyCreate, db: Session = Depends(get_db)):
    """Create new airline company"""
    # Check if company name already exists
    existing = db.query(AirlineCompany).filter(AirlineCompany.name == company_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company with this name already exists")
    
    # If manager_id is provided, verify the user exists and is a company manager
    if company_data.manager_id:
        manager = db.query(User).filter(
            User.id == company_data.manager_id,
            User.role == UserRole.COMPANY_MANAGER
        ).first()
        if not manager:
            raise HTTPException(status_code=400, detail="Invalid manager ID or user is not a company manager")
    
    company = AirlineCompany(**company_data.dict())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/companies/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get specific company details"""
    company = db.query(AirlineCompany).filter(AirlineCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.patch("/companies/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db)
):
    """Update company details"""
    company = db.query(AirlineCompany).filter(AirlineCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # If manager_id is being updated, verify the user exists and is a company manager
    if company_update.manager_id is not None:
        if company_update.manager_id == 0:  # Remove manager
            company_update.manager_id = None
        else:
            manager = db.query(User).filter(
                User.id == company_update.manager_id,
                User.role == UserRole.COMPANY_MANAGER
            ).first()
            if not manager:
                raise HTTPException(status_code=400, detail="Invalid manager ID or user is not a company manager")
    
    # Update only provided fields
    update_data = company_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company


@router.delete("/companies/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Soft delete company (deactivate)"""
    company = db.query(AirlineCompany).filter(AirlineCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.is_active = False
    db.commit()
    return {"message": "Company deactivated successfully"}


"""Content Management (Banners)"""
@router.post("/content/banners", response_model=BannerOut)
def create_banner(banner_data: BannerCreate, db: Session = Depends(get_db)):
    banner = Banner(
        title=banner_data.title,
        description=banner_data.description,
        image_url=banner_data.image_url,
        link_url=banner_data.link_url,
        is_active=banner_data.is_active,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.get("/content/banners", response_model=List[BannerOut])
def list_banners(
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List all banners"""
    query = db.query(Banner)
    if is_active is not None:
        query = query.filter(Banner.is_active == is_active)
    return query.order_by(Banner.created_at.desc()).all()

@router.patch("/content/banners/{banner_id}", response_model=BannerOut)
def update_banner(
    banner_id: int,
    banner_data: BannerUpdate,
    db: Session = Depends(get_db),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for field, value in banner_data.dict(exclude_unset=True).items():
        setattr(banner, field, value)
    db.commit()
    db.refresh(banner)
    return banner

@router.delete("/content/banners/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(get_db)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(banner)
    db.commit()
    return {"ok": True}


# Platform Statistics
@router.get("/stats", response_model=PlatformStatsOut)
def get_platform_stats(
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get platform-wide statistics"""
    # Base queries
    total_users = db.query(User).count()
    total_companies = db.query(AirlineCompany).filter(AirlineCompany.is_active == True).count()
    
    # Flight queries with optional date filtering
    flight_query = db.query(Flight)
    if start:
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        flight_query = flight_query.filter(Flight.departure_time >= start_dt)
    if end:
        end_dt = datetime.strptime(end, "%Y-%m-%d")
        flight_query = flight_query.filter(Flight.departure_time <= end_dt)
    
    flights = flight_query.all()
    total_flights = len(flights)
    
    now = datetime.utcnow()
    active_flights = len([f for f in flights if f.departure_time > now])
    completed_flights = len([f for f in flights if f.departure_time <= now])
    
    # Ticket and revenue calculations
    ticket_query = db.query(Ticket)
    if start:
        ticket_query = ticket_query.filter(Ticket.purchased_at >= start_dt)
    if end:
        ticket_query = ticket_query.filter(Ticket.purchased_at <= end_dt)
    
    tickets = ticket_query.all()
    total_passengers = len(tickets)
    total_revenue = sum([float(t.price_paid or 0) for t in tickets if getattr(t.status, 'value', t.status) == TicketStatus.PAID.value])
    
    return PlatformStatsOut(
        total_users=total_users,
        total_companies=total_companies,
        total_flights=total_flights,
        active_flights=active_flights,
        completed_flights=completed_flights,
        total_passengers=total_passengers,
        total_revenue=total_revenue
    )


@router.get("/bookings", response_model=List[BookingAggregateOut])
def list_bookings(
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Group tickets by confirmation_id to represent bookings
    query = db.query(Ticket)
    if start:
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        query = query.filter(Ticket.purchased_at >= start_dt)
    if end:
        end_dt = datetime.strptime(end, "%Y-%m-%d")
        query = query.filter(Ticket.purchased_at <= end_dt)
    tickets = query.all()
    # fetch flights to map company
    flights = { f.id: f for f in db.query(Flight).all() }
    agg: dict[str, BookingAggregateOut] = {}
    for t in tickets:
        key = t.confirmation_id
        f = flights.get(t.flight_id)
        if key not in agg:
            agg[key] = BookingAggregateOut(
                confirmation_id=key,
                company_id=(f.company_id if f else None),
                total_amount=0.0,
                purchased_at=t.purchased_at,
            )
        agg[key].total_amount += float(t.price_paid or 0)
        # keep earliest purchase time
        if t.purchased_at < agg[key].purchased_at:
            agg[key].purchased_at = t.purchased_at
    return list(agg.values())
