from django.contrib import admin
from .models import Record

@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ["title", "owner", "status", "updated_at"]
    list_filter = ["status"]
    search_fields = ["title", "owner__username"]
