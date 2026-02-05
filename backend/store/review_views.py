from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import IntegrityError
from .models import Review, Product
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Review.objects.all()
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not rating:
            return Response(
                {'error': 'rating is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user already reviewed this product
        existing_review = Review.objects.filter(
            user=request.user,
            product=product
        ).first()

        if existing_review:
            # Update existing review
            existing_review.rating = rating
            existing_review.comment = comment
            existing_review.save()
            serializer = self.get_serializer(existing_review)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Create new review
            try:
                review = Review.objects.create(
                    user=request.user,
                    product=product,
                    rating=rating,
                    comment=comment
                )
                serializer = self.get_serializer(review)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response(
                    {'error': 'You have already reviewed this product'},
                    status=status.HTTP_400_BAD_REQUEST
                )

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Get all reviews by the current user"""
        reviews = Review.objects.filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def user_product_review(self, request):
        """Check if the current user has reviewed a specific product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        review = Review.objects.filter(
            user=request.user,
            product_id=product_id
        ).first()

        if review:
            serializer = self.get_serializer(review)
            return Response(serializer.data)
        else:
            return Response(
                {'message': 'No review found'},
                status=status.HTTP_404_NOT_FOUND
            )
