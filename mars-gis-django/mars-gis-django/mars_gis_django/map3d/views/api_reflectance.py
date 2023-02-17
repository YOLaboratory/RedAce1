#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 松原さんRed AceのCGIから転載

import cgitb
cgitb.enable()

import cgi
import os
import sys
import glob
import psycopg2

import pvl
import json
import math
import numpy as np
import collections as cl
from osgeo import gdal,osr
from itertools import product
from pyproj import Proj, transform



def support_map_default(o):
    if isinstance(o, map):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")




def base_json_getRef(params_json):

    ######### THEMIS #########
    # umemo 引数 >> obs_name,obs_ID,path,wavelength,pixels 
    if params_json["obs_name"] == 'THEMIS':
        field = cl.OrderedDict() # umemo 順番が保持された辞書
        field["obs_ID"] = params_json["obs_ID"]
        field["obs_name"] = params_json["obs_name"]
        field["path"] = params_json["path"]
        field["Image_path"] = params_json["Image_path"]

        cube_data = gdal.Open(field["path"]["main"]["cub"], gdal.GA_ReadOnly) # umemo データを読み込み専用で開きます
        header = pvl.load(field["path"]["main"]["cub"])
        lbl_data = pvl.load(field["path"]["main"]["lbl"])
        bandnumber_range = list(range(cube_data.RasterCount)) # umemo バンドの数を最初から最後までリストに入れる ex)0,1,2,...
        NDV = cube_data.GetRasterBand(1).GetNoDataValue() # umemo バンドのデータ無し値を取得
        ref_arr = []
        no_data_ref = 1

        if lbl_data["Caminfo"]["Geometry"]["IncidenceAngle"] != None :
            E1 = (3.846*(10**26))/(4*math.pi)
            Em = E1/(227936640000)**2
            Lref = Em*(math.cos(math.radians(float(lbl_data["Caminfo"]["Geometry"]["IncidenceAngle"])))/math.pi)*0.0001
        else:
            Lref = 1
            if cube_data.GetRasterBand(cube_data.RasterCount).ReadAsArray()[int(params_json["pixels"][1])][int(params_json["pixels"][0])] == NDV: # umemo データあるか無いか判断
                no_data_ref = 1
            else:
                no_data_ref = 0

            for bandnumber_i in bandnumber_range:
                ref = cube_data.GetRasterBand(bandnumber_i+1).ReadAsArray()[int(params_json["pixels"][1])][int(params_json["pixels"][0])]
                ######
                #m, km ->cm   | m^2, km^2 -> cm | Radiance of the Sun   , use [m] so ->[cm]
                ref = ref*10/Lref
				#######
                if ref == NDV:
                    ref_arr.append(-1)
                else:
                    ref_arr.append(ref)

        if no_data_ref != 1:
            ref_csv = ",".join(map(str,ref_arr))
        else: # umemo spectralを表示しない
            ref_csv = -1

        field["pixels"] = params_json["pixels"]
        field["Image_size"] = [cube_data.RasterXSize, cube_data.RasterYSize]
        gt = cube_data.GetGeoTransform()
        srs = osr.SpatialReference()
        srs.ImportFromWkt(cube_data.GetProjection())
        srs2 = srs.CloneGeogCS()
        trans = osr.CoordinateTransformation(srs, srs2)

        x = gt[0]+(params_json["pixels"][0]*gt[1])+(params_json["pixels"][1]*gt[2])
        y = gt[3]+(params_json["pixels"][0]*gt[4])+(params_json["pixels"][1]*gt[5])
        x,y,z = trans.TransformPoint(x, y)

        field["coordinate"] = [x, y] # umemo pixel座標
        field["reflectance"] = ref_csv
        field["band_number"] = bandnumber_range
        band_bin_width = header['IsisCube']['BandBin']['Width']
        field["band_bin_width"] = ",".join(map(str,band_bin_width))
        field["band_bin_center"] = params_json["wavelength"]

        json_data = json.dumps(field)
        return json_data


    ######## CRISM #########
    elif params_json["obs_name"] == 'CRISM':
        field = cl.OrderedDict()
        field["obs_ID"] = params_json["obs_ID"]
        field["obs_name"] = params_json["obs_name"]
        field["path"] = params_json["path"]
        field["Image_path"] = params_json["Image_path"]

        cube_data = gdal.Open(field["path"]["main"]["cub"], gdal.GA_ReadOnly)
        bandnumber_range = list(range(cube_data.RasterCount))
        NDV = cube_data.GetRasterBand(1).GetNoDataValue()
        ref_arr = []
        no_data_ref = 1
        first = 0

        if cube_data.GetRasterBand(30).ReadAsArray()[int(params_json["pixels"][1])][int(params_json["pixels"][0])] == NDV:
            no_data_ref = 1
        else:
            no_data_ref = 0
            for bandnumber_i in bandnumber_range:
                if first == 0:
                    first = 1
                    continue
                ref = cube_data.GetRasterBand(bandnumber_i+1).ReadAsArray()[int(params_json["pixels"][1])][int(params_json["pixels"][0])]
                if ref == NDV:
                    ref_arr.append(-1)
                else:
                    ref_arr.append(ref)

        if no_data_ref != 1:
            ref_csv=",".join(list(map(str,ref_arr)))
        else:
            ref_csv = -1

        field["pixels"] = params_json["pixels"]
        field["Image_size"] = [cube_data.RasterXSize,cube_data.RasterYSize]
        field["reflectance"] = ref_csv
        bandnumber_range.pop(0)
        field["band_number"] = bandnumber_range
        field["band_bin_center"] = params_json["wavelength"]
        cube_data2 = gdal.Open(field["path"]["derived"]["cub"], gdal.GA_ReadOnly)
        x = cube_data2.GetRasterBand(5).ReadAsArray()[int(params_json["pixels"][1])][int(params_json["pixels"][0])]
        y = cube_data2.GetRasterBand(4).ReadAsArray()[int(params_json["pixels"][1])][int(params_json["pixels"][0])]
        field["coordinate"] = [float(x),float(y)]

        json_data = json.dumps(field)
        return json_data




from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect

@csrf_protect
def reflectance(request):
    params_json = json.loads(request.body)
    json_data = base_json_getRef(params_json)
    return HttpResponse(json_data)
