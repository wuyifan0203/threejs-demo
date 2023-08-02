import {
  Scene,
  BufferGeometry,
  LineBasicMaterial,
  EdgesGeometry,
  BufferAttribute,
  LineSegments,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer, initDefaultLighting, initAxesHelper, initPerspectiveCamera,
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera();
  const scene = new Scene();
  //   const groundPlane = initGroundPlane(scene);
  //   groundPlane.position.y = -0.01;

  initDefaultLighting(scene);
  initAxesHelper(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function draw(scene) {
  const lineMaterial = new LineBasicMaterial({ color: 0xffffff });

  // const basicMaterial = new MeshBasicMaterial({ color: 0xff98ff });

  // const box1 = new BoxBufferGeometry(2, 2, 2);
  // const box2 = new BoxBufferGeometry(5, 10, 5);

  // const v1 = box1.attributes.position.array;
  // const v2 = box2.attributes.position.array;

  const points = {
    z1: 10,
    z2: 10,
    z3: 10,
    z4: 10,

    z6: -10,
    z5: -10,
    z7: -10,
    z8: -10,

    x1: -10,
    y1: -10,
    x8: -10,
    y8: -10,

    x2: -10,
    y2: 10,
    x7: -10,
    y7: 10,

    x3: 10,
    y3: 10,
    x6: 10,
    y6: 10,

    x4: 10,
    y4: -10,
    x5: 10,
    y5: -10,
  };

  const points2 = {
    z1: 1,
    z2: 1,
    z3: 1,
    z4: 1,

    z6: -1,
    z5: -1,
    z7: -1,
    z8: -1,

    x1: -1,
    y1: -1,
    x8: -2,
    y8: -2,

    x2: -1,
    y2: 1,
    x7: -2,
    y7: 2,

    x3: 1,
    y3: 1,
    x6: 2,
    y6: 2,

    x4: 1,
    y4: -1,
    x5: 2,
    y5: -2,
  };

  const vertices = createVertices(points);
  const vertices2 = createVertices(points2);

  const buffer = new BufferGeometry();
  buffer.setAttribute('position', new BufferAttribute(new Float32Array([...vertices, ...vertices2]), 3));

  const lineGeom = new EdgesGeometry(buffer);
  const line = new LineSegments(lineGeom, lineMaterial);
  scene.add(line);
}

function createVertices(attrs) {
  const {
    x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, x5, y5, z5, x6, y6, z6, x7, y7, z7, x8, y8, z8,
  } = attrs;
  return [
    x1, y1, z1, x2, y2, z2, x3, y3, z3, x1, y1, z1, x3, y3, z3, x4, y4, z4, // up
    x8, y8, z8, x5, y5, z5, x6, y6, z6, x8, y8, z8, x6, y6, z6, x7, y7, z7, // down
    x1, y1, z1, x8, y8, z8, x2, y2, z2, x2, y2, z2, x8, y8, z8, x7, y7, z7, // left
    x3, y3, z3, x5, y5, z5, x4, y4, z4, x3, y3, z3, x6, y6, z6, x5, y5, z5, // right
    x2, y2, z2, x7, y7, z7, x3, y3, z3, x7, y7, z7, x6, y6, z6, x3, y3, z3, // front
    x1, y1, z1, x5, y5, z5, x8, y8, z8, x1, y1, z1, x4, y4, z4, x5, y5, z5, // back
  ];
}
