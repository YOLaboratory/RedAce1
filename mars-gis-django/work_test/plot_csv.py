#THEMIS
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import csv

print("Function: Spectral Plot\n")
csvfile = sys.argv[1] #csvファイルを引数
print("File name\n"+csvfile+"\n")

with open(csvfile, encoding='utf-8-sig') as f:
    reader = csv.reader(f, quoting=csv.QUOTE_NONNUMERIC)#文字列をfloat型に変換
    spectral_list = [row for row in reader]
    
spectral_array = np.array(spectral_list)            #list型をNumPy配列に変換
n = int(spectral_array.size/2)                      #要素数の半分を取得
spectral_array_2 = spectral_array.reshape([n,2])    #1行20列配列を10行2列配列に変換
spectral_array_2_x = spectral_array_2[:, 0]         #1列目の全ての行を抽出
spectral_array_2_y = spectral_array_2[:, 1]         #2列目の全ての行を抽出

print("x: wavelength")
print(spectral_array_2_x)
print("\ny: reflectance")
print(spectral_array_2_y)

plt.plot(spectral_array_2_x, spectral_array_2_y, marker=".")
plt.xlabel('Wavelength [nm]')
plt.ylabel('Reflentance')
plt.title('Spectral')