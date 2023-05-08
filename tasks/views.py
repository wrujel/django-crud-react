from rest_framework import viewsets
from .serializer import TaskSerialize
from .models import Task


# Create your views here.
class TaskView(viewsets.ModelViewSet):
    serializer_class = TaskSerialize
    queryset = Task.objects.all()
