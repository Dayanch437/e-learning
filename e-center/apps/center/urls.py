from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'center'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'grammar', views.GrammarViewSet)
router.register(r'videos', views.VideoLessonViewSet)
router.register(r'vocabulary', views.TurkmenEnglishWordViewSet, basename='vocabulary')

urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
]