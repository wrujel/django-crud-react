from django.db import models


class Task(models.Model):
    """A single to-do item."""

    class Priority(models.IntegerChoices):
        LOW = 1, "Low"
        MEDIUM = 2, "Medium"
        HIGH = 3, "High"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    completed = models.BooleanField(default=False)
    priority = models.PositiveSmallIntegerField(
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    due_date = models.DateField(blank=True, null=True)
    # Manual sort order (lower = higher in the list); set via the reorder action.
    position = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Open tasks first, then highest priority, soonest due date, newest.
        ordering = ["completed", "-priority", "due_date", "-created_at"]
        indexes = [
            models.Index(fields=["completed"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["due_date"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title
