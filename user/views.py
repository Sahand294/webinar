from django.contrib.auth import authenticate, login,logout
from django.contrib.sessions.models import Session
from django.shortcuts import render, redirect

from models.models import *


# Create your views here.

def signup(request):
    print("hi1")
    if request.method == 'POST':
        print("hi")
        first_name = request.POST.get('firstname')
        last_name = request.POST.get('lastname')
        username = request.POST.get('username')
        gender = request.POST.get('gender')
        birthday = request.POST.get('birthday')
        email = request.POST.get('email')
        password = request.POST.get('password')
        if  User.objects.filter(email=email).first():
            return render(request, 'signup.html',{"error":"Email already taken"})
        if  User.objects.filter(username=username).first():
            return render(request, 'signup.html',{"error":"Username already taken"})
        user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name, email=email,birthdate=birthday,gender=gender)
        user.save()
        return redirect('login')
    return render(request, 'signup.html')
def complete(request):
    if request.method == 'POST':
        gender = request.POST.get('gender')
        birthday = request.POST.get('birthday')
        user = User.objects.get(id=request.user.id)
        user.birthdate = birthday
        user.gender = gender
        user.save()
        return redirect('home')
    return render(request, 'complete_profile.html')
def Login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request,user)
            # Session.objects.create(logged=user)
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Invalid username or password'})

    return render(request, 'login.html')
def Logout(request):
    logout(request)
    return redirect('home')
def Account(request):
    if request.user.is_authenticated:
        user = User.objects.get(id=request.user.id)
        if user.birthdate is None or user.gender is None:
            return redirect("complete")
    if request.method == 'POST':
        user = User.objects.get(id=request.user.id)
        username = request.POST.get('username')
        first_name = request.POST.get('firstname')
        last_name = request.POST.get('lastname')
        password = request.POST.get('password')
        email = request.POST.get('email')
        gender = request.POST.get('gender')
        birthday = request.POST.get('birthday')
        if  username:
            user.username = username
        if  first_name:
            user.first_name = first_name
        if  last_name:
            user.last_name = last_name
        if  email:
            user.email = email
        if  gender:
            user.gender = gender
        if  birthday:
            user.birthdate = birthday
        if password:
            user.set_password(password)
        user.save()
        return redirect('account')
    if not request.user.is_authenticated:
        return redirect('login')
    user = User.objects.get(id=request.user.id)

    your_webinars = []
    others_webinars = []
    for webinar in Webinar_User.objects.filter(user_id=user.id).all():

        i = Webinar.objects.get(id=webinar.webinar_id_id)
        if not i:
            pass

        if webinar.role == Role_webinar.HOST.value:
            your_webinars.append(i)
        else:
            others_webinars.append(i)
    print(others_webinars,your_webinars)
    return render(request, 'account.html',{'user':user,'hosted':your_webinars,'joined':others_webinars})
def delete_account(request):
    user = User.objects.get(id=request.user.id)
    logout(request)
    user.delete()
    return redirect("home")