from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from core.models import Activity
from .models import Record

class RecordTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ana", password="First-password-492!")
        self.other = User.objects.create_user(username="bia", password="Second-password-492!")
        self.own = Record.objects.create(owner=self.user, title="Meu projeto", category="Produto", status="active")
        self.foreign = Record.objects.create(owner=self.other, title="Projeto privado", status="draft")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_anonymous_access_is_denied(self):
        self.client.force_authenticate(None)
        for path in ["/api/records/", "/api/dashboard/", "/api/activity/", "/api/users/"]:
            self.assertEqual(self.client.get(path).status_code, 403)

    def test_list_and_dashboard_are_scoped_to_owner(self):
        response = self.client.get("/api/records/").json()
        self.assertEqual(response["count"], 1)
        self.assertEqual(response["results"][0]["id"], self.own.id)
        data = self.client.get("/api/dashboard/").json()
        self.assertEqual(data["total"], 1)
        self.assertEqual(data["draft"], 0)

    def test_cannot_read_update_or_delete_another_users_record(self):
        path = f"/api/records/{self.foreign.id}/"
        self.assertEqual(self.client.get(path).status_code, 404)
        self.assertEqual(self.client.patch(path, {"title": "Changed"}).status_code, 404)
        self.assertEqual(self.client.delete(path).status_code, 404)
        self.assertTrue(Record.objects.filter(pk=self.foreign.pk).exists())

    def test_crud_assigns_owner_and_logs_activity(self):
        response = self.client.post("/api/records/", {"title": "New", "owner": self.other.id}, format="json")
        self.assertEqual(response.status_code, 201)
        record = Record.objects.get(pk=response.json()["id"])
        self.assertEqual(record.owner, self.user)
        path = f"/api/records/{record.id}/"
        self.assertEqual(self.client.patch(path, {"title": "Updated", "status": "active"}).status_code, 200)
        self.assertEqual(self.client.delete(path).status_code, 204)
        self.assertEqual(list(Activity.objects.filter(actor=self.user).values_list("verb", flat=True)), ["excluiu", "atualizou", "criou"])

    def test_search_status_and_pagination(self):
        Record.objects.bulk_create([Record(owner=self.user, title=f"Item {i}") for i in range(14)])
        self.assertEqual(len(self.client.get("/api/records/").json()["results"]), 12)
        self.assertEqual(len(self.client.get("/api/records/?page=2").json()["results"]), 3)
        response = self.client.get("/api/records/?search=Produto&status=active").json()
        self.assertEqual(response["count"], 1)
        self.assertEqual(response["results"][0]["id"], self.own.id)

    def test_invalid_records_are_rejected(self):
        for data in [{"title": " "}, {"title": "OK", "status": "invalid"}, {"title": "x" * 161}]:
            self.assertEqual(self.client.post("/api/records/", data, format="json").status_code, 400)

    def test_activity_does_not_leak_between_users(self):
        Activity.objects.create(actor=self.other, verb="criou", target="Privado")
        self.assertEqual(self.client.get("/api/activity/").json()["count"], 0)
        self.assertEqual(self.client.get("/api/dashboard/").json()["activity"], [])

    def test_write_requires_csrf_with_real_session(self):
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(self.user)
        self.assertEqual(client.post("/api/records/", {"title": "Unsafe"}).status_code, 403)
