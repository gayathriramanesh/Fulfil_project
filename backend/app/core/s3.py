import boto3
from .config import settings


s3 = boto3.client("s3")



def get_s3_client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )


def create_presigned_upload_url(object_key: str, *, content_type: str = "text/csv", expires_minutes: int = 30):
    s3 = get_s3_client()
    url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.AWS_S3_BUCKET,
            "Key": object_key,
            "ContentType": content_type
        },
        ExpiresIn=expires_minutes * 60,
    )
    return url

def upload_to_s3(file_bytes: bytes, bucket: str, filename: str):
    s3 = get_s3_client()
    print("s3 object", s3)
    s3.put_object(
        Bucket=bucket,
        Key=filename,
        Body=file_bytes,
    )

    return f"s3://{bucket}/{filename}"
