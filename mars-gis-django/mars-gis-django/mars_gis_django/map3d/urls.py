from django.urls import path
from . import views
from djgeojson.views import GeoJSONLayerView
from .views import map, api_db, api_dir, api_reflectance
from spectra.models import Spectrum

app_name = 'map3d'
urlpatterns = [
    # path('', views.index, name='index'),
    path('', views.map.default, name='default'),
    path('db/', views.api_db.db, name='db'),
    path('dir/', views.api_dir.dir, name='dir'),
    path('reflectance/', views.api_reflectance.reflectance, name='reflectance'),
    path('jump', views.map.jump, name='jump'),
    path('gis', views.map.test_gis, name='gis'),
    path('open', GeoJSONLayerView.as_view(model=Spectrum), name='open'),
]
