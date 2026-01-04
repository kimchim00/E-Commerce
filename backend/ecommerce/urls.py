"""
URL configuration for ecommerce project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """Simple API root view"""
    return JsonResponse({
        'message': 'E-commerce API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': {
                'categories': '/api/categories/',
                'products': '/api/products/',
                'cart': '/api/cart/',
                'orders': '/api/orders/',
                'wishlist': '/api/wishlist/',
                'auth': {
                    'register': '/api/auth/register/',
                    'login': '/api/auth/login/',
                }
            },
            'docs': 'http://localhost:8001/docs (FastAPI)',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



