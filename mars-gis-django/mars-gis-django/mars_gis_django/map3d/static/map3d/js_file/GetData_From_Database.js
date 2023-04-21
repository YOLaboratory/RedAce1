var graph_list = new Array();
var entity = new Cesium.Entity();
var flag_entity = 0;
var Alignment = [];
var Alignment2 = [];
var ratio_flag = false;
var ratio_flag2 = false;
var ratio_layer;
var ratio_layer_g;
var NumberOfThumbnail = 1;
var history_json0 = [];
var history_json1 = [];
var hist0count = 0;
var hist1count = 0;
var histTop1 = "";
var histTop2 = "";
var Chart_list = [];
var graph_counter = 1;
var Lock_num=-1;
var downcheck_list=[];
var FootprintHist=new Array(2);
var data_save_num = 0;
var data_save = [[],[],[]];
var save_ref_div;
var baselayers_List = ["MOLA_THEMIS_blend", "MOLA_color", "MDIM21_color", "VIKING", "THEMIS_night", "THEMIS", "MDIM21"];
var layers_list = ["CRISM", "THEMIS", "Mars500K_Quads", "Mars2M_Quads", "Mars5M_Quads", "NOMENCLATURE"];
var thumbnail_root="/mnt"


Object.defineProperty(Object.prototype, "forIn", {
    value: function(fn, self) {
        self = self || this;
        Object.keys(this).forEach(function(key, index) {
            var value = this[key];
            fn.call(self, key, value, index);
        }, this);
    }
});


var flag_STATE = {
    Red: 1,
    Green: 2,
    RedUpper: 4,
    GreenUpper: 8,
    None: 16,
};
var flag_thumbnailX = 0;
flag_thumbnailX = flag_thumbnailX | flag_STATE.None;
var flag_ref_position = true;
var clickCircle;
var wyoming;
var wyoming2;
var infobox_txt1 = {};
var infobox_txt2 = {};
var countkk = 0;


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');









//umemo 地図上でクリックされた緯度経度を受け取る 
function getdatafromdb(lon, lat) {
    var rad_cir = Math.abs(document.getElementById("circle_mouse").value);
    roots.map.entities.remove(clickCircle);
    mouseposition();
    clickCircle = roots.map.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 0, roots.map.scene.globe.ellipsoid, new Cesium.Cartesian3()), //new Cesium.Cartesian3.fromDegrees(lon,lat),
        name: 'Green circle at height with outline',
        ellipse: {
            semiMinorAxis: rad_cir,
            semiMajorAxis: rad_cir,
            height: -2975000,
            material: Cesium.Color.CYAN.withAlpha(0.6),
        }
    });

    var numLayers = roots.map.imageryLayers.length;
    viewModel.layers.splice(0, viewModel.layers.length);
    for (var i = numLayers - 1; i >= 0; --i) {
        viewModel.layers.push(roots.map.imageryLayers.get(i));
    }

    flag_entity = 0;
    entity.description = {
        getValue: function() {
            return '';
        }
    };

    entity.name = "Ancillary Info.";
    roots.map.selectedEntity = entity;

    lon = lon % 360;
    if (lon > 180) {
        lon = lon - 360;
    } else if (lon < -180) {
        lon = 360 + lon;
    }

    var ajax_json;
    var layer_list = [];
    var Nowbaselayer;
    var itest;
    var wlayer1;
    var wlayer2;
    var where_baselayer;

    for (itest = 0; itest < layer_check.layers.length; itest++) {
        if (layer_check.layers[itest]._show === true) {
            wlayer1 = layer_check.layers[itest]._isBaseLayer;
            wlayer2 = layer_check.layers[itest]._imageryProvider._layers;
            if (baselayers_List.indexOf(wlayer2) >= 0) where_baselayer = itest;
            if (baselayers_List.indexOf(wlayer2) < 0 && layers_list.indexOf(wlayer2) < 0 && wlayer2 != void 0 && wlayer2 != "test") {
                if (where_baselayer == void 0) {
                    layer_list.push(wlayer2);
                }
            }
            if (wlayer1 == true) {
                Nowbaselayer = wlayer2;
            }
        }
    }

    if (layer_list.length <= 0) return 0;

    var Remodeling_getfeatureinfo = {
        "REQUEST": "GetFeatureInfo",
        "VERSION": "NULL",
        "SRS": "IAU2000:49900", 
        "LAYERS": Nowbaselayer,
        "QUERY_LAYERS": layer_list,
        "WIDTH": "NULL",
        "HEIGHT": "NULL",
        "BBOX": rad_cir,
        "INFO_FORMAT": "json",
        "X": lat,
        "Y": lon
    };

    $.ajax({
        type: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        url: 'db/', 
        contentType: 'application/json',
        data: JSON.stringify(Remodeling_getfeatureinfo)
    }).then(function(data) {
        console.log('nnnnn');
        obsID_box(data);
    }, function() {
        alert("読み込み失敗");
    });
}



//////後々、ID_Boxと入れ替え/////???

//umemo 関数getdatafromdbで見つけたデータのリストを受け取る 
//umemo 関数getdatafromdbで見つけたデータのID一覧を表示する(ID_box) 
function obsID_box(data) {
    var inner;
    var flagID = false;
    var data_object;
    var i;
    var j;
    var obs_count = 0;
    var IDset = document.getElementById("IDArea");

    console.log(data);
    data_object = JSON.parse(data);
    if (data_object["hit_data"][0][0]["features"].length > 0) {
        IDset.innerHTML = "";
        if (flagID !== false) {
            inner.innerHTML = "";
        }
        
        var ID_from_feature = '';
        for (j = 0; j < data_object["hit_data"].length; j++) {
            ID_from_feature = '\
                <div class="button_obs">' + data_object["hit_data"][j][0]["features"][0]["properties"]["name"].toUpperCase() + '\
                <button type="button" class="cesium-infoBox-close" onclick="removeElement(this)"}"></button></div>\
                <form id="IDproduct' + parseInt(j) + '" name="IDproduct' + parseInt(j) + '">\
                <input type="button" name="product_ID' + obs_count + '" value="' + data_object["hit_data"][j][0]["features"][0]["properties"]["id"] + '" class="button_tra" style="float:left;">\
                ';

            for (i = 1; i < data_object["hit_data"][j][0]["features"].length; i++) {
                if (i % 2 != 0) {
                    IDset.style.height = String(Math.min(((j + 1) * (4 + (i / 2 + 1) * 54)), 300)) + 'px';
                }
                console.log(data_object["hit_data"][j][0]["features"][i]["properties"]["id"] );
                console.log(i);
                ID_from_feature = ID_from_feature + '\
                    <input type="button" name="product_ID' + (parseInt(i) + parseInt(obs_count)) + '" value="' + data_object["hit_data"][j][0]["features"][i]["properties"]["id"] + '" class="button_tra">\
                    ';
            }
            ID_from_feature = ID_from_feature + '</form>';

            IDset.style.overflow = 'scroll';
            IDset.style.width = '320px';
            IDset.style.padding = '0px';
            IDset.style.margin = '0px';

            var div_element_to_show_product_ID = document.createElement("div");
            div_element_to_show_product_ID.id = "product_ID";
            div_element_to_show_product_ID.innerHTML = ID_from_feature;

            var productSet = IDset;
            productSet.appendChild(div_element_to_show_product_ID);
            flagID = true;
            inner = div_element_to_show_product_ID;


            for (i = 0; i < data_object["hit_data"][j][0]["features"].length; i++) {
                document.querySelector('#IDproduct' + parseInt(j) + ' input[name="product_ID' + (parseInt(i) + parseInt(obs_count)) + '"').addEventListener('click', getdatafromdirectory_ancillary.bind(null, data_object["hit_data"][j][0]["features"][i]));
            }
            obs_count = parseInt(i) + parseInt(obs_count);
        }
    }
}

