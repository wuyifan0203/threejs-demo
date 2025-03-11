import { geoMercator } from '../other/d3-geo.es.js';

function LatitudeLongitude2px(position) {
    if (position[0] >= -180 && position[0] <= 180 && position[1] >= -90 && position[1] <= 90) {
        return geoMercator(position).scale(180);
    }
    return position;
}

function getGeoInfo(geojson) {
    const bounding = {
        minLat: Number.MAX_VALUE,
        minLng: Number.MAX_VALUE,
        maxLng: 0,
        maxLat: 0
    };
    const centerM = {
        lat: 0,
        lng: 0
    };
    let len = 0;
    //遍历点
    geojson.features.forEach((a) => {
        if (a.geometry.type == 'MultiPolygon') {
            a.geometry.coordinates.forEach((b) => {
                b.forEach((c) => {
                    c.forEach((item) => {
                        let pos = LatitudeLongitude2px(item);
                        //经纬度转墨卡托投影坐标换失败
                        if (Number.isNaN(pos[0]) || Number.isNaN(pos[1])) {
                            console.log(item, pos);
                            return;
                        }
                        centerM.lng += pos[0];
                        centerM.lat += pos[1];
                        if (pos[0] < bounding.minLng) {
                            bounding.minLng = pos[0];
                        }
                        if (pos[0] > bounding.maxLng) {
                            bounding.maxLng = pos[0];
                        }
                        if (pos[1] < bounding.minLat) {
                            bounding.minLat = pos[1];
                        }
                        if (pos[1] > bounding.maxLat) {
                            bounding.maxLat = pos[1];
                        }

                        len++;

                    });
                });
            });
        } else {
            a.geometry.coordinates.forEach((c) => {
                c.forEach((item) => {
                    //...
                });
            });
        }
    });
    centerM.lat = centerM.lat / len;
    centerM.lng = centerM.lng / len;
    //元素缩放比例
    const scale = (bounding.maxLng - bounding.minLng) / 180;
    return { bounding, centerM, scale };
}

export { getGeoInfo }
