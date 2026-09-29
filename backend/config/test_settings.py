from .settings import *  # noqa: F403

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
STORAGES = {"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
            "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}}
