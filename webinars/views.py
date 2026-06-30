from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from models.models import *
from webinars.forms import WebinarForm

from rest_framework import viewsets
from models.models import Webinar
from .serializers import ProfileSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Webinar.objects.all()
    serializer_class = ProfileSerializer


# Create your views here.
# DECORATOR MODEL DOWN THERE 👇
# from django.http import HttpResponseForbidden
# from functools import wraps
#
# def verified_user_required(view_func):
#     @wraps(view_func)
#     def wrapper(request, *args, **kwargs):
#         if not request.user.is_authenticated:
#             return HttpResponseForbidden("لطفا وارد شوید")
#         if not request.user.profile.is_verified:
#             return HttpResponseForbidden("حساب کاربری شما تایید نشده")
#         return view_func(request, *args, **kwargs)
#     return wrapper

def delete_webinar(request,id):
    webinar = Webinar.objects.get(id=id)
    webinar.delete()
    return redirect("webinars")
def webinar_detail(request, id):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")

    if request.method == 'POST':
        w = Webinar.objects.get(id=id)
        w.stock -= 1
        w.save()
        Webinar_User.objects.create(
            user_id=User.objects.get(id=int(request.user.id)),
            webinar_id=w,
            role='PARTICIPANT',
        )
    webinar = Webinar.objects.get(id=id)
    category = []
    for i in webinar.category.values():
        category.append(i["id"])
    host = Webinar_User.objects.filter(webinar_id=webinar.id,role="HOST").first()
    host = User.objects.get(id=host.user_id.id)
    host_name = f"{host.first_name[0].upper()}{host.first_name[1:]} {host.last_name[0].upper()}{host.last_name[1:]}"
    role = Webinar_User.objects.filter(webinar_id=id,user_id=request.user.id).first()
    print(category)
    if role:
        return render(request, 'webinar.html',
                  {'w': webinar, "user": request.user, "categories":list(Category.objects.all()),
                                                "selected_category":category, "host": host_name,"role":role.role})
    else:
    # if request.method == 'POST':
    #     host_edit_webinar(request, id)
        return render(request, 'webinar.html', {'w': webinar,"user":request.user,"categories":list(Category.objects.all()),
                                                "selected_category":category,"host":host_name})
def edit_webinar(request, id):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    webinar = Webinar.objects.get(id=id)
    if request.method == 'POST':
        webinar.name = request.POST.get('title')
        webinar.description = request.POST.get('description')
        webinar.title_image = request.FILES['title_image']
        webinar.hosted_at = request.POST.get('hosted_at')
        webinar.link = request.POST.get('link')
        webinar.ticket_expiration = request.POST.get('expiration')
        webinar.price = request.POST.get('price')
        webinar.stock = request.POST.get('stock')
        webinar.category.clear()
        categories = request.POST.get("category", "")
        category_list = [int(c) for c in categories.split(",") if c.strip()]
        for i in category_list:
            cat = Category.objects.get(id=i)
            webinar.category.add(cat)
        webinar.save()

        role = Webinar_User.objects.filter(webinar_id=id).first()
        return render(request, 'webinar.html',{'w':webinar,'role':role.role})
    # return render(request, 'host-edit-webinar.html',{'webinar':webinar})

@login_required
def add_webinar(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    else:
        return redirect("home")
    if request.method == 'POST':
        form = WebinarForm(request.POST, request.FILES)
        name = request.POST.get('name')
        description = request.POST.get('description')
        image = request.FILES['title_image']
        hosted_at = request.POST.get('hosted_at')
        link = request.POST.get('link')
        ticket_expiration = request.POST.get('ticket_expiration')
        price = request.POST.get('price')
        stock = request.POST.get('stock')
        webinar = Webinar.objects.create(
        name = name,
        description=description,
            hosted_at=hosted_at,
            link=link,
            title_image=image,
            ticket_expiration=ticket_expiration,
            price=price,
            stock=stock,
            type='public',
        )
        Webinar_User.objects.create(
            user_id=User.objects.get(id=int(request.user.id)),
            webinar_id=webinar,
            role='HOST',
        )

        categories = request.POST.get("category", "")
        category_list = [int(c) for c in categories.split(",") if c.strip()]
        for i in category_list:
            cat = Category.objects.get(id=i)
            webinar.category.add(cat)

        return redirect('webinar_detail', webinar.id)
    users = User.objects.exclude(id=int(request.user.id))
    return render(request, 'webinar_create.html',{'users':users,"categories":list(Category.objects.all())})