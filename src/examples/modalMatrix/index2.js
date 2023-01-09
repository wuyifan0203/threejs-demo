/* eslint-disable no-unused-vars */
import { Matrix4, Quaternion, Vector3 } from '../../lib/three/three.module.js';
import {
  generateMirrorModalMatrix,
  clone,
  planeFunctionParams,
  generateMirrorModalMatrix2,
  mirrorModalMatrix,
  modalMatrixMirror,
  MatrixMultiplyVector,
  normalizeVec3,
  decomposeMatrix
} from '../../lib/tools/index.js';

const position = new Vector3(-6, -5, 0);
const quaternion = new Quaternion();
const scale = new Vector3(1, 1, 1);

const normal = {
  x: 1,
  y: 1,
  z: 0
};

const origin = {
  x: 0,
  y: 0,
  z: 0
};

const modelMatrix = new Matrix4().compose(position, quaternion, scale);
const cloneModalMatrix = clone(modelMatrix);
console.table('modelMatrix :', cloneModalMatrix.elements);

normalizeVec3(normal);
const [a, b, c, d] = planeFunctionParams(normal, origin);
console.log(a, b, c, d);
const mirrorMatrix = generateMirrorModalMatrix(normal, d);
const mirrorMatrix2 = generateMirrorModalMatrix2(normal, d);
// const mirrorMatrix = generateMirrorModalMatrix3(normal, d);
const cloneMirrorMatrix = clone(mirrorMatrix);
console.log('mirrorMatrix :', cloneMirrorMatrix.elements);

const newPosition = MatrixMultiplyVector(modelMatrix, position);
console.log(newPosition);

const newPosition2 = MatrixMultiplyVector(mirrorMatrix2, position);
console.log(newPosition2);

const positionMatrix = new Matrix4().makeTranslation(position.x, position.y, position.z);

const bool = 1;
if (bool) {
  mirrorModalMatrix(mirrorMatrix, modelMatrix);
  console.table(modelMatrix.elements);
} else {
  modalMatrixMirror(mirrorMatrix, modelMatrix);
  console.log(modelMatrix.elements);
}