function removeElement(button) {
    let parent = button.parentNode.parentNode;
    parent.remove();
}


//umemo ID_boxでクリックされたデータを受け取る 
function getdatafromdirectory_ancillary(data) {
    console.log(data);
    $.ajax({
        type: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        url: 'dir/',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).then(thumbnail_box, function() {
        alert("読み込み失敗");
    });
}


//umemo ID_boxで選択されたデータのサムネイル画像を表示 
function thumbnail_box(data) {
    var data_object = JSON.parse(data);
    var palette = 0;
    var coordinateObs = Array.prototype.concat.apply(
                            [], 
                            Array.prototype.concat.apply(
                                [], 
                                data_object["geometry"]["coordinates"]
                            )
                        );

    if ((!!(flag_thumbnailX & flag_STATE.None))) {
        flag_thumbnailX = 0;
        flag_thumbnailX = flag_thumbnailX | flag_STATE.Red;
        palette = 0;
    } else if (!!(flag_thumbnailX & flag_STATE.Red)) {
        flag_thumbnailX = 0;
        flag_thumbnailX = flag_thumbnailX | flag_STATE.GreenUpper;
        palette = 1;
    } else if (!!(flag_thumbnailX & flag_STATE.Green)) {
        flag_thumbnailX = 0;
        flag_thumbnailX = flag_thumbnailX | flag_STATE.RedUpper;
        palette = 0;
    } else if (!!(flag_thumbnailX & flag_STATE.RedUpper)) {
        roots.map.entities.remove(wyoming);
        flag_thumbnailX = 0;
        flag_thumbnailX = flag_thumbnailX | flag_STATE.RedUpper;
        palette = 0;
    } else if (!!(flag_thumbnailX & flag_STATE.GreenUpper)) {
        roots.map.entities.remove(wyoming2);
        flag_thumbnailX = 0;
        flag_thumbnailX = flag_thumbnailX | flag_STATE.GreenUpper;
        palette = 1;
    }

    console.log(palette);

    if (palette === 0) {
        FootprintHist[0] = coordinateObs;
        roots.map.entities.remove(wyoming);
        wyoming = roots.map.entities.add({
                    name: 'ORANGE',
                    polygon: {
                        hierarchy: Cesium.Cartesian3.fromDegreesArray(
                                        coordinateObs,
                                        roots.map.scene.globe.ellipsoid
                                    ),
                        perPositionHeight: true,
                        clampToGround: true,
                        material: Cesium.Color.DARKORANGE.withAlpha(0.5),
                        outline: true,
                        outlineColor: Cesium.Color.Red
                    },
                });

        // いる？パレット2にはない。。
        // mouseposition();

        ancillary_box(data);

        // フローティングウィンドウの生成
        var inner_figure;
        var flag_figure = false;
        if (flag_figure !== false) {
            inner_figure.innerHTML = "";
        }

        var div_element_figure = document.createElement("div");
        var imageAreaSet = document.getElementById("imageArea");
        imageAreaSet.innerHTML = "";
        div_element_figure.innerHTML = '<div id="thumbnail" style="width: 510px; height: 440px;z-index: 10;border: 5px solid #ff8c00; position:relative;top:0px;left:-10px">\
                                        <div id="ratio_select" name="ratio_select" style="width: 0px;height:0px; position: absolute; top: 0%;z-index:2000;  left:15%;  background-color: rgba(255,255,255,0.1);"></div>\
                                        <div id="slider" style="position:absolute;z-index:2000; top:3%; left:10%; "></div>\
                                        <input type="button" class="erasing" value="X" style="position: absolute;top:-55.7px;left:96.5%;" onclick="CLOSE(1)">\
                                        <input type="button" class="erasing" value="MOVE" style="position: absolute;top:-55.7px;left:85%;" onclick="jumpLocation(1)">\
                                        <div id="click_position" style="position:absolute;width: 300px;height:40px; top:-50px; left:2px;background-color: rgba(255,255,255,0.1);"></div>\
                                        <div id="click_history" style="position:absolute;z-index:2000; width: 100px;height:0px; top:0%; left:80%; overflow-y:scroll;overflow-x:visible; background-color: rgba(255,255,255,0.1);text-align: center;"></div></div>';

        console.log(coordinateObs);

        var product_figure = imageAreaSet;
        product_figure.appendChild(div_element_figure);

        var e_image = document.getElementById("image_move");
        e_image.style.width = "520px";
        e_image.style.height = "500px";
        e_image.style.top = "300px";
        e_image.style.left = "0px";

        imageAreaSet.style.background = "rgba(0,0,0,1)";
        imageAreaSet.style.top = "50px"
        imageAreaSet.style.width = "510px";
        imageAreaSet.style.height = "450px";


        // 四方（うち２点）の座標点を使用してもいいが、その場合クリックした場所の座標点はまずいことになる。
        // themisの場合sunisoidalとか投影法は違い、クリックした場所がその座標で正しいのかというものがある。
        // 位置ピクセル、〜緯度、〜軽度移動すると決まってないからね。歪みがあるからね。
        // var extent = [data_object['Mapping']['MinimumLongitude_Left'],data_object['Mapping']['MinimumLatitude_Left'], data_object['Mapping']['MaximumLongitude_Right'], data_object['Mapping']['MaximumLatitude_Right']];

        // ブジェクトはプロパティの集合。プロパティとは名前（キー）と値（バリュー）が対になったもの。
        var orange = new Object(); // 空のオブジェクトリテラルと同じ意味
        var extent = [0, 0, data_object['Mapping']['Image_size'][0], data_object['Mapping']['Image_size'][1]];
        var projection = new ol.proj.Projection({
                            code: 'pixels',
                            units: 'pixels',
                            extent: extent
                        });
        

        orange.extent = extent; // `extent`プロパティを追加して値(extent)を代入
        orange.projection = projection;
        wms_layers.ratio.orange = {};
        wms_layers.ratio.orange = orange;
        wms_layers.thumbnail = new ol.Map({ // OpenLayersを使用。
                                    logo: false,
                                    controls: ol.control.defaults().extend([
                                                new ol.control.ZoomSlider()
                                            ]),
                                    layers: [new ol.layer.Image({
                                                source: new ol.source.ImageStatic({
                                                    url: '/collectstatic/' + data_object['Image_path'], //220928
                                                    // url: "http://localhost:8000" + data_object['Image_path'], //usui220616
                                                    projection: projection,
                                                    imageExtent: extent
                                                })
                                            })],
                                    target: 'thumbnail',
                                    view: new ol.View({
                                                projection: projection,
                                                extent: extent,
                                                center: ol.extent.getCenter(extent),
                                                zoom: 2,
                                                maxZoom: 6,
                                            })
                                });

        if (data_object["Ratio_path_json"] != null) {
            var ratio_count = Object.keys(data_object["Ratio_path_json"]).length;
        } else {
            var ratio_count = 0;
        }

        if (ratio_count != 0) {
            var ratio_div = document.createElement("div");
            ratio_div.setAttribute("class", "ratio_band_set")
            ratio_div.innerHTML = '<select id="ratio_band" style="color:rgba(255,255,255,0.5); background:rgba(0,0,0,1);" onchange="ratio_layer1(this);"></select>';
            document.getElementById("ratio_select").appendChild(ratio_div);

            let op = document.createElement("option");
            op.value = -1;
            op.text = "Ratio RGB Bands";
            document.getElementById("ratio_band").appendChild(op);

            for (var i = 0; i < ratio_count; i++) {
                let op = document.createElement("option");
                op.value = data_object["Ratio_path_json"][i]["path"];
                op.text = data_object["Ratio_path_json"][i]["band"];
                document.getElementById("ratio_band").appendChild(op);
            }
        }

        hist0count = 0;
        history_json0.length = 0;
        histTop1 = "";

        console.log(data_object['Image_path']);

        // clickしたピクセル位置を取得。サムネイル画像の左下基準、x,y軸で検索している。
        wms_layers.thumbnail.on('click', function(evt) {
            console.log(evt.coordinate);
            getdatafromdirectory_reflectance(evt.coordinate, data_object['Mapping']['Image_size'], data_object['obs_ID'], data_object['path'], data_object['Image_path'], data_object['obs_name'], data_object["ancillary"]["band_bin_center"], 0);
        });

    } else if (palette === 1) {
        FootprintHist[1] = coordinateObs;
        roots.map.entities.remove(wyoming2);
        wyoming2 = roots.map.entities.add({
                        name: 'GREEN',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(
                                            coordinateObs, 
                                            roots.map.scene.globe.ellipsoid
                                        ),
                            perPositionHeight: true,
                            clampToGround: true,
                            material: Cesium.Color.MEDIUMSPRINGGREEN.withAlpha(0.5),
                            outline: true,
                            outlineColor: Cesium.Color.GREEN
                        }
                    });

        ancillary_box(data);
        
        var inner_figure;
        var flag_figure = false;
        if (flag_figure !== false) {
            inner_figure.innerHTML = "";
        }

        var div_element_figure = document.createElement("div");
        var imageAreaSet = document.getElementById("imageArea2");
        imageAreaSet.innerHTML = "";
        div_element_figure.innerHTML = '<div id="thumbnail2" style="width: 510px; height: 440px;z-index: 10;border: 5px solid #00cb72; position:relative;top:0px;left:-10px">\
                                        <div id="ratio_select2" name="ratio_select2" style="width: 0px;height:0px; position: absolute; top: 0%; z-index:2000; left:15%;  background-color: rgba(255,255,255,0.1);"></div> \
                                        <div id="slider2" style="position:absolute; z-index:2000; top:3%; left:10%; "></div>\
                                        <input type="button" class="erasing" value="X" style="position: absolute;top:-55.7px;left:96.5%;"onclick="CLOSE(2)">\
                                        <input type="button" class="erasing" value="MOVE" style="position: absolute;top:-55.7px;left:85%;" onclick="jumpLocation(2)">\
                                        <div id="click_position2" style="position:absolute;width: 300px;height:40px; top:-50px; left:2px;background-color: rgba(255,255,255,0.1);"></div>\
                                        <div  id="click_history2" style="position:absolute;z-index:2000; width: 100px;height:0px; top:0%; left:80%; overflow-y:scroll;overflow-x:visible; background-color: rgba(255,255,255,0.1);text-align: center;"></div></div>';

        var product_figure = imageAreaSet;
        product_figure.appendChild(div_element_figure);

        var e_image = document.getElementById("image_move2");
        e_image.style.width = "520px";
        e_image.style.height = "500px";
        e_image.style.top = "300px";
        e_image.style.left = "10px";
        imageAreaSet.style.background = "rgba(0,0,0,1)";
        imageAreaSet.style.top = "50px"
        imageAreaSet.style.width = "510px";
        imageAreaSet.style.height = "450px";

        var green = new Object();
        var extent = [0, 0, data_object['Mapping']['Image_size'][0], data_object['Mapping']['Image_size'][1]];
        var projection = new ol.proj.Projection({
                            code: 'pixels',
                            units: 'pixels',
                            extent: extent
                        });

        green.extent = extent;
        green.projection = projection;
        wms_layers.ratio.green = {};
        wms_layers.ratio.green = green;
        wms_layers.thumbnail2 = new ol.Map({
                                    logo: false,
                                    controls: ol.control.defaults().extend([
                                                new ol.control.ZoomSlider()
                                            ]),
                                    layers: [new ol.layer.Image({
                                                source: new ol.source.ImageStatic({
                                                    url: '/collectstatic/' + data_object['Image_path'], //usui220922
                                                    // url: "http://localhost:8000" + data_object['Image_path'], //usui220616
                                                    projection: projection,
                                                    imageExtent: extent
                                                })
                                            })],
                                    target: 'thumbnail2',
                                    view: new ol.View({
                                                projection: projection,
                                                extent: extent,
                                                center: ol.extent.getCenter(extent),
                                                zoom: 2,
                                                maxZoom: 6
                                            })
                                });

        console.log(data_object['Image_path']);

        if (data_object["Ratio_path_json"] != null) {
            var ratio_count = Object.keys(data_object["Ratio_path_json"]).length;
        } else {
            var ratio_count = 0;
        }

        if (ratio_count != 0) {
            var ratio_div = document.createElement("div");
            ratio_div.setAttribute("class", "ratio_band_set2");
            ratio_div.innerHTML = '<select id="ratio_band2" style="color:rgba(255,255,255,0.5);background:rgba(0,0,0,1);" onchange="ratio_layer2(this);"></select>';
            document.getElementById("ratio_select2").appendChild(ratio_div);

            let op = document.createElement("option");
            op.value = -1;
            op.text = "Ratio RGB Bands";
            document.getElementById("ratio_band2").appendChild(op);

            for (var i = 0; i < ratio_count; i++) {
                let op = document.createElement("option");
                op.value = data_object["Ratio_path_json"][i]["path"];
                op.text = data_object["Ratio_path_json"][i]["band"];
                document.getElementById("ratio_band2").appendChild(op);
            }
        }

        hist1count = 0;
        history_json1.length = 0;
        histTop2 = "";

        console.log(data_object['Image_path']);

        wms_layers.thumbnail2.on('click', function(evt) {
            getdatafromdirectory_reflectance(evt.coordinate, data_object['Mapping']['Image_size'], data_object['obs_ID'], data_object['path'], data_object['Image_path'], data_object['obs_name'], data_object["ancillary"]["band_bin_center"], 0);
        });
    }
}



