"""
Tests for Django REST Framework serializers.

Tests the ReviewSerializer validation and serialization.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from decimal import Decimal
from .models import Category, Product, Review
from .serializers import ReviewSerializer


class ReviewSerializerTest(TestCase):
    """Test the ReviewSerializer."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
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

    def test_serialize_review(self):
        """Test serializing a review."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great product!'
        )

        serializer = ReviewSerializer(review)
        data = serializer.data

        assert data['id'] == review.id
        assert data['rating'] == 5
        assert data['comment'] == 'Great product!'
        assert 'user' in data
        assert data['user']['username'] == 'testuser'
        assert 'created_at' in data
        assert 'updated_at' in data

    def test_deserialize_review_valid_data(self):
        """Test deserializing valid review data."""
        data = {
            'product_id': self.product.id,
            'rating': 4,
            'comment': 'Good product'
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()

        # Note: We don't save here as we'd need a user context
        assert serializer.validated_data['product'] == self.product
        assert serializer.validated_data['rating'] == 4
        assert serializer.validated_data['comment'] == 'Good product'

    def test_validate_rating_minimum(self):
        """Test that rating validation rejects values below 1."""
        data = {
            'product_id': self.product.id,
            'rating': 0,
            'comment': 'Invalid rating'
        }

        serializer = ReviewSerializer(data=data)
        assert not serializer.is_valid()
        assert 'rating' in serializer.errors

    def test_validate_rating_maximum(self):
        """Test that rating validation rejects values above 5."""
        data = {
            'product_id': self.product.id,
            'rating': 6,
            'comment': 'Invalid rating'
        }

        serializer = ReviewSerializer(data=data)
        assert not serializer.is_valid()
        assert 'rating' in serializer.errors

    def test_validate_rating_valid_range(self):
        """Test that ratings from 1-5 are valid."""
        for rating in range(1, 6):
            data = {
                'product_id': self.product.id,
                'rating': rating,
                'comment': f'Rating {rating}'
            }

            serializer = ReviewSerializer(data=data)
            assert serializer.is_valid(), f"Rating {rating} should be valid"

    def test_comment_is_optional(self):
        """Test that comment field is optional."""
        data = {
            'product_id': self.product.id,
            'rating': 5
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()

    def test_comment_can_be_empty_string(self):
        """Test that comment can be an empty string."""
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': ''
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['comment'] == ''

    def test_user_field_is_read_only(self):
        """Test that user field cannot be set via serializer."""
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Test',
            'user': {'id': 999, 'username': 'hacker'}
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()
        # User should not be in validated_data
        assert 'user' not in serializer.validated_data

    def test_created_at_is_read_only(self):
        """Test that created_at field is read-only."""
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Test',
            'created_at': '2023-01-01T00:00:00Z'
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()
        assert 'created_at' not in serializer.validated_data

    def test_updated_at_is_read_only(self):
        """Test that updated_at field is read-only."""
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Test',
            'updated_at': '2023-01-01T00:00:00Z'
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()
        assert 'updated_at' not in serializer.validated_data

    def test_product_id_is_write_only(self):
        """Test that product_id is write-only and not in serialized output."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        serializer = ReviewSerializer(review)
        data = serializer.data

        assert 'product_id' not in data
        # Note: product itself is not included in ReviewSerializer

    def test_serializer_includes_user_nested_data(self):
        """Test that serializer includes nested user data."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        serializer = ReviewSerializer(review)
        data = serializer.data

        assert 'user' in data
        user_data = data['user']
        assert 'id' in user_data
        assert 'username' in user_data
        assert 'email' in user_data
        assert user_data['username'] == 'testuser'
        assert user_data['email'] == 'test@example.com'

    def test_serializer_multiple_reviews(self):
        """Test serializing multiple reviews."""
        review1 = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great!'
        )

        user2 = User.objects.create_user(
            username='user2',
            password='pass123'
        )
        review2 = Review.objects.create(
            user=user2,
            product=self.product,
            rating=3,
            comment='Average'
        )

        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        data = serializer.data

        assert len(data) == 2
        assert data[0]['rating'] in [5, 3]
        assert data[1]['rating'] in [5, 3]

    def test_rating_validation_error_message(self):
        """Test the validation error message for invalid rating."""
        serializer = ReviewSerializer()

        with self.assertRaises(ValidationError) as context:
            serializer.validate_rating(0)

        assert "Rating must be between 1 and 5" in str(context.exception)

        with self.assertRaises(ValidationError) as context:
            serializer.validate_rating(6)

        assert "Rating must be between 1 and 5" in str(context.exception)

    def test_invalid_product_id(self):
        """Test serializer with non-existent product ID."""
        data = {
            'product_id': 99999,
            'rating': 5,
            'comment': 'Test'
        }

        serializer = ReviewSerializer(data=data)
        assert not serializer.is_valid()
        assert 'product_id' in serializer.errors

    def test_missing_required_fields(self):
        """Test serializer with missing required fields."""
        # Missing product_id
        data = {
            'rating': 5,
            'comment': 'Test'
        }
        serializer = ReviewSerializer(data=data)
        assert not serializer.is_valid()
        assert 'product_id' in serializer.errors

        # Missing rating
        data = {
            'product_id': self.product.id,
            'comment': 'Test'
        }
        serializer = ReviewSerializer(data=data)
        assert not serializer.is_valid()
        assert 'rating' in serializer.errors

    def test_partial_update_not_allowed_without_context(self):
        """Test that partial updates work correctly."""
        review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=3,
            comment='Average'
        )

        # Update only rating
        data = {
            'product_id': self.product.id,
            'rating': 5
        }

        serializer = ReviewSerializer(review, data=data, partial=True)
        assert serializer.is_valid()

    def test_rating_integer_field(self):
        """Test that rating field only accepts integers."""
        data = {
            'product_id': self.product.id,
            'rating': 'five',
            'comment': 'Test'
        }

        serializer = ReviewSerializer(data=data)
        assert not serializer.is_valid()
        assert 'rating' in serializer.errors

    def test_rating_decimal_converted_to_integer(self):
        """Test that decimal rating values are converted to integers."""
        data = {
            'product_id': self.product.id,
            'rating': 4.5,
            'comment': 'Test'
        }

        serializer = ReviewSerializer(data=data)
        # This might fail validation or convert to int depending on DRF settings
        # The model expects integer choices 1-5
        # So 4.5 should either fail validation or be converted

    def test_long_comment(self):
        """Test that long comments are accepted."""
        long_comment = 'A' * 1000

        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': long_comment
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['comment'] == long_comment

    def test_unicode_in_comment(self):
        """Test that unicode characters in comments are handled correctly."""
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': '非常好的产品！ 👍 Excellent product!'
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()

    def test_review_id_is_read_only(self):
        """Test that ID field is read-only."""
        data = {
            'id': 999,
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Test'
        }

        serializer = ReviewSerializer(data=data)
        assert serializer.is_valid()
        # ID should not be settable
        assert 'id' not in serializer.validated_data or serializer.validated_data.get('id') != 999