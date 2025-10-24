# marketplace/management/commands/setup_kaggle.py
import os
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Setup Kaggle API configuration and download datasets'
    
    def handle(self, *args, **options):
        # Create .kaggle directory
        kaggle_dir = os.path.expanduser('~/.kaggle')
        os.makedirs(kaggle_dir, exist_ok=True)
        
        # Get Kaggle credentials from environment
        kaggle_username = os.getenv('KAGGLE_USERNAME', '')
        kaggle_key = os.getenv('KAGGLE_KEY', '')
        
        if not kaggle_username or not kaggle_key:
            self.stdout.write(
                self.style.WARNING('⚠️ Kaggle credentials not found in environment variables')
            )
            self.stdout.write(
                self.style.NOTICE('💡 Please set KAGGLE_USERNAME and KAGGLE_KEY in your .env file')
            )
            self.stdout.write(
                self.style.NOTICE('📚 Get your API key from: https://www.kaggle.com/settings')
            )
            return
        
        # Create kaggle.json
        kaggle_json = {
            "username": kaggle_username,
            "key": kaggle_key
        }
        
        import json
        kaggle_path = os.path.join(kaggle_dir, 'kaggle.json')
        
        with open(kaggle_path, 'w') as f:
            json.dump(kaggle_json, f)
        
        # Set secure permissions
        os.chmod(kaggle_path, 0o600)
        
        self.stdout.write(
            self.style.SUCCESS('✅ Kaggle configuration created')
        )
        
        # Test Kaggle API
        try:
            import kaggle
            kaggle.api.authenticate()
            self.stdout.write(
                self.style.SUCCESS('✅ Kaggle authentication successful')
            )
            
            # Download datasets
            self.download_datasets()
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Kaggle authentication failed: {e}')
            )
    
    def download_datasets(self):
        """Download agricultural datasets"""
        try:
            from recommendations.ml_models.kaggle_enhanced_predictor import KaggleDatasetManager
            manager = KaggleDatasetManager()
            
            self.stdout.write('📥 Downloading Kaggle datasets...')
            results = manager.download_all_datasets()
            
            for dataset, result in results.items():
                if result.get('success'):
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ {dataset}: {result["description"]}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'⚠️ {dataset}: {result.get("error", "Failed")}')
                    )
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Dataset download failed: {e}')
            )