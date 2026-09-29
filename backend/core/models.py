from django.conf import settings
from django.db import models

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Activity(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    verb = models.CharField(max_length=30)
    target = models.CharField(max_length=160)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-created_at", "-id"]
