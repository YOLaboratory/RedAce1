#THEMIS
#結果のみ返すバージョン
import sys
import numpy as np
import pandas as pd
import bottleneck as bn
import matplotlib.pyplot as plt
import csv

#csvファイルから
#spectralのx軸y軸(class:tupple)を取得
def get_spectral(csvfile): 
    with open(csvfile, encoding='utf-8-sig') as f:
        reader = csv.reader(f, quoting=csv.QUOTE_NONNUMERIC)#文字列をfloat型に変換
        spectral_list = [row for row in reader]
        
    spectral_array = np.array(spectral_list)            #list型をNumPy配列に変換
    n = int(spectral_array.size/2)                      #要素数の半分を取得
    spectral_array_2 = spectral_array.reshape([n,2])    #1行20列配列を10行2列配列に変換
    spectral_array_2_x = spectral_array_2[:, 0]         #1列目の全ての行を抽出
    spectral_array_2_y = spectral_array_2[:, 1]         #2列目の全ての行を抽出
    return (spectral_array_2_x, spectral_array_2_y)


#規格化
#spectralのx軸y軸(array)を取得
def normalization(csvfile_base, csvfile_2nd):
    if type(csvfile_base) is str:
        base = get_spectral(csvfile_base)
        second = get_spectral(csvfile_2nd)
    else:
        base = csvfile_base
        second = csvfile_2nd
    n1 = base[0].size
    n2 = second[0].size
    
    if n1 != n2:
        if n1 > n2:
            nl = base[0]
            arrl = base[1]
            ns = second[0]
            arrs = second[1]
        else:
            nl = second[0]
            arrl = second[1]
            ns = base[0]
            arrs = base[1]
    
        lx = []
        ly = []
        c = []
        count = 0
        num = 0
        for x1 in nl:
            for x2 in ns:
                if x1 == x2:
                    num = 1
                    break
            if num == 0:
                c = np.append(c, count)
            else:
                num = 0
            count += 1
        c = c.astype(int)
        arrs = np.float_(arrs)
        for c in c:
            arrs = np.insert(arrs, c, np.nan)
            
        if arrl.all == base[1].all:
            division = arrs / arrl
        else:
            division = arrl / arrs
    else:
        nl = base[0]
        division = second[1]/base[1]
            
    # division = second[1] / base[1]
    return (nl, division)


#移動平均
#spectralのx軸y軸(array,2つ)を取得
def moving_avg(csvfile, width):
    if type(csvfile) is str: 
        arr = get_spectral(csvfile)
    else:
        arr = csvfile
    def rollavg_bottlneck(a,n):
        return bn.move_mean(a, window=n, min_count = None)
    mavg = rollavg_bottlneck(arr[1], width)
    if width%2 == 0:
        w = int(width/2-1)
    else:
        w = int(width/2)
    mavg_r = np.roll(mavg, -w)
    return (arr[0], arr[1], arr[0], mavg_r)
    
    
#スタッキング(現状ver)...for文で使用
# def stack_csv(arr_base, csvfile_add):#Unused
#     arr_add = get_spectral(csvfile_add)
#     if arr_base[1].ndim == 1:#次元数が1なら、つまり最初
#         arr_y = np.stack([arr_base[1], arr_add[1]])
#     else:
#         arr_add_y = arr_add[1].reshape(1, -1)
#         arr_y = np.append(arr_base[1], arr_add_y, axis=0)
#     return (arr_base[0], arr_y)

def stack_arrcsv(arr, csv):#Use
    arrcsv = get_spectral(csv)
    vs = np.vstack([arr[1], arrcsv[1]])
    return (arr[0], vs)

def mean_arr(stack_arr):#Use
    arr_mean = np.mean(stack_arr[1], axis=0)
    return (stack_arr[0], arr_mean)

def stacking(*csv):#test220131,Use
    count = 0
    for csv in csv:
        if type(csv) is str:
            arrcsv = get_spectral(csv)
        else:
            arrcsv = csv
        if count == 0:
            arrx = arrcsv[0]
            vs = arrcsv[1]
            count = 1
        else:
            vs = np.vstack([vs, arrcsv[1]])
    def mean_st(vs):
        arr_mean = np.mean(vs, axis=0)
        return (arr_mean)
    m = mean_st(vs)
    # print(m)
    # print(vs)
    return (arrx, m)

###
# def stacking(csvfile_base, csvfile_2nd):
#     base = get_spectral(csvfile_base)
#     second = get_spectral(csvfile_2nd)
#     stack_arr = np.stack([base[1], 2nd[1]])#一つ一つのスペクトラルのリストを一つの配列にする
#     arr_mean = np.mean(stack_arr, axis=0)   #配列方向に平均を取る
#     return (base[0], arr_mean)
###


#2次元配列からグラフ作成
def spectralplot(array):
    array = iter(array)
    count = 1
    for x, y in zip(array, array):#一度に配列2つ使用
        num = str(count)
        lbl = "No."+num
        plt.plot(x, y, label=lbl)
        count += 1
    plt.legend()
    plt.grid()
    plt.xlabel('Wavelength [µm]')
    plt.ylabel('Reflentance')
    plt.title('Spectral')
    
    
    
  