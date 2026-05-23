from celery import Celery

celery = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.workers.scan_tasks"]
)

celery.conf.update(
    task_track_started=True
)
