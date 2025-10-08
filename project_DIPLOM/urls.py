from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # ...existing code...
    path('api/search/', include('search.urls')),
    # ...existing code...
]