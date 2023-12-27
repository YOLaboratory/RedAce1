from django.shortcuts import render, redirect
from django.http import HttpResponse
from datetime import datetime,date
from . import forms, models
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from decimal import Decimal
import json

@login_required
def index(request):
	settings = {
	}
	return render(request, "spectra/index.html", settings)

def convert_dygraphs_data(rec_spectra):
    dygraphs_spectra = []
    for j,spectrum in enumerate(rec_spectra):
        data = []
        dygraphs_spectrum = ''
        wavelengths = spectrum.wavelength.split(",")
        reflectances = spectrum.reflectance.split(",")
        band_num = len(wavelengths)

        # TODO:配列が逆順になったりするのを直す
        if spectrum.instrument == "CRISM":
            for i, reflectance in enumerate(reflectances):
                in_array = []
                if reflectances[band_num - i - 1] == "-1":
                    pass
                else:
                    # 余分な空白と ']' を取り除いてから浮動小数点数に変換
                    wavelength_str = wavelengths[band_num - i - 1].strip().lstrip('[').rstrip(']')
                    reflectance_value_str = reflectances[band_num - i - 1].strip().lstrip('[').rstrip(']')

                    try:
                        wavelength = float(wavelength_str)
                        reflectance_value = float(reflectance_value_str)

                        in_array.append(wavelength)
                        in_array.append(reflectance_value)
                        data.append(in_array)
                        dygraphs_spectrum += '[' + str(wavelength) + ',' + str(reflectance_value) + '],\n'
                    except ValueError as e:
                        # もし浮動小数点数に変換できない場合は例外を処理
                        print(f"Error converting to float: {e}")
                        # 何らかのエラー処理を行うか、例外を上位に投げるか、適切な対応を行う
                        pass

            dygraphs_spectra.append({
                "data": data,
                "id_graph": "graph" + str(j),
                "id_map": "map" + str(j),
                "rec": spectrum
            })
        else:
            for i, wavelength in enumerate(wavelengths):
                in_array = []
                # 余分な空白と ']' を取り除いてから浮動小数点数に変換
                cleaned_wavelength = wavelength.strip().lstrip('[').rstrip(']')
                cleaned_reflectance = reflectances[i].strip().lstrip('[').rstrip(']')

                in_array.append(float(cleaned_wavelength))
                in_array.append(float(cleaned_reflectance))
                data.append(in_array)
                dygraphs_spectrum += '[' + cleaned_wavelength + ',' + cleaned_reflectance + '],\n'

            dygraphs_spectra.append({
                "data": data,
                "id_graph": "graph" + str(j),
                "id_map": "map" + str(j),
                "rec": spectrum
            })

    return dygraphs_spectra


from django.contrib.auth.models import User, Group
from django.shortcuts import get_object_or_404
def spectra(request):
    user_id = request.user.id
    # user = get_object_or_404(User, pk=user_id)
    user = get_object_or_404(get_user_model(), pk=user_id)
    spectra = user.spectrum_set.all()


    dygraphs_spectra = convert_dygraphs_data(spectra)
    settings = {
        'user': user,
        'spectra': spectra,
        'dygraphs_spectra': dygraphs_spectra,
    }
    return render(request, "spectra/spectra.html", settings)

from decimal import Decimal


def get_spectra(request):
    if request.method == "GET":
        user_id = request.user.id
        user = get_object_or_404(get_user_model(), pk=user_id)
        spectra = request.user.spectrum_set.all()
        dygraphs_spectra = convert_dygraphs_data(spectra)
        settings = {
            'user': user,
            'spectra': spectra,
            'dygraphs_spectra': dygraphs_spectra,
        }
        return settings


class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, models.Spectrum):
            return str(obj)
        elif isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, (datetime, date)):
            return str(obj)
        # elif isinstance(obj, User):
        elif isinstance(obj, get_user_model()):
            return str(obj)
        else:
            raise TypeError(
                "Unserializable object {} of type {}".format(obj, type(obj))
            )


