from pathlib import Path
import environ
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / ".env")
DEBUG = env("DEBUG")
SECRET_KEY = env("SECRET_KEY", default="local-development-only-change-before-production")
if not DEBUG and (len(SECRET_KEY) < 50 or SECRET_KEY.startswith(("local-", "replace-"))):
    raise ImproperlyConfigured("Set a random SECRET_KEY of at least 50 characters.")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])
INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "rest_framework", "accounts", "core", "records",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware", "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware", "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
              "OPTIONS": {"context_processors": ["django.template.context_processors.request",
                  "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"
DATABASES = {"default": env.db(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}") if env("DATABASE_URL", default="") else {
    "ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_RATES": {"login": "10/minute"},
}
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
            "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"}}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 60 * 60 * 12
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=not DEBUG)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=not DEBUG)
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=not DEBUG)
SECURE_HSTS_SECONDS = 0 if DEBUG else 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
