import celery.platforms as celery_platforms
celery_platforms.C_FORCE_ROOT = True

from app.core.celery_app import get_celery_app

celery_app = get_celery_app()
