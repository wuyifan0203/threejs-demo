/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 10:37:47
 * @FilePath: /threejs-demo/packages/f-engine/src/utils/constant.ts
 */
import { Vector3 } from 'three';

export const MOUSE_STYLE = {
  SELECT: 'default',
  PAN: 'move',
  ZOOM: 'zoom-in',
  ROTATE: 'alias',
};

export const DEFAULT_POSITION = {
  free: new Vector3(1000, 1000, 1000),
  XY: new Vector3(0, 0, 1000),
  XZ: new Vector3(0, 1000, 0),
  YZ: new Vector3(1000, 0, 0),
};

export const S = 15;
