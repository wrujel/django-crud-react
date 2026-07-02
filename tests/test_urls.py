import os

from django.test import TestCase, override_settings

# The "/" TemplateView renders the built SPA's index.html from client/dist,
# which is gitignored and therefore absent in CI. Point template resolution at
# a local fixture so this test is deterministic everywhere.
TEST_TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(os.path.dirname(__file__), "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

# Swagger UI renders {% static %} tags; whitenoise's manifest storage would
# require a collectstatic run, so tests use the plain storage backend.
TEST_STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
    },
}


class ProjectUrlTests(TestCase):
    @override_settings(TEMPLATES=TEST_TEMPLATES)
    def test_index_serves_spa_shell(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "spa-shell-fixture")

    def test_openapi_schema_is_served(self):
        res = self.client.get("/tasks/schema/")
        self.assertEqual(res.status_code, 200)

    @override_settings(STORAGES=TEST_STORAGES)
    def test_swagger_docs_are_served(self):
        res = self.client.get("/tasks/docs/")
        self.assertEqual(res.status_code, 200)
