# users/views_dashboards.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from .models import UserProfile, UserActivityLog
from marketplace.models import ProductListing, Order, ShoppingCart
from farms.models import Farm, Plot, FarmTask
from .permissions import IsFarmerUser, IsConsumerUser, IsSupplierUser

class FarmerDashboardView(APIView):
    permission_classes = [IsFarmerUser]
    
    def get(self, request):
        try:
            user = request.user
            
            # Farm-specific stats
            farms = Farm.objects.filter(owner=user)
            total_farms = farms.count()
            total_plots = Plot.objects.filter(farm__in=farms).count()
            active_crops = Plot.objects.filter(
                farm__in=farms, 
                crop_status__in=['PLANTED', 'GROWING', 'READY']
            ).count()
            pending_tasks = FarmTask.objects.filter(farm__in=farms, status='PENDING').count()
            
            # Marketplace stats for farmers
            my_products = ProductListing.objects.filter(farmer=user)
            total_products = my_products.count()
            active_products = my_products.filter(status='AVAILABLE').count()
            total_orders = Order.objects.filter(product__farmer=user).count()
            total_revenue = Order.objects.filter(
                product__farmer=user, 
                status__in=['CONFIRMED', 'DELIVERED']
            ).aggregate(total=Sum('total_price'))['total'] or 0
            
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
            return Response({
                "success": False,
                "error": "Failed to load farmer dashboard"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_profile_completion(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        return (completed_fields / len(required_fields)) * 100

class ConsumerDashboardView(APIView):
    permission_classes = [IsConsumerUser]
    
    def get(self, request):
        try:
            user = request.user
            
            # Consumer-specific stats
            cart = ShoppingCart.objects.filter(user=user).first()
            cart_items = cart.items.count() if cart else 0
            cart_total = cart.subtotal if cart else 0
            
            total_orders = Order.objects.filter(customer=user).count()
            completed_orders = Order.objects.filter(customer=user, status='DELIVERED').count()
            pending_orders = Order.objects.filter(customer=user, status__in=['PENDING', 'CONFIRMED']).count()
            
            # Recent marketplace activity
            recent_orders = Order.objects.filter(customer=user).order_by('-created_at')[:5]
            
            stats = {
                'cart_items': cart_items,
                'cart_total': float(cart_total),
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'pending_orders': pending_orders,
                'profile_completion': self._calculate_profile_completion(user),
                'role': 'consumer',
                'recent_orders_count': recent_orders.count()
            }
            
            return Response({
                "success": True,
                "data": stats,
                "recent_orders": self._serialize_orders(recent_orders)
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to load consumer dashboard"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_profile_completion(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        return (completed_fields / len(required_fields)) * 100
    
    def _serialize_orders(self, orders):
        return [{
            'id': order.id,
            'product_title': order.product.title,
            'quantity': order.quantity,
            'total_price': float(order.total_price),
            'status': order.status,
            'created_at': order.created_at
        } for order in orders]

class SupplierDashboardView(APIView):
    permission_classes = [IsSupplierUser]
    
    def get(self, request):
        try:
            user = request.user
            
            # Supplier-specific stats
            my_products = ProductListing.objects.filter(farmer=user)
            total_products = my_products.count()
            active_products = my_products.filter(status='AVAILABLE').count()
            sold_products = my_products.filter(status='SOLD').count()
            
            total_orders = Order.objects.filter(product__farmer=user).count()
            completed_orders = Order.objects.filter(
                product__farmer=user, 
                status='DELIVERED'
            ).count()
            total_revenue = Order.objects.filter(
                product__farmer=user,
                status__in=['CONFIRMED', 'DELIVERED']
            ).aggregate(total=Sum('total_price'))['total'] or 0
            
            # Business metrics
            customer_count = Order.objects.filter(
                product__farmer=user
            ).values('customer').distinct().count()
            
            stats = {
                'total_products': total_products,
                'active_products': active_products,
                'sold_products': sold_products,
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'total_revenue': float(total_revenue),
                'customer_count': customer_count,
                'profile_completion': self._calculate_profile_completion(user),
                'role': 'supplier',
                'business_rating': self._calculate_business_rating(user)
            }
            
            return Response({
                "success": True,
                "data": stats
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to load supplier dashboard"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_profile_completion(self, user):
        required_fields = ['first_name', 'last_name', 'phone_number', 'location', 'business_name']
        completed_fields = sum(1 for field in required_fields if getattr(user, field, ''))
        return (completed_fields / len(required_fields)) * 100
    
    def _calculate_business_rating(self, user):
        # Simple business rating based on orders and revenue
        orders_count = Order.objects.filter(product__farmer=user, status='DELIVERED').count()
        if orders_count == 0:
            return 0
        return min(5.0, (orders_count / 10) * 5)  # Scale to 5 stars