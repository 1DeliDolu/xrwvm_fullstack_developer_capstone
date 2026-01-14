# Uncomment the required imports before adding the code

# from django.shortcuts import render
# from django.http import HttpResponseRedirect, HttpResponse
# from django.contrib.auth.models import User
# from django.shortcuts import get_object_or_404, render, redirect
# from django.contrib.auth import logout
# from django.contrib import messages
# from datetime import datetime

from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
import logging
import json
from django.views.decorators.csrf import csrf_exempt
# from .populate import initiate


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"message": "Only POST method is allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    username = data.get("userName")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"userName": username, "status": "Failed"}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({"userName": username, "status": "Failed"}, status=401)

    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"}, status=200)


@csrf_exempt
def logout_user(request):
    if request.method != "GET":
        return JsonResponse({"message": "Only GET method is allowed"}, status=405)

    logout(request)
    data = {"userName": ""}
    return JsonResponse(data, status=200)

# Create a `logout_request` view to handle sign out request
# def logout_request(request):
# ...

# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"message": "Only POST method is allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    username = data.get('userName')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')

    username_exist = False
    try:
        User.objects.get(username=username)
        username_exist = True
    except User.DoesNotExist:
        logger.debug(f"{username} is new user")

    if not username_exist:
        user = User.objects.create_user(username=username, first_name=first_name or "", last_name=last_name or "", password=password, email=email or "")
        login(request, user)
        return JsonResponse({"userName": username, "status": "Authenticated"})
    else:
        return JsonResponse({"userName": username, "error": "Already Registered"}, status=400)

# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
# def get_dealerships(request):
# ...

# Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request,dealer_id):
# ...

# Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
# ...

# Create a `add_review` view to submit a review
# def add_review(request):
# ...
