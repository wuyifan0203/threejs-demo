import {
  Vector3,
  Scene,
  Mesh,
  MeshNormalMaterial,
  ExtrudeGeometry,
  Shape,
  Vector2,
  Path,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';
import dat from '../../lib/util/dat.gui.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

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
}

const funcList = {
  Square() {
    return {
      path: [
        [2, 2],
        [-2, 2],
        [-2, -2],
        [2, -2],
      ],
    };
  },
  InversSquare() {
    return {
      path: [
        [2, 2],
        [2, -2],
        [-2, -2],
        [-2, 2],
      ],
    };
  },
  SquareWithHole() {
    return {
      path: [
        [8, 8],
        [-8, 8],
        [-8, -8],
        [8, -8],
      ],
      hole: [
        [2, 2],
        [-2, 2],
        [-2, -2],
        [2, -2],
      ],
    };
  },

};

function draw(scene) {
  const list = Object.keys(funcList);

  const material = new MeshNormalMaterial({
    depthTest: true,
    side: 2,
  });

  const controls = {
    drawFunc: list[0],
  };

  const extrudeSettings = {
    steps: 2,
    depth: 3,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  };

  function getShape(func) {
    const { path, hole } = func();

    const pathArray = path.map((vec2) => new Vector2(...vec2));
    const shape = new Shape(pathArray);
    if (hole) {
      const holeArray = hole.map((vec2) => new Vector2(...vec2));
      shape.holes = [new Path(holeArray)];
    }
    return shape;
  }
  const shape = getShape(funcList[controls.drawFunc]);

  const parametric = new ExtrudeGeometry(shape, extrudeSettings);

  const mesh = new Mesh(parametric, material);

  const gui = new dat.GUI();

  function update() {
    parametric.dispose();
    mesh.geometry = new ExtrudeGeometry(getShape(funcList[controls.drawFunc]), extrudeSettings);
  }

  gui.add(controls, 'drawFunc', list).onChange((e) => update());
  gui.add(material, 'wireframe');
  gui.add(extrudeSettings, 'steps', 1, 10, 1).onChange((e) => update());
  gui.add(extrudeSettings, 'depth', 1, 10, 0.1).onChange((e) => update());
  gui.add(extrudeSettings, 'bevelEnabled', 1, 10, 1).onChange((e) => update());
  gui.add(extrudeSettings, 'bevelSize', 0, 10, 1).onChange((e) => update());
  gui.add(extrudeSettings, 'bevelSegments', 1, 10, 1).onChange((e) => update());
  gui.add(extrudeSettings, 'bevelOffset', 1, 10, 1).onChange((e) => update());

  scene.add(mesh);
}
