from datetime import date, timedelta

from django.test import TestCase

from .models import Task


class TaskModelTests(TestCase):
    def test_str_returns_title(self):
        task = Task.objects.create(title="Write the report")
        self.assertEqual(str(task), "Write the report")

    def test_field_defaults(self):
        task = Task.objects.create(title="Defaults")
        self.assertFalse(task.completed)
        self.assertEqual(task.priority, Task.Priority.MEDIUM)
        self.assertEqual(task.description, "")
        self.assertIsNone(task.due_date)
        self.assertEqual(task.position, 0)
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

    def test_priority_choices(self):
        self.assertEqual(Task.Priority.LOW, 1)
        self.assertEqual(Task.Priority.MEDIUM, 2)
        self.assertEqual(Task.Priority.HIGH, 3)
        self.assertEqual(Task.Priority.HIGH.label, "High")
        self.assertEqual(
            [p.label for p in Task.Priority], ["Low", "Medium", "High"]
        )

    def test_default_ordering_is_smart_order(self):
        today = date.today()
        completed = Task.objects.create(
            title="Done", completed=True, priority=Task.Priority.HIGH
        )
        low = Task.objects.create(title="Low", priority=Task.Priority.LOW)
        high_late = Task.objects.create(
            title="High later",
            priority=Task.Priority.HIGH,
            due_date=today + timedelta(days=9),
        )
        high_soon = Task.objects.create(
            title="High soon",
            priority=Task.Priority.HIGH,
            due_date=today + timedelta(days=1),
        )

        # Active before completed, higher priority first, sooner due date first.
        self.assertEqual(
            list(Task.objects.all()),
            [high_soon, high_late, low, completed],
        )