//umemo thumbnailbox内で座標クリックした時の座標点から上下左右に伸びる直線描画
function Alignment_setting(pixels_alignment, size_alignment) {
    if (NumberOfThumbnail === 0) {
        var set_layer = wms_layers.thumbnail;
        set_layer.removeLayer(Alignment[0]);
        set_layer.removeLayer(Alignment[1]);
        set_layer.removeLayer(Alignment[2]);
        set_layer.removeLayer(Alignment[3]);
        Alignment = [];
    } else if (NumberOfThumbnail === 1) {
        var set_layer = wms_layers.thumbnail2;
        set_layer.removeLayer(Alignment2[0]);
        set_layer.removeLayer(Alignment2[1]);
        set_layer.removeLayer(Alignment2[2]);
        set_layer.removeLayer(Alignment2[3]);
        Alignment2 = [];
    }

    var coordinates = [//umemo left
        [-Math.round(size_alignment[0] / 2) - 1, Math.round(pixels_alignment[1])],
        [Math.round(pixels_alignment[0]) - 0.5, Math.round(pixels_alignment[1])]
    ];
    var layerLines = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
                geometry: new ol.geom.LineString(coordinates),
            })]
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
        }),
    });
    if (NumberOfThumbnail === 0) {
        Alignment.push(layerLines);
    } else if (NumberOfThumbnail === 1) {
        Alignment2.push(layerLines);
    }

    var coordinates = [//umemo right
        [(Math.round(pixels_alignment[0]) + 0.5), Math.round(pixels_alignment[1])],
        [size_alignment[0] + Math.round(size_alignment[0] / 2) - 1, Math.round(pixels_alignment[1])]
    ];
    var layerLines = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
                geometry: new ol.geom.LineString(coordinates),
            })]
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
        }),
    });
    if (NumberOfThumbnail === 0) {
        Alignment.push(layerLines);
    } else if (NumberOfThumbnail === 1) {
        Alignment2.push(layerLines);
    }

    var coordinates = [//umemo bottom
        [Math.round(pixels_alignment[0]), -(Math.round(size_alignment[1] / 2)) - 0.5],
        [Math.round(pixels_alignment[0]), Math.round(pixels_alignment[1]) - 0.5]
    ];
    var layerLines = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
                geometry: new ol.geom.LineString(coordinates),
            })]
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
        }),
    });
    if (NumberOfThumbnail === 0) {
        Alignment.push(layerLines);
    } else if (NumberOfThumbnail === 1) {
        Alignment2.push(layerLines);
    }

    var coordinates = [//umemo top
        [Math.round(pixels_alignment[0]), (Math.round(pixels_alignment[1]) + 0.5)],
        [Math.round(pixels_alignment[0]), size_alignment[1] + Math.round(size_alignment[1] / 2) + 0.5]
    ];
    var layerLines = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
                geometry: new ol.geom.LineString(coordinates),
            })]
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
        }),
    });
    if (NumberOfThumbnail === 0) {
        Alignment.push(layerLines);
    } else if (NumberOfThumbnail === 1) {
        Alignment2.push(layerLines);
    }

    if (NumberOfThumbnail === 0) {
        set_layer.getLayers().insertAt(2, Alignment[0]);
        set_layer.getLayers().insertAt(3, Alignment[1]);
        set_layer.getLayers().insertAt(4, Alignment[2]);
        set_layer.getLayers().insertAt(5, Alignment[3]);
    } else if (NumberOfThumbnail === 1) {
        set_layer.getLayers().insertAt(2, Alignment2[0]);
        set_layer.getLayers().insertAt(3, Alignment2[1]);
        set_layer.getLayers().insertAt(4, Alignment2[2]);
        set_layer.getLayers().insertAt(5, Alignment2[3]);
    }
}




