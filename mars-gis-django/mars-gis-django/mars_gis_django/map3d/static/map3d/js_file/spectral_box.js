var saveNum = 0;
var lockNum = -1;
var chartList = [];
var dataSave = [[], [], []];
var graphCounter = 1;

function displaySpectralBox(data) {
    let dataObj = JSON.parse(data);
    console.log(dataObj);

    let funcArea, graphArea;
    function createFuncArea() {
        funcArea = document.getElementById('graph_move');
        funcArea.style.width = '100%';
        funcArea.style.height = '600px';
        funcArea.style.background = 'rgba(5,5,5,0.6)';
    }
    function createArea(classTabName) {
        graphArea = document.getElementsByClassName(classTabName.toString())[0];
        graphArea.style.background = 'rgb(232, 231, 231)';
        graphArea.style.position = 'absolute';
        graphArea.style.width = '650px';
        graphArea.style.height = '490px';
    }
    function setLockElement() {
        if (chartList.length == 0) {
            let down_ref_div2 = document.createElement('div');
            down_ref_div2.innerHTML = `
                    <div class="lock_type">
                        <label><input type="radio" id="Lock1" value=1 name="Lock" >Lock 1</label>
                        <label><input type="radio" id="Lock2" value=2 name="Lock" disabled="disabled">Lock 2</label>
                        <label><input type="radio" id="Lock3" value=3 name="Lock" disabled="disabled">Lock 3</label>
                        <label><input type="radio" id="graph_FIFO" name="Lock" value=-1 checked>FIFO</label>
                    </div>`;
            funcArea.appendChild(down_ref_div2);
        } else if (chartList.length == 1) {
            document.getElementById('Lock2').disabled = false;
        } else if (chartList.length == 2) {
            document.getElementById('Lock3').disabled = false;
        }
    }
    function createFuncElement() {
        if (chartList.length != 3 && downCheckList.indexOf(graphCounter) == -1) {
            let counter = graphCounter - 1;
            downCheckList.push(graphCounter);

            // スペクトルプロットの下部ダウンロードボタン生成
            var htmlDownloadButton = document.createElement('div');
            htmlDownloadButton.innerHTML = `
                <div class="download_button" onclick="download_csv_spectral(${counter});">Download</div>`;

            // スペクトルプロットの下部メモ欄生成
            htmlSaveMemo = document.createElement('div');
            htmlSaveMemo.innerHTML = `
                <input type="text" id="save_memo_${graphCounter}" value="" placeholder=" Jot your note down here." />`;

            // スペクトルプロットのリスト保存ボタン生成
            htmlSaveButton = document.createElement('div');
            let id = `save_spectral_${graphCounter}`;
            htmlSaveButton.innerHTML = `
                <div class="save_button" id="${id}" onclick="save_spectral(${counter});">Save to list</div>`;

            let idTabName = `graph_${graphCounter}_content`;
            document.getElementById(idTabName).appendChild(htmlDownloadButton);
            document.getElementById(idTabName).appendChild(htmlSaveMemo);
            document.getElementById(idTabName).appendChild(htmlSaveButton);
        }
    }

    if (dataObj['reflectance'] !== -1) {
        // if (dataObj['type'] === 'DIRECT') {
        let band = 0;
        let wav_arr = dataObj['band_bin_center'].split(','); // Wavelength
        let ref_arr = dataObj['reflectance'].split(',');
        graphList.length = 0;

        // スペクトル要素を配列に格納
        for (let i = 0; i < dataObj['band_number'].length; i++) {
            graphList[band] = new Array();
            graphList[band][0] = Number(wav_arr[i]);
            graphList[band][1] = Number(ref_arr[i]) !== -1 ? Number(ref_arr[i]) : NaN;
            band += 1;
        }
        // }
        graphList = graphList.filter((n) => n.length > 0);

        if (flag_ref_position) {
            $('html,body').animate({
                scrollTop: $('#graph_move').offset().top - 100,
            });
            flag_ref_position = false;
        }

        createFuncArea();
        setLockElement();

        let lockCheck = Number($('input[name=Lock]:checked').val());
        if (lockCheck != -1) {
            lockNum = lockCheck;
            graphCounter = lockNum;
            saveNum = lockNum;
            dataSave[saveNum - 1].push(dataObj);
        } else {
            lockNum = -1;
            saveNum += 1;
            if (saveNum >= 4) saveNum = 1;
            if (dataSave[saveNum - 1].length >= 1) dataSave[saveNum - 1] = [];
            dataSave[saveNum - 1].push(dataObj);
        }

        // ###########################
        let htmlDownloadType = document.createElement('div');
        htmlDownloadType.innerHTML = `
            <div class="download_type">
                <label><input type="radio" id="one_file" value="one" name="download_type" checked> In one file</label>
                <label><input type="radio" id="each_file" value="each" name="download_type"> In each file</label>
            </div>`;
        funcArea.appendChild(htmlDownloadType);

        // radioボタンの切り替え
        let radioDownloadType = document.querySelectorAll(`input[type='radio'][name='download_type']`);
        for (let target of radioDownloadType) {
            target.addEventListener('change', () => {});
        }
        // 途中
        let elementDownloadType = document.getElementsByName('download_type');
        let checkValueDownloadType = '';
        for (let i = 0; i < elementDownloadType.length; i++) {
            if (elementDownloadType.item(i).checked) {
                checkValueDownloadType = elementDownloadType.item(i).value;
            }
        }
        // ###########################

        createArea(`graph${graphCounter}`);
        createFuncElement();

        let titleLon = dataObj['coordinate'][0].toFixed(5);
        let titleLat = dataObj['coordinate'][1].toFixed(5);
        let graphLabels = ['band', `${dataObj['obs_ID']}: E_${titleLon} N_${titleLat}`];

        let hasLock2 = lockNum == 2 && chartList.length >= 2 ? true : false;
        let hasLock3 = lockNum == 3 && chartList.length >= 3 ? true : false;

        if (chartList.length != 0 && (lockNum == 1 || hasLock2 || hasLock3)) {
            var preSpectralArr = chartList[lockNum - 1].file_.concat();
            [graphList, preSpectralArr] = [preSpectralArr, graphList];

            // crismとthemis 合体

            // 配列 previousとgraph が前段階でswapされていることに注意
            var graphList2 = graphList.concat(); //積む前
            var graphList3 = preSpectralArr.concat(); //新しい
            var spectrumNum = graphList2[0].length - 1; //スペクトルの数？
            var graphListTmp = [];

            for (let i = 0; i < graphList2.length; i++) {
                graphListTmp.push(graphList2[i].concat());
                graphListTmp[i].push(null); //?
            }

            for (let i = 0; i < graphList3.length; i++) {
                for (let j = 0; j < graphListTmp.length; j++) {
                    if (graphList3[i][0] == graphListTmp[j][0]) {
                        var last_number = graphListTmp[j].pop();

                        if (last_number == null) {
                            graphListTmp[j].push(graphList3[i][1]);
                            break;
                        } else {
                            graphListTmp[j].push(last_number);
                        }
                    } else {
                        if (graphListTmp.length - 1 == j) {
                            var null_arr = Array.apply(null, Array(spectrumNum)).map(function () {
                                return null;
                            });
                            Array.prototype.splice.apply(graphList3[i], [1, 0].concat(null_arr));
                            graphListTmp.push(graphList3[i]);
                            break;
                        }
                    }
                }
            }

            graphList = graphListTmp.sort(function (a, b) {
                return a[0] - b[0];
            });
            let preSpectralId = chartList[lockNum - 1].user_attrs_.labels.concat();
            [graphLabels, preSpectralId] = [preSpectralId, graphLabels];
            graphLabels.push(preSpectralId[1]);
        }

        if (chartList.length >= graphCounter) {
            chartList[graphCounter - 1].destroy();
            // console.log(dataSave);
        }

        let graphTabId = `graph_tab${graphCounter}`;
        document.getElementById(graphTabId.toString()).innerHTML = `${dataObj['obs_name']}::${dataObj['obs_ID']}`;
        if ($(`#${graphTabId}`.toString()).css('background-color') != 'rgb(0, 255, 255)') {
            document.getElementById(graphTabId.toString()).style.backgroundColor = 'goldenrod';
        }
        if (chartList.length == 0) {
            document.getElementById(graphTabId.toString()).style.backgroundColor = 'aqua';
        }

        // prettier-ignore
        let [graphTabId_A, graphTabId_B] =
            graphCounter === 1 ? ['graph_tab2', 'graph_tab3'] : 
            graphCounter === 2 ? ['graph_tab1', 'graph_tab3'] : ['graph_tab2', 'graph_tab1'];

        if (document.getElementById(graphTabId_A).style.backgroundColor != null) {
            if ($(`#${graphTabId_A}`).css('background-color') != 'rgb(0, 255, 255)') {
                $(`#${graphTabId_A}`).css('background-color', '#d9d9d9');
            }
        }
        if (document.getElementById(graphTabId_B).style.backgroundColor != null) {
            if ($(`#${graphTabId_B}`).css('background-color') != 'rgb(0, 255, 255)') {
                $(`#${graphTabId_B}`).css('background-color', '#d9d9d9');
            }
        }

        let graphListChart = graphList.slice(); // なぜスライス？これをしないと、グラフの積み重ねでエラー

        chartList[graphCounter - 1] = new Dygraph(
            graphArea, // 表示ID名?
            graphListChart, // グラフデータ
            {
                // オプション
                colors: ['#000080', '#8b0000', '#32cd32', '#ff00ff', '#f4a460'],
                title: `${dataObj['obs_ID']}: E_${titleLon} N_${titleLat}`,
                ylabel: 'Reflectance',
                xlabel: 'Wavelength[μm]',
                legend: 'always',
                animatedZooms: true,
                showRangeSelector: true,
                rangeSelectorHeight: 30,
                rangeSelectorPlotStrokeColor: 'rgb(80,80,80)',
                rangeSelectorPlotFillColor: 'rgb(80,80,80)',
                showRoller: true,
                labelsSeparateLines: true,
                labelsDivStyles: {
                    backgroundColor: 'rgb(48,48,48)',
                },
                labelsDiv: document.getElementById(`labels${graphCounter}`),
                highlightSeriesOpts: {
                    strokeWidth: 1.5,
                    strokeBorderWidth: 1,
                },
                connectSeparatedPoints: true,
                labels: graphLabels,
            }
        );

        // dygraph生成時divが非表示だと生成されないため、タブ切り替え時にリサイズで生成する。
        document.querySelector('#graph_1').addEventListener('click', () => {
            chartList[0].resize();
        });
        document.querySelector('#graph_2').addEventListener('click', () => {
            chartList[1].resize();
        });
        document.querySelector('#graph_3').addEventListener('click', () => {
            chartList[2].resize();
        });

        graphCounter++;
        if (graphCounter >= 4) graphCounter = 1;
        click_history(data);
    } else {
        alert('No data.');
    }
}
