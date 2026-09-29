from django.db import transaction
from rest_framework import filters, viewsets
from core.models import Activity
from .models import Record
from .serializers import RecordSerializer

class RecordViewSet(viewsets.ModelViewSet):
    serializer_class = RecordSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "category"]
    ordering_fields = ["title", "created_at", "updated_at"]
    def get_queryset(self):
        queryset = Record.objects.filter(owner=self.request.user)
        status = self.request.query_params.get("status")
        return queryset.filter(status=status) if status else queryset
    @transaction.atomic
    def perform_create(self, serializer):
        record = serializer.save(owner=self.request.user)
        Activity.objects.create(actor=self.request.user, verb="criou", target=record.title)
    @transaction.atomic
    def perform_update(self, serializer):
        record = serializer.save()
        Activity.objects.create(actor=self.request.user, verb="atualizou", target=record.title)
    @transaction.atomic
    def perform_destroy(self, instance):
        Activity.objects.create(actor=self.request.user, verb="excluiu", target=instance.title)
        instance.delete()
