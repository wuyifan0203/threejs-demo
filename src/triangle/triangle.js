/*
 * @Date: 2023-06-10 16:00:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:57:10
 * @FilePath: /threejs-demo/src/triangle/triangle.js
 */
import { SweepContext, Point } from '../lib/other/poly2tri.js';
import { ShapeUtils } from '../lib/three/ShapeUtils.js';
import { Delaunator } from '../lib/other/delaunator.js';
import { data } from './data.js';

import {
  Mesh,
  MeshBasicMaterial,
  BufferAttribute,
  Vector3,
  BufferGeometry,
  Vector2,
} from 'three';
import {
  initCustomGrid,
  initOrbitControls,
  initOrthographicCamera,
  initRenderer,
  initScene,
  initGUI
} from '../lib/tools/common.js';

window.onload = () => {
  init();
};

const control = {
  dataSource: data.demo,
  useType: 'useDelaunator',
  usePoly2tri,
  useEarCut,
  useDelaunator,
};

function init() {
  const scene = initScene();
  const renderer = initRenderer();
  renderer.setClearColor(0xffffff);
  const camera = initOrthographicCamera(new Vector3(0, 0, 1000));
  camera.up.set(0, 0, 1);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const material = new MeshBasicMaterial({
    color: '#ff0000',
    wireframe: true,
  });

  const position = control[control.useType](control.dataSource);
  console.log(position);

  const plane = new BufferGeometry().setAttribute(
    'position',
    new BufferAttribute(new Float32Array(position), 3),
  );

  const mesh = new Mesh(plane, material);
  const grid = initCustomGrid(scene, 500, 500);

  grid.position.set(0, 0, -0.11);
  scene.add(mesh);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);

  const update = () => {
    const position = control[control.useType](control.dataSource);
    console.log(position);
    mesh.geometry.dispose();
    mesh.geometry = new BufferGeometry().setAttribute(
      'position',
      new BufferAttribute(new Float32Array(position), 3),
    );
  };

  const gui = initGUI();
  gui.add(control, 'dataSource', data).name('Data Source:').onChange(() => update());
  gui.add(control, 'useType', { useDelaunator: 'useDelaunator', useEarCut: 'useEarCut', usePoly2tri: 'usePoly2tri' }).name('Use :').onChange(() => update());

  window.scene = scene;
}

function usePoly2tri(data) {
  console.log('usePoly2tri');
  const { path, holes } = data;

  const pathArray = [];
  for (let i = 0, j = path.length; i < j; i += 2) {
    pathArray.push(new Point(path[i], path[i + 1]));
  }

  const holeArray = [];
  if (holes?.length) {
    for (let i = 0, j = holes.length; i < j; i++) {
      const hole = [];
      const current = holes[i];
      for (let k = 0, l = current.length; k < l; k += 2) {
        hole.push(new Point(current[k], current[k + 1]));
      }
      holeArray.push(hole);
    }
  }

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
  console.log('useEarCut');
  const { path, holes } = data;

  const points = [];
  for (let i = 0, j = path.length; i < j; i += 2) {
    points.push(new Vector2(path[i], path[i + 1]));
  }

  const holesArray = [];
  if (holes) {
    for (let i = 0, j = holes.length; i < j; i++) {
      const current = holes[i];
      let hole = [];
      for (let k = 0, l = current.length; k < l; k += 2) {
        hole.push(new Vector2(current[k], current[k + 1]));
      }
      if (ShapeUtils.isClockWise(hole) === true) {
        hole = hole.reverse();
      }
      holesArray.push(hole);
    }
  }

  let shapePath = points;
  if (ShapeUtils.isClockWise(shapePath) === false) {
    shapePath = shapePath.reverse();
  }

  const indexes = ShapeUtils.triangulateShape(shapePath, holesArray);

  let vertices = shapePath;
  for (let h = 0, hl = holesArray.length; h < hl; h++) {
    const ahole = holesArray[h];
    vertices = vertices.concat(ahole);
  }

  const result = [];
  for (let s = 0, l = indexes.length; s < l; s++) {
    const index = indexes[s];
    for (let i = 0, q = index.length; i < q; i++) {
      const p = vertices[index[i]];
      result.push(p.x, p.y, 0);
    }
  }

  return result;
}

function useDelaunator(data) {
  console.log('useDelaunator');
  const { path, holes } = data;
  const total = path.concat(...(holes ?? []));
  const delaunator = new Delaunator(total);

  const indexes = delaunator.triangles;

  const totalMap = [];
  for (let j = 0, k = total.length; j < k; j += 2) {
    totalMap.push([total[j], total[j + 1]]);
  }

  const result = [];
  for (let i = 0, l = indexes.length; i < l; i += 3) {
    result.push(...totalMap[indexes[i]], 0);
    result.push(...totalMap[indexes[i + 1]], 0);
    result.push(...totalMap[indexes[i + 2]], 0);
  }

  return result;
}
