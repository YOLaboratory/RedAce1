from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import include, path
from . import views
# from accounts.views import SignUp

app_name = 'accounts'
urlpatterns = [
    # path('', views.index, name='index'), ###usui
    # path('',LoginView.as_view(template_name='accounts/login.html'),name='login'),
    path('login/', LoginView.as_view(template_name='accounts/login.html'),name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # path('signup/', SignUp.as_view(), name='signup'),
    path('signup/', views.SignUp, name='signup'),
    path('home/', views.users_home, name='home'),
    path('select', views.select_page, name='select_page'),
]
