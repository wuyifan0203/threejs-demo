/*
 * @Author: wuyifan wuyifan@udschina.com
 * @Date: 2025-06-23 16:13:21
 * @LastEditors: wuyifan wuyifan@udschina.com
 * @LastEditTime: 2025-07-11 16:57:17
 * @FilePath: \threejs-demo\src\lib\tools\geoConvert.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Box2, Vector2 } from 'three';
import { geoMercator } from '../other/d3-geo.es.js';

const convert = geoMercator().scale(180)
function LatitudeLongitude2px(position) {
    if (position[0] >= -180 && position[0] <= 180 && position[1] >= -90 && position[1] <= 90) {
        position = convert(position);
    }
    return new Vector2(position[0], position[1]);
}

const _box = new Box2();

/**
 * @description: 将json坐标系转换为墨脱坐标系
 * @param {JSON} geojson
 * @return {{range: Vector2, center: Vector2}}
 */
function convertGeoJSON(geojson) {
    _box.makeEmpty();
    geojson.features.forEach((a) => {
        if (a.geometry.type === 'MultiPolygon') {
            // type = MultiPolygon
            a.geometry.shapes = a.geometry.coordinates.map((b) => {
                const shape = [];
                b.map((c) => {
                    c.forEach((point) => {
                        const position = LatitudeLongitude2px(point);
                        if (isNaN(position.x) || isNaN(position.y)) {
                            console.warn('points:', point, 'convert', position);
                            return;
                        }
                        _box.expandByPoint(position);
                        shape.push(position);
                    })
                });
                return shape;
            });
        } else {
            // type = Polygon
            a.geometry.shapes = a.geometry.coordinates.map((b) => {
                const shape = [];
                b.forEach((point) => {
                    const position = LatitudeLongitude2px(point);
                    if (isNaN(position.x) || isNaN(position.y)) {
                        console.warn('points:', point, 'convert', position);
                        return;
                    }
                    _box.expandByPoint(position);
                    shape.push(position);
                })
                return shape;
            })
        }

    });
    return {
        range: _box.getSize(new Vector2()),
        center: _box.getCenter(new Vector2()),
    }
}

export { convertGeoJSON }
