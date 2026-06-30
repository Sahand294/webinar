from django.contrib.auth import authenticate
from django.shortcuts import render, redirect
from models.models import *


# Create your views here.
def home(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    webinars = Webinar.objects.all()
    special_webinars = []
    for i in webinars:
        type = Category_Webinar.objects.filter(webinar_id=i.id).first()
        print(type)
        # cat = Type.objects.filter(id=type.category_id).first()
        # if cat.name == 'Special':
        #     print(i.name)
            # special_webinars.append(i)
    return render(request, 'index.html',
                  {'webinars': webinars, 'special_webinars': special_webinars, "user": request.user})


def contact(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    return render(request, 'contact-us.html')


def about_us(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    return render(request, 'about-us.html')


from django.core.paginator import Paginator
from django.http import JsonResponse

# views.py


def get_webinar_by_js(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        print(request.user.username)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    load_js = request.GET.get("load_js", 0)

    #
    page = request.GET.get("page", 1)
    name_get_webinar = request.GET.get("name_webinar", "").strip()
    cats = request.GET.getlist("cats")
    price = request.GET.get("price", "any")

    webinars = Webinar.objects.prefetch_related("category").order_by("name")
    webinars = webinars.filter(type="public")
    if name_get_webinar:
        webinars = webinars.filter(name__startswith=name_get_webinar)

    if cats and "All" not in cats:
        for i in cats:
            webinars = webinars.filter(category__name__iexact=i)
    if price == "free":
        webinars = webinars.filter(price=0)
    elif price == "under20":
        webinars = webinars.filter(price__lt=20)
    elif price == "under50":
        webinars = webinars.filter(price__lt=50)
    print(cats)
    for i in webinars:
        print("webinars: ", i.name)
    paginator = Paginator(webinars, 2)
    current_page = paginator.get_page(page)

    if load_js == "1":
        print("yes load js for debugg reasons bbbbbbbbbbbbbbbbbbbbbbbbbb")


        data = []
        for webinar in current_page:
            data.append({
                "title": webinar.name,
                "blurb": webinar.description,
                "price": float(webinar.price),
                "id": webinar.id,
                "when": webinar.hosted_at.strftime("%b %d, %Y · %I:%M %p"),
                "seatsLeft": webinar.stock or 0,
                "link": webinar.link,
                "image": webinar.title_image.url if webinar.title_image else "",
                "categories": list(webinar.category.values_list("name", flat=True))
            })

        return JsonResponse({
            "webinars": data,
            "has_next": current_page.has_next(),
            "has_previous": current_page.has_previous(),
            "current_page": current_page.number,
            "total_pages": paginator.num_pages
        })
    else:


        paginator = Paginator(webinars, 2)
        current_page = paginator.get_page(page)

        print("current page ", current_page)
        return render(request, "webinars.html", {
            "webinars": current_page
        })