from redis import Redis
from rq import Queue
from ..core.config import settings

def get_queue():
    redis_conn = Redis.from_url(settings.REDIS_URL,ssl_cert_reqs=None, decode_responses=True )
    return Queue("csv-jobs", connection=redis_conn)
