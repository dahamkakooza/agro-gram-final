# marketplace/views_role_specific.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ProductListing, ShoppingCart, Order
from .serializers import ProductListingSerializer, ShoppingCartSerializer
from users.permissions import IsConsumerUser, IsSupplierUser, CanSellProducts

class ConsumerMarketplaceView(APIView):
    """Marketplace view specifically for consumers - read only"""
    permission_classes = [IsConsumerUser]

    def get(self, request):
        try:
            products = ProductListing.objects.filter(status='AVAILABLE').order_by('-created_at')[:50]
            serializer = ProductListingSerializer(products, many=True, context={'request': request})
            
            return Response({
                "success": True,
                "role": "consumer",
                "products": serializer.data,
                "total_products": products.count(),
                "restrictions": {
                    "can_sell": False,
                    "can_buy": True,
                    "can_create_products": False
                }
            })
        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to load marketplace"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SupplierMarketplaceView(APIView):
    """Marketplace view specifically for suppliers - can sell"""
    permission_classes = [IsSupplierUser]

    def get(self, request):
        try:
            # Get available products
            products = ProductListing.objects.filter(status='AVAILABLE').order_by('-created_at')[:50]
            
            # Get supplier's own products
            my_products = ProductListing.objects.filter(farmer=request.user)
            
            products_serializer = ProductListingSerializer(products, many=True, context={'request': request})
            my_products_serializer = ProductListingSerializer(my_products, many=True, context={'request': request})
            
            return Response({
                "success": True,
                "role": "supplier",
                "products": products_serializer.data,
                "my_products": my_products_serializer.data,
                "total_products": products.count(),
                "my_products_count": my_products.count(),
                "restrictions": {
                    "can_sell": True,
                    "can_buy": True,
                    "can_create_products": True
                }
            })
        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to load marketplace"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)