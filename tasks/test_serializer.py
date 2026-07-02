from django.test import TestCase
from rest_framework import serializers

from .models import Task
from .serializer import TaskSerializer


class TaskSerializerTests(TestCase):
    def test_validate_title_strips_whitespace(self):
        serializer = TaskSerializer(data={"title": "  Hello  "})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["title"], "Hello")

    def test_whitespace_only_title_is_invalid(self):
        serializer = TaskSerializer(data={"title": "   "})
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_validate_title_raises_for_whitespace_only_value(self):
        # DRF's CharField blank-check normally fires first; this pins the
        # validator's own contract when called directly.
        with self.assertRaises(serializers.ValidationError):
            TaskSerializer().validate_title("   ")

    def test_read_only_fields_are_ignored_on_input(self):
        serializer = TaskSerializer(
            data={"title": "X", "position": 99, "created_at": "2020-01-01T00:00:00Z"}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        task = serializer.save()
        self.assertEqual(task.position, 0)  # model default, not the payload
        self.assertNotEqual(str(task.created_at.year), "2020")

    def test_priority_display_maps_label(self):
        task = Task.objects.create(title="P", priority=Task.Priority.HIGH)
        self.assertEqual(TaskSerializer(task).data["priority_display"], "High")

    def test_due_date_accepts_null(self):
        serializer = TaskSerializer(data={"title": "X", "due_date": None})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertIsNone(serializer.validated_data["due_date"])
