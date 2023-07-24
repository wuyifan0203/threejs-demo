import {
  Scene,
  Mesh,
  BufferGeometry,
  Vector3,
  DoubleSide,
  LineBasicMaterial,
  EdgesGeometry,
  BufferAttribute,
  LineSegments,
  MeshBasicMaterial,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';

import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
  angle2Radians,
} from '../lib/tools/index.js';

import { GUI } from '../lib/util/lil-gui.module.min.js';;

function circle(x, r2) {
  return Math.sqrt(r2 - x * x);
}
// 逆时针，🕙反走向，0点开始
// division = 360/36 (division/angle)  =>90度分9份
// x * x + y * y = r * r
//         ^
//       <-|
//   2     |     1
//         |
// --------+----------->
//         |
//   3     |     4
//         |->

function makeCircle(r, angle, h, width) {
  const division = 100;
  const d = 90 / division;// = 10
  const halfWidth = width / 2;
  const ir = r - halfWidth;
  const or = r + halfWidth;
  const ir2 = ir * ir;
  const or2 = or * or;
  const innerPart = [];
  const outerPart = [];

  const main = Math.floor(angle / d);

  if (angle < 90) {
    console.log('angle<90');
    for (let i = 0; i < main; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    const sd = Math.sin(angle2Radians(angle));
    const ix = ir * sd;
    const ox = or * sd;
    innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
    outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
  } else if (angle === 90) {
    console.log('angle=90');
    for (let i = 0; i < main; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    innerPart.push(new Vector3(-ir, circle(-ir, ir2), h));
    outerPart.push(new Vector3(-or, circle(-or, or2), h));
  } else if (angle < 180 && angle > 90) {
    console.log('180>angle>90');
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    for (let i = 0; i < main - division; i++) {
      const sd = Math.sin(angle2Radians((i + division) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
    }
    const sd = Math.sin(angle2Radians(angle));
    const ix = ir * sd;
    const ox = or * sd;
    innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
    outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
  } else if (angle === 180) {
    console.log('180=angle');
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    for (let i = 0; i < main - division; i++) {
      const sd = Math.sin(angle2Radians((i + division) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
    }
    innerPart.push(new Vector3(-0, -circle(-0, ir2), h));
    outerPart.push(new Vector3(-0, -circle(-0, or2), h));
  } else if (angle < 270 && angle > 180) {
    console.log('180<angle<270');
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians((i + division) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
    }
    for (let i = 0; i < main - division * 2; i++) {
      const sd = -Math.sin(angle2Radians((i + division * 2) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(ix, -circle(ix, ir2), h));
      outerPart.push(new Vector3(ox, -circle(ox, or2), h));
    }
    const sd = -Math.sin(angle2Radians(angle));
    const ix = ir * sd;
    const ox = or * sd;
    innerPart.push(new Vector3(ix, -circle(ix, ir2), h));
    outerPart.push(new Vector3(ox, -circle(ox, or2), h));
  } else if (angle === 270) {
    console.log('angle=270');
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians((i + division) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
    }
    for (let i = 0; i < main - division * 2; i++) {
      const sd = -Math.sin(angle2Radians((i + division * 2) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(ix, -circle(ix, ir2), h));
      outerPart.push(new Vector3(ox, -circle(ox, or2), h));
    }
    innerPart.push(new Vector3(ir, -circle(ir, ir2), h));
    outerPart.push(new Vector3(or, -circle(or, or2), h));
  } else if (angle < 360 && angle > 270) {
    console.log('angle>270');
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians((i + division) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
    }
    for (let i = 0; i < division; i++) {
      const sd = -Math.sin(angle2Radians((i + division * 2) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(ix, -circle(ix, ir2), h));
      outerPart.push(new Vector3(ox, -circle(ox, or2), h));
    }
    for (let i = 0; i < main - division * 3; i++) {
      const sd = -Math.sin(angle2Radians((i + division * 3) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(ix, circle(ix, ir2), h));
      outerPart.push(new Vector3(ox, circle(ox, or2), h));
    }
    const sd = -Math.sin(angle2Radians(angle));
    const ix = ir * sd;
    const ox = or * sd;
    innerPart.push(new Vector3(ix, circle(ix, ir2), h));
    outerPart.push(new Vector3(ox, circle(ox, or2), h));
  } else if (angle === 360) {
    console.log('angle=360');
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians(i * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, circle(-ox, or2), h));
    }
    for (let i = 0; i < division; i++) {
      const sd = Math.sin(angle2Radians((i + division) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(-ix, -circle(-ix, ir2), h));
      outerPart.push(new Vector3(-ox, -circle(-ox, or2), h));
    }
    for (let i = 0; i < division; i++) {
      const sd = -Math.sin(angle2Radians((i + division * 2) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(ix, -circle(ix, ir2), h));
      outerPart.push(new Vector3(ox, -circle(ox, or2), h));
    }
    for (let i = 0; i < main - division * 3; i++) {
      const sd = -Math.sin(angle2Radians((i + division * 3) * d));
      const ix = ir * sd;
      const ox = or * sd;
      innerPart.push(new Vector3(ix, circle(ix, ir2), h));
      outerPart.push(new Vector3(ox, circle(ox, or2), h));
    }
    innerPart.push(new Vector3(0, circle(0, ir2), h));
    outerPart.push(new Vector3(0, circle(0, or2), h));
  }

  return [
    innerPart,
    outerPart,
  ];
}

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = new Scene();
  initAxesHelper(scene);
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

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
  const lm = new LineBasicMaterial({ color: 'black' });
  const m = new MeshBasicMaterial({
    side: DoubleSide,
    transparent: true,
    opacity: 0.3,
    color: 'green',
    depthTest: false,
  });

  let mesh; let lineMesh;

  function draw3DMesh(r, angle, height, width) {
    const g = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(drawArc(r, angle, height, width)), 3));
    mesh = new Mesh(g, m);
    const e = new EdgesGeometry(g);
    lineMesh = new LineSegments(e, lm);
    scene.add(mesh, lineMesh);
  }

  const object = {
    angle: 360,
    r: 5,
    height: 2,
    width: 1,
  };

  draw3DMesh(object.r, object.angle, object.height, object.width);

  const gui = new GUI();

  gui.add(object, 'angle', 0, 360, 1).onChange(() => {
    scene.remove(lineMesh, mesh);
    draw3DMesh(object.r, object.angle, object.height, object.width);
  });

  gui.add(object, 'height', 0, 100, 0.1).onChange(() => {
    scene.remove(lineMesh, mesh);
    draw3DMesh(object.r, object.angle, object.height, object.width);
  });

  gui.add(object, 'width', 0, 100, 0.1).onChange(() => {
    scene.remove(lineMesh, mesh);
    draw3DMesh(object.r, object.angle, object.height, object.width);
  });

  gui.add(object, 'r', 0, 100, 0.1).onChange(() => {
    scene.remove(lineMesh, mesh);
    draw3DMesh(object.r, object.angle, object.height, object.width);
  });
}

function drawArc(r, angle, height, width) {
  const halfH = height / 2;
  const [group1, group2] = makeCircle(r, angle, halfH, width);
  const [group3, group4] = makeCircle(r, angle, -halfH, width);

  const totalVertices = [];
  const { length } = group1;

  for (let index = 1; index < length; index++) {
    const [prev, current] = [index - 1, index];
    const [p1, p4, p5, p6] = [group1[prev], group2[prev], group3[prev], group4[prev]];
    const [p2, p3, p8, p7] = [group1[current], group2[current], group3[current], group4[current]];
    const partVertices = createPartVertices(p1, p4, p5, p6, p2, p3, p8, p7);
    totalVertices.push(...partVertices);
  }
  if (angle !== 360) {
    const frontVertices = createFrontVertices(group1[0], group2[0], group3[0], group4[0]);
    const backVertices = createBackVertices(group1[group1.length - 1], group2[group2.length - 1], group3[group3.length - 1], group4[group4.length - 1]);
    totalVertices.push(...frontVertices, ...backVertices);
  }
  return totalVertices;
}

//        up
//        ↑
//     8 ---- 7
//    /|     /|
//   5 ---- 6 |
//   | 2 ---|-3       Z
//   |/     |/        |
//   1 ---- 4         o —— X
//       ↓           /
//       up         Y
function createPartVertices(p1, p4, p5, p6, p2, p3, p8, p7) {
  const { x: x1, y: y1, z: z1 } = p1;
  const { x: x2, y: y2, z: z2 } = p2;
  const { x: x3, y: y3, z: z3 } = p3;
  const { x: x4, y: y4, z: z4 } = p4;
  const { x: x5, y: y5, z: z5 } = p5;
  const { x: x6, y: y6, z: z6 } = p6;
  const { x: x7, y: y7, z: z7 } = p7;
  const { x: x8, y: y8, z: z8 } = p8;
  const vertices = [
    x1, y1, z1, x5, y5, z5, x8, y8, z8, x1, y1, z1, x8, y8, z8, x2, y2, z2, // left
    x3, y3, z3, x7, y7, z7, x6, y6, z6, x3, y3, z3, x6, y6, z6, x4, y4, z4, // right
    x5, y5, z5, x6, y6, z6, x7, y7, z7, x5, y5, z5, x7, y7, z7, x8, y8, z8, // up
    x1, y1, z1, x3, y3, z3, x4, y4, z4, x1, y1, z1, x2, y2, z2, x3, y3, z3, // down
  ];
  return vertices;
}

//
//   5 ---- 6
//   |      |
//   |      |
//   1 ---- 4
//    Front Face
//
function createFrontVertices(p1, p4, p5, p6) {
  const { x: x1, y: y1, z: z1 } = p1;
  const { x: x4, y: y4, z: z4 } = p4;
  const { x: x5, y: y5, z: z5 } = p5;
  const { x: x6, y: y6, z: z6 } = p6;

  return [
    x1, y1, z1, x4, y4, z4, x5, y5, z5,
    x5, y5, z5, x4, y4, z4, x6, y6, z6,
  ];
}

//
//   8 ---- 7
//   |      |
//   |      |
//   2 ---- 3
//    Back Face
//
function createBackVertices(p2, p3, p8, p7) {
  const { x: x2, y: y2, z: z2 } = p2;
  const { x: x3, y: y3, z: z3 } = p3;
  const { x: x7, y: y7, z: z7 } = p7;
  const { x: x8, y: y8, z: z8 } = p8;
  return [
    x2, y2, z2, x8, y8, z8, x7, y7, z7,
    x2, y2, z2, x7, y7, z7, x3, y3, z3,
  ];
}