//umemo 表レイアウト定義  
//umemo 観測時の情報可視化 
function ancillary_box(data) {
    if (flag_entity === 1) {
        entity.description = {
            getValue: function() {
                return '';
            }
        }
        entity.name = "Ancillary info.";
    }
    flag_entity = 1;
    roots.map.selectedEntity = entity;
    var style_pattern = "background: -webkit-linear-gradient(63deg, rgb(21,21,21) 5px, rgba(0,0,0,0) 5px),\
                        -webkit-linear-gradient(-117deg, rgb(21,21,21) 5px, rgba(0,0,0,0) 5px), \
                        -webkit-linear-gradient(63deg, rgb(34,34,34) 5px, rgba(0,0,0,0) 5px), \
                        -webkit-linear-gradient(-117deg, rgb(34,34,34) 5px, rgba(0,0,0,0) 5px),\
                        -webkit-linear-gradient(0deg, rgb(27,27,27) 10px, rgba(0,0,0,0) 10px), \
                        -webkit-linear-gradient(-90deg, rgb(29,29,29) 25%, rgb(26,26,26) 25%, rgb(26,26,26) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 75%, rgb(36,36,36) 75%, rgb(36,36,36) 100%), rgb(19, 19, 19);\
                        background: linear-gradient(27deg, rgb(21,21,21) 5px, rgba(0,0,0,0) 5px), \
                        linear-gradient(207deg, rgb(21,21,21) 5px, rgba(0,0,0,0) 5px), \
                        linear-gradient(27deg, rgb(34,34,34) 5px, rgba(0,0,0,0) 5px), \
                        linear-gradient(207deg, rgb(34,34,34) 5px, rgba(0,0,0,0) 5px), \
                        linear-gradient(90deg, rgb(27,27,27) 10px, rgba(0,0,0,0) 10px), \
                        linear-gradient(180deg, rgb(29,29,29) 25%, rgb(26,26,26) 25%, rgb(26,26,26) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 75%, rgb(36,36,36) 75%, rgb(36,36,36) 100%), rgb(19, 19, 19);\
                        background-position: 0 5px, 10px 0, 0 10px, 10px 5px, 0 0, 0 0;\
                        -webkit-background-size: 20px 20px;\
                        background-size: 20px 20px;";
    var style_pattern2 = "background: rgba(255,255,255,0.2);";
    var style_anc_dl = "position:absolute; width:105px; right:5px; background-color:#248; color:#fff;";
    var data_object = JSON.parse(data);
    var inner_ref_ID;
    var flag_ref_ID = false;
    var infobox_txt_all =  '<div style="height:500px;">\
                            <button style="' + style_anc_dl + 'top:90px;" id="anc_dl_xlsx">Download XLSX</button>\
                            <button style="' + style_anc_dl + 'top:113px;" id="anc_dl_json">Download JSON</button>\
                            <button style="' + style_anc_dl + 'top:136px;" id="anc_dl_csv">Download CSV</button>\
                            <button style="' + style_anc_dl + 'top:159px;" id="anc_dl_pvl">Download PVL</button><div>\
                            <img src="/collectstatic/'+ data_object["Image_path"] + '" style="position:absolute; left:10px; width:180px; height:180px; object-fit:contain;" >\
                            <div class="infobox_name" style="position:absolute; right:5px; top:0px; padding:0.5em 1em; margin:2em 0; background-color:rgba(0, 117, 226, 0.7); border-left:solid 10px #ffc06e;">\
                            <font size="4">' + data_object["obs_name"] + '</font></div></div><br>\
                            <table class="ancillary" border="1" style="position:absolute; top:200px; width:97%; table-layout:auto; font-size:8pt; font-family:serif;" cellspacing="0">';
    
    var key_check;
    infobox_txt_name = '<tr>';
    infobox_txt_value = '<tr>';
    infobox_txt_table = '';
    data_object["ancillary"].forIn(function(key, value, index) {
        infobox_txt_name = infobox_txt_name + '<th style="' + style_pattern + '"  align="center">' + '<p style="width:120px; overflow:scroll;">' + key + '</p></th>';
        infobox_txt_value = infobox_txt_value + '<td style="' + style_pattern2 + '" align="center">' + '<p style="width:120px; overflow:scroll;">' + value + '</p></td>';

        key_check = (index + 1) % 3;

        if (key_check == 0) {
            infobox_txt_table = infobox_txt_table + infobox_txt_name + '</tr>' + infobox_txt_value + '</tr>';
            infobox_txt_name = '<tr>';
            infobox_txt_value = '<tr>';
        }
    });

    if (key_check == 1) {
        infobox_txt_name = infobox_txt_name + '<th style="' + style_pattern + '"  align="center">NULL</th>' + '<th style="' + style_pattern + '"  align="center">NULL</th>';
        infobox_txt_value = infobox_txt_value + '<td style="' + style_pattern2 + '" align="center">NULL</td>' + '<td style="' + style_pattern2 + '" align="center">NULL</td>';
        infobox_txt_table = infobox_txt_table + infobox_txt_name + '</tr>' + infobox_txt_value + '</tr>';
    }
    if (key_check == 2) {
        infobox_txt_name = infobox_txt_name + '<th style="' + style_pattern + '"  align="center">NULL</th>';
        infobox_txt_value = infobox_txt_value + '<td style="' + style_pattern2 + '" align="center">NULL</td>';
        infobox_txt_table = infobox_txt_table + infobox_txt_name + '</tr>' + infobox_txt_value + '</tr>';
    }

    infobox_txt_table = infobox_txt_table + '</table><p></p></div>';
    infobox_txt_all = infobox_txt_all + infobox_txt_table;
    infobox_txt = infobox_txt_all;

    if ((!!(flag_thumbnailX & flag_STATE.Red)) || (!!(flag_thumbnailX & flag_STATE.RedUpper))) {
        infobox_txt1.txt = infobox_txt;
        infobox_txt1.name = data_object["obs_ID"];
    } else if (!!(flag_thumbnailX & flag_STATE.GreenUpper)) {
        infobox_txt2.txt = infobox_txt;
        infobox_txt2.name = data_object["obs_ID"];
    }

    entity.name = data_object["obs_ID"];

    entity.description = {
        getValue: function() {
            return infobox_txt;
        }
    };
}


