from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task


class TaskViewEdgeCaseTests(APITestCase):
    """Branch and edge coverage for TaskViewSet beyond the happy paths."""

    @property
    def list_url(self):
        return reverse("task-list")

    def detail_url(self, pk):
        return reverse("task-detail", args=[pk])

    # ---- reorder ---------------------------------------------------------

    def test_reorder_skips_unknown_integer_ids(self):
        kept = Task.objects.create(title="Kept", position=5)
        other = Task.objects.create(title="Other", position=7)
        res = self.client.post(
            reverse("task-reorder"),
            {"order": [kept.id, 999_999]},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["updated"], 1)
        kept.refresh_from_db()
        other.refresh_from_db()
        self.assertEqual(kept.position, 0)
        self.assertEqual(other.position, 7)  # not in payload -> untouched

    def test_reorder_rejects_non_integer_ids(self):
        task = Task.objects.create(title="A")
        for bad_order in (["abc"], [task.id, "abc"], [None], [True], [1.5]):
            with self.subTest(order=bad_order):
                res = self.client.post(
                    reverse("task-reorder"), {"order": bad_order}, format="json"
                )
                self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn("order", res.data)

    def test_reorder_accepts_empty_list(self):
        res = self.client.post(reverse("task-reorder"), {"order": []}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["updated"], 0)

    # ---- perform_create --------------------------------------------------

    def test_create_on_empty_table_gets_position_one(self):
        self.assertEqual(Task.objects.count(), 0)
        res = self.client.post(self.list_url, {"title": "First"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["position"], 1)

    # ---- stats -----------------------------------------------------------

    def test_stats_on_empty_db(self):
        res = self.client.get(reverse("task-stats"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            res.data,
            {
                "total": 0,
                "completed": 0,
                "active": 0,
                "overdue": 0,
                "high_priority": 0,
                "completion_rate": 0.0,
            },
        )

    # ---- pagination --------------------------------------------------------

    def test_pagination_splits_pages_at_24(self):
        Task.objects.bulk_create(Task(title=f"Task {i}") for i in range(30))

        page1 = self.client.get(self.list_url)
        self.assertEqual(page1.data["count"], 30)
        self.assertEqual(len(page1.data["results"]), 24)
        self.assertIsNotNone(page1.data["next"])
        self.assertIsNone(page1.data["previous"])

        page2 = self.client.get(self.list_url, {"page": 2})
        self.assertEqual(len(page2.data["results"]), 6)
        self.assertIsNone(page2.data["next"])
        self.assertIsNotNone(page2.data["previous"])

        page3 = self.client.get(self.list_url, {"page": 3})
        self.assertEqual(page3.status_code, status.HTTP_404_NOT_FOUND)

    # ---- missing ids -------------------------------------------------------

    def test_retrieve_missing_task_returns_404(self):
        res = self.client.get(self.detail_url(999_999))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_missing_task_returns_404(self):
        res = self.client.patch(
            self.detail_url(999_999), {"completed": True}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    # ---- serializer pass-through -------------------------------------------

    def test_padded_title_is_stored_stripped(self):
        res = self.client.post(
            self.list_url, {"title": "  Trim me  "}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "Trim me")
        self.assertEqual(Task.objects.get(pk=res.data["id"]).title, "Trim me")
