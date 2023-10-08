// 補助情報のダウンロードボタン、4つ
function createAncillaryArray() {
    let data = [];
    let tr = $('iframe').contents().find('table.ancillary tr'); //全行を取得
    for (let i = 0, l = tr.length; i < l; i++) {
        let cells = tr.eq(i).children(); //1行目から順にth、td問わず列を取得
        for (let j = 0, m = cells.length; j < m; j++) {
            if (typeof data[i] == 'undefined') data[i] = [];
            data[i][j] = cells.eq(j).text(); //i行目j列の文字列を取得
        }
    }

    let dataNew = [];
    for (let i = 0; i < data.length; i = i + 2) {
        for (let j = 0; j < 3; j++) {
            if (data[i][j] != 'NULL') {
                dataNew.push([data[i][j], data[i + 1][j]]);
            }
        }
    }

    return dataNew;
}

function downloadAncXLSX() {
    let data = createAncillaryArray();
    let obsID = $('.cesium-infoBox-title').text();
    let filename = `${obsID}_AncInfo.xlsx`;

    function sheet_to_workbook(sheet, opts) {
        var n = opts && opts.sheet ? opts.sheet : 'Sheet1';
        var sheets = {};
        sheets[n] = sheet;
        return { SheetNames: [n], Sheets: sheets };
    }

    function aoa_to_workbook(data, opts) {
        return sheet_to_workbook(XLSX.utils.aoa_to_sheet(data, opts), opts);
    }

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }

    var wb_out = XLSX.write(aoa_to_workbook(data), { type: 'binary' });

    saveAs(new Blob([s2ab(wb_out)], { type: 'application/octet-stream' }), filename);
}

function downloadAncJSON() {
    let data = createAncillaryArray();
    var json = {};
    for (let i = 0; i < data.length; i++) {
        json[data[i][0]] = isNaN(data[i][1]) ? data[i][1] : Number(data[i][1]);
    }
    json = JSON.stringify(json, undefined, 1);

    let obsID = $('.cesium-infoBox-title').text();
    let filename = `${obsID}_AncInfo.json`;
    saveAs(new Blob([json], { type: 'application/json' }), filename);
}

function downloadAncCSV() {
    let data = createAncillaryArray();
    let csv = '';
    for (let i = 0; i < data.length; i++) {
        csv += `${data[i][0]},${data[i][1]}\n`;
    }

    let obsID = $('.cesium-infoBox-title').text();
    let filename = `${obsID}_AncInfo.csv`;
    let buf = new Uint8Array([0xef, 0xbb, 0xbf]);
    saveAs(new Blob([buf, csv], { type: 'text/csv' }), filename);
}

function downloadAncPVL() {
    let data = createAncillaryArray();
    let pvl = [];
    let str = '';

    pvl.push(['SERVICE = "RED_ACE"\n']);
    pvl.push(['OBJECT = ancillary\n']);
    for (let i = 0; i < data.length; i++) {
        str = isNaN(data[i][1]) ? `\t${data[i][0]} = ${data[i][1]}\n` : `\t${data[i][0]} = ${Number(data[i][1])}\n`;
        pvl.push([str]);
    }
    pvl.push(['END_OBJECT = ancillary\n']);
    pvl.push(['END\n']);

    let obsID = $('.cesium-infoBox-title').text();
    let filename = `${obsID}_AncInfo.pvl`;
    saveAs(new Blob(pvl, { type: 'text/plain;charset=UTF-8' }), filename);
}

