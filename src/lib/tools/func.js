/* eslint-disable no-unused-vars */
import { Matrix4, Quaternion, Vector3 } from '../three/three.module.js';
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
const generateMirrorModalMatrix = (normalVec3, d) => {
  const { x, y, z } = normalVec3;
  const Nx2 = 2 * x * x;
  const Ny2 = 2 * y * y;
  const Nz2 = 2 * z * z;
  const NyNz = 2 * y * z;
  const NxNy = 2 * x * y;
  const NxNz = 2 * x * z;
  return new Matrix4().set(
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
  const [,,, d] = planeFunctionParams(normalize, origin);
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
  console.log(normal);
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
  radians2Angle
};
