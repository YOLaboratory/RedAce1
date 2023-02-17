var map;
var roots = {};
var wms_layers = {};
wms_layers.json = {};
wms_layers.ratio={};
var terrainProvider_set;
var terrainProvider_elli;
var layer_check;
var cartesian_event;
var cricle_dis=300;
var firstinfo=false;


//rgb(255, 165, 0)　オレンジ
//rgb(250, 210, 107) 黄色オレンジ-->goldenrod rgb(218, 165, 32)
//#d9d9d9　白グレー
//rgb(0, 128, 0) 緑
//#00BCD4 水色 ,--> aqua rgb(0, 255, 255)
$(function() {
    $("#graphtab1").click(function(event) {
        var check_graph_color_flag = 0;
        if($(this).css("background-color") == "rgb(218, 165, 32)") { check_graph_color_flag = 1; }
        $(this).css("background-color", "aqua");
        var check_graphtab2 = $("#graphtab2").css("background-color");
        var check_graphtab3 = $("#graphtab3").css("background-color");
        if(check_graph_color_flag != 1){
            if(check_graphtab2 == "rgb(218, 165, 32)" || check_graphtab3 == "rgb(218, 165, 32)") { check_graph_color_flag = 2; }}
        if(check_graphtab2 == "rgb(0, 255, 255)"){
            if(check_graph_color_flag != 0){ 
                $("#graphtab2").css("background-color", "#d9d9d9");
            }else { 
                $("#graphtab2").css("background-color", "goldenrod"); }}
        if(check_graphtab3 == "rgb(0, 255, 255)"){
            if(check_graph_color_flag != 0){ 
                $("#graphtab3").css("background-color", "#d9d9d9");
            }else { 
                $("#graphtab3").css("background-color", "goldenrod"); }}
        if( Chart_list.length > 0 ) setTimeout(function(){ refresh_graph(0); }, 10 );
    });

    $("#graphtab2").click(function(event) {
        var check_graph_color_flag2 = 0;
        if($(this).css("background-color") == "rgb(218, 165, 32)"){ check_graph_color_flag2 = 1; }
        $(this).css("background-color", "aqua");
        var check_graphtab1 = $("#graphtab1").css("background-color");
        var check_graphtab3 = $("#graphtab3").css("background-color");
        if(check_graph_color_flag2 != 1){ 
            if(check_graphtab1 == "rgb(218, 165, 32)" || check_graphtab3 == "rgb(218, 165, 32)"){ check_graph_color_flag2 = 2; }}
        if($("#graphtab1").css("background-color") == "rgb(0, 255, 255)"){
            if(check_graph_color_flag2 != 0){
                $("#graphtab1").css("background-color", "#d9d9d9");
            }else {
                $("#graphtab1").css("background-color", "goldenrod"); }}
        if($("#graphtab3").css("background-color") == "rgb(0, 255, 255)"){
            if(check_graph_color_flag2 != 0){
                $("#graphtab3").css("background-color", "#d9d9d9");
            }else {
                $("#graphtab3").css("background-color", "goldenrod"); }}
        if( Chart_list.length > 1 ) setTimeout(function(){ refresh_graph(1); }, 10 );
    });

    $("#graphtab3").click(function(event) {
        var check_graph_color_flag3 = 0;
        if($(this).css("background-color") == "rgb(218, 165, 32)"){ check_graph_color_flag3 = 1; }
        $(this).css("background-color", "aqua");
        var check_graphtab1 = $("#graphtab1").css("background-color");
        var check_graphtab2 = $("#graphtab2").css("background-color");
        if(check_graph_color_flag3 != 1){
            if(check_graphtab1 == "rgb(218, 165, 32)" || check_graphtab2 == "rgb(218, 165, 32)"){ check_graph_color_flag3 = 2; }}
        if($("#graphtab1").css("background-color") == "rgb(0, 255, 255)"){
            if(check_graph_color_flag3 != 0){
                $("#graphtab1").css("background-color", "#d9d9d9");
            }else {
                $("#graphtab1").css("background-color", "goldenrod"); }}
        if($("#graphtab2").css("background-color") == "rgb(0, 255, 255)"){
            if(check_graph_color_flag3 != 0){
                $("#graphtab2").css("background-color", "#d9d9d9");
            }else {
                $("#graphtab2").css("background-color", "goldenrod"); }}
        if(Chart_list.length > 2) setTimeout(function(){ refresh_graph(2); }, 10 );
    });

    function refresh_graph(value) {
        Chart_list[value].resize();
    }

    var graph_onclick = 0;
    var mouse;
    var mouse_image;
    var mouse_image2;
    var clickOffsetTop;
    var clickOffsetLeft;
    var clickOffsetTop_image;
    var clickOffsetLeft_image;
    var clickOffsetTop_image2;
    var clickOffsetLeft_image2;
    var jiji_hajikiY = 0;
    var jiji_hajikiX = 0;
    var count_mouse_image = 1;
    var count_mouse_image2 = 1;
    var count_mouse_graph = 1;

    // 補助情報のダウンロード
    $('iframe').on('load', function() {
        $(this).contents().on('mousemove', onMouseMove);
        $(this).contents().on('mouseup', onMouseUP);
        $(this).contents().on('click', infoBox_z);
        $(this).contents().on('click','#anc_dl_xlsx', download_xlsx_anc);
        $(this).contents().on('click','#anc_dl_csv', download_csv_anc);
        $(this).contents().on('click','#anc_dl_json', download_json_anc);
        $(this).contents().on('click','#anc_dl_pvl', download_pvl_anc);
    });

    var graph_mouse_flag = true;
    var image_mouse_flag;
    var image2_mouse_flag;
    var dbl = false;
    var dblflag = 1;
    var e_graph = document.getElementById('graph_move');
    var ee_graph = document.getElementById('graph');
    var e_image = document.getElementById('image_move');
    var ee_image = document.getElementById('imageArea');
    var e_image2 = document.getElementById('image_move2');
    var ee_image2 = document.getElementById('imageArea2');
    var zIndex_content = {
        "z0": e_graph,
        "z1": ee_graph,
        "z2": e_image,
        "z3": ee_image,
        "z4": e_image2,
        "z5": ee_image2
    }

    ee_image.onmouseup = function(evt) {
        image_mouse_flag = false;
    };
    ee_image2.onmouseup = function(evt) {
        image2_mouse_flag = false;
    };
    e_image.onmouseup = function(evt) {
        image_mouse_flag = false;
    };
    e_image2.onmouseup = function(evt) {
        image2_mouse_flag = false;
    };
    e_image.onmousedown = function(evt) {
        firstinfo=true;
        NumberOfThumbnail = 0;

        if(!!(flag_thumbnailX &flag_STATE.GreenUpper)){
            flag_thumbnailX=0;
            flag_thumbnailX=flag_thumbnailX|flag_STATE.RedUpper;
            roots.map.entities.remove(wyoming2);
            roots.map.entities.add(wyoming2);
        }

        entity.name = infobox_txt1.name;

        entity.description = {
            getValue: function() {
                return infobox_txt1.txt;
            }
        };

        delete zIndex_content["z2"];
        delete zIndex_content["z3"];
        var i;
        i = 1000;

        zIndex_content["z2"] = e_image;
        zIndex_content["z3"] = ee_image;

        for (var key in zIndex_content) {
            zIndex_content[key].style.zIndex = i;
            i = i + 1;
        }

        ee_image.onmousedown = function(evt) {
            image_mouse_flag = evt.isTrusted;
        };

        if (image_mouse_flag != true) {
            mouse_image = 'down';
            evt = (evt) || window.event;

            clickOffsetTop_image = evt.clientY - e_image.offsetTop;
            clickOffsetLeft_image = evt.clientX - e_image.offsetLeft;
        }
    };

    e_image2.onmousedown = function(evt) {
        NumberOfThumbnail = 1;

        if(!!(flag_thumbnailX &flag_STATE.RedUpper)){
            flag_thumbnailX=0;
            flag_thumbnailX=flag_thumbnailX|flag_STATE.GreenUpper;
            roots.map.entities.remove(wyoming);
            roots.map.entities.add(wyoming);
        }

        entity.name = infobox_txt2.name;

        entity.description = {
            getValue: function() {
                return infobox_txt2.txt;
            }
        };

        delete zIndex_content["z4"];
        delete zIndex_content["z5"];
        var i;
        i = 1000;

        zIndex_content["z4"] = e_image2;
        zIndex_content["z5"] = ee_image2;

        for (var key in zIndex_content) {
            zIndex_content[key].style.zIndex = i;
            i = i + 1;
        }

        ee_image2.onmousedown = function(evt) {
            image2_mouse_flag = evt.isTrusted;
        };
        if (image2_mouse_flag != true) {
            mouse_image2 = 'down';
            evt = (evt) || window.event;

            clickOffsetTop_image2 = evt.clientY - e_image2.offsetTop;
            clickOffsetLeft_image2 = evt.clientX - e_image2.offsetLeft;
        }
    };

    function infoBox_z(evt) {
        if(firstinfo!=false){
            for (var key in zIndex_content) {
                zIndex_content[key].style.zIndex = zIndex_content[key].style.zIndex - 20;
            }
        }
    }

    ee_graph.onmouseup = function(evt) {
        graph_mouse_flag = false;
    };
    e_graph.onmouseup = function(evt) {
        graph_mouse_flag = false;
    };
    e_graph.onmousedown = function(evt) {
        delete zIndex_content["z0"];
        delete zIndex_content["z1"];
        var i;
        i = 1000;

        zIndex_content["z0"] = e_graph;
        zIndex_content["z1"] = ee_graph;

        for (var key in zIndex_content) {
            zIndex_content[key].style.zIndex = i;
            i = i + 1;
        }

        ee_graph.onmousedown = function(evt) {
            graph_mouse_flag = evt.isTrusted;
        };

        if (graph_mouse_flag !== true) {
            mouse = 'down';
            evt = (evt) || window.event;
            clickOffsetTop = evt.clientY - e_graph.offsetTop;
            clickOffsetLeft = evt.clientX - e_graph.offsetLeft;
        }
    };

    document.onmouseup = function() {
        mouse = 'up';
        mouse_image = 'up';
        mouse_image2 = 'up';
    };

    document.onmousemove = function(evt) {
        count_mouse_image = 1;
        count_mouse_image2 = 1;
        count_mouse_graph = 1;

        jiji_hajikiY = evt.clientY;
        jiji_hajikiX = evt.clientX;

        evt = (evt) || window.event;
        if (mouse === 'down') {
            e_graph.style.top = evt.clientY - clickOffsetTop + 'px';
            e_graph.style.left = evt.clientX - clickOffsetLeft + 'px';
        }
        if (mouse_image === 'down') {
            e_image.style.top = evt.clientY - clickOffsetTop_image + 'px';
            e_image.style.left = evt.clientX - clickOffsetLeft_image + 'px';
        }
        if (mouse_image2 === 'down') {
            e_image2.style.top = evt.clientY - clickOffsetTop_image2 + 'px';
            e_image2.style.left = evt.clientX - clickOffsetLeft_image2 + 'px';
        }
    };


    function onMouseMove(evt) {
        evt = (evt) || window.event;
        if (mouse === 'down') {
            if (count_mouse_graph === 1) {
                jiji_hajikiX = jiji_hajikiX - evt.clientX;
                jiji_hajikiY = jiji_hajikiY - evt.clientY;
                count_mouse_graph = 0;
            }

            e_graph.style.top = evt.clientY + jiji_hajikiY - clickOffsetTop + 'px';
            e_graph.style.left = evt.clientX + jiji_hajikiX - clickOffsetLeft + 'px';
        }

        if (mouse_image === 'down') {
            if (count_mouse_image === 1) {
                jiji_hajikiX = jiji_hajikiX - evt.clientX;
                jiji_hajikiY = jiji_hajikiY - evt.clientY;
                count_mouse_image = 0;
            }
            e_image.style.top = evt.clientY + jiji_hajikiY - clickOffsetTop_image + 'px';
            e_image.style.left = evt.clientX + jiji_hajikiX - clickOffsetLeft_image + 'px';
        }

        if (mouse_image2 === 'down') {
            if (count_mouse_image2 === 1) {
                jiji_hajikiX = jiji_hajikiX - evt.clientX;
                jiji_hajikiY = jiji_hajikiY - evt.clientY;
                count_mouse_image2 = 0;
            }
            e_image2.style.top = evt.clientY + jiji_hajikiY - clickOffsetTop_image2 + 'px';
            e_image2.style.left = evt.clientX + jiji_hajikiX - clickOffsetLeft_image2 + 'px';
        }
    }

    function onMouseUP() {
        mouse = 'up';
        mouse_image = 'up';
        mouse_image2 = 'up';
    }
});



