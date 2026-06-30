from django.urls import path

from main import views

urlpatterns = [
    path('', views.home, name='home'),
    # path('get_webinar_by_js/', views.get_webinar_by_js, name='get_webinar'),
    path('webinars/', views.get_webinar_by_js, name='webinars'),
    path('contact/', views.contact, name='contact_us'),
    path('about_us/', views.about_us, name='about_us'),
]