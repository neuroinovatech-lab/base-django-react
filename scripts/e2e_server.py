"""Start an isolated development backend for browser tests; no real data is used."""
import os
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
artifacts = root / ".artifacts"
artifacts.mkdir(exist_ok=True)
os.environ.update({
    "DJANGO_SETTINGS_MODULE": "config.settings", "DEBUG": "True",
    "DATABASE_URL": f"sqlite:///{(artifacts / 'e2e.sqlite3').as_posix()}",
    "CSRF_TRUSTED_ORIGINS": "http://127.0.0.1:18761",
    "SECURE_SSL_REDIRECT": "False", "SESSION_COOKIE_SECURE": "False", "CSRF_COOKIE_SECURE": "False",
})
sys.path.insert(0, str(root / "backend"))
import django
django.setup()
from django.conf import settings
from django.core.management import call_command
from django.contrib.auth import get_user_model
from records.models import Record
from core.models import Activity

if Path(settings.DATABASES["default"]["NAME"]).resolve() != (artifacts / "e2e.sqlite3").resolve():
    raise RuntimeError("Browser tests must use their own isolated database.")
call_command("migrate", interactive=False, verbosity=0)
User = get_user_model()
user, _ = User.objects.get_or_create(username="e2e")
user.set_password("Browser-test-password-947!")
user.first_name = "Alex"
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.save()
Record.objects.filter(owner=user).delete()
Activity.objects.filter(actor=user).delete()
for title, category, status in [
    ("Planejamento do novo projeto", "Planejamento", "active"),
    ("Ideias para explorar", "Inspiração", "draft"),
    ("Checklist de lançamento", "Operação", "active"),
    ("Referências da primeira versão", "Referências", "archived"),
]:
    Record.objects.create(owner=user, title=title, category=category, status=status)
    Activity.objects.create(actor=user, verb="criou", target=title)
call_command("runserver", "127.0.0.1:18760", use_reloader=False)