//umemo 引数：クリックされた点(ピクセル)のデータ等     
//umemo クリックされた点(ピクセル)にデータがあれば取り出す 
function getdatafromdirectory_reflectance(pixels, Image_size, obs_ID, path, image_path, obs_name, wavelength, re_flag) {
    console.log(pixels);
    console.log(Image_size);
    console.log(obs_ID);
    console.log(path);
    console.log(image_path);

    // pixels[0]:x軸、pixels[1]:y軸。だと思う。
    if (re_flag === 0) { //umemo thumbnailをclick
        Alignment_setting(pixels, Image_size);
        pixels[0] = pixels[0] - 1;
        pixels[1] = Image_size[1] - pixels[1] - 1;
    } else if (re_flag === 1) { //umemo thumbnailbox内左上または右側部分click
        var re_pixels = pixels.concat();
        re_pixels[0] = pixels[0] + 1;
        re_pixels[1] = Image_size[1] - pixels[1] - 1;
        Alignment_setting(re_pixels, Image_size);
    }

    //umemo pixel座標がイメージサイズ(四角形)より内側ならデータ探す
    // ピクセル座標、左下基準。
    if ((pixels[0] <= Image_size[0]) && (pixels[1] <= Image_size[1]) && (0 <= pixels[0]) && (0 <= pixels[1])) {
        var $loading = $(".cssload-thecube");
        var $loading2 = $(".back-loading");
        $.ajax({
            type: 'POST',
            headers: { "X-CSRFToken": csrftoken },
            url: 'reflectance/',
            contentType: 'application/json',
            data: JSON.stringify({ "obs_name": obs_name, "obs_ID": obs_ID, "path": path, "Image_path": image_path, "wavelength": wavelength, "pixels": pixels }),
            beforeSend: function() { // Ajax通信を送信する前に任意の処理を実行.
                $loading.removeClass("is-hide");
                $loading2.removeClass("is-hide");
            },
        }).then(function(data) {
            $loading.addClass("is-hide");
            $loading2.addClass("is-hide");
            console.log(image_path);
            spectral_box(data);
        }, function() {
            alert("読み込み失敗");
        });
    }
}

csv_formatbox = [];
spectral_jagged = new Array(3);

