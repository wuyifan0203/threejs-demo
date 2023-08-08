"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const three = require("three");
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
/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */
function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
  this._listener = listener;
  this._isOnce = isOnce;
  this.context = listenerContext;
  this._signal = signal;
  this._priority = priority || 0;
}
SignalBinding.prototype = {
  /**
   * If binding is active and should be executed.
   * @type boolean
   */
  active: true,
  /**
   * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
   * @type Array|null
   */
  params: null,
  /**
   * Call listener passing arbitrary parameters.
   * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
   * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
   * @return {*} Value returned by the listener.
   */
  execute: function(paramsArr) {
    var handlerReturn, params;
    if (this.active && !!this._listener) {
      params = this.params ? this.params.concat(paramsArr) : paramsArr;
      handlerReturn = this._listener.apply(this.context, params);
      if (this._isOnce) {
        this.detach();
      }
    }
    return handlerReturn;
  },
  /**
   * Detach binding from signal.
   * - alias to: mySignal.remove(myBinding.getListener());
   * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
   */
  detach: function() {
    return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
  },
  /**
   * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
   */
  isBound: function() {
    return !!this._signal && !!this._listener;
  },
  /**
   * @return {boolean} If SignalBinding will only be executed once.
   */
  isOnce: function() {
    return this._isOnce;
  },
  /**
   * @return {Function} Handler function bound to the signal.
   */
  getListener: function() {
    return this._listener;
  },
  /**
   * @return {Signal} Signal that listener is currently bound to.
   */
  getSignal: function() {
    return this._signal;
  },
  /**
   * Delete instance properties
   * @private
   */
  _destroy: function() {
    delete this._signal;
    delete this._listener;
    delete this.context;
  },
  /**
   * @return {string} String representation of the object.
   */
  toString: function() {
    return "[SignalBinding isOnce:" + this._isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]";
  }
};
function validateListener(listener, fnName) {
  if (typeof listener !== "function") {
    throw new Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}", fnName));
  }
}
function Signal() {
  this._bindings = [];
  this._prevParams = null;
  var self = this;
  this.dispatch = function() {
    Signal.prototype.dispatch.apply(self, arguments);
  };
}
Signal.prototype = {
  /**
   * Signals Version Number
   * @type String
   * @const
   */
  VERSION: "1.0.0",
  /**
   * If Signal should keep record of previously dispatched parameters and
   * automatically execute listener during `add()`/`addOnce()` if Signal was
   * already dispatched before.
   * @type boolean
   */
  memorize: false,
  /**
   * @type boolean
   * @private
   */
  _shouldPropagate: true,
  /**
   * If Signal is active and should broadcast events.
   * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
   * @type boolean
   */
  active: true,
  /**
   * @param {Function} listener
   * @param {boolean} isOnce
   * @param {Object} [listenerContext]
   * @param {Number} [priority]
   * @return {SignalBinding}
   * @private
   */
  _registerListener: function(listener, isOnce, listenerContext, priority) {
    var prevIndex = this._indexOfListener(listener, listenerContext), binding;
    if (prevIndex !== -1) {
      binding = this._bindings[prevIndex];
      if (binding.isOnce() !== isOnce) {
        throw new Error("You cannot add" + (isOnce ? "" : "Once") + "() then add" + (!isOnce ? "" : "Once") + "() the same listener without removing the relationship first.");
      }
    } else {
      binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
      this._addBinding(binding);
    }
    if (this.memorize && this._prevParams) {
      binding.execute(this._prevParams);
    }
    return binding;
  },
  /**
   * @param {SignalBinding} binding
   * @private
   */
  _addBinding: function(binding) {
    var n = this._bindings.length;
    do {
      --n;
    } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
    this._bindings.splice(n + 1, 0, binding);
  },
  /**
   * @param {Function} listener
   * @return {number}
   * @private
   */
  _indexOfListener: function(listener, context) {
    var n = this._bindings.length, cur;
    while (n--) {
      cur = this._bindings[n];
      if (cur._listener === listener && cur.context === context) {
        return n;
      }
    }
    return -1;
  },
  /**
   * Check if listener was attached to Signal.
   * @param {Function} listener
   * @param {Object} [context]
   * @return {boolean} if Signal has the specified listener.
   */
  has: function(listener, context) {
    return this._indexOfListener(listener, context) !== -1;
  },
  /**
   * Add a listener to the signal.
   * @param {Function} listener Signal handler function.
   * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
   * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
   * @return {SignalBinding} An Object representing the binding between the Signal and listener.
   */
  add: function(listener, listenerContext, priority) {
    validateListener(listener, "add");
    return this._registerListener(listener, false, listenerContext, priority);
  },
  /**
   * Add listener to the signal that should be removed after first execution (will be executed only once).
   * @param {Function} listener Signal handler function.
   * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
   * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
   * @return {SignalBinding} An Object representing the binding between the Signal and listener.
   */
  addOnce: function(listener, listenerContext, priority) {
    validateListener(listener, "addOnce");
    return this._registerListener(listener, true, listenerContext, priority);
  },
  /**
   * Remove a single listener from the dispatch queue.
   * @param {Function} listener Handler function that should be removed.
   * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
   * @return {Function} Listener handler function.
   */
  remove: function(listener, context) {
    validateListener(listener, "remove");
    var i = this._indexOfListener(listener, context);
    if (i !== -1) {
      this._bindings[i]._destroy();
      this._bindings.splice(i, 1);
    }
    return listener;
  },
  /**
   * Remove all listeners from the Signal.
   */
  removeAll: function() {
    var n = this._bindings.length;
    while (n--) {
      this._bindings[n]._destroy();
    }
    this._bindings.length = 0;
  },
  /**
   * @return {number} Number of listeners attached to the Signal.
   */
  getNumListeners: function() {
    return this._bindings.length;
  },
  /**
   * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
   * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
   * @see Signal.prototype.disable
   */
  halt: function() {
    this._shouldPropagate = false;
  },
  /**
   * Dispatch/Broadcast Signal to all listeners added to the queue.
   * @param {...*} [params] Parameters that should be passed to each handler.
   */
  dispatch: function(params) {
    if (!this.active) {
      return;
    }
    var paramsArr = Array.prototype.slice.call(arguments), n = this._bindings.length, bindings;
    if (this.memorize) {
      this._prevParams = paramsArr;
    }
    if (!n) {
      return;
    }
    bindings = this._bindings.slice();
    this._shouldPropagate = true;
    do {
      n--;
    } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
  },
  /**
   * Forget memorized arguments.
   * @see Signal.memorize
   */
  forget: function() {
    this._prevParams = null;
  },
  /**
   * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
   * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
   */
  dispose: function() {
    this.removeAll();
    delete this._bindings;
    delete this._prevParams;
  },
  /**
   * @return {string} String representation of the object.
   */
  toString: function() {
    return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]";
  }
};
function isSameArray(v1, v2) {
  return stringify(v1.slice().sort()) === stringify(v2.slice().sort());
}
function stringify(v) {
  return JSON.stringify(v);
}
class Selector {
  constructor(editor) {
    this.editor = editor;
    this.editor.signals.intersectionsDetected.add((selectIds) => {
      if (selectIds.length > 0) {
        this.select([selectIds[0]]);
      } else {
        this.detach();
      }
    });
  }
  select(selectIds) {
    if (isSameArray(this.editor.getState("selections"), selectIds))
      return;
    this.editor.setState("selection", selectIds);
    this.editor.signals.objectSelected.dispatch(selectIds);
    this.editor.dispatchEvent("selectionChange", selectIds);
  }
  detach() {
    this.editor.setState("selection", []);
    this.editor.signals.objectSelected.dispatch([]);
    this.editor.dispatchEvent("selectionChange", []);
  }
}
class Editor extends EventDispatcher {
  constructor(domElement) {
    super();
    this.state = {};
    this.signals = {
      objectSelected: new Signal(),
      intersectionsDetected: new Signal(),
      objectAdded: new Signal(),
      sceneGraphChanged: new Signal(),
      sceneRendered: new Signal(),
      transformModeChange: new Signal(),
      objectRemoved: new Signal()
    };
    this.domElement = domElement;
    this.scene = new three.Scene();
    this.sceneHelper = new three.Scene();
    this.selector = new Selector(this);
  }
  addObject(object, parent, index) {
    object.traverse((child) => {
      if (child.geometry !== void 0)
        this.addGeometry(child.geometry);
      if (child.material !== void 0)
        this.addMaterial(child.material);
      this.addCamera(object);
    });
    if (parent === void 0) {
      this.scene.add(object);
    } else {
      if (index === void 0) {
        parent.add(object);
      } else {
        parent.children.slice(index, 0, object);
      }
      object.parent = parent;
    }
    this.signals.objectAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
    this.dispatchEvent("objectAdded", object);
  }
  addCamera(camera) {
    if (camera == null ? void 0 : camera.isCamera)
      ;
  }
  removeCamera(camera) {
    if (camera == null ? void 0 : camera.isCamera)
      ;
  }
  addGeometry(geometry) {
  }
  removeGeometry(geometry) {
  }
  addMaterial(material) {
  }
  removeMaterial(material) {
  }
  removeObject(object) {
    if (object.parent === null)
      return;
    object.traverse((child) => {
      if (child.geometry !== void 0)
        this.removeGeometry(child.geometry);
      if (child.material !== void 0)
        this.removeMaterial(child.material);
      this.removeCamera(child);
    });
    object.parent.remove(object);
    this.signals.objectRemoved.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
  }
  removeObjectByUuid(uuid) {
    const object = this.getObjectByUuid(uuid, true);
    object && this.removeObject(object);
  }
  getObjectByUuid(uuid, isGlobal = false) {
    return this.scene.getObjectByProperty("uuid", uuid);
  }
  getObjectsByProperty(key, value) {
    let result = this.scene.getObjectsByProperty(key, value);
    const sceneHelperResult = this.sceneHelper.getObjectsByProperty(key, value);
    if (sceneHelperResult.length > 0) {
      result = result.concat(sceneHelperResult);
    }
    return result;
  }
  setState(key, value) {
    this.state[key] = value;
  }
  getState(key) {
    return this.state[key];
  }
  select(object) {
    if (object !== void 0) {
      if (Array.isArray(object)) {
        this.selector.select(object.map((obj) => obj == null ? void 0 : obj.uuid));
      } else {
        this.selector.select([object == null ? void 0 : object.uuid]);
      }
    } else {
      this.selector.detach();
    }
  }
  selectById(uuid) {
    if (uuid !== void 0) {
      if (Array.isArray(uuid)) {
        this.selector.select(uuid);
      } else {
        this.selector.select([uuid]);
      }
    } else {
      this.selector.detach();
    }
  }
  setSceneBackground(background) {
    this.scene.background = background;
    this.signals.sceneGraphChanged.dispatch();
  }
}
let ViewHelper$1 = class ViewHelper extends three.Object3D {
  constructor(camera, domElement) {
    super();
    this.object = camera;
    this.isViewHelper = true;
    this.animating = false;
    this.center = new three.Vector3();
    const color1 = new three.Color("#ff3653");
    const color2 = new three.Color("#8adb00");
    const color3 = new three.Color("#2c8fff");
    const interactiveObjects = [];
    const raycaster = new three.Raycaster();
    const mouse = new three.Vector2();
    const dummy = new three.Object3D();
    const orthoCamera = new three.OrthographicCamera(-2, 2, 2, -2, 0, 4);
    orthoCamera.position.set(0, 0, 2);
    const geometry = new three.BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);
    const xAxis = new three.Mesh(geometry, getAxisMaterial(color1));
    const yAxis = new three.Mesh(geometry, getAxisMaterial(color2));
    const zAxis = new three.Mesh(geometry, getAxisMaterial(color3));
    yAxis.rotation.z = Math.PI / 2;
    zAxis.rotation.y = -Math.PI / 2;
    this.add(xAxis);
    this.add(zAxis);
    this.add(yAxis);
    const posXAxisHelper = new three.Sprite(getSpriteMaterial(color1, "X"));
    posXAxisHelper.userData.type = "posX";
    const posYAxisHelper = new three.Sprite(getSpriteMaterial(color2, "Y"));
    posYAxisHelper.userData.type = "posY";
    const posZAxisHelper = new three.Sprite(getSpriteMaterial(color3, "Z"));
    posZAxisHelper.userData.type = "posZ";
    const negXAxisHelper = new three.Sprite(getSpriteMaterial(color1));
    negXAxisHelper.userData.type = "negX";
    const negYAxisHelper = new three.Sprite(getSpriteMaterial(color2));
    negYAxisHelper.userData.type = "negY";
    const negZAxisHelper = new three.Sprite(getSpriteMaterial(color3));
    negZAxisHelper.userData.type = "negZ";
    posXAxisHelper.position.x = 1;
    posYAxisHelper.position.y = 1;
    posZAxisHelper.position.z = 1;
    negXAxisHelper.position.x = -1;
    negYAxisHelper.position.y = -1;
    negZAxisHelper.position.z = -1;
    this.add(posXAxisHelper);
    this.add(posYAxisHelper);
    this.add(posZAxisHelper);
    this.add(negXAxisHelper);
    this.add(negYAxisHelper);
    this.add(negZAxisHelper);
    interactiveObjects.push(posXAxisHelper);
    interactiveObjects.push(posYAxisHelper);
    interactiveObjects.push(posZAxisHelper);
    interactiveObjects.push(negXAxisHelper);
    interactiveObjects.push(negYAxisHelper);
    interactiveObjects.push(negZAxisHelper);
    const point = new three.Vector3();
    const dim = 128;
    const turnRate = 2 * Math.PI;
    const q1 = new three.Quaternion();
    const q2 = new three.Quaternion();
    const viewport = new three.Vector4();
    let radius = 0;
    this.render = function(renderer) {
      this.quaternion.copy(this.object.quaternion).invert();
      this.updateMatrixWorld();
      point.set(0, 0, 1);
      point.applyQuaternion(this.object.quaternion);
      if (point.x >= 0) {
        posXAxisHelper.material.opacity = 1;
        negXAxisHelper.material.opacity = 0.5;
      } else {
        posXAxisHelper.material.opacity = 0.5;
        negXAxisHelper.material.opacity = 1;
      }
      if (point.y >= 0) {
        posYAxisHelper.material.opacity = 1;
        negYAxisHelper.material.opacity = 0.5;
      } else {
        posYAxisHelper.material.opacity = 0.5;
        negYAxisHelper.material.opacity = 1;
      }
      if (point.z >= 0) {
        posZAxisHelper.material.opacity = 1;
        negZAxisHelper.material.opacity = 0.5;
      } else {
        posZAxisHelper.material.opacity = 0.5;
        negZAxisHelper.material.opacity = 1;
      }
      const x = domElement.offsetWidth - dim;
      renderer.clearDepth();
      renderer.getViewport(viewport);
      renderer.setViewport(x, 0, dim, dim);
      renderer.render(this, orthoCamera);
      renderer.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);
    };
    const targetPosition = new three.Vector3();
    const targetQuaternion = new three.Quaternion();
    this.handleClick = function(event) {
      if (this.animating === true)
        return false;
      const rect = domElement.getBoundingClientRect();
      const offsetX = rect.left + (domElement.offsetWidth - dim);
      const offsetY = rect.top + (domElement.offsetHeight - dim);
      mouse.x = (event.clientX - offsetX) / (rect.right - offsetX) * 2 - 1;
      mouse.y = -((event.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1;
      raycaster.setFromCamera(mouse, orthoCamera);
      const intersects = raycaster.intersectObjects(interactiveObjects);
      if (intersects.length > 0) {
        const intersection = intersects[0];
        const { object } = intersection;
        prepareAnimationData(object, this.center, this.object);
        this.animating = true;
        return true;
      }
      return false;
    };
    this.update = function(delta) {
      const step = delta * turnRate;
      q1.rotateTowards(q2, step);
      this.object.position.set(0, 0, 1).applyQuaternion(q1).multiplyScalar(radius).add(this.center);
      this.object.quaternion.rotateTowards(targetQuaternion, step);
      if (q1.angleTo(q2) === 0) {
        this.animating = false;
      }
    };
    this.dispose = function() {
      geometry.dispose();
      xAxis.material.dispose();
      yAxis.material.dispose();
      zAxis.material.dispose();
      posXAxisHelper.material.map.dispose();
      posYAxisHelper.material.map.dispose();
      posZAxisHelper.material.map.dispose();
      negXAxisHelper.material.map.dispose();
      negYAxisHelper.material.map.dispose();
      negZAxisHelper.material.map.dispose();
      posXAxisHelper.material.dispose();
      posYAxisHelper.material.dispose();
      posZAxisHelper.material.dispose();
      negXAxisHelper.material.dispose();
      negYAxisHelper.material.dispose();
      negZAxisHelper.material.dispose();
    };
    function prepareAnimationData(object, focusPoint, camera2) {
      switch (object.userData.type) {
        case "posX":
          targetPosition.set(1, 0, 0);
          targetQuaternion.setFromEuler(new three.Euler(0, Math.PI * 0.5, 0));
          break;
        case "posY":
          targetPosition.set(0, 1, 0);
          targetQuaternion.setFromEuler(new three.Euler(-Math.PI * 0.5, 0, 0));
          break;
        case "posZ":
          targetPosition.set(0, 0, 1);
          targetQuaternion.setFromEuler(new three.Euler());
          break;
        case "negX":
          targetPosition.set(-1, 0, 0);
          targetQuaternion.setFromEuler(new three.Euler(0, -Math.PI * 0.5, 0));
          break;
        case "negY":
          targetPosition.set(0, -1, 0);
          targetQuaternion.setFromEuler(new three.Euler(Math.PI * 0.5, 0, 0));
          break;
        case "negZ":
          targetPosition.set(0, 0, -1);
          targetQuaternion.setFromEuler(new three.Euler(0, Math.PI, 0));
          break;
        default:
          console.error("ViewHelper: Invalid axis.");
      }
      radius = camera2.position.distanceTo(focusPoint);
      targetPosition.multiplyScalar(radius).add(focusPoint);
      dummy.position.copy(focusPoint);
      dummy.lookAt(camera2.position);
      q1.copy(dummy.quaternion);
      dummy.lookAt(targetPosition);
      q2.copy(dummy.quaternion);
    }
    function getAxisMaterial(color) {
      return new three.MeshBasicMaterial({ color, toneMapped: false });
    }
    function getSpriteMaterial(color, text = null) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext("2d");
      context.beginPath();
      context.arc(32, 32, 16, 0, 2 * Math.PI);
      context.closePath();
      context.fillStyle = color.getStyle();
      context.fill();
      if (text !== null) {
        context.font = "24px Arial";
        context.textAlign = "center";
        context.fillStyle = "#000000";
        context.fillText(text, 32, 41);
      }
      const texture = new three.CanvasTexture(canvas);
      return new three.SpriteMaterial({ map: texture, toneMapped: false });
    }
  }
};
function createElement(type) {
  return document.createElement(type);
}
class UIElement {
  constructor(dom) {
    this.domElement = dom;
  }
  add(...element) {
    for (let i = 0; i < element.length; i++) {
      const uiElement = element[i];
      if (uiElement instanceof UIElement) {
        this.domElement.append(uiElement.domElement);
      } else {
        console.warn("UIElement : ", uiElement, " is not an instance of UIElement");
      }
    }
  }
  remove(...element) {
    for (let i = 0; i < element.length; i++) {
      const uiElement = element[i];
      if (uiElement instanceof UIElement) {
        this.domElement.removeChild(uiElement.domElement);
      } else {
        console.warn(
          "UIElement : ",
          uiElement,
          " is not an instance of UIElement"
        );
      }
    }
  }
  setStyle(style) {
    Object.assign(this.domElement.style, style);
  }
  setTextContent(text) {
    this.domElement.textContent = text;
  }
  getTextContent() {
    return this.domElement.textContent;
  }
  setId(id) {
    this.domElement.id = id;
  }
  show() {
    this.domElement.style.display = "block";
  }
  hide() {
    this.domElement.style.display = "none";
  }
}
class UIDiv extends UIElement {
  constructor() {
    super(createElement("div"));
  }
}
class ViewHelper2 extends ViewHelper$1 {
  constructor(editorCamera, container) {
    super(editorCamera, container);
    const dom = new UIDiv();
    dom.setId("viewHelper");
    dom.setStyle({
      position: "absolute",
      right: "0px",
      bottom: "0px",
      height: "128px",
      width: "128px"
    });
    container.append(dom.domElement);
    dom.domElement.addEventListener("pointerup", (event) => {
      event.stopPropagation();
      this.handleClick(event);
    });
    dom.domElement.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
  }
}
exports.Editor = Editor;
exports.ViewHelper = ViewHelper2;
