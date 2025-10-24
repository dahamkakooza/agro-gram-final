# services/backend-api/users/authentication.py
import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication, exceptions
from django.utils import timezone
from .models import UserProfile, UserActivityLog, UserSession
import logging
import uuid

logger = logging.getLogger(__name__)

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Firebase Authentication
    """
    @staticmethod
    def get_authentication_classes():
        """
        Smart authentication selector that returns appropriate authentication classes
        based on the environment (development vs production)
        """
        from django.conf import settings
        
        if settings.DEBUG:
            # In development: Try Firebase first, then fall back to debug auth
            return [FirebaseAuthentication, DebugModeAuthentication, FirebaseDevelopmentAuthentication]
        else:
            # In production: Only use Firebase authentication
            return [FirebaseAuthentication]
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        logger.info(f"Auth header received: {auth_header}")
        
        if not auth_header:
            logger.warning("No authorization header provided")
            return None

        try:
            # Extract token from "Bearer <token>" format
            parts = auth_header.split(' ')
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                logger.error("Invalid authorization header format")
                raise exceptions.AuthenticationFailed('Invalid authorization header format. Expected: Bearer <token>')
            
            id_token = parts[1]
            logger.info(f"Token extracted: {id_token[:50]}...")
            
            # Verify Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            logger.info(f"Token verified for UID: {firebase_uid}, email: {email}")
            
            # Get or create user profile
            user_profile = self._get_or_create_user_profile(firebase_uid, email, decoded_token)
            
            # Update user activity
            self._update_user_activity(user_profile, request)
            
            # Create or update session
            self._manage_user_session(user_profile, request, id_token)
            
            logger.info(f"Authentication successful for user: {user_profile.email}")
            return (user_profile, None)  # FIXED: Return UserProfile directly, not user_profile.user
            
        except auth.InvalidIdTokenError as e:
            logger.error(f"Invalid Firebase ID token: {str(e)}")
            raise exceptions.AuthenticationFailed('Invalid Firebase ID token')
        except auth.ExpiredIdTokenError as e:
            logger.error(f"Expired Firebase ID token: {str(e)}")
            raise exceptions.AuthenticationFailed('Expired Firebase ID token')
        except auth.RevokedIdTokenError as e:
            logger.error(f"Revoked Firebase ID token: {str(e)}")
            raise exceptions.AuthenticationFailed('Revoked Firebase ID token')
        except auth.CertificateFetchError as e:
            logger.error(f"Certificate fetch error: {str(e)}")
            raise exceptions.AuthenticationFailed('Authentication service unavailable')
        except Exception as e:
            logger.error(f"Unexpected authentication error: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def _get_or_create_user_profile(self, firebase_uid, email, decoded_token):
        """Get or create user profile with data from Firebase"""
        try:
            # First, try to get existing UserProfile
            try:
                user_profile = UserProfile.objects.get(firebase_uid=firebase_uid)
                logger.info(f"Found existing UserProfile for {email}")
                
                # Update email if it has changed
                if user_profile.email != email:
                    user_profile.email = email
                    user_profile.save(update_fields=['email'])
                
                return user_profile
                
            except UserProfile.DoesNotExist:
                # Create new UserProfile directly (no separate Django User needed)
                logger.info(f"Creating new UserProfile for {email}")
                
                # Extract name from token
                name = decoded_token.get('name', '')
                first_name = name.split(' ')[0] if name else ''
                last_name = ' '.join(name.split(' ')[1:]) if name else ''
                
                # Create UserProfile directly
                user_profile = UserProfile.objects.create_user(
                    email=email,
                    firebase_uid=firebase_uid,
                    first_name=first_name,
                    last_name=last_name,
                    profile_picture=decoded_token.get('picture', ''),
                    is_verified=decoded_token.get('email_verified', False),
                    role='FARMER'  # Default role
                )
                
                # Log the registration activity
                UserActivityLog.objects.create(
                    user=user_profile,
                    activity_type='REGISTRATION',
                    description='First time login - account created',
                    ip_address='',  # Will be updated in activity log
                    metadata={'first_login': True, 'firebase_uid': firebase_uid}
                )
                
                logger.info(f"Created new user: {user_profile.email} (ID: {user_profile.id})")
                return user_profile
                
        except Exception as e:
            logger.error(f"Error in get_or_create_user_profile: {str(e)}")
            raise exceptions.AuthenticationFailed('Unable to retrieve or create user profile')
    
    def _update_user_activity(self, user_profile, request):
        """Update user activity and log login"""
        try:
            # Update user's last activity
            ip_address = self._get_client_ip(request)
            
            # Update last_activity field and login count
            user_profile.last_activity = timezone.now()
            user_profile.login_count += 1
            user_profile.last_login_ip = ip_address
            user_profile.save(update_fields=['last_activity', 'login_count', 'last_login_ip'])
            
            # Log the login activity
            UserActivityLog.objects.create(
                user=user_profile,
                activity_type='LOGIN',
                description='User logged in successfully',
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                metadata={
                    'login_method': 'firebase',
                    'path': request.path,
                    'method': request.method
                }
            )
            
        except Exception as e:
            logger.error(f"Error updating user activity: {str(e)}")
            # Don't fail authentication if activity logging fails
    
    def _manage_user_session(self, user_profile, request, id_token):
        """Manage user session tracking"""
        try:
            session_key = str(uuid.uuid4())
            ip_address = self._get_client_ip(request)
            
            # Create new session
            UserSession.objects.create(
                user=user_profile,
                session_key=session_key,
                firebase_token=id_token[:100],  # Store only first 100 chars
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:200],
                device_info=self._get_device_info(request),
                expires_at=timezone.now() + timezone.timedelta(days=30)  # 30-day session
            )
            
            # Add session key to request for potential use
            request.session_key = session_key
            
        except Exception as e:
            logger.error(f"Error managing user session: {str(e)}")
            # Don't fail authentication if session management fails
    
    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _get_device_info(self, request):
        """Extract device information from request"""
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        return {
            'user_agent': user_agent[:500],
            'browser': self._parse_browser(user_agent),
            'platform': self._parse_platform(user_agent),
        }
    
    def _parse_browser(self, user_agent):
        """Simple browser detection from user agent"""
        user_agent = user_agent.lower()
        if 'chrome' in user_agent and 'edg' not in user_agent:
            return 'Chrome'
        elif 'firefox' in user_agent:
            return 'Firefox'
        elif 'safari' in user_agent and 'chrome' not in user_agent:
            return 'Safari'
        elif 'edg' in user_agent:
            return 'Edge'
        else:
            return 'Unknown'
    
    def _parse_platform(self, user_agent):
        """Simple platform detection from user agent"""
        user_agent = user_agent.lower()
        if 'windows' in user_agent:
            return 'Windows'
        elif 'mac' in user_agent:
            return 'Mac'
        elif 'linux' in user_agent:
            return 'Linux'
        elif 'android' in user_agent:
            return 'Android'
        elif 'iphone' in user_agent or 'ipad' in user_agent:
            return 'iOS'
        else:
            return 'Unknown'

class FirebaseOptionalAuthentication(FirebaseAuthentication):
    """
    Optional Firebase authentication - doesn't require token but validates if provided
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            logger.info("No authorization header - optional auth returning None")
            return None

        try:
            return super().authenticate(request)
        except exceptions.AuthenticationFailed as e:
            logger.warning(f"Optional authentication failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in optional authentication: {str(e)}")
            return None

