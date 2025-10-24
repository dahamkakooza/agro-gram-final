from django.core.management.base import BaseCommand
from users.models import UserProfile
from marketplace.models import ProductCategory, ProductListing, UserPreference
from django.utils import timezone
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Seed the marketplace with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding marketplace data...')
        
        # Create categories with ai_prompt_templates
        categories_data = [
            {
                'name': 'Grains',
                'description': 'Cereal grains and staples',
                'keywords': ['maize', 'corn', 'wheat', 'rice', 'grains', 'cereal'],
                'ai_prompt_templates': {
                    'price_prediction': 'Predict prices for {crop} grains based on seasonal trends',
                    'demand_analysis': 'Analyze demand patterns for {crop} in the grains category',
                    'quality_assessment': 'Assess quality standards for {crop} grains'
                }
            },
            {
                'name': 'Vegetables',
                'description': 'Fresh vegetables and greens',
                'keywords': ['tomato', 'potato', 'onion', 'carrot', 'vegetables', 'greens'],
                'ai_prompt_templates': {
                    'price_prediction': 'Predict prices for {crop} vegetables considering freshness',
                    'demand_analysis': 'Analyze seasonal demand for {crop} vegetables',
                    'quality_assessment': 'Evaluate freshness and quality of {crop} vegetables'
                }
            }
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories[cat_data['name']] = category
            self.stdout.write(f'{"Created" if created else "Found"} category: {category.name}')
        
        # Try to use existing user first, otherwise create test user
        try:
            user_profile = UserProfile.objects.first()
            self.stdout.write(f'Using existing user: {user_profile.email}')
        except:
            # Create a test user if none exist
            user_profile = UserProfile.objects.create(
                firebase_uid='seed_test_farmer_123',
                email='testfarmer@example.com',
                password=make_password('testpass123'),
                first_name='Test',
                last_name='Farmer',
                phone_number='+1234567890',
                role='FARMER',
                location='Nairobi, Kenya',
                farm_types=['grains', 'vegetables'],
                is_verified=True,
            )
            self.stdout.write('Created test farmer user profile')
        
        # Create sample products - provide location even though it's optional in model
        products_data = [
            {
                'title': 'Premium Maize',
                'description': 'High-quality maize grains, freshly harvested',
                'category': categories['Grains'],
                'price': 45.50,
                'quantity': 1000,
                'unit': 'KG',
                'quality_grade': 'PREMIUM',
                'location': 'Nairobi, Kenya',  # Provide location to be safe
                'status': 'AVAILABLE',
                'demand_score': 0.8,
                'price_trend': 2.5
            },
            {
                'title': 'Organic Tomatoes',
                'description': 'Fresh organic tomatoes, pesticide-free',
                'category': categories['Vegetables'],
                'price': 18.75,
                'quantity': 500,
                'unit': 'KG',
                'quality_grade': 'ORGANIC',
                'location': 'Nakuru, Kenya',  # Provide location to be safe
                'status': 'AVAILABLE',
                'demand_score': 0.9,
                'price_trend': 5.2
            }
        ]
        
        created_count = 0
        for product_data in products_data:
            try:
                product, created = ProductListing.objects.get_or_create(
                    title=product_data['title'],
                    farmer=user_profile,
                    defaults=product_data
                )
                if created:
                    self.stdout.write(f'Created product: {product.title}')
                    created_count += 1
                else:
                    self.stdout.write(f'Product already exists: {product.title}')
            except Exception as e:
                self.stdout.write(f'Error creating product {product_data["title"]}: {e}')
        
        # Create user preferences if they don't exist
        preferences, created = UserPreference.objects.get_or_create(
            user=user_profile,
            defaults={
                'quality_preference': 'PREMIUM',
                'price_range_min': 10.00,
                'price_range_max': 100.00,
                'preferred_location': 'Nairobi',
                'email_notifications': True,
                'price_alert_notifications': True
            }
        )
        
        if created:
            self.stdout.write('Created user preferences')
        
        # Add preferred categories
        for category_name in ['Grains', 'Vegetables']:
            if category_name in categories:
                preferences.preferred_categories.add(categories[category_name])
        
        self.stdout.write(
            self.style.SUCCESS('✅ Successfully seeded marketplace data!')
        )
        self.stdout.write(f'📊 Categories: {ProductCategory.objects.count()}')
        self.stdout.write(f'📦 Products: {ProductListing.objects.count()} ({created_count} new)')
        self.stdout.write(f'👤 User Profiles: {UserProfile.objects.count()}')
        self.stdout.write(f'⚙️ User Preferences: {UserPreference.objects.count()}')
        # Ensure all users have preferences
self.stdout.write("\nEnsuring all users have preferences...")
for user in UserProfile.objects.all():
    prefs, created = UserPreference.objects.get_or_create(
        user=user,
        defaults={
            'quality_preference': 'STANDARD',
            'price_range_min': 15.00,
            'price_range_max': 85.00,
            'preferred_location': 'Kampala, Uganda',
            'email_notifications': True,
            'price_alert_notifications': True
        }
    )
    if created:
        self.stdout.write(f'Created preferences for {user.email}')