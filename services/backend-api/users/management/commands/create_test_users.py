# users/management/commands/create_test_users.py
from django.core.management.base import BaseCommand
from users.models import UserProfile

class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        test_users = [
            {
                'email': 'commercial@agrogram.com',
                'firebase_uid': 'test_commercial_001',
                'role': 'FARMER',
                'sub_role': 'COMMERCIAL_FARMER',
                'first_name': 'John',
                'last_name': 'Kamau',
                'business_name': 'Green Valley Commercial Farms',
                'location': 'Nairobi, Kenya',
                'farm_size': 150.50,
                'is_verified': True,
                'is_active': True
            },
            {
                'email': 'smallholder@agrogram.com', 
                'firebase_uid': 'test_smallholder_001',
                'role': 'FARMER',
                'sub_role': 'SMALLHOLDER_FARMER',
                'first_name': 'Mary',
                'last_name': 'Wanjiku',
                'business_name': 'Mary Organic Farm',
                'location': 'Kiambu, Kenya',
                'farm_size': 2.5,
                'is_verified': True,
                'is_active': True
            },
            {
                'email': 'financial@agrogram.com',
                'firebase_uid': 'test_financial_001',
                'role': 'AGENT',
                'sub_role': 'FINANCIAL_ADVISOR',
                'first_name': 'David',
                'last_name': 'Chen',
                'business_name': 'Agri-Finance Solutions',
                'location': 'Mombasa, Kenya',
                'is_verified': True,
                'is_active': True
            },
            {
                'email': 'restaurant@agrogram.com',
                'firebase_uid': 'test_restaurant_001',
                'role': 'CONSUMER',
                'sub_role': 'RESTAURANT_BUSINESS',
                'first_name': 'Grace',
                'last_name': 'Akinyi',
                'business_name': 'Fresh Taste Restaurant',
                'location': 'Eldoret, Kenya',
                'is_verified': True,
                'is_active': True
            },
            {
                'email': 'organic@agrogram.com',
                'firebase_uid': 'test_organic_001',
                'role': 'FARMER',
                'sub_role': 'ORGANIC_SPECIALIST',
                'first_name': 'Paul',
                'last_name': 'Gitonga',
                'business_name': 'Pure Organic Farms',
                'location': 'Thika, Kenya',
                'farm_size': 25.0,
                'is_verified': True,
                'is_active': True
            }
        ]
        
        created_count = 0
        for user_data in test_users:
            try:
                user, created = UserProfile.objects.get_or_create(
                    email=user_data['email'],
                    defaults=user_data
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Created user: {user.email} ({user.role} - {user.sub_role})')
                    )
                    created_count += 1
                else:
                    # Update existing user
                    for key, value in user_data.items():
                        setattr(user, key, value)
                    user.save()
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Updated user: {user.email}')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error creating {user_data["email"]}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully processed {created_count} users!')
        )
        
        # Verify creation
        total_users = UserProfile.objects.count()
        self.stdout.write(f'📊 Total users in database: {total_users}')