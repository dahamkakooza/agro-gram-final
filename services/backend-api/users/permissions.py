# services/backend-api/users/permissions.py
from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class IsAuthenticatedCustom(permissions.BasePermission):
    """
    Custom permission that checks if the user is authenticated via our custom UserProfile
    """
    def has_permission(self, request, view):
        # Check if user is authenticated (UserProfile instance)
        if not request.user or not hasattr(request.user, 'is_authenticated'):
            logger.warning("User not authenticated - no user object")
            return False
        
        # For custom UserProfile, we need to check if it's the right type
        if not hasattr(request.user, 'email') or not hasattr(request.user, 'firebase_uid'):
            logger.warning("User object doesn't have required attributes")
            return False
        
        # Check if user is active
        if not request.user.is_active:
            logger.warning(f"User {request.user.email} is inactive")
            return False
        
        logger.info(f"User {request.user.email} authenticated successfully")
        return True

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `user` or `owner`.
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        logger.warning(f"Object {obj} has no user/owner attribute for permission check")
        return False

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        is_admin = hasattr(request.user, 'role') and request.user.role == 'ADMIN'
        
        if not is_admin:
            logger.warning(f"User {request.user.email} with role {getattr(request.user, 'role', 'NO_ROLE')} attempted admin access")
        
        return is_admin

class IsFarmerUser(permissions.BasePermission):
    """
    Allows access only to farmer users.
    """
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        is_farmer = hasattr(request.user, 'role') and request.user.role == 'FARMER'
        
        return is_farmer

class IsConsumerUser(permissions.BasePermission):
    """Allows access only to consumer users."""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        return hasattr(request.user, 'role') and request.user.role == 'CONSUMER'

class IsSupplierUser(permissions.BasePermission):
    """Allows access only to supplier users."""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        return hasattr(request.user, 'role') and request.user.role == 'SUPPLIER'

class CanSellProducts(permissions.BasePermission):
    """Allows users who can sell products (Farmers, Suppliers)"""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        user_role = getattr(request.user, 'role', None)
        return user_role in ['FARMER', 'SUPPLIER']

class CanBuyProducts(permissions.BasePermission):
    """Allows users who can buy products (All roles)"""
    def has_permission(self, request, view):
        return IsAuthenticatedCustom().has_permission(request, view)

class HasMarketplaceAccess(permissions.BasePermission):
    """Allows marketplace access with role-specific restrictions"""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        # All roles can access marketplace
        user_role = getattr(request.user, 'role', None)
        return user_role in ['FARMER', 'CONSUMER', 'SUPPLIER', 'ADMIN']

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to all users, but write access only to admin users.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to admin users.
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        is_admin = hasattr(request.user, 'role') and request.user.role == 'ADMIN'
        
        if not is_admin:
            logger.warning(f"Non-admin user {request.user.email} attempted write operation")
        
        return is_admin

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners or admins to access the object.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can do anything
        if IsAuthenticatedCustom().has_permission(request, view):
            if hasattr(request.user, 'role') and request.user.role == 'ADMIN':
                return True

        # Check if the object has an owner/user attribute and it matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'farmer'):
            return obj.farmer == request.user
        elif hasattr(obj, 'customer'):
            return obj.customer == request.user
        elif hasattr(obj, 'id'):
            # For UserProfile objects accessing their own data
            return obj.id == request.user.id

        logger.warning(f"Object {obj} has no identifiable owner for permission check")
        return False

class IsVerifiedUser(permissions.BasePermission):
    """
    Allows access only to verified users.
    """
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        is_verified = hasattr(request.user, 'is_verified') and request.user.is_verified
        
        if not is_verified:
            logger.warning(f"Unverified user {request.user.email} attempted access")
        
        return is_verified

class HasRecentActivity(permissions.BasePermission):
    """
    Allows access only to users with recent activity (within last 30 days).
    Useful for detecting inactive accounts.
    """
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        has_recent_activity = (
            hasattr(request.user, 'last_activity') and 
            request.user.last_activity and 
            request.user.last_activity >= thirty_days_ago
        )
        
        if not has_recent_activity:
            logger.warning(f"User {request.user.email} has no recent activity")
        
        return has_recent_activity

class HasRolePermission(permissions.BasePermission):
    """
    Permission class that checks if user has specific role(s)
    """
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        user_role = getattr(request.user, 'role', None)
        has_role = user_role in self.allowed_roles
        
        if not has_role:
            logger.warning(f"User {request.user.email} with role {user_role} not in allowed roles: {self.allowed_roles}")
        
        return has_role

class IsSameUserOrAdmin(permissions.BasePermission):
    """
    Allows access only if the user is accessing their own data or is an admin.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can do anything
        if IsAuthenticatedCustom().has_permission(request, view):
            if hasattr(request.user, 'role') and request.user.role == 'ADMIN':
                return True

        # Check if the object is the user's own profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'id'):
            # For UserProfile objects
            return obj.id == request.user.id
        
        return False

class CanManageUsers(permissions.BasePermission):
    """
    Allows access only to users who can manage other users (Admins and Agents).
    """
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        user_role = getattr(request.user, 'role', None)
        can_manage = user_role in ['ADMIN', 'AGENT']
        
        return can_manage

class IsFarmOwner(permissions.BasePermission):
    """
    Allows access only to farm owners for farm-related operations.
    """
    def has_object_permission(self, request, view, obj):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False

        # Check if the object has an owner and it matches the current user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        logger.warning(f"Farm object {obj} has no owner attribute")
        return False

# Convenience permission classes for common role combinations
class IsAdminOrAgent(permissions.BasePermission):
    """Allows access to Admins and Agents"""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['ADMIN', 'AGENT']

class IsFarmerOrSupplier(permissions.BasePermission):
    """Allows access to Farmers and Suppliers"""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['FARMER', 'SUPPLIER']

class IsBusinessUser(permissions.BasePermission):
    """Allows access to business users (Farmers, Suppliers, Agents)"""
    def has_permission(self, request, view):
        if not IsAuthenticatedCustom().has_permission(request, view):
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['FARMER', 'SUPPLIER', 'AGENT']

# Simple permission for testing - allows any authenticated user
class AllowAnyAuthenticated(permissions.BasePermission):
    """
    Allows access to any authenticated user - useful for testing
    """
    def has_permission(self, request, view):
        return IsAuthenticatedCustom().has_permission(request, view)

# Usage examples in views:
# permission_classes = [IsAuthenticatedCustom, IsFarmerUser]
# permission_classes = [IsAuthenticatedCustom, IsAdminOrReadOnly]
# permission_classes = [IsAuthenticatedCustom, HasRolePermission(['ADMIN', 'AGENT'])]
# permission_classes = [AllowAnyAuthenticated]  # For testing