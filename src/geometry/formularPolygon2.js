import {
  Vector3,
  Vector2,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  LineBasicMaterial,
  LineLoop,
  Points,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initAxesHelper,
  initCustomGrid,
  resize,
  initOrthographicCamera,
  initOrbitControls,
  initScene
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { PolyBool } from '../lib/other/PolyBool.js';

// eslint-disable-next-line no-undef
const { create, all } = math;

const mathjs = create(all);
const { compile, isComplex } = mathjs;

function round(num, bit = 14) {
  return Number(num.toFixed(bit));
}

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(0, 0, 15));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  const geometryParams = {
    xMin: -0.5,
    xMax: 0.5,
    yMin: -2,
    yMax: 2,
    resolution: 19,
  };

  const func = '((0.1*(x^0.678))+1)';

  const { up, down, bool } = getFormulaPoints(geometryParams, true, func);

  const gu = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(up), 3));
  const gd = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(down), 3));

  const mpu = new PointsMaterial({ color: 'orange', size: 8 });
  const mlu = new LineBasicMaterial({ color: 'red' });
  const mpd = new PointsMaterial({ color: 'green', size: 8 });
  const mld = new LineBasicMaterial({ color: 'blue' });

  scene.add(new LineLoop(gu, mlu), new LineLoop(gd, mld));
  scene.add(new Points(gu, mpu), new Points(gd, mpd));

  console.log(bool);

  const gb = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(bool), 3));
  const mpb = new PointsMaterial({ color: '#673ab7', size: 8 });
  const mlb = new LineBasicMaterial({ color: 'blue' });

  scene.add(new LineLoop(gb, mlb), new Points(gb, mpb));


  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  renderer.setAnimationLoop(render);

}

function getFormulaPoints(geometryParams, isSymmetric, func1, func2) {
  const {
    xMax, xMin, yMax, yMin, resolution,
  } = geometryParams;
  const delta = (xMax - xMin) / resolution;
  const positive = [];
  const negative = [];
  try {
    if (isSymmetric) {
      const funcCompile1 = compile(func1);
      const getY = computeFunc(funcCompile1, yMin, yMax);
      for (
        let index = 0, length = resolution - 1;
        index < length;
        index++
      ) {
        const x = round(xMin + index * delta);
        const y = getY(x);
        if (!isComplex(y)) {
          positive.push(new Vector2(x, y < 0 ? 0 : y));
          negative.push(new Vector2(x, -y > 0 ? 0 : -y));
        } else {
          positive.push(new Vector2(x, 0));
          negative.push(new Vector2(x, 0));
        }
      }
      const y = getY(xMax);
      if (!isComplex(y)) {
        positive.push(new Vector2(xMax, y < 0 ? 0 : y));
        negative.push(new Vector2(xMax, -y > 0 ? 0 : -y));
      } else {
        positive.push(new Vector2(xMax, 0));
        negative.push(new Vector2(xMax, 0));
      }
    } else {
      const funcCompile1 = compile(func1);
      const funcCompile2 = compile(func2);
      const getY1 = computeFunc(funcCompile1, yMin, yMax);
      const getY2 = computeFunc(funcCompile2, yMin, yMax);
      for (
        let index = 0, length = resolution - 1;
        index < length;
        index++
      ) {
        const x = round(xMin + index * delta);
        const y1 = getY1(x);
        const y2 = getY2(x);
        if (!isComplex(y1)) {
          positive.push(new Vector2(x, y1 < 0 ? 0 : y1));
        } else {
          positive.push(new Vector2(x, 0));
        }
        if (!isComplex(y2)) {
          negative.push(new Vector2(x, -y2 > 0 ? 0 : -y2));
        } else {
          negative.push(new Vector2(x, 0));
        }
      }
      const y1 = getY1(xMax);
      const y2 = getY2(xMax);
      if (!isComplex(y1)) {
        positive.push(new Vector2(xMax, y1 < 0 ? 0 : y1));
      } else {
        positive.push(new Vector2(xMax, 0));
      }
      if (!isComplex(y2)) {
        negative.push(new Vector2(xMax, -y2 > 0 ? 0 : -y2));
      } else {
        negative.push(new Vector2(xMax, 0));
      }
    }
  } catch (error) {
    console.log(error);
  }

  positive.push(new Vector2(xMax, yMin), new Vector2(xMin, yMin));
  negative.push(new Vector2(xMax, yMax), new Vector2(xMin, yMax));

  const j = removeCollinearPoints(positive);
  const k = removeCollinearPoints(negative);

  const j3 = vec2ToVec3Flat(j, 0.5);
  const k3 = vec2ToVec3Flat(k, 1);

  const b1 = { regions: [j], inverted: false };
  const b2 = { regions: [k], inverted: false };

  const res = PolyBool.intersect(b1, b2);

  console.log(res);

  return {
    up: j3,
    down: k3,
    bool: vec2ToVec3Flat(res.regions[0], 2),
  };
}

function removeCollinearPoints(loop) {
  const result = [];
  const numPoints = loop.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = loop[i];
    const p2 = loop[(i + 1) % numPoints];
    const p3 = loop[(i + 2) % numPoints];

    const v1 = [p2.x - p1.x, p2.y - p1.y];
    const v2 = [p3.x - p2.x, p3.y - p2.y];

    if (Math.abs(v1[0] * v2[1] - v1[1] * v2[0]) >= 1e-12) {
      result.push([p2.x, p2.y]);
    }
  }

  return result;
}

function computeFunc(funcCompile, yMin, yMax) {
  return (x) => {
    let y = funcCompile.evaluate({ x });
    if (y > yMax) {
      y = yMax;
    } else if (y < yMin) {
      y = yMin;
    }
    return y;
  };
}

function vec2ToVec3Flat(vec2list, height) {
  const res = [];
  vec2list.forEach((v) => {
    res.push(v[0], v[1], height);
  });
  return res;
}
