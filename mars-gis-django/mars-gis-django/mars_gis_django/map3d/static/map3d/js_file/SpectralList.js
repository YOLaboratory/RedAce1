// SpectralList menu

//from map3d/index.html
get_spectra_axios = DjangoURL.get_spectra_axios;
record_spectra_user_id = DjangoURL.record_spectra_user_id;
record_spectra_user = DjangoURL.record_spectra_user;
change_permission = DjangoURL.change_permission;
description_update = DjangoURL.description_update;
delete_from_list = DjangoURL.delete_from_list;

var vm = new Vue({//umemo  use Vue.js (version Vue2)
    delimiters: ['[[', ']]'], //umemo djangoとvue.jsのカッコが被るため、vue.jsのカッコを定義
    el: '#app_vue',
    data: {
        dygraphs: [],
        record_spectra: [],
        dygraphs2_tmp: [],
        record_spectra2_tmp: []
    },
    mounted: function() {
        axios.defaults.xsrfCookieName = 'csrftoken'
        axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
        axios.get(get_spectra_axios)
        .then(function (response) {
            var response_data_json = JSON.parse(response.data);
            for(var d in response_data_json.spectra_list) {
                var dygraphs_tmp = response_data_json.dygraphs_spectra[d];
                var spectra_tmp = response_data_json.spectra_list[d]

                vm.dygraphs.push(dygraphs_tmp);
                vm.record_spectra.push(spectra_tmp);
                vm.dygraphs2_tmp.push(dygraphs_tmp);
                vm.record_spectra2_tmp.push(spectra_tmp);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
    },
    methods: {
        dygraphs_plot: function(spectrum){
            console.log("comecomecome")
        },
        get_record_spectra: function() {
            console.log("get_record_spectra here!!!!")
            vm.dygraphs.splice(0)
            vm.record_spectra.splice(0)
            vm.dygraphs2_tmp.splice(0)
            vm.record_spectra2_tmp.splice(0)
            axios.defaults.xsrfCookieName = 'csrftoken'
            axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
            console.log(vm.record_spectra);
            axios.get(get_spectra_axios)
            .then(function (response) {
                var response_data_json = JSON.parse(response.data);
                for(var d in response_data_json.spectra_list) {
                    var dygraphs_tmp = response_data_json.dygraphs_spectra[d];
                    var spectra_tmp = response_data_json.spectra_list[d]
                    console.log(spectra_tmp)
                    vm.dygraphs.push(dygraphs_tmp);
                    vm.record_spectra.push(spectra_tmp);
                    vm.dygraphs2_tmp.push(dygraphs_tmp);
                    vm.record_spectra2_tmp.push(spectra_tmp);
                }
            })
            .catch(function (error) {
                console.log(error);
            })
        },

        change_list: function(record_spectra) {
            vm.dygraphs.splice(0)
            vm.record_spectra.splice(0)
            var e = document.getElementById("select_list");
            var select_value = e.options[e.selectedIndex].value;
            console.log(select_value)
            axios.defaults.xsrfCookieName = 'csrftoken'
            axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
            axios.post(get_spectra_axios,{"id":record_spectra_user_id, "user":record_spectra_user, "selected":select_value})
            .then(function (response) {
                console.log(vm.dygraphs)
                var response_data_json = JSON.parse(response.data);
                for(var d in response_data_json.spectra_list) {
                    var dygraphs_tmp = response_data_json.dygraphs_spectra[d];
                    var spectra_tmp = response_data_json.spectra_list[d]
                    vm.dygraphs.push(dygraphs_tmp);
                    vm.record_spectra.push(spectra_tmp);
                }
                console.log(vm.dygraphs)
            })
        },

        graph: function(){
            var config = {
                labels: [ "wavelength", "reflectance" ],
                xlabel: 'Wavelength',
                showRangeSelector: true, 
                rangeSelectorHeight: 40, //umemo 下部の白グラフ
                // color: "orange", 
                axisLineColor: "black", 
                gridLineColor: "black",
                highlightSeriesBackgroundColor: "white", 
                highlightSeriesBackgroundAlpha: 1.0
            };
            for(var d in vm.dygraphs) {
                var graph = document.getElementById(vm.dygraphs[d].id_graph);
                var wv_ref = vm.dygraphs[d].data;
                new Dygraph(graph, wv_ref, config);
            }
        },

        change_permission: function(id_permission){
            console.log("changePermission")
            var e = document.getElementById(id_permission[0][0]);
            var select_value = e.options[e.selectedIndex].value;
            console.log(select_value)
            axios.defaults.xsrfCookieName = 'csrftoken'
            axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
            axios.post(change_permission,{"id_permission":id_permission[0][0], "change_to":select_value})
            this.record_spectra.forEach((object, index) => {
                if(object.id_permission === id_permission[0][0]){
                    this.$set(this.record_spectra[index], "permission", select_value)
                }
            })
        },

        change_order: function(record_spectra){
            var order_1 = document.getElementById("order_by#1");
            var order_1_key = order_1.options[order_1.selectedIndex].value;
            var order_1_order = document.getElementById("order_by#1_how");
            var order_1_how = order_1_order.options[order_1_order.selectedIndex].value;

            var order_2 = document.getElementById("order_by#2");
            var order_2_key = order_2.options[order_2.selectedIndex].value;
            var order_2_order = document.getElementById("order_by#2_how");
            var order_2_how = order_2_order.options[order_2_order.selectedIndex].value;

            if(order_1_key!="" && order_2_key==""){
                if(order_1_how=="ascending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_1_key] > b[order_1_key]) return 1;
                        if(a[order_1_key] < b[order_1_key]) return -1;
                        return 0;
                    })
                }else if(order_1_how=="descending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_1_key] > b[order_1_key]) return -1;
                        if(a[order_1_key] < b[order_1_key]) return 1;
                        return 0;
                    })
                }
            }

            if(order_1_key=="" && order_2_key!=""){
                if(order_2_how=="ascending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_2_key] > b[order_2_key]) return 1;
                        if(a[order_2_key] < b[order_2_key]) return -1;
                        return 0;
                    })
                }else if(order_2_how=="descending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_2_key] > b[order_2_key]) return -1;
                        if(a[order_2_key] < b[order_2_key]) return 1;
                        return 0;
                    })
                }
            }

            if(order_1_key!="" && order_2_key!=""){
                if(order_1_how=="ascending" && order_2_how=="ascending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_1_key] > b[order_1_key]) return 1;
                        if(a[order_1_key] < b[order_1_key]) return -1;
                        if(a[order_2_key] > b[order_2_key]) return 1;
                        if(a[order_2_key] < b[order_2_key]) return -1;
                        return 0;
                    })
                }
                else if(order_1_how=="ascending" && order_2_how=="descending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_1_key] > b[order_1_key]) return 1;
                        if(a[order_1_key] < b[order_1_key]) return -1;
                        if(a[order_2_key] > b[order_2_key]) return -1;
                        if(a[order_2_key] < b[order_2_key]) return 1;
                        return 0;
                    })
                }
                else if(order_1_how=="descending" && order_2_how=="ascending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_1_key] > b[order_1_key]) return -1;
                        if(a[order_1_key] < b[order_1_key]) return 1;
                        if(a[order_2_key] > b[order_2_key]) return 1;
                        if(a[order_2_key] < b[order_2_key]) return -1;
                        return 0;
                    })
                }
                else if(order_1_how=="descending" && order_2_how=="descending"){
                    vm.record_spectra.sort(function(a,b){
                        if(a[order_1_key] > b[order_1_key]) return -1;
                        if(a[order_1_key] < b[order_1_key]) return 1;
                        if(a[order_2_key] > b[order_2_key]) return -1;
                        if(a[order_2_key] < b[order_2_key]) return 1;
                        return 0;
                    })
                }
            }
        },

        update_description: function(id){
            console.log("update_description here!!")
            console.log(id[0][0])
            console.log(typeof(id[0][0]))
            var description_new = document.getElementById(id[0][0]).value;
            console.log(description_new)
            axios.defaults.xsrfCookieName = 'csrftoken'
            axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
            axios.post(description_update,{"id_update":id[0][0], "description":description_new})
            this.record_spectra.forEach((object, index) => {
                if(object.id_update === id[0][0]){
                    this.$set(this.record_spectra[index], "description", description_new)
                }
            })
        },

        delete_from_list: function(){
            console.log("delete from list here!!")
            area = $('[id="delete_from_list"]:checked').map(function(){
                return $(this).val();
            }).get();
            delete_list_index = [];
            delete_list_name = [];
            for(i=0; i<area.length; i++){
                this.record_spectra.forEach((object, index) => {
                    if(object.id_delete === area[i]){
                        delete_list_index.push(index);
                        delete_list_name.push(" "+this.record_spectra[index]["data_id"]+"("+this.record_spectra[index]["latitude"]+", "+this.record_spectra[index]["longitude"]+")")
                    }
                })
            }
            var e = document.getElementById("select_list");
            var select_value = e.options[e.selectedIndex].value;
            if(select_value!="my_all" && select_value!="private"){
                alert('You cannot remove any data with viewing shared data list.');
            }else if(window.confirm('You are about to remove the following data.\n\n' + delete_list_name)){
                axios.defaults.xsrfCookieName = 'csrftoken'
                axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
                axios.post(delete_from_list,{"id_delete":area})
                for(index=delete_list_index.length; index>0; index--){
                    this.record_spectra.splice(delete_list_index[index-1], 1);
                    this.dygraphs.splice(delete_list_index[index-1], 1);
                }
                alert('Data Deleted from your spectral list.');
            }else{
                alert('The command has been canceled.');
            }
        },

        search_from_list: function(){
            console.log("search from list here!!")
            var obs_id = document.getElementById("search_obs_id").value;
            var lat_min = document.getElementById("search_lat_min").value;
            var lat_max = document.getElementById("search_lat_max").value;
            var lon_min = document.getElementById("search_lon_min").value;
            var lon_max = document.getElementById("search_lon_max").value;
            var key_note = document.getElementById("search_note").value;
            if(obs_id=="" && lat_min=="" && lat_max=="" && lon_min=="" && lon_max=="" && key_note ==""){
                console.log("No keyword!!!")
                vm.record_spectra = vm.record_spectra2_tmp;
                vm.dygraphs = vm.dygraphs2_tmp;
            }else{
                search_from_this_record = vm.record_spectra2_tmp;
                search_from_this_dygraphs = vm.dygraphs2_tmp;

            if(obs_id != ""){
                console.log("search by obs_id");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(object.data_id.indexOf(obs_id) !== -1){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }

            if(lat_min!="" && lat_max==""){
                console.log("search by lat_min only");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(lat_min <= object.latitude && object.latitude <= 90){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }else if(lat_min=="" && lat_max!=""){
                console.log("search by lat_max only");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(-90 <= object.latitude && object.latitude <= lat_max){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }else if(lat_min!="" && lat_max!=""){
                console.log("search by lat_min and lat_max");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(lat_min <= object.latitude && object.latitude <= lat_max){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }

            if(lon_min!="" && lon_max==""){
                console.log("search by lon_min only");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(lon_min <= object.longitude && object.longitude <= 180){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }else if(lon_min=="" && lon_max!=""){
                console.log("search by lon_max only");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(-180 <= object.longitude && object.longitude <= lon_max){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }else if(lon_min!="" && lon_max!=""){
                console.log("search by lon_min and lon_max");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(lon_min <= object.longitude && object.longitude <= lon_max){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }

            if(key_note !=""){
                console.log("search by key_note");
                filtered_record_spectra = [];
                filtered_record_dygraphs = [];
                search_from_this_record.forEach((object, index) => {
                    if(object.description.indexOf(key_note) !== -1){
                        filtered_record_spectra.push(object);
                        filtered_record_dygraphs.push(search_from_this_dygraphs[index]);
                    }
                })
                search_from_this_record = filtered_record_spectra;
                search_from_this_dygraphs = filtered_record_dygraphs;
            }

            vm.record_spectra = search_from_this_record;
            vm.dygraphs = filtered_record_dygraphs;
            }
        },

        original_thumbnail: function(item){
            wms_layers = {};
            wms_layers.json = {};
            wms_layers.ratio= {};
            var extent = [0, 0, 753, 668];
            var projection = new ol.proj.Projection({
                code: 'pixels',
                units: 'pixels',
                extent: extent
            });
            wms_layers.thumbnail = new ol.Map({
                logo: false,
                controls: ol.control.defaults().extend([
                    new ol.control.ZoomSlider()
                ]),
                layers: [
                    new ol.layer.Image({
                        source: new ol.source.ImageStatic({
                            url: '/collectstatic' + item[0][0].image_path,
                            projection: projection,
                            imageExtent: extent
                        })
                    })
                ],
                target: item[0][0].id_thumbnail,
                controls: ol.control.defaults().extend([
                    new ol.control.ZoomSlider()
                ]),
                view: new ol.View({
                    projection: projection,
                    extent: extent,
                    center: ol.extent.getCenter(extent),
                    zoom: 0,
                    maxZoom: 6,
                })
            });
        }
    }
});