from django.shortcuts import render, get_object_or_404
# from django.http import HttpResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from spectra.models import Spectrum
# from django.views.generic import TemplateView
from django.core.serializers import serialize
# from djgeojson.serializers import Serializer as GeoJSONSerializer

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

# @login_required
def default(request):
    if request.user.is_authenticated:
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

        rec_spectra = get_spectra(request)

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
        groups = user.groups.all()

        # スーパーカム, get_all

        settings = {
            'record_json': rec,
            'record_spectra': rec_spectra,
            'record_jump': rec_for_jump,
            # 'user': #list of user's my list
            'groups': groups,
            # 'dygraphs_spectra': rec_spectra["dygraphs_spectra"],
            # 'record': rec_spectra["dygraphs_spectra"]
            'user': user,
            # 'spectra': spectra,
            # 'dygraphs_spectra': dygraphs_spectra,
            

            # ここにスーパーカム


        }

        return render(request, "map3d/index.html", settings)
    else:
        return render(request, "map3d/login.html")




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
