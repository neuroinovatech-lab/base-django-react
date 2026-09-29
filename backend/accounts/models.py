from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Extend here before creating project-specific user fields."""
    pass