//umemo 引数：プロットするスペクトルデータに関するデータ
function spectral_box(data) {
    console.log(data);
    var csv_format = [];
    var data_object = JSON.parse(data);
    graph_list.length = 0;
    var ref_index = 0;

    if (data_object["reflectance"] !== -1) {
        var spectal_length = data_object["band_number"].length;
        var arr1 = data_object["reflectance"].split(',');
        var arr2 = data_object["band_bin_center"].split(',');
        csv_format.length = 0;

        if (Number.parseFloat(arr2[spectal_length - 1]) >= Number.parseFloat(arr2[0])) { //umemo Number(),文字列やその他の値をNumber型に変換
            for (var i = 0; i < spectal_length; i++) {
                if (Number(arr1[i]) != -1) {
                    graph_list[ref_index] = new Array();
                    graph_list[ref_index][1] = Number(arr1[i]);
                    graph_list[ref_index][0] = Number(arr2[i]);
                    csv_format = csv_format + Number(arr2[i]) + ',';
                    csv_format = csv_format + Number(arr1[i]) + ',';
                    ref_index += 1;
                }
            }
        } else {
            for (var i = 0; i < spectal_length; i++) {
                if (Number(arr1[spectal_length - i - 1]) != -1) {
                    graph_list[ref_index] = new Array();
                    graph_list[ref_index][1] = Number(arr1[spectal_length - i - 1]);
                    graph_list[ref_index][0] = Number(arr2[spectal_length - i - 1]);
                    csv_format = csv_format + Number(arr2[spectal_length - i - 1]) + ',';
                    csv_format = csv_format + Number(arr1[spectal_length - i - 1]) + ',';
                    ref_index += 1;
                }
            }
        }
        csv_formatbox[graph_counter-1] = csv_format;
        graph_list = graph_list.filter(n => n.length > 0);

        if (flag_ref_position) {
            $("html,body").animate({ scrollTop: $('#graph_move').offset().top - 100 });
            flag_ref_position = false;
        }

        var e_graph = document.getElementById("graph_move");
        e_graph.style.width = "600px";
        e_graph.style.height = "530px";
        e_graph.style.background = "rgba(5,5,5,0.6)";
        console.log(Chart_list.length);

        if (Chart_list.length == 0) {
            var down_ref_div2 = document.createElement("div");

            down_ref_div2.innerHTML='<div style="position:absolute;top:450px;left:300px;color:rgba(255,255,255,0.5);">\
                                    <label><input type="radio" id="Lock1"  value=1  name="Lock" >Lock 1</label>\
                                    <label><input type="radio" id="Lock2" value=2 name="Lock"  disabled="disabled">Lock 2</label>\
                                    <label><input type="radio" id="Lock3" value=3 name="Lock"  disabled="disabled">Lock 3</label>\
                                    <label><input type="radio" id="graph_FIFO" name="Lock" value=-1 checked>FIFO</label></div>'

            e_graph.appendChild(down_ref_div2);
        } else if (Chart_list.length == 1) {
            document.getElementById("Lock2").disabled = false;
        } else if (Chart_list.length == 2) {
            document.getElementById("Lock3").disabled = false;
        }
        lock_check = $('input[name=Lock]:checked').val(); //umemo val(),value取得

        if (lock_check != -1) {
            graph_counter = Number(lock_check);
            Lock_num = Number(lock_check);
            data_save_num = Number(lock_check);
            data_save[data_save_num-1].push(JSON.parse(data));
        }
        if (lock_check == -1) {
            Lock_num = -1;
            data_save_num = data_save_num + 1;
            if (data_save_num >= 4) data_save_num = 1;
            if (data_save[data_save_num-1].length >= 1){
                data_save[data_save_num-1] = [];
            }
            data_save[data_save_num-1].push(JSON.parse(data));
        }

        var classTabName = "graph" + graph_counter;
        var ee_graph = document.getElementsByClassName(classTabName.toString())[0];
        console.log(classTabName);
        if (Chart_list.length != 3) {
            if(downcheck_list.indexOf(Number(graph_counter)) == -1){
                downcheck_list.push(Number(graph_counter));

                //umemo スペクトルプロットの下部ダウンロードボタン生成
                var down_ref_div = document.createElement("div"); //umemo HTML生成、 構文 >> var element = document.createElement(tagName[, options]);
                down_ref_div.innerHTML = '<button type="button" id="down_csv_spectral_'+graph_counter+'" class="squareA" style="position:absolute;top:450px;left:20px; width:70px" onclick="download_csv_spectral('+Number(graph_counter-1)+');">&nbsp;&nbsp;Download</buttton>';
                var idTabName = "graph_"+graph_counter+"_content";
                document.getElementById(idTabName).appendChild(down_ref_div);

                //umemo スペクトルプロットの下部メモ欄生成
                save_memo_div = document.createElement("div");
                save_memo_div.innerHTML = '<input type="text" id="save_memo_'+graph_counter+'" value="" placeholder="Jot your note down here." style="position:absolute;top:485px;left:20px; width:450px; font-size:17px"></input>';
                var idTabName = "graph_"+graph_counter+"_content";
                document.getElementById(idTabName).appendChild(save_memo_div);

                //umemo スペクトルプロットのリスト保存ボタン生成                
                save_ref_div = document.createElement("div");
                save_ref_div.innerHTML = '<button type="button" id="save_spectral_'+graph_counter+'" class="squareA" style="position:absolute;top:485px;left:500px; width:75px" onclick="save_spectral('+Number(graph_counter-1)+');">&nbsp;&nbsp;Save to list</buttton>';
                var idTabName = "graph_"+graph_counter+"_content";
                document.getElementById(idTabName).appendChild(save_ref_div);
            }
        }   
        ee_graph.style.background = "rgba(255,255,255,0.7)";
        ee_graph.style.position = "absolute";
        ee_graph.style.left = "20px";
        ee_graph.style.width = "560px";
        ee_graph.style.height = "400px";

        var title_lon = data_object["coordinate"][0].toFixed(5);
        var title_lat = data_object["coordinate"][1].toFixed(5);
        var graph_labels=["band", data_object["obs_ID"]+":" + " E:" + title_lon + "  N:" + title_lat];
        var graph_color=["#000080","#8b0000","#32cd32","#ff00ff","#f4a460"];

        if (Chart_list.length!=0 && ( Lock_num==1 || ( Lock_num==2 && Chart_list.length>=2) || ( Lock_num==3 && Chart_list.length>=3) )) {
            var previous_spectral_arr = Chart_list[Lock_num-1].file_.concat();
            var previous_spectral_id = Chart_list[Lock_num-1].user_attrs_.labels.concat();
            console.log("Chart_list.length!=0 && (Lock_num==1 || (Lock_num==2 && Chart_list.length>=2)|| (Lock_num==3&&Chart_list.length>=3))")

            var swap_spectral_info = graph_list;
            graph_list = previous_spectral_arr;
            previous_spectral_arr = swap_spectral_info;

            //crismとthemis 合体

            var graph_list_mk = [];

            //配列　previousとgraph が前段階でswapされていることに注意
            var graph_list2 = graph_list.concat();
            var graph_list3 = previous_spectral_arr.concat();
            var list_i = 0;
            var list_i2 = 0;
            var stan_list = 0;
            var numberOfgraphData = graph_list2[0].length-1;

            for (var list_i=0; list_i<graph_list2.length; list_i++) {
                graph_list_mk.push(graph_list2[list_i].concat());
                graph_list_mk[list_i].push(null);
            }
            for (var list_i2=0; list_i2<graph_list3.length; list_i2++) {
                for (var list_i3=0; list_i3<graph_list_mk.length; list_i3++) {
                    if (graph_list3[list_i2][0] == graph_list_mk[list_i3][0]) {
                        var last_number = graph_list_mk[list_i3].pop();
                        if (last_number == null) {
                            graph_list_mk[list_i3].push(graph_list3[list_i2][1]);
                            break;
                        } else {
                            graph_list_mk[list_i3].push(last_number);
                        }
                    } else {
                        if (list_i3 == graph_list_mk.length-1) {
                            var null_arr = Array.apply(null, Array(numberOfgraphData)).map(function () {return null });
                            Array.prototype.splice.apply(graph_list3[list_i2],[1,0].concat(null_arr));
                            graph_list_mk.push(graph_list3[list_i2]);
                            break;
                        }
                    }
                }
            }
            graph_list = graph_list_mk.sort(function(a,b){ return (a[0] - b[0]); });
            var swap_labels = graph_labels;
            graph_labels = previous_spectral_id;
            previous_spectral_id = swap_labels;
            graph_labels.push(previous_spectral_id[1]);
        }

        if (Chart_list.length >= graph_counter) {
            Chart_list[graph_counter-1].destroy();
            console.log(data_save)
        }

        var graphTabId = "graphtab"+graph_counter;
        document.getElementById(graphTabId.toString()).innerHTML = data_object["obs_name"] + "::" + data_object["obs_ID"];
        if ($("#"+graphTabId.toString()).css("background-color") != "rgb(0, 255, 255)" ) {
            document.getElementById(graphTabId.toString()).style.backgroundColor = 'goldenrod';
        }
        if (Chart_list.length == 0) {
            document.getElementById(graphTabId.toString()).style.backgroundColor = 'aqua';
        }
        if (graph_counter == 1) {
            var graphTabId_A="graphtab2";
            var graphTabId_B="graphtab3";
        }
        else if (graph_counter == 2) {
            var graphTabId_A="graphtab1";
            var graphTabId_B="graphtab3";
        }
        else if (graph_counter == 3) {
            var graphTabId_A="graphtab2";
            var graphTabId_B="graphtab1";
        }

        if (document.getElementById(graphTabId_A).style.backgroundColor != null) {
            if ($("#"+graphTabId_A).css("background-color") != "rgb(0, 255, 255)") {
                $("#"+graphTabId_A).css("background-color", "#d9d9d9");
            }
        }
        if (document.getElementById(graphTabId_B).style.backgroundColor != null) {
            if ($("#"+graphTabId_B).css("background-color") != "rgb(0, 255, 255)") {
                $("#"+graphTabId_B).css("background-color", "#d9d9d9");
            }
        }

        var graph_list_Chart = graph_list.slice();

        Chart_list[graph_counter-1] = new Dygraph(
            ee_graph,
            graph_list_Chart, {
                colors: graph_color,
                titleHeight: 18,
                title: data_object["obs_ID"] + ":" + "E:" + title_lon + " N:" + title_lat,
                ylabel: "Reflectance",
                xlabel: "Wavelength[μm]",
                legend: "always",
                showRoller: true,
                xAxisHeight: 50,
                labelsSeparateLines: true,
                xLabelHeight: 18,
                axisLabelWidth: 80,
                highlightSeriesOpts: {
                    strokeWidth: 3,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 5,
                },
                connectSeparatedPoints: true,
                labels: graph_labels
            }
        );
        
        graph_counter = graph_counter+1;

        if (graph_counter >= 4) {
            graph_counter = 1;
        }
        click_history(data);
    }
}




