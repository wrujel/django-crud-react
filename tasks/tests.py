from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task


class TaskAPITests(APITestCase):
    """End-to-end coverage of the Task CRUD + filtering/search/stats API."""

    @classmethod
    def setUpTestData(cls):
        today = timezone.localdate()
        cls.write_docs = Task.objects.create(
            title="Write docs",
            description="Document the public API",
            priority=Task.Priority.HIGH,
            due_date=today + timedelta(days=2),
        )
        cls.fix_bug = Task.objects.create(
            title="Fix login bug",
            description="Investigate the redirect loop",
            priority=Task.Priority.MEDIUM,
            completed=True,
        )
        cls.buy_milk = Task.objects.create(
            title="Buy milk",
            description="Groceries",
            priority=Task.Priority.LOW,
        )

    @property
    def list_url(self):
        return reverse("task-list")

    def detail_url(self, pk):
        return reverse("task-detail", args=[pk])

    # ---- CRUD ----------------------------------------------------------

    def test_list_is_paginated(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("results", res.data)
        self.assertEqual(res.data["count"], 3)

    def test_create_task(self):
        payload = {"title": "New task", "priority": Task.Priority.LOW}
        res = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["priority_display"], "Low")
        self.assertEqual(Task.objects.count(), 4)

    def test_create_rejects_blank_title(self):
        res = self.client.post(self.list_url, {"title": "   "}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", res.data)

    def test_retrieve_task(self):
        res = self.client.get(self.detail_url(self.write_docs.pk))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["title"], "Write docs")
        self.assertEqual(res.data["priority_display"], "High")

    def test_update_task(self):
        res = self.client.put(
            self.detail_url(self.buy_milk.pk),
            {"title": "Buy oat milk", "priority": Task.Priority.MEDIUM},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.buy_milk.refresh_from_db()
        self.assertEqual(self.buy_milk.title, "Buy oat milk")

    def test_toggle_completed_with_patch(self):
        res = self.client.patch(
            self.detail_url(self.write_docs.pk),
            {"completed": True},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.write_docs.refresh_from_db()
        self.assertTrue(self.write_docs.completed)

    def test_delete_task(self):
        res = self.client.delete(self.detail_url(self.buy_milk.pk))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(pk=self.buy_milk.pk).exists())

    # ---- Filtering / search / ordering ---------------------------------

    def test_filter_by_completed(self):
        res = self.client.get(self.list_url, {"completed": "true"})
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["title"], "Fix login bug")

    def test_filter_by_priority(self):
        res = self.client.get(self.list_url, {"priority": Task.Priority.HIGH})
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["title"], "Write docs")

    def test_search_matches_title_and_description(self):
        res = self.client.get(self.list_url, {"search": "redirect"})
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["title"], "Fix login bug")

    def test_ordering_by_title(self):
        res = self.client.get(self.list_url, {"ordering": "title"})
        titles = [t["title"] for t in res.data["results"]]
        self.assertEqual(titles, sorted(titles))

    def test_default_ordering_active_before_completed(self):
        res = self.client.get(self.list_url)
        completed_flags = [t["completed"] for t in res.data["results"]]
        # Active (False) tasks must come before completed (True) ones.
        self.assertEqual(completed_flags, sorted(completed_flags))

    # ---- Manual ordering -----------------------------------------------

    def test_create_places_task_at_end_of_manual_order(self):
        top = Task.objects.order_by("-position").first().position
        res = self.client.post(
            self.list_url, {"title": "Latest"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["position"], top + 1)

    def test_reorder_sets_positions_and_ordering_reflects_it(self):
        order = [self.buy_milk.id, self.write_docs.id, self.fix_bug.id]
        res = self.client.post(
            reverse("task-reorder"), {"order": order}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["updated"], 3)
        self.buy_milk.refresh_from_db()
        self.assertEqual(self.buy_milk.position, 0)

        listed = self.client.get(self.list_url, {"ordering": "position"})
        ids = [t["id"] for t in listed.data["results"]]
        self.assertEqual(ids, order)

    def test_reorder_rejects_non_list(self):
        res = self.client.post(
            reverse("task-reorder"), {"order": "nope"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ---- Stats ---------------------------------------------------------

    def test_stats_endpoint(self):
        res = self.client.get(reverse("task-stats"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total"], 3)
        self.assertEqual(res.data["completed"], 1)
        self.assertEqual(res.data["active"], 2)
        self.assertEqual(res.data["high_priority"], 1)
        self.assertEqual(res.data["completion_rate"], 33.3)
