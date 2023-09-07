from django.shortcuts import render, get_object_or_404
# from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from spectra.models import Spectrum
# from django.views.generic import TemplateView
from django.core.serializers import serialize
from djgeojson.serializers import Serializer as GeoJSONSerializer

import json

# def create_geojson():
#     spectra = Spectrum.objects.all()
#
#     for j,spectrum in enumerate(spectra):
#         if j==0:
#             geojson = {
#                 "type": "FeatureCollection",
#                 "crs": {
#                     "type": "name",
#                     "properties": {
#                         "name": "EPSG:4326"
#                     }
#                 },
#                 "features": [
#                     {
#                         "type": "Feature",
#                         "properties": {
#                             "instrument": "THEMIS"
#                         },
#                         "geometry": {
#                             "type": "Point",
#                             "coordinates": [
#                                 -73.8047144010574,
#                                 30.80614948603047
#                             ]
#                         }
#                     }
#         # else:
#         #     rec =
#
#     #
#     geojson="a"
#     return geojson


from spectra.views import get_spectra
# from django.core.serializers.json import DjangoJSONEncoder
# from django.http import JsonResponse
@login_required
def default(request):
    # print("testdefault")
    # geo_json = serialize('geojson', Spectrum.objects.all(),
    user = request.user
    geo_json = serialize('geojson', Spectrum.objects.filter(user=user),
        geometry_field='point',
        # pk='NOTE',
        # title='Note',
        # name='Note',
        # fields=('instrument','description',) 
        fields=('description',) 
    )
    # settings = {
    # 'geo_json': geo_json,
    # }
    # spectrum = Spectrum.objects.all()[0]
    # geo_json = GeoJSONSerializer().serialize(spectrum, use_natural_keys=True, with_modelname=False)
    # geo_json_dumped = json.dumps(geo_json)
    # settings = {
    # 'geo_json': geo_json_dumped,
    # }

    # geo_json = create_geojson()
    # user_id = request.user.id
    # user = get_object_or_404(User, pk=user_id)
    # spectra = user.spectrum_set.all()
    rec_spectra = get_spectra(request)



    # dygraphs_spectra = convert_dygraphs_data(spectra)
    # settings = {
    #     'user': user,
    #     'spectra': spectra,
    #     'dygraphs_spectra': dygraphs_spectra,
    # }

    # if request.POST:
    #     id = request.POST["id"]
    #     spectrum = get_object_or_404(Spectrum, pk = int(id))
    #     rec = {
    #     'id': id,
    #     'N': 4,
    #     'lat': float(spectrum.latitude),
    #     'lon': float(spectrum.longitude),
    #     'zoom': 8000000,
    #     'x_pixel': spectrum.x_pixel,
    #     'y_pixel': spectrum.y_pixel,
    #     'wavelength': spectrum.wavelength,
    #     'reflectance': spectrum.reflectance,
    #     'geojson': geo_json,
    #     }
    #     settings = {
    #     'record_json': rec,
    #     }
    #     # return render(request, "map3d/test.html", settings)
    #     return render(request, "map3d/index.html", settings)

    # else:
    # print(rec_spectra["spectra"])
    rec = {
        'name': "Note",
        'title': "Note",
        'geojson': geo_json,
    }
    rec_for_jump = []
    for j,spectrum in enumerate(rec_spectra["spectra"]):
        # print(spectrum.latitude)
        # rec_for_jump = []
        record = {
            'N': 3,
            # 'id': spectrum["dygraphs_spectra"]["rec"]["id"],
            # 'lat': spectrum["dygraphs_spectra"]["rec"]["latitude"],
            # 'lon': spectrum["dygraphs_spectra"]["rec"]["longitude"],
            'id': spectrum.id,
            'lat': float(spectrum.latitude),
            'lon': float(spectrum.longitude),
            'zoom': 15000000,
            # 'geojson': geo_json,
        }
        rec_for_jump.append(record)
    user = request.user
    print(user)
    print(user.username)
    print(user.id)
    groups = user.groups.all()
    print(groups[0]) 

    settings = {
        'record_json': rec,
        'record_spectra': rec_spectra,
        'record_jump': rec_for_jump,
        # 'user': #list of user's my list
        'groups': groups,

        # 'dygraphs_spectra': rec_spectra["dygraphs_spectra"],
        # 'record': rec_spectra["dygraphs_spectra"]
        # 'user': user,
        # 'spectra': spectra,
        # 'dygraphs_spectra': dygraphs_spectra,
    }
    # print("asdfasdf")
    # print(rec_spectra["user"].username)
    # print(rec_spectra.user)
    return render(request, "map3d/index.html", settings)
    # rec_list = list(rec_spectra)
    # print("default: jsonresponse")
    # # print(rec_list)
    # return JsonResponse(rec_list, safe=False)



##############################
### 入力した緯度経度地点に飛ぶ ###
##############################
from spectra.models import Spectrum
# from django.contrib.gis.geos import GEOSGeometry, Point
def jump(request):
    # # id = request.body.decode('utf-8')
    # id = request.session.get("test")
    id = request.POST["id"]
    spectrum = get_object_or_404(Spectrum, pk = int(id))
    rec = {
        'id': id,
        'N': 4,
        'lat': spectrum.latitude,
        'lon': spectrum.longitude,
        'zoom': 15000000,
        'point': spectrum.point,
        # 'spectrum': spectrum,
    }
    settings = {
        'record_json': rec,
    }
    # return render(request, "map3d/test.html", settings)
    return render(request, "map3d/index.html", settings)



# from djgeojson.views import GeoJSONLayerView
# from django.views.generic import TemplateView
from django.core.serializers import serialize
def test_gis(request):
    geo_json = serialize('geojson', Spectrum.objects.all(),
          geometry_field='point',
          fields=('instrument','description',))
    settings = {
        'geo_json': geo_json,
    }
    # return render(request, "map3d/test2.html", settings)
    return render(request, "map3d/index.html", settings)
