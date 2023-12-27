/*
 * @Date: 2023-06-15 16:51:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:13:22
 * @FilePath: /threejs-demo/src/geometry/shapeGeometry.js
 */
import {
  Vector3,
  Vector2,
  Shape,
  Path,
  ShapeGeometry,
  MeshNormalMaterial,
  Mesh,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  initAxesHelper,
  initCustomGrid,
  initGUI,
  initScene,
  initOrbitControls
} from '../lib/tools/index.js';
import { angle2Radians } from '../lib/tools/func.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.setAnimationLoop(render);
  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();
  initAxesHelper(scene);
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;

  function render() {
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);

  const params = {
    innerRadius: 2,
    outerRadius: 4,
    startAngle: 0,
    endAngle: 360,
    segment: 50,
  };

  const geometry = new ShapeGeometry();
  const material = new MeshNormalMaterial({ wireframe: true });

  const mesh = new Mesh(geometry, material);

  scene.add(mesh);

  const gui = initGUI();

  gui.add(material, 'wireframe');
  gui.add(params, 'innerRadius', 0, 4, 0.1).onChange(update);
  gui.add(params, 'outerRadius', 4, 6, 0.1).onChange(update);
  gui.add(params, 'startAngle', 0, 359, 1).onChange(update);
  gui.add(params, 'endAngle', 1, 360, 1).onChange(update);
  gui.add(params, 'segment', 0, 50, 1).onChange(update);

  function update() {
    mesh.geometry.dispose();
    const shape = Circle(params.innerRadius, params.outerRadius, params.startAngle, params.endAngle, params.segment);
    mesh.geometry = new ShapeGeometry(shape);
  }

  update();
}

// 等文档可能有变化
function Circle(innerRadius, outerRadius, startAngle, endAngle, segment) {
  const resultShape = new Shape();
  const newShape = new Shape();

  const deta = Math.abs(endAngle - startAngle);
  if (innerRadius === 0) {
    if (deta === 360) {
      const points = resultShape
        .absellipse(0, 0, outerRadius, outerRadius, 0, Math.PI * 2, false, 0)
        .extractPoints(segment).shape;
      // 圆
      return newShape.setFromPoints(points);
    }
    // 扇
    const points = resultShape
      .absellipse(0, 0, outerRadius, outerRadius, angle2Radians(startAngle), angle2Radians(endAngle), false, 0)
      .extractPoints(deta / 5).shape;
    points.push(new Vector2(0, 0));
    return newShape.setFromPoints(points);
  }

  // 圆环
  if (deta === 360) {
    const inner = new Path();
    const newPath = new Path();
    resultShape.absellipse(0, 0, outerRadius, outerRadius, 0, Math.PI * 2, false, 0);
    inner.absellipse(0, 0, innerRadius, innerRadius, 0, Math.PI * 2, false, 0);
    resultShape.holes.push(inner);
    const { shape, holes } = resultShape.extractPoints(segment);

    newShape.setFromPoints(shape);
    newPath.setFromPoints(holes[0]);

    newShape.holes.push(newPath);
  } else {
    // 扇环
    const innerShape = new Shape();
    resultShape.absellipse(0, 0, outerRadius, outerRadius, angle2Radians(startAngle), angle2Radians(endAngle), false, 0);
    innerShape.absellipse(0, 0, innerRadius, innerRadius, angle2Radians(startAngle), angle2Radians(endAngle), false, 0);

    const outer = resultShape.extractPoints(segment);
    const inner = innerShape.extractPoints(segment);

    newShape.setFromPoints(outer.shape.concat(inner.shape.reverse()));
  }

  return newShape;
}
