function loadgeojson (record_json, bool_checked) {
    console.log(bool_checked);
    geojson = record_json['geojson'];
    var line = JSON.parse(geojson);
    var json = JSON.stringify(line);
    var url = URL.createObjectURL(new Blob([json]));
    saved_point = Cesium.GeoJsonDataSource.load(line, {
                        fill: new Cesium.Color(0, 0, 1, 0.9),
                        clampToGround: true,
                    });
    saved_point.propatie
    
    // スイッチOFFにしても消えない
    if (bool_checked) {
        roots.map.dataSources.add(saved_point);
    } else if (!bool_checked) {
        saved_point.show = false;
        roots.map.dataSources.remove(saved_point);
        // console.log(bool_checked);
    }
}