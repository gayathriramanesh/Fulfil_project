#!/bin/bash
set -e

exec celery -A app.core.celery_app:get_celery_app worker --loglevel=INFO -Q csv-jobs

