#!/bin/bash
set -e

exec celery -A app.core.celery_worker:celery_app worker --loglevel=INFO -Q csv-jobs


