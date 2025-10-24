# marketplace/views_restricted.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import ProductListing
from .serializers import ProductListingSerializer, ProductCreateRequestSerializer
from users.permissions import CanSellProducts, IsConsumerUser

class ProductListingCreateView(APIView):
    """Product creation with role restrictions"""
    permission_classes = [CanSellProducts]  # Only farmers and suppliers can create
    
    def post(self, request):
        try:
            if not CanSellProducts().has_permission(request, self):
                return Response({
                    "success": False,
                    "error": "You don't have permission to sell products"
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ProductCreateRequestSerializer(data=request.data)
            if serializer.is_valid():
                # Create product listing
                product_data = serializer.validated_data
                product_listing = ProductListing.objects.create(
                    farmer=request.user,
                    **product_data
                )
                
                product_serializer = ProductListingSerializer(product_listing, context={'request': request})
                
                return Response({
                    "success": True,
                    "message": "Product listed successfully!",
                    "product": product_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "success": False,
                    "error": "Validation failed",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to create product listing"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConsumerCartView(APIView):
    """Cart management specifically for consumers"""
    permission_classes = [IsConsumerUser]
    
    def get(self, request):
        try:
            cart = ShoppingCart.objects.filter(user=request.user).first()
            if not cart:
                return Response({
                    "success": True,
                    "cart": {
                        "items": [],
                        "total_items": 0,
                        "subtotal": 0,
                        "is_empty": True
                    }
                })
            
            serializer = ShoppingCartSerializer(cart, context={'request': request})
            return Response({
                "success": True,
                "cart": serializer.data
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": "Failed to load cart"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)