from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for the Task model.

    Exposes a human-readable ``priority_display`` alongside the raw
    ``priority`` value so the client can render labels without hard-coding
    the choice map.
    """

    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "completed",
            "priority",
            "priority_display",
            "due_date",
            "position",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "position", "created_at", "updated_at"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be blank.")
        return value
