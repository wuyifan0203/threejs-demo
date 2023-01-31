/* eslint-disable no-unused-vars */
/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-31 17:31:51
 * @FilePath: /threejs-demo/src/examples/cannon/index.js
 */
import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  BackSide,
  PerspectiveCamera,
  Sprite,
  SpriteMaterial,
  Raycaster,
  Vector2,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';
import {
  initRenderer,
} from '../../lib/tools/index.js';
