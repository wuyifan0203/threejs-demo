(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("three")) : typeof define === "function" && define.amd ? define(["exports", "three"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["f-utils"] = {}, global.THREE));
})(this, function(exports2, three) {
  "use strict";
  function rotationFormula(vec3Before, vec3After, target) {
    const rotationAxis = new three.Vector3().crossVectors(vec3Before, vec3After);
    const rotateAngle = Math.acos(dotProduct(vec3Before, vec3After) / normalizeVec3(vec3Before) * normalizeVec3(vec3After));
    return rotateMatrix(rotateAngle, rotationAxis, target);
  }
  function normalizeVec3(vec3) {
    const { x, y, z } = vec3;
    return Math.sqrt(x * x + y * y + z * z);
  }
  function dotProduct(v1, v2) {
    return v1.dot(v2);
  }
  function rotateMatrix(rotateAngle, rotationAxis, target = new three.Matrix4()) {
    const norm = normalizeVec3(rotationAxis);
    const Ux = isNaN(rotationAxis.x / norm) ? 0 : rotationAxis.x / norm;
    const Uy = isNaN(rotationAxis.y / norm) ? 0 : rotationAxis.y / norm;
    const Uz = isNaN(rotationAxis.z / norm) ? 0 : rotationAxis.z / norm;
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
      m11,
      m12,
      m13,
      0,
      m21,
      m22,
      m23,
      0,
      m31,
      m32,
      m33,
      0,
      0,
      0,
      0,
      1
    );
  }
  exports2.rotationFormula = rotationFormula;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