function init_map() {
    var baselayer;
    var userSetbaselayer;
    var OriginBaselayer;
    var OriginBaselayer2;

    var MOLA_THEMIS_blend_Layer = new Cesium.WebMapServiceImageryProvider({
        url: "http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
        layers: 'MOLA_THEMIS_blend',
        proxy: new Cesium.DefaultProxy('/proxy'),
        parameters: {
            format: 'image/png',
        }
    });
    var ellipsoid = new Cesium.Ellipsoid(3396190.0, 3396190.0, 3396190.0);

    terrainProvider_set=new Cesium.CesiumTerrainProvider({
        url: Network_terrainserver,
        // url: 'http://192.168.1.14/redace_terrain/tilesets/mars',
        // url: 'http://192.168.1.14:9000/tilesets/LDEM_GDR',
        // url: 'http://192.168.1.14:8888'
        // ellipsoid:mars_ellipsoid,
        // requestVertexNormals:true,
        ellipsoid: ellipsoid
    });

    roots.map = new Cesium.Viewer("map", {
        //umemo 起伏設定部分
        terrainProvider: terrainProvider_set,
        terrainExaggeration : 2.0, //umemo なぜか1だと変になる。

        skyAtmosphere: new Cesium.SkyAtmosphere(new Cesium.Ellipsoid(3372090.0, 3372090.0, 3372090.0)),

        imageryProvider: MOLA_THEMIS_blend_Layer,
        mapProjection: new Cesium.GeographicProjection(ellipsoid),

        timeline: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        infoBox: true,
        navigationHelpButton: false,
        selectionIndicator: false,
        vrButton: true,
    });
    roots.map.scene.skyAtmosphere.hueShift = 0.5;
    roots.map.scene.fog.enabled = false;

    terrainProvider_elli=new Cesium.EllipsoidTerrainProvider({
        ellipsoid:ellipsoid
    });

    var imageryLayers = roots.map.imageryLayers;

    viewModel = {
        layers: [],
        baseLayers: [],
        upLayer: null,
        downLayer: null,
        selectedLayer: null,
        isSelectableLayer: function(layer) {
            return this.baseLayers.indexOf(layer) >= 0;
        },
        raise: function(layer, index) {
            imageryLayers.raise(layer);
            viewModel.upLayer = layer;
            viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
            updateLayerList();
            window.setTimeout(function() { viewModel.upLayer = viewModel.downLayer = null; }, 10);
        },
        lower: function(layer, index) {
            imageryLayers.lower(layer);
            viewModel.upLayer = viewModel.layers[Math.min(viewModel.layers.length - 1, index + 1)];
            viewModel.downLayer = layer;
            updateLayerList();
            window.setTimeout(function() { viewModel.upLayer = viewModel.downLayer = null; }, 10);
        },
        canRaise: function(layerIndex) {
            return layerIndex > 0;
        },
        canLower: function(layerIndex) {
            return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
        }
    };
    var baseLayers = viewModel.baseLayers;

    Cesium.knockout.track(viewModel);

    function addBaseLayerOption(name, imageryProvider) {
        var layer;
        if (typeof imageryProvider === 'undefined') {
            layer = imageryLayers.get(0);
            viewModel.selectedLayer = layer;
        } else {
            layer = new Cesium.ImageryLayer(imageryProvider);
        }
        layer.name = name;
        baseLayers.push(layer);
    }

    function addAdditionalLayerOption(name, imageryProvider, alpha, show) {
        var layer = imageryLayers.addImageryProvider(imageryProvider);
        layer.alpha = Cesium.defaultValue(alpha, 0.5);
        layer.show = Cesium.defaultValue(show, true);
        layer.name = name;
        Cesium.knockout.track(layer, ['alpha', 'show', 'name']);
    }

    function updateLayerList() {
        var numLayers = imageryLayers.length;
        viewModel.layers.splice(0, viewModel.layers.length);
        for (var i = numLayers - 1; i >= 0; --i) {
            viewModel.layers.push(imageryLayers.get(i));
        }
    }

    layer_check = viewModel;

    function setupLayers() {
        addBaseLayerOption( // the current base layer
            'MOLA THEMIS blend',
            undefined
        );
        addBaseLayerOption(
            'MOLA_color',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
                layers: 'MOLA_color',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                }
            })
        );
        addBaseLayerOption(
            'MDIM21 color',
            new Cesium.WebMapServiceImageryProvider({
                url: "http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
                layers: 'MDIM21_color',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                }
            })
        );
        addBaseLayerOption(
            'VIKING',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/deimos_simp_cyl.map",
                layers: 'VIKING',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                }
            })
        );
        addBaseLayerOption(
            'THEMIS_night',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
                layers: 'THEMIS_night',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                }
            })
        );
        addBaseLayerOption(
            'THEMIS',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
                layers: 'THEMIS',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                }
            })
        );
        addBaseLayerOption(
            'MDIM21',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
                layers: 'MDIM21',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                }
            })
        );
        addBaseLayerOption(
            'Viking mdim2.1',
            new Cesium.UrlTemplateImageryProvider({
                //url : "http://192.168.1.14/test/wmts/viking_mdim2.1/{z}/{x}/{reverseY}.png",
                //url : "http://192.168.1.14:9000/wmts/viking_mdim2.1/{z}/{x}/{reverseY}.png",
                url: basemap_viking_mdim,
                //tilingScheme : new Cesium.GeographicTilingScheme(),
                maximumLevel : 7
            })
        );
        addBaseLayerOption(
            'MGS MOLA',
            new Cesium.UrlTemplateImageryProvider({
                //url : "http://192.168.1.14/test/wmts/viking_mdim2.1/{z}/{x}/{reverseY}.png",
                //url : "http://192.168.1.14:9000/wmts/MGS_MOLA/{z}/{x}/{reverseY}.png",
                url: basemap_MGS_MOLA,
                //tilingScheme : new Cesium.GeographicTilingScheme(),
                maximumLevel : 6
            })
        );


        // addBaseLayerOption(
        //     'TEST_WMTS',
        //     new Cesium.WebMapTileServiceImageryProvider({
        //         //url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
        //         //'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/AMSR2_Snow_Water_Equivalent/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png'
        //         url:"http://192.168.1.14:9000/wmts/viking_mdim2.1/{TileMatrix}/{TileRow}/{TileCol}.png",
        //         //layers: 'viking_mdim2.1',

        //         proxy: new Cesium.DefaultProxy('/proxy'),
        //         parameters: {
        //             format: 'image/png',
        //         }
        //     }));
        // addBaseLayerOption(
        //     'USGSShadedReliefOnly',
        //     new Cesium.WebMapTileServiceImageryProvider({
        //     url : 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS/tile/1.0.0/USGSShadedReliefOnly/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
        //     layer : 'USGSShadedReliefOnly',
        //     style : 'default',
        //     format : 'image/jpeg',
        //     tileMatrixSetID : 'default028mm',
        //     maximumLevel: 19,
        //     credit : new Cesium.Credit({ text : 'U. S. Geological Survey' })
        // }));
        // addBaseLayerOption(
        //     'GENERIC',
        //     new Cesium.WebMapServiceImageryProvider({
        //         url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/generic/generic_simp_cyl.map",
        //         layers: 'GENERIC',
        //         proxy: new Cesium.DefaultProxy('/proxy'),
        //         parameters: {
        //             format: 'image/png',
        //         }
        //     }));

        //    addBaseLayerOption(
        // 'GENERIC',
        // new Cesium.WebMapServiceImageryProvider({
        //     url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/generic/generic_simp_cyl.map",
        //     layers: 'GENERIC',
        //     proxy: new Cesium.DefaultProxy('/proxy'),
        //     parameters: {
        //         format: 'image/png',
        //     }
        // }));
        // addAdditionalLayerOption(
        //     'line',
        //     new Cesium.WebMapServiceImageryProvider({
        //         url: "http://localhost8080/?map=/usr/share/mapserver/examples/critesline.map",
        //         layers: 'line',
        //         enablePickFeatures: false,
        //         proxy: new Cesium.DefaultProxy('/proxy'),
        //         parameters: {
        //             format: 'png',
        //             transparent: 'true',
        //         }
        //     }), 1.0, false);
        // addAdditionalLayerOption(
        //     'Saved_Point',//Red Ace postGIS at docker network
        //     // loadgeojson(record_json['geojson']),
        //     loadgeojson(geojson),
        //     0.6, false);

        addAdditionalLayerOption(
            'CRISM',//Red Ace postGIS at docker network
            new Cesium.WebMapServiceImageryProvider({
                url: Network_mapserver+"/crism.map",
                //url: "http://192.168.1.14/redace_map/?map=/maps/crism.map",
                layers: 'crism',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                    //transparent: 'true',
                }
            }), 0.6, false
        );
        addAdditionalLayerOption(
            'THEMIS',//Red Ace postGIS at docker network
            new Cesium.WebMapServiceImageryProvider({
                url: Network_mapserver+"/themis.map",
                layers: 'themis',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                    //transparent: 'true',
                }
            }), 0.6, false
        );

            testep=new Cesium.WebMercatorTilingScheme({
                //rectangleSouthwestInMeters:new Cesium.Cartesian2(0, 90),

                } );

            //testep=new Cesium.WebMercatorProjection(Cesium.Ellipsoid.WGS84);


            // tresult={};
            // tresult.west=-315;
            // tresult.south = -86.7799;
            // tresult.east = 40.9568;
            // tresult.north = -38.2004;



            // pp=new PolarTilingSchema({
            //     rectangleSouthwestInMeters:new Cesium.Cartesian2(-86.7799,-310.957),
            //     rectangleNortheastInMeters:new Cesium.Cartesian2(-38.2004, 45)


            // });

            // console.log(testep);
            // console.log(pp);
            // Cesium.WebMercatorTilingScheme.prototype.rectangleToNativeRectangle=tresult;

            // testep.rectangle.east=-2.356194490192345;
            // testep.rectangle.north=-1.1330051337965372;
            // testep.rectangle.south=-1.1330051337965372;
            // testep.rectangle.west=-2.356194490192345;


            // console.log(testep);

            // addAdditionalLayerOption(
            // 'polar_test_mars',
            // new Cesium.WebMapServiceImageryProvider({
            //     url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_spole.map&",
            //     layers: 'MOLA_color_south',
            //     proxy: new Cesium.DefaultProxy('/proxy'),
            //     parameters: {
            //         format: 'image/png',
            //         srs:"EPSG:32761",
            //     },
            //     tilingScheme: pp,

            // }), 1, false);

        // addAdditionalLayerOption(
        //     'polaer_test_moon',
        //     new Cesium.WebMapServiceImageryProvider({
        //         url: "http://chart.la-terre.co.jp:8080/?",
        //         layers: 'ENC',
        //         proxy: new Cesium.DefaultProxy('/proxy'),
        //         parameters: {
        //             format: 'image/png',
        //             //srs:Proj4js["IAU2000:49918"],
        //             //transparent: 'true',
        //             srs:"EPSG:32761",
        //         },
        //         // rectangle:new Cesium.Rectangle(
        //         //     Cesium.Math.toRadians(-159.963),
        //         //     Cesium.Math.toRadians(-76.4446),
        //         //     Cesium.Math.toRadians(-110.037),
        //         //     Cesium.Math.toRadians(-53.8634)
        //         // ),
        //         //tilingScheme: new Cesium.WebMercatorTilingScheme({
        //             tilingScheme: new Cesium.WebMercatorTilingScheme({
        //          //tilingScheme: new Cesium.GeographicTilingScheme({
        //         //rectangleSouthwestInMeters: new Cesium.Cartesian2(-90, -90),
        //         //rectangleNortheastInMeters: new Cesium.Cartesian2(90, 90),
        //                 //rectangle:new Cesium.Rectangle(-159.963, -76.4446,-110.037, -53.8634),
        //                // rectangle:new Cesium.Rectangle(-2.7918810313676894,-1.3342099653700572,-1.9205079490170005, -0.9400936763187137),
        //         // rectangle:new Cesium.Rectangle(
        //         //     Cesium.Math.toRadians(-159.963),
        //         //     Cesium.Math.toRadians(-76.4446),
        //         //     Cesium.Math.toRadians(-110.037),
        //         //     Cesium.Math.toRadians(-53.8634)
        //         // ),
        //         // projection :new Cesium.MapProjection({0,-90,0

        //         //    // project:new Cesium.Cartographic(longitude, latitude, height)

        //         //    } ),

        //         } ),
        //        // WebMercatorTilingScheme.prototype.rectangleToNativeRectangle(),
        //     }), 1, false);
        //console.log(Cesium.Rectangle.fromDegrees(-159.963, -76.4446,-110.037, -53.8634));

        // addAdditionalLayerOption(
        //     'test',//Red Ace postGIS at docker network
        //     new Cesium.WebMapServiceImageryProvider({
        //         url: "http://192.168.1.14:8080/?map=/maps/test.map",
        //         layers: 'test',
        //         proxy: new Cesium.DefaultProxy('/proxy'),
        //         parameters: {
        //             format: 'image/png',
        //             //srs:Proj4js["IAU2000:49918"],
        //             //transparent: 'true',

        //         },


        //     }), 0.6, false);

        addAdditionalLayerOption(
            'Mars500K_Quads',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl_quads.map",
                layers: 'Mars500K_Quads',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                    transparent: 'true',
                }
            }), 1.0, false
        );
        addAdditionalLayerOption(
            'Mars2M_Quads',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl_quads.map",
                layers: 'Mars2M_Quads',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                    transparent: 'true',
                }
            }), 1.0, false
        );
        addAdditionalLayerOption(
            'Mars5M_Quads',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl_quads.map",
                layers: 'Mars5M_Quads',
                proxy: new Cesium.DefaultProxy('/proxy'),
                parameters: {
                    format: 'image/png',
                    transparent: 'true',
                }
            }), 1.0, false
        );






        // addBaseLayerOption(
        //   'addLayer',
        //   new Cesium.WebMapServiceImageryProvider({
        //     //url :"http://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map",
        //     url:url,
        //     //layers:'MDIM21_color',
        //     layers:layer,
        //     parameters:{
        //       format : 'image/png',
        //     }
        //   }));
        // addAdditionalLayerOption(
        //     'test2',
        //     new Cesium.WebMapServiceImageryProvider({
        //         url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?',
        //         layers: 'goes_conus_ir',

        //         parameters: {
        //             transparent: 'true',
        //             format: 'image/png'
        //         }
        //     }), 1.0, false);
        addAdditionalLayerOption(
            'NOMENCLATURE',
            new Cesium.WebMapServiceImageryProvider({
                url: "https://wms.wr.usgs.gov/cgi-bin/mapserv?map=/var/www/html/mapfiles/mars/mars_nomen_wms.map",
                layers: 'NOMENCLATURE',
                parameters: {
                    transparent: 'true',
                    format: 'image/png',
                }
            }), 1.0, false
        );
    }

    setupLayers();
    updateLayerList();

    //Bind the viewModel to the DOM elements of the UI that call for it.
    var toolbar = document.getElementById('toolbar');
    Cesium.knockout.applyBindings(viewModel, toolbar);

    Cesium.knockout.getObservable(viewModel, 'selectedLayer').subscribe(function(baseLayer) {
        // Handle changes to the drop-down base layer selector.
        var activeLayerIndex = 0;
        var numLayers = viewModel.layers.length;
        for (var i = 0; i < numLayers; ++i) {
            if (viewModel.isSelectableLayer(viewModel.layers[i])) {
                activeLayerIndex = i;
                break;
            }
        }
        var activeLayer = viewModel.layers[activeLayerIndex];
        var show = activeLayer.show;
        var alpha = activeLayer.alpha;
        imageryLayers.remove(activeLayer, false);
        imageryLayers.add(baseLayer, numLayers - activeLayerIndex - 1);
        baseLayer.show = show;
        baseLayer.alpha = alpha;
        updateLayerList();
    });

    var entity = roots.map.entities.add({
        label: {
            show: false,
            showBackground: true,
            font: '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(15, 0)
        }
    });
    var handler;
    var lon_event;
    var lat_event;

    handler = new Cesium.ScreenSpaceEventHandler(roots.map.scene.canvas);
    handler.setInputAction(function(movement) {
        var ellipsoid_c = roots.map.scene.globe.ellipsoid;
        var cartesian = roots.map.camera.pickEllipsoid(movement.endPosition, ellipsoid_c);
        cartesian_event = cartesian;
        if (cartesian) {
            var cartographic = ellipsoid_c.cartesianToCartographic(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
            lon_event = longitudeString;
            lat_event = latitudeString;
            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text =
                'Lon: ' + ('   ' + longitudeString).slice(-15) + '\u00B0' +
                '\nLat: ' + ('   ' + latitudeString).slice(-15) + '\u00B0';
        } else {
            entity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    roots.map.canvas.addEventListener("pointerdown", onMouseDown);
    var downTime;
    function onMouseDown(event) {
        event.stopPropagation();
        event.preventDefault();
        downTime = new Date().getTime();
        roots.map.canvas.addEventListener("pointerup", onMouseUp);
    }
    function onMouseUp(event) {
        event.stopPropagation();
        event.preventDefault();
        var upTime = new Date().getTime();
        if (upTime - downTime < 200) {
            if (cartesian_event) {
                getdatafromdb(lon_event, lat_event);
            }
        }
        roots.map.canvas.removeEventListener("pointerup", onMouseUp);
    }
}


function mouseposition(){
    var entity = roots.map.entities.add({
        label: {
            show: false,
            showBackground: true,
            font: '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(15, 0)
        }
    });
    var handler;
    var lon_event;
    var lat_event;
    handler = new Cesium.ScreenSpaceEventHandler(roots.map.scene.canvas);
    handler.setInputAction(function(movement) {
        var ellipsoid_c = roots.map.scene.globe.ellipsoid;
        var cartesian = roots.map.camera.pickEllipsoid(movement.endPosition, ellipsoid_c);
        cartesian_event = cartesian;
        if (cartesian) {
            var cartographic = ellipsoid_c.cartesianToCartographic(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
            lon_event = longitudeString;
            lat_event = latitudeString;
            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text =
                'Lon: ' + ('   ' + longitudeString).slice(-15) + '\u00B0' +
                '\nLat: ' + ('   ' + latitudeString).slice(-15) + '\u00B0';
        } else {
            entity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}


function ORIGINAL_POSITION1() {
    var screen = Cesium.Fullscreen.fullscreen;
    flag_ref_position = true;
    var e1 = document.getElementById("image_move");
    var e2 = document.getElementById("image_move2");
    var e3 = document.getElementById("graph_move");
    e1.style.top = "300px";
    e1.style.left = "-540px";
    e2.style.top = "280px";
    e2.style.left = "-540px";
    e3.style.top = "100%";
    e3.style.left = "0px";
}


function ORIGINAL_POSITION2() {
    var e1 = document.getElementById("image_move");
    var e2 = document.getElementById("graph_move");
    e1.style.top = "50%";
    e1.style.left = "10px";
    e2.style.top = "10px";
    e2.style.left = "30%";
}


function testtest() {
    var itest;
    for (itest = 0; itest < layer_check.layers.length; itest++) {
        console.log(layer_check.layers[itest]);
        console.log(layer_check.layers[itest]._imageryProvider._layers);
        console.log(layer_check.layers[itest]._show);
    }
}
