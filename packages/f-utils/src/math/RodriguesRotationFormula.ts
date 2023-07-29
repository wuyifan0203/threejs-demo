/*
 * _______________#########_______________________
 * ______________############_____________________
 * ______________#############____________________
 * _____________##__###########___________________
 * ____________###__######_#####__________________
 * ____________###_#######___####_________________
 * ___________###__##########_####________________
 * __________####__###########_####_______________
 * ________#####___###########__#####_____________
 * _______######___###_########___#####___________
 * _______#####___###___########___######_________
 * ______######___###__###########___######_______
 * _____######___####_##############__######______
 * ____#######__#####################_#######_____
 * ____#######__##############################____
 * ___#######__######_#################_#######___
 * ___#######__######_######_#########___######___
 * ___#######____##__######___######_____######___
 * ___#######________######____#####_____#####____
 * ____######________#####_____#####_____####_____
 * _____#####________####______#####_____###______
 * ______#####______;###________###______#________
 * ________##_______####________####______________
 *              神兽保佑            永无BUG
 */

import { Vector3, Matrix4 } from 'three';

/**
 * @description: use Rodrigues` rotation formula to create rotate matrix
 * @param {Vector3} vec3Before
 * @param {Vector3} vec3After
 * @return {Matrix4} rotate matrix
 */
function rotationFormula(vec3Before:Vector3, vec3After:Vector3, target:Matrix4) {
  const rotationAxis = new Vector3().crossVectors(vec3Before, vec3After);

  const rotateAngle = Math.acos(dotProduct(vec3Before, vec3After) / normalizeVec3(vec3Before) * normalizeVec3(vec3After));

  return rotateMatrix(rotateAngle, rotationAxis, target);
}

/**
 * @description: 求 vec3 的膜长
 * @param {Vector3} vec3
 * @return {number}
 */
function normalizeVec3(vec3:Vector3):number {
  const { x, y, z } = vec3;
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * @description:  vec3 dot product
 * @param {Vector3} v1
 * @param {Vector3} v2
 * @return {number} number
 */
function dotProduct(v1:Vector3, v2:Vector3):number {
  return v1.dot(v2);
}

/**
 * @description: generate rotate matrix
 * @param {Number} rotateAngle
 * @param {Vector3} rotationAxis
 * @return {Matrix4} Matrix4
 */
function rotateMatrix(rotateAngle:number, rotationAxis:Vector3, target = new Matrix4()) {
  const norm = normalizeVec3(rotationAxis);

  const Ux = isNaN(rotationAxis.x / norm) ? 0 :rotationAxis.x / norm;
  const Uy = isNaN(rotationAxis.y / norm) ? 0 :rotationAxis.y / norm;
  const Uz = isNaN(rotationAxis.z / norm) ? 0 :rotationAxis.z / norm;

  const cr = Math.cos(rotateAngle);
  const sr = Math.sin(rotateAngle);

  const m11 = cr + Ux * Ux * (1 - cr);
  const m12 = Ux * Uy * (1 - cr) - Uz * sr;
  const m13 = Uy * sr + Ux * Uz * (1 - cr);

  const m21 = Uz * sr + Ux * Uy * (1 - cr);
  const m22 = Uy * Uy * (1 - cr) + cr;
  const m23 = -Ux * sr + Uy * Uz * (1 - cr);

  const m31 = -Uy * sr + Ux * Uz * (1 - cr);
  const m32 = Ux * sr + Uy * Uz * (1 - cr);
  const m33 = cr + Uz * Uz * (1 - cr);

  return target.set(
    m11, m12, m13, 0,
    m21, m22, m23, 0,
    m31, m32, m33, 0,
    0, 0, 0, 1
  );
}

export {
  rotationFormula
};
