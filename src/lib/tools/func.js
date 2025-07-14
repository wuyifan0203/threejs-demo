/* eslint-disable no-unused-vars */
import {
  Matrix3,
  Matrix4, Quaternion, Vector3
} from 'three';
/**
 * @description: plane function
 * @param {Vector3} normal
 * @param {Vector3} origin
 * @return {Array<number>} [a,b,c,d]
 */
const planeFunctionParams = (normal, origin) => {
  return [
    normal.x,
    normal.y,
    normal.z,
    -(normal.x * origin.x + normal.y * origin.y + normal.z * origin.z)
  ];
};

/**
 * @description: create Mirror Modal Matrix
 * @param {Vector3} normalVec3
 * @param {number} d
 * @return {Matrix4} matrix
 */
const generateMirrorModalMatrix = (normalVec3, d, target = new Matrix4()) => {
  const { x, y, z } = normalVec3;
  const Nx2 = 2 * x * x;
  const Ny2 = 2 * y * y;
  const Nz2 = 2 * z * z;
  const NyNz = 2 * y * z;
  const NxNy = 2 * x * y;
  const NxNz = 2 * x * z;
  return target.set(
    1 - Nx2, -NxNy, -NxNz, -2 * d * x,
    -NxNy, 1 - Ny2, -NyNz, -2 * d * y,
    -NxNz, -NyNz, 1 - Nz2, -2 * d * z,
    0, 0, 0, 1
  );
};

/**
 * @description: create Mirror Modal Matrix
 * @param {Vector3} normalVec3
 * @param {number} d
 * @return {Matrix4} matrix
 */
const generateMirrorModalMatrix2 = (normalVec3, d) => {
  const { x, y, z } = normalVec3;
  const Nx2 = 2 * x * x;
  const Ny2 = 2 * y * y;
  const Nz2 = 2 * z * z;
  const NyNz = 2 * y * z;
  const NxNy = 2 * x * y;
  const NxNz = 2 * x * z;
  return new Matrix4().set(
    1 - Nx2, -NxNy, -NxNz, 0,
    -NxNy, 1 - Ny2, -NyNz, 0,
    -NxNz, -NyNz, 1 - Nz2, 0,
    0, 0, 0, 1
  );
};

const createMirrorMatrix = (normal, origin) => {
  const normalize = normal.normalize();
  const [, , , d] = planeFunctionParams(normalize, origin);
  return generateMirrorModalMatrix(normalize, d);
};

/**
 * @description: 将一个点进行变换
 * @param {Vector3} vertices
 * @param {Matrix4} matrix
 * @return {number[]} [x,y,z]
 */
const translateVertices = (vertices, matrix) => {
  const vec3 = new Vector3(...vertices);
  vec3.applyMatrix4(matrix);
  return vec3.toArray();
};

const mirrorModalMatrix = (mirrorMatrix, modelMatrix) => {
  return modelMatrix.premultiply(mirrorMatrix);
};

const modalMatrixMirror = (mirrorMatrix, modelMatrix) => {
  return modelMatrix.multiply(mirrorMatrix);
};

const decomposeMatrix = (matrix) => {
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  matrix.decompose(position, quaternion, scale);
  return {
    position,
    quaternion,
    scale
  };
};

const generateModalMatrix = (mesh) => {
  return new Matrix4().compose(mesh.position, mesh.quaternion, mesh.scale);
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const MatrixMultiplyVector = (matrix, vec3) => {
  const [a, b, c, e, f, g, i, j, k, m, n, o] = matrix.elements;
  const { x, y, z } = vec3;
  return new Vector3(
    a * x + e * y + i * z + m,
    b * x + f * y + j * z + n,
    c * x + g * y + k * z + o
    // d * x + h * y + l * z + p
  );
};

const normalizeVec3 = (vec3) => {
  const { x, y, z } = vec3;
  const normal = new Vector3(x, y, z).normalize();
  vec3.x = normal.x;
  vec3.y = normal.y;
  vec3.z = normal.z;
  return vec3;
};

const normal2Euler = (normal) => {
  normal.normalize();
  const dx = normal.z / normal.y;
  const dy = normal.z / normal.x;
  const dz = normal.x / normal.y;
  const [thetaX, thetaY, thetaZ] = [
    isNaN(dx) ? 0 : dx,
    isNaN(dy) ? 0 : dy,
    isNaN(dz) ? 0 : dz
  ];

  return {
    x: (Math.atan(thetaX)),
    y: (Math.atan(thetaY)),
    z: (Math.atan(thetaZ))
  };
};

/**
 * @description: angle to radians
 * @param {number} angle
 * @return {number} radians
 */

function angle2Radians(angle) {
  return angle / 180 * Math.PI;
}

/**
 * @description: radians to  angle
 * @param {number} radians
 * @return {number} angle
 */

function radians2Angle(radians) {
  return radians * 180 * Math.PI;
}

/**
 * @description: canvas coordinates are converted to 2D screen coordinates
 * @param {number} canvasX
 * @param {number} canvasY
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @return {{x:number,y:number}}
 */
function CC2SSC(canvasX, canvasY, canvasWidth, canvasHeight) {
  return {
    x: canvasX - canvasWidth / 2,
    y: -canvasY + canvasHeight / 2
  }
}



/**
 * 叉乘
 */
const crossProduct = (v1, v2) => {
  const [v1x, v1y] = v1;
  const [v2x, v2y] = v2;
  return v1x * v2y - v2x * v1y;
};

/**
 * 是否可以相交
 * @param baseEedge
 * @param targetEdge
 */
const isIntersection = (baseEdge, targetEdge) => {
  const [basePointA, basePointB] = baseEdge;
  const [targetPointC, targetPointD] = targetEdge;

  const vBase = [basePointA.x - basePointB.x, basePointA.y - basePointB.y];
  const vBaseC = [basePointA.x - targetPointC.x, basePointA.y - targetPointC.y];
  const vBaseD = [basePointA.x - targetPointD.x, basePointA.y - targetPointD.y];
  return crossProduct(vBase, vBaseC) * crossProduct(vBase, vBaseD) <= 0;
};

/**
 * 提取数组元素
 */
const extractArray = (array, startIndex, length) => {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(array[(startIndex + i) % array.length]);
  }
  return arr;
};

