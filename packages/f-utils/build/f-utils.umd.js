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
  class EventDispatcher {
    constructor() {
      this._listeners = {};
    }
    addEventListener(type, listener) {
      const listeners = this._listeners;
      if (listeners[type] === void 0) {
        listeners[type] = [];
      }
      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].push(listener);
      }
    }
    hasEventListener(type, listener) {
      if (this._listeners === void 0)
        return false;
      const listeners = this._listeners;
      return listeners[type] !== void 0 && listeners[type].indexOf(listener) !== -1;
    }
    removeEventListener(type, listener) {
      const listenerArray = this._listeners[type];
      if (listenerArray !== void 0) {
        const index = listenerArray.indexOf(listener);
        if (index !== -1) {
          listenerArray.splice(index, 1);
        }
      }
    }
    dispatchEvent(type, ...arg) {
      const listenerArray = this._listeners[type];
      if (listenerArray !== void 0) {
        const array = listenerArray.slice(0);
        for (let i = 0, l = array.length; i < l; i++) {
          array[i].call(this, ...arg);
        }
      }
    }
  }
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  const { generateUUID } = three.MathUtils;
  const removedEvent = "removed";
  const addedEvent = "added";
  const changeEvent = "change";
  class TreeNode extends EventDispatcher {
    constructor(type, attribute = {}) {
      super();
      this.name = "";
      this.id = generateUUID();
      this.children = [];
      this.parent = null;
      this.attribute = attribute;
      this._type = type;
    }
    get type() {
      return this._type;
    }
    // 增
    add(node) {
      node.parent = this;
      this.children.push(node);
      node.dispatchEvent(addedEvent, node);
    }
    // 改
    getAttribute() {
      return deepClone(this.attribute);
    }
    setAttribute(attribute) {
      this.dispatchEvent(changeEvent, deepClone(this.attribute), attribute);
      Object.assign(this.attribute, attribute);
    }
    // 删
    remove(node) {
      const index = this.children.indexOf(node);
      if (index !== -1) {
        this.children.splice(index, 1);
        node.parent = null;
        node.dispatchEvent(removedEvent, node);
      }
      return this;
    }
    removeFromParent() {
      if (this.parent) {
        this.parent.remove(this);
      }
      return this;
    }
    clear() {
      this.children.forEach((n) => {
        this.remove(n);
      });
    }
    // 查
    getNotesByProperty(key, value) {
      let result = [];
      if (this[key] === value)
        result.push(this);
      for (let i = 0, l = this.children.length; i < l; i++) {
        const childResult = this.children[i].getNotesByProperty(key, value);
        if (childResult.length > 0) {
          result = result.concat(childResult);
        }
      }
      return result;
    }
    getNodeByProperty(key, value) {
      if (this[key] === value)
        return this;
      for (let i = 0, l = this.children.length; i < l; i++) {
        const child = this.children[i];
        const object = child.getNodeByProperty(key, value);
        if (object !== void 0) {
          return object;
        }
      }
      return void 0;
    }
  }
  exports2.EventDispatcher = EventDispatcher;
  exports2.TreeNode = TreeNode;
  exports2.deepClone = deepClone;
  exports2.rotationFormula = rotationFormula;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
