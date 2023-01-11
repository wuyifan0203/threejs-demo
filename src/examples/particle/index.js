/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-11 18:32:50
 * @FilePath: /threejs-demo/src/examples/particle/index.js
 */
import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
  TextureLoader,
  BackSide,
  PerspectiveCamera,
  Sprite,
  SpriteMaterial,
  Raycaster,
  Vector2,
  BufferGeometry,
  PointsMaterial,
  Float32BufferAttribute,
  Color,
  Points,
} from "../../lib/three/three.module.js";
import { OrbitControls } from "../../lib/three/OrbitControls.js";
import { ViewHelper } from "../../lib/three/viewHelper.js";
import { initRenderer, resize } from "../../lib/tools/index.js";
import datGui from "../../lib/util/dat.gui.js";
(function () {
  init();
})();

function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(3, 3, 63);
  camera.lookAt(10, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);

  const controls = new OrbitControls(camera, renderer.domElement);

  draw(scene);
  const viewHelper = new ViewHelper(camera, renderer.domElement);
  resize(renderer, camera);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  window.camera = camera;
  window.scene = scene;
}

function draw(scene) {
  const gui = new datGui.GUI();
  var controls = {
    row: 30,
    col: 20,
    drawFunc: createParticlesBySprite,
  };
  createParticlesBySprite();
  gui.add(controls, "row", 1, 100, 1).onChange(e=>{change(scene)});
  gui.add(controls, "col", 1, 100, 1).onChange(e=>{change(scene)});
  gui.add(controls, "drawFunc", {
    Sprite: createParticlesBySprite,
    Points: createParticlesByPoints,
  }).onChange(e=>{
    change(scene)
  });

  function createParticlesBySprite() {
    const hx = controls.row / 2;
    const hy = controls.col / 2;
    for (let x = 0; x < controls.row; x++) {
      for (let y = 0; y < controls.col; y++) {
        const material = new SpriteMaterial({
          color: Math.random() * 0xffffff,
        });
        const sprite = new Sprite(material);
        sprite.position.set((x - hx) * 4, (y - hy) * 4, 0);
        scene.add(sprite);
      }
    }
  }

  function createParticlesByPoints() {
    const hx = controls.row / 2;
    const hy = controls.col / 2;
    const geom = new BufferGeometry();
    const material = new PointsMaterial({
      size: 3,
      vertexColors: true,
      color: 0xffffff,
    });
    let veticsFloat32Array = [];
    let veticsColors = [];
    for (let x = 0; x < controls.row; x++) {
      for (let y = 0; y < controls.col; y++) {
        veticsFloat32Array.push((x - hx) * 4, (y - hy) * 4, 0);
        const randomColor = new Color(Math.random() * 0xffffff);
        veticsColors.push(randomColor.r, randomColor.g, randomColor.b);
      }
    }
    const vertices = new Float32BufferAttribute(veticsFloat32Array, 3);
    const colors = new Float32BufferAttribute(veticsColors, 3);
    geom.attributes.position = vertices;
    geom.attributes.color = colors;
    const particles = new Points(geom, material);
    scene.add(particles);
  }

  function change(scene) {
    scene.children.forEach(obj3d=>{
        scene.remove(obj3d);
        obj3d.parent = null;
        if(obj3d.material){
            obj3d.material.dispose();
        }
        if(obj3d.geometry){
            obj3d.geometry.dispose();
        }
        console.log('remove');
    })

    console.log(scene.children);

    const F = eval("(" + controls.drawFunc + ")");
    // F(scene);
  }
}
