import { Vector3, Matrix4 } from 'three';
/**
 * @description: use Rodrigues` rotation formula to create rotate matrix
 * @param {Vector3} vec3Before
 * @param {Vector3} vec3After
 * @return {Matrix4} rotate matrix
 */
declare function rotationFormula(vec3Before: Vector3, vec3After: Vector3, target: Matrix4): Matrix4;
export { rotationFormula };
