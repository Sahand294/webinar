from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.hashers import make_password
# Create your models here.
from django.contrib.auth.models import AbstractUser
class Category(models.Model):
    name = models.CharField(max_length=20,null=True)
    class Meta:
        db_table = 'category'
        verbose_name = 'category'
        verbose_name_plural = 'categories'
class User(AbstractUser):
    db_table = 'Users'
    # this comes and wel

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    class Meta:
        db_table = 'users'
        ordering = ['created_at']# this creates
        verbose_name = 'users'
        verbose_name_plural = 'users'
        # unique_together = ('firstname', 'lastname'♦
class Webinar(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    title_image = models.ImageField(upload_to='webinar_images/',null=True)
    hosted_at = models.DateTimeField(null=True)
    link = models.URLField(null=True)
    ticket_expiration = models.DateTimeField(null=True)
    type = models.CharField(max_length=20, choices=[('public', 'Public'), ('private', 'Private')],null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    stock = models.IntegerField(blank=True, null=True)
    category = models.ManyToManyField(Category)
    def __str__(self):
        return self.name
    class Meta:
        db_table = 'webinar'
        ordering = ['created_at']  # this creates
        verbose_name = 'webinar'
        verbose_name_plural = 'webinars'

class Site_Settings(models.Model):
    key = models.CharField(max_length=100,unique=True)
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'site_settings'
        ordering = ['created_at']# this creates
        verbose_name = 'site_settings'
        verbose_name_plural = 'site_settings'

# Create your models here.
class Ticket(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    webinar_id = models.ForeignKey(Webinar, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'ticket'
        ordering = ['created_at']# this creates
        verbose_name = 'ticket'
        verbose_name_plural = 'tickets'


from enum import Enum
class Type(models.Model):
    name = models.CharField(max_length=20)
    class Meta:
        db_table = 'type'
        verbose_name = 'type'
        verbose_name_plural = 'types'
class Role_webinar(Enum):
    PARTICIPANT = 'PARTICIPANT'
    HOST = 'HOST'
    SPEAKER = 'SPEAKER'
    HOST_SPEAKER = 'HOST_SPEAKER'
    @classmethod
    def choices(cls):
        return [(key.value, key.name.capitalize()) for key in cls]
class Webinar_User(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    webinar_id = models.ForeignKey(Webinar, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20,
        choices=Role_webinar.choices(),
        default=Role_webinar.PARTICIPANT.value,
    )
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user_id', 'webinar_id'], name='unique_webinar_user')
        ]
        db_table = 'webinar_user'
        verbose_name = 'webinar_user'
        verbose_name_plural = 'webinar_users'
class Banner_Advertising(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='banner_images/')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'banner_advertising'
        ordering = ['created_at']
        verbose_name = 'banner_advertising'
        verbose_name_plural = 'banner_advertisings'
class Hourly_Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'hourly_subscription'
        ordering = ['created_at']
        verbose_name = 'hourly_subscription'
        verbose_name_plural = 'hourly_subscriptions'
class Monthly_Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'monthly_subscription'
        ordering = ['created_at']
        verbose_name = 'monthly_subscription'
        verbose_name_plural = 'monthly_subscriptions'
class Category_Webinar(models.Model):
    category = models.ForeignKey(Type, on_delete=models.CASCADE)
    webinar = models.ForeignKey(Webinar, on_delete=models.CASCADE)
    class Meta:
        db_table = 'category_webinar'
        verbose_name = 'category_webinar'
        verbose_name_plural = 'category_webinars'