//umemo thumnailbox内, clickした座標を記録して参照出来るようにしてる
function click_history(data) {
    var data_object = JSON.parse(data);
    if (NumberOfThumbnail === 0) {
        var cal_h = 35 * hist0count + 42;
        if (cal_h > 440) {
            cal_h = 440;
        }
        if (hist0count == 0) cal_h = 0;
        cal_h += "px";
        document.getElementById("click_history").style.height = cal_h;
        var element = histTop1 + document.getElementById("click_history").innerHTML;
        document.getElementById("click_history").innerHTML = element;
        history_json0.push(data_object);
        //umemo thumnailboxの右部分, onclick(this)は押した箇所のhtml文1行取得<div class....></div>など取得
        histTop1 = '<div class="balloonoya"><button type="button" name="chistory0" align="right" value="' + Math.floor(0) + "," + Math.floor(hist0count) + '"\
                        class="squareB" onclick="click_reRef(this);"  >' + "\
                        &nbsp;&nbsp;Lon : " + data_object["coordinate"][0].toFixed(4) + "<br>&nbsp;&nbsp;Lat : " + data_object["coordinate"][1].toFixed(4) + '</button><p class="hispop2">' + '&nbsp;&nbsp;Pixel : ' + Math.floor(data_object["pixels"][0]) + "," + Math.floor(data_object["pixels"][1]) + '</p>' + '<span class="balloon">' + hist0count + '</span></div>'; //<p class="hispop">'+hist0count+'</p>
        //umemo thumnailboxの左上部分, clickされた座標表示
        document.getElementById("click_position").innerHTML = '<button type="button" name="chistory0" align="right" value="' + Math.floor(0) + "," + Math.floor(hist0count) + '"\
                        class="squareA" onclick="click_reRef(this);"  >' + "\
                        &nbsp;&nbsp;Long : " + data_object["coordinate"][0].toFixed(4) + "&nbsp;&nbsp;Lat : " + data_object["coordinate"][1].toFixed(4) + '</button><p class="hispop">' + '&nbsp;&nbsp;Pixel : ' + Math.floor(data_object["pixels"][0]) + "," + Math.floor(data_object["pixels"][1]) + '</p>'; //<p class="hispop">'+hist0count+'</p>

        hist0count = hist0count + 1;
    } else if (NumberOfThumbnail === 1) {
        var cal_h2 = 35 * hist1count + 42;
        if (cal_h2 > 440) {
            cal_h2 = 440;
        }
        if (hist1count == 0) cal_h2 = 0;
        cal_h2 += "px";
        document.getElementById("click_history2").style.height = cal_h2;
        var element = histTop2 + document.getElementById("click_history2").innerHTML;
        document.getElementById("click_history2").innerHTML = element;
        history_json1.push(data_object);

        histTop2 = '<div class="balloonoya"><button type="button" name="chistory0" align="right" value="' + Math.floor(1) + "," + Math.floor(hist1count) + '"\
                        class="squareB" onclick="click_reRef(this);"  >' + "\
                        &nbsp;&nbsp;Lon : " + data_object["coordinate"][0].toFixed(4) + "<br>&nbsp;&nbsp;Lat : " + data_object["coordinate"][1].toFixed(4) + '</button><p class="hispop2">' + '&nbsp;&nbsp;Pixel : ' + Math.floor(data_object["pixels"][0]) + "," + Math.floor(data_object["pixels"][1]) + '</p>' + '<span class="balloon">' + hist1count + '</span></div>'; //<p class="hispop">'+hist0count+'</p>

        document.getElementById("click_position2").innerHTML = '<button type="button" name="chistory0" align="right" value="' + Math.floor(1) + "," + Math.floor(hist1count) + '"\
                        class="squareA" onclick="click_reRef(this);"  >' + "\
                        &nbsp;&nbsp;Long : " + data_object["coordinate"][0].toFixed(4) + "&nbsp;&nbsp;Lat : " + data_object["coordinate"][1].toFixed(4) + '</button><p class="hispop">' + '&nbsp;&nbsp;Pixel : ' + Math.floor(data_object["pixels"][0]) + "," + Math.floor(data_object["pixels"][1]) + '</p>'; //<p class="hispop">'+hist0count+'</p>

        hist1count = hist1count + 1;
    }
}


