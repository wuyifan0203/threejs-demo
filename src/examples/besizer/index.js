
import {
  WebGLRenderer,
  PCFSoftShadowMap,
  Color,
  PerspectiveCamera,
  Vector3,
  Scene,
  PlaneGeometry,
  MeshPhongMaterial,
  SpotLight,
  AmbientLight,
  Mesh,
  ArrowHelper,
  Group,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  CubicBezierCurve3,
  BufferAttribute
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';

(function() {
  init();
})();

function init() {
  const renderer = initRenderer();
  const camera = initCamera();
  const scene = new Scene();
  const groundPlane = addLargeGroundPlane(scene);
  groundPlane.position.y = -0.01;

  initDefaultLighting(scene);
  createAxesHelper(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function initRenderer() {
  var props = {
    antialias: true
  };
  var renderer = new WebGLRenderer(props);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  renderer.setClearColor(new Color(0x000000));
  renderer.setSize(window.innerWidth - 100, window.innerHeight - 100);
  renderer.shadowMap.enabled = true;
  document.getElementById('webgl-output').appendChild(renderer.domElement);

  return renderer;
}

function initCamera(initialPosition) {
  var position = (initialPosition !== undefined) ? initialPosition : new Vector3(-30, 40, 30);

  var camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

  return camera;
}

function addLargeGroundPlane(scene, useTexture) {
  //   var withTexture = (useTexture !== undefined) ? useTexture : false;

  // create the ground plane
  var planeGeometry = new PlaneGeometry(10000, 10000);
  var planeMaterial = new MeshPhongMaterial({
    color: 0xffffff
  });
  var plane = new Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = -0.02;
  plane.position.y = -0.02;
  plane.position.z = -0.02;

  scene.add(plane);

  return plane;
}

function initDefaultLighting(scene, initialPosition) {
  var position = (initialPosition !== undefined) ? initialPosition : new Vector3(100, 300, 400);

  var spotLight = new SpotLight(0xffffff);
  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 15;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.05;
  spotLight.name = 'spotLight';

  scene.add(spotLight);

  const ambientLight = new AmbientLight(0x343434);
  ambientLight.name = 'ambientLight';
  scene.add(ambientLight);
}

function createAxesHelper(scene) {
  const arrowHelper = new Group();
  arrowHelper.name = 'arrowHelper';

  ['X', 'Y', 'Z'].forEach(e => {
    const pos = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] }[e];
    const size = { X: 1000 * 0.5, Y: 1000 * 0.5, Z: 1000 * 0.5 }[e];
    const color = { X: 'red', Y: 'green', Z: 'blue' }[e];
    const arrowSize = (size) * 0.025;
    const arrow = new ArrowHelper(new Vector3(...pos), new Vector3(0, 0, 0), size, color, arrowSize, 0.1 * arrowSize);
    arrowHelper.add(arrow);
  });
  arrowHelper.position.set(0, 0, 0);
  scene.add(arrowHelper);
}

function draw(scene) {
  const d = 1;
  const d2 = 0.3;

  const VectorMap = [
    new Vector3(0, 0, 8),
    new Vector3(4.4153, 0, 8),
    new Vector3(8, 0, 4.4153),
    new Vector3(8, 0, 0)
  ];

  const VectorMap2 = [
    new Vector3(0, 1, 8),
    new Vector3(4.4153, 1, 8),
    new Vector3(8, 1, 4.4153),
    new Vector3(8, 1, 0)
  ];

  const [group1, , group2] = makeCurve(VectorMap, d);
  const [group3, , group4] = makeCurve(VectorMap2, d2, 1);

  console.log(group1);
  console.log(group2);

  const mesh = drawArcWaveGude([group1, group2, group3, group4]);

  // 线条模型对象
  // const line = drawLine(points, 0x000000);
  const line1 = drawLine(group1, 0xff2914);
  const line2 = drawLine(group2, 0x142aff);
  const line3 = drawLine(group3, 0x67c23a);
  const line4 = drawLine(group4, 0xe6a23c);
  // scene.add(line);
  scene.add(line1);
  scene.add(line2);
  scene.add(line3);
  scene.add(line4);
  scene.add(mesh);
}

function makeCurve(VectorMap, d, h = 0) {
  // var curve = new CatmullRomCurve3(VectorMap);
  const curve = new CubicBezierCurve3(...VectorMap);

  const points = curve.getPoints(10); // 分段数100，返回101个顶点

  const pointLength = points.length;
  const group1 = [];
  const group2 = [];
  for (let index = 1; index < pointLength; index++) {
    const { x: x1, z: z1 } = points[index - 1];
    const { x: x2, z: z2 } = points[index];

    const tanTheta = -(x2 - x1) / (z2 - z1);
    const theta = Math.atan(tanTheta);
    const dx = d * Math.cos(theta);
    const dy = d * Math.sin(theta);
    if (theta > 0) {
      group1.push(new Vector3(x1 + dx, h, z1 + dy));
      group2.push(new Vector3(x1 - dx, h, z1 - dy));
    } else {
      group1.push(new Vector3(x1 - dx, h, z1 - dy));
      group2.push(new Vector3(x1 + dx, h, z1 + dy));
    }
  }
  return [
    group1,
    points,
    group2
  ];
}

function drawLine(points, color) {
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({
    color: color
  });
  return new Line(geometry, material);
}

function drawArcWaveGude(group) {
  const [group1, group2, group3, group4] = group;
  const length = group1.length;

  const totalVertices = [];

  for (let index = 1; index < length; index++) {
    const [prev, current] = [index - 1, index];
    const [p1, p4, p5, p6] = [group1[prev], group2[prev], group3[prev], group4[prev]];
    const [p2, p3, p8, p7] = [group1[current], group2[current], group3[current], group4[current]];
    const partVertices = createPartVertices(...[p1, p4, p5, p6], ...[p2, p3, p8, p7]);
    totalVertices.push(...partVertices);
  }

  const frontVertices = addFront(group1[0], group2[0], group3[0], group4[0]);
  const backVertices = addBack(group1.at(-1), group2.at(-1), group3.at(-1), group4.at(-1));
  totalVertices.push(...frontVertices, ...backVertices);
  console.log(totalVertices);
  const geometry = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(totalVertices), 3));
  const mesh = new Mesh(
    geometry,
    new MeshPhongMaterial({
      // transparent: false,
      // depthTest: false,
      // color: 0x049ef4
    })
  );

  return mesh;
}

function createPartVertices(...points) {
  const [p1, p4, p5, p6, p2, p3, p8, p7] = points;
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
    x1, y1, z1, x3, y3, z3, x4, y4, z4, x1, y1, z1, x2, y2, z2, x3, y3, z3// down
  ];
  return vertices;
}

function addFront(p1, p4, p5, p6) {
  const { x: x1, y: y1, z: z1 } = p1;
  const { x: x4, y: y4, z: z4 } = p4;
  const { x: x5, y: y5, z: z5 } = p5;
  const { x: x6, y: y6, z: z6 } = p6;

  return [
    x1, y1, z1, x4, y4, z4, x5, y5, z5,
    x5, y5, z5, x4, y4, z4, x6, y6, z6
  ];
}

function addBack(p2, p3, p8, p7) {
  const { x: x2, y: y2, z: z2 } = p2;
  const { x: x3, y: y3, z: z3 } = p3;
  const { x: x7, y: y7, z: z7 } = p7;
  const { x: x8, y: y8, z: z8 } = p8;
  return [
    x2, y2, z2, x8, y8, z8, x7, y7, z7,
    x2, y2, z2, x7, y7, z7, x3, y3, z3
  ];
}