def get_spectra_axios(request):
    if request.method == "GET" or json.loads(request.body)["selected"] == "my_all":
        print("agagagagagag")

        user = request.user
        spectra = spectra_values = models.Spectrum.objects.filter(user=user).order_by('-id')
        dygraphs_spectra = convert_dygraphs_data(spectra)

        spectra_list = []
        coordinate_list = []
        for j,spectrum in enumerate(spectra):
            spectra_list.append({
                "instrument": spectrum.instrument, 
                "data_id": spectrum.data_id, 
                "path": spectrum.path,
                "image_path": spectrum.image_path,
                "x_pixel": spectrum.x_pixel, 
                "y_pixel": spectrum.y_pixel, 
                "mineral_id": spectrum.mineral_id,
                "description": spectrum.description, 
                "latitude": round(spectrum.latitude,3), 
                "longitude": round(spectrum.longitude,3),
                "created_date": spectrum.created_date.strftime("%Y/%m/%d %H:%M:%S"), 
                "user": spectrum.user,
                "permission": spectrum.permission, 
                "id": spectrum.id, 
                "id_edit": "edit" + str(spectrum.id),
                "id_update": "update" + str(spectrum.id), 
                "id_accordion": "accordion" + str(spectrum.id), 
                "id_permission": "permission" + str(spectrum.id),
                "id_delete": "delete" + str(spectrum.id), 
                "id_thumbnail": "thumbnail" + str(spectrum.id)
            })

        settings = {
            'spectra_list': spectra_list,
            'dygraphs_spectra': dygraphs_spectra,
        }
        json_list = json.dumps(settings, cls=LazyEncoder)
        return JsonResponse(json_list, safe=False)

    else:
        print("get_spectra_axios:post")
        print(json.loads(request.body)["selected"])
        filter_grp = json.loads(request.body)["selected"]

        if filter_grp == "private":
            user = request.user
            print(user)
            spectra = models.Spectrum.objects.filter(user=user).filter(permission=filter_grp)

            dygraphs_spectra = convert_dygraphs_data(spectra)

            spectra_list = []
            coordinate_list = []
            for j,spectrum in enumerate(spectra):
                spectra_list.append({
                    "instrument": spectrum.instrument, 
                    "data_id": spectrum.data_id, 
                    "path": spectrum.path,
                    "image_path": spectrum.image_path,
                    "x_pixel": spectrum.x_pixel, 
                    "y_pixel": spectrum.y_pixel, 
                    "mineral_id": spectrum.mineral_id,
                    "description": spectrum.description, 
                    "latitude": spectrum.latitude, 
                    "longitude": spectrum.longitude,
                    "created_date": spectrum.created_date.strftime("%Y/%m/%d %H:%M:%S"), 
                    "user": spectrum.user,
                    "permission": spectrum.permission, 
                    "id": spectrum.id, 
                    "id_edit": "edit" + str(spectrum.id),
                    "id_update": "update" + str(spectrum.id), 
                    "id_accordion": "accordion" + str(spectrum.id), 
                    "id_permission": "permission" + str(spectrum.id),
                    "id_delete": "delete" + str(spectrum.id), 
                    "id_thumbnail": "thumbnail" + str(spectrum.id)
                })
            settings = {
                'spectra_list': spectra_list,
                'dygraphs_spectra': dygraphs_spectra,
            }
            json_list = json.dumps(settings, cls=LazyEncoder)

            return JsonResponse(json_list, safe=False)


        else:
            spectra = models.Spectrum.objects.filter(permission=filter_grp)

            print(spectra)

            dygraphs_spectra = convert_dygraphs_data(spectra)

            spectra_list = []
            coordinate_list = []
            for j,spectrum in enumerate(spectra):
                spectra_list.append({
                    "instrument": spectrum.instrument, 
                    "data_id": spectrum.data_id, 
                    "path": spectrum.path,
                    "image_path": spectrum.image_path,
                    "x_pixel": spectrum.x_pixel, 
                    "y_pixel": spectrum.y_pixel, 
                    "mineral_id": spectrum.mineral_id,
                    "description": spectrum.description, 
                    "latitude": spectrum.latitude, 
                    "longitude": spectrum.longitude,
                    "created_date": spectrum.created_date.strftime("%Y/%m/%d %H:%M:%S"), 
                    "user": spectrum.user,
                    "permission": spectrum.permission, 
                    "id": spectrum.id, 
                    "id_edit": "edit" + str(spectrum.id),
                    "id_update": "update" + str(spectrum.id), 
                    "id_accordion": "accordion" + str(spectrum.id), 
                    "id_permission": "permission" + str(spectrum.id),
                    "id_thumbnail": "thumbnail" + str(spectrum.id)
                })

            settings = {
                'spectra_list': spectra_list,
                'dygraphs_spectra': dygraphs_spectra,
            }
            json_list = json.dumps(settings, cls=LazyEncoder)

            return JsonResponse(json_list, safe=False)


