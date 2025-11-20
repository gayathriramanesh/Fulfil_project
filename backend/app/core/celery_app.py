from celery import Celery
from .config import settings

celery_app_instance = None

def get_celery_app() -> Celery:
    global celery_app_instance

    if celery_app_instance is None:
        celery_app_instance = Celery(
            "fulfil",
            include=["app.workers.tasks"],
        )

        celery_app_instance.conf.update(
            broker_url=settings.CELERY_BROKER_URL,
            result_backend=settings.CELERY_RESULT_BACKEND,

            # Explicit SSL config (removes warning)
            broker_use_ssl={
                "ssl_cert_reqs": 0
            },
            redis_backend_use_ssl={
                "ssl_cert_reqs": 0
            },

            # Queue settings
            task_routes={"app.workers.tasks.*": {"queue": "csv-jobs"}},
            task_default_queue="csv-jobs",
        )

    return celery_app_instance