//umemo thumnailboxの左上と右部分をクリックでspectral表示のためにデータ受け渡し
function click_reRef(result) {
    var result2;
    result2 = result.value; //umemo value=Math.floor
    var info = result2.split(",");
    if (info[0] == 0) {
        var hisjson = JSON.stringify(history_json0[info[1]]); //umemo JSON.stringify()メソッドは、あるJavaScriptのオブジェクトや値をJSON文字列に変換
        var data_object = JSON.parse(hisjson); //umemo JSON.parse()メソッドは文字列をJSONとして解析し、文字列によって記述されているJavaScriptの値やオブジェクトを構築
        var re_pixels = data_object["pixels"];
        var Image_size_xy = data_object["Image_size"];
        var obs_ID = data_object["obs_ID"];
        var obs_name = data_object["obs_name"];
        var path = data_object["path"];
        var image_path = data_object["Image_path"];
        var wavelength = data_object["band_bin_center"]
    } else if (info[0] == 1) {
        var hisjson = JSON.stringify(history_json1[info[1]]);
        var data_object = JSON.parse(hisjson);
        var re_pixels = data_object["pixels"];
        var Image_size_xy = data_object["Image_size"];
        var obs_ID = data_object["obs_ID"];
        var obs_name = data_object["obs_name"];
        var path = data_object["path"];
        var image_path = data_object["Image_path"];
        var wavelength = data_object["band_bin_center"]
    }
    getdatafromdirectory_reflectance(re_pixels, Image_size_xy, obs_ID, path, image_path, obs_name, wavelength, 1);
}






function CLOSE(flag_close) {
    if (flag_close === 1) {
        var e_image = document.getElementById("image_move");
        var imageAreaSet = document.getElementById("imageArea");
        roots.map.entities.remove(wyoming);
        if (!!(flag_thumbnailX & flag_STATE.Red)) {
            flag_thumbnailX = 0;
            flag_thumbnailX = flag_thumbnailX | flag_STATE.None;
        } else if (!!(flag_thumbnailX & flag_STATE.RedUpper)) {
            flag_thumbnailX = 0;
            flag_thumbnailX = flag_thumbnailX | flag_STATE.Green;
        }
        entity.description = {
            getValue: function() {
                return '';
            }
        };
        entity.name = "Ancillary Info.";
        infobox_txt1.txt = "";
        infobox_txt1.name = "";
    } else if (flag_close === 2) {
        var e_image = document.getElementById("image_move2");
        var imageAreaSet = document.getElementById("imageArea2");
        roots.map.entities.remove(wyoming2);
        if (!!(flag_thumbnailX & flag_STATE.Green)) {
            flag_thumbnailX = 0;
            flag_thumbnailX = flag_thumbnailX | flag_STATE.None;
        } else if (!!(flag_thumbnailX & flag_STATE.GreenUpper)) {
            flag_thumbnailX = 0;
            flag_thumbnailX = flag_thumbnailX | flag_STATE.Red;
        }
        entity.description = {
            getValue: function() {
                return '';
            }
        };
        entity.name = "Ancillary Info.";
        infobox_txt2.txt = "";
        infobox_txt2.name = "";
    }
    imageAreaSet.innerHTML = "";
    e_image.style.width = "0px";
    e_image.style.height = "0px";
    imageAreaSet.style.width = "0px";
    imageAreaSet.style.height = "0px";
}



function terrain_magni(value) {
    var Terrain_reset = function() {
        roots.map.terrainProvider = terrainProvider_elli;
        setTimeout(Terrain_adjust, 100);
    }
    var Terrain_adjust = function() {
        roots.map.terrainProvider = terrainProvider_set;
        roots.map.scene._terrainExaggeration = value;
    }
    Terrain_reset();
}



//umemo thumnailbox内のdownloadボタン、thumnailをダウンロード出来る仕様だが出来てない
function ratio_layer1(obj) {
    var ratio_layer_onoroff;
    var id = obj.selectedIndex;
    if (obj.selectedIndex == 0) {
        ratio_layer_onoroff = false;
    } else {
        ratio_layer_onoroff = true;
    }

    if (ratio_layer_onoroff) {
        if (ratio_flag) {
            wms_layers.thumbnail.removeLayer(ratio_layer);
        }
        ratio_layer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: obj.options[id].value,
                projection: wms_layers.ratio.orange.projection,
                imageExtent: wms_layers.ratio.orange.extent
            })
        });

        wms_layers.thumbnail.getLayers().insertAt(1, ratio_layer);

        var div_element_figure2 = document.createElement("div");
        var sliderset = document.getElementById("slider");
        sliderset.innerHTML = "";

        div_element_figure2.innerHTML = "<input class='ratio' id=slider_ratio type='range' name='range' min='0.0' max='1.0' step='0.1' value='1' orient='vertical'>\
                <div style='position:absolute;top:0px;left:30px;'> <p><a href=" + obj.options[id].value + " download=" + obj.options[id].text + ">Download</a></div>";

        var product_figure2 = sliderset;
        product_figure2.appendChild(div_element_figure2);
        var slide = document.getElementById('slider_ratio');
        slide.addEventListener('input', function(e) {
            ratio_layer.setOpacity(this.value);
        });
        ratio_flag = true;
    } else {
        if (ratio_flag) {
            wms_layers.thumbnail.removeLayer(ratio_layer);
            ratio_flag = false;
        }
    }
}

function ratio_layer2(obj) {
    var ratio_layer_onoroff;
    var id = obj.selectedIndex;
    if (obj.selectedIndex == 0) {
        ratio_layer_onoroff = false;
    } else {
        ratio_layer_onoroff = true;
    }

    if (ratio_layer_onoroff) {
        if (ratio_flag2) {
            wms_layers.thumbnail2.removeLayer(ratio_layer_g);
        }
        ratio_layer_g = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: obj.options[id].value,
                projection: wms_layers.ratio.green.projection,
                imageExtent: wms_layers.ratio.green.extent
            })
        });

        wms_layers.thumbnail2.getLayers().insertAt(1, ratio_layer_g);

        var div_element_figure2 = document.createElement("div");
        var sliderset = document.getElementById("slider2");
        sliderset.innerHTML = "";

        div_element_figure2.innerHTML = "<input class='ratio2' id=slider_ratio2 type='range' name='range' min='0.0' max='1.0' step='0.1' value='1' orient='vertical'>\
                <div style='position:absolute;top:0px;left:30px;'> <p><a href=" + obj.options[id].value + " download=" + obj.options[id].text + ">Download</a></div>";
        var product_figure2 = sliderset;
        product_figure2.appendChild(div_element_figure2);
        var slide = document.getElementById('slider_ratio2');
        slide.addEventListener('input', function(e) {
            ratio_layer_g.setOpacity(this.value);
        });
        ratio_flag2 = true;
    } else {
        if (ratio_flag2) {
            wms_layers.thumbnail2.removeLayer(ratio_layer_g);
            ratio_flag2 = false;
        }
    }
}
