import sys


from osgeo import gdal #,osr
import numpy as np
import cv2
import pvl
import os,sys
import glob
# import ppygis
import psycopg2
from psycopg2.extras import Json
# from postgis import geometry
# from shapely import wkb




def position(trr,ddr,thu):##umemo Polygon取得
	###################
	FileName = trr + ".cub"
	FileName2 = ddr + ".cub"
	###################

	# gdal.UseExceptions()  
	dataset = gdal.Open(FileName, gdal.GA_ReadOnly)

	kind = trr[134:137]################u
	if kind == "msp" or kind == "msw":
		NDV=dataset.GetRasterBand(1).GetNoDataValue()#MSWなどは30バンド無い
		Array=dataset.GetRasterBand(1).ReadAsArray()
	else :
		NDV=dataset.GetRasterBand(30).GetNoDataValue()
		Array=dataset.GetRasterBand(30).ReadAsArray()
	# print len(Array[0])
	# print len(Array)

	arr = [[0 for i in range(len(Array[0])+2)] for j in range(len(Array)+2)]
	xx=int(len(Array))+1
	yy=int(len(Array[0]))+1
	arr_np=np.asarray(arr)

	Array[Array != NDV] =225
	Array[Array == NDV] =0
	arr_np[1:xx,1:yy]=Array

	# print Array

	Array=arr_np

	# print len(Array[0])
	# print len(Array)

	Array=Array.astype(np.uint8)

	im=cv2.imread('thu')
	# ,hierarchy
	# gt,
	contours,hierarchy = cv2.findContours(Array,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)

	obsArea_i=0
	obsArea=0
	for i in range(len(contours)):
		area=cv2.contourArea(contours[i]);
		if area>=obsArea:
			obsArea_i=i

	corners=0
	width = 0.011

	while corners < 4:
		width = width - 0.001
		epsilon = width*cv2.arcLength(contours[obsArea_i],True)
		approx = cv2.approxPolyDP(contours[obsArea_i],epsilon,True)
		corners = len(approx)

	test_list=[]

	for x,y in approx[:,0]:
		xi=x-1
		yi=y-1
		test_list.append([xi,yi])

	dataset2 = gdal.Open(FileName2, gdal.GA_ReadOnly)


	lat_layer=dataset2.GetRasterBand(4)
	lon_layer=dataset2.GetRasterBand(5)


	lat_array=lat_layer.ReadAsArray()
	lon_array=lon_layer.ReadAsArray()


	test2_list=[]

	test2_list.append([lon_array[test_list[0][1]][test_list[0][0]],lat_array[test_list[0][1]][test_list[0][0]]])
	polygon = "Polygon(({0:.6f} {1:.6F}".format(test2_list[0][0],test2_list[0][1])


	for i in range(len(test_list)-1):
		test2_list.append([lon_array[test_list[i+1][1]][test_list[i+1][0]],lat_array[test_list[i+1][1]][test_list[i+1][0]]])
		polygon = polygon + ", {0:.6f} {1:.6F}".format(test2_list[i+1][0],test2_list[i+1][1])

	polygon = polygon + ", {0:.6f} {1:.6f}))".format(test2_list[0][0],test2_list[0][1])
	# print polygon

	return polygon










args = sys.argv
print(args[1])#trr  /mnt/mars_data/...  ...trr3
print(args[2])#drr  /mnt/mars_data/...  ...drr1
print(args[3])#png  /mnt/mars_data/...  ...png

x = position(args[1],args[2],args[3])

print(x)

##umemo Point取得
mnt_lbl = args[1] + ".lbl"
lbl = pvl.load(mnt_lbl)
point = "Point({0:.6f} {1:.6F})".format(lbl['Caminfo']['Geometry']['CenterLongitude'], lbl['Caminfo']['Geometry']['CenterLatitude'])
print(point)


print(lbl['Caminfo']['Geometry']['PhaseAngle'])
print(lbl['Caminfo']['Geometry']['EmissionAngle'])
print(lbl['Caminfo']['Geometry']['IncidenceAngle'])
print(lbl['Caminfo']['Geometry']['TargetCenterDistance'])
print(lbl['Caminfo']['Geometry']['SlantDistance'])
