/*
 * @Date: 2023-06-13 01:00:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 16:31:34
 * @FilePath: /threejs-demo/packages/app/CAD/src/config/default.js
 */

import { PerspectiveCamera, Vector3 } from "three";

const DEFAULT_PERSPECTIVE_CAMERA = new PerspectiveCamera(50, 1, 0.01, 1000 );
DEFAULT_PERSPECTIVE_CAMERA.position.set(0,5,10);
DEFAULT_PERSPECTIVE_CAMERA.name = 'default_perspective_camera';
DEFAULT_PERSPECTIVE_CAMERA.lookAt(new Vector3());

export {DEFAULT_PERSPECTIVE_CAMERA}
