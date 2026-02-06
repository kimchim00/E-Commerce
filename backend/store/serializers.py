from rest_framework import serializers
from django.utils.text import slugify
from django.contrib.auth.models import User
from .models import Category, Product, Cart, Order, OrderItem, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']
        read_only_fields = ['id']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    discount_percentage = serializers.ReadOnlyField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'discount_price', 
                  'discount_percentage', 'image', 'category', 'category_id', 
                  'stock', 'available', 'rating', 'review_count', 'is_featured', 
                  'is_flash_sale', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'rating', 'review_count']
        extra_kwargs = {
            'slug': {'required': False}
        }
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            representation['image'] = (
                request.build_absolute_uri(instance.image.url)
                if request else instance.image.url
            )
        else:
            representation['image'] = None
        return representation

    def create(self, validated_data):
        if not validated_data.get('slug'):
            base_slug = slugify(validated_data.get('name', 'product')) or 'product'
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        return super().create(validated_data)


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'product', 'product_id', 'quantity', 
                  'total_price', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_amount', 'status', 'shipping_address',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Review
        fields = ['id', 'user', 'product_id', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

