/*
 * @Date: 2023-06-10 16:00:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-11 12:08:39
 * @FilePath: /threejs-demo/packages/examples/triangle/poly2triTest.js
 */
import { SweepContext, Point } from "../../lib/other/poly2tri.js";
import { GUI } from "../../lib/util/lil-gui.module.min.js";
import { ShapeUtils } from "../../lib/three/ShapeUtils.js";

import {
  Mesh,
  MeshBasicMaterial,
  Scene,
  BufferAttribute,
  Vector3,
  BufferGeometry,
  Shape,
  Vector2,
  Path,
} from "../../lib/three/three.module.js";
import {
  initCustomGrid,
  initOrbitControls,
  initOrthographicCamera,
  initRenderer,
} from "../../lib/tools/common.js";

const data1 = {
  path: [0, 0, 0, 3, 3, 3, 3, 0],

  holes: [
    [2.0, 2.0, 2.0, 2.5, 2.5, 2.5],
    [1, 1, 1, 1.4, 1.4, 1.4],
  ],
};

window.onload = () => {
  init();
};

function init() {
  const scene = new Scene();
  const renderer = initRenderer();
  renderer.setClearColor(0xffffff);
  const camera = initOrthographicCamera(new Vector3(0, 0, 1000));
  camera.up.set(0, 0, 1);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const material = new MeshBasicMaterial({
    color: "#ff0000",
    wireframe: false,
  });

  const plane = new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(new Float32Array(useEarCut(data1)), 3)
  );

  const mesh = new Mesh(plane, material);

  const grid = initCustomGrid(scene, 500, 500);

  grid.position.set(0, 0, -0.11);

  scene.add(mesh);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

function usePoly2tri(data) {
  const { path, holes } = data;

  const pathArray = [];
  for (let i = 0, j = path.length; i < j; i += 2) {
    pathArray.push(new Point(path[i], path[i + 1]));
  }

  const holeArray = [];

  if (holes.length) {
    for (let i = 0, j = holes.length; i < j; i++) {
      const hole = [];
      const current = holes[i];
      for (let k = 0, l = current.length; k < l; k += 2) {
        hole.push(new Point(current[k], current[k + 1]));
      }
      holeArray.push(hole);
    }
  }

  console.log(pathArray);

  console.log(holeArray);

  const swctx = new SweepContext(pathArray);

  swctx.addHoles(holeArray);

  swctx.triangulate();

  const result = [];

  swctx.getTriangles().forEach((t) => {
    t.getPoints().forEach((p) => {
      result.push(p.x, p.y, 0);
    });
  });

  return result;
}

function useEarCut(data) {
  const { path, holes } = data;
  const points = [];
  for (let i = 0, j = path.length; i < j; i += 2) {
    points.push(new Vector2(path[i], path[i + 1]));
  }

  const holesArray = [];
  for (let i = 0, j = holes.length; i < j; i++) {
    const current = holes[i];
    const hole = [];
    for (let k = 0, l = current.length; k < l; k += 2) {
      hole.push(current[i], current[i + 1]);
    }

    console.log(hole);
    holesArray.push(new Path(hole));
  }

  console.log(holesArray);

  const shape = new Shape(points);
  shape.holes = holesArray;

  const shapes = ShapeUtils.triangulateShape(shape.getPoints(),shape.holes)

  console.log(shape);

  return;
}
