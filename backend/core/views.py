from django.db import connection
from rest_framework import generics, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from records.models import Record
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["id", "verb", "target", "created_at"]

class ActivityList(generics.ListAPIView):
    serializer_class = ActivitySerializer
    def get_queryset(self):
        return Activity.objects.filter(actor=self.request.user)

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        return Response({"status": "unavailable"}, status=503)
    return Response({"status": "ok"})

@api_view(["GET"])
def dashboard(request):
    records = Record.objects.filter(owner=request.user)
    return Response({
        "total": records.count(),
        "active": records.filter(status=Record.Status.ACTIVE).count(),
        "draft": records.filter(status=Record.Status.DRAFT).count(),
        "archived": records.filter(status=Record.Status.ARCHIVED).count(),
        "activity": ActivitySerializer(Activity.objects.filter(actor=request.user)[:5], many=True).data,
    })
