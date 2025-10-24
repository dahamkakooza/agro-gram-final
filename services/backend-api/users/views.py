# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import UserProfile, UserActivityLog, Notification
from .serializers import (
    UserProfileSerializer, UserProfileCreateSerializer, UserProfileUpdateSerializer,
    UserActivityLogSerializer, NotificationSerializer, UserStatsSerializer,
    PasswordChangeSerializer
)
from .authentication import FirebaseAuthentication, FirebaseOptionalAuthentication, DebugModeAuthentication
from .permissions import IsAuthenticatedCustom, IsAdminUser, AllowAnyAuthenticated
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Smart authentication selector
def get_authentication_classes():
    if settings.DEBUG:
        return [FirebaseAuthentication, DebugModeAuthentication]
    else:
        return [FirebaseAuthentication]

# FIXED: Custom authentication decorator for function-based views with proper user validation
def custom_auth_required(view_func):
    """
    Decorator to apply authentication to function-based views
    """
    @authentication_classes(get_authentication_classes())
    @permission_classes([IsAuthenticatedCustom])
    @api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    def wrapped_view(request, *args, **kwargs):
        # FIXED: Comprehensive authentication check to prevent AnonymousUser issues
        if not request.user or not request.user.is_authenticated or request.user.is_anonymous:
            logger.warning("Unauthorized access attempt to protected endpoint")
            return Response({
                "success": False,
                "error": "Authentication required",
                "message": "You must be logged in to access this resource"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # FIXED: Additional check to ensure we have a proper UserProfile instance
        if not hasattr(request.user, '_meta') or not isinstance(request.user, UserProfile):
            logger.error(f"Invalid user object type: {type(request.user)}")
            return Response({
                "success": False,
                "error": "Invalid user object",
                "message": "Authentication failed - invalid user profile"
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        return view_func(request, *args, **kwargs)
    return wrapped_view

# Add to users/views.py
# Add these Cart views to users/views.py

class CartView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            # Mock cart data - replace with actual cart logic
            cart_data = {
                "items": [],
                "summary": {
                    "subtotal": 0,
                    "shipping": 0,
                    "tax": 0,
                    "total": 0,
                    "items_count": 0
                }
            }
            return Response({"success": True, "data": cart_data})
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CartItemListCreateView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        return Response({"success": True, "data": []})
    
    def post(self, request):
        return Response({"success": True, "message": "Item added to cart"})

class CartItemDetailView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def patch(self, request, item_id):
        return Response({"success": True, "message": "Cart item updated"})
    
    def delete(self, request, item_id):
        return Response({"success": True, "message": "Item removed from cart"})

class ClearCartView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def delete(self, request):
        return Response({"success": True, "message": "Cart cleared"})

class OrderListCreateView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        return Response({"success": True, "data": []})
    
    def post(self, request):
        return Response({"success": True, "message": "Order created"})

class OrderDetailView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request, order_id):
        return Response({"success": True, "data": {}})

class CancelOrderView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def patch(self, request, order_id):
        return Response({"success": True, "message": "Order cancelled"})
# users/views.py - ADD THESE NEW 18 DASHBOARD VIEWS


# NEW: All Sub-Role Dashboard Views
class SmallholderFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            logger.info(f"Loading Smallholder Farmer Dashboard for {user.email}")
            
            dashboard_data = {
                "success": True,
                "data": {
                    "dashboard_type": "smallholder_farmer",
                    "welcome_message": f"Welcome, {user.first_name or 'Farmer'}!",
                    "today_priorities": self._get_today_priorities(user),
                    "active_crops": self._get_active_crops(user),
                    "market_prices": self._get_market_prices(),
                    "quick_actions": [
                        {"title": "Record Harvest", "icon": "🌾", "url": "/farms"},
                        {"title": "Check Prices", "icon": "💰", "url": "/marketplace"},
                        {"title": "Get Advice", "icon": "🤝", "url": "/recommendations"}
                    ],
                    "stats": {
                        "total_farms": user.farms.count(),
                        "active_crops_count": sum(farm.plots.filter(crop_status__in=['PLANTED', 'GROWING']).count() for farm in user.farms.all()),
                        "pending_tasks": sum(farm.tasks.filter(status='PENDING').count() for farm in user.farms.all()),
                        "revenue_this_month": float(getattr(user, 'total_revenue', 0))
                    }
                }
            }
            
            return Response(dashboard_data)
            
        except Exception as e:
            logger.error(f"Smallholder Farmer Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "smallholder_farmer",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Farmer'}!",
                    "today_priorities": [],
                    "active_crops": [],
                    "market_prices": [],
                    "quick_actions": [],
                    "stats": {
                        "total_farms": 0,
                        "active_crops_count": 0,
                        "pending_tasks": 0,
                        "revenue_this_month": 0
                    },
                    "message": "Dashboard is being prepared with your data"
                }
            })
    
    def _get_today_priorities(self, user):
        # Mock data - replace with actual logic
        return [
            {"task": "Water tomato plants", "priority": "high", "time": "Morning"},
            {"task": "Check soil moisture", "priority": "medium", "time": "Afternoon"},
            {"task": "Record harvest", "priority": "medium", "time": "Evening"}
        ]
    
    def _get_active_crops(self, user):
        # Mock data - replace with actual logic
        return [
            {"crop": "Tomatoes", "status": "growing", "progress": 65},
            {"crop": "Maize", "status": "planted", "progress": 30},
            {"crop": "Beans", "status": "ready", "progress": 95}
        ]
    
    def _get_market_prices(self):
        # Mock data - replace with actual logic
        return [
            {"crop": "Tomatoes", "price": 45.50, "unit": "kg", "trend": "up"},
            {"crop": "Maize", "price": 32.75, "unit": "kg", "trend": "stable"},
            {"crop": "Beans", "price": 68.20, "unit": "kg", "trend": "up"}
        ]

class CommercialFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "commercial_farmer",
                    "welcome_message": f"Welcome, {user.first_name or 'Commercial Farmer'}!",
                    "enterprise_overview": self._get_enterprise_overview(user),
                    "supply_chain": self._get_supply_chain_data(user),
                    "business_intel": self._get_business_intelligence(user),
                    "stats": {
                        "total_farms": user.farms.count(),
                        "total_employees": 0,  # Add actual logic
                        "monthly_revenue": float(getattr(user, 'total_revenue', 0)),
                        "profit_margin": 25.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Commercial Farmer Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "commercial_farmer",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Commercial Farmer'}!",
                    "enterprise_overview": {},
                    "supply_chain": {},
                    "business_intel": {},
                    "stats": {
                        "total_farms": 0,
                        "total_employees": 0,
                        "monthly_revenue": 0,
                        "profit_margin": 0
                    }
                }
            })
    
    def _get_enterprise_overview(self, user):
        return {"total_operations": 5, "active_contracts": 3, "production_volume": 15000}
    
    def _get_supply_chain_data(self, user):
        return {"suppliers": 8, "distribution_channels": 3, "logistics_partners": 2}
    
    def _get_business_intelligence(self, user):
        return {"market_share": "15%", "growth_rate": "12%", "customer_satisfaction": "94%"}

class OrganicSpecialistDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "organic_specialist",
                    "welcome_message": f"Welcome, {user.first_name or 'Organic Specialist'}!",
                    "certification_status": self._get_certification_status(user),
                    "premium_marketplace": self._get_premium_marketplace(),
                    "quality_metrics": self._get_quality_metrics(user),
                    "stats": {
                        "certified_plots": 12,
                        "premium_products": 8,
                        "price_premium": 35.0,
                        "organic_yield": 85.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Organic Specialist Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "organic_specialist",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Organic Specialist'}!",
                    "certification_status": {},
                    "premium_marketplace": [],
                    "quality_metrics": {},
                    "stats": {
                        "certified_plots": 0,
                        "premium_products": 0,
                        "price_premium": 0,
                        "organic_yield": 0
                    }
                }
            })
    
    def _get_certification_status(self, user):
        return {"status": "certified", "expiry_date": "2024-12-31", "certification_body": "ECO-CERT"}
    
    def _get_premium_marketplace(self):
        return [{"product": "Organic Tomatoes", "premium_price": 75.0, "demand": "high"}]
    
    def _get_quality_metrics(self, user):
        return {"soil_health": 92, "biodiversity_index": 88, "sustainability_score": 95}

class LivestockFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "livestock_farmer",
                    "welcome_message": f"Welcome, {user.first_name or 'Livestock Farmer'}!",
                    "livestock_health": self._get_livestock_health(user),
                    "product_processing": self._get_product_processing(user),
                    "vet_coordination": self._get_vet_coordination(user),
                    "stats": {
                        "total_animals": 150,
                        "health_index": 94.5,
                        "milk_production": 450.0,
                        "processing_efficiency": 88.0
                    }
                }
            })
        except Exception as e:
            logger.error(f"Livestock Farmer Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "livestock_farmer",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Livestock Farmer'}!",
                    "livestock_health": {},
                    "product_processing": {},
                    "vet_coordination": {},
                    "stats": {
                        "total_animals": 0,
                        "health_index": 0,
                        "milk_production": 0,
                        "processing_efficiency": 0
                    }
                }
            })
    
    def _get_livestock_health(self, user):
        return {"healthy_animals": 142, "under_observation": 5, "vaccination_due": 3}
    
    def _get_product_processing(self, user):
        return {"daily_milk": 450.0, "meat_processing": 25.0, "byproducts": 12.5}
    
    def _get_vet_coordination(self, user):
        return {"next_checkup": "2024-01-15", "vaccination_schedule": "Up to date", "emergency_contacts": 3}

# Consumer Dashboards
class IndividualConsumerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "individual_consumer",
                    "welcome_message": f"Welcome, {user.first_name or 'Valued Customer'}!",
                    "personalized_shopping": self._get_personalized_shopping(user),
                    "quick_order": self._get_quick_order(user),
                    "delivery_management": self._get_delivery_management(user),
                    "stats": {
                        "cart_items": 3,
                        "pending_orders": 1,
                        "monthly_spending": 245.50,
                        "savings_this_month": 45.75
                    }
                }
            })
        except Exception as e:
            logger.error(f"Individual Consumer Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "individual_consumer",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Valued Customer'}!",
                    "personalized_shopping": [],
                    "quick_order": {},
                    "delivery_management": {},
                    "stats": {
                        "cart_items": 0,
                        "pending_orders": 0,
                        "monthly_spending": 0,
                        "savings_this_month": 0
                    }
                }
            })
    
    def _get_personalized_shopping(self, user):
        return [{"product": "Fresh Tomatoes", "recommended": True, "price": 45.50}]
    
    def _get_quick_order(self, user):
        return {"last_order": "2024-01-10", "favorite_items": 5, "delivery_schedule": "Weekly"}
    
    def _get_delivery_management(self, user):
        return {"next_delivery": "2024-01-12", "delivery_address": "Primary", "tracking_available": True}

class RestaurantBusinessDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "restaurant_business",
                    "welcome_message": f"Welcome, {user.business_name or 'Restaurant'}!",
                    "supply_chain": self._get_supply_chain(user),
                    "inventory": self._get_inventory(user),
                    "menu_planning": self._get_menu_planning(user),
                    "stats": {
                        "active_suppliers": 8,
                        "inventory_value": 12500.00,
                        "weekly_orders": 25,
                        "cost_savings": 1200.50
                    }
                }
            })
        except Exception as e:
            logger.error(f"Restaurant Business Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "restaurant_business",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Restaurant'}!",
                    "supply_chain": {},
                    "inventory": {},
                    "menu_planning": {},
                    "stats": {
                        "active_suppliers": 0,
                        "inventory_value": 0,
                        "weekly_orders": 0,
                        "cost_savings": 0
                    }
                }
            })
    
    def _get_supply_chain(self, user):
        return {"reliable_suppliers": 6, "delivery_performance": 95.5, "quality_score": 92.0}
    
    def _get_inventory(self, user):
        return {"stock_level": "optimal", "low_stock_items": 2, "waste_reduction": 15.0}
    
    def _get_menu_planning(self, user):
        return {"seasonal_items": 12, "customer_favorites": 8, "profit_margin": 35.0}

class ExportClientDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "export_client",
                    "welcome_message": f"Welcome, {user.business_name or 'Export Partner'}!",
                    "global_trade": self._get_global_trade(user),
                    "compliance": self._get_compliance(user),
                    "market_intelligence": self._get_market_intelligence(user),
                    "stats": {
                        "active_contracts": 5,
                        "export_volume": 25000.0,
                        "international_markets": 3,
                        "compliance_score": 98.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Export Client Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "export_client",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Export Partner'}!",
                    "global_trade": {},
                    "compliance": {},
                    "market_intelligence": {},
                    "stats": {
                        "active_contracts": 0,
                        "export_volume": 0,
                        "international_markets": 0,
                        "compliance_score": 0
                    }
                }
            })
    
    def _get_global_trade(self, user):
        return {"destinations": ["EU", "USA", "Middle East"], "shipping_logistics": 4, "trade_finance": "secured"}
    
    def _get_compliance(self, user):
        return {"certifications": ["HACCP", "GlobalGAP"], "documentation": "complete", "audit_status": "compliant"}
    
    def _get_market_intelligence(self, user):
        return {"price_trends": "rising", "demand_forecast": "strong", "competition_analysis": "moderate"}

class InstitutionalBuyerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "institutional_buyer",
                    "welcome_message": f"Welcome, {user.business_name or 'Institutional Buyer'}!",
                    "contract_management": self._get_contract_management(user),
                    "budget_compliance": self._get_budget_compliance(user),
                    "supplier_performance": self._get_supplier_performance(user),
                    "stats": {
                        "active_contracts": 12,
                        "annual_budget": 500000.00,
                        "supplier_count": 15,
                        "savings_ytd": 45000.00
                    }
                }
            })
        except Exception as e:
            logger.error(f"Institutional Buyer Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "institutional_buyer",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Institutional Buyer'}!",
                    "contract_management": {},
                    "budget_compliance": {},
                    "supplier_performance": {},
                    "stats": {
                        "active_contracts": 0,
                        "annual_budget": 0,
                        "supplier_count": 0,
                        "savings_ytd": 0
                    }
                }
            })
    
    def _get_contract_management(self, user):
        return {"active_contracts": 8, "renewals_due": 2, "performance_metrics": 94.0}
    
    def _get_budget_compliance(self, user):
        return {"budget_utilization": 65.5, "cost_savings": 12.3, "forecast_accuracy": 88.7}
    
    def _get_supplier_performance(self, user):
        return {"reliable_suppliers": 10, "quality_score": 91.5, "delivery_accuracy": 96.2}

# Supplier Dashboards
class LogisticsProviderDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "logistics_provider",
                    "welcome_message": f"Welcome, {user.business_name or 'Logistics Partner'}!",
                    "fleet_management": self._get_fleet_management(user),
                    "route_optimization": self._get_route_optimization(user),
                    "delivery_tracking": self._get_delivery_tracking(user),
                    "stats": {
                        "active_vehicles": 8,
                        "on_time_delivery": 96.5,
                        "fuel_efficiency": 8.2,
                        "customer_satisfaction": 94.8
                    }
                }
            })
        except Exception as e:
            logger.error(f"Logistics Provider Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "logistics_provider",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Logistics Partner'}!",
                    "fleet_management": {},
                    "route_optimization": {},
                    "delivery_tracking": {},
                    "stats": {
                        "active_vehicles": 0,
                        "on_time_delivery": 0,
                        "fuel_efficiency": 0,
                        "customer_satisfaction": 0
                    }
                }
            })
    
    def _get_fleet_management(self, user):
        return {"total_vehicles": 12, "maintenance_due": 2, "operational_cost": 12500.0}
    
    def _get_route_optimization(self, user):
        return {"optimized_routes": 15, "fuel_savings": 18.5, "delivery_time_reduction": 22.0}
    
    def _get_delivery_tracking(self, user):
        return {"active_deliveries": 8, "completed_today": 25, "real_time_tracking": True}

class InputSupplierDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "input_supplier",
                    "welcome_message": f"Welcome, {user.business_name or 'Input Supplier'}!",
                    "inventory_sales": self._get_inventory_sales(user),
                    "product_management": self._get_product_management(user),
                    "market_position": self._get_market_position(user),
                    "stats": {
                        "total_products": 45,
                        "monthly_sales": 125000.00,
                        "inventory_turnover": 3.2,
                        "customer_retention": 92.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Input Supplier Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "input_supplier",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Input Supplier'}!",
                    "inventory_sales": {},
                    "product_management": {},
                    "market_position": {},
                    "stats": {
                        "total_products": 0,
                        "monthly_sales": 0,
                        "inventory_turnover": 0,
                        "customer_retention": 0
                    }
                }
            })
    
    def _get_inventory_sales(self, user):
        return {"stock_value": 250000.0, "fast_moving": 12, "slow_moving": 3}
    
    def _get_product_management(self, user):
        return {"categories": 8, "new_products": 5, "seasonal_demand": "high"}
    
    def _get_market_position(self, user):
        return {"market_share": "18%", "competitive_advantage": "quality", "growth_potential": "high"}

class MachineryProviderDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "machinery_provider",
                    "welcome_message": f"Welcome, {user.business_name or 'Machinery Provider'}!",
                    "equipment_fleet": self._get_equipment_fleet(user),
                    "rental_operations": self._get_rental_operations(user),
                    "maintenance": self._get_maintenance(user),
                    "stats": {
                        "total_equipment": 25,
                        "utilization_rate": 78.5,
                        "rental_revenue": 85000.00,
                        "maintenance_cost": 12500.00
                    }
                }
            })
        except Exception as e:
            logger.error(f"Machinery Provider Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "machinery_provider",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Machinery Provider'}!",
                    "equipment_fleet": {},
                    "rental_operations": {},
                    "maintenance": {},
                    "stats": {
                        "total_equipment": 0,
                        "utilization_rate": 0,
                        "rental_revenue": 0,
                        "maintenance_cost": 0
                    }
                }
            })
    
    def _get_equipment_fleet(self, user):
        return {"available": 18, "rented": 12, "under_maintenance": 3}
    
    def _get_rental_operations(self, user):
        return {"active_rentals": 15, "booking_requests": 8, "revenue_trend": "growing"}
    
    def _get_maintenance(self, user):
        return {"scheduled_maintenance": 5, "downtime": 2.5, "maintenance_schedule": "optimized"}

class ServiceProviderDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "service_provider",
                    "welcome_message": f"Welcome, {user.business_name or 'Service Provider'}!",
                    "service_operations": self._get_service_operations(user),
                    "booking_management": self._get_booking_management(user),
                    "workforce": self._get_workforce(user),
                    "stats": {
                        "active_services": 8,
                        "completion_rate": 95.2,
                        "customer_rating": 4.8,
                        "revenue_growth": 22.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Service Provider Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "service_provider",
                    "welcome_message": f"Welcome, {request.user.business_name or 'Service Provider'}!",
                    "service_operations": {},
                    "booking_management": {},
                    "workforce": {},
                    "stats": {
                        "active_services": 0,
                        "completion_rate": 0,
                        "customer_rating": 0,
                        "revenue_growth": 0
                    }
                }
            })
    
    def _get_service_operations(self, user):
        return {"service_categories": 6, "active_bookings": 22, "service_quality": 96.0}
    
    def _get_booking_management(self, user):
        return {"upcoming_bookings": 15, "booking_requests": 8, "schedule_efficiency": 88.5}
    
    def _get_workforce(self, user):
        return {"total_staff": 12, "available_today": 8, "skill_distribution": "balanced"}

# Agent Dashboards
class FinancialAdvisorDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "financial_advisor",
                    "welcome_message": f"Welcome, {user.first_name or 'Financial Advisor'}!",
                    "portfolio_overview": self._get_portfolio_overview(user),
                    "loan_management": self._get_loan_management(user),
                    "risk_assessment": self._get_risk_assessment(user),
                    "stats": {
                        "total_clients": 45,
                        "loan_portfolio": 2500000.00,
                        "recovery_rate": 98.2,
                        "client_satisfaction": 96.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Financial Advisor Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "financial_advisor",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Financial Advisor'}!",
                    "portfolio_overview": {},
                    "loan_management": {},
                    "risk_assessment": {},
                    "stats": {
                        "total_clients": 0,
                        "loan_portfolio": 0,
                        "recovery_rate": 0,
                        "client_satisfaction": 0
                    }
                }
            })
    
    def _get_portfolio_overview(self, user):
        return {"active_loans": 35, "total_value": 1850000.00, "diversification": "good"}
    
    def _get_loan_management(self, user):
        return {"applications_pending": 8, "disbursements_this_month": 12, "npa_rate": 1.2}
    
    def _get_risk_assessment(self, user):
        return {"risk_level": "moderate", "mitigation_strategies": 5, "compliance_status": "excellent"}

class TechnicalAdvisorDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "technical_advisor",
                    "welcome_message": f"Welcome, {user.first_name or 'Technical Advisor'}!",
                    "active_cases": self._get_active_cases(user),
                    "knowledge_base": self._get_knowledge_base(user),
                    "impact_measurement": self._get_impact_measurement(user),
                    "stats": {
                        "active_cases": 18,
                        "resolved_this_month": 25,
                        "farmer_satisfaction": 95.8,
                        "yield_improvement": 22.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Technical Advisor Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "technical_advisor",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Technical Advisor'}!",
                    "active_cases": [],
                    "knowledge_base": {},
                    "impact_measurement": {},
                    "stats": {
                        "active_cases": 0,
                        "resolved_this_month": 0,
                        "farmer_satisfaction": 0,
                        "yield_improvement": 0
                    }
                }
            })
    
    def _get_active_cases(self, user):
        return [{"case": "Soil Analysis", "priority": "high", "assigned_to": "You"}]
    
    def _get_knowledge_base(self, user):
        return {"articles": 45, "training_materials": 12, "best_practices": 28}
    
    def _get_impact_measurement(self, user):
        return {"farmers_impacted": 150, "yield_increase": 25.5, "cost_reduction": 18.7}

class LegalSpecialistDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "legal_specialist",
                    "welcome_message": f"Welcome, {user.first_name or 'Legal Specialist'}!",
                    "legal_cases": self._get_legal_cases(user),
                    "compliance_hub": self._get_compliance_hub(user),
                    "document_management": self._get_document_management(user),
                    "stats": {
                        "active_cases": 12,
                        "contracts_reviewed": 35,
                        "compliance_audits": 8,
                        "success_rate": 92.5
                    }
                }
            })
        except Exception as e:
            logger.error(f"Legal Specialist Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "legal_specialist",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Legal Specialist'}!",
                    "legal_cases": [],
                    "compliance_hub": {},
                    "document_management": {},
                    "stats": {
                        "active_cases": 0,
                        "contracts_reviewed": 0,
                        "compliance_audits": 0,
                        "success_rate": 0
                    }
                }
            })
    
    def _get_legal_cases(self, user):
        return [{"case": "Land Dispute", "status": "active", "priority": "high"}]
    
    def _get_compliance_hub(self, user):
        return {"regulations": 25, "compliance_checklists": 8, "audit_schedules": 3}
    
    def _get_document_management(self, user):
        return {"contracts": 45, "legal_documents": 28, "compliance_records": 15}

class MarketAnalystDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "market_analyst",
                    "welcome_message": f"Welcome, {user.first_name or 'Market Analyst'}!",
                    "market_intelligence": self._get_market_intelligence(user),
                    "price_analysis": self._get_price_analysis(user),
                    "trends": self._get_trends(user),
                    "stats": {
                        "markets_monitored": 8,
                        "reports_generated": 25,
                        "prediction_accuracy": 88.5,
                        "client_satisfaction": 94.2
                    }
                }
            })
        except Exception as e:
            logger.error(f"Market Analyst Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "market_analyst",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Market Analyst'}!",
                    "market_intelligence": {},
                    "price_analysis": {},
                    "trends": {},
                    "stats": {
                        "markets_monitored": 0,
                        "reports_generated": 0,
                        "prediction_accuracy": 0,
                        "client_satisfaction": 0
                    }
                }
            })
    
    def _get_market_intelligence(self, user):
        return {"supply_demand": "balanced", "market_sentiment": "positive", "competition_analysis": "moderate"}
    
    def _get_price_analysis(self, user):
        return {"price_trends": "rising", "volatility": "low", "forecast_accuracy": 85.5}
    
    def _get_trends(self, user):
        return {"emerging_markets": 3, "consumer_preferences": "shifting", "technology_adoption": "increasing"}

# Admin Dashboards
class PlatformAdminDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "platform_admin",
                    "welcome_message": f"Welcome, {user.first_name or 'Platform Admin'}!",
                    "system_health": self._get_system_health(user),
                    "user_management": self._get_user_management(user),
                    "error_tracking": self._get_error_tracking(user),
                    "stats": {
                        "total_users": UserProfile.objects.count(),
                        "active_today": UserProfile.objects.filter(last_activity__date=timezone.now().date()).count(),
                        "system_uptime": 99.95,
                        "response_time": 0.85
                    }
                }
            })
        except Exception as e:
            logger.error(f"Platform Admin Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "platform_admin",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Platform Admin'}!",
                    "system_health": {},
                    "user_management": {},
                    "error_tracking": {},
                    "stats": {
                        "total_users": 0,
                        "active_today": 0,
                        "system_uptime": 0,
                        "response_time": 0
                    }
                }
            })
    
    def _get_system_health(self, user):
        return {"status": "healthy", "performance": "optimal", "alerts": 0}
    
    def _get_user_management(self, user):
        return {"new_registrations": 15, "active_sessions": 85, "support_tickets": 3}
    
    def _get_error_tracking(self, user):
        return {"errors_today": 2, "resolved_issues": 8, "monitoring_active": True}

class BusinessAdminDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "business_admin",
                    "welcome_message": f"Welcome, {user.first_name or 'Business Admin'}!",
                    "business_overview": self._get_business_overview(user),
                    "financial_analytics": self._get_financial_analytics(user),
                    "strategic_planning": self._get_strategic_planning(user),
                    "stats": {
                        "total_revenue": 1250000.00,
                        "growth_rate": 22.5,
                        "customer_acquisition": 150,
                        "profit_margin": 28.3
                    }
                }
            })
        except Exception as e:
            logger.error(f"Business Admin Dashboard error: {str(e)}")
            return Response({
                "success": True,
                "data": {
                    "dashboard_type": "business_admin",
                    "welcome_message": f"Welcome, {request.user.first_name or 'Business Admin'}!",
                    "business_overview": {},
                    "financial_analytics": {},
                    "strategic_planning": {},
                    "stats": {
                        "total_revenue": 0,
                        "growth_rate": 0,
                        "customer_acquisition": 0,
                        "profit_margin": 0
                    }
                }
            })
    
    def _get_business_overview(self, user):
        return {"market_position": "leading", "customer_base": "growing", "operational_efficiency": "high"}
    
    def _get_financial_analytics(self, user):
        return {"revenue_trends": "positive", "cost_optimization": "effective", "investment_roi": "good"}
    
    def _get_strategic_planning(self, user):
        return {"initiatives": 5, "milestones_achieved": 12, "strategic_goals": "on_track"}

