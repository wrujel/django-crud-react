from django.urls import include, path
from rest_framework import routers
from rest_framework.documentation import include_docs_urls
from tasks import views

# api versioning
router = routers.DefaultRouter()
router.register(r"tasks", views.TaskView, "task")

urlpatterns = [
    path("", include(router.urls)),
    path("tasks/docs/", include_docs_urls(title="Tasks API")),
]
