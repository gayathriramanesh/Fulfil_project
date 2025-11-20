from ..core.config import settings
import tempfile
import psycopg2
import boto3
import os
from app.core.celery_app import get_celery_app
from app.db.database import SessionLocal
import csv
from io import StringIO
from app.models.models import File, StagingProduct
from sqlalchemy.orm import Session
from sqlalchemy import text

celery = get_celery_app()


def download_from_s3(key: str, local_path: str):
    s3 = boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    s3.download_file(settings.AWS_S3_BUCKET, key, local_path)


@celery.task(name="app.workers.tasks.process_csv_task")
def process_csv_task(file_id: int, bucket: str, key: str):
    db = SessionLocal()

    try:
        # 1️⃣ Download CSV from S3
        s3 = boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
        obj = s3.get_object(Bucket=bucket, Key=key)
        csv_text = obj["Body"].read().decode("utf-8")

        # 2️⃣ Stream through CSV
        reader = csv.DictReader(StringIO(csv_text))

        buffer = []
        BULK = 10000

        for row in reader:
            buffer.append({
                "sku": row["sku"],
                "name": row["name"],
                "description": row.get("description"),
                "price": float(row.get("price") or 0),
                "quantity": int(row.get("quantity") or 0),
                "category": row.get("category"),
            })

            if len(buffer) >= BULK:
                bulk_insert_staging(buffer, db)
                buffer.clear()

        if buffer:
            bulk_insert_staging(buffer, db)
            buffer.clear()

        # 3️⃣ Move to products + tag with file_id
        merge_staging_to_products(db, file_id)

        # 4️⃣ Update file status
        file_obj = db.query(File).filter(File.id == file_id).first()
        if not file_obj:
             raise Exception(f"File with id {file_id} not found.")

        file_obj.status = "processed"
        db.commit()

    except Exception as e:
        db.rollback()
        file_obj = db.query(File).filter(File.id == file_id).first()
        if not file_obj:
          raise Exception(f"File with id {file_id} not found.")
        file_obj.status = "failed"
        db.commit()
        raise e

    finally:
        db.close()

def bulk_insert_staging(rows, db):
    db.bulk_insert_mappings(StagingProduct, rows)
    db.commit()


def merge_staging_to_products(db, file_id):
    db.execute(
    text("""
        INSERT INTO products (file_id, sku, name, description, price, quantity, category)
        SELECT :file_id, sku, name, description, price, quantity, category
        FROM staging_products
    """),
    {"file_id": file_id}
)

    db.execute(text("TRUNCATE staging_products"))

    db.commit()
