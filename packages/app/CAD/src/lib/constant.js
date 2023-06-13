/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:23:55
 * @FilePath: /threejs-demo/packages/app/CAD/src/lib/constant.js
 */
import { Vector3 } from 'three';

export const MOUSESTYLE = {
  SELECT: 'default',
  PAN: 'move',
  ZOOM: 'zoom-in',
  ROTATE: 'alias',
};

export const VIEWPOSITION = {
  '3D': new Vector3(1000, 1000, 1000),
  XY: new Vector3(0, 0, 1000),
  XZ: new Vector3(0, 1000, 0),
  YZ: new Vector3(1000, 0, 0),
};

export const S = 15;