/**
 * @description: 判断是否为简单多边型(既图形是否打结)
 * @param {Array<Vector2>} points 围成多边形的所有点，按先后顺序组成的数组
 * @return {boolean}
 */
const isComplexPolygon = (points) => {
  const length = points.length;
  if (length < 4) return false;
  const edges = points.reduce((edges, startPoint, i, array) => {
    const endPoint = array[(i + 1) % length];
    edges.push([startPoint, endPoint]); // [起始点, 结束点]
    return edges;
  }, []);


  // 逐边判断 相邻的边无需判断
  for (const [i, baseEdge] of Object.entries(edges)) {
    const nonadjacentEdge = extractArray(edges, Number(i) + 2, edges.length - 3);
    const flag = nonadjacentEdge.some(
      (edge) => isIntersection(baseEdge, edge) && isIntersection(edge, baseEdge)
    );
    if (flag) return true;
  }
  return false;
};

/**
 * @description: 判断是否顺时针
 * @param {Array<{x:number,y:number}>} loop
 * @return {boolean}
 */
function isClockWise(loop) {
  let area = 0;
  for (let i = 0; i < loop.length; i++) {
    const p1 = loop[i];
    const p2 = loop[(i + 1) % loop.length];
    area += (p2.x - p1.x) * (p2.y + p1.y);
  }
  return area < 0;
}

function previewCanvas(canvas) {
  const img = document.createElement('img');
  img.src = canvas.toDataURL(); // 将 canvas 转换为数据 URL
  document.body.appendChild(img); // 将 <img> 元素添加到文档中
}

function getLineLength(points) {
  const current = new Vector3();
  let length = 0;
  const next = new Vector3();
  for (let i = 1, l = points.length; i < l; i++) {
    current.copy(points[i - 1]);
    next.copy(points[i]);
    length += current.distanceTo(next);
  }
  return length;
}


/**
 * @description: deepMerge
 * @param {Object} target
 * @param {Object} source
 * @return {Object} target
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // 如果是对象，递归合并
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else if (Array.isArray(source[key])) {
      // 如果是数组，合并较长数组（按索引合并）
      target[key] = target[key] || [];
      const maxLength = Math.max(target[key].length, source[key].length);
      for (let i = 0; i < maxLength; i++) {
        if (typeof source[key][i] === 'object') {
          target[key][i] = deepMerge(target[key][i] || {}, source[key][i]);
        } else {
          target[key][i] = source[key][i] ?? target[key][i];
        }
      }
    } else {
      // 基本类型直接覆盖
      target[key] = source[key];
    }
  }
  return target;
}

function gridPositions(total, current, gap = 1) {
  const size = Math.ceil(Math.sqrt(total));
  const center = (size - 1) / 2;

  const row = Math.floor(current / size);
  const col = current % size;

  return {
    x: (col - center) * gap,
    y: (row - center) * gap,
    z: 0
  };
}

/**
 * @description: 变换图形
 * @param {{shape:Array<Vector2>,holes:Array<Array<Vector2>>}} shapeType 图形类型
 * @param {'translate'|'rotate'|'scale'} type 变换类型
 * @param {Vector2|number} params 变换参数
 * @return {void}
 */
function transformShape({ shape, holes }, type, params) {
  const matrix = new Matrix3();
  switch (type) {
    case 'translate':
      matrix.makeTranslation(params);
      break;
    case 'rotate':
      matrix.makeRotation(params);
      break;
    case 'scale':
      matrix.makeScale(params.x, params.y);
      break;
  }
  shape.forEach((point) => {
    point.applyMatrix3(matrix);
  });
  if (holes && holes.length) {
    holes.forEach((hole) => {
      hole.forEach((point) => {
        point.applyMatrix3(matrix);
      })
    })
  }
}




export {
  translateVertices,
  planeFunctionParams,
  generateMirrorModalMatrix,
  mirrorModalMatrix,
  decomposeMatrix,
  generateModalMatrix,
  clone,
  modalMatrixMirror,
  MatrixMultiplyVector,
  normalizeVec3,
  generateMirrorModalMatrix2,
  createMirrorMatrix,
  normal2Euler,
  angle2Radians,
  radians2Angle,
  CC2SSC,
  isComplexPolygon,
  isClockWise,
  previewCanvas,
  getLineLength,
  deepMerge,
  gridPositions,
  transformShape,
};
