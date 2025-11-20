from fastapi import APIRouter, UploadFile, HTTPException, Depends
from uuid import uuid4
from sqlalchemy.orm import Session

from app.core.s3 import upload_to_s3
from app.core.config import settings
from app.db.db_session import get_db
from app.models.models import File
from app.core.celery_app import get_celery_app
from app.workers.tasks import process_csv_task
from app.models.models import Product


router = APIRouter(prefix="/upload", tags=["product"])

@router.get("/products")
def list_products(page: int = 1, limit: int = 50, db: Session = Depends(get_db)):
    # List products with pagination
    offset = (page - 1) * limit

    items = (
        db.query(Product)
        .order_by(Product.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    total = db.query(Product).count()
    pages = (total + limit - 1) // limit

    return {
        "items": items,
        "page": page,
        "pages": pages,
        "total": total
    }


