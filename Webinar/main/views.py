from django.contrib.auth import authenticate
from django.shortcuts import render, redirect
from models.models import *


# Create your views here.
def home(request):
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
    return render(request, 'contact-us.html')


def about_us(request):
    return render(request, 'about-us.html')


from django.core.paginator import Paginator
from django.http import JsonResponse



def get_webinar_by_js(request):
    load_js = request.GET.get("load_js", 0)
    if load_js == "1":
        print("yes load js for debugg reasons bbbbbbbbbbbbbbbbbbbbbbbbbb")
        page = request.GET.get("page", 1)
        name_get_webinar = request.GET.get("name_webinar", "").strip()
        cats = request.GET.getlist("cats")
        price = request.GET.get("price", "any")

        webinars = Webinar.objects.prefetch_related("category").order_by("name")
        webinars = webinars.filter(type="public")
        if name_get_webinar:
            webinars = webinars.filter(name__icontains=name_get_webinar)

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
            print("webinars: ",i.name)
        paginator = Paginator(webinars, 2)
        current_page = paginator.get_page(page)

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
        print("no load js for debugg reasons bbbbbbbbbbbbbbbbbbbbbbbbbb")
        page = request.GET.get("page", 1)
        webinars = Webinar.objects.prefetch_related("category").filter(type="public")

        # ── apply filters on initial page load too ────────────────
        name_get_webinar = request.GET.get("name_webinar", "").strip()
        cats = request.GET.getlist("cats")
        price = request.GET.get("price", "any")

        if name_get_webinar:
            webinars = webinars.filter(name__icontains=name_get_webinar)

        if cats and "All" not in cats:
            webinars = webinars.filter(category__name__in=cats).distinct()

        if price == "free":
            webinars = webinars.filter(price=0)
        elif price == "under20":
            webinars = webinars.filter(price__lt=20)
        elif price == "under50":
            webinars = webinars.filter(price__lt=50)
        # ─────────────────────────────────────────────────────────

        paginator = Paginator(webinars, 2)
        current_page = paginator.get_page(page)

        print("current page ", current_page)
        return render(request, "webinars.html", {
            "webinars": current_page
        })