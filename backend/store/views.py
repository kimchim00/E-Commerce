from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q, F, Case, When, IntegerField
from .models import Category, Product, Cart, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer,
    OrderSerializer, UserSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = Product.objects.filter(available=True)
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        featured = self.request.query_params.get('featured', None)
        flash_sale = self.request.query_params.get('flash_sale', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        min_rating = self.request.query_params.get('min_rating', None)
        in_stock = self.request.query_params.get('in_stock', None)
        has_discount = self.request.query_params.get('has_discount', None)
        sort_by = self.request.query_params.get('sort_by', None)
        
        if category:
            queryset = queryset.filter(category__slug=category)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        if featured:
            queryset = queryset.filter(is_featured=True)
        if flash_sale:
            queryset = queryset.filter(is_flash_sale=True)
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        if min_rating:
            try:
                queryset = queryset.filter(rating__gte=float(min_rating))
            except ValueError:
                pass
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        if has_discount == 'true':
            queryset = queryset.filter(discount_price__isnull=False)
        
        # Sorting
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-rating', '-review_count')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        elif sort_by == 'discount':
            queryset = queryset.annotate(
                discount_amount=Case(
                    When(discount_price__isnull=False, then=F('price') - F('discount_price')),
                    default=0,
                    output_field=IntegerField()
                )
            ).order_by('-discount_amount')
        else:
            # Default sorting
            queryset = queryset.order_by('-created_at')
        
        return queryset


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if item already exists in cart
        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update quantity if item already exists
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Handle quantity update
        if 'quantity' in request.data:
            quantity = int(request.data['quantity'])
            if quantity < 1:
                instance.delete()
                return Response(
                    {'message': 'Item removed from cart'},
                    status=status.HTTP_200_OK
                )
            instance.quantity = quantity
            instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        cart_items = Cart.objects.filter(user=request.user)
        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        shipping_address = request.data.get('shipping_address', '')
        if not shipping_address:
            return Response(
                {'error': 'Shipping address is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = sum(item.total_price for item in cart_items)
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            shipping_address=shipping_address
        )

        # Create order items from cart
        for cart_item in cart_items:
            # Use discount_price if available, otherwise use regular price
            item_price = cart_item.product.discount_price or cart_item.product.price
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=item_price
            )

        # Clear cart
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

