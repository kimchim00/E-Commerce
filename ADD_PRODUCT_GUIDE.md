# How to Add Products in Django

## Method 1: Django Admin Panel (Recommended)

### Step 1: Start Django Server
```cmd
cd backend
py manage.py runserver
```

### Step 2: Access Admin Panel
1. Go to: http://localhost:8000/admin/
2. Login with your superuser account

### Step 3: Create a Category (if needed)
1. Click **"Categories"** under **STORE**
2. Click **"Add Category"** button
3. Fill in:
   - **Name**: e.g., "Electronics", "Clothing", "Books"
   - **Slug**: Auto-generated (or customize)
   - **Description**: Optional
   - **Icon**: Optional (emoji like 📱, 👕, 📚)
4. Click **"Save"**

### Step 4: Add a Product
1. Click **"Products"** under **STORE**
2. Click **"Add Product"** button
3. Fill in all fields:

**Basic Information:**
- **Name**: Product name (e.g., "iPhone 15 Pro")
- **Slug**: Auto-generated from name
- **Description**: Detailed product description
- **Category**: Select from dropdown (must create category first!)
- **Image**: Click "Choose File" to upload product image

**Pricing:**
- **Price**: Regular price (e.g., 999.99)
- **Discount Price**: Optional sale price (e.g., 799.99)

**Inventory:**
- **Stock**: Number of items available (e.g., 50)
- **Available**: Check this box if product is in stock

**Features:**
- **Featured**: Check if you want to feature this product
- **Flash Sale**: Check if this is a flash sale item

4. Click **"Save"** or **"Save and add another"**

---

## Method 2: Using Django Shell

### Step 1: Open Django Shell
```cmd
cd backend
py manage.py shell
```

### Step 2: Create a Product
```python
from store.models import Category, Product

# Get or create a category
category, created = Category.objects.get_or_create(
    name="Electronics",
    defaults={'slug': 'electronics', 'description': 'Electronic products'}
)

# Create a product
product = Product.objects.create(
    name="iPhone 15 Pro",
    slug="iphone-15-pro",
    description="Latest iPhone with advanced features",
    price=999.99,
    discount_price=899.99,
    category=category,
    stock=50,
    available=True,
    is_featured=True,
    is_flash_sale=False
)

print(f"Product created: {product.name}")
```

---

## Method 3: Using Management Command (Advanced)

Create a file `backend/store/management/commands/add_product.py`:

```python
from django.core.management.base import BaseCommand
from store.models import Category, Product

class Command(BaseCommand):
    help = 'Add a product'

    def add_arguments(self, parser):
        parser.add_argument('name', type=str, help='Product name')
        parser.add_argument('price', type=float, help='Product price')
        parser.add_argument('category', type=str, help='Category name')

    def handle(self, *args, **options):
        category, _ = Category.objects.get_or_create(
            name=options['category'],
            defaults={'slug': options['category'].lower().replace(' ', '-')}
        )
        
        product = Product.objects.create(
            name=options['name'],
            slug=options['name'].lower().replace(' ', '-'),
            description=f"Description for {options['name']}",
            price=options['price'],
            category=category,
            stock=10,
            available=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created product: {product.name}')
        )
```

Then run:
```cmd
py manage.py add_product "Laptop" 1299.99 "Electronics"
```

---

## Quick Example: Adding Multiple Products

### Using Admin Panel:
1. Add first product
2. Click "Save and add another" instead of "Save"
3. Repeat for each product

### Using Shell:
```python
from store.models import Category, Product

# Create category
electronics = Category.objects.get_or_create(
    name="Electronics",
    defaults={'slug': 'electronics'}
)[0]

# Add multiple products
products = [
    {
        'name': 'iPhone 15 Pro',
        'price': 999.99,
        'discount_price': 899.99,
        'stock': 50,
        'description': 'Latest iPhone model'
    },
    {
        'name': 'Samsung Galaxy S24',
        'price': 899.99,
        'discount_price': 799.99,
        'stock': 30,
        'description': 'Flagship Android phone'
    },
    {
        'name': 'MacBook Pro',
        'price': 1999.99,
        'stock': 20,
        'description': 'Professional laptop'
    }
]

for p in products:
    Product.objects.create(
        category=electronics,
        slug=p['name'].lower().replace(' ', '-'),
        **p
    )

print("Products created successfully!")
```

---

## Important Notes

1. **Category is Required**: You must create a category before adding products
2. **Image Upload**: Images are stored in `backend/media/products/`
3. **Slug**: Auto-generated from name, but must be unique
4. **Price**: Use decimal format (e.g., 99.99)
5. **Stock**: Set to 0 if out of stock, or uncheck "Available"

---

## Troubleshooting

### "Category does not exist" error
- Create a category first in the admin panel

### "Slug already exists" error
- Change the product name or manually edit the slug

### Image not showing
- Make sure `MEDIA_URL` and `MEDIA_ROOT` are configured correctly
- Check that the media folder exists: `backend/media/products/`

### Can't access admin
- Create superuser: `py manage.py createsuperuser`
- Make sure server is running: `py manage.py runserver`



