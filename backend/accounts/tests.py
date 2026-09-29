from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient
from .models import User

class AuthenticationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="ana", password="First-password-492!")
        self.client = APIClient(enforce_csrf_checks=True)

    def token(self):
        return self.client.get("/api/auth/csrf/").json()["csrfToken"]

    def login(self):
        return self.client.post("/api/auth/login/", {"username": "ana", "password": "First-password-492!"}, format="json", HTTP_X_CSRFTOKEN=self.token())

    def test_login_requires_csrf_even_when_anonymous(self):
        response = self.client.post("/api/auth/login/", {"username": "ana", "password": "First-password-492!"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_session_login_and_logout(self):
        self.assertEqual(self.login().status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me/").json()["username"], "ana")
        self.assertTrue(self.client.cookies["sessionid"]["httponly"])
        self.assertEqual(self.client.post("/api/auth/logout/", HTTP_X_CSRFTOKEN=self.token()).status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 403)

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.login().status_code, 400)

    def test_password_change_requires_old_password_and_validates_new(self):
        self.login()
        for current, new in [("wrong", "Another-password-843!"), ("First-password-492!", "123")]:
            response = self.client.post("/api/auth/password/", {"current_password": current, "new_password": new}, format="json", HTTP_X_CSRFTOKEN=self.token())
            self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.post("/api/auth/password/", {"current_password": "First-password-492!", "new_password": "Another-password-843!"}, format="json", HTTP_X_CSRFTOKEN=self.token()).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Another-password-843!"))
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 200)

    def test_profile_cannot_escalate_privileges(self):
        self.login()
        response = self.client.patch("/api/auth/me/", {"first_name": "Ana", "is_staff": True, "is_superuser": True, "username": "admin"}, format="json", HTTP_X_CSRFTOKEN=self.token())
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Ana")
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
        self.assertEqual(self.user.username, "ana")

    def test_users_list_is_staff_only(self):
        self.login()
        self.assertEqual(self.client.get("/api/users/").status_code, 403)
        self.user.is_staff = True
        self.user.save()
        self.assertEqual(self.client.get("/api/users/").status_code, 200)

    def test_login_is_throttled(self):
        token = self.token()
        for _ in range(10):
            self.client.post("/api/auth/login/", {"username": "ana", "password": "wrong"}, format="json", HTTP_X_CSRFTOKEN=token)
        response = self.client.post("/api/auth/login/", {"username": "ana", "password": "wrong"}, format="json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 429)
