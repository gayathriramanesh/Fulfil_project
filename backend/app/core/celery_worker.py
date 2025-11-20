import celery.platforms as celery_platforms

from app.core.celery_app import get_celery_app

celery_app = get_celery_app()
