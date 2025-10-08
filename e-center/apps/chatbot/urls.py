from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet

app_name = 'chatbot'

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chatsession')

urlpatterns = [
    path('', include(router.urls)),
]