// スペクトルプロットの下部ダウンロードボタン、CSVダウンロード
function download_csv_spectral(value) {
    // console.log(chartList[value].file_[0]);              　// 最初の[x,y]
    // console.log(chartList[value].file_[0].length);       // 2
    // console.log(chartList[value].user_attrs_.labels[0]); // band
    // console.log(chartList[value].user_attrs_.labels[1]); // frt00003621_07_if166l: E:-97.65137  N:24.90353
    // console.log(chartList[value].file_);                　// [[x,y],[x,y],...] (430)、データが少ない場合もある。
    // console.log(chartList[value].user_attrs_);           // Dygraphの設定

    // Lockした時のループ
    for (var csv_i = 1; csv_i < chartList[value].file_[0].length; csv_i++) {
        // ダウンロード時のcsvファイル名作成
        // 例） chartList[value].user_attrs_.labels[csv_i] = "frt00003621_07_if166l: E_-97.65137 N_24.90353"
        var filename_spectral = chartList[value].user_attrs_.labels[csv_i] + '.csv';
        filename_spectral = filename_spectral.replace(' ', '_'); // コロンの変換はしてないけど問題ないみたい。
        filename_spectral = filename_spectral.replace(':', '');

        // x（波長）とy（反射率）をワンペア、データ構造は縦持ち
        var sp_csv = '';
        sp_csv += 'wavelength[μm],' + 'reflectance\n';
        for (var csv_i2 in chartList[value].file_) {
            // x、yのペア、430回
            if (chartList[value].file_[csv_i2][csv_i] != null) {
                sp_csv +=
                    chartList[value].file_[csv_i2][0].toFixed(5) + ',' + chartList[value].file_[csv_i2][csv_i] + '\n';
            }
        }

        // 型付き配列で、8ビット符号なし整数値の配列を表します, [0xEF,0xBB,0xBF]はバイトオーダマーク
        var buf = new Uint8Array([0xef, 0xbb, 0xbf]);

        // Binary Large OBject, バイナリデータを表すオブジェクト
        saveAs(new Blob([buf, sp_csv], { type: 'text/csv' }), filename_spectral);
    }
}

function download_csv_roi_area(data) {
    let dataObj = JSON.parse(data);
    let wav_array = dataObj['band_bin_center'];
    let ref_array = dataObj['reflectance'];
    let band_size = wav_array.length;
    let px_size = ref_array.length;
    let obs_id = dataObj['obs_ID'];
    let coordinate = dataObj['coordinate'];
    let filename = `${obs_id}_E_${coordinate[0]}_N_${coordinate[1]}.csv`;

    console.log('download_csv_roi_area');
    console.log(dataObj);

    // Header
    let csv = 'wavelength[μm]';
    for (let j = 1; j <= px_size; j++) {
        csv += `,reflectance${j}`;
    }
    csv += '\n';

    // Spectral Data
    for (let i = 0; i < band_size; i++) {
        csv += wav_array[i];
        for (let j = 0; j < px_size; j++) {
            if (ref_array[j][i] !== -1) {
                csv += `,${ref_array[j][i]}`;
            } else {
                csv += ',' + NaN;
            }
        }
        csv += '\n';
    }

    let buf = new Uint8Array([0xef, 0xbb, 0xbf]);
    saveAs(new Blob([buf, csv], { type: 'text/csv' }), filename);
}

/**
 * サムネイル画像ウィンドウのダウンロードボタン、csvダウンロード（全ピクセル）。
 * @param {*} data
 */
function download_csv_spectral_allpixel(data) {
    var dataObj = JSON.parse(data);
    console.log(dataObj);

    var filename = dataObj['obs_ID'] + '.csv';
    var sp_csv = '';

    // イメージサイズ[X, Y], バンド数
    sp_csv += dataObj['Image_size'][0] + ',';
    sp_csv += dataObj['Image_size'][1] + ',';
    sp_csv += dataObj['band_number'] + '\n';
    // sp_csv += dataObj["band_number"].length + "\n";

    // x座標(波長)
    wavelength_list = dataObj['band_bin_center'].split(',');
    wavelength_list.map(Number);
    if (wavelength_list[0] > wavelength_list[wavelength_list.length - 1]) {
        wavelength_list.reverse();
    }
    for (var i = 0; i < dataObj['band_number']; i++) {
        sp_csv += wavelength_list[i] + ',';
    }
    sp_csv = sp_csv.slice(0, -1); // 最後のコンマ除去
    sp_csv += '\n';

    // y座標(反射率)
    // if (dataObj["reflectance"] !== -1) {
    //     for (var i = 0; i < dataObj["reflectance"].length; i++) { // バンド数(x、yのペア)
    //         sp_csv += wavelength_list[i] + ",";
    //     }
    // }
    // for (var i = 0; i < dataObj["band_number"]; i++) {
    //     sp_csv += dataObj["reflectance"][i] + "\n";
    // }

    // y座標(反射率)、1バンドのrefを全て取れる。
    for (var i = 0; i < dataObj['Image_size'][1]; i++) {
        sp_csv += dataObj['reflectance'][i] + '\n';
    }

    var buf = new Uint8Array([0xef, 0xbb, 0xbf]);
    saveAs(new Blob([buf, sp_csv], { type: 'text/csv' }), filename);
}
