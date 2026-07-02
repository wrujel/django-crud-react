from django.db.models import Count, Max, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task
from .serializer import TaskSerializer


class BaseModelViewSet(viewsets.ModelViewSet):
    """Generic CRUD viewset wiring the standard filter backends.

    Subclasses only need to declare ``queryset``, ``serializer_class`` and the
    relevant ``filterset_fields`` / ``search_fields`` / ``ordering_fields``.
    Reusing this base keeps every resource's API surface consistent.
    """

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]


class TaskViewSet(BaseModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filterset_fields = ["completed", "priority"]
    search_fields = ["title", "description"]
    ordering_fields = [
        "created_at",
        "updated_at",
        "due_date",
        "priority",
        "title",
        "position",
    ]

    def perform_create(self, serializer):
        """Place new tasks at the end of the manual order."""
        last = Task.objects.aggregate(max_position=Max("position"))["max_position"]
        serializer.save(position=(last or 0) + 1)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Persist a manual task order.

        Body: ``{"order": [id, id, ...]}`` — each listed task's ``position`` is
        set to its index, so ``?ordering=position`` returns this exact order.
        """
        order = request.data.get("order")
        if not isinstance(order, list) or not all(
            isinstance(task_id, int) and not isinstance(task_id, bool)
            for task_id in order
        ):
            return Response(
                {"order": "Expected a list of integer task IDs."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        by_id = Task.objects.in_bulk(order)
        to_update = []
        for index, task_id in enumerate(order):
            task = by_id.get(task_id)
            if task is not None:
                task.position = index
                to_update.append(task)
        Task.objects.bulk_update(to_update, ["position"])
        return Response({"updated": len(to_update)})

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Aggregate progress metrics in a single query for the dashboard.

        Aggregate aliases are suffixed so they don't shadow the ``completed``
        model field referenced inside the conditional filters.
        """
        today = timezone.localdate()
        agg = self.get_queryset().aggregate(
            total=Count("id"),
            completed_count=Count("id", filter=Q(completed=True)),
            overdue_count=Count(
                "id", filter=Q(completed=False, due_date__lt=today)
            ),
            high_priority_count=Count(
                "id",
                filter=Q(completed=False, priority=Task.Priority.HIGH),
            ),
        )
        total = agg["total"] or 0
        completed = agg["completed_count"] or 0
        return Response(
            {
                "total": total,
                "completed": completed,
                "active": total - completed,
                "overdue": agg["overdue_count"] or 0,
                "high_priority": agg["high_priority_count"] or 0,
                "completion_rate": (
                    round(completed / total * 100, 1) if total else 0.0
                ),
            }
        )
