from fastapi import APIRouter

from .routes import auth as auth_routes
from .routes import users as users_routes
from .routes import flights as flights_routes
from .routes import booking as booking_routes
from .routes import tickets as tickets_routes
from .routes import company as company_routes
from .routes import admin as admin_routes
from .routes import content as content_routes

api_router = APIRouter()

@api_router.get("/ping", tags=["health"]) 
def ping(): 
    return {"pong": True}

# Include sub-routers (mounted at /api in main.py)
api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"]) 
api_router.include_router(users_routes.router, prefix="/users", tags=["users"]) 
api_router.include_router(flights_routes.router, prefix="/flights", tags=["flights"]) 
api_router.include_router(booking_routes.router, prefix="/flights", tags=["booking"]) 
api_router.include_router(tickets_routes.router, prefix="/tickets", tags=["tickets"]) 
api_router.include_router(company_routes.router, prefix="/company", tags=["company"])
api_router.include_router(admin_routes.router, prefix="/admin", tags=["admin"]) 
api_router.include_router(content_routes.router, prefix="/content", tags=["content"]) 
