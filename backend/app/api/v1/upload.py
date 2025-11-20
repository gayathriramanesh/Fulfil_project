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


router = APIRouter(prefix="/upload", tags=["upload"])

celery = get_celery_app()


@router.post("/files/upload")
async def upload_file(file: UploadFile, db: Session = Depends(get_db)):
    """Upload CSV via FastAPI → save to S3 → enqueue Celery job."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are allowed")

    file_bytes = await file.read()
    filename = f"{uuid4()}_{file.filename}"

    #Upload to S3
    s3_path = upload_to_s3(
        file_bytes=file_bytes,
        bucket=settings.AWS_S3_BUCKET,
        filename=filename
    )

    #Create DB record
    new_file = File(
        filename=filename,
        s3_path=s3_path,
        status="uploaded"
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    # Extract bucket and key
    # s3://bucket/key → "bucket", "key"
    s3_path_clean = s3_path.replace("s3://", "")
    bucket, key = s3_path_clean.split("/", 1)

    # 3️⃣ Trigger Celery ingestion job
    celery_job = process_csv_task.apply_async(
        args=[new_file.id, bucket, key],
        queue="csv-jobs"
    )

    return {
        "message": "File uploaded successfully. Processing started.",
        "file_id": new_file.id,
        "celery_task_id": celery_job.id,
        "s3_path": s3_path
    }

@router.get("/files/{file_id}/status")
def get_file_status(file_id: int, db: Session = Depends(get_db)):
    file_rec = db.query(File).filter(File.id == file_id).first()
    if not file_rec:
        raise HTTPException(404, "File not found")

    return {"status": file_rec.status}

@router.get("/products")
def list_products(page: int = 1, limit: int = 50, db: Session = Depends(get_db)):
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


