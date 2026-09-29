from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from accounts import views as accounts
from core import views as core
from records.views import RecordViewSet

router = DefaultRouter()
router.register("records", RecordViewSet, basename="record")
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", core.health),
    path("api/auth/csrf/", accounts.csrf),
    path("api/auth/login/", accounts.LoginView.as_view()),
    path("api/auth/logout/", accounts.logout_view),
    path("api/auth/me/", accounts.MeView.as_view()),
    path("api/auth/password/", accounts.change_password),
    path("api/users/", accounts.UserList.as_view()),
    path("api/dashboard/", core.dashboard),
    path("api/activity/", core.ActivityList.as_view()),
    path("api/", include(router.urls)),
]
