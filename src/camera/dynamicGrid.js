import {
  Mesh,
  Color,
  BoxGeometry,
  Vector3,
  WebGLRenderer,
  MeshNormalMaterial,
} from '../lib/three/three.module.js';
import { DynamicGrid } from '../lib/three/GridHelper2.js';
import {
  initRenderer,
  resize,
  initOrthographicCamera,
  initScene,
  initOrbitControls,
  initStats
} from '../lib/tools/index.js';


window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const stats = new initStats();

  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  camera.up.set(0, 0, 1);

  const scene = initScene();
  scene.background = new Color(0xf0f0f0);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  orbitControls.enableRotate = false;
  resize(renderer, camera);

  let customGrid = new DynamicGrid(50, 1);
  customGrid.rotateX(Math.PI / 2);
  scene.add(customGrid);

  const customCamera = initOrthographicCamera(new Vector3(0, 0, 100));
  const customRenderer = new WebGLRenderer({ antialias: true });

  const boxMesh = new Mesh(new BoxGeometry(4, 4, 3), new MeshNormalMaterial());
  scene.add(boxMesh);

  customRenderer.setSize(300, 200);
  const dom2 = document.querySelector('#webgl-output2');
  dom2.append(customRenderer.domElement);

  function render() {
    stats.begin();
    orbitControls.update();
    renderer.render(scene, camera);
    customRenderer.render(scene, customCamera);
    stats.end();
    requestAnimationFrame(render);
  }
  render();


  const dom = document.querySelector('#webgl-output');
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 100;
  canvas.style.position = 'fixed';
  canvas.style.bottom = '50px';
  const ctx = canvas.getContext('2d');
  dom.append(canvas);
  ctx.font = '15px serif';

  function updateUnit(unit, gridUnit) {
    // eslint-disable-next-line operator-assignment
    unit = unit * gridUnit;
    // console.log(unit, gridUnit);
    ctx.clearRect(0, 0, 300, 100);
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20 + unit, 20);
    ctx.lineTo(20 + unit, 30);
    ctx.lineTo(20, 30);
    ctx.lineTo(20, 20);
    ctx.fillStyle = '#808080';
    ctx.fill();
    ctx.strokeRect(20 + unit, 21, unit, 8);
    ctx.strokeStyle = '#808080';
    ctx.closePath();
    gridUnit = parseFloat(gridUnit > 1 ? gridUnit.toFixed(1) : gridUnit.toFixed(10));
    ctx.fillText(`${gridUnit} um`, 20, 10);
  }

  function getInterval(camera) {
    const { width, height } = dom.getBoundingClientRect();
    const cpi = camera.projectionMatrixInverse.elements;
    const MP0 = cpi[0];
    const MP5 = cpi[5];
    const [divisionX, divisionY] = [width / MP0 / 2, height / MP5 / 2];
    return {
      x: divisionX,
      y: divisionY,
    };
  }

  orbitControls.addEventListener('change', () => {
    const { x: unitX } = getInterval(camera);

    const { x, y } = getY(unitX);

    // console.log('unitX', unitX, 'Y', x * y, 'x', x, 'y', y);

    let gridUnit = 5;
    if (y === 1) {
      gridUnit = 1 * x;
    } else if (y === 2) {
      gridUnit = 2 * x;
    } else if (y === 5) {
      gridUnit = 4 * x;
    }

    gridUnit = Number(gridUnit.toFixed(14));

    // console.log('gridUnit', gridUnit);
    customGrid.updateInterval(gridUnit);
    // 保证一直为虚线
    customGrid.material.gapSize = gridUnit / 20;
    customGrid.material.dashSize = gridUnit / 20;
    customGrid.computeLineDistances();


    const { x: cx, y: cy } = orbitControls.target;
    const dx = cx % gridUnit;
    const dy = cy % gridUnit;
    const dz = cy % gridUnit;
    const pos = new Vector3().subVectors(orbitControls.target, new Vector3(dx, dy, dz));
    customGrid.position.copy(pos);
    updateUnit(unitX, gridUnit);
  });
}

function getY(x) {
  let scaledX = x;
  while (scaledX < 10) {
    scaledX *= 10;
  }

  while (scaledX >= 100) {
    scaledX /= 10;
  }

  let scaledY;
  if (scaledX < 25) {
    scaledY = 5;
  } else if (scaledX < 50) {
    scaledY = 2;
  } else {
    scaledY = 1;
  }

  return {
    y: scaledY,
    x: scaledX / x,
  };
}
