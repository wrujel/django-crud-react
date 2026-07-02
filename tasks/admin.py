from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "completed", "priority", "due_date", "created_at")
    list_filter = ("completed", "priority", "created_at")
    list_editable = ("completed", "priority")
    search_fields = ("title", "description")
    date_hierarchy = "created_at"
    ordering = ("completed", "-priority", "due_date", "-created_at")
