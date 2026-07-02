from django.contrib import admin
from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse

from .apps import TasksConfig
from .models import Task

# Whitenoise's manifest storage requires a collectstatic run; tests use the
# plain storage so admin pages can render without a manifest.
TEST_STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
    },
}


@override_settings(STORAGES=TEST_STORAGES)
class TaskAdminTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.superuser = User.objects.create_superuser(
            "admin", "admin@example.com", "s3cret-pass"
        )
        Task.objects.create(title="Adminable", completed=True)
        Task.objects.create(title="Other", priority=Task.Priority.HIGH)

    def setUp(self):
        self.client.force_login(self.superuser)

    def test_task_is_registered_with_admin(self):
        self.assertIn(Task, admin.site._registry)

    def test_changelist_renders(self):
        res = self.client.get(reverse("admin:tasks_task_changelist"))
        self.assertEqual(res.status_code, 200)

    def test_changelist_search_and_filter(self):
        res = self.client.get(
            reverse("admin:tasks_task_changelist"),
            {"q": "Admin", "completed__exact": "1"},
        )
        self.assertEqual(res.status_code, 200)

    def test_apps_config_name(self):
        self.assertEqual(TasksConfig.name, "tasks")
