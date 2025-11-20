#!/bin/bash
set -e

exec celery -A app.core.celery_app.celery_app worker \
  --loglevel=INFO \
  -Q csv-jobs
