import getpass
import os
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from records.models import Record
from core.models import Activity

class Command(BaseCommand):
    help = "Create an optional local demo account and sample records. Never modifies an existing user."
    def add_arguments(self, parser):
        parser.add_argument("--username", default="admin")
        parser.add_argument("--no-input", action="store_true", help="Read BASE_DEMO_PASSWORD from environment.")
    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Demo data is only allowed with DEBUG=True.")
        User = get_user_model()
        username = options["username"]
        if User.objects.filter(username=username).exists():
            raise CommandError("User already exists. No changes made.")
        password = os.environ.get("BASE_DEMO_PASSWORD")
        if not password and not options["no_input"]:
            password = getpass.getpass("Senha para a conta local (min. 10 caracteres): ")
            if password != getpass.getpass("Confirme a senha: "):
                raise CommandError("Passwords do not match.")
        if not password:
            raise CommandError("Set BASE_DEMO_PASSWORD or run interactively.")
        try:
            validate_password(password, User(username=username))
        except ValidationError as exc:
            raise CommandError(" ".join(exc.messages)) from exc
        user = User.objects.create_superuser(username=username, password=password, first_name="Alex", email="")
        for title, category, status, notes in [
            ("Planejamento do novo projeto", "Planejamento", "active", "Definir objetivos e os primeiros passos."),
            ("Ideias para explorar", "Inspiração", "draft", "Um espaço para guardar ideias que ainda vão ganhar forma."),
            ("Checklist de lançamento", "Operação", "active", "Revisar os detalhes antes de começar."),
            ("Referências da primeira versão", "Referências", "archived", "Materiais guardados para consulta."),
        ]:
            Record.objects.create(owner=user, title=title, category=category, status=status, notes=notes)
            Activity.objects.create(actor=user, verb="criou", target=title)
        self.stdout.write(self.style.SUCCESS(f"Demo local criada. Usuário: {username}."))
