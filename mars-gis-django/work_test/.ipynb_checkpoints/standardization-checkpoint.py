#規格化, Standardization
#成功, THEMIS
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import csv

print("Function: Spectral Standardization\n")
csvfile_base = sys.argv[1] #csvファイルを引数
csvfile_2nd = sys.argv[2]
print("File name\n"+csvfile_base+" -Base-\n"+csvfile_2nd+" -2nd-\n")

with open(csvfile_base, encoding='utf-8-sig') as f:
    reader = csv.reader(f, quoting=csv.QUOTE_NONNUMERIC)#文字列をfloat型に変換
    spectral_list1 = [row for row in reader]
with open(csvfile_2nd, encoding='utf-8-sig') as f:
    reader = csv.reader(f, quoting=csv.QUOTE_NONNUMERIC)#文字列をfloat型に変換
    spectral_list2 = [row for row in reader]
    
spectral_array1 = np.array(spectral_list1)            #list型をNumPy配列に変換
spectral_array2 = np.array(spectral_list2)
n = int(spectral_array1.size/2)                      #要素数の半分を取得
spectral_array1_2 = spectral_array1.reshape([n,2])    #1行20列配列を10行2列配列に変換
spectral_array2_2 = spectral_array2.reshape([n,2]) 
spectral_array1_2_x = spectral_array1_2[:, 0]         #1列目の全ての行を抽出
spectral_array1_2_y = spectral_array1_2[:, 1]         #2列目の全ての行を抽出
spectral_array2_2_y = spectral_array2_2[:, 1]
division = spectral_array2_2_y / spectral_array1_2_y

print("y: reflectance -base-")
print(spectral_array1_2_y)
print("y: reflectance -2nd-")
print(spectral_array2_2_y)

print("\nx: wavelength")
print(spectral_array1_2_x)
print("\ny: reflectance -standardization_2nd/base-")
print(division)
print("\n")

plt.plot(spectral_array1_2_x, division, marker=".")
plt.xlabel('Wavelength [nm]')
plt.ylabel('Reflentance')
plt.title('Spectral Standardization')