# NEW: Sub-role features view
class SubRoleFeaturesView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request, sub_role):
        try:
            features = self._get_sub_role_features(sub_role)
            return Response({
                "success": True,
                "data": {
                    "sub_role": sub_role,
                    "features": features
                }
            })
        except Exception as e:
            logger.error(f"SubRoleFeaturesView error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to load sub-role features"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_sub_role_features(self, sub_role):
        features_map = {
            # Farmer sub-roles
            'SMALLHOLDER_FARMER': ['basic_farming', 'market_access', 'financial_tools', 'weather_alerts'],
            'COMMERCIAL_FARMER': ['enterprise_management', 'supply_chain', 'business_intelligence', 'export_tools'],
            'ORGANIC_SPECIALIST': ['certification_tracking', 'premium_marketplace', 'quality_metrics', 'sustainability'],
            'LIVESTOCK_FARMER': ['livestock_management', 'health_tracking', 'product_processing', 'vet_coordination'],
            # Consumer sub-roles
            'INDIVIDUAL_CONSUMER': ['personalized_shopping', 'quick_order', 'delivery_tracking', 'price_alerts'],
            'RESTAURANT_BUSINESS': ['supply_chain_management', 'inventory_tracking', 'menu_planning', 'bulk_ordering'],
            'EXPORT_CLIENT': ['global_trade', 'compliance_tools', 'market_intelligence', 'logistics_management'],
            'INSTITUTIONAL_BUYER': ['contract_management', 'budget_tracking', 'supplier_performance', 'procurement_tools'],
            # Supplier sub-roles
            'LOGISTICS_PROVIDER': ['fleet_management', 'route_optimization', 'delivery_tracking', 'customer_portal'],
            'INPUT_SUPPLIER': ['inventory_management', 'sales_analytics', 'customer_management', 'product_catalog'],
            'MACHINERY_PROVIDER': ['equipment_tracking', 'rental_management', 'maintenance_scheduling', 'booking_system'],
            'SERVICE_PROVIDER': ['service_management', 'booking_system', 'workforce_tracking', 'customer_portal'],
            # Agent sub-roles
            'FINANCIAL_ADVISOR': ['portfolio_management', 'loan_tracking', 'risk_assessment', 'client_management'],
            'TECHNICAL_ADVISOR': ['case_management', 'knowledge_base', 'impact_tracking', 'farmer_support'],
            'LEGAL_SPECIALIST': ['case_management', 'compliance_tracking', 'document_management', 'legal_resources'],
            'MARKET_ANALYST': ['market_intelligence', 'price_analysis', 'trend_analysis', 'reporting_tools'],
            # Admin sub-roles
            'PLATFORM_ADMIN': ['system_management', 'user_administration', 'monitoring_tools', 'security_management'],
            'BUSINESS_ADMIN': ['business_analytics', 'financial_management', 'strategic_planning', 'performance_tracking']
        }
        
        return features_map.get(sub_role, ['basic_features'])

# ... (Keep all your existing views from the previous file below these new dashboard views)
class UserDirectoryView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            print(f"🔍 UserDirectoryView - Request from: {request.user.email}")
            
            # Get all active users except the current user
            users = UserProfile.objects.filter(
                is_active=True
            ).exclude(
                id=request.user.id
            ).order_by('-created_at')
            
            print(f"📊 Database query found: {users.count()} users")
            
            # Apply filters if provided
            role_filter = request.GET.get('role')
            if role_filter and role_filter != 'all':
                users = users.filter(role=role_filter)
                print(f"🔧 Filtered by role: {role_filter}")
            
            search_term = request.GET.get('search')
            if search_term:
                users = users.filter(
                    Q(business_name__icontains=search_term) |
                    Q(first_name__icontains=search_term) |
                    Q(last_name__icontains=search_term) |
                    Q(role__icontains=search_term) |
                    Q(sub_role__icontains=search_term) |
                    Q(location__icontains=search_term) |
                    Q(business_description__icontains=search_term)
                )
                print(f"🔍 Filtered by search: '{search_term}'")
            
            # Serialize the data
            serializer = UserProfileSerializer(users, many=True)
            
            print(f"✅ Serialized {len(serializer.data)} users")
            
            # Return successful response
            return Response({
                "success": True,
                "data": serializer.data,
                "total_count": users.count(),
                "message": f"Found {users.count()} users",
                "debug_info": {
                    "current_user": request.user.email,
                    "users_found": users.count(),
                    "filters_applied": {
                        "role": role_filter,
                        "search": search_term
                    }
                }
            })
            
        except Exception as e:
            logger.error(f"UserDirectoryView error: {str(e)}", exc_info=True)
            return Response({
                "success": False,
                "error": "Failed to fetch user directory",
                "message": str(e),
                "data": [],
                "debug_info": {
                    "current_user": request.user.email if request.user else "Unknown",
                    "error_details": str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Agro-Gram API',
            'timestamp': timezone.now().isoformat()
        })

class ProtectedExampleView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        user_profile = request.user
        return Response({
            "message": "Success! You are authenticated.",
            "user_info": {
                "email": user_profile.email,
                "role": user_profile.role,
                "firebase_uid": user_profile.firebase_uid,
                "django_user_id": user_profile.id,
                "full_name": user_profile.get_full_name(),
                "is_verified": user_profile.is_verified
            }
        })

# users/views.py - Update UserRegistrationView
class UserRegistrationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            firebase_uid = request.data.get('firebase_uid')
            role = request.data.get('role', 'FARMER')
            sub_role = request.data.get('sub_role')  # Remove default value
            
            if not email or not firebase_uid:
                return Response({
                    "success": False,
                    "error": "Email and firebase_uid are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate sub_role based on role
            valid_sub_roles = {
                'FARMER': ['SMALLHOLDER_FARMER', 'COMMERCIAL_FARMER', 'ORGANIC_SPECIALIST', 'LIVESTOCK_FARMER'],
                'CONSUMER': ['INDIVIDUAL_CONSUMER', 'RESTAURANT_BUSINESS', 'EXPORT_CLIENT', 'INSTITUTIONAL_BUYER'],
                'SUPPLIER': ['LOGISTICS_PROVIDER', 'INPUT_SUPPLIER', 'MACHINERY_PROVIDER', 'SERVICE_PROVIDER'],
                'AGENT': ['FINANCIAL_ADVISOR', 'TECHNICAL_ADVISOR', 'LEGAL_SPECIALIST', 'MARKET_ANALYST'],
                'ADMIN': ['PLATFORM_ADMIN', 'BUSINESS_ADMIN']
            }
            
            # Set default sub_role if not provided or invalid
            if not sub_role or sub_role not in valid_sub_roles.get(role, []):
                default_sub_roles = {
                    'FARMER': 'SMALLHOLDER_FARMER',
                    'CONSUMER': 'INDIVIDUAL_CONSUMER', 
                    'SUPPLIER': 'INPUT_SUPPLIER',
                    'AGENT': 'FINANCIAL_ADVISOR',
                    'ADMIN': 'PLATFORM_ADMIN'
                }
                sub_role = default_sub_roles.get(role, 'SMALLHOLDER_FARMER')
                print(f"Using default sub_role {sub_role} for role {role}")
            
            if UserProfile.objects.filter(email=email).exists():
                return Response({
                    "success": False,
                    "error": "User already exists"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserProfile.objects.create_user(
                email=email,
                firebase_uid=firebase_uid,
                role=role,
                sub_role=sub_role,  # Use the determined sub_role
                first_name=request.data.get('first_name', ''),
                last_name=request.data.get('last_name', '')
            )
            
            UserActivityLog.objects.create(
                user=user,
                activity_type='PROFILE_UPDATE',
                description=f'User registered successfully with sub-role: {sub_role}'
            )
            
            return Response({
                "success": True,
                "message": "User registered successfully",
                "data": UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                "success": False,
                "error": "Registration failed",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
# Add these dashboard views to your users/views.py file

class FarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            # Farm-specific stats
            farms = user.farms.all()
            total_farms = farms.count()
            total_plots = sum(farm.plots.count() for farm in farms)
            active_crops = sum(farm.plots.filter(crop_status__in=['PLANTED', 'GROWING', 'READY']).count() for farm in farms)
            pending_tasks = sum(farm.tasks.filter(status='PENDING').count() for farm in farms)
            
            # Marketplace stats for farmers
            my_products = user.products.all()
            total_products = my_products.count()
            active_products = my_products.filter(status='AVAILABLE').count()
            total_orders = user.orders.count()
            total_revenue = user.orders.filter(status__in=['CONFIRMED', 'DELIVERED']).aggregate(total=Sum('total_price'))['total'] or 0
            
            stats = {
                'total_farms': total_farms,
                'total_plots': total_plots,
                'active_crops': active_crops,
                'pending_tasks': pending_tasks,
                'total_products': total_products,
                'active_products': active_products,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'profile_completion': self._calculate_profile_completion(user),
                'role': 'farmer'
            }
            
            return Response({
                "success": True,
                "data": stats
            })
            
        except Exception as e:
            logger.error(f"Farmer dashboard error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to load farmer dashboard"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_profile_completion(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        return (completed_fields / len(required_fields)) * 100

class ConsumerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            # Consumer-specific stats
            cart_items = user.cart.items.count() if hasattr(user, 'cart') else 0
            cart_total = user.cart.subtotal if hasattr(user, 'cart') else 0
            
            total_orders = user.orders.count()
            completed_orders = user.orders.filter(status='DELIVERED').count()
            pending_orders = user.orders.filter(status__in=['PENDING', 'CONFIRMED']).count()
            
            stats = {
                'cart_items': cart_items,
                'cart_total': float(cart_total),
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'pending_orders': pending_orders,
                'profile_completion': self._calculate_profile_completion(user),
                'role': 'consumer'
            }
            
            return Response({
                "success": True,
                "data": stats
            })
            
        except Exception as e:
            logger.error(f"Consumer dashboard error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to load consumer dashboard"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_profile_completion(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        return (completed_fields / len(required_fields)) * 100

class SupplierDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            # Supplier-specific stats
            my_products = user.products.all()
            total_products = my_products.count()
            active_products = my_products.filter(status='AVAILABLE').count()
            sold_products = my_products.filter(status='SOLD').count()
            
            total_orders = user.orders.count()
            completed_orders = user.orders.filter(status='DELIVERED').count()
            total_revenue = user.orders.filter(status__in=['CONFIRMED', 'DELIVERED']).aggregate(total=Sum('total_price'))['total'] or 0
            
            stats = {
                'total_products': total_products,
                'active_products': active_products,
                'sold_products': sold_products,
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'total_revenue': float(total_revenue),
                'profile_completion': self._calculate_profile_completion(user),
                'role': 'supplier'
            }
            
            return Response({
                "success": True,
                "data": stats
            })
            
        except Exception as e:
            logger.error(f"Supplier dashboard error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to load supplier dashboard"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_profile_completion(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location', 'business_name']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        return (completed_fields / len(required_fields)) * 100

# users/views.py - Add this debug view
class DebugAuthView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        """Debug view to check authentication"""
        print("=== AUTH DEBUG ===")
        print("Request user:", request.user)
        print("User email:", getattr(request.user, 'email', 'No email'))
        print("User authenticated:", request.user.is_authenticated)
        print("User firebase_uid:", getattr(request.user, 'firebase_uid', 'No UID'))
        print("Auth header:", request.META.get('HTTP_AUTHORIZATION'))
        print("=== END DEBUG ===")
        
        return Response({
            "success": True,
            "debug_info": {
                "user_email": getattr(request.user, 'email', 'No email'),
                "user_authenticated": request.user.is_authenticated,
                "user_firebase_uid": getattr(request.user, 'firebase_uid', 'No UID'),
                "user_role": getattr(request.user, 'role', 'No role'),
                "user_sub_role": getattr(request.user, 'sub_role', 'No sub_role')
            }
        })
# Role-specific stats views
class FarmerStatsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        stats = UserProfileViewSet()._get_farmer_stats(user)
        return Response({"success": True, "data": stats})

class ConsumerStatsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        stats = UserProfileViewSet()._get_consumer_stats(user)
        return Response({"success": True, "data": stats})

class SupplierStatsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        stats = UserProfileViewSet()._get_supplier_stats(user)
        return Response({"success": True, "data": stats})
# Add these marketplace views to your users/views.py file

class ConsumerMarketplaceView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            # Consumer marketplace data
            marketplace_data = {
                "featured_products": self._get_featured_products(),
                "recent_orders": self._get_recent_orders(user),
                "shopping_cart": self._get_cart_summary(user),
                "recommendations": self._get_recommendations(user),
                "marketplace_stats": {
                    "total_products": 0,  # You'll need to implement these
                    "active_sellers": 0,
                    "new_arrivals": 0
                }
            }
            
            return Response({
                "success": True,
                "data": marketplace_data
            })
            
        except Exception as e:
            logger.error(f"Consumer marketplace error: {str(e)}")
            return Response({
                "success": True,  # Still return success but with empty data
                "data": {
                    "featured_products": [],
                    "recent_orders": [],
                    "shopping_cart": {"items_count": 0, "subtotal": 0},
                    "recommendations": [],
                    "marketplace_stats": {"total_products": 0, "active_sellers": 0, "new_arrivals": 0}
                }
            })
    
    def _get_featured_products(self):
        # Implement featured products logic
        return []
    
    def _get_recent_orders(self, user):
        # Implement recent orders logic
        return []
    
    def _get_cart_summary(self, user):
        # Implement cart summary logic
        return {"items_count": 0, "subtotal": 0}
    
    def _get_recommendations(self, user):
        # Implement recommendations logic
        return []

class SupplierMarketplaceView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            # Supplier marketplace data
            marketplace_data = {
                "my_products": self._get_my_products(user),
                "order_analytics": self._get_order_analytics(user),
                "revenue_stats": self._get_revenue_stats(user),
                "inventory_summary": self._get_inventory_summary(user),
                "marketplace_insights": {
                    "total_customers": 0,
                    "average_rating": 0,
                    "response_rate": 0
                }
            }
            
            return Response({
                "success": True,
                "data": marketplace_data
            })
            
        except Exception as e:
            logger.error(f"Supplier marketplace error: {str(e)}")
            return Response({
                "success": True,  # Still return success but with empty data
                "data": {
                    "my_products": [],
                    "order_analytics": {"total_orders": 0, "pending_orders": 0, "completed_orders": 0},
                    "revenue_stats": {"total_revenue": 0, "monthly_revenue": 0, "growth_rate": 0},
                    "inventory_summary": {"total_products": 0, "low_stock": 0, "out_of_stock": 0},
                    "marketplace_insights": {"total_customers": 0, "average_rating": 0, "response_rate": 0}
                }
            })
    
    def _get_my_products(self, user):
        # Implement my products logic
        return []
    
    def _get_order_analytics(self, user):
        # Implement order analytics logic
        return {"total_orders": 0, "pending_orders": 0, "completed_orders": 0}
    
    def _get_revenue_stats(self, user):
        # Implement revenue stats logic
        return {"total_revenue": 0, "monthly_revenue": 0, "growth_rate": 0}
    
    def _get_inventory_summary(self, user):
        # Implement inventory summary logic
        return {"total_products": 0, "low_stock": 0, "out_of_stock": 0}
     # Add this product view to your users/views.py file
# Add this cart view to your users/views.py file

class ConsumerCartView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            
            # Mock cart data - replace with actual cart logic
            cart_data = {
                "items": [],
                "summary": {
                    "subtotal": 0,
                    "shipping": 0,
                    "tax": 0,
                    "total": 0,
                    "items_count": 0
                },
                "shipping_options": [],
                "available_coupons": []
            }
            
            return Response({
                "success": True,
                "data": cart_data
            })
            
        except Exception as e:
            logger.error(f"Cart fetch error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to fetch cart data"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            # Add item to cart logic would go here
            return Response({
                "success": True,
                "message": "Item added to cart",
                "data": {}
            })
            
        except Exception as e:
            logger.error(f"Cart update error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to update cart"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ProductListingCreateView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def post(self, request):
        try:
            user = request.user
            
            # Check if user has permission to create products
            if user.role not in ['FARMER', 'SUPPLIER']:
                return Response({
                    "success": False,
                    "error": "Only farmers and suppliers can create products"
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Basic product data validation
            required_fields = ['title', 'price', 'category']
            for field in required_fields:
                if field not in request.data:
                    return Response({
                        "success": False,
                        "error": f"Missing required field: {field}"
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create product data
            product_data = {
                'title': request.data.get('title'),
                'description': request.data.get('description', ''),
                'price': request.data.get('price'),
                'category': request.data.get('category'),
                'quantity': request.data.get('quantity', 1),
                'unit': request.data.get('unit', 'kg'),
                'images': request.data.get('images', []),
                'tags': request.data.get('tags', []),
                'is_available': request.data.get('is_available', True)
            }
            
            # You would typically save to your Product model here
            # For now, return success with the created data
            product_data['id'] = 1  # Mock ID
            product_data['farmer'] = user.id
            product_data['created_at'] = timezone.now().isoformat()
            product_data['status'] = 'AVAILABLE'
            
            return Response({
                "success": True,
                "message": "Product created successfully",
                "data": product_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Product creation error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to create product",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  
class UserLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            firebase_uid = request.data.get('firebase_uid')
            
            if not email or not firebase_uid:
                return Response({
                    "success": False,
                    "error": "Email and firebase_uid are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = UserProfile.objects.get(email=email, firebase_uid=firebase_uid)
            except UserProfile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Invalid credentials"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            user.update_activity()
            
            UserActivityLog.objects.create(
                user=user,
                activity_type='LOGIN',
                description='User logged in successfully'
            )
            
            return Response({
                "success": True,
                "message": "Login successful",
                "data": UserProfileSerializer(user).data
            })
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                "success": False,
                "error": "Login failed",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    authentication_classes = get_authentication_classes()
    permission_classes = [AllowAnyAuthenticated]
    
    def get_queryset(self):
        # FIXED: Added proper user validation
        if not hasattr(self.request.user, 'role') or not isinstance(self.request.user, UserProfile):
            return UserProfile.objects.none()
            
        if self.request.user.role == 'ADMIN':
            return UserProfile.objects.all()
        return UserProfile.objects.filter(id=self.request.user.id)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserProfileCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer
    
    def create(self, request, *args, **kwargs):
        # FIXED: Validate user instance before proceeding
        if not isinstance(request.user, UserProfile):
            return Response(
                {"success": False, "error": "Invalid user authentication"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        if UserProfile.objects.filter(firebase_uid=request.user.firebase_uid).exists():
            return Response(
                {"success": False, "error": "User profile already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_profile = serializer.save()
        
        UserActivityLog.objects.create(
            user=user_profile,
            activity_type='PROFILE_UPDATE',
            description='User profile created manually',
            metadata={'created_manually': True}
        )
        
        return Response(
            {"success": True, "data": UserProfileSerializer(user_profile).data}, 
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        # FIXED: Validate user instance
        if not isinstance(request.user, UserProfile):
            return Response(
                {"success": False, "error": "Invalid user authentication"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = self.get_serializer(request.user)
        return Response({"success": True, "data": serializer.data})
    
    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        # FIXED: Validate user instance
        if not isinstance(request.user, UserProfile):
            return Response(
                {"success": False, "error": "Invalid user authentication"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "data": serializer.data})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        # FIXED: Validate user instance
        if not isinstance(request.user, UserProfile):
            return Response(
                {"success": False, "error": "Invalid user authentication"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        user = request.user
        
        if user.role == 'FARMER':
            stats = self._get_farmer_stats(user)
        elif user.role == 'CONSUMER':
            stats = self._get_consumer_stats(user)
        elif user.role == 'SUPPLIER':
            stats = self._get_supplier_stats(user)
        else:
            stats = self._get_general_stats(user)
        
        serializer = UserStatsSerializer(stats)
        return Response({"success": True, "data": serializer.data})
    
    @action(detail=False, methods=['get'])
    def activities(self, request):
        # FIXED: Validate user instance
        if not isinstance(request.user, UserProfile):
            return Response(
                {"success": False, "error": "Invalid user authentication"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        activities = UserActivityLog.objects.filter(user=request.user).order_by('-created_at')[:50]
        serializer = UserActivityLogSerializer(activities, many=True)
        return Response({
            "success": True,
            "data": {
                "activities": serializer.data,
                "total_count": activities.count()
            }
        })
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        # FIXED: Validate user instance
        if not isinstance(request.user, UserProfile):
            return Response(
                {"success": False, "error": "Invalid user authentication"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        user = request.user
        
        if user.role != 'ADMIN' and user.role != 'AGENT':
            return Response(
                {"success": False, "error": "Only admins and agents can verify users"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        try:
            user_to_verify = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Response(
                {"success": False, "error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_to_verify.is_verified = True
        user_to_verify.verification_date = timezone.now()
        user_to_verify.save()
        
        Notification.objects.create(
            user=user_to_verify,
            notification_type='SYSTEM',
            title='Account Verified',
            message='Your account has been successfully verified!'
        )
        
        return Response({
            "success": True,
            "message": f"User {user_to_verify.email} has been verified",
            "data": {
                "verified_at": user_to_verify.verification_date
            }
        })
    
    def _get_farmer_stats(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, None))
        profile_completion = (completed_fields / len(required_fields)) * 100 if required_fields else 0
        
        # Get actual farm data
        total_farms = user.farms.count()
        total_plots = sum(farm.plots.count() for farm in user.farms.all())
        active_crops = sum(farm.plots.filter(crop_status__in=['PLANTED', 'GROWING', 'READY']).count() for farm in user.farms.all())
        pending_tasks = sum(farm.tasks.filter(status='PENDING').count() for farm in user.farms.all())
        
        return {
            'total_farms': total_farms,
            'total_plots': total_plots,
            'total_orders': getattr(user, 'total_orders', 0),
            'total_revenue': getattr(user, 'total_revenue', 0),
            'active_crops': active_crops,
            'pending_tasks': pending_tasks,
            'profile_completion': profile_completion,
            'last_activity': getattr(user, 'last_activity', None)
        }
    
    def _get_consumer_stats(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, None))
        profile_completion = (completed_fields / len(required_fields)) * 100 if required_fields else 0
        
        return {
            'total_farms': 0,
            'total_plots': 0,
            'total_orders': getattr(user, 'total_orders', 0),
            'total_revenue': getattr(user, 'total_revenue', 0),
            'active_crops': 0,
            'pending_tasks': 0,
            'profile_completion': profile_completion,
            'last_activity': getattr(user, 'last_activity', None)
        }
    
    def _get_supplier_stats(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location', 'business_name']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, None))
        profile_completion = (completed_fields / len(required_fields)) * 100 if required_fields else 0
        
        return {
            'total_farms': 0,
            'total_plots': 0,
            'total_orders': getattr(user, 'total_orders', 0),
            'total_revenue': getattr(user, 'total_revenue', 0),
            'active_crops': 0,
            'pending_tasks': 0,
            'profile_completion': profile_completion,
            'last_activity': getattr(user, 'last_activity', None)
        }
    
    def _get_general_stats(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, None))
        profile_completion = (completed_fields / len(required_fields)) * 100 if required_fields else 0
        
        return {
            'total_farms': 0,
            'total_plots': 0,
            'total_orders': getattr(user, 'total_orders', 0),
            'total_revenue': getattr(user, 'total_revenue', 0),
            'active_crops': 0,
            'pending_tasks': 0,
            'profile_completion': profile_completion,
            'last_activity': getattr(user, 'last_activity', None)
        }

class NotificationViewSet(viewsets.ModelViewSet):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        # FIXED: Validate user instance
        if not isinstance(self.request.user, UserProfile):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response({
            "success": True,
            "data": {
                "notifications": serializer.data,
                "unread_count": notifications.count()
            }
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            "success": True,
            "message": f"Marked {updated} notifications as read"
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response({
            "success": True,
            "message": "Notification marked as read",
            "data": serializer.data
        })
    
# =============================================================================
# TEMPORARY COMPATIBILITY VIEWS - REMOVE AFTER MIGRATION IS COMPLETE
# =============================================================================

# Farmer Legacy Views
class LegacySmallholderFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        # Redirect to new endpoint
        from dashboard_farmer.views.smallholder import SmallholderFarmerDashboardView
        return SmallholderFarmerDashboardView().get(request)

class LegacyCommercialFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_farmer.views.commercial import CommercialFarmerDashboardView
        return CommercialFarmerDashboardView().get(request)

class LegacyOrganicSpecialistDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_farmer.views.organic import OrganicSpecialistDashboardView
        return OrganicSpecialistDashboardView().get(request)

class LegacyLivestockFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_farmer.views.livestock import LivestockFarmerDashboardView
        return LivestockFarmerDashboardView().get(request)

# Consumer Legacy Views
class LegacyIndividualConsumerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_consumer.views.individual import IndividualConsumerDashboardView
        return IndividualConsumerDashboardView().get(request)

class LegacyRestaurantBusinessDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_consumer.views.restaurant import RestaurantBusinessDashboardView
        return RestaurantBusinessDashboardView().get(request)

class LegacyExportClientDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_consumer.views.export import ExportClientDashboardView
        return ExportClientDashboardView().get(request)

class LegacyInstitutionalBuyerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_consumer.views.institutional import InstitutionalBuyerDashboardView
        return InstitutionalBuyerDashboardView().get(request)

# Supplier Legacy Views
class LegacyLogisticsProviderDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_supplier.views.logistics import LogisticsProviderDashboardView
        return LogisticsProviderDashboardView().get(request)

class LegacyInputSupplierDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_supplier.views.input import InputSupplierDashboardView
        return InputSupplierDashboardView().get(request)

class LegacyMachineryProviderDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_supplier.views.machinery import MachineryProviderDashboardView
        return MachineryProviderDashboardView().get(request)

class LegacyServiceProviderDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_supplier.views.service import ServiceProviderDashboardView
        return ServiceProviderDashboardView().get(request)

# Agent Legacy Views
class LegacyFinancialAdvisorDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_agent.views.financial.dashboard import FinancialAdvisorDashboardView
        return FinancialAdvisorDashboardView().get(request)

class LegacyFinancialAdvisorLoanApplicationsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request, pk=None):
        from dashboard_agent.views.financial.loans import FinancialAdvisorLoanApplicationsView
        return FinancialAdvisorLoanApplicationsView().get(request, pk)

class LegacyTechnicalAdvisorDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_agent.views.technical.dashboard import TechnicalAdvisorDashboardView
        return TechnicalAdvisorDashboardView().get(request)

class LegacyLegalSpecialistDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_agent.views.legal.dashboard import LegalSpecialistDashboardView
        return LegalSpecialistDashboardView().get(request)

class LegacyMarketAnalystDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_agent.views.market.dashboard import MarketAnalystDashboardView
        return MarketAnalystDashboardView().get(request)

# Admin Legacy Views
class LegacyPlatformAdminDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_admin.views.platform import PlatformAdminDashboardView
        return PlatformAdminDashboardView().get(request)

class LegacyBusinessAdminDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        from dashboard_admin.views.business import BusinessAdminDashboardView
        return BusinessAdminDashboardView().get(request)

# Role-based Dashboard Legacy Views
class LegacyFarmerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        # Route to appropriate farmer sub-role dashboard
        user = request.user
        sub_role = getattr(user, 'sub_role', '').upper()
        
        if sub_role == 'COMMERCIAL_FARMER':
            from dashboard_farmer.views.commercial import CommercialFarmerDashboardView
            return CommercialFarmerDashboardView().get(request)
        elif sub_role == 'ORGANIC_SPECIALIST':
            from dashboard_farmer.views.organic import OrganicSpecialistDashboardView
            return OrganicSpecialistDashboardView().get(request)
        elif sub_role == 'LIVESTOCK_FARMER':
            from dashboard_farmer.views.livestock import LivestockFarmerDashboardView
            return LivestockFarmerDashboardView().get(request)
        else:
            # Default to smallholder
            from dashboard_farmer.views.smallholder import SmallholderFarmerDashboardView
            return SmallholderFarmerDashboardView().get(request)

class LegacyConsumerDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        sub_role = getattr(user, 'sub_role', '').upper()
        
        if sub_role == 'RESTAURANT_BUSINESS':
            from dashboard_consumer.views.restaurant import RestaurantBusinessDashboardView
            return RestaurantBusinessDashboardView().get(request)
        elif sub_role == 'EXPORT_CLIENT':
            from dashboard_consumer.views.export import ExportClientDashboardView
            return ExportClientDashboardView().get(request)
        elif sub_role == 'INSTITUTIONAL_BUYER':
            from dashboard_consumer.views.institutional import InstitutionalBuyerDashboardView
            return InstitutionalBuyerDashboardView().get(request)
        else:
            # Default to individual consumer
            from dashboard_consumer.views.individual import IndividualConsumerDashboardView
            return IndividualConsumerDashboardView().get(request)

class LegacySupplierDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        sub_role = getattr(user, 'sub_role', '').upper()
        
        if sub_role == 'LOGISTICS_PROVIDER':
            from dashboard_supplier.views.logistics import LogisticsProviderDashboardView
            return LogisticsProviderDashboardView().get(request)
        elif sub_role == 'MACHINERY_PROVIDER':
            from dashboard_supplier.views.machinery import MachineryProviderDashboardView
            return MachineryProviderDashboardView().get(request)
        elif sub_role == 'SERVICE_PROVIDER':
            from dashboard_supplier.views.service import ServiceProviderDashboardView
            return ServiceProviderDashboardView().get(request)
        else:
            # Default to input supplier
            from dashboard_supplier.views.input import InputSupplierDashboardView
            return InputSupplierDashboardView().get(request)

class LegacyAgentDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        sub_role = getattr(user, 'sub_role', '').upper()
        
        if sub_role == 'TECHNICAL_ADVISOR':
            from dashboard_agent.views.technical.dashboard import TechnicalAdvisorDashboardView
            return TechnicalAdvisorDashboardView().get(request)
        elif sub_role == 'LEGAL_SPECIALIST':
            from dashboard_agent.views.legal.dashboard import LegalSpecialistDashboardView
            return LegalSpecialistDashboardView().get(request)
        elif sub_role == 'MARKET_ANALYST':
            from dashboard_agent.views.market.dashboard import MarketAnalystDashboardView
            return MarketAnalystDashboardView().get(request)
        else:
            # Default to financial advisor
            from dashboard_agent.views.financial.dashboard import FinancialAdvisorDashboardView
            return FinancialAdvisorDashboardView().get(request)

class LegacyAdminDashboardView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        user = request.user
        sub_role = getattr(user, 'sub_role', '').upper()
        
        if sub_role == 'BUSINESS_ADMIN':
            from dashboard_admin.views.business import BusinessAdminDashboardView
            return BusinessAdminDashboardView().get(request)
        else:
            # Default to platform admin
            from dashboard_admin.views.platform import PlatformAdminDashboardView
            return PlatformAdminDashboardView().get(request)

# Sub-role features legacy view
class LegacySubRoleFeaturesView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request, sub_role):
        # This can remain in users app or be moved - keeping legacy for now
        try:
            features = self._get_sub_role_features(sub_role)
            return Response({
                "success": True,
                "data": {
                    "sub_role": sub_role,
                    "features": features
                }
            })
        except Exception as e:
            logger.error(f"SubRoleFeaturesView error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to load sub-role features"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_sub_role_features(self, sub_role):
        features_map = {
            # Farmer sub-roles
            'SMALLHOLDER_FARMER': ['basic_farming', 'market_access', 'financial_tools', 'weather_alerts'],
            'COMMERCIAL_FARMER': ['enterprise_management', 'supply_chain', 'business_intelligence', 'export_tools'],
            'ORGANIC_SPECIALIST': ['certification_tracking', 'premium_marketplace', 'quality_metrics', 'sustainability'],
            'LIVESTOCK_FARMER': ['livestock_management', 'health_tracking', 'product_processing', 'vet_coordination'],
            # Consumer sub-roles
            'INDIVIDUAL_CONSUMER': ['personalized_shopping', 'quick_order', 'delivery_tracking', 'price_alerts'],
            'RESTAURANT_BUSINESS': ['supply_chain_management', 'inventory_tracking', 'menu_planning', 'bulk_ordering'],
            'EXPORT_CLIENT': ['global_trade', 'compliance_tools', 'market_intelligence', 'logistics_management'],
            'INSTITUTIONAL_BUYER': ['contract_management', 'budget_tracking', 'supplier_performance', 'procurement_tools'],
            # Supplier sub-roles
            'LOGISTICS_PROVIDER': ['fleet_management', 'route_optimization', 'delivery_tracking', 'customer_portal'],
            'INPUT_SUPPLIER': ['inventory_management', 'sales_analytics', 'customer_management', 'product_catalog'],
            'MACHINERY_PROVIDER': ['equipment_tracking', 'rental_management', 'maintenance_scheduling', 'booking_system'],
            'SERVICE_PROVIDER': ['service_management', 'booking_system', 'workforce_tracking', 'customer_portal'],
            # Agent sub-roles
            'FINANCIAL_ADVISOR': ['portfolio_management', 'loan_tracking', 'risk_assessment', 'client_management'],
            'TECHNICAL_ADVISOR': ['case_management', 'knowledge_base', 'impact_tracking', 'farmer_support'],
            'LEGAL_SPECIALIST': ['case_management', 'compliance_tracking', 'document_management', 'legal_resources'],
            'MARKET_ANALYST': ['market_intelligence', 'price_analysis', 'trend_analysis', 'reporting_tools'],
            # Admin sub-roles
            'PLATFORM_ADMIN': ['system_management', 'user_administration', 'monitoring_tools', 'security_management'],
            'BUSINESS_ADMIN': ['business_analytics', 'financial_management', 'strategic_planning', 'performance_tracking']
        }
        
        return features_map.get(sub_role, ['basic_features'])
    
class FinancialAdvisorLoanApplicationsView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def get(self, request):
        try:
            user = request.user
            if user.sub_role != 'FINANCIAL_ADVISOR':
                return Response({
                    "success": False,
                    "error": "Access denied. Financial Advisor role required."
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Mock data - replace with actual database queries
            loan_applications = [
                {
                    "id": 1,
                    "applicant_name": "John Farmer",
                    "amount": 50000,
                    "status": "pending",
                    "applied_date": "2024-01-15",
                    "business_type": "Crop Farming"
                }
            ]
            
            return Response({
                "success": True,
                "data": loan_applications,
                "total_count": len(loan_applications)
            })
            
        except Exception as e:
            logger.error(f"Loan applications error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to fetch loan applications"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            # Create new loan application logic
            return Response({
                "success": True,
                "message": "Loan application created successfully",
                "data": request.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Loan application creation error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to create loan application"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserAdminViewSet(viewsets.ModelViewSet):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAdminUser]
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_users = UserProfile.objects.count()
        new_users_today = UserProfile.objects.filter(
            created_at__date=timezone.now().date()
        ).count()
        active_users = UserProfile.objects.filter(
            last_activity__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        role_distribution = UserProfile.objects.values('role').annotate(
            count=Count('id')
        ).order_by('-count')
        
        verification_stats = {
            'verified': UserProfile.objects.filter(is_verified=True).count(),
            'unverified': UserProfile.objects.filter(is_verified=False).count(),
        }
        
        return Response({
            "success": True,
            "data": {
                "total_users": total_users,
                "new_users_today": new_users_today,
                "active_users": active_users,
                "role_distribution": list(role_distribution),
                "verification_stats": verification_stats
            }
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        
        UserActivityLog.objects.create(
            user=user,
            activity_type='SECURITY',
            description='Account deactivated by admin',
            metadata={'deactivated_by': request.user.email}
        )
        
        return Response({
            "success": True,
            "message": f"User {user.email} has been deactivated"
        })
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        
        return Response({
            "success": True,
            "message": f"User {user.email} has been activated"
        })

class PublicUserView(APIView):
    authentication_classes = [FirebaseOptionalAuthentication]
    permission_classes = [AllowAny]
    
    def get(self, request, user_id):
        try:
            user = UserProfile.objects.get(id=user_id, is_active=True)
            
            public_data = {
                'id': user.id,
                'business_name': user.business_name,
                'location': user.location,
                'farm_size': user.farm_size,
                'farm_types': user.farm_types,
                'is_verified': user.is_verified,
                'total_orders': user.total_orders,
                'created_at': user.created_at
            }
            
            return Response({
                "success": True,
                "data": public_data
            })
            
        except UserProfile.DoesNotExist:
            return Response(
                {"success": False, "error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class UserLogoutView(APIView):
    authentication_classes = get_authentication_classes()
    permission_classes = [IsAuthenticatedCustom]
    
    def post(self, request):
        try:
            # FIXED: Validate user instance before logging activity
            if isinstance(request.user, UserProfile):
                UserActivityLog.objects.create(
                    user=request.user,
                    activity_type='LOGOUT',
                    description='User logged out successfully'
                )
            
            return Response({
                "success": True,
                "message": "Logout successful"
            })
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                "success": False,
                "error": "Logout failed",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# FIXED: Function-based API views with comprehensive authentication and error handling
@custom_auth_required
def user_profile_api(request):
    """
    GET /api/v1/users/profile/ and PUT /api/v1/users/profile/
    Simple profile API that matches React frontend expectations
    """
    if request.method == 'GET':
        try:
            serializer = UserProfileSerializer(request.user)
            return Response({
                "success": True,
                "data": serializer.data
            })
        except Exception as e:
            logger.error(f"Profile fetch error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to fetch profile",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'PUT':
        try:
            serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Log the activity
                UserActivityLog.objects.create(
                    user=request.user,
                    activity_type='PROFILE_UPDATE',
                    description='User updated profile via API',
                    ip_address=get_client_ip(request)
                )
                
                return Response({
                    "success": True,
                    "data": UserProfileSerializer(request.user).data
                })
            
            # FIXED: Return validation errors properly
            return Response({
                "success": False,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to update profile",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@custom_auth_required
def user_activities_api(request):
    """
    GET /api/v1/users/activities/
    """
    try:
        activities = UserActivityLog.objects.filter(user=request.user).order_by('-created_at')[:50]
        serializer = UserActivityLogSerializer(activities, many=True)
        
        return Response({
            "success": True,
            "data": {
                "activities": serializer.data
            }
        })
    except Exception as e:
        logger.error(f"Activities fetch error: {str(e)}")
        return Response({
            "success": False,
            "error": "Failed to fetch activities",
            "data": {"activities": []}
        })

@custom_auth_required
def user_stats_api(request):
    """
    GET /api/v1/users/stats/
    """
    try:
        user = request.user
        
        # Calculate profile completion
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        profile_completion = (completed_fields / len(required_fields)) * 100 if required_fields else 0
        
        # Get actual farm data for farmers
        total_farms = user.farms.count()
        total_plots = sum(farm.plots.count() for farm in user.farms.all())
        active_crops = sum(farm.plots.filter(crop_status__in=['PLANTED', 'GROWING', 'READY']).count() for farm in user.farms.all())
        pending_tasks = sum(farm.tasks.filter(status='PENDING').count() for farm in user.farms.all())
        
        # Create stats response matching frontend expectations
        stats_data = {
            'total_farms': total_farms,
            'total_plots': total_plots,
            'active_crops': active_crops,
            'pending_tasks': pending_tasks,
            'total_orders': getattr(user, 'total_orders', 0),
            'total_revenue': float(getattr(user, 'total_revenue', 0)),
            'profile_completion': profile_completion,
            'productivity_level': 'MEDIUM',
            'success_rate': 0.0,
            'efficiency_score': 0.0
        }
        
        return Response({
            "success": True,
            "data": stats_data
        })
    except Exception as e:
        logger.error(f"Stats fetch error: {str(e)}")
        return Response({
            "success": False,
            "error": "Failed to fetch stats",
            "data": get_default_stats()
        })

@custom_auth_required
def user_preferences_api(request):
    """
    GET /api/v1/users/preferences/ and PUT /api/v1/users/preferences/
    """
    user = request.user
    
    if request.method == 'GET':
        try:
            preferences = user.get_preferences()
            return Response({
                "success": True,
                "data": preferences
            })
        except Exception as e:
            logger.error(f"Preferences fetch error: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to fetch preferences",
                "data": {}
            })
    
    elif request.method == 'PUT':
        try:
            # Update user preferences
            user.set_preferences(request.data)
            user.save()
            
            # Log the activity
            UserActivityLog.objects.create(
                user=user,
                activity_type='PROFILE_UPDATE',
                description='User updated preferences',
                ip_address=get_client_ip(request)
            )
            
            return Response({
                "success": True,
                "data": user.get_preferences()
            })
            
        except Exception as e:
            logger.error(f"Preferences update error: {str(e)}")
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@custom_auth_required
def create_profile_api(request):
    """
    POST /api/v1/users/profile/ - For initial profile creation
    """
    try:
        # Check if profile already exists
        if UserProfile.objects.filter(firebase_uid=request.user.firebase_uid).exists():
            return Response({
                "success": False,
                "error": "Profile already exists"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserProfileCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Add the current user's firebase_uid to the data
            profile_data = serializer.validated_data
            profile_data['firebase_uid'] = request.user.firebase_uid
            profile_data['email'] = request.user.email
            
            # Ensure sub_role is included
            if 'sub_role' not in profile_data and 'sub_role' in request.data:
                profile_data['sub_role'] = request.data['sub_role']
            user_profile = serializer.save()
            
            UserActivityLog.objects.create(
                user=user_profile,
                activity_type='PROFILE_UPDATE',
                description='User profile created via API'
            )
            
            return Response({
                "success": True,
                "data": UserProfileSerializer(user_profile).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Profile creation error: {str(e)}")
        return Response({
            "success": False,
            "error": "Failed to create profile",
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Helper functions
def get_client_ip(request):
    """Helper function to get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_default_stats():
    """Helper function to return default stats"""
    return {
        'total_farms': 0,
        'total_plots': 0,
        'active_crops': 0,
        'pending_tasks': 0,
        'total_orders': 0,
        'total_revenue': 0.0,
        'profile_completion': 0,
        'productivity_level': 'MEDIUM',
        'success_rate': 0.0,
        'efficiency_score': 0.0
    }