from django.urls import include, path
from rest_framework import routers
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from tasks import views

# api versioning
router = routers.DefaultRouter()
router.register(r"tasks", views.TaskView, "task")

urlpatterns = [
    path("api/v1/", include(router.urls)),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
