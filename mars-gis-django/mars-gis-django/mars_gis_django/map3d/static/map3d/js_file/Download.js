//umemo 補助情報のダウンロードボタン、4つ
function download_xlsx_anc() {
    var wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    };
    var workbook = {SheetNames: [], Sheets: {}};

    $('iframe').contents().find('table.ancillary').each(function (current, index) {
        var sheet_name = $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1);
        workbook.SheetNames.push(sheet_name);
        workbook.Sheets[sheet_name] = XLSX.utils.table_to_sheet(index, wopts);
    });

    var filename_ancillary = $('iframe').contents().find("div.infobox_name")[0].textContent + "_" + $('iframe').contents().find("div.infobox_name").prevObject.prevObject[0].offsetParent.textContent.slice(0, -1) + ".xlsx";
    var wbout = XLSX.write(workbook, wopts);
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


//umemo スペクトルプロットの下部ダウンロードボタン、CSVダウンロード
function download_csv_spectral(value) {
    for ( var csv_i = 1; csv_i < Chart_list[value].file_[0].length; csv_i++ ) {
        var filename_spectral = Chart_list[value].user_attrs_.labels[csv_i] + ".csv";
        var sp_csv = "";
        for (var csv_i2 in Chart_list[value].file_) {
            if (Chart_list[value].file_[csv_i2][csv_i] != null) {
                //umemo XとYを交互に一列で入れている
                sp_csv += Chart_list[value].file_[csv_i2][0] + "," + Chart_list[value].file_[csv_i2][csv_i] + ",";
            }
        }
        filename_spectral = filename_spectral.replace(/\s\s/g, "_");
        filename_spectral = filename_spectral.replace(/\s+/g, "");
        sp_csv = sp_csv.slice(0, -1);//umemo リストの中身取り出す、 構文 >> arr.slice([start[, end]]), 最後のコンマ除去
        console.log(sp_csv);

        var buf = new Uint8Array([0xEF, 0xBB, 0xBF]);//umemo 型付き配列で、8ビット符号なし整数値の配列を表します, [0xEF,0xBB,0xBF]はバイトオーダマーク
        saveAs(new Blob([ buf, sp_csv], { "type" : "text/csv" }), filename_spectral);//umemo Binary Large OBject, バイナリデータを表すオブジェクト
    }
}

