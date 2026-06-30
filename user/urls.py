from django.urls import path
from . import views

urlpatterns = [
    path('account/', views.Account, name='account'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.Login, name='login'),
    path('complete_account/', views.complete, name='complete'),
    path('delete/', views.delete_account, name='delete'),
    path('logout/', views.Logout, name='logout'),
]