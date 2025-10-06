from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.database import get_db
from ...models.banner import Banner
from ...schemas.admin import BannerOut

router = APIRouter()

@router.get("/banners", response_model=List[BannerOut])
def public_banners(
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
):
    query = db.query(Banner)
    if is_active is not None:
        query = query.filter(Banner.is_active == is_active)
    return query.order_by(Banner.created_at.desc()).all()