class DebugModeAuthentication(authentication.BaseAuthentication):
    """
    Authentication that automatically works in DEBUG mode - for development
    """
    def authenticate(self, request):
        from django.conf import settings
        
        # Only work in development mode
        if not settings.DEBUG:
            return None
            
        try:
            # Get your admin user with real Firebase UID
            admin_user = UserProfile.objects.get(firebase_uid='ZS93kPfNqCUpOmju1K0W98HVRwx2')
            logger.info(f"Debug auth using: {admin_user.email}")
            return (admin_user, None)  # Return UserProfile directly
            
        except UserProfile.DoesNotExist:
            # Create the admin user if it doesn't exist
            try:
                admin_user = UserProfile.objects.create_user(
                    email='mahadkakooza6@gmail.com',
                    firebase_uid='ZS93kPfNqCUpOmju1K0W98HVRwx2',
                    first_name='Mahad',
                    last_name='Kakooza',
                    role='ADMIN',
                    is_verified=True,
                    is_staff=True,
                    is_superuser=True
                )
                logger.info(f"🔧 Created debug admin user: {admin_user.email}")
                return (admin_user, None)
            except Exception as e:
                logger.error(f"❌ Debug auth failed to create user: {str(e)}")
                return None

class FirebaseDevelopmentAuthentication(authentication.BaseAuthentication):
    """
    Development-only authentication for testing without Firebase
    """
    def authenticate(self, request):
        # Check if we should use development auth (based on settings or header)
        use_dev_auth = getattr(request, 'use_development_auth', False)
        
        if not use_dev_auth:
            # Check for a development header
            dev_header = request.META.get('HTTP_X_USE_DEV_AUTH')
            if not dev_header or dev_header.lower() != 'true':
                return None
        
        try:
            # Try to get an existing admin user first
            user_profile = UserProfile.objects.filter(role='ADMIN').first()
            
            if not user_profile:
                logger.info("Creating development test users for Agro-Gram")
                
                # Create Admin User (You - Mahad)
                admin_profile = UserProfile.objects.create_user(
                    email='k.mahad@alustudent.com',
                    firebase_uid='dev_admin_001',
                    first_name='Mahad',
                    last_name='Kakooza',
                    role='ADMIN',
                    is_verified=True,
                    is_staff=True,
                    is_superuser=True
                )
                user_profile = admin_profile
                logger.info(f"Created admin user: {admin_profile.email}")
            
            # Update last activity
            user_profile.last_activity = timezone.now()
            user_profile.save(update_fields=['last_activity'])
            
            logger.info(f"Development auth successful for: {user_profile.email} (Role: {user_profile.role})")
            return (user_profile, None)  # Return UserProfile directly
            
        except Exception as e:
            logger.error(f"Development authentication error: {str(e)}")
            return None