from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Group
from spectra.models import Spectrum
from spectra.views import convert_dygraphs_data
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from accounts.forms import SignUpForm



# class SignUp(CreateView):
#     form_class = SignUpForm
#     template_name = "accounts/signup.html" 
#     success_url = reverse_lazy('accounts/login.html')

#     def form_valid(request, form):
#         form.save()
#         # user = form.save() # formの情報を保存
#         # login(self.request, user) # 認証
#         # self.object = user 
#         # return HttpResponseRedirect(self.get_success_url()) # リダイレクト
#         return render(request, 'accounts/login.html')
def SignUp(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})


@login_required
def index(request):
    return render(request, 'accounts/index.html')
@login_required
def select_page(request):
    return render(request, 'accounts/select.html')
# Create your views here.


# def convert_dygraphs_data(rec_spectra):
#     dygraphs_spectra = []
#     for j,spectrum in enumerate(rec_spectra):
#         dygraphs_spectrum = '' #'[["wavelength","reflectance"]]'
#         wavelengths = spectrum.wavelength.split(",")
#         reflectances = spectrum.reflectance.split(",")
#         for i,wavelength in enumerate(wavelengths):
#             dygraphs_spectrum+='['+wavelength+','+reflectances[i]+'],\n'
#         dygraphs_spectra.append({"data":dygraphs_spectrum, "id_graph":"graph"+str(j),
#                                 "id_map":"map"+str(j),"rec":spectrum})
#
#     return dygraphs_spectra



# from spectra.models import Spectrum, Collection, MineralList

@login_required
def users_home(request):
    user_id = request.user.id
    user = get_object_or_404(User, pk=user_id)
    spectra = user.spectrum_set.all()
    dygraphs_spectra = convert_dygraphs_data(spectra)
    #
    # ctx = {}
    qs = Spectrum.objects.all()
    # ctx = qs
    #
    try:
        group = request.user.groups.filter(user=user_id)[0]#全グループ表示したい、https://teratail.com/questions/166707
        # rec = group.collection_set.all()
    #
        settings = {
            'user': user,
            'spectra': spectra,
            # 'dygraphs_spectra': dygraphs_spectra,
            'group': group,
            # 'collections': rec,
            # 'collection_id': collection_id,
            'qs':qs,
            # 'ctx':ctx,
        }
        return render(request, "accounts/home.html", settings)
    #
    except IndexError:
        settings = {
            'user': user,
            'spectra': spectra,
            # 'dygraphs_spectra': dygraphs_spectra,
        }
        return render(request, "accounts/home.html",settings)
    # settings = {
    # 'user': user,
    # }
    # return render(request, 'accounts/home.html', settings)
    # return render(request, 'accounts/home.html', {'user': user, 'spectra': spectra})





# def spectralListView(request):
#     template_name = "accounts/home.html"
#     ctx = {}
#     qs = Spectrum.objects.all()
#     ctx["object_list"] = qs

#     return render(request, template_name, ctx)