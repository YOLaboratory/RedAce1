//umemo 補助情報のダウンロードボタン、4つ
function download_xlsx_anc() {
    var options = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    };
    var workbook = {SheetNames: [], Sheets: {}};

    $('iframe').contents().find('table.ancillary').each(function (current, index) {
        var sheet_name = $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1);
        workbook.SheetNames.push(sheet_name);
        workbook.Sheets[sheet_name] = XLSX.utils.table_to_sheet(index, options);
    });

    var filename_ancillary = $('iframe').contents().find("div.infobox_name")[0].textContent + "_" + $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1) + ".xlsx";
    var wbout = XLSX.write(workbook, options);
    function make_xlsx(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }
    saveAs(new Blob([make_xlsx(wbout)], {type: 'application/octet-stream'}), filename_ancillary);
}

function download_csv_anc() {
    var anc_csv = "";
    $('iframe').contents().find('table.ancillary').each(function (current, index) {
        for (var i_down = 0; i_down < index.rows.length; i_down = i_down+2) {
            for (var j_down = 0; j_down < index.rows[i_down].cells.length; j_down++) {
                var index_t = index.rows[i_down+1].cells[j_down].innerText;
                var index_t2 = index.rows[i_down].cells[j_down].innerText;
                if (index_t != "NULL") {
                    if ( index_t.match(/,/))
                        index_t = '"' + index_t + '"';
                    anc_csv += index_t2.replace(/\r?\n/g, '') + "," + index_t.replace(/\r?\n/g, '') + ",";
                }
            }
        }
        anc_csv = anc_csv.slice(0, -1);
    });
    var filename_ancillary = $('iframe').contents().find("div.infobox_name")[0].textContent + "_" + $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1) + ".csv";
    var buf = new Uint8Array([0xEF, 0xBB, 0xBF]);
    saveAs(new Blob([ buf, anc_csv], { "type" : "text/csv" }), filename_ancillary);
}

function download_json_anc() {
    var anc_json = "{";
    $('iframe').contents().find('table.ancillary').each(function (current, index) {
        for (var i_down = 0; i_down < index.rows.length; i_down = i_down+2) {
            for (var j_down = 0; j_down < index.rows[i_down].cells.length; j_down++) {
                var index_t = index.rows[i_down+1].cells[j_down].innerText;
                var index_t2 = index.rows[i_down].cells[j_down].innerText;
                if (index_t != "NULL") {
                    index_t2 = '"' + index_t2 + '"';
                    if (isNaN(index_t)) {
                        index_t = '"' + index_t + '"';
                        anc_json += index_t2.replace(/\r?\n/g, '') + ":" + index_t.replace(/\r?\n/g, '') + ",";
                    } else {
                        index_t = Number(index_t);
                        anc_json += index_t2.replace(/\r?\n/g, '') + ":" + index_t + ",";
                    }
                }
            }
        }
        anc_json = anc_json.slice(0, -1);
        anc_json += "}"
    });
    var filename_ancillary = $('iframe').contents().find("div.infobox_name")[0].textContent + "_" + $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1) + ".json";
    saveAs(new Blob([anc_json], {type : 'application/json'}), filename_ancillary);
}


function download_pvl_anc() {
    var anc_pvl = [];
    anc_pvl.push(['SERVICE = "RED_ACE"\n']);
    anc_pvl.push(['OBJECT = ancillary\n']);
    $('iframe').contents().find('table.ancillary').each(function (current, index) {
        for (var i_down = 0; i_down < index.rows.length; i_down = i_down+2) {
            for (var j_down = 0; j_down < index.rows[i_down].cells.length; j_down++) {
                var index_t = index.rows[i_down+1].cells[j_down].innerText;
                var index_t2 = index.rows[i_down].cells[j_down].innerText;
                if (index_t != "NULL") {
                    var string_pvl = "";
                    if (isNaN(index_t)) {
                        index_t = '"' + index_t + '"';
                        string_pvl += "\t" + index_t2.replace(/\r?\n/g, '') + ' = ' + index_t.replace(/\r?\n/g, '') + '\n';
                        anc_pvl.push([string_pvl]);
                    } else {
                        index_t = Number(index_t);
                        string_pvl += '\t' + index_t2.replace(/\r?\n/g, '') + ' = ' + index_t + '\n';
                        anc_pvl.push([string_pvl]);
                    }
                }
            }
        }
        anc_pvl.push(['END_OBJECT = ancillary\n']);
        anc_pvl.push(['END\n']);
    });
    var filename_ancillary = $('iframe').contents().find("div.infobox_name")[0].textContent + "_" + $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1) + ".pvl";
    saveAs(new Blob(anc_pvl, {type : 'text/plain;charset=UTF-8'}), filename_ancillary);
}


// スペクトルプロットの下部ダウンロードボタン、CSVダウンロード
function download_csv_spectral(value) {
    // console.log(Chart_list[value].file_[0]);              　// 最初の[x,y]
    // console.log(Chart_list[value].file_[0].length);       // 2
    // console.log(Chart_list[value].user_attrs_.labels[0]); // band
    // console.log(Chart_list[value].user_attrs_.labels[1]); // frt00003621_07_if166l: E:-97.65137  N:24.90353
    // console.log(Chart_list[value].file_);                　// [[x,y],[x,y],...] (430)、データが少ない場合もある。
    // console.log(Chart_list[value].user_attrs_);           // Dygraphの設定

    // crismに関してはループ1回、他は分からん、残す必要あり。
    for ( var csv_i = 1; csv_i < Chart_list[value].file_[0].length; csv_i++ ) {
        // ダウンロード時のcsvファイル名作成
        // 例） Chart_list[value].user_attrs_.labels[csv_i] = "frt00003621_07_if166l: E:-97.65137  N:24.90353"
        var filename_spectral = Chart_list[value].user_attrs_.labels[csv_i] + ".csv";
        filename_spectral = filename_spectral.replace(/\s\s/g, "_"); // コロンの変換はしてないけど問題ないみたい。
        filename_spectral = filename_spectral.replace(/\s+/g, "");

        // x（波長）とy（反射率）をワンペア、データ構造は縦持ち
        var sp_csv = "";
        for (var csv_i2 in Chart_list[value].file_) { // x、yのペア、430回
            if (Chart_list[value].file_[csv_i2][csv_i] != null) {
                sp_csv += Chart_list[value].file_[csv_i2][0].toFixed(5) + "," + Chart_list[value].file_[csv_i2][csv_i] + "\n";
            }
        }

        // 型付き配列で、8ビット符号なし整数値の配列を表します, [0xEF,0xBB,0xBF]はバイトオーダマーク
        var buf = new Uint8Array([0xEF, 0xBB, 0xBF]);

        // Binary Large OBject, バイナリデータを表すオブジェクト
        saveAs(new Blob([ buf, sp_csv], { "type" : "text/csv" }), filename_spectral);
    }
}

/**
 * サムネイル画像ウィンドウのダウンロードボタン、csvダウンロード（全ピクセル）。
 * @param {*} data 
 */
function download_csv_spectral_allpixel(data) {
    var data_object = JSON.parse(data);
    console.log(data_object);

    var filename = data_object["obs_ID"] + ".csv";
    var sp_csv = "";

    // イメージサイズ[X, Y], バンド数
    sp_csv += data_object["Image_size"][0] + ",";
    sp_csv += data_object["Image_size"][1] + ",";
    sp_csv += data_object["band_number"] + "\n";
    // sp_csv += data_object["band_number"].length + "\n";

    // x座標(波長)
    wavelength_list = data_object["band_bin_center"].split(',');
    wavelength_list.map(Number);
    if (wavelength_list[0] > wavelength_list[wavelength_list.length - 1]) {
        wavelength_list.reverse();
    }
    for (var i = 0; i < data_object["band_number"]; i++) {
        sp_csv += wavelength_list[i] + ",";
    }
    sp_csv = sp_csv.slice(0, -1); // 最後のコンマ除去
    sp_csv += "\n";

    // y座標(反射率)
    // if (data_object["reflectance"] !== -1) {
    //     for (var i = 0; i < data_object["reflectance"].length; i++) { // バンド数(x、yのペア)
    //         sp_csv += wavelength_list[i] + ",";
    //     }
    // }
    // for (var i = 0; i < data_object["band_number"]; i++) {
    //     sp_csv += data_object["reflectance"][i] + "\n";
    // }

    // y座標(反射率)、1バンドのrefを全て取れる。
    for (var i = 0; i < data_object["Image_size"][1]; i++) {
        sp_csv += data_object["reflectance"][i] + "\n";
    }

    var buf = new Uint8Array([0xEF, 0xBB, 0xBF]);
    saveAs(new Blob([ buf, sp_csv], { "type" : "text/csv" }), filename);
}