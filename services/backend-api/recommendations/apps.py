from django.apps import AppConfig

class RecommendationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommendations'
    label = 'recommendations'
    
    def ready(self):
        # Import signals if you have any
        try:
            import recommendations.signals  # noqa: F401
        except ImportError:
            pass