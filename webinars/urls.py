from django.urls import path
from . import views

urlpatterns = [
    path('detail/<int:id>/', views.webinar_detail, name='webinar_detail'),
    path('add/', views.add_webinar, name='create_webinar'),
    path('delete/<int:id>/', views.delete_webinar, name='delete_webinar'),
    path('edit/<int:id>/', views.edit_webinar, name='edit_webinar'),

]