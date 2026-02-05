"""
Tests for Django store models.

Tests the Review model functionality including rating updates,
validation, and model relationships.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.db import IntegrityError
from decimal import Decimal
from .models import Category, Product, Review, Cart, Wishlist, Order, OrderItem


class ReviewModelTest(TestCase):
    """Test the Review model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='password123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics',
            description='Electronic items'
        )
        self.product = Product.objects.create(
            name='Laptop',
            slug='laptop',
            description='A laptop computer',
            price=Decimal('999.99'),
            category=self.category,
            stock=10,
            available=True
        )

    def test_create_review(self):
        """Test creating a review."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great product!'
        )

        assert review.user == self.user
        assert review.product == self.product
        assert review.rating == 5
        assert review.comment == 'Great product!'
        assert review.created_at is not None
        assert review.updated_at is not None

    def test_review_string_representation(self):
        """Test the string representation of a review."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=4,
            comment='Good product'
        )

        expected = f"{self.user.username} - {self.product.name} (4 stars)"
        assert str(review) == expected

    def test_review_updates_product_rating_on_save(self):
        """Test that creating a review updates the product's average rating."""
        # Initial state
        assert self.product.rating == Decimal('0.0')
        assert self.product.review_count == 0

        # Create first review
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Excellent!'
        )

        # Refresh product from database
        self.product.refresh_from_db()
        assert self.product.rating == Decimal('5.0')
        assert self.product.review_count == 1

        # Create second review
        Review.objects.create(
            user=self.user2,
            product=self.product,
            rating=3,
            comment='Average'
        )

        # Refresh product from database
        self.product.refresh_from_db()
        assert self.product.rating == Decimal('4.0')  # (5+3)/2
        assert self.product.review_count == 2

    def test_review_updates_product_rating_on_delete(self):
        """Test that deleting a review updates the product's average rating."""
        # Create two reviews
        review1 = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Excellent!'
        )
        review2 = Review.objects.create(
            user=self.user2,
            product=self.product,
            rating=3,
            comment='Average'
        )

        # Refresh product from database
        self.product.refresh_from_db()
        assert self.product.rating == Decimal('4.0')
        assert self.product.review_count == 2

        # Delete one review
        review1.delete()

        # Refresh product from database
        self.product.refresh_from_db()
        assert self.product.rating == Decimal('3.0')
        assert self.product.review_count == 1

    def test_review_unique_together_constraint(self):
        """Test that a user can only review a product once."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='First review'
        )

        # Attempting to create a second review should raise IntegrityError
        with self.assertRaises(IntegrityError):
            Review.objects.create(
                user=self.user,
                product=self.product,
                rating=4,
                comment='Second review'
            )

    def test_review_rating_choices(self):
        """Test that review rating accepts valid choices (1-5)."""
        for rating in range(1, 6):
            review = Review(
                user=self.user,
                product=self.product,
                rating=rating,
                comment=f'Rating {rating}'
            )
            # This should not raise an error
            review.full_clean()

    def test_review_comment_can_be_blank(self):
        """Test that review comment is optional."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment=''
        )

        assert review.comment == ''

    def test_review_ordering(self):
        """Test that reviews are ordered by created_at descending."""
        review1 = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='First'
        )

        # Create another user for second review
        user3 = User.objects.create_user(username='user3', password='pass123')
        review2 = Review.objects.create(
            user=user3,
            product=self.product,
            rating=4,
            comment='Second'
        )

        reviews = Review.objects.all()
        assert reviews[0] == review2  # Most recent first
        assert reviews[1] == review1

    def test_review_related_name_on_user(self):
        """Test accessing reviews through user's related name."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        user_reviews = self.user.reviews.all()
        assert user_reviews.count() == 1
        assert user_reviews[0].rating == 5

    def test_review_related_name_on_product(self):
        """Test accessing reviews through product's related name."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        product_reviews = self.product.reviews.all()
        assert product_reviews.count() == 1
        assert product_reviews[0].comment == 'Great!'

    def test_review_cascade_delete_with_user(self):
        """Test that reviews are deleted when user is deleted."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        assert Review.objects.count() == 1
        self.user.delete()
        assert Review.objects.count() == 0

    def test_review_cascade_delete_with_product(self):
        """Test that reviews are deleted when product is deleted."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        assert Review.objects.count() == 1
        self.product.delete()
        assert Review.objects.count() == 0

    def test_update_product_rating_for_product_static_method(self):
        """Test the static method for updating product rating."""
        # Create reviews
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Excellent!'
        )
        Review.objects.create(
            user=self.user2,
            product=self.product,
            rating=3,
            comment='Average'
        )

        # Manually update ratings using static method
        Review.update_product_rating_for_product(self.product)

        self.product.refresh_from_db()
        assert self.product.rating == Decimal('4.0')
        assert self.product.review_count == 2

    def test_multiple_products_independent_ratings(self):
        """Test that ratings are independent for different products."""
        product2 = Product.objects.create(
            name='Mouse',
            slug='mouse',
            description='A computer mouse',
            price=Decimal('29.99'),
            category=self.category,
            stock=50,
            available=True
        )

        # Review for product 1
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great laptop!'
        )

        # Review for product 2
        Review.objects.create(
            user=self.user2,
            product=product2,
            rating=3,
            comment='Average mouse'
        )

        self.product.refresh_from_db()
        product2.refresh_from_db()

        assert self.product.rating == Decimal('5.0')
        assert self.product.review_count == 1
        assert product2.rating == Decimal('3.0')
        assert product2.review_count == 1

    def test_review_with_updated_rating(self):
        """Test updating an existing review's rating."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=3,
            comment='Average'
        )

        self.product.refresh_from_db()
        assert self.product.rating == Decimal('3.0')

        # Update the review
        review.rating = 5
        review.save()

        self.product.refresh_from_db()
        assert self.product.rating == Decimal('5.0')

    def test_review_all_delete_resets_product_rating(self):
        """Test that deleting all reviews resets product rating to 0."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Excellent!'
        )

        self.product.refresh_from_db()
        assert self.product.rating == Decimal('5.0')
        assert self.product.review_count == 1

        # Delete all reviews
        Review.objects.filter(product=self.product).delete()

        self.product.refresh_from_db()
        assert self.product.rating == Decimal('0.0')
        assert self.product.review_count == 0


class ProductModelTest(TestCase):
    """Test Product model features related to reviews."""

    def setUp(self):
        """Set up test data."""
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Laptop',
            slug='laptop',
            description='A laptop',
            price=Decimal('999.99'),
            category=self.category,
            stock=10
        )

    def test_product_discount_percentage_calculation(self):
        """Test discount percentage calculation."""
        self.product.discount_price = Decimal('799.99')
        self.product.save()

        discount_percent = self.product.discount_percentage
        assert discount_percent == 20  # (999.99 - 799.99) / 999.99 * 100 = 20%

    def test_product_discount_percentage_no_discount(self):
        """Test discount percentage when no discount."""
        assert self.product.discount_percentage == 0

    def test_product_discount_percentage_with_none(self):
        """Test discount percentage when discount_price is None."""
        self.product.discount_price = None
        self.product.save()

        assert self.product.discount_percentage == 0


class CartModelTest(TestCase):
    """Test Cart model features."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            password='password123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Laptop',
            slug='laptop',
            description='A laptop',
            price=Decimal('999.99'),
            category=self.category,
            stock=10
        )

    def test_cart_total_price_with_discount(self):
        """Test cart total price calculation with discount."""
        self.product.discount_price = Decimal('799.99')
        self.product.is_flash_sale = True
        self.product.save()

        cart_item = Cart.objects.create(
            user=self.user,
            product=self.product,
            quantity=2
        )

        # Total should use discount price
        expected = Decimal('799.99') * 2
        assert cart_item.total_price == expected

    def test_cart_total_price_without_discount(self):
        """Test cart total price calculation without discount."""
        cart_item = Cart.objects.create(
            user=self.user,
            product=self.product,
            quantity=3
        )

        expected = Decimal('999.99') * 3
        assert cart_item.total_price == expected

    def test_cart_total_price_discount_not_in_flash_sale(self):
        """Test that discount is not applied if not in flash sale."""
        self.product.discount_price = Decimal('799.99')
        self.product.is_flash_sale = False
        self.product.save()

        cart_item = Cart.objects.create(
            user=self.user,
            product=self.product,
            quantity=2
        )

        # Should use regular price, not discount
        expected = Decimal('999.99') * 2
        assert cart_item.total_price == expected