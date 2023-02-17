#!/usr/bin/env python
# -*- coding: utf-8 -*-
# 松原さんRed AceのCGIから転載

import cgitb
cgitb.enable()

# import logging
import cgi
import os
import sys
import glob
import psycopg2

import pvl
import json
import numpy as np
import collections as cl
from osgeo import gdal,osr
from itertools import product
from pyproj import Proj, transform


##############     THEMIS    ############################
def GetExtent(gt,cols,rows):

    ext=[]
    xarr=[0,cols]
    yarr=[0,rows]

    for px in xarr:
        for py in yarr:
            x=gt[0]+(px*gt[1])+(py*gt[2])
            y=gt[3]+(px*gt[4])+(py*gt[5])
            ext.append([x,y])
			#print x,y
        yarr.reverse()
    return ext

def ReprojectCoords(coords,src_srs,tgt_srs):
    trans_coords=[]
    transform = osr.CoordinateTransformation( src_srs, tgt_srs)
    for x,y in coords:
        x,y,z = transform.TransformPoint(x,y)
        trans_coords.append([x,y])
        return trans_coords



###################################################################################
from paramiko import SSHClient, AutoAddPolicy
def base_json(params):
    params_json=params["properties"]
    geometry=params["geometry"]
    field=cl.OrderedDict()
    field["path"]=params_json["path"]["data"]
    field["obs_ID"]=params_json["id"]
    cube_data=gdal.Open(params_json["path"]["data"]["main"]["cub"], gdal.GA_ReadOnly) #######
    data=cl.OrderedDict()
    lbl_data=pvl.load(params_json["path"]["data"]["main"]["lbl"])     ###original load###

    # host="192.168.1.14"
    # user="fukuchi"
    # pswd="fi5p*cTZVzlv"
    # client = SSHClient()
    # client.set_missing_host_key_policy(AutoAddPolicy())
    # client.connect(host, username=user, password=pswd)
    # lbl=params_json["path"]["data"]["main"]["lbl"]
    #
    # stdin, stdout, stderr = client.exec_command("cd /home/fukuchi/src_python && python get_data.py %s" % lbl)
    # lbl_data_byte=stdout.read()
    # lbl_data=lbl_data_byte.decode().replace("\n", "\n")
    # print (lbl_data)
    # lbl_data=json.loads(lbl_data)

    ######## THEMIS ########
    if params_json["name"]=='themis':
        field["obs_name"]=str(lbl_data["UNCOMPRESSED_FILE"]["INSTRUMENT_ID"])

        data["MISSION_NAME"]=str(lbl_data["UNCOMPRESSED_FILE"]["MISSION_NAME"])
        data["INSTRUMENT_NAME"]=str(lbl_data["UNCOMPRESSED_FILE"]["INSTRUMENT_NAME"])
        data["DETECTOR_ID"]=str(lbl_data["UNCOMPRESSED_FILE"]["DETECTOR_ID"])
        data["SPACECRAFT_CLOCK_START_COUNT"]=str(lbl_data["UNCOMPRESSED_FILE"]["SPACECRAFT_CLOCK_START_COUNT"])
        data["SPACECRAFT_CLOCK_STOP_COUNT"]=str(lbl_data["UNCOMPRESSED_FILE"]["SPACECRAFT_CLOCK_STOP_COUNT"])
        data["SPACECRAFT_CLOCK_STOP_COUNT"]=str(lbl_data["UNCOMPRESSED_FILE"]["SPACECRAFT_CLOCK_STOP_COUNT"])
        data["START_TIME_ET"]=str(lbl_data["UNCOMPRESSED_FILE"]["START_TIME_ET"])
        data["STOP_TIME_ET"]=str(lbl_data["UNCOMPRESSED_FILE"]["STOP_TIME_ET"])
        data["ORBIT_NUMBER"]=str(lbl_data["UNCOMPRESSED_FILE"]["ORBIT_NUMBER"])
        data["MAP_RESOLUTION"]=str(lbl_data["IMAGE_MAP_PROJECTION"]["MAP_RESOLUTION"])

        center=lbl_data["UNCOMPRESSED_FILE"]['QUBE']['BAND_BIN']['BAND_BIN_CENTER']
        data["band_bin_center"]=",".join(map(str,center))
        field["ancillary"]=data
        data2=cl.OrderedDict()
        data2["Image_size"]=[cube_data.RasterXSize,cube_data.RasterYSize]
        field["Mapping"]=data2
        field["Image_path"]=params_json["path"]["image"]["thumbnail"] ###umemo JSON型で書かれたDBを参照してる
        field["Ratio_path_json"]=params_json["path"]["image"].get('ratio')
        field["geometry"]=geometry


    ######## CRISM #########
    elif params_json["name"]=='crism':
        field["obs_name"]=str(lbl_data["INSTRUMENT_ID"])
        data["PRODUCT_TYPE"]=str(lbl_data["PRODUCT_TYPE"])
        data["INSTRUMENT_HOST_NAME"]=str(lbl_data["INSTRUMENT_HOST_NAME"])
        data["SPACECRAFT_ID "]=str(lbl_data["SPACECRAFT_ID"])
        data["MRO:FRAME_RATE"]=" ".join(map(str,lbl_data["MRO:FRAME_RATE"]))
        data["MRO:EXPOSURE_PARAMETER"]=str(lbl_data["MRO:EXPOSURE_PARAMETER"])
        data["SOLAR_DISTANCE"]=" ".join(map(str,lbl_data["SOLAR_DISTANCE"]))

        filter_num=int(lbl_data['MRO:WAVELENGTH_FILTER']) + 1
        cdr=np.genfromtxt(params_json["path"]["data"]["derived"]["wavelength"], delimiter="," ,dtype=np.float,usecols=(1))
        filter_rf=np.genfromtxt(params_json["path"]["data"]["derived"]["filter"], delimiter=",",dtype=np.uint16,usecols=(filter_num))
        usedwv=[]
        num_band=1
        while num_band <filter_rf.shape[0]:
            if filter_rf[num_band]==1:
                usedwv.append(cdr[num_band]/1000)
            num_band = num_band+1

        data["band_bin_center"]= ",".join(map(str, usedwv))
        data2=cl.OrderedDict()
        data2["Image_size"]=[cube_data.RasterXSize,cube_data.RasterYSize]
        field["Mapping"]=data2
        field["Image_path"]=params_json["path"]["image"]["thumbnail"]
        field["Ratio_path_json"]=params_json["path"]["image"].get('ratio')
        field["geometry"]=geometry
    else:
        return "NOdata"

    data["StartTime"]=str(lbl_data["Caminfo"]["Geometry"]["StartTime"])
    data["EndTime"]=str(lbl_data["Caminfo"]["Geometry"]["EndTime"])
    data["CenterLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["CenterLatitude"])
    data["CenterLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["CenterLongitude"])
    data["CenterRadius"]=str(lbl_data["Caminfo"]["Geometry"]["CenterRadius"])
    data["RightAscension"]=str(lbl_data["Caminfo"]["Geometry"]["RightAscension"])
    data["Declination"]=str(lbl_data["Caminfo"]["Geometry"]["Declination"])
    data["UpperLeftLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["UpperLeftLongitude"])
    data["UpperLeftLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["UpperLeftLatitude"])
    data["LowerLeftLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["LowerLeftLongitude"])
    data["LowerLeftLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["LowerLeftLatitude"])
    data["LowerRightLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["LowerRightLongitude"])
    data["LowerRightLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["LowerRightLatitude"])
    data["UpperRightLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["UpperRightLongitude"])
    data["UpperRightLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["UpperRightLatitude"])

    data["PhaseAngle"]=str(lbl_data["Caminfo"]["Geometry"]["PhaseAngle"])
    data["EmissionAngle"]=str(lbl_data["Caminfo"]["Geometry"]["EmissionAngle"])
    data["IncidenceAngle"]=str(lbl_data["Caminfo"]["Geometry"]["IncidenceAngle"])
    data["NorthAzimuth"]=str(lbl_data["Caminfo"]["Geometry"]["NorthAzimuth"])
    data["OffNadir"]=str(lbl_data["Caminfo"]["Geometry"]["OffNadir"])
    data["SolarLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["SolarLongitude"])
    data["LocalTime"]=str(lbl_data["Caminfo"]["Geometry"]["LocalTime"])
    data["TargetCenterDistance"]=str(lbl_data["Caminfo"]["Geometry"]["TargetCenterDistance"])
    data["SlantDistance"]=str(lbl_data["Caminfo"]["Geometry"]["SlantDistance"])
    data["SampleResolution"]=str(lbl_data["Caminfo"]["Geometry"]["SampleResolution"])
    data["LineResolution"]=str(lbl_data["Caminfo"]["Geometry"]["LineResolution"])
    data["PixelResolution"]=str(lbl_data["Caminfo"]["Geometry"]["PixelResolution"])
    data["MeanGroundResolution"]=str(lbl_data["Caminfo"]["Geometry"]["MeanGroundResolution"])
    data["SubSolarAzimuth"]=str(lbl_data["Caminfo"]["Geometry"]["SubSolarAzimuth"])
    data["SubSolarGroundAzimuth"]=str(lbl_data["Caminfo"]["Geometry"]["SubSolarGroundAzimuth"])
    data["SubSolarLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["SubSolarLatitude"])
    data["SubSolarLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["SubSolarLongitude"])
    data["SubSpacecraftAzimuth"]=str(lbl_data["Caminfo"]["Geometry"]["SubSpacecraftAzimuth"])
    data["SubSpacecraftGroundAzimuth"]=str(lbl_data["Caminfo"]["Geometry"]["SubSpacecraftGroundAzimuth"])
    data["SubSpacecraftLatitude"]=str(lbl_data["Caminfo"]["Geometry"]["SubSpacecraftLatitude"])
    data["SubSpacecraftLongitude"]=str(lbl_data["Caminfo"]["Geometry"]["SubSpacecraftLongitude"])
    data["ParallaxX"]=str(lbl_data["Caminfo"]["Geometry"]["ParallaxX"])
    data["ParallaxY"]=str(lbl_data["Caminfo"]["Geometry"]["ParallaxY"])
    data["ShadowX"]=str(lbl_data["Caminfo"]["Geometry"]["ShadowX"])
    data["ShadowY"]=str(lbl_data["Caminfo"]["Geometry"]["ShadowY"])

    field["ancillary"]=data
    json_data=json.dumps(field)
    return json_data



###########################################################################
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect

@csrf_protect
def dir(request):
    params_json = json.loads(request.body)
    json_data = base_json(params_json)
    return HttpResponse(json_data)
