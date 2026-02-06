from django.contrib import admin
from .models import Category, Product, Cart, Order, OrderItem, Wishlist, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    fields = ['name', 'slug', 'description', 'icon', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'discount_price', 'stock', 'available', 'rating', 'is_featured', 'is_flash_sale', 'created_at']
    list_filter = ['available', 'category', 'is_featured', 'is_flash_sale', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    raw_id_fields = ['category']
    readonly_fields = ['created_at', 'updated_at', 'rating', 'review_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'category', 'image')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_price')
        }),
        ('Inventory', {
            'fields': ('stock', 'available')
        }),
        ('Features', {
            'fields': ('is_featured', 'is_flash_sale')
        }),
        ('Reviews', {
            'fields': ('rating', 'review_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'total_price_display', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']
    raw_id_fields = ['user', 'product']
    readonly_fields = ['created_at', 'updated_at']
    
    def total_price_display(self, obj):
        return f"${obj.total_price:.2f}"
    total_price_display.short_description = 'Total Price'


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']
    raw_id_fields = ['user', 'product']
    readonly_fields = ['created_at']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price_display']
    fields = ['product', 'quantity', 'price', 'total_price_display']
    
    def total_price_display(self, obj):
        if obj.id:
            return f"${obj.total_price:.2f}"
        return "-"
    total_price_display.short_description = 'Total'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'status', 'item_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'id', 'shipping_address']
    raw_id_fields = ['user']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'status', 'total_amount')
        }),
        ('Shipping', {
            'fields': ('shipping_address',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price', 'total_price_display']
    list_filter = ['order__status', 'order__created_at']
    search_fields = ['order__id', 'product__name']
    raw_id_fields = ['order', 'product']
    readonly_fields = ['total_price_display']
    
    def total_price_display(self, obj):
        return f"${obj.total_price:.2f}"
    total_price_display.short_description = 'Total Price'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'product__name', 'comment']
    raw_id_fields = ['user', 'product']
    readonly_fields = ['created_at', 'updated_at']
