from django.conf import settings
from django.db import models
from core.models import TimestampedModel

class Record(TimestampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Rascunho"
        ACTIVE = "active", "Ativo"
        ARCHIVED = "archived", "Arquivado"
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="records")
    title = models.CharField("nome", max_length=160)
    category = models.CharField("categoria", max_length=80, blank=True)
    status = models.CharField("situação", max_length=20, choices=Status.choices, default=Status.DRAFT)
    notes = models.TextField("observações", blank=True, max_length=5000)
    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [models.Index(fields=["owner", "status"])]
    def __str__(self):
        return self.title
