from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from webinars.views import ProfileViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("admin/", include("custom_admin.urls")),
    path("accounts/", include("allauth.urls")),
    path("", include("main.urls")),
    path("webinar/", include("webinars.urls")),
    path("account/", include("user.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)