/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-10 16:30:17
 * @FilePath: /threejs-demo/src/examples/ParametricGeometry/index.js
 */
import {
  Vector3,
  Scene,
  Mesh,
  MeshNormalMaterial,
} from "../../lib/three/three.module.js";
import {
  initRenderer,
  initPerspectiveCamera,
  createAxesHelper,
  initCustomGrid,
  resize
} from "../../lib/tools/index.js";
import { OrbitControls } from "../../lib/three/OrbitControls.js";
import { ViewHelper } from "../../lib/three/viewHelper.js";
import { ParametricGeometry } from "../../lib/three/ParametricGeometry.js";

window.onload = function (params) {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer,camera)
  initCustomGrid(scene);
  createAxesHelper(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);
 
  draw(scene);

  render();
  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    requestAnimationFrame(render);
  }
 

  console.log(scene);
  console.log(camera);
  window.camera = camera;
}

var funcList = {
  Gaussian: function (u, v, target) {
    const mux = 0;
    const muy = 0;
    const size = 10;
    const Sigma = 6;
    const k = 5;

    const x = u * size - size / 2;
    const y = v * size - size / 2;
    const ux = x - mux;
    const uy = y - muy;
    const z = k * Math.exp((ux * ux) / -Sigma) * Math.exp((uy * uy) / -Sigma);
    target.set(x, y, z);
  },
  Klein: function (v, u, target) {
    u *= Math.PI;
    v *= 2 * Math.PI;

    u = u * 2;
    let x, z;
    if (u < Math.PI) {
      x =
        3 * Math.cos(u) * (1 + Math.sin(u)) +
        2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v);
      z =
        -8 * Math.sin(u) -
        2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
    } else {
      x =
        3 * Math.cos(u) * (1 + Math.sin(u)) +
        2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI);
      z = -8 * Math.sin(u);
    }

    const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

    target.set(x, y, z);
  },
  Mobius: function (u, t, target) {
    // flat mobius strip
    // http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
    u = u - 0.5;
    const v = 2 * Math.PI * t;
    const a = 2;
    const x = Math.cos(v) * (a + u * Math.cos(v / 2));
    const y = Math.sin(v) * (a + u * Math.cos(v / 2));
    const z = u * Math.sin(v / 2);

    target.set(x, y, z);
  },
  Mobius3d: function (u, t, target) {
    // volumetric mobius strip

    u *= Math.PI;
    t *= 2 * Math.PI;

    u = u * 2;
    const phi = u / 2;
    const major = 2.25,
      a = 0.125,
      b = 0.65;

    let x = a * Math.cos(t) * Math.cos(phi) - b * Math.sin(t) * Math.sin(phi);
    const z = a * Math.cos(t) * Math.sin(phi) + b * Math.sin(t) * Math.cos(phi);
    const y = (major + x) * Math.sin(u);
    x = (major + x) * Math.cos(u);

    target.set(x, y, z);
  },
  Custom: function (u, v, target) {
    const size = 20;
    const x = u * size - size / 2;
    const y = v * size - size / 2;
    const z = 2 * Math.sin(x * y) + x + y;
    //  const z = 2 * Math.cos(x*y)+ x+y
    // const z =  Math.cos(x*y)+ Math.abs(x) +  Math.abs(y)
    target.set(x, y, z);
  },
  Custom2: function (u, v, target) {
    // z = 3*(1-x).^2.*exp(-(x.^2) - (y+1).^2) - 10*(x/5 - x.^3 - y.^5).*exp(-x.^2-y.^2) - 1/3*exp(-(x+1).^2 - y.^2)
    const size = 10;
    const x = u * size - size / 2;
    const y = v * size - size / 2;
    const z =
      3 * (1 - x) ** 2 * Math.exp(-x * x - (y + 1) ** 2) -
      10 * (x / 5 - x ** 3 - y ** 5) * Math.exp(-x * x - y * y) -
      (1 / 3) * Math.exp(-((x + 1) ** 2) - y * y);
    target.set(x, y, z);
  },
  Custom3: function (u, v, target) {
    const size = 40;
    const x = u * size - size / 2;
    const y = v * size - size / 2;
    const z = 2 * Math.sin(Math.sqrt(x ** 2 + y ** 2));
    target.set(x, y, z);
  },
  RadialWave: function (u, v, target) {
    var r = 50;
    var x = Math.sin(u) * r - r / 2;
    var y = Math.sin(v / 2) * 2 * r - r / 2;
    var z = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 2.8;
    target.set(x, y, z);
  },
};

function draw(scene) {
  const parametric = new ParametricGeometry(funcList.RadialWave, 50, 50);
  const material = new MeshNormalMaterial({
    depthTest: true,
    side: 2,
    // wireframe:true
  });
  const mesh = new Mesh(parametric, material);

  scene.add(mesh);
}