def change_permission(request):
    print("change_permission")
    if request.method == "POST":
        data_content = request.body.decode("utf-8")
        params_list = json.loads(data_content)
        print(params_list)
        permission_new = params_list["change_to"]
        print(permission_new)
        id = params_list["id_permission"].lstrip("permission")
        print(id)
        models.Spectrum.objects.filter(id=id).update(permission = permission_new)

        settings = {
            'permission': permission_new,
        }

        return render(request, "spectra/spectrum_new.html", settings)

def delete_from_list(request):
    print("delete_from_list")
    if request.method == "POST":
        delete_list = request.body.decode("utf-8")
        param_list = json.loads(delete_list)
        id_list = param_list["id_delete"]
        for id in id_list:
            index_id = id.lstrip("delete")

        settings = {
            'permission': id_list,
        }

    return render(request, "spectra/spectrum_new.html", settings)

###usui, 準備中
@login_required
def collection(request):
    user_id = request.user.id
    group = request.user.groups.filter(user=user_id)[0]
    collection = group.collection_set.all()[0] 
    spectra = collection.spectra.all()  
    dygraphs_spectra = convert_dygraphs_data(spectra) 

    settings = {
        'collection': collection, 
        'spectra': spectra, 
        'dygraphs_spectra': dygraphs_spectra, 
    }
    return render(request, "spectra/collection.html", settings)



def collection_edit(request):
		settings = {
			'form': forms.NewCollectionForm(),
		}
		return render(request, "spectra/collection_new.html", settings)

@login_required
def collection_new(request):
	if request.method == "POST":
		description = request.POST.get("description")
		owner = request.POST.get("owner")
		date = datetime.now()
		new_rec = models.Collection.objects.create(created_date=date,
										description=description,
										owner=owner)
		return redirect("/spectra/collection/"+str(new_rec.id))
	else:
		settings = {
			'form': forms.NewCollectionForm(),
		}
		return render(request, "spectra/collection_new.html", settings)


from django.contrib.gis.geos import GEOSGeometry, Point
from django.utils import timezone

@login_required
def spectrum_new(request):
    if request.method == "POST":

        print("spectrum_new here!!!")
        data_content = request.body.decode("utf-8")
        params_list = json.loads(data_content)
        new_records = []
        for params_json in params_list["spectral_data"]:
            obs_id = params_json["obs_ID"][0:11]
            instrument = params_json["obs_name"]
            path = params_json["path"]
            image_path = params_json["Image_path"]
            x_pixel = params_json["pixels"][0]
            y_pixel = params_json["pixels"][1]
            x_image_size = params_json["Image_size"][0]
            y_image_size = params_json["Image_size"][1]
            wavelength = params_json["band_bin_center"]
            reflectance = params_json["reflectance"]
            latitude = params_json["coordinate"][1]
            longitude = params_json["coordinate"][0]
            user_id = request.user.id
            user = get_object_or_404(get_user_model(), pk=user_id)
            # user = get_object_or_404(User, pk=user_id)
            point = GEOSGeometry('Point(%s %s)' %(longitude, latitude))

            description = params_list["description"]

            new_rec = models.Spectrum(
                data_id=obs_id,
                instrument=instrument,
                path=path,
                image_path=image_path,
                x_pixel=x_pixel,
                y_pixel=y_pixel,
                x_image_size=x_image_size,
                y_image_size=y_image_size,
                wavelength=wavelength,
                reflectance=reflectance,
                # mineral_id=mineral_id,
                latitude=latitude,
                longitude=longitude,
                point=point,
                user=user,
                description=description,
                created_date=timezone.datetime.now(),
            )
            new_records.append(new_rec)
        models.Spectrum.objects.bulk_create(new_records)

        return redirect("/accounts/home")
    else:
        settings = {
            'form': forms.NewSpectrumForm(),
        }
        return render(request, "spectra/spectrum_new.html", settings)


from django.db.models import F
from decimal import Decimal
def description_update(request):
    print("AAAAAAAAAA")
    if request.method == "POST":
        data_content = request.body.decode("utf-8")
        params_list = json.loads(data_content)
        print(params_list)
        description = params_list["description"]
        print(description)
        id = params_list["id_update"].lstrip("update")
        print(id)
        models.Spectrum.objects.filter(id=id).update(description = description)

        settings = {
            'description': description,
        }

        return render(request, "spectra/spectrum_new.html", settings)
