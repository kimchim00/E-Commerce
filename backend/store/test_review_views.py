"""
Tests for review views.

Tests the ReviewViewSet functionality including creating, listing,
and retrieving reviews.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from .models import Category, Product, Review


class ReviewViewSetTest(TestCase):
    """Test the ReviewViewSet."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
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
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Laptop',
            slug='laptop',
            description='A laptop',
            price=Decimal('999.99'),
            category=self.category,
            stock=10,
            available=True
        )

    def test_list_reviews_without_auth(self):
        """Test that listing reviews doesn't require authentication."""
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great product!'
        )

        response = self.client.get('/api/reviews/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_list_reviews_filtered_by_product(self):
        """Test filtering reviews by product ID."""
        product2 = Product.objects.create(
            name='Mouse',
            slug='mouse',
            description='A mouse',
            price=Decimal('29.99'),
            category=self.category,
            stock=50
        )

        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great laptop!'
        )
        Review.objects.create(
            user=self.user2,
            product=product2,
            rating=3,
            comment='Average mouse'
        )

        response = self.client.get(f'/api/reviews/?product_id={self.product.id}')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['comment'] == 'Great laptop!'

    def test_create_review_requires_authentication(self):
        """Test that creating a review requires authentication."""
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_review_success(self):
        """Test successfully creating a review."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Excellent product!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['rating'] == 5
        assert response.data['comment'] == 'Excellent product!'
        assert response.data['user']['username'] == 'testuser'

        # Verify review was created in database
        assert Review.objects.count() == 1
        review = Review.objects.first()
        assert review.user == self.user
        assert review.product == self.product
        assert review.rating == 5

    def test_create_review_without_product_id(self):
        """Test creating a review without product_id returns error."""
        self.client.force_authenticate(user=self.user)

        data = {
            'rating': 5,
            'comment': 'Great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'product_id' in response.data['error']

    def test_create_review_without_rating(self):
        """Test creating a review without rating returns error."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': self.product.id,
            'comment': 'Great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'rating' in response.data['error']

    def test_create_review_with_invalid_product_id(self):
        """Test creating a review with non-existent product."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': 99999,
            'rating': 5,
            'comment': 'Great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'Product not found' in response.data['error']

    def test_update_existing_review(self):
        """Test that creating a second review updates the existing one."""
        self.client.force_authenticate(user=self.user)

        # Create first review
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=3,
            comment='Average'
        )

        # Try to create another review (should update)
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Actually, it\'s great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['rating'] == 5
        assert response.data['comment'] == 'Actually, it\'s great!'

        # Verify only one review exists
        assert Review.objects.count() == 1
        review = Review.objects.first()
        assert review.rating == 5
        assert review.comment == 'Actually, it\'s great!'

    def test_create_review_comment_optional(self):
        """Test creating a review without comment."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': self.product.id,
            'rating': 4
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['rating'] == 4
        assert response.data['comment'] == ''

    def test_my_reviews_requires_authentication(self):
        """Test that my_reviews action requires authentication."""
        response = self.client.get('/api/reviews/my_reviews/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_my_reviews_returns_user_reviews(self):
        """Test my_reviews action returns only current user's reviews."""
        self.client.force_authenticate(user=self.user)

        # Create reviews by different users
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='My review'
        )

        product2 = Product.objects.create(
            name='Mouse',
            slug='mouse',
            description='A mouse',
            price=Decimal('29.99'),
            category=self.category,
            stock=50
        )
        Review.objects.create(
            user=self.user2,
            product=product2,
            rating=3,
            comment='Other user review'
        )

        response = self.client.get('/api/reviews/my_reviews/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['comment'] == 'My review'

    def test_user_product_review_requires_authentication(self):
        """Test that user_product_review requires authentication."""
        response = self.client.get(f'/api/reviews/user_product_review/?product_id={self.product.id}')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_product_review_without_product_id(self):
        """Test user_product_review without product_id parameter."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/reviews/user_product_review/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'product_id' in response.data['error']

    def test_user_product_review_found(self):
        """Test user_product_review when user has reviewed the product."""
        self.client.force_authenticate(user=self.user)

        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=4,
            comment='Good product'
        )

        response = self.client.get(f'/api/reviews/user_product_review/?product_id={self.product.id}')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['rating'] == 4
        assert response.data['comment'] == 'Good product'

    def test_user_product_review_not_found(self):
        """Test user_product_review when user hasn't reviewed the product."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(f'/api/reviews/user_product_review/?product_id={self.product.id}')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'No review found' in response.data['message']

    def test_review_updates_product_rating(self):
        """Test that creating a review updates the product's rating."""
        self.client.force_authenticate(user=self.user)

        # Initial state
        assert self.product.rating == Decimal('0.0')

        # Create review
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Excellent!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED

        # Check product rating was updated
        self.product.refresh_from_db()
        assert self.product.rating == Decimal('5.0')
        assert self.product.review_count == 1

    def test_multiple_reviews_average_rating(self):
        """Test that multiple reviews calculate correct average."""
        self.client.force_authenticate(user=self.user)

        # First review
        data1 = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Excellent!'
        }
        self.client.post('/api/reviews/', data1, format='json')

        # Second review by different user
        self.client.force_authenticate(user=self.user2)
        data2 = {
            'product_id': self.product.id,
            'rating': 3,
            'comment': 'Average'
        }
        self.client.post('/api/reviews/', data2, format='json')

        # Check average rating
        self.product.refresh_from_db()
        assert self.product.rating == Decimal('4.0')
        assert self.product.review_count == 2

    def test_review_serializer_includes_user_info(self):
        """Test that review response includes user information."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED

        # Check user info in response
        assert 'user' in response.data
        assert response.data['user']['id'] == self.user.id
        assert response.data['user']['username'] == self.user.username
        assert response.data['user']['email'] == self.user.email

    def test_review_includes_timestamps(self):
        """Test that review response includes created_at and updated_at."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Great!'
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED

        assert 'created_at' in response.data
        assert 'updated_at' in response.data

    def test_reviews_ordered_by_most_recent(self):
        """Test that reviews are ordered by created_at descending."""
        # Create multiple reviews
        Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='First review'
        )
        Review.objects.create(
            user=self.user2,
            product=self.product,
            rating=4,
            comment='Second review'
        )

        response = self.client.get('/api/reviews/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

        # Most recent should be first
        assert response.data[0]['comment'] == 'Second review'
        assert response.data[1]['comment'] == 'First review'

    def test_create_review_edge_case_rating_boundaries(self):
        """Test creating reviews with boundary rating values."""
        self.client.force_authenticate(user=self.user)

        # Test minimum rating
        data = {
            'product_id': self.product.id,
            'rating': 1,
            'comment': 'Minimum rating'
        }
        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['rating'] == 1

        # Update with maximum rating
        data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Maximum rating'
        }
        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['rating'] == 5

    def test_empty_comment_treated_as_empty_string(self):
        """Test that missing or empty comment is stored as empty string."""
        self.client.force_authenticate(user=self.user)

        data = {
            'product_id': self.product.id,
            'rating': 4,
            'comment': ''
        }

        response = self.client.post('/api/reviews/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['comment'] == ''

        review = Review.objects.first()
        assert review.comment == ''