from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.core.paginator import Paginator
from models.models import *
PAGE = 2

# Create your views here.
def delete_user(request, id):
    u = User.objects.get(id=id)
    u.delete()
    return redirect("admin_main")

def user(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    if request.GET.get("load_js") == "1":
        qs = User.objects.order_by("id")
        page = request.GET.get("page", 1)
        paginator = Paginator(qs, PAGE)
        current_page = paginator.get_page(page)
        data = [
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "username": u.username,
                "email": u.email,
                "is_staff": u.is_staff,
            }
            for u in current_page
        ]
        return JsonResponse({
            "users": data,
            "has_next": current_page.has_next(),
            "has_previous": current_page.has_previous(),
            "current_page": current_page.number,
            "total_pages": paginator.num_pages,
        })
    return render(request, "admin_users.html", {"users": User.objects.all()})
def edit_user(request, id):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    user = User.objects.get(id=id)
    username = request.POST.get('username')
    first_name = request.POST.get('first_name')
    last_name = request.POST.get('last_name')
    password = request.POST.get('password')
    email = request.POST.get('email')
    gender = request.POST.get('gender')
    birthday = request.POST.get('birthday')
    if username:
        user.username = username
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if email:
        user.email = email
    if gender:
        user.gender = gender
    if birthday:
        user.birthdate = birthday
    if password:
        pass
    user.save()
    return redirect("admin_main")
def create_user(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    username = request.POST.get('username')
    first_name = request.POST.get('first_name')
    last_name = request.POST.get('last_name')
    email = request.POST.get('email')
    gender = request.POST.get('gender')
    birthday = request.POST.get('birthday')
    check = User.objects.filter(email=email).first()
    if check:
        messages.error(request, "The email already exists.")
        return redirect("admin_main")
    check = User.objects.filter(username=username).first()
    if check:
        messages.error(request, "The username already exists.")
        return redirect("admin_main")
    if request.POST.get("is_staff") == "1":
        User.objects.create_user(username=username, password="123", first_name=first_name, last_name=last_name, email=email,birthdate=birthday,gender=gender,is_staff=True)
    else:
        User.objects.create_user(username=username, password="123", first_name=first_name, last_name=last_name, email=email,birthdate=birthday,gender=gender)
    return redirect("users")

def main_admin(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    return render(request, "admin_home.html", {"users": User.objects.all(), "webinars": Webinar.objects.all(),
                                          "subscriptions": Monthly_Subscription.objects.all(),
                                          "webinar_users": Webinar_User.objects.all(),
                                               "total_webinars":Webinar.objects.count(),
                                               "total_users":User.objects.count()})

def webinar(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    if request.GET.get("load_js") == "1":
        qs = Webinar.objects.order_by("name")
        page = request.GET.get("page", 1)
        paginator = Paginator(qs, PAGE)
        current_page = paginator.get_page(page)
        data = [
            {
                "id": wb.id,
                "title": wb.name,
                "stock": wb.stock or 0,
                "price": float(wb.price),
                "type": wb.type,
            }
            for wb in current_page
        ]
        return JsonResponse({
            "webinars": data,
            "has_next": current_page.has_next(),
            "has_previous": current_page.has_previous(),
            "current_page": current_page.number,
            "total_pages": paginator.num_pages,
        })
    return render(request, "admin_webinars.html", {"webinars": Webinar.objects.all()})
def activate_webinar(request, id):
    webinar = Webinar.objects.get(id=id)
    webinar.type = "public"
    webinar.save()
    return redirect("admin_webinars")

def deactivate_webinar(request, id):
    webinar = Webinar.objects.get(id=id)
    webinar.type = "private"
    webinar.save()
    return redirect("admin_webinars")


def admin_sub(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    return redirect("admin_main")
    # if request.GET.get("load_js") == "1":
    #     qs = Monthly_Subscription.objects.select_related("user").order_by("id")
    #     page = request.GET.get("page", 1)
    #     paginator = Paginator(qs, 20)
    #     current_page = paginator.get_page(page)
    #     data = [
    #         {
    #             "id": sub.id,
    #             "user": str(sub.user),
    #             "plan": sub.plan,
    #             "started_at": sub.started_at.strftime("%b %d, %Y") if sub.started_at else "",
    #             "expires_at": sub.expires_at.strftime("%b %d, %Y") if sub.expires_at else "",
    #             "is_active": sub.is_active,
    #         }
    #         for sub in current_page
    #     ]
    #     return JsonResponse({
    #         "subscriptions": data,
    #         "has_next": current_page.has_next(),
    #         "has_previous": current_page.has_previous(),
    #         "current_page": current_page.number,
    #         "total_pages": paginator.num_pages,
    #     })
    # return render(request, "admin_subscriptions.html", {"subscriptions": Monthly_Subscription.objects.all()})
