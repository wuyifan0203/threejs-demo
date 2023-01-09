import {
  Vector3,
  Scene,
  ArrowHelper
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  createAxesHelper,
  initDefaultLighting
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';

(function() {
  init();
})();

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera();
  const scene = new Scene();

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

function draw(scene) {
  const dir = new Vector3(1, 0, 0).normalize();
  const origin = new Vector3(0, 0, 0);
  const arrowHelper = new ArrowHelper(dir, origin, 4, 'blue', 1, 0.5);
  scene.add(arrowHelper);
}
