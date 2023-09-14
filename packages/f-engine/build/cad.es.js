import { Scene, Color, OrthographicCamera, BufferGeometry, Float32BufferAttribute, Mesh, ShaderMaterial, UniformsUtils, Vector2, WebGLRenderTarget, HalfFloatType, NoBlending, Clock, Ray, Plane, MathUtils, EventDispatcher as EventDispatcher$1, Vector3, MOUSE, TOUCH, Quaternion, Spherical, WebGLRenderer, Raycaster, Object3D, Euler, Matrix4, MeshBasicMaterial, LineBasicMaterial, CylinderGeometry, BoxGeometry, OctahedronGeometry, Line, SphereGeometry, TorusGeometry, PlaneGeometry, DoubleSide, Sprite, Vector4, CanvasTexture, SpriteMaterial, MeshDepthMaterial, RGBADepthPacking, AdditiveBlending } from "three";
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
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var signals = { exports: {} };
(function(module) {
  /** @license
   * JS Signals <http://millermedeiros.github.com/js-signals/>
   * Released under the MIT license
   * Author: Miller Medeiros
   * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
   */
  (function(global2) {
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
      var self2 = this;
      this.dispatch = function() {
        Signal.prototype.dispatch.apply(self2, arguments);
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
    var signals2 = Signal;
    signals2.Signal = Signal;
    if (module.exports) {
      module.exports = signals2;
    } else {
      global2["signals"] = signals2;
    }
  })(commonjsGlobal);
})(signals);
var signalsExports = signals.exports;
function isSameSet(set1, set2) {
  if (set1.size !== set2.size) {
    return false;
  }
  for (let element of set1) {
    if (!set2.has(element)) {
      return false;
    }
  }
  return true;
}
const selectSet = /* @__PURE__ */ new Set();
class Selector {
  constructor(editor) {
    this.editor = editor;
    this.editor.signals.intersectionsDetected.add((selectIds) => {
      if (selectIds.length > 0) {
        this.select(selectIds);
      } else {
        this.detach();
      }
    });
  }
  select(selectIds) {
    selectSet.clear();
    selectIds.forEach((id) => selectSet.add(id));
    const editorSelectionSet = this.editor.getState("selections");
    if (isSameSet(editorSelectionSet, selectSet))
      return;
    editorSelectionSet.clear();
    editorSelectionSet.add(...selectSet);
    this.editor.signals.objectsSelected.dispatch(selectIds);
    this.editor.dispatchEvent("selectionChange", selectIds);
  }
  detach() {
    this.editor.setState("selection", []);
    this.editor.signals.objectsSelected.dispatch([]);
    this.editor.dispatchEvent("selectionChange", []);
  }
}
class Editor extends EventDispatcher {
  constructor() {
    super();
    this.state = {
      selections: /* @__PURE__ */ new Set()
    };
    this.signals = {
      objectsSelected: new signalsExports.Signal(),
      intersectionsDetected: new signalsExports.Signal(),
      objectsAdded: new signalsExports.Signal(),
      sceneGraphChanged: new signalsExports.Signal(),
      sceneRendered: new signalsExports.Signal(),
      transformModeChange: new signalsExports.Signal(),
      objectsRemoved: new signalsExports.Signal()
    };
    this.scene = new Scene();
    this.scene.name = "main-scene";
    this.sceneHelper = new Scene();
    this.sceneHelper.name = "scene-helper";
    this.sceneBackground = new Scene();
    this.sceneBackground.name = "scene-background";
    this.sceneBackground.background = new Color(0);
    this.selector = new Selector(this);
    this._needsUpdate = false;
  }
  get needsUpdate() {
    return this._needsUpdate;
  }
  set needsUpdate(value) {
    this._needsUpdate = value;
    if (!!value) {
      this.signals.sceneGraphChanged.dispatch();
    }
  }
  addObject(object, parent = null, index = null) {
    if (parent === null) {
      this.scene.add(object);
    } else {
      if (index === null) {
        parent.add(object);
      } else {
        parent.children.splice(index, 0, object);
      }
      object.parent = parent;
    }
    this.signals.objectsAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
    this.dispatchEvent("objectAdded", object);
  }
  removeObject(object) {
    if (object.parent === null)
      return;
    object.parent.remove(object);
    this.signals.objectsRemoved.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
  }
  removeObjectByUuid(uuid) {
    const object = this.getObjectByUuid(uuid);
    object && this.removeObject(object);
  }
  getObjectByUuid(uuid) {
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
  addHelper(helper) {
    this.sceneHelper.add(helper);
  }
  setState(key, value) {
    this.state[key] = value;
  }
  getState(key) {
    return this.state[key];
  }
  select(object) {
    if (object.length) {
      this.selector.select(object.map((obj) => obj.uuid));
    } else {
      this.selector.detach();
    }
  }
  selectByIds(uuids) {
    if (uuids !== void 0) {
      this.selector.select(uuids);
    } else {
      this.selector.detach();
    }
  }
  setSceneBackground(background) {
    this.sceneBackground.background = background;
    this.signals.sceneGraphChanged.dispatch();
  }
}
const _lut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
function generateUUID() {
  const d0 = Math.random() * 4294967295 | 0;
  const d1 = Math.random() * 4294967295 | 0;
  const d2 = Math.random() * 4294967295 | 0;
  const d3 = Math.random() * 4294967295 | 0;
  const uuid = _lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255];
  return uuid.toLowerCase();
}
const CopyShader = {
  name: "CopyShader",
  uniforms: {
    "tDiffuse": { value: null },
    "opacity": { value: 1 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`
  )
};
class Pass {
  constructor() {
    this.isPass = true;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.renderToScreen = false;
  }
  setSize() {
  }
  render() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
  dispose() {
  }
}
const _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const _geometry = new BufferGeometry();
_geometry.setAttribute("position", new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
_geometry.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
class FullScreenQuad {
  constructor(material) {
    this._mesh = new Mesh(_geometry, material);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(renderer) {
    renderer.render(this._mesh, _camera);
  }
  get material() {
    return this._mesh.material;
  }
  set material(value) {
    this._mesh.material = value;
  }
}
class ShaderPass extends Pass {
  constructor(shader, textureID) {
    super();
    this.textureID = textureID !== void 0 ? textureID : "tDiffuse";
    if (shader instanceof ShaderMaterial) {
      this.uniforms = shader.uniforms;
      this.material = shader;
    } else if (shader) {
      this.uniforms = UniformsUtils.clone(shader.uniforms);
      this.material = new ShaderMaterial({
        name: shader.name !== void 0 ? shader.name : "unspecified",
        defines: Object.assign({}, shader.defines),
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      });
    }
    this.fsQuad = new FullScreenQuad(this.material);
  }
  render(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }
    this.fsQuad.material = this.material;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear)
        renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      this.fsQuad.render(renderer);
    }
  }
  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}
class MaskPass extends Pass {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false;
  }
  render(renderer, writeBuffer, readBuffer) {
    const context = renderer.getContext();
    const state = renderer.state;
    state.buffers.color.setMask(false);
    state.buffers.depth.setMask(false);
    state.buffers.color.setLocked(true);
    state.buffers.depth.setLocked(true);
    let writeValue, clearValue;
    if (this.inverse) {
      writeValue = 0;
      clearValue = 1;
    } else {
      writeValue = 1;
      clearValue = 0;
    }
    state.buffers.stencil.setTest(true);
    state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
    state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 4294967295);
    state.buffers.stencil.setClear(clearValue);
    state.buffers.stencil.setLocked(true);
    renderer.setRenderTarget(readBuffer);
    if (this.clear)
      renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(writeBuffer);
    if (this.clear)
      renderer.clear();
    renderer.render(this.scene, this.camera);
    state.buffers.color.setLocked(false);
    state.buffers.depth.setLocked(false);
    state.buffers.color.setMask(true);
    state.buffers.depth.setMask(true);
    state.buffers.stencil.setLocked(false);
    state.buffers.stencil.setFunc(context.EQUAL, 1, 4294967295);
    state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    state.buffers.stencil.setLocked(true);
  }
}
class ClearMaskPass extends Pass {
  constructor() {
    super();
    this.needsSwap = false;
  }
  render(renderer) {
    renderer.state.buffers.stencil.setLocked(false);
    renderer.state.buffers.stencil.setTest(false);
  }
}
class EffectComposer {
  constructor(renderer, renderTarget) {
    this.renderer = renderer;
    this._pixelRatio = renderer.getPixelRatio();
    if (renderTarget === void 0) {
      const size = renderer.getSize(new Vector2());
      this._width = size.width;
      this._height = size.height;
      renderTarget = new WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType });
      renderTarget.texture.name = "EffectComposer.rt1";
    } else {
      this._width = renderTarget.width;
      this._height = renderTarget.height;
    }
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = "EffectComposer.rt2";
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
    this.renderToScreen = true;
    this.passes = [];
    this.copyPass = new ShaderPass(CopyShader);
    this.copyPass.material.blending = NoBlending;
    this.clock = new Clock();
  }
  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }
  addPass(pass) {
    this.passes.push(pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  insertPass(pass, index) {
    this.passes.splice(index, 0, pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  removePass(pass) {
    const index = this.passes.indexOf(pass);
    if (index !== -1) {
      this.passes.splice(index, 1);
    }
  }
  isLastEnabledPass(passIndex) {
    for (let i = passIndex + 1; i < this.passes.length; i++) {
      if (this.passes[i].enabled) {
        return false;
      }
    }
    return true;
  }
  render(deltaTime) {
    if (deltaTime === void 0) {
      deltaTime = this.clock.getDelta();
    }
    const currentRenderTarget = this.renderer.getRenderTarget();
    let maskActive = false;
    for (let i = 0, il = this.passes.length; i < il; i++) {
      const pass = this.passes[i];
      if (pass.enabled === false)
        continue;
      pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);
      if (pass.needsSwap) {
        if (maskActive) {
          const context = this.renderer.getContext();
          const stencil = this.renderer.state.buffers.stencil;
          stencil.setFunc(context.NOTEQUAL, 1, 4294967295);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
          stencil.setFunc(context.EQUAL, 1, 4294967295);
        }
        this.swapBuffers();
      }
      if (MaskPass !== void 0) {
        if (pass instanceof MaskPass) {
          maskActive = true;
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false;
        }
      }
    }
    this.renderer.setRenderTarget(currentRenderTarget);
  }
  reset(renderTarget) {
    if (renderTarget === void 0) {
      const size = this.renderer.getSize(new Vector2());
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }
  setSize(width, height) {
    this._width = width;
    this._height = height;
    const effectiveWidth = this._width * this._pixelRatio;
    const effectiveHeight = this._height * this._pixelRatio;
    this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight);
    for (let i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(effectiveWidth, effectiveHeight);
    }
  }
  setPixelRatio(pixelRatio) {
    this._pixelRatio = pixelRatio;
    this.setSize(this._width, this._height);
  }
  dispose() {
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.copyPass.dispose();
  }
}
const _changeEvent$1 = { type: "change" };
const _startEvent = { type: "start" };
const _endEvent = { type: "end" };
const _ray = new Ray();
const _plane = new Plane();
const TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);
class OrbitControls extends EventDispatcher$1 {
  constructor(object, domElement) {
    super();
    this.object = object;
    this.domElement = domElement;
    this.domElement.style.touchAction = "none";
    this.enabled = true;
    this.target = new Vector3();
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.minZoom = 0;
    this.maxZoom = Infinity;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.zoomSpeed = 1;
    this.enableRotate = true;
    this.rotateSpeed = 1;
    this.enablePan = true;
    this.panSpeed = 1;
    this.screenSpacePanning = true;
    this.keyPanSpeed = 7;
    this.zoomToCursor = false;
    this.autoRotate = false;
    this.autoRotateSpeed = 2;
    this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" };
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    this._domElementKeyEvents = null;
    this.getPolarAngle = function() {
      return spherical.phi;
    };
    this.getAzimuthalAngle = function() {
      return spherical.theta;
    };
    this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    };
    this.listenToKeyEvents = function(domElement2) {
      domElement2.addEventListener("keydown", onKeyDown);
      this._domElementKeyEvents = domElement2;
    };
    this.stopListenToKeyEvents = function() {
      this._domElementKeyEvents.removeEventListener("keydown", onKeyDown);
      this._domElementKeyEvents = null;
    };
    this.saveState = function() {
      scope.target0.copy(scope.target);
      scope.position0.copy(scope.object.position);
      scope.zoom0 = scope.object.zoom;
    };
    this.reset = function() {
      scope.target.copy(scope.target0);
      scope.object.position.copy(scope.position0);
      scope.object.zoom = scope.zoom0;
      scope.object.updateProjectionMatrix();
      scope.dispatchEvent(_changeEvent$1);
      scope.update();
      state = STATE.NONE;
    };
    this.update = function() {
      const offset = new Vector3();
      const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();
      const lastPosition = new Vector3();
      const lastQuaternion = new Quaternion();
      const lastTargetPosition = new Vector3();
      const twoPI = 2 * Math.PI;
      return function update(deltaTime = null) {
        const position = scope.object.position;
        offset.copy(position).sub(scope.target);
        offset.applyQuaternion(quat);
        spherical.setFromVector3(offset);
        if (scope.autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle(deltaTime));
        }
        if (scope.enableDamping) {
          spherical.theta += sphericalDelta.theta * scope.dampingFactor;
          spherical.phi += sphericalDelta.phi * scope.dampingFactor;
        } else {
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
        }
        let min = scope.minAzimuthAngle;
        let max = scope.maxAzimuthAngle;
        if (isFinite(min) && isFinite(max)) {
          if (min < -Math.PI)
            min += twoPI;
          else if (min > Math.PI)
            min -= twoPI;
          if (max < -Math.PI)
            max += twoPI;
          else if (max > Math.PI)
            max -= twoPI;
          if (min <= max) {
            spherical.theta = Math.max(min, Math.min(max, spherical.theta));
          } else {
            spherical.theta = spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta);
          }
        }
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
        spherical.makeSafe();
        if (scope.enableDamping === true) {
          scope.target.addScaledVector(panOffset, scope.dampingFactor);
        } else {
          scope.target.add(panOffset);
        }
        if (scope.zoomToCursor && performCursorZoom || scope.object.isOrthographicCamera) {
          spherical.radius = clampDistance(spherical.radius);
        } else {
          spherical.radius = clampDistance(spherical.radius * scale);
        }
        offset.setFromSpherical(spherical);
        offset.applyQuaternion(quatInverse);
        position.copy(scope.target).add(offset);
        scope.object.lookAt(scope.target);
        if (scope.enableDamping === true) {
          sphericalDelta.theta *= 1 - scope.dampingFactor;
          sphericalDelta.phi *= 1 - scope.dampingFactor;
          panOffset.multiplyScalar(1 - scope.dampingFactor);
        } else {
          sphericalDelta.set(0, 0, 0);
          panOffset.set(0, 0, 0);
        }
        let zoomChanged = false;
        if (scope.zoomToCursor && performCursorZoom) {
          let newRadius = null;
          if (scope.object.isPerspectiveCamera) {
            const prevRadius = offset.length();
            newRadius = clampDistance(prevRadius * scale);
            const radiusDelta = prevRadius - newRadius;
            scope.object.position.addScaledVector(dollyDirection, radiusDelta);
            scope.object.updateMatrixWorld();
          } else if (scope.object.isOrthographicCamera) {
            const mouseBefore = new Vector3(mouse.x, mouse.y, 0);
            mouseBefore.unproject(scope.object);
            scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / scale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
            const mouseAfter = new Vector3(mouse.x, mouse.y, 0);
            mouseAfter.unproject(scope.object);
            scope.object.position.sub(mouseAfter).add(mouseBefore);
            scope.object.updateMatrixWorld();
            newRadius = offset.length();
          } else {
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.");
            scope.zoomToCursor = false;
          }
          if (newRadius !== null) {
            if (this.screenSpacePanning) {
              scope.target.set(0, 0, -1).transformDirection(scope.object.matrix).multiplyScalar(newRadius).add(scope.object.position);
            } else {
              _ray.origin.copy(scope.object.position);
              _ray.direction.set(0, 0, -1).transformDirection(scope.object.matrix);
              if (Math.abs(scope.object.up.dot(_ray.direction)) < TILT_LIMIT) {
                object.lookAt(scope.target);
              } else {
                _plane.setFromNormalAndCoplanarPoint(scope.object.up, scope.target);
                _ray.intersectPlane(_plane, scope.target);
              }
            }
          }
        } else if (scope.object.isOrthographicCamera) {
          scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / scale));
          scope.object.updateProjectionMatrix();
          zoomChanged = true;
        }
        scale = 1;
        performCursorZoom = false;
        if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS || lastTargetPosition.distanceToSquared(scope.target) > 0) {
          scope.dispatchEvent(_changeEvent$1);
          lastPosition.copy(scope.object.position);
          lastQuaternion.copy(scope.object.quaternion);
          lastTargetPosition.copy(scope.target);
          zoomChanged = false;
          return true;
        }
        return false;
      };
    }();
    this.dispose = function() {
      scope.domElement.removeEventListener("contextmenu", onContextMenu);
      scope.domElement.removeEventListener("pointerdown", onPointerDown2);
      scope.domElement.removeEventListener("pointercancel", onPointerUp2);
      scope.domElement.removeEventListener("wheel", onMouseWheel);
      scope.domElement.removeEventListener("pointermove", onPointerMove2);
      scope.domElement.removeEventListener("pointerup", onPointerUp2);
      if (scope._domElementKeyEvents !== null) {
        scope._domElementKeyEvents.removeEventListener("keydown", onKeyDown);
        scope._domElementKeyEvents = null;
      }
    };
    const scope = this;
    const STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };
    let state = STATE.NONE;
    const EPS = 1e-6;
    const spherical = new Spherical();
    const sphericalDelta = new Spherical();
    let scale = 1;
    const panOffset = new Vector3();
    const rotateStart = new Vector2();
    const rotateEnd = new Vector2();
    const rotateDelta = new Vector2();
    const panStart = new Vector2();
    const panEnd = new Vector2();
    const panDelta = new Vector2();
    const dollyStart = new Vector2();
    const dollyEnd = new Vector2();
    const dollyDelta = new Vector2();
    const dollyDirection = new Vector3();
    const mouse = new Vector2();
    let performCursorZoom = false;
    const pointers = [];
    const pointerPositions = {};
    function getAutoRotationAngle(deltaTime) {
      if (deltaTime !== null) {
        return 2 * Math.PI / 60 * scope.autoRotateSpeed * deltaTime;
      } else {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
      }
    }
    function getZoomScale() {
      return Math.pow(0.95, scope.zoomSpeed);
    }
    function rotateLeft(angle) {
      sphericalDelta.theta -= angle;
    }
    function rotateUp(angle) {
      sphericalDelta.phi -= angle;
    }
    const panLeft = function() {
      const v = new Vector3();
      return function panLeft2(distance, objectMatrix) {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(-distance);
        panOffset.add(v);
      };
    }();
    const panUp = function() {
      const v = new Vector3();
      return function panUp2(distance, objectMatrix) {
        if (scope.screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1);
        } else {
          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(scope.object.up, v);
        }
        v.multiplyScalar(distance);
        panOffset.add(v);
      };
    }();
    const pan = function() {
      const offset = new Vector3();
      return function pan2(deltaX, deltaY) {
        const element = scope.domElement;
        if (scope.object.isPerspectiveCamera) {
          const position = scope.object.position;
          offset.copy(position).sub(scope.target);
          let targetDistance = offset.length();
          targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);
          panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
          panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
        } else if (scope.object.isOrthographicCamera) {
          panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
          panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
        } else {
          console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
          scope.enablePan = false;
        }
      };
    }();
    function dollyOut(dollyScale) {
      if (scope.object.isPerspectiveCamera || scope.object.isOrthographicCamera) {
        scale /= dollyScale;
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
        scope.enableZoom = false;
      }
    }
    function dollyIn(dollyScale) {
      if (scope.object.isPerspectiveCamera || scope.object.isOrthographicCamera) {
        scale *= dollyScale;
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
        scope.enableZoom = false;
      }
    }
    function updateMouseParameters(event) {
      if (!scope.zoomToCursor) {
        return;
      }
      performCursorZoom = true;
      const rect = scope.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      mouse.x = x / w * 2 - 1;
      mouse.y = -(y / h) * 2 + 1;
      dollyDirection.set(mouse.x, mouse.y, 1).unproject(scope.object).sub(scope.object.position).normalize();
    }
    function clampDistance(dist) {
      return Math.max(scope.minDistance, Math.min(scope.maxDistance, dist));
    }
    function handleMouseDownRotate(event) {
      rotateStart.set(event.clientX, event.clientY);
    }
    function handleMouseDownDolly(event) {
      updateMouseParameters(event);
      dollyStart.set(event.clientX, event.clientY);
    }
    function handleMouseDownPan(event) {
      panStart.set(event.clientX, event.clientY);
    }
    function handleMouseMoveRotate(event) {
      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
      const element = scope.domElement;
      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
      rotateStart.copy(rotateEnd);
      scope.update();
    }
    function handleMouseMoveDolly(event) {
      dollyEnd.set(event.clientX, event.clientY);
      dollyDelta.subVectors(dollyEnd, dollyStart);
      if (dollyDelta.y > 0) {
        dollyOut(getZoomScale());
      } else if (dollyDelta.y < 0) {
        dollyIn(getZoomScale());
      }
      dollyStart.copy(dollyEnd);
      scope.update();
    }
    function handleMouseMovePan(event) {
      panEnd.set(event.clientX, event.clientY);
      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
      pan(panDelta.x, panDelta.y);
      panStart.copy(panEnd);
      scope.update();
    }
    function handleMouseWheel(event) {
      updateMouseParameters(event);
      if (event.deltaY < 0) {
        dollyIn(getZoomScale());
      } else if (event.deltaY > 0) {
        dollyOut(getZoomScale());
      }
      scope.update();
    }
    function handleKeyDown(event) {
      let needsUpdate = false;
      switch (event.code) {
        case scope.keys.UP:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            rotateUp(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);
          } else {
            pan(0, scope.keyPanSpeed);
          }
          needsUpdate = true;
          break;
        case scope.keys.BOTTOM:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            rotateUp(-2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);
          } else {
            pan(0, -scope.keyPanSpeed);
          }
          needsUpdate = true;
          break;
        case scope.keys.LEFT:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            rotateLeft(2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);
          } else {
            pan(scope.keyPanSpeed, 0);
          }
          needsUpdate = true;
          break;
        case scope.keys.RIGHT:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            rotateLeft(-2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight);
          } else {
            pan(-scope.keyPanSpeed, 0);
          }
          needsUpdate = true;
          break;
      }
      if (needsUpdate) {
        event.preventDefault();
        scope.update();
      }
    }
    function handleTouchStartRotate() {
      if (pointers.length === 1) {
        rotateStart.set(pointers[0].pageX, pointers[0].pageY);
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);
        rotateStart.set(x, y);
      }
    }
    function handleTouchStartPan() {
      if (pointers.length === 1) {
        panStart.set(pointers[0].pageX, pointers[0].pageY);
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);
        panStart.set(x, y);
      }
    }
    function handleTouchStartDolly() {
      const dx = pointers[0].pageX - pointers[1].pageX;
      const dy = pointers[0].pageY - pointers[1].pageY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      dollyStart.set(0, distance);
    }
    function handleTouchStartDollyPan() {
      if (scope.enableZoom)
        handleTouchStartDolly();
      if (scope.enablePan)
        handleTouchStartPan();
    }
    function handleTouchStartDollyRotate() {
      if (scope.enableZoom)
        handleTouchStartDolly();
      if (scope.enableRotate)
        handleTouchStartRotate();
    }
    function handleTouchMoveRotate(event) {
      if (pointers.length == 1) {
        rotateEnd.set(event.pageX, event.pageY);
      } else {
        const position = getSecondPointerPosition(event);
        const x = 0.5 * (event.pageX + position.x);
        const y = 0.5 * (event.pageY + position.y);
        rotateEnd.set(x, y);
      }
      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
      const element = scope.domElement;
      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
      rotateStart.copy(rotateEnd);
    }
    function handleTouchMovePan(event) {
      if (pointers.length === 1) {
        panEnd.set(event.pageX, event.pageY);
      } else {
        const position = getSecondPointerPosition(event);
        const x = 0.5 * (event.pageX + position.x);
        const y = 0.5 * (event.pageY + position.y);
        panEnd.set(x, y);
      }
      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
      pan(panDelta.x, panDelta.y);
      panStart.copy(panEnd);
    }
    function handleTouchMoveDolly(event) {
      const position = getSecondPointerPosition(event);
      const dx = event.pageX - position.x;
      const dy = event.pageY - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      dollyEnd.set(0, distance);
      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
      dollyOut(dollyDelta.y);
      dollyStart.copy(dollyEnd);
    }
    function handleTouchMoveDollyPan(event) {
      if (scope.enableZoom)
        handleTouchMoveDolly(event);
      if (scope.enablePan)
        handleTouchMovePan(event);
    }
    function handleTouchMoveDollyRotate(event) {
      if (scope.enableZoom)
        handleTouchMoveDolly(event);
      if (scope.enableRotate)
        handleTouchMoveRotate(event);
    }
    function onPointerDown2(event) {
      if (scope.enabled === false)
        return;
      if (pointers.length === 0) {
        scope.domElement.setPointerCapture(event.pointerId);
        scope.domElement.addEventListener("pointermove", onPointerMove2);
        scope.domElement.addEventListener("pointerup", onPointerUp2);
      }
      addPointer(event);
      if (event.pointerType === "touch") {
        onTouchStart(event);
      } else {
        onMouseDown(event);
      }
    }
    function onPointerMove2(event) {
      if (scope.enabled === false)
        return;
      if (event.pointerType === "touch") {
        onTouchMove(event);
      } else {
        onMouseMove(event);
      }
    }
    function onPointerUp2(event) {
      removePointer(event);
      if (pointers.length === 0) {
        scope.domElement.releasePointerCapture(event.pointerId);
        scope.domElement.removeEventListener("pointermove", onPointerMove2);
        scope.domElement.removeEventListener("pointerup", onPointerUp2);
      }
      scope.dispatchEvent(_endEvent);
      state = STATE.NONE;
    }
    function onMouseDown(event) {
      let mouseAction;
      switch (event.button) {
        case 0:
          mouseAction = scope.mouseButtons.LEFT;
          break;
        case 1:
          mouseAction = scope.mouseButtons.MIDDLE;
          break;
        case 2:
          mouseAction = scope.mouseButtons.RIGHT;
          break;
        default:
          mouseAction = -1;
      }
      switch (mouseAction) {
        case MOUSE.DOLLY:
          if (scope.enableZoom === false)
            return;
          handleMouseDownDolly(event);
          state = STATE.DOLLY;
          break;
        case MOUSE.ROTATE:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enablePan === false)
              return;
            handleMouseDownPan(event);
            state = STATE.PAN;
          } else {
            if (scope.enableRotate === false)
              return;
            handleMouseDownRotate(event);
            state = STATE.ROTATE;
          }
          break;
        case MOUSE.PAN:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enableRotate === false)
              return;
            handleMouseDownRotate(event);
            state = STATE.ROTATE;
          } else {
            if (scope.enablePan === false)
              return;
            handleMouseDownPan(event);
            state = STATE.PAN;
          }
          break;
        default:
          state = STATE.NONE;
      }
      if (state !== STATE.NONE) {
        scope.dispatchEvent(_startEvent);
      }
    }
    function onMouseMove(event) {
      switch (state) {
        case STATE.ROTATE:
          if (scope.enableRotate === false)
            return;
          handleMouseMoveRotate(event);
          break;
        case STATE.DOLLY:
          if (scope.enableZoom === false)
            return;
          handleMouseMoveDolly(event);
          break;
        case STATE.PAN:
          if (scope.enablePan === false)
            return;
          handleMouseMovePan(event);
          break;
      }
    }
    function onMouseWheel(event) {
      if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE)
        return;
      event.preventDefault();
      scope.dispatchEvent(_startEvent);
      handleMouseWheel(event);
      scope.dispatchEvent(_endEvent);
    }
    function onKeyDown(event) {
      if (scope.enabled === false || scope.enablePan === false)
        return;
      handleKeyDown(event);
    }
    function onTouchStart(event) {
      trackPointer(event);
      switch (pointers.length) {
        case 1:
          switch (scope.touches.ONE) {
            case TOUCH.ROTATE:
              if (scope.enableRotate === false)
                return;
              handleTouchStartRotate();
              state = STATE.TOUCH_ROTATE;
              break;
            case TOUCH.PAN:
              if (scope.enablePan === false)
                return;
              handleTouchStartPan();
              state = STATE.TOUCH_PAN;
              break;
            default:
              state = STATE.NONE;
          }
          break;
        case 2:
          switch (scope.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (scope.enableZoom === false && scope.enablePan === false)
                return;
              handleTouchStartDollyPan();
              state = STATE.TOUCH_DOLLY_PAN;
              break;
            case TOUCH.DOLLY_ROTATE:
              if (scope.enableZoom === false && scope.enableRotate === false)
                return;
              handleTouchStartDollyRotate();
              state = STATE.TOUCH_DOLLY_ROTATE;
              break;
            default:
              state = STATE.NONE;
          }
          break;
        default:
          state = STATE.NONE;
      }
      if (state !== STATE.NONE) {
        scope.dispatchEvent(_startEvent);
      }
    }
    function onTouchMove(event) {
      trackPointer(event);
      switch (state) {
        case STATE.TOUCH_ROTATE:
          if (scope.enableRotate === false)
            return;
          handleTouchMoveRotate(event);
          scope.update();
          break;
        case STATE.TOUCH_PAN:
          if (scope.enablePan === false)
            return;
          handleTouchMovePan(event);
          scope.update();
          break;
        case STATE.TOUCH_DOLLY_PAN:
          if (scope.enableZoom === false && scope.enablePan === false)
            return;
          handleTouchMoveDollyPan(event);
          scope.update();
          break;
        case STATE.TOUCH_DOLLY_ROTATE:
          if (scope.enableZoom === false && scope.enableRotate === false)
            return;
          handleTouchMoveDollyRotate(event);
          scope.update();
          break;
        default:
          state = STATE.NONE;
      }
    }
    function onContextMenu(event) {
      if (scope.enabled === false)
        return;
      event.preventDefault();
    }
    function addPointer(event) {
      pointers.push(event);
    }
    function removePointer(event) {
      delete pointerPositions[event.pointerId];
      for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId == event.pointerId) {
          pointers.splice(i, 1);
          return;
        }
      }
    }
    function trackPointer(event) {
      let position = pointerPositions[event.pointerId];
      if (position === void 0) {
        position = new Vector2();
        pointerPositions[event.pointerId] = position;
      }
      position.set(event.pageX, event.pageY);
    }
    function getSecondPointerPosition(event) {
      const pointer = event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0];
      return pointerPositions[pointer.pointerId];
    }
    scope.domElement.addEventListener("contextmenu", onContextMenu);
    scope.domElement.addEventListener("pointerdown", onPointerDown2);
    scope.domElement.addEventListener("pointercancel", onPointerUp2);
    scope.domElement.addEventListener("wheel", onMouseWheel, { passive: false });
    this.update();
  }
}
class RenderPass extends Pass {
  constructor(scene, camera, overrideMaterial = null, clearColor = null, clearAlpha = null) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha;
    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
    this._oldClearColor = new Color();
  }
  render(renderer, writeBuffer, readBuffer) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    let oldClearAlpha, oldOverrideMaterial;
    if (this.overrideMaterial !== null) {
      oldOverrideMaterial = this.scene.overrideMaterial;
      this.scene.overrideMaterial = this.overrideMaterial;
    }
    if (this.clearColor !== null) {
      renderer.getClearColor(this._oldClearColor);
      renderer.setClearColor(this.clearColor);
    }
    if (this.clearAlpha !== null) {
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearAlpha(this.clearAlpha);
    }
    if (this.clearDepth == true) {
      renderer.clearDepth();
    }
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear === true) {
      renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
    }
    renderer.render(this.scene, this.camera);
    if (this.clearColor !== null) {
      renderer.setClearColor(this._oldClearColor);
    }
    if (this.clearAlpha !== null) {
      renderer.setClearAlpha(oldClearAlpha);
    }
    if (this.overrideMaterial !== null) {
      this.scene.overrideMaterial = oldOverrideMaterial;
    }
    renderer.autoClear = oldAutoClear;
  }
}
const FXAAShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "resolution": { value: new Vector2(1 / 1024, 1 / 512) }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: `
	precision highp float;

	uniform sampler2D tDiffuse;

	uniform vec2 resolution;

	varying vec2 vUv;

	// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

	//----------------------------------------------------------------------------------
	// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag
	// SDK Version: v3.00
	// Email:       gameworks@nvidia.com
	// Site:        http://developer.nvidia.com/
	//
	// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
	//
	// Redistribution and use in source and binary forms, with or without
	// modification, are permitted provided that the following conditions
	// are met:
	//  * Redistributions of source code must retain the above copyright
	//    notice, this list of conditions and the following disclaimer.
	//  * Redistributions in binary form must reproduce the above copyright
	//    notice, this list of conditions and the following disclaimer in the
	//    documentation and/or other materials provided with the distribution.
	//  * Neither the name of NVIDIA CORPORATION nor the names of its
	//    contributors may be used to endorse or promote products derived
	//    from this software without specific prior written permission.
	//
	// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
	// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
	// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
	// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	//
	//----------------------------------------------------------------------------------

	#ifndef FXAA_DISCARD
			//
			// Only valid for PC OpenGL currently.
			// Probably will not work when FXAA_GREEN_AS_LUMA = 1.
			//
			// 1 = Use discard on pixels which don't need AA.
			//     For APIs which enable concurrent TEX+ROP from same surface.
			// 0 = Return unchanged color on pixels which don't need AA.
			//
			#define FXAA_DISCARD 0
	#endif

	/*--------------------------------------------------------------------------*/
	#define FxaaTexTop(t, p) texture2D(t, p, -100.0)
	#define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), -100.0)
	/*--------------------------------------------------------------------------*/

	#define NUM_SAMPLES 5

	// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha
	float contrast( vec4 a, vec4 b ) {
			vec4 diff = abs( a - b );
			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );
	}

	/*============================================================================

									FXAA3 QUALITY - PC

	============================================================================*/

	/*--------------------------------------------------------------------------*/
	vec4 FxaaPixelShader(
			vec2 posM,
			sampler2D tex,
			vec2 fxaaQualityRcpFrame,
			float fxaaQualityEdgeThreshold,
			float fxaaQualityinvEdgeThreshold
	) {
			vec4 rgbaM = FxaaTexTop(tex, posM);
			vec4 rgbaS = FxaaTexOff(tex, posM, vec2( 0.0, 1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaE = FxaaTexOff(tex, posM, vec2( 1.0, 0.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaN = FxaaTexOff(tex, posM, vec2( 0.0,-1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaW = FxaaTexOff(tex, posM, vec2(-1.0, 0.0), fxaaQualityRcpFrame.xy);
			// . S .
			// W M E
			// . N .

			bool earlyExit = max( max( max(
					contrast( rgbaM, rgbaN ),
					contrast( rgbaM, rgbaS ) ),
					contrast( rgbaM, rgbaE ) ),
					contrast( rgbaM, rgbaW ) )
					< fxaaQualityEdgeThreshold;
			// . 0 .
			// 0 0 0
			// . 0 .

			#if (FXAA_DISCARD == 1)
					if(earlyExit) FxaaDiscard;
			#else
					if(earlyExit) return rgbaM;
			#endif

			float contrastN = contrast( rgbaM, rgbaN );
			float contrastS = contrast( rgbaM, rgbaS );
			float contrastE = contrast( rgbaM, rgbaE );
			float contrastW = contrast( rgbaM, rgbaW );

			float relativeVContrast = ( contrastN + contrastS ) - ( contrastE + contrastW );
			relativeVContrast *= fxaaQualityinvEdgeThreshold;

			bool horzSpan = relativeVContrast > 0.;
			// . 1 .
			// 0 0 0
			// . 1 .

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar
			if( abs( relativeVContrast ) < .3 ) {
					// locate the edge
					vec2 dirToEdge;
					dirToEdge.x = contrastE > contrastW ? 1. : -1.;
					dirToEdge.y = contrastS > contrastN ? 1. : -1.;
					// . 2 .      . 1 .
					// 1 0 2  ~=  0 0 1
					// . 1 .      . 0 .

					// tap 2 pixels and see which ones are "outside" the edge, to
					// determine if the edge is vertical or horizontal

					vec4 rgbaAlongH = FxaaTexOff(tex, posM, vec2( dirToEdge.x, -dirToEdge.y ), fxaaQualityRcpFrame.xy);
					float matchAlongH = contrast( rgbaM, rgbaAlongH );
					// . 1 .
					// 0 0 1
					// . 0 H

					vec4 rgbaAlongV = FxaaTexOff(tex, posM, vec2( -dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy);
					float matchAlongV = contrast( rgbaM, rgbaAlongV );
					// V 1 .
					// 0 0 1
					// . 0 .

					relativeVContrast = matchAlongV - matchAlongH;
					relativeVContrast *= fxaaQualityinvEdgeThreshold;

					if( abs( relativeVContrast ) < .3 ) { // 45 deg edge
							// 1 1 .
							// 0 0 1
							// . 0 1

							// do a simple blur
							return mix(
									rgbaM,
									(rgbaN + rgbaS + rgbaE + rgbaW) * .25,
									.4
							);
					}

					horzSpan = relativeVContrast > 0.;
			}

			if(!horzSpan) rgbaN = rgbaW;
			if(!horzSpan) rgbaS = rgbaE;
			// . 0 .      1
			// 1 0 1  ->  0
			// . 0 .      1

			bool pairN = contrast( rgbaM, rgbaN ) > contrast( rgbaM, rgbaS );
			if(!pairN) rgbaN = rgbaS;

			vec2 offNP;
			offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;
			offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;

			bool doneN = false;
			bool doneP = false;

			float nDist = 0.;
			float pDist = 0.;

			vec2 posN = posM;
			vec2 posP = posM;

			int iterationsUsed = 0;
			int iterationsUsedN = 0;
			int iterationsUsedP = 0;
			for( int i = 0; i < NUM_SAMPLES; i++ ) {
					iterationsUsed = i;

					float increment = float(i + 1);

					if(!doneN) {
							nDist += increment;
							posN = posM + offNP * nDist;
							vec4 rgbaEndN = FxaaTexTop(tex, posN.xy);
							doneN = contrast( rgbaEndN, rgbaM ) > contrast( rgbaEndN, rgbaN );
							iterationsUsedN = i;
					}

					if(!doneP) {
							pDist += increment;
							posP = posM - offNP * pDist;
							vec4 rgbaEndP = FxaaTexTop(tex, posP.xy);
							doneP = contrast( rgbaEndP, rgbaM ) > contrast( rgbaEndP, rgbaN );
							iterationsUsedP = i;
					}

					if(doneN || doneP) break;
			}


			if ( !doneP && !doneN ) return rgbaM; // failed to find end of edge

			float dist = min(
					doneN ? float( iterationsUsedN ) / float( NUM_SAMPLES - 1 ) : 1.,
					doneP ? float( iterationsUsedP ) / float( NUM_SAMPLES - 1 ) : 1.
			);

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist = pow(dist, .5);

			dist = 1. - dist;

			return mix(
					rgbaM,
					rgbaN,
					dist * .5
			);
	}

	void main() {
			const float edgeDetectionQuality = .2;
			const float invEdgeDetectionQuality = 1. / edgeDetectionQuality;

			gl_FragColor = FxaaPixelShader(
					vUv,
					tDiffuse,
					resolution,
					edgeDetectionQuality, // [0,1] contrast needed, otherwise early discard
					invEdgeDetectionQuality
			);

	}
	`
};
class ViewPort extends EventDispatcher {
  constructor(editor, camera, domElement) {
    super();
    this.editor = editor;
    this.camera = camera;
    this.uuid = generateUUID();
    this.size = new Vector2();
    this.name = "";
    this.type = "ViewPort";
    this.onAfterRender = () => {
    };
    this.onBeforeRender = () => {
    };
    this.renderer = new WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    this.renderer.setClearColor(15724527);
    this.renderer.autoClear = false;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.setAttribute("id", "F-ViewPort");
    this.domElement.appendChild(this.renderer.domElement);
    domElement.append(this.domElement);
    const { sceneBackground, scene, sceneHelper } = this.editor;
    const bgRenderPass = new RenderPass(sceneBackground, this.camera);
    bgRenderPass.clear = false;
    const mainRenderPass = new RenderPass(scene, this.camera);
    mainRenderPass.clear = false;
    const helperRenderPass = new RenderPass(sceneHelper, this.camera);
    helperRenderPass.clear = false;
    const copyPass = new ShaderPass(CopyShader);
    const fxaaPass = new ShaderPass(FXAAShader);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(bgRenderPass);
    this.composer.addPass(mainRenderPass);
    this.composer.addPass(helperRenderPass);
    this.composer.addPass(fxaaPass);
    this.composer.addPass(copyPass);
    this.orbitControls = new OrbitControls(camera, this.renderer.domElement);
    this.orbitControls.addEventListener("change", () => this.render());
    this.domElement.append(this.renderer.domElement);
    this.editor.signals.sceneGraphChanged.add(() => this.render());
  }
  render() {
    this.renderer.clear();
    this.onBeforeRender(this.editor, this.camera);
    this.composer.render();
    this.onAfterRender(this.editor, this.camera);
  }
  setSize(width, height) {
    var _a, _b;
    this.size.set(width, height);
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.composer.passes.at(-2).uniforms["resolution"].value.set(1 / width, 1 / height);
    if ((_a = this.camera) == null ? void 0 : _a.isOrthographicCamera) {
      this.camera.top = 15 * (height / width);
      this.camera.bottom = -15 * (height / width);
    } else if ((_b = this.camera) == null ? void 0 : _b.isPerspectiveCamera) {
      this.camera.aspect = width / height;
    }
    this.camera.updateProjectionMatrix();
    this.render();
  }
}
const _raycaster$1 = new Raycaster();
const _tempVector = new Vector3();
const _tempVector2 = new Vector3();
const _tempQuaternion = new Quaternion();
const _unit = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1)
};
const _changeEvent = { type: "change" };
const _mouseDownEvent = { type: "mouseDown" };
const _mouseUpEvent = { type: "mouseUp", mode: null };
const _objectChangeEvent = { type: "objectChange" };
class TransformControls extends Object3D {
  constructor(camera, domElement) {
    super();
    if (domElement === void 0) {
      console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.');
      domElement = document;
    }
    this.isTransformControls = true;
    this.visible = false;
    this.domElement = domElement;
    this.domElement.style.touchAction = "none";
    const _gizmo = new TransformControlsGizmo();
    this._gizmo = _gizmo;
    this.add(_gizmo);
    const _plane2 = new TransformControlsPlane();
    this._plane = _plane2;
    this.add(_plane2);
    const scope = this;
    function defineProperty(propName, defaultValue) {
      let propValue = defaultValue;
      Object.defineProperty(scope, propName, {
        get: function() {
          return propValue !== void 0 ? propValue : defaultValue;
        },
        set: function(value) {
          if (propValue !== value) {
            propValue = value;
            _plane2[propName] = value;
            _gizmo[propName] = value;
            scope.dispatchEvent({ type: propName + "-changed", value });
            scope.dispatchEvent(_changeEvent);
          }
        }
      });
      scope[propName] = defaultValue;
      _plane2[propName] = defaultValue;
      _gizmo[propName] = defaultValue;
    }
    defineProperty("camera", camera);
    defineProperty("object", void 0);
    defineProperty("enabled", true);
    defineProperty("axis", null);
    defineProperty("mode", "translate");
    defineProperty("translationSnap", null);
    defineProperty("rotationSnap", null);
    defineProperty("scaleSnap", null);
    defineProperty("space", "world");
    defineProperty("size", 1);
    defineProperty("dragging", false);
    defineProperty("showX", true);
    defineProperty("showY", true);
    defineProperty("showZ", true);
    const worldPosition = new Vector3();
    const worldPositionStart = new Vector3();
    const worldQuaternion = new Quaternion();
    const worldQuaternionStart = new Quaternion();
    const cameraPosition = new Vector3();
    const cameraQuaternion = new Quaternion();
    const pointStart = new Vector3();
    const pointEnd = new Vector3();
    const rotationAxis = new Vector3();
    const rotationAngle = 0;
    const eye = new Vector3();
    defineProperty("worldPosition", worldPosition);
    defineProperty("worldPositionStart", worldPositionStart);
    defineProperty("worldQuaternion", worldQuaternion);
    defineProperty("worldQuaternionStart", worldQuaternionStart);
    defineProperty("cameraPosition", cameraPosition);
    defineProperty("cameraQuaternion", cameraQuaternion);
    defineProperty("pointStart", pointStart);
    defineProperty("pointEnd", pointEnd);
    defineProperty("rotationAxis", rotationAxis);
    defineProperty("rotationAngle", rotationAngle);
    defineProperty("eye", eye);
    this._offset = new Vector3();
    this._startNorm = new Vector3();
    this._endNorm = new Vector3();
    this._cameraScale = new Vector3();
    this._parentPosition = new Vector3();
    this._parentQuaternion = new Quaternion();
    this._parentQuaternionInv = new Quaternion();
    this._parentScale = new Vector3();
    this._worldScaleStart = new Vector3();
    this._worldQuaternionInv = new Quaternion();
    this._worldScale = new Vector3();
    this._positionStart = new Vector3();
    this._quaternionStart = new Quaternion();
    this._scaleStart = new Vector3();
    this._getPointer = getPointer.bind(this);
    this._onPointerDown = onPointerDown.bind(this);
    this._onPointerHover = onPointerHover.bind(this);
    this._onPointerMove = onPointerMove.bind(this);
    this._onPointerUp = onPointerUp.bind(this);
    this.domElement.addEventListener("pointerdown", this._onPointerDown);
    this.domElement.addEventListener("pointermove", this._onPointerHover);
    this.domElement.addEventListener("pointerup", this._onPointerUp);
  }
  // updateMatrixWorld  updates key transformation variables
  updateMatrixWorld() {
    if (this.object !== void 0) {
      this.object.updateMatrixWorld();
      if (this.object.parent === null) {
        console.error("TransformControls: The attached 3D object must be a part of the scene graph.");
      } else {
        this.object.parent.matrixWorld.decompose(this._parentPosition, this._parentQuaternion, this._parentScale);
      }
      this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this._worldScale);
      this._parentQuaternionInv.copy(this._parentQuaternion).invert();
      this._worldQuaternionInv.copy(this.worldQuaternion).invert();
    }
    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this._cameraScale);
    if (this.camera.isOrthographicCamera) {
      this.camera.getWorldDirection(this.eye).negate();
    } else {
      this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize();
    }
    super.updateMatrixWorld(this);
  }
  pointerHover(pointer) {
    if (this.object === void 0 || this.dragging === true)
      return;
    _raycaster$1.setFromCamera(pointer, this.camera);
    const intersect = intersectObjectWithRay(this._gizmo.picker[this.mode], _raycaster$1);
    if (intersect) {
      this.axis = intersect.object.name;
    } else {
      this.axis = null;
    }
  }
  pointerDown(pointer) {
    if (this.object === void 0 || this.dragging === true || pointer.button !== 0)
      return;
    if (this.axis !== null) {
      _raycaster$1.setFromCamera(pointer, this.camera);
      const planeIntersect = intersectObjectWithRay(this._plane, _raycaster$1, true);
      if (planeIntersect) {
        this.object.updateMatrixWorld();
        this.object.parent.updateMatrixWorld();
        this._positionStart.copy(this.object.position);
        this._quaternionStart.copy(this.object.quaternion);
        this._scaleStart.copy(this.object.scale);
        this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart);
        this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart);
      }
      this.dragging = true;
      _mouseDownEvent.mode = this.mode;
      this.dispatchEvent(_mouseDownEvent);
    }
  }
  pointerMove(pointer) {
    const axis = this.axis;
    const mode = this.mode;
    const object = this.object;
    let space = this.space;
    if (mode === "scale") {
      space = "local";
    } else if (axis === "E" || axis === "XYZE" || axis === "XYZ") {
      space = "world";
    }
    if (object === void 0 || axis === null || this.dragging === false || pointer.button !== -1)
      return;
    _raycaster$1.setFromCamera(pointer, this.camera);
    const planeIntersect = intersectObjectWithRay(this._plane, _raycaster$1, true);
    if (!planeIntersect)
      return;
    this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);
    if (mode === "translate") {
      this._offset.copy(this.pointEnd).sub(this.pointStart);
      if (space === "local" && axis !== "XYZ") {
        this._offset.applyQuaternion(this._worldQuaternionInv);
      }
      if (axis.indexOf("X") === -1)
        this._offset.x = 0;
      if (axis.indexOf("Y") === -1)
        this._offset.y = 0;
      if (axis.indexOf("Z") === -1)
        this._offset.z = 0;
      if (space === "local" && axis !== "XYZ") {
        this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale);
      } else {
        this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale);
      }
      object.position.copy(this._offset).add(this._positionStart);
      if (this.translationSnap) {
        if (space === "local") {
          object.position.applyQuaternion(_tempQuaternion.copy(this._quaternionStart).invert());
          if (axis.search("X") !== -1) {
            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
          }
          if (axis.search("Y") !== -1) {
            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
          }
          if (axis.search("Z") !== -1) {
            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
          }
          object.position.applyQuaternion(this._quaternionStart);
        }
        if (space === "world") {
          if (object.parent) {
            object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
          }
          if (axis.search("X") !== -1) {
            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
          }
          if (axis.search("Y") !== -1) {
            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
          }
          if (axis.search("Z") !== -1) {
            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
          }
          if (object.parent) {
            object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
          }
        }
      }
    } else if (mode === "scale") {
      if (axis.search("XYZ") !== -1) {
        let d = this.pointEnd.length() / this.pointStart.length();
        if (this.pointEnd.dot(this.pointStart) < 0)
          d *= -1;
        _tempVector2.set(d, d, d);
      } else {
        _tempVector.copy(this.pointStart);
        _tempVector2.copy(this.pointEnd);
        _tempVector.applyQuaternion(this._worldQuaternionInv);
        _tempVector2.applyQuaternion(this._worldQuaternionInv);
        _tempVector2.divide(_tempVector);
        if (axis.search("X") === -1) {
          _tempVector2.x = 1;
        }
        if (axis.search("Y") === -1) {
          _tempVector2.y = 1;
        }
        if (axis.search("Z") === -1) {
          _tempVector2.z = 1;
        }
      }
      object.scale.copy(this._scaleStart).multiply(_tempVector2);
      if (this.scaleSnap) {
        if (axis.search("X") !== -1) {
          object.scale.x = Math.round(object.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
        }
        if (axis.search("Y") !== -1) {
          object.scale.y = Math.round(object.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
        }
        if (axis.search("Z") !== -1) {
          object.scale.z = Math.round(object.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
        }
      }
    } else if (mode === "rotate") {
      this._offset.copy(this.pointEnd).sub(this.pointStart);
      const ROTATION_SPEED = 20 / this.worldPosition.distanceTo(_tempVector.setFromMatrixPosition(this.camera.matrixWorld));
      if (axis === "E") {
        this.rotationAxis.copy(this.eye);
        this.rotationAngle = this.pointEnd.angleTo(this.pointStart);
        this._startNorm.copy(this.pointStart).normalize();
        this._endNorm.copy(this.pointEnd).normalize();
        this.rotationAngle *= this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1;
      } else if (axis === "XYZE") {
        this.rotationAxis.copy(this._offset).cross(this.eye).normalize();
        this.rotationAngle = this._offset.dot(_tempVector.copy(this.rotationAxis).cross(this.eye)) * ROTATION_SPEED;
      } else if (axis === "X" || axis === "Y" || axis === "Z") {
        this.rotationAxis.copy(_unit[axis]);
        _tempVector.copy(_unit[axis]);
        if (space === "local") {
          _tempVector.applyQuaternion(this.worldQuaternion);
        }
        this.rotationAngle = this._offset.dot(_tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;
      }
      if (this.rotationSnap)
        this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;
      if (space === "local" && axis !== "E" && axis !== "XYZE") {
        object.quaternion.copy(this._quaternionStart);
        object.quaternion.multiply(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize();
      } else {
        this.rotationAxis.applyQuaternion(this._parentQuaternionInv);
        object.quaternion.copy(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
        object.quaternion.multiply(this._quaternionStart).normalize();
      }
    }
    this.dispatchEvent(_changeEvent);
    this.dispatchEvent(_objectChangeEvent);
  }
  pointerUp(pointer) {
    if (pointer.button !== 0)
      return;
    if (this.dragging && this.axis !== null) {
      _mouseUpEvent.mode = this.mode;
      this.dispatchEvent(_mouseUpEvent);
    }
    this.dragging = false;
    this.axis = null;
  }
  dispose() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown);
    this.domElement.removeEventListener("pointermove", this._onPointerHover);
    this.domElement.removeEventListener("pointermove", this._onPointerMove);
    this.domElement.removeEventListener("pointerup", this._onPointerUp);
    this.traverse(function(child) {
      if (child.geometry)
        child.geometry.dispose();
      if (child.material)
        child.material.dispose();
    });
  }
  // Set current object
  attach(object) {
    this.object = object;
    this.visible = true;
    return this;
  }
  // Detach from object
  detach() {
    this.object = void 0;
    this.visible = false;
    this.axis = null;
    return this;
  }
  reset() {
    if (!this.enabled)
      return;
    if (this.dragging) {
      this.object.position.copy(this._positionStart);
      this.object.quaternion.copy(this._quaternionStart);
      this.object.scale.copy(this._scaleStart);
      this.dispatchEvent(_changeEvent);
      this.dispatchEvent(_objectChangeEvent);
      this.pointStart.copy(this.pointEnd);
    }
  }
  getRaycaster() {
    return _raycaster$1;
  }
  // TODO: deprecate
  getMode() {
    return this.mode;
  }
  setMode(mode) {
    this.mode = mode;
  }
  setTranslationSnap(translationSnap) {
    this.translationSnap = translationSnap;
  }
  setRotationSnap(rotationSnap) {
    this.rotationSnap = rotationSnap;
  }
  setScaleSnap(scaleSnap) {
    this.scaleSnap = scaleSnap;
  }
  setSize(size) {
    this.size = size;
  }
  setSpace(space) {
    this.space = space;
  }
}
function getPointer(event) {
  if (this.domElement.ownerDocument.pointerLockElement) {
    return {
      x: 0,
      y: 0,
      button: event.button
    };
  } else {
    const rect = this.domElement.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * 2 - 1,
      y: -(event.clientY - rect.top) / rect.height * 2 + 1,
      button: event.button
    };
  }
}
function onPointerHover(event) {
  if (!this.enabled)
    return;
  switch (event.pointerType) {
    case "mouse":
    case "pen":
      this.pointerHover(this._getPointer(event));
      break;
  }
}
function onPointerDown(event) {
  if (!this.enabled)
    return;
  if (!document.pointerLockElement) {
    this.domElement.setPointerCapture(event.pointerId);
  }
  this.domElement.addEventListener("pointermove", this._onPointerMove);
  this.pointerHover(this._getPointer(event));
  this.pointerDown(this._getPointer(event));
}
function onPointerMove(event) {
  if (!this.enabled)
    return;
  this.pointerMove(this._getPointer(event));
}
function onPointerUp(event) {
  if (!this.enabled)
    return;
  this.domElement.releasePointerCapture(event.pointerId);
  this.domElement.removeEventListener("pointermove", this._onPointerMove);
  this.pointerUp(this._getPointer(event));
}
function intersectObjectWithRay(object, raycaster, includeInvisible) {
  const allIntersections = raycaster.intersectObject(object, true);
  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i];
    }
  }
  return false;
}
const _tempEuler = new Euler();
const _alignVector = new Vector3(0, 1, 0);
const _zeroVector = new Vector3(0, 0, 0);
const _lookAtMatrix = new Matrix4();
const _tempQuaternion2 = new Quaternion();
const _identityQuaternion = new Quaternion();
const _dirVector = new Vector3();
const _tempMatrix = new Matrix4();
const _unitX = new Vector3(1, 0, 0);
const _unitY = new Vector3(0, 1, 0);
const _unitZ = new Vector3(0, 0, 1);
const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
class TransformControlsGizmo extends Object3D {
  constructor() {
    super();
    this.isTransformControlsGizmo = true;
    this.type = "TransformControlsGizmo";
    const gizmoMaterial = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    });
    const gizmoLineMaterial = new LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    });
    const matInvisible = gizmoMaterial.clone();
    matInvisible.opacity = 0.15;
    const matHelper = gizmoLineMaterial.clone();
    matHelper.opacity = 0.5;
    const matRed = gizmoMaterial.clone();
    matRed.color.setHex(16711680);
    const matGreen = gizmoMaterial.clone();
    matGreen.color.setHex(65280);
    const matBlue = gizmoMaterial.clone();
    matBlue.color.setHex(255);
    const matRedTransparent = gizmoMaterial.clone();
    matRedTransparent.color.setHex(16711680);
    matRedTransparent.opacity = 0.5;
    const matGreenTransparent = gizmoMaterial.clone();
    matGreenTransparent.color.setHex(65280);
    matGreenTransparent.opacity = 0.5;
    const matBlueTransparent = gizmoMaterial.clone();
    matBlueTransparent.color.setHex(255);
    matBlueTransparent.opacity = 0.5;
    const matWhiteTransparent = gizmoMaterial.clone();
    matWhiteTransparent.opacity = 0.25;
    const matYellowTransparent = gizmoMaterial.clone();
    matYellowTransparent.color.setHex(16776960);
    matYellowTransparent.opacity = 0.25;
    const matYellow = gizmoMaterial.clone();
    matYellow.color.setHex(16776960);
    const matGray = gizmoMaterial.clone();
    matGray.color.setHex(7895160);
    const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12);
    arrowGeometry.translate(0, 0.05, 0);
    const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08);
    scaleHandleGeometry.translate(0, 0.04, 0);
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));
    const lineGeometry2 = new CylinderGeometry(75e-4, 75e-4, 0.5, 3);
    lineGeometry2.translate(0, 0.25, 0);
    function CircleGeometry(radius, arc) {
      const geometry = new TorusGeometry(radius, 75e-4, 3, 64, arc * Math.PI * 2);
      geometry.rotateY(Math.PI / 2);
      geometry.rotateX(Math.PI / 2);
      return geometry;
    }
    function TranslateHelperGeometry() {
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));
      return geometry;
    }
    const gizmoTranslate = {
      X: [
        [new Mesh(arrowGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(arrowGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new Mesh(arrowGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(arrowGeometry, matGreen), [0, -0.5, 0], [Math.PI, 0, 0]],
        [new Mesh(lineGeometry2, matGreen)]
      ],
      Z: [
        [new Mesh(arrowGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(arrowGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()), [0, 0, 0]]
      ],
      XY: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent.clone()), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    };
    const pickerTranslate = {
      X: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Mesh(new OctahedronGeometry(0.2, 0), matInvisible)]
      ],
      XY: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    };
    const helperTranslate = {
      START: [
        [new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, "helper"]
      ],
      END: [
        [new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, "helper"]
      ],
      DELTA: [
        [new Line(TranslateHelperGeometry(), matHelper), null, null, null, "helper"]
      ],
      X: [
        [new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };
    const gizmoRotate = {
      XYZE: [
        [new Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]
      ],
      X: [
        [new Mesh(CircleGeometry(0.5, 0.5), matRed)]
      ],
      Y: [
        [new Mesh(CircleGeometry(0.5, 0.5), matGreen), null, [0, 0, -Math.PI / 2]]
      ],
      Z: [
        [new Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]
      ],
      E: [
        [new Mesh(CircleGeometry(0.75, 1), matYellowTransparent), null, [0, Math.PI / 2, 0]]
      ]
    };
    const helperRotate = {
      AXIS: [
        [new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ]
    };
    const pickerRotate = {
      XYZE: [
        [new Mesh(new SphereGeometry(0.25, 10, 8), matInvisible)]
      ],
      X: [
        [new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]]
      ],
      Z: [
        [new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      E: [
        [new Mesh(new TorusGeometry(0.75, 0.1, 2, 24), matInvisible)]
      ]
    };
    const gizmoScale = {
      X: [
        [new Mesh(scaleHandleGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(scaleHandleGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(scaleHandleGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(lineGeometry2, matGreen)],
        [new Mesh(scaleHandleGeometry, matGreen), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Mesh(new BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent.clone())]
      ]
    };
    const pickerScale = {
      X: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 0]]
      ]
    };
    const helperScale = {
      X: [
        [new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };
    function setupGizmo(gizmoMap) {
      const gizmo = new Object3D();
      for (const name in gizmoMap) {
        for (let i = gizmoMap[name].length; i--; ) {
          const object = gizmoMap[name][i][0].clone();
          const position = gizmoMap[name][i][1];
          const rotation = gizmoMap[name][i][2];
          const scale = gizmoMap[name][i][3];
          const tag = gizmoMap[name][i][4];
          object.name = name;
          object.tag = tag;
          if (position) {
            object.position.set(position[0], position[1], position[2]);
          }
          if (rotation) {
            object.rotation.set(rotation[0], rotation[1], rotation[2]);
          }
          if (scale) {
            object.scale.set(scale[0], scale[1], scale[2]);
          }
          object.updateMatrix();
          const tempGeometry = object.geometry.clone();
          tempGeometry.applyMatrix4(object.matrix);
          object.geometry = tempGeometry;
          object.renderOrder = Infinity;
          object.position.set(0, 0, 0);
          object.rotation.set(0, 0, 0);
          object.scale.set(1, 1, 1);
          gizmo.add(object);
        }
      }
      return gizmo;
    }
    this.gizmo = {};
    this.picker = {};
    this.helper = {};
    this.add(this.gizmo["translate"] = setupGizmo(gizmoTranslate));
    this.add(this.gizmo["rotate"] = setupGizmo(gizmoRotate));
    this.add(this.gizmo["scale"] = setupGizmo(gizmoScale));
    this.add(this.picker["translate"] = setupGizmo(pickerTranslate));
    this.add(this.picker["rotate"] = setupGizmo(pickerRotate));
    this.add(this.picker["scale"] = setupGizmo(pickerScale));
    this.add(this.helper["translate"] = setupGizmo(helperTranslate));
    this.add(this.helper["rotate"] = setupGizmo(helperRotate));
    this.add(this.helper["scale"] = setupGizmo(helperScale));
    this.picker["translate"].visible = false;
    this.picker["rotate"].visible = false;
    this.picker["scale"].visible = false;
  }
  // updateMatrixWorld will update transformations and appearance of individual handles
  updateMatrixWorld(force) {
    const space = this.mode === "scale" ? "local" : this.space;
    const quaternion = space === "local" ? this.worldQuaternion : _identityQuaternion;
    this.gizmo["translate"].visible = this.mode === "translate";
    this.gizmo["rotate"].visible = this.mode === "rotate";
    this.gizmo["scale"].visible = this.mode === "scale";
    this.helper["translate"].visible = this.mode === "translate";
    this.helper["rotate"].visible = this.mode === "rotate";
    this.helper["scale"].visible = this.mode === "scale";
    let handles = [];
    handles = handles.concat(this.picker[this.mode].children);
    handles = handles.concat(this.gizmo[this.mode].children);
    handles = handles.concat(this.helper[this.mode].children);
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      handle.visible = true;
      handle.rotation.set(0, 0, 0);
      handle.position.copy(this.worldPosition);
      let factor;
      if (this.camera.isOrthographicCamera) {
        factor = (this.camera.top - this.camera.bottom) / this.camera.zoom;
      } else {
        factor = this.worldPosition.distanceTo(this.cameraPosition) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7);
      }
      handle.scale.set(1, 1, 1).multiplyScalar(factor * this.size / 4);
      if (handle.tag === "helper") {
        handle.visible = false;
        if (handle.name === "AXIS") {
          handle.visible = !!this.axis;
          if (this.axis === "X") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0));
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion);
            if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
              handle.visible = false;
            }
          }
          if (this.axis === "Y") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2));
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion);
            if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
              handle.visible = false;
            }
          }
          if (this.axis === "Z") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0));
            handle.quaternion.copy(quaternion).multiply(_tempQuaternion);
            if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
              handle.visible = false;
            }
          }
          if (this.axis === "XYZE") {
            _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0));
            _alignVector.copy(this.rotationAxis);
            handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(_zeroVector, _alignVector, _unitY));
            handle.quaternion.multiply(_tempQuaternion);
            handle.visible = this.dragging;
          }
          if (this.axis === "E") {
            handle.visible = false;
          }
        } else if (handle.name === "START") {
          handle.position.copy(this.worldPositionStart);
          handle.visible = this.dragging;
        } else if (handle.name === "END") {
          handle.position.copy(this.worldPosition);
          handle.visible = this.dragging;
        } else if (handle.name === "DELTA") {
          handle.position.copy(this.worldPositionStart);
          handle.quaternion.copy(this.worldQuaternionStart);
          _tempVector.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1);
          _tempVector.applyQuaternion(this.worldQuaternionStart.clone().invert());
          handle.scale.copy(_tempVector);
          handle.visible = this.dragging;
        } else {
          handle.quaternion.copy(quaternion);
          if (this.dragging) {
            handle.position.copy(this.worldPositionStart);
          } else {
            handle.position.copy(this.worldPosition);
          }
          if (this.axis) {
            handle.visible = this.axis.search(handle.name) !== -1;
          }
        }
        continue;
      }
      handle.quaternion.copy(quaternion);
      if (this.mode === "translate" || this.mode === "scale") {
        const AXIS_HIDE_THRESHOLD = 0.99;
        const PLANE_HIDE_THRESHOLD = 0.2;
        if (handle.name === "X") {
          if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_THRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
        if (handle.name === "Y") {
          if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_THRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
        if (handle.name === "Z") {
          if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_THRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
        if (handle.name === "XY") {
          if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_THRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
        if (handle.name === "YZ") {
          if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_THRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
        if (handle.name === "XZ") {
          if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_THRESHOLD) {
            handle.scale.set(1e-10, 1e-10, 1e-10);
            handle.visible = false;
          }
        }
      } else if (this.mode === "rotate") {
        _tempQuaternion2.copy(quaternion);
        _alignVector.copy(this.eye).applyQuaternion(_tempQuaternion.copy(quaternion).invert());
        if (handle.name.search("E") !== -1) {
          handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(this.eye, _zeroVector, _unitY));
        }
        if (handle.name === "X") {
          _tempQuaternion.setFromAxisAngle(_unitX, Math.atan2(-_alignVector.y, _alignVector.z));
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion);
          handle.quaternion.copy(_tempQuaternion);
        }
        if (handle.name === "Y") {
          _tempQuaternion.setFromAxisAngle(_unitY, Math.atan2(_alignVector.x, _alignVector.z));
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion);
          handle.quaternion.copy(_tempQuaternion);
        }
        if (handle.name === "Z") {
          _tempQuaternion.setFromAxisAngle(_unitZ, Math.atan2(_alignVector.y, _alignVector.x));
          _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion);
          handle.quaternion.copy(_tempQuaternion);
        }
      }
      handle.visible = handle.visible && (handle.name.indexOf("X") === -1 || this.showX);
      handle.visible = handle.visible && (handle.name.indexOf("Y") === -1 || this.showY);
      handle.visible = handle.visible && (handle.name.indexOf("Z") === -1 || this.showZ);
      handle.visible = handle.visible && (handle.name.indexOf("E") === -1 || this.showX && this.showY && this.showZ);
      handle.material._color = handle.material._color || handle.material.color.clone();
      handle.material._opacity = handle.material._opacity || handle.material.opacity;
      handle.material.color.copy(handle.material._color);
      handle.material.opacity = handle.material._opacity;
      if (this.enabled && this.axis) {
        if (handle.name === this.axis) {
          handle.material.color.setHex(16776960);
          handle.material.opacity = 1;
        } else if (this.axis.split("").some(function(a) {
          return handle.name === a;
        })) {
          handle.material.color.setHex(16776960);
          handle.material.opacity = 1;
        }
      }
    }
    super.updateMatrixWorld(force);
  }
}
class TransformControlsPlane extends Mesh {
  constructor() {
    super(
      new PlaneGeometry(1e5, 1e5, 2, 2),
      new MeshBasicMaterial({ visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1, toneMapped: false })
    );
    this.isTransformControlsPlane = true;
    this.type = "TransformControlsPlane";
  }
  updateMatrixWorld(force) {
    let space = this.space;
    this.position.copy(this.worldPosition);
    if (this.mode === "scale")
      space = "local";
    _v1.copy(_unitX).applyQuaternion(space === "local" ? this.worldQuaternion : _identityQuaternion);
    _v2.copy(_unitY).applyQuaternion(space === "local" ? this.worldQuaternion : _identityQuaternion);
    _v3.copy(_unitZ).applyQuaternion(space === "local" ? this.worldQuaternion : _identityQuaternion);
    _alignVector.copy(_v2);
    switch (this.mode) {
      case "translate":
      case "scale":
        switch (this.axis) {
          case "X":
            _alignVector.copy(this.eye).cross(_v1);
            _dirVector.copy(_v1).cross(_alignVector);
            break;
          case "Y":
            _alignVector.copy(this.eye).cross(_v2);
            _dirVector.copy(_v2).cross(_alignVector);
            break;
          case "Z":
            _alignVector.copy(this.eye).cross(_v3);
            _dirVector.copy(_v3).cross(_alignVector);
            break;
          case "XY":
            _dirVector.copy(_v3);
            break;
          case "YZ":
            _dirVector.copy(_v1);
            break;
          case "XZ":
            _alignVector.copy(_v3);
            _dirVector.copy(_v2);
            break;
          case "XYZ":
          case "E":
            _dirVector.set(0, 0, 0);
            break;
        }
        break;
      case "rotate":
      default:
        _dirVector.set(0, 0, 0);
    }
    if (_dirVector.length() === 0) {
      this.quaternion.copy(this.cameraQuaternion);
    } else {
      _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector);
      this.quaternion.setFromRotationMatrix(_tempMatrix);
    }
    super.updateMatrixWorld(force);
  }
}
var Stats = function() {
  var mode = 0;
  var container = document.createElement("div");
  container.style.cssText = "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
  container.addEventListener("click", function(event) {
    event.preventDefault();
    showPanel(++mode % container.children.length);
  }, false);
  function addPanel(panel) {
    container.appendChild(panel.dom);
    return panel;
  }
  function showPanel(id) {
    for (var i = 0; i < container.children.length; i++) {
      container.children[i].style.display = i === id ? "block" : "none";
    }
    mode = id;
  }
  var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
  var fpsPanel = addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
  var msPanel = addPanel(new Stats.Panel("MS", "#0f0", "#020"));
  if (self.performance && self.performance.memory) {
    var memPanel = addPanel(new Stats.Panel("MB", "#f08", "#201"));
  }
  showPanel(0);
  return {
    REVISION: 16,
    dom: container,
    addPanel,
    showPanel,
    begin: function() {
      beginTime = (performance || Date).now();
    },
    end: function() {
      frames++;
      var time = (performance || Date).now();
      msPanel.update(time - beginTime, 200);
      if (time >= prevTime + 1e3) {
        fpsPanel.update(frames * 1e3 / (time - prevTime), 100);
        prevTime = time;
        frames = 0;
        if (memPanel) {
          var memory = performance.memory;
          memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
        }
      }
      return time;
    },
    update: function() {
      beginTime = this.end();
    },
    // Backwards Compatibility
    domElement: container,
    setMode: showPanel
  };
};
Stats.Panel = function(name, fg, bg) {
  var min = Infinity, max = 0, round = Math.round;
  var PR = round(window.devicePixelRatio || 1);
  var WIDTH = 80 * PR, HEIGHT = 48 * PR, TEXT_X = 3 * PR, TEXT_Y = 2 * PR, GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR, GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;
  var canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = "width:80px;height:48px";
  var context = canvas.getContext("2d");
  context.font = "bold " + 9 * PR + "px Helvetica,Arial,sans-serif";
  context.textBaseline = "top";
  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = fg;
  context.fillText(name, TEXT_X, TEXT_Y);
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  return {
    dom: canvas,
    update: function(value, maxValue) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);
      context.fillStyle = fg;
      context.fillText(round(value) + " " + name + " (" + round(min) + "-" + round(max) + ")", TEXT_X, TEXT_Y);
      context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
    }
  };
};
const StatsPanel = Stats;
let ViewHelper$1 = class ViewHelper extends Object3D {
  constructor(camera, domElement) {
    super();
    this.object = camera;
    this.isViewHelper = true;
    this.animating = false;
    this.center = new Vector3();
    const color1 = new Color("#ff3653");
    const color2 = new Color("#8adb00");
    const color3 = new Color("#2c8fff");
    const interactiveObjects = [];
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const dummy = new Object3D();
    const orthoCamera = new OrthographicCamera(-2, 2, 2, -2, 0, 4);
    orthoCamera.position.set(0, 0, 2);
    const geometry = new BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);
    const xAxis = new Mesh(geometry, getAxisMaterial(color1));
    const yAxis = new Mesh(geometry, getAxisMaterial(color2));
    const zAxis = new Mesh(geometry, getAxisMaterial(color3));
    yAxis.rotation.z = Math.PI / 2;
    zAxis.rotation.y = -Math.PI / 2;
    this.add(xAxis);
    this.add(zAxis);
    this.add(yAxis);
    const posXAxisHelper = new Sprite(getSpriteMaterial(color1, "X"));
    posXAxisHelper.userData.type = "posX";
    const posYAxisHelper = new Sprite(getSpriteMaterial(color2, "Y"));
    posYAxisHelper.userData.type = "posY";
    const posZAxisHelper = new Sprite(getSpriteMaterial(color3, "Z"));
    posZAxisHelper.userData.type = "posZ";
    const negXAxisHelper = new Sprite(getSpriteMaterial(color1));
    negXAxisHelper.userData.type = "negX";
    const negYAxisHelper = new Sprite(getSpriteMaterial(color2));
    negYAxisHelper.userData.type = "negY";
    const negZAxisHelper = new Sprite(getSpriteMaterial(color3));
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
    const point = new Vector3();
    const dim = 128;
    const turnRate = 2 * Math.PI;
    const q1 = new Quaternion();
    const q2 = new Quaternion();
    const viewport = new Vector4();
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
    const targetPosition = new Vector3();
    const targetQuaternion = new Quaternion();
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
      var _a, _b, _c, _d, _e, _f;
      geometry.dispose();
      xAxis.material.dispose();
      yAxis.material.dispose();
      zAxis.material.dispose();
      (_a = posXAxisHelper.material.map) == null ? void 0 : _a.dispose();
      (_b = posYAxisHelper.material.map) == null ? void 0 : _b.dispose();
      (_c = posZAxisHelper.material.map) == null ? void 0 : _c.dispose();
      (_d = negXAxisHelper.material.map) == null ? void 0 : _d.dispose();
      (_e = negYAxisHelper.material.map) == null ? void 0 : _e.dispose();
      (_f = negZAxisHelper.material.map) == null ? void 0 : _f.dispose();
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
          targetQuaternion.setFromEuler(new Euler(0, Math.PI * 0.5, 0));
          break;
        case "posY":
          targetPosition.set(0, 1, 0);
          targetQuaternion.setFromEuler(new Euler(-Math.PI * 0.5, 0, 0));
          break;
        case "posZ":
          targetPosition.set(0, 0, 1);
          targetQuaternion.setFromEuler(new Euler());
          break;
        case "negX":
          targetPosition.set(-1, 0, 0);
          targetQuaternion.setFromEuler(new Euler(0, -Math.PI * 0.5, 0));
          break;
        case "negY":
          targetPosition.set(0, -1, 0);
          targetQuaternion.setFromEuler(new Euler(Math.PI * 0.5, 0, 0));
          break;
        case "negZ":
          targetPosition.set(0, 0, -1);
          targetQuaternion.setFromEuler(new Euler(0, Math.PI, 0));
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
      return new MeshBasicMaterial({ color, toneMapped: false });
    }
    function getSpriteMaterial(color, text = "") {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext("2d");
      context.beginPath();
      context.arc(32, 32, 16, 0, 2 * Math.PI);
      context.closePath();
      context.fillStyle = color.getStyle();
      context.fill();
      if (text !== "") {
        context.font = "24px Arial";
        context.textAlign = "center";
        context.fillStyle = "#000000";
        context.fillText(text, 32, 41);
      }
      const texture = new CanvasTexture(canvas);
      return new SpriteMaterial({ map: texture, toneMapped: false });
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
  constructor(camera, domElement) {
    super(camera, domElement);
    const dom = new UIDiv();
    dom.setId("viewHelper");
    dom.setStyle({
      position: "absolute",
      right: "0px",
      bottom: "0px",
      height: "128px",
      width: "128px"
    });
    domElement.append(dom.domElement);
    dom.domElement.addEventListener("pointerup", (event) => {
      event.stopPropagation();
      this.handleClick(event);
    });
    dom.domElement.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
  }
}
class TransformControlHandler {
  constructor(transformControl) {
    this.transformControl = transformControl;
    this.objectPositionOnDown = new Vector3();
    this.objectRotationOnDown = new Euler();
    this.objectScaleOnDown = new Vector3();
  }
  handleChange(editor) {
    const { object } = this.transformControl;
    if (object !== void 0) {
      editor.signals.sceneGraphChanged.dispatch();
    }
  }
  handleMouseDown(viewPort) {
    const { object } = this.transformControl;
    if (object !== void 0) {
      this.objectPositionOnDown.copy(object.position);
      this.objectRotationOnDown.copy(object.rotation);
      this.objectScaleOnDown.copy(object.scale);
      viewPort.orbitControls.enabled = false;
    }
  }
  handleMouseUp(viewPort) {
    const { object } = this.transformControl;
    if (object !== void 0) {
      switch (this.transformControl.getMode()) {
        case "translate":
          if (!this.objectPositionOnDown.equals(object.position))
            ;
          break;
        case "rotate":
          if (!this.objectRotationOnDown.equals(object.rotation))
            ;
          break;
        case "scale":
          if (!this.objectScaleOnDown.equals(object.scale))
            ;
          break;
      }
      viewPort.orbitControls.enabled = true;
    }
  }
}
class OutlinePass extends Pass {
  constructor(resolution, scene, camera, selectedObjects) {
    super();
    this.renderScene = scene;
    this.renderCamera = camera;
    this.selectedObjects = selectedObjects !== void 0 ? selectedObjects : [];
    this.visibleEdgeColor = new Color(1, 1, 1);
    this.hiddenEdgeColor = new Color(0.1, 0.04, 0.02);
    this.edgeGlow = 0;
    this.usePatternTexture = false;
    this.edgeThickness = 1;
    this.edgeStrength = 3;
    this.downSampleRatio = 2;
    this.pulsePeriod = 0;
    this._visibilityCache = /* @__PURE__ */ new Map();
    this.resolution = resolution !== void 0 ? new Vector2(resolution.x, resolution.y) : new Vector2(256, 256);
    const resx = Math.round(this.resolution.x / this.downSampleRatio);
    const resy = Math.round(this.resolution.y / this.downSampleRatio);
    this.renderTargetMaskBuffer = new WebGLRenderTarget(this.resolution.x, this.resolution.y);
    this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
    this.renderTargetMaskBuffer.texture.generateMipmaps = false;
    this.depthMaterial = new MeshDepthMaterial();
    this.depthMaterial.side = DoubleSide;
    this.depthMaterial.depthPacking = RGBADepthPacking;
    this.depthMaterial.blending = NoBlending;
    this.prepareMaskMaterial = this.getPrepareMaskMaterial();
    this.prepareMaskMaterial.side = DoubleSide;
    this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(this.prepareMaskMaterial.fragmentShader, this.renderCamera);
    this.renderTargetDepthBuffer = new WebGLRenderTarget(this.resolution.x, this.resolution.y, { type: HalfFloatType });
    this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
    this.renderTargetDepthBuffer.texture.generateMipmaps = false;
    this.renderTargetMaskDownSampleBuffer = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
    this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample";
    this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;
    this.renderTargetBlurBuffer1 = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
    this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
    this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
    this.renderTargetBlurBuffer2 = new WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), { type: HalfFloatType });
    this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
    this.renderTargetBlurBuffer2.texture.generateMipmaps = false;
    this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
    this.renderTargetEdgeBuffer1 = new WebGLRenderTarget(resx, resy, { type: HalfFloatType });
    this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
    this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
    this.renderTargetEdgeBuffer2 = new WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), { type: HalfFloatType });
    this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2";
    this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;
    const MAX_EDGE_THICKNESS = 4;
    const MAX_EDGE_GLOW = 4;
    this.separableBlurMaterial1 = this.getSeperableBlurMaterial(MAX_EDGE_THICKNESS);
    this.separableBlurMaterial1.uniforms["texSize"].value.set(resx, resy);
    this.separableBlurMaterial1.uniforms["kernelRadius"].value = 1;
    this.separableBlurMaterial2 = this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
    this.separableBlurMaterial2.uniforms["texSize"].value.set(Math.round(resx / 2), Math.round(resy / 2));
    this.separableBlurMaterial2.uniforms["kernelRadius"].value = MAX_EDGE_GLOW;
    this.overlayMaterial = this.getOverlayMaterial();
    const copyShader = CopyShader;
    this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false
    });
    this.enabled = true;
    this.needsSwap = false;
    this._oldClearColor = new Color();
    this.oldClearAlpha = 1;
    this.fsQuad = new FullScreenQuad(null);
    this.tempPulseColor1 = new Color();
    this.tempPulseColor2 = new Color();
    this.textureMatrix = new Matrix4();
    function replaceDepthToViewZ(string, camera2) {
      const type = camera2.isPerspectiveCamera ? "perspective" : "orthographic";
      return string.replace(/DEPTH_TO_VIEW_Z/g, type + "DepthToViewZ");
    }
  }
  dispose() {
    this.renderTargetMaskBuffer.dispose();
    this.renderTargetDepthBuffer.dispose();
    this.renderTargetMaskDownSampleBuffer.dispose();
    this.renderTargetBlurBuffer1.dispose();
    this.renderTargetBlurBuffer2.dispose();
    this.renderTargetEdgeBuffer1.dispose();
    this.renderTargetEdgeBuffer2.dispose();
    this.depthMaterial.dispose();
    this.prepareMaskMaterial.dispose();
    this.edgeDetectionMaterial.dispose();
    this.separableBlurMaterial1.dispose();
    this.separableBlurMaterial2.dispose();
    this.overlayMaterial.dispose();
    this.materialCopy.dispose();
    this.fsQuad.dispose();
  }
  setSize(width, height) {
    this.renderTargetMaskBuffer.setSize(width, height);
    this.renderTargetDepthBuffer.setSize(width, height);
    let resx = Math.round(width / this.downSampleRatio);
    let resy = Math.round(height / this.downSampleRatio);
    this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
    this.renderTargetBlurBuffer1.setSize(resx, resy);
    this.renderTargetEdgeBuffer1.setSize(resx, resy);
    this.separableBlurMaterial1.uniforms["texSize"].value.set(resx, resy);
    resx = Math.round(resx / 2);
    resy = Math.round(resy / 2);
    this.renderTargetBlurBuffer2.setSize(resx, resy);
    this.renderTargetEdgeBuffer2.setSize(resx, resy);
    this.separableBlurMaterial2.uniforms["texSize"].value.set(resx, resy);
  }
  changeVisibilityOfSelectedObjects(bVisible) {
    const cache = this._visibilityCache;
    function gatherSelectedMeshesCallBack(object) {
      if (object.isMesh) {
        if (bVisible === true) {
          object.visible = cache.get(object);
        } else {
          cache.set(object, object.visible);
          object.visible = bVisible;
        }
      }
    }
    for (let i = 0; i < this.selectedObjects.length; i++) {
      const selectedObject = this.selectedObjects[i];
      selectedObject.traverse(gatherSelectedMeshesCallBack);
    }
  }
  changeVisibilityOfNonSelectedObjects(bVisible) {
    const cache = this._visibilityCache;
    const selectedMeshes = [];
    function gatherSelectedMeshesCallBack(object) {
      if (object.isMesh)
        selectedMeshes.push(object);
    }
    for (let i = 0; i < this.selectedObjects.length; i++) {
      const selectedObject = this.selectedObjects[i];
      selectedObject.traverse(gatherSelectedMeshesCallBack);
    }
    function VisibilityChangeCallBack(object) {
      if (object.isMesh || object.isSprite) {
        let bFound = false;
        for (let i = 0; i < selectedMeshes.length; i++) {
          const selectedObjectId = selectedMeshes[i].id;
          if (selectedObjectId === object.id) {
            bFound = true;
            break;
          }
        }
        if (bFound === false) {
          const visibility = object.visible;
          if (bVisible === false || cache.get(object) === true) {
            object.visible = bVisible;
          }
          cache.set(object, visibility);
        }
      } else if (object.isPoints || object.isLine) {
        if (bVisible === true) {
          object.visible = cache.get(object);
        } else {
          cache.set(object, object.visible);
          object.visible = bVisible;
        }
      }
    }
    this.renderScene.traverse(VisibilityChangeCallBack);
  }
  updateTextureMatrix() {
    this.textureMatrix.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    );
    this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
    this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
  }
  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    if (this.selectedObjects.length > 0) {
      renderer.getClearColor(this._oldClearColor);
      this.oldClearAlpha = renderer.getClearAlpha();
      const oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;
      if (maskActive)
        renderer.state.buffers.stencil.setTest(false);
      renderer.setClearColor(16777215, 1);
      this.changeVisibilityOfSelectedObjects(false);
      const currentBackground = this.renderScene.background;
      this.renderScene.background = null;
      this.renderScene.overrideMaterial = this.depthMaterial;
      renderer.setRenderTarget(this.renderTargetDepthBuffer);
      renderer.clear();
      renderer.render(this.renderScene, this.renderCamera);
      this.changeVisibilityOfSelectedObjects(true);
      this._visibilityCache.clear();
      this.updateTextureMatrix();
      this.changeVisibilityOfNonSelectedObjects(false);
      this.renderScene.overrideMaterial = this.prepareMaskMaterial;
      this.prepareMaskMaterial.uniforms["cameraNearFar"].value.set(this.renderCamera.near, this.renderCamera.far);
      this.prepareMaskMaterial.uniforms["depthTexture"].value = this.renderTargetDepthBuffer.texture;
      this.prepareMaskMaterial.uniforms["textureMatrix"].value = this.textureMatrix;
      renderer.setRenderTarget(this.renderTargetMaskBuffer);
      renderer.clear();
      renderer.render(this.renderScene, this.renderCamera);
      this.renderScene.overrideMaterial = null;
      this.changeVisibilityOfNonSelectedObjects(true);
      this._visibilityCache.clear();
      this.renderScene.background = currentBackground;
      this.fsQuad.material = this.materialCopy;
      this.copyUniforms["tDiffuse"].value = this.renderTargetMaskBuffer.texture;
      renderer.setRenderTarget(this.renderTargetMaskDownSampleBuffer);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.tempPulseColor1.copy(this.visibleEdgeColor);
      this.tempPulseColor2.copy(this.hiddenEdgeColor);
      if (this.pulsePeriod > 0) {
        const scalar = (1 + 0.25) / 2 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * (1 - 0.25) / 2;
        this.tempPulseColor1.multiplyScalar(scalar);
        this.tempPulseColor2.multiplyScalar(scalar);
      }
      this.fsQuad.material = this.edgeDetectionMaterial;
      this.edgeDetectionMaterial.uniforms["maskTexture"].value = this.renderTargetMaskDownSampleBuffer.texture;
      this.edgeDetectionMaterial.uniforms["texSize"].value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height);
      this.edgeDetectionMaterial.uniforms["visibleEdgeColor"].value = this.tempPulseColor1;
      this.edgeDetectionMaterial.uniforms["hiddenEdgeColor"].value = this.tempPulseColor2;
      renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.fsQuad.material = this.separableBlurMaterial1;
      this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
      this.separableBlurMaterial1.uniforms["direction"].value = OutlinePass.BlurDirectionX;
      this.separableBlurMaterial1.uniforms["kernelRadius"].value = this.edgeThickness;
      renderer.setRenderTarget(this.renderTargetBlurBuffer1);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetBlurBuffer1.texture;
      this.separableBlurMaterial1.uniforms["direction"].value = OutlinePass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.fsQuad.material = this.separableBlurMaterial2;
      this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
      this.separableBlurMaterial2.uniforms["direction"].value = OutlinePass.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetBlurBuffer2);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetBlurBuffer2.texture;
      this.separableBlurMaterial2.uniforms["direction"].value = OutlinePass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetEdgeBuffer2);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.fsQuad.material = this.overlayMaterial;
      this.overlayMaterial.uniforms["maskTexture"].value = this.renderTargetMaskBuffer.texture;
      this.overlayMaterial.uniforms["edgeTexture1"].value = this.renderTargetEdgeBuffer1.texture;
      this.overlayMaterial.uniforms["edgeTexture2"].value = this.renderTargetEdgeBuffer2.texture;
      this.overlayMaterial.uniforms["patternTexture"].value = this.patternTexture;
      this.overlayMaterial.uniforms["edgeStrength"].value = this.edgeStrength;
      this.overlayMaterial.uniforms["edgeGlow"].value = this.edgeGlow;
      this.overlayMaterial.uniforms["usePatternTexture"].value = this.usePatternTexture;
      if (maskActive)
        renderer.state.buffers.stencil.setTest(true);
      renderer.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer);
      renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
      renderer.autoClear = oldAutoClear;
    }
    if (this.renderToScreen) {
      this.fsQuad.material = this.materialCopy;
      this.copyUniforms["tDiffuse"].value = readBuffer.texture;
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    }
  }
  getPrepareMaskMaterial() {
    return new ShaderMaterial({
      uniforms: {
        "depthTexture": { value: null },
        "cameraNearFar": { value: new Vector2(0.5, 0.5) },
        "textureMatrix": { value: null }
      },
      vertexShader: `#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>

				varying vec4 projTexCoord;
				varying vec4 vPosition;
				uniform mat4 textureMatrix;

				void main() {

					#include <skinbase_vertex>
					#include <begin_vertex>
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>

					vPosition = mvPosition;

					vec4 worldPosition = vec4( transformed, 1.0 );

					#ifdef USE_INSTANCING

						worldPosition = instanceMatrix * worldPosition;

					#endif
					
					worldPosition = modelMatrix * worldPosition;

					projTexCoord = textureMatrix * worldPosition;

				}`,
      fragmentShader: `#include <packing>
				varying vec4 vPosition;
				varying vec4 projTexCoord;
				uniform sampler2D depthTexture;
				uniform vec2 cameraNearFar;

				void main() {

					float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));
					float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );
					float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
					gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);

				}`
    });
  }
  getEdgeDetectionMaterial() {
    return new ShaderMaterial({
      uniforms: {
        "maskTexture": { value: null },
        "texSize": { value: new Vector2(0.5, 0.5) },
        "visibleEdgeColor": { value: new Vector3(1, 1, 1) },
        "hiddenEdgeColor": { value: new Vector3(1, 1, 1) }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform vec2 texSize;
				uniform vec3 visibleEdgeColor;
				uniform vec3 hiddenEdgeColor;

				void main() {
					vec2 invSize = 1.0 / texSize;
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
					float diff1 = (c1.r - c2.r)*0.5;
					float diff2 = (c3.r - c4.r)*0.5;
					float d = length( vec2(diff1, diff2) );
					float a1 = min(c1.g, c2.g);
					float a2 = min(c3.g, c4.g);
					float visibilityFactor = min(a1, a2);
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
				}`
    });
  }
  getSeperableBlurMaterial(maxRadius) {
    return new ShaderMaterial({
      defines: {
        "MAX_RADIUS": maxRadius
      },
      uniforms: {
        "colorTexture": { value: null },
        "texSize": { value: new Vector2(0.5, 0.5) },
        "direction": { value: new Vector2(0.5, 0.5) },
        "kernelRadius": { value: 1 }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;
				uniform float kernelRadius;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}

				void main() {
					vec2 invSize = 1.0 / texSize;
					float sigma = kernelRadius/2.0;
					float weightSum = gaussianPdf(0.0, sigma);
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
					vec2 uvOffset = delta;
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {
						float x = kernelRadius * float(i) / float(MAX_RADIUS);
						float w = gaussianPdf(x, sigma);
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
						diffuseSum += ((sample1 + sample2) * w);
						weightSum += (2.0 * w);
						uvOffset += delta;
					}
					gl_FragColor = diffuseSum/weightSum;
				}`
    });
  }
  getOverlayMaterial() {
    return new ShaderMaterial({
      uniforms: {
        "maskTexture": { value: null },
        "edgeTexture1": { value: null },
        "edgeTexture2": { value: null },
        "patternTexture": { value: null },
        "edgeStrength": { value: 1 },
        "edgeGlow": { value: 1 },
        "usePatternTexture": { value: 0 }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform sampler2D edgeTexture1;
				uniform sampler2D edgeTexture2;
				uniform sampler2D patternTexture;
				uniform float edgeStrength;
				uniform float edgeGlow;
				uniform bool usePatternTexture;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
					vec4 maskColor = texture2D(maskTexture, vUv);
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
					if(usePatternTexture)
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
					gl_FragColor = finalColor;
				}`,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
  }
}
OutlinePass.BlurDirectionX = new Vector2(1, 0);
OutlinePass.BlurDirectionY = new Vector2(0, 1);
const _raycaster = new Raycaster();
const _mouse = new Vector2();
const _onDownPosition = new Vector2();
const _onUpPosition = new Vector2();
class MainViewPort extends ViewPort {
  constructor(editor, camera, domElement) {
    super(editor, camera, domElement);
    this.type = "MainViewPort";
    this.clock = new Clock();
    this.needsUpdate = false;
    this.renderer.setAnimationLoop(() => this.animate());
    this.excludeObjects = [];
    this.excludeTypes = [];
    this.statePanel = new StatsPanel();
    this.statePanel.showPanel(0);
    this.statePanel.dom.style.position = "absolute";
    this.statePanel.dom.style.zIndex = "1";
    this.domElement.setAttribute("id", "F-MainViewPort");
    this.domElement.append(this.statePanel.dom);
    this.viewHelper = new ViewHelper2(camera, this.domElement);
    this.transformControl = new TransformControls(camera, this.renderer.domElement);
    this.editor.addHelper(this.transformControl);
    const handler = new TransformControlHandler(this.transformControl);
    this.transformControl.addEventListener("change", () => handler.handleChange(editor));
    this.transformControl.addEventListener("mouseDown", () => handler.handleMouseDown(this));
    this.transformControl.addEventListener("mouseUp", () => handler.handleMouseUp(this));
    const outlinePass = new OutlinePass(this.size, this.editor.scene, this.camera);
    outlinePass.hiddenEdgeColor = outlinePass.visibleEdgeColor = new Color("#e29240");
    outlinePass.edgeStrength = 4;
    this.composer.insertPass(outlinePass, 3);
    this._currentMode = "select";
    const selectId = [];
    this.editor.signals.objectsRemoved.add((uuids) => {
      const selections = this.editor.getState("selections");
      const originSize = selections.size;
      uuids.forEach((uuid) => selections.delete(uuid));
      if (originSize !== selections.size) {
        selectId.length = 0;
        for (let i of selections.values()) {
          selectId.push(i);
        }
        this.editor.selectByIds(selectId);
      }
    });
    const selectObjects = [];
    this.editor.signals.objectsSelected.add((uuids) => {
      selectObjects.length = 0;
      uuids.forEach((uuid) => {
        const obj = this.editor.getObjectByUuid(uuid);
        obj && selectObjects.push(obj);
      });
      if (selectObjects.length === 1 && this._currentMode !== "select") {
        this.transformControl.attach(selectObjects[0]);
      } else {
        this.transformControl.detach();
      }
      this.composer.passes[3].selectedObjects = selectObjects;
      this.editor.signals.sceneGraphChanged.dispatch();
    });
    const getIntersects = (point) => {
      _mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      _raycaster.setFromCamera(_mouse, camera);
      const objects = [];
      const excludeUuids = [
        this.transformControl.uuid,
        ...this.excludeObjects.map((o) => o.uuid)
      ];
      for (let i = 0, l = editor.scene.children.length; i < l; i++) {
        traverseObject(editor.scene.children[i], excludeUuids, this.excludeTypes, objects);
      }
      for (let i = 0, l = editor.sceneHelper.children.length; i < l; i++) {
        traverseObject(editor.sceneHelper.children[i], excludeUuids, this.excludeTypes, objects);
      }
      return _raycaster.intersectObjects(objects, false);
    };
    const multiSelectId = [];
    const handelClick = (event) => {
      if (_onDownPosition.distanceTo(_onUpPosition) === 0) {
        const intersects = getIntersects(_onUpPosition);
        const intersectsObjectsUUId = intersects.map((item) => {
          var _a;
          return (_a = item == null ? void 0 : item.object) == null ? void 0 : _a.uuid;
        }).filter((id) => id !== void 0);
        if (intersectsObjectsUUId.length === 0) {
          multiSelectId.length = 0;
        } else {
          multiSelectId.push(intersectsObjectsUUId[0]);
        }
        this.editor.signals.intersectionsDetected.dispatch(multiSelectId);
        if (!event.ctrlKey) {
          multiSelectId.length = 0;
        }
      }
    };
    const onMouseUp = (event) => {
      const mousePosition = getMousePosition(event.clientX, event.clientY, this.renderer.domElement);
      _onUpPosition.fromArray(mousePosition);
      handelClick(event);
      this.renderer.domElement.removeEventListener("pointerup", onMouseUp);
    };
    const onMouseDown = (event) => {
      if (event.button !== 0)
        return;
      const mousePosition = getMousePosition(event.clientX, event.clientY, this.renderer.domElement);
      _onDownPosition.fromArray(mousePosition);
      this.renderer.domElement.addEventListener("pointerup", onMouseUp);
    };
    this.renderer.domElement.addEventListener("pointerdown", onMouseDown);
  }
  get currentMode() {
    return this._currentMode;
  }
  render() {
    super.render();
    this.viewHelper.render(this.renderer);
    this.needsUpdate = false;
  }
  animate() {
    const delta = this.clock.getDelta();
    this.statePanel.update();
    if (this.viewHelper.animating === true) {
      this.viewHelper.update(delta);
      this.needsUpdate = true;
    }
    if (this.needsUpdate) {
      this.render();
    }
  }
  changeMode(mode) {
    this._currentMode = mode;
    if (mode !== "select") {
      this.transformControl.setMode(mode);
      const selections = this.editor.getState("selections");
      if (selections.size === 1) {
        const obj = this.editor.getObjectByUuid(selections.values().next().value);
        obj && this.transformControl.attach(obj);
      }
    } else {
      this.transformControl.detach();
    }
    this.editor.needsUpdate = true;
  }
}
function getMousePosition(x, y, dom) {
  const { left, top, width, height } = dom.getBoundingClientRect();
  return [(x - left) / width, (y - top) / height];
}
function traverseObject(object, extrudeIds, type, target) {
  if (!extrudeIds.includes(object.uuid) && object.visible && !type.includes(object.type)) {
    target.push(object);
  }
}
class Container {
  constructor() {
    this.cameras = /* @__PURE__ */ new Map();
    this.lights = /* @__PURE__ */ new Map();
    this.objects = /* @__PURE__ */ new Map();
    this.geometries = /* @__PURE__ */ new Map();
    this.materials = /* @__PURE__ */ new Map();
    this.helpers = /* @__PURE__ */ new Map();
    this.textures = /* @__PURE__ */ new Map();
    this.geometriesRefCounter = /* @__PURE__ */ new Map();
    this.materialsRefCounter = /* @__PURE__ */ new Map();
    this.texturesRefCounter = /* @__PURE__ */ new Map();
  }
  // camera
  addCamera(key, camera) {
    this.cameras.set(key, camera);
  }
  removeCamera(camera) {
    this.cameras.delete(camera == null ? void 0 : camera.uuid);
  }
  // light
  addLight(key, light) {
    this.lights.set(key, light);
  }
  removeLight(light) {
    this.lights.delete(light == null ? void 0 : light.uuid);
  }
  // object
  addObject(object) {
    if (object == null ? void 0 : object.isObject3D) {
      this.objects.set(object.uuid, object);
      if (object == null ? void 0 : object.isCamera)
        ;
    } else {
      console.error("Container.addObject: object not an instance of THREE.Object3D.", object);
    }
  }
  removeObject(object) {
    this.objects.delete(object == null ? void 0 : object.uuid);
  }
  getObjectByUuid(uuid) {
    return this.objects.get(uuid);
  }
  // geometry
  addGeometry(geometry) {
    if (geometry == null ? void 0 : geometry.isBufferGeometry) {
      this.addObjectToRefCounter(geometry, this.geometriesRefCounter, this.geometries);
    } else {
      console.error(".Container.addGeometry: object not an instance of THREE.BufferGeometry.", geometry);
    }
  }
  removeGeometry(geometry) {
    this.removeObjectToRefCounter(geometry, this.geometriesRefCounter, this.geometries);
  }
  getGeometryByUUID(uuid) {
    return this.geometries.get(uuid);
  }
  // material
  addMaterial(material) {
    var _a;
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        if ((_a = material[i]) == null ? void 0 : _a.isMaterial) {
          this.addObjectToRefCounter(material[i], this.materialsRefCounter, this.materials);
        } else {
          console.error("Container.addMaterial: object not an instance of THREE.Material in Material Array.", material[i]);
          break;
        }
      }
    } else if (material == null ? void 0 : material.isMaterial) {
      this.addObjectToRefCounter(material, this.materialsRefCounter, this.materials);
    } else {
      console.error("Container.addMaterial: object not an instance of THREE.Material.", material);
    }
  }
  removeMaterial(material) {
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        this.removeObjectToRefCounter(material[i], this.materialsRefCounter, this.materials);
      }
    } else {
      this.removeObjectToRefCounter(material, this.materialsRefCounter, this.materials);
    }
  }
  getMaterialByUUID(uuid) {
    return this.materials.get(uuid);
  }
  // texture
  addTexture(texture) {
    if (texture == null ? void 0 : texture.isTexture) {
      this.addObjectToRefCounter(texture, this.texturesRefCounter, this.textures);
    } else {
      console.error("Container.addTexture: object not an instance of THREE.Texture.", texture);
    }
  }
  removeTexture(texture) {
    this.removeObjectToRefCounter(texture, this.texturesRefCounter, this.textures);
  }
  getTextureByUUID(uuid) {
    return this.textures.get(uuid);
  }
  // helper
  addHelper(key, helper) {
    this.helpers.set(key, helper);
  }
  removeHelper(helper) {
    if (this.helpers.has(helper == null ? void 0 : helper.uuid)) {
      this.helpers.delete(helper.uuid);
    }
  }
  getHelperByKey(key) {
    return this.helpers.get(key);
  }
  // counter
  addObjectToRefCounter(object, counter, map) {
    let count = counter.get(object.uuid);
    if (count === void 0) {
      map.set(object.uuid, object);
      counter.set(object.uuid, 1);
    } else {
      counter.set(object.uuid, count++);
    }
  }
  removeObjectToRefCounter(object, counter, map) {
    let count = counter.get(object.uuid);
    if (count) {
      count--;
      if (count === 0) {
        counter.delete(object.uuid);
        map.delete(object.uuid);
      } else {
        counter.set(object.uuid, count);
      }
    }
  }
}
export {
  Container,
  Editor,
  MainViewPort,
  ViewHelper2 as ViewHelper,
  ViewPort
};
