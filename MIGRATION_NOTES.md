# Migration Notes

## New Database Fields

After updating the models, you need to create and run migrations:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## New Model Fields Added

### Product Model
- `discount_price` - DecimalField for discounted price
- `rating` - DecimalField for product rating (0.0 to 5.0)
- `review_count` - IntegerField for number of reviews
- `is_featured` - BooleanField to mark featured products
- `is_flash_sale` - BooleanField to mark flash sale products

### Category Model
- `icon` - CharField for emoji or icon name

### New Model
- `Wishlist` - Model to store user wishlist items

## Admin Panel Updates

You can now set:
- Discount prices for products
- Mark products as featured or flash sale
- Add icons to categories
- View and manage wishlists

## API Endpoints Added

### Wishlist
- `GET /api/wishlist/products/` - Get user's wishlist products
- `POST /api/wishlist/add/` - Add product to wishlist
- `DELETE /api/wishlist/remove/` - Remove product from wishlist

### Products (Enhanced)
- `GET /api/products/?featured=true` - Get featured products
- `GET /api/products/?flash_sale=true` - Get flash sale products

## Frontend Features Added

1. **Hero Carousel** - Banner slider on homepage
2. **Flash Sale Section** - Countdown timer and special deals
3. **Enhanced Search** - Autocomplete search in header
4. **Product Cards** - Ratings, discounts, wishlist buttons
5. **Wishlist Integration** - Add/remove from wishlist





