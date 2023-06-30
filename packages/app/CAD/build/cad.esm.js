import { PerspectiveCamera, Vector3, OrthographicCamera, WebGLRenderer, PCFSoftShadowMap, Scene, Group, ArrowHelper, LineSegments, BufferGeometry, LineBasicMaterial, Color, Float32BufferAttribute, Object3D, Raycaster, Vector2, BoxGeometry, Mesh, Sprite, Quaternion, Vector4, Euler, MeshBasicMaterial, CanvasTexture, SpriteMaterial, EventDispatcher as EventDispatcher$1, MOUSE, TOUCH, Spherical, Matrix4, CylinderGeometry, OctahedronGeometry, Line, SphereGeometry, TorusGeometry, PlaneGeometry, DoubleSide, GridHelper, Box3, Box3Helper, Clock } from 'three';

/*
 * @Date: 2023-06-30 16:25:00
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 17:55:18
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/EventDispatcher.js
 */
class EventDispatcher {
  addEventListener(type, listener) {
    if (this._listeners === undefined) this._listeners = {};

    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  hasEventListener(type, listener) {
    if (this._listeners === undefined) return false;

    const listeners = this._listeners;

    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
  }

  removeEventListener(type, listener) {
    if (this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(type, ...arg) {
    if (this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      // Make a copy, in case listeners are removed while iterating.
      const array = listenerArray.slice(0);

      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, ...arg);
      }
    }
  }
}

/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 17:40:29
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Container.js
 */
class Container {
  constructor() {
    this.cameras = new Map();
    this.lights = new Map();
    this.objects = new Map();
    this.geometries = new Map();
    this.materials = new Map();
    this.helpers = new Map();
    this.textures = new Map();

    this.geometriesRefCounter = new Map();
    this.materialsRefCounter = new Map();
    this.texturesRefCounter = new Map();
  }

  // camera
  addCamera(camera) {
    if (camera?.isCamera) {
      this.cameras.set(camera.uuid, camera);
    } else {
      console.error('Editor.Container.addCamera: object not an instance of THREE.Camera.', camera);
    }
  }

  removeCamera(camera) {
    this.cameras.delete(camera?.uuid);
  }

  // light
  addLight(light) {
    if (light?.isLight) {
      this.lights.set(light.uuid, light);
    } else {
      console.error('Editor.Container.addLight: object not an instance of THREE.Light.', light);
    }
  }

  removeLight(light) {
    this.lights.delete(light?.uuid);
  }

  // object

  addObject(object) {
    if (object?.isObject3D) {
      this.objects.set(object.uuid, object);
    } else {
      console.error('Editor.Container.addObject: object not an instance of THREE.Object3D.', object);
    }
  }

  removeObject(object) {
    this.objects.delete(object?.uuid);
  }

  getObjectByUUID(uuid) {
    return this.objects.get(uuid);
  }

  // geometry

  addGeometry(geometry) {
    if (geometry?.isBufferGeometry) {
      this.addObjectToRefCounter(geometry, this.geometriesRefCounter, this.geometries);
    } else {
      console.error('Editor.Container.addGeometry: object not an instance of THREE.BufferGeometry.', geometry);
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
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        if (material[i]?.isMaterial) {
          this.addObjectToRefCounter(material[i], this.materialsRefCounter, this.materials);
        } else {
          console.error('Editor.Container.addMaterial: object not an instance of THREE.Material in Material Array.', material[i]);
          break;
        }
      }
    } else if (material?.isMaterial) {
      this.addObjectToRefCounter(material, this.materialsRefCounter, this.materials);
    } else {
      console.error('Editor.Container.addMaterial: object not an instance of THREE.Material.', material);
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
    if (texture?.isTexture) {
      this.addObjectToRefCounter(texture, this.texturesRefCounter, this.textures);
    } else {
      console.error('Editor.Container.addTexture: object not an instance of THREE.Texture.', texture);
    }
  }

  removeTexture(texture) {
    this.removeObjectToRefCounter(texture, this.texturesRefCounter, this.textures);
  }

  getTextureByUUID(uuid) {
    return this.textures.get(uuid);
  }

  // helper

  addHelper(helper) {
    this.helpers.set(helper?.uuid, helper);
  }

  removeHelper(helper) {
    if (this.helpers.has(helper?.uuid)) {
      this.helpers.delete(helper.uuid);
    }
  }

  getHelperByUUID(uuid) {
    return this.helpers.get(uuid);
  }

  // counter

  addObjectToRefCounter(object, counter, map) {
    let count = counter.get(object.uuid);
    if (count === undefined) {
      map.set(object.uuid, object);
      counter.set(object.uuid, 1);
    } else {
      counter.set(object.uuid, count++);
    }
  }

  removeObjectToRefCounter(object, counter, map) {
    let count = counter.get(object.uuid);
    count--;
    if (count === 0) {
      counter.delete(object.uuid);
      map.delete(object.uuid);
    } else {
      counter.set(object.uuid, count);
    }
  }
}

/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false, signals:false */

/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */

    // SignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a Signal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
     * @author Miller Medeiros
     * @constructor
     * @internal
     * @name SignalBinding
     * @param {Signal} signal Reference to Signal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type Signal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    SignalBinding.prototype = {

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active : true,

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params : null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
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
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce : function () {
            return this._isOnce;
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener : function () {
            return this._listener;
        },

        /**
         * @return {Signal} Signal that listener is currently bound to.
         */
        getSignal : function () {
            return this._signal;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

    };


/*global SignalBinding:false*/

    // Signal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @name Signal
     * @author Miller Medeiros
     * @constructor
     */
    function Signal() {
        /**
         * @type Array.<SignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;

        // enforce dispatch to aways work on same context (#47)
        var self = this;
        this.dispatch = function(){
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }

    Signal.prototype = {

        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION : '1.0.0',

        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize : false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate : true,

        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active : true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener : function (listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if(this.memorize && this._prevParams){
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener : function (listener, context) {
            var n = this._bindings.length,
                cur;
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
        has : function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add : function (listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce : function (listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove : function (listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the Signal.
         */
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners : function () {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see Signal.prototype.disable
         */
        halt : function () {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch : function (params) {
            if (! this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (! n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see Signal.memorize
         */
        forget : function(){
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose : function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        }

    };

/*
 * @Date: 2023-06-25 10:49:17
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 18:15:08
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/common.js
 */
function isSameArray(v1, v2) {
  return stringify(v1.slice().sort()) === stringify(v2.slice().sort());
}

function stringify(v) {
  return JSON.stringify(v);
}

/*
 * @Date: 2023-06-25 10:27:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 21:01:31
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Selector.js
 */

class Selector {
  constructor(editor) {
    // 是否为多选模式
    this.multipleSelect = false;
    this.editor = editor;
    this.signals = editor.signals;

    this.signals.intersectionsDetected.add((selectIds) => {
      if (selectIds.length > 0) {
        if (!this.multipleSelect) {
          // 多选模式会全部选择
          this.select(selectIds);
        } else {
          // 非多选模式只会选择最近的物体
          this.select([selectIds[0]]);
        }
      } else {
        this.select([]);
      }
    });
  }

  select(selectIds) {
    if (isSameArray(this.editor.selected, selectIds)) return;
    this.editor.selected = selectIds;

    this.signals.objectSelected.dispatch(selectIds.length ? selectIds : []);
  }

  detach() {
    this.select([]);
  }
}

/*
 * @Date: 2023-06-14 11:09:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 20:28:44
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/initialization.js
 */

function initPerspectiveCamera(initialPosition) {
  const camera = new PerspectiveCamera(50, 1, 0.01, 1000);

  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(0, 5, 10);
  camera.position.copy(position);
  camera.up.set(0, 0, 1);

  camera.lookAt(new Vector3());
  return camera;
}

function initOrthographicCamera(initialPosition) {
  const s = 15;
  const h = window.innerHeight;
  const w = window.innerWidth;
  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(5000, -5000, 10000);

  const camera = new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 1, 10000000);
  camera.position.copy(position);
  camera.zoom = 2.5;
  camera.up.set(0, 0, 1);
  camera.lookAt(new Vector3(0, 0, 0));
  camera.updateProjectionMatrix();

  return camera;
}

function initRenderer(options = {}) {
  const renderer = new WebGLRenderer({ antialias: true, ...options });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(0xaaaaaa);

  return renderer;
}

function initScene() {
  return new Scene();
}

/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 18:19:37
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Editor.js
 */

class Editor extends EventDispatcher {
  constructor(target) {
    super();
    this.state = {};
    this.signals = {
      windowResize: new Signal(),
      objectSelected: new Signal(),
      intersectionsDetected: new Signal(),
      objectAdded: new Signal(),
      sceneGraphChanged: new Signal(),
      viewPortCameraChanged: new Signal(),
      sceneRendered: new Signal(),
    };
    this.target = target;
    this.container = new Container(this);
    this.scene = initScene();
    this.sceneHelper = initScene();

    this.cameras = {
      orthographic: initOrthographicCamera(),
      perspective: initPerspectiveCamera(),
    };
    this.viewPortCamera = this.cameras.orthographic;

    this.selector = new Selector(this);
    this.selected = [];
  }

  addObject(object, parent, index) {
    object.traverse((child) => {
      if (child.geometry !== undefined) this.addGeometry(child.geometry);
      if (child.material !== undefined) this.addMaterial(child.material);

      this.container.addObject(child);

      this.addCamera(object);
      // TODO
      // addHelper
    });

    if (parent === undefined) {
      this.scene.add(object);
    } else {
      if (index === undefined) {
        parent.add(object);
      } else {
        parent.children.slice(index, 0, object);
      }
      object.parent = parent;
    }

    this.signals.objectAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
    this.dispatchEvent('objectAdded', object);
  }

  addCamera(camera) {
    if (camera?.isCamera) {
      this.container.addCamera(camera);
    }
  }

  addGeometry(geometry) {
    this.container.addGeometry(geometry);
  }

  addMaterial(geometry) {
    this.container.addMaterial(geometry);
  }

  removeObject(object) {
    this.scene.remove(object);
  }

  getObjectByUUID(uuid, isGlobal = false) {
    return isGlobal
      ? this.scene.getObjectByProperty('uuid', uuid)
      : this.container.getObjectByUUID(uuid);
  }

  getObjectsByProperty(key, value) {
    let result = this.scene.getObjectsByProperty(key, value);
    const sceneHelperResult = this.sceneHelper.getObjectsByProperty(key, value);
    if (sceneHelperResult.length > 0) {
      result = result.concat(sceneHelperResult);
    }

    return result;
  }

  toggleViewportCamera() {
    const { orthographic, perspective } = this.cameras;

    if (orthographic === this.viewPortCamera) {
      this.viewPortCamera = perspective;
    } else {
      this.viewPortCamera = orthographic;
    }
    this.signals.viewPortCameraChanged.dispatch();

    this.signals.sceneGraphChanged.dispatch();
  }

  setState(key, value) {
    this.state[key] = value;
  }

  getState(key) {
    return this.state[key];
  }

  select(object) {
    if (Array.isArray(object)) {
      this.selector.select(object.map((obj) => obj?.uuid));
    } else {
      this.selector.select([object?.uuid]);
    }
  }
}

/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 01:16:17
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/CoordinateHelper.js
 */

class CoordinateHelper extends Group {
  constructor(colors = { x: 'red', y: 'green', z: 'blue' }, axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    super();
    this.colors = colors;
    this.axesLength = axesLength;
    this.arrowsLength = arrowsLength;
    this.arrowsWidth = arrowsWidth;
    this.type = 'CoordinateHelper';
    const pos = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const origin = new Vector3();
    ['x', 'y', 'z'].forEach((key) => {
      const arrow = new ArrowHelper(new Vector3(...pos[key]), origin, axesLength, colors[key], arrowsLength, arrowsWidth);
      arrow.renderOrder = Infinity;
      this.add(arrow);
    });
    this.isHelper = true;
  }

  setLength(axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    this.traverse((child) => {
      child.setLength(axesLength, arrowsLength, arrowsWidth);
    });
  }

  dispose() {
    this.traverse((child) => {
      child.dispose();
    });
  }
}

/*
 * @Date: 2023-02-27 11:55:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 18:14:40
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/src/CustomGridHelper.js
 */

class CustomGridHelper extends LineSegments {
  constructor(width = 10, height = 10, division = 1, splice = 1, centerColor = 0xaaaaaa, baseColor = 0xdfdfdf, divisionColor = 0xeeeeee) {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({ vertexColors: true, toneMapped: false });
    super(geometry, material);
    this.type = 'CustomGridHelper';
    this.centerColor = new Color(centerColor);
    this.baseColor = new Color(baseColor);
    this.divisionColor = new Color(divisionColor);

    this.width = width;
    this.height = height;
    this.division = division;
    this.splice = splice;

    this.update();
  }

  update() {
    let delta;
    if (this.splice === 1) {
      delta = 1;
    } else {
      delta = 1 / this.splice;
    }

    const {
      centerColor, baseColor, divisionColor, width, height, splice, division,
    } = this;
    const [timesX, timesY] = [width / division * splice, height / division * splice];

    const vertices = [];
    const colors = [];
    let color; let j10; let isCenter; let c = 0;

    function loop(half, center, times, delta, axis) {
      const o = {};
      o.x = (k, half) => vertices.push(-half, k, 0, half, k, 0);
      o.y = (k, half) => vertices.push(k, -half, 0, k, half, 0);
      for (let j = 0, k = -half; j <= times; j++, k += delta) {
        o[axis](k, half);
        j10 = j % splice === 0;
        isCenter = j === center;

        color = divisionColor;
        if (isCenter) {
          color = centerColor;
        } else if (j10 && !isCenter) {
          color = baseColor;
        }

        color.toArray(colors, c); c += 3;
        color.toArray(colors, c); c += 3;
      }
    }

    loop(width / 2, timesX / 2, timesX, delta, 'x');
    loop(height / 2, timesY / 2, timesY, delta, 'y');

    this.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    this.geometry.attributes.position.needUpdate = true;
    this.geometry.attributes.color.needUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

let ViewHelper$1 = class ViewHelper extends Object3D {
  constructor(camera, domElement) {
    super();

    this.object = camera;

    this.isViewHelper = true;

    this.animating = false;
    this.center = new Vector3();

    const color1 = new Color('#ff3653');
    const color2 = new Color('#8adb00');
    const color3 = new Color('#2c8fff');

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

    const posXAxisHelper = new Sprite(getSpriteMaterial(color1, 'X'));
    posXAxisHelper.userData.type = 'posX';
    const posYAxisHelper = new Sprite(getSpriteMaterial(color2, 'Y'));
    posYAxisHelper.userData.type = 'posY';
    const posZAxisHelper = new Sprite(getSpriteMaterial(color3, 'Z'));
    posZAxisHelper.userData.type = 'posZ';
    const negXAxisHelper = new Sprite(getSpriteMaterial(color1));
    negXAxisHelper.userData.type = 'negX';
    const negYAxisHelper = new Sprite(getSpriteMaterial(color2));
    negYAxisHelper.userData.type = 'negY';
    const negZAxisHelper = new Sprite(getSpriteMaterial(color3));
    negZAxisHelper.userData.type = 'negZ';

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
    const turnRate = 2 * Math.PI; // turn rate in angles per second

    const q1 = new Quaternion();
    const q2 = new Quaternion();
    const viewport = new Vector4();
    let radius = 0;

    this.render = function (renderer) {
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

      //

      const x = domElement.offsetWidth - dim;

      renderer.clearDepth();

      renderer.getViewport(viewport);
      renderer.setViewport(x, 0, dim, dim);

      renderer.render(this, orthoCamera);

      renderer.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);
    };

    const targetPosition = new Vector3();
    const targetQuaternion = new Quaternion();

    this.handleClick = function (event) {
      if (this.animating === true) return false;

      const rect = domElement.getBoundingClientRect();
      const offsetX = rect.left + (domElement.offsetWidth - dim);
      const offsetY = rect.top + (domElement.offsetHeight - dim);
      mouse.x = ((event.clientX - offsetX) / (rect.right - offsetX)) * 2 - 1;
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

    this.update = function (delta) {
      const step = delta * turnRate;

      // animate position by doing a slerp and then scaling the position on the unit sphere

      q1.rotateTowards(q2, step);
      this.object.position.set(0, 0, 1).applyQuaternion(q1).multiplyScalar(radius).add(this.center);

      // animate orientation

      this.object.quaternion.rotateTowards(targetQuaternion, step);

      if (q1.angleTo(q2) === 0) {
        this.animating = false;
      }
    };

    this.dispose = function () {
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

    function prepareAnimationData(object, focusPoint, camera) {
      switch (object.userData.type) {
        case 'posX':
          targetPosition.set(1, 0, 0);
          targetQuaternion.setFromEuler(new Euler(0, Math.PI * 0.5, 0));
          break;

        case 'posY':
          targetPosition.set(0, 1, 0);
          targetQuaternion.setFromEuler(new Euler(-Math.PI * 0.5, 0, 0));
          break;

        case 'posZ':
          targetPosition.set(0, 0, 1);
          targetQuaternion.setFromEuler(new Euler());
          break;

        case 'negX':
          targetPosition.set(-1, 0, 0);
          targetQuaternion.setFromEuler(new Euler(0, -Math.PI * 0.5, 0));
          break;

        case 'negY':
          targetPosition.set(0, -1, 0);
          targetQuaternion.setFromEuler(new Euler(Math.PI * 0.5, 0, 0));
          break;

        case 'negZ':
          targetPosition.set(0, 0, -1);
          targetQuaternion.setFromEuler(new Euler(0, Math.PI, 0));
          break;

        default:
          console.error('ViewHelper: Invalid axis.');
      }

      //

      radius = camera.position.distanceTo(focusPoint);
      targetPosition.multiplyScalar(radius).add(focusPoint);

      dummy.position.copy(focusPoint);

      dummy.lookAt(camera.position);
      q1.copy(dummy.quaternion);

      dummy.lookAt(targetPosition);
      q2.copy(dummy.quaternion);
    }

    function getAxisMaterial(color) {
      return new MeshBasicMaterial({ color, toneMapped: false });
    }

    function getSpriteMaterial(color, text = null) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;

      const context = canvas.getContext('2d');
      context.beginPath();
      context.arc(32, 32, 16, 0, 2 * Math.PI);
      context.closePath();
      context.fillStyle = color.getStyle();
      context.fill();

      if (text !== null) {
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillStyle = '#000000';
        context.fillText(text, 32, 41);
      }

      const texture = new CanvasTexture(canvas);

      return new SpriteMaterial({ map: texture, toneMapped: false });
    }
  }
};

/* eslint-disable max-classes-per-file */
/*
 * @Date: 2023-06-29 15:12:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 18:12:14
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/ui.js
 */
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
        console.warn(
          'UIElement : ',
          uiElement,
          ' is not an instance of UIElement',
        );
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
          'UIElement : ',
          uiElement,
          ' is not an instance of UIElement',
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
    this.domElement.style.display = 'block';
  }

  hide() {
    this.domElement.style.display = 'none';
  }
}

class UIDiv extends UIElement {
  constructor() {
    super(createElement('div'));
  }
}

class UISpan extends UIElement {
  constructor() {
    super(createElement('span'));
  }
}

class UIText extends UISpan {
  constructor() {
    super();
    this.domElement.className = 'UIText';
    this.domElement.style.cursor = 'default';
    this.domElement.style.display = 'inline-block';
    this.domElement.style.fontSize = '12px';
  }
}

class UIBreak extends UIElement {
  constructor() {
    super(createElement('br'));
  }
}

/*
 * @Date: 2023-06-16 00:45:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 17:03:26
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/src/ViewHelperExtend.js
 */

class ViewHelper extends ViewHelper$1 {
  constructor(editorCamera, container) {
    super(editorCamera, container);

    const dom = new UIDiv();
    dom.setId('viewHelper');
    dom.setStyle({
      position: 'absolute',
      right: '0px',
      bottom: '0px',
      height: '128px',
      width: '128px',
    });
    container.append(dom.domElement);

    dom.domElement.addEventListener('pointerup', (event) => {
      event.stopPropagation();

      this.handleClick(event);
    });

    dom.domElement.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
  }
}

/* eslint-disable eqeqeq */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent$1 = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class OrbitControls extends EventDispatcher$1 {
  constructor(object, domElement) {
    super();

    if (domElement === undefined) console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
    if (domElement === document) console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');

    this.object = object;
    this.domElement = domElement;
    this.domElement.style.touchAction = 'none'; // disable touch scroll

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to enable dollying(zooming) with the follow of the mouse pointer on screen.
    this.zoomToCursor = false;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

    // The four arrow keys
    this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

    // Mouse buttons
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

    // Touch fingers
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    // the target DOM element for key events
    this._domElementKeyEvents = null;

    //
    // public methods
    //

    this.getPolarAngle = function() {
      return spherical.phi;
    };

    this.getAzimuthalAngle = function() {
      return spherical.theta;
    };

    this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    };

    this.listenToKeyEvents = function(domElement) {
      domElement.addEventListener('keydown', onKeyDown);
      this._domElementKeyEvents = domElement;
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

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = (function() {
      const offset = new Vector3();

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();

      const lastPosition = new Vector3();
      const lastQuaternion = new Quaternion();

      const twoPI = 2 * Math.PI;

      return function update() {
        const position = scope.object.position;

        offset.copy(position).sub(scope.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (scope.autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle());
        }

        if (scope.enableDamping) {
          spherical.theta += sphericalDelta.theta * scope.dampingFactor;
          spherical.phi += sphericalDelta.phi * scope.dampingFactor;
        } else {
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
        }

        // restrict theta to be between desired limits

        let min = scope.minAzimuthAngle;
        let max = scope.maxAzimuthAngle;

        if (isFinite(min) && isFinite(max)) {
          if (min < -Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

          if (max < -Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

          if (min <= max) {
            spherical.theta = Math.max(min, Math.min(max, spherical.theta));
          } else {
            spherical.theta = (spherical.theta > (min + max) / 2)
              ? Math.max(min, spherical.theta)
              : Math.min(max, spherical.theta);
          }
        }

        // restrict phi to be between desired limits
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

        spherical.makeSafe();

        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

        // move target to panned location
        if (zoomToCursorFlag == true) {
          scope.target.add(panOffset);
        } else if (scope.enableDamping === true) {
          scope.target.addScaledVector(panOffset, scope.dampingFactor);
        } else {
          scope.target.add(panOffset);
        }

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(scope.target).add(offset);

        scope.object.lookAt(scope.target);

        if (zoomToCursorFlag === true) {
          panOffset.set(0, 0, 0);
          sphericalDelta.set(0, 0, 0);
          zoomToCursorFlag = false;
        } else if (scope.enableDamping === true) {
          sphericalDelta.theta *= (1 - scope.dampingFactor);
          sphericalDelta.phi *= (1 - scope.dampingFactor);

          panOffset.multiplyScalar(1 - scope.dampingFactor);
        } else {
          sphericalDelta.set(0, 0, 0);

          panOffset.set(0, 0, 0);
        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (zoomChanged ||

					lastPosition.distanceToSquared(scope.object.position) > EPS ||
					8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          scope.dispatchEvent(_changeEvent$1);

          lastPosition.copy(scope.object.position);
          lastQuaternion.copy(scope.object.quaternion);
          zoomChanged = false;

          return true;
        }

        return false;
      };
    }());

    this.dispose = function() {
      scope.domElement.removeEventListener('contextmenu', onContextMenu);

      scope.domElement.removeEventListener('pointerdown', onPointerDown);
      scope.domElement.removeEventListener('pointercancel', onPointerCancel);
      scope.domElement.removeEventListener('wheel', onMouseWheel);

      scope.domElement.removeEventListener('pointermove', onPointerMove);
      scope.domElement.removeEventListener('pointerup', onPointerUp);

      if (scope._domElementKeyEvents !== null) {
        scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
      }

      // scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    };

    //
    // internals
    //

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

    const EPS = 0.000001;

    // current position in spherical coordinates
    const spherical = new Spherical();
    const sphericalDelta = new Spherical();

    let scale = 1;
    const panOffset = new Vector3();
    let zoomChanged = false;

    const rotateStart = new Vector2();
    const rotateEnd = new Vector2();
    const rotateDelta = new Vector2();

    const panStart = new Vector2();
    const panEnd = new Vector2();
    const panDelta = new Vector2();

    const dollyStart = new Vector2();
    const dollyEnd = new Vector2();
    const dollyDelta = new Vector2();

    const pointers = [];
    const pointerPositions = {};

    let zoomToCursorFlag = false;

    function getAutoRotationAngle() {
      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
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

    const panLeft = (function() {
      const v = new Vector3();

      return function panLeft(distance, objectMatrix) {
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        panOffset.add(v);
      };
    }());

    const panUp = (function() {
      const v = new Vector3();

      return function panUp(distance, objectMatrix) {
        if (scope.screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1);
        } else {
          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(scope.object.up, v);
        }

        v.multiplyScalar(distance);

        panOffset.add(v);
      };
    }());

    // deltaX and deltaY are in pixels; right and down are positive
    const pan = (function() {
      const offset = new Vector3();

      return function pan(deltaX, deltaY) {
        const element = scope.domElement;

        if (scope.object.isPerspectiveCamera) {
          // perspective
          const position = scope.object.position;
          offset.copy(position).sub(scope.target);
          let targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
          panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
        } else if (scope.object.isOrthographicCamera) {
          // orthographic
          panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
          panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
        } else {
          // camera neither orthographic nor perspective
          console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
          scope.enablePan = false;
        }
      };
    }());

    function dollyOut(dollyScale) {
      if (scope.object.isPerspectiveCamera) {
        scale /= dollyScale;
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
        scope.object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;
      }
    }

    function dollyIn(dollyScale) {
      if (scope.object.isPerspectiveCamera) {
        scale *= dollyScale;
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
        scope.object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;
      }
    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {
      rotateStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownDolly(event) {
      dollyStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownPan(event) {
      panStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveRotate(event) {
      rotateEnd.set(event.clientX, event.clientY);

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

      const element = scope.domElement;

      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

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

    function zoomToCursor(event) {
      const x = (event.offsetX / scope.domElement.clientWidth) * 2 - 1;
      const y = -(event.offsetY / scope.domElement.clientHeight) * 2 + 1;
      const v = new Vector3(x, y, 0);

      v.unproject(scope.object);
      v.sub(scope.object.position).setLength(scope.zoomSpeed * 10); // it needs more speed here;

      if (scope.object.isPerspectiveCamera) {
        if (event.deltaY < 0) {
          scope.object.position.add(v);
          scope.target.add(v);
        } else {
          scope.object.position.sub(v);
          scope.target.sub(v);
        }
      } else if (scope.object.isOrthographicCamera) {
        const dom = scope.domElement;
        const domOffset = dom.getBoundingClientRect();
        const centerX = dom.clientWidth * 0.5;
        const centerY = dom.clientHeight * 0.5;
        const panOffsetX = (event.clientX - centerX - domOffset.left) * (1 - 1 / getZoomScale());
        const panOffsetY = (event.clientY - centerY - domOffset.top) * (1 - 1 / getZoomScale());

        if (event.deltaY < 0) {
          dollyIn(getZoomScale());
          pan(panOffsetX, panOffsetY);
        } else {
          dollyOut(getZoomScale());
          pan(-panOffsetX, -panOffsetY);
        }

        zoomToCursorFlag = true;
      }
    }

    function notZoomToCursor(event) {
      if (event.deltaY < 0) {
        dollyIn(getZoomScale());
      } else if (event.deltaY > 0) {
        dollyOut(getZoomScale());
      }
    }

    function handleMouseWheel(event) {
      if (scope.zoomToCursor) {
        zoomToCursor(event);
      } else {
        notZoomToCursor(event);
      }

      scope.update();
    }

    function handleKeyDown(event) {
      let needsUpdate = false;

      switch (event.code) {
        case scope.keys.UP:
          pan(0, scope.keyPanSpeed);
          needsUpdate = true;
          break;

        case scope.keys.BOTTOM:
          pan(0, -scope.keyPanSpeed);
          needsUpdate = true;
          break;

        case scope.keys.LEFT:
          pan(scope.keyPanSpeed, 0);
          needsUpdate = true;
          break;

        case scope.keys.RIGHT:
          pan(-scope.keyPanSpeed, 0);
          needsUpdate = true;
          break;
      }

      if (needsUpdate) {
        // prevent the browser from scrolling on cursor keys
        event.preventDefault();

        scope.update();
      }
    }

    function handleTouchStartRotate() {
      if (pointers.length === 1) {
        rotateStart.set(pointers[ 0 ].pageX, pointers[ 0 ].pageY);
      } else {
        const x = 0.5 * (pointers[ 0 ].pageX + pointers[ 1 ].pageX);
        const y = 0.5 * (pointers[ 0 ].pageY + pointers[ 1 ].pageY);

        rotateStart.set(x, y);
      }
    }

    function handleTouchStartPan() {
      if (pointers.length === 1) {
        panStart.set(pointers[ 0 ].pageX, pointers[ 0 ].pageY);
      } else {
        const x = 0.5 * (pointers[ 0 ].pageX + pointers[ 1 ].pageX);
        const y = 0.5 * (pointers[ 0 ].pageY + pointers[ 1 ].pageY);

        panStart.set(x, y);
      }
    }

    function handleTouchStartDolly() {
      const dx = pointers[ 0 ].pageX - pointers[ 1 ].pageX;
      const dy = pointers[ 0 ].pageY - pointers[ 1 ].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);
    }

    function handleTouchStartDollyPan() {
      if (scope.enableZoom) handleTouchStartDolly();

      if (scope.enablePan) handleTouchStartPan();
    }

    function handleTouchStartDollyRotate() {
      if (scope.enableZoom) handleTouchStartDolly();

      if (scope.enableRotate) handleTouchStartRotate();
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

      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

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
      if (scope.enableZoom) handleTouchMoveDolly(event);

      if (scope.enablePan) handleTouchMovePan(event);
    }

    function handleTouchMoveDollyRotate(event) {
      if (scope.enableZoom) handleTouchMoveDolly(event);

      if (scope.enableRotate) handleTouchMoveRotate(event);
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onPointerDown(event) {
      if (scope.enabled === false) return;

      if (pointers.length === 0) {
        scope.domElement.setPointerCapture(event.pointerId);

        scope.domElement.addEventListener('pointermove', onPointerMove);
        scope.domElement.addEventListener('pointerup', onPointerUp);
      }

      //

      addPointer(event);

      if (event.pointerType === 'touch') {
        onTouchStart(event);
      } else {
        onMouseDown(event);
      }
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return;

      if (event.pointerType === 'touch') {
        onTouchMove(event);
      } else {
        onMouseMove(event);
      }
    }

    function onPointerUp(event) {
      removePointer(event);
      if (pointers.length === 0) {
        scope.domElement.releasePointerCapture(event.pointerId);
        scope.domElement.removeEventListener('pointermove', onPointerMove);
        scope.domElement.removeEventListener('pointerup', onPointerUp);
      }
      scope.dispatchEvent(_endEvent);
      state = STATE.NONE;
    }

    function onPointerCancel(event) {
      removePointer(event);
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

          if (scope.enableZoom === false) return;

          handleMouseDownDolly(event);

          state = STATE.DOLLY;

          break;

        case MOUSE.ROTATE:

          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enablePan === false) return;

            handleMouseDownPan(event);

            state = STATE.PAN;
          } else {
            if (scope.enableRotate === false) return;

            handleMouseDownRotate(event);

            state = STATE.ROTATE;
          }

          break;

        case MOUSE.PAN:

          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enableRotate === false) return;

            handleMouseDownRotate(event);

            state = STATE.ROTATE;
          } else {
            if (scope.enablePan === false) return;

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
      if (scope.enabled === false) return;

      switch (state) {
        case STATE.ROTATE:

          if (scope.enableRotate === false) return;

          handleMouseMoveRotate(event);

          break;

        case STATE.DOLLY:

          if (scope.enableZoom === false) return;

          handleMouseMoveDolly(event);

          break;

        case STATE.PAN:

          if (scope.enablePan === false) return;

          handleMouseMovePan(event);

          break;
      }
    }

    function onMouseWheel(event) {
      if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE) return;

      event.preventDefault();

      scope.dispatchEvent(_startEvent);

      handleMouseWheel(event);

      scope.dispatchEvent(_endEvent);
    }

    function onKeyDown(event) {
      if (scope.enabled === false || scope.enablePan === false) return;

      handleKeyDown(event);
    }

    function onTouchStart(event) {
      trackPointer(event);

      switch (pointers.length) {
        case 1:

          switch (scope.touches.ONE) {
            case TOUCH.ROTATE:

              if (scope.enableRotate === false) return;

              handleTouchStartRotate();

              state = STATE.TOUCH_ROTATE;

              break;

            case TOUCH.PAN:

              if (scope.enablePan === false) return;

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

              if (scope.enableZoom === false && scope.enablePan === false) return;

              handleTouchStartDollyPan();

              state = STATE.TOUCH_DOLLY_PAN;

              break;

            case TOUCH.DOLLY_ROTATE:

              if (scope.enableZoom === false && scope.enableRotate === false) return;

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

          if (scope.enableRotate === false) return;

          handleTouchMoveRotate(event);

          scope.update();

          break;

        case STATE.TOUCH_PAN:

          if (scope.enablePan === false) return;

          handleTouchMovePan(event);

          scope.update();

          break;

        case STATE.TOUCH_DOLLY_PAN:

          if (scope.enableZoom === false && scope.enablePan === false) return;

          handleTouchMoveDollyPan(event);

          scope.update();

          break;

        case STATE.TOUCH_DOLLY_ROTATE:

          if (scope.enableZoom === false && scope.enableRotate === false) return;

          handleTouchMoveDollyRotate(event);

          scope.update();

          break;

        default:

          state = STATE.NONE;
      }
    }

    function onContextMenu(event) {
      if (scope.enabled === false) return;

      event.preventDefault();
    }

    function addPointer(event) {
      pointers.push(event);
    }

    function removePointer(event) {
      delete pointerPositions[ event.pointerId ];

      for (let i = 0; i < pointers.length; i++) {
        if (pointers[ i ].pointerId == event.pointerId) {
          pointers.splice(i, 1);
          return;
        }
      }
    }

    function trackPointer(event) {
      let position = pointerPositions[ event.pointerId ];

      if (position === undefined) {
        position = new Vector2();
        pointerPositions[ event.pointerId ] = position;
      }

      position.set(event.pageX, event.pageY);
    }

    function getSecondPointerPosition(event) {
      const pointer = (event.pointerId === pointers[ 0 ].pointerId) ? pointers[ 1 ] : pointers[ 0 ];

      return pointerPositions[ pointer.pointerId ];
    }

    //

    scope.domElement.addEventListener('contextmenu', onContextMenu);

    scope.domElement.addEventListener('pointerdown', onPointerDown);
    scope.domElement.addEventListener('pointercancel', onPointerCancel);
    scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

    // force an update at start

    this.update();
  }
}

const _raycaster = new Raycaster();

const _tempVector = new Vector3();
const _tempVector2 = new Vector3();
const _tempQuaternion = new Quaternion();
const _unit = {
	X: new Vector3( 1, 0, 0 ),
	Y: new Vector3( 0, 1, 0 ),
	Z: new Vector3( 0, 0, 1 )
};

const _changeEvent = { type: 'change' };
const _mouseDownEvent = { type: 'mouseDown' };
const _mouseUpEvent = { type: 'mouseUp', mode: null };
const _objectChangeEvent = { type: 'objectChange' };

class TransformControls extends Object3D {

	constructor( camera, domElement ) {

		super();

		if ( domElement === undefined ) {

			console.warn( 'THREE.TransformControls: The second parameter "domElement" is now mandatory.' );
			domElement = document;

		}

		this.isTransformControls = true;

		this.visible = false;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		const _gizmo = new TransformControlsGizmo();
		this._gizmo = _gizmo;
		this.add( _gizmo );

		const _plane = new TransformControlsPlane();
		this._plane = _plane;
		this.add( _plane );

		const scope = this;

		// Defined getter, setter and store for a property
		function defineProperty( propName, defaultValue ) {

			let propValue = defaultValue;

			Object.defineProperty( scope, propName, {

				get: function () {

					return propValue !== undefined ? propValue : defaultValue;

				},

				set: function ( value ) {

					if ( propValue !== value ) {

						propValue = value;
						_plane[ propName ] = value;
						_gizmo[ propName ] = value;

						scope.dispatchEvent( { type: propName + '-changed', value: value } );
						scope.dispatchEvent( _changeEvent );

					}

				}

			} );

			scope[ propName ] = defaultValue;
			_plane[ propName ] = defaultValue;
			_gizmo[ propName ] = defaultValue;

		}

		// Define properties with getters/setter
		// Setting the defined property will automatically trigger change event
		// Defined properties are passed down to gizmo and plane

		defineProperty( 'camera', camera );
		defineProperty( 'object', undefined );
		defineProperty( 'enabled', true );
		defineProperty( 'axis', null );
		defineProperty( 'mode', 'translate' );
		defineProperty( 'translationSnap', null );
		defineProperty( 'rotationSnap', null );
		defineProperty( 'scaleSnap', null );
		defineProperty( 'space', 'world' );
		defineProperty( 'size', 1 );
		defineProperty( 'dragging', false );
		defineProperty( 'showX', true );
		defineProperty( 'showY', true );
		defineProperty( 'showZ', true );

		// Reusable utility variables

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

		// TODO: remove properties unused in plane and gizmo

		defineProperty( 'worldPosition', worldPosition );
		defineProperty( 'worldPositionStart', worldPositionStart );
		defineProperty( 'worldQuaternion', worldQuaternion );
		defineProperty( 'worldQuaternionStart', worldQuaternionStart );
		defineProperty( 'cameraPosition', cameraPosition );
		defineProperty( 'cameraQuaternion', cameraQuaternion );
		defineProperty( 'pointStart', pointStart );
		defineProperty( 'pointEnd', pointEnd );
		defineProperty( 'rotationAxis', rotationAxis );
		defineProperty( 'rotationAngle', rotationAngle );
		defineProperty( 'eye', eye );

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

		this._getPointer = getPointer.bind( this );
		this._onPointerDown = onPointerDown.bind( this );
		this._onPointerHover = onPointerHover.bind( this );
		this._onPointerMove = onPointerMove.bind( this );
		this._onPointerUp = onPointerUp.bind( this );

		this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.addEventListener( 'pointermove', this._onPointerHover );
		this.domElement.addEventListener( 'pointerup', this._onPointerUp );

	}

	// updateMatrixWorld  updates key transformation variables
	updateMatrixWorld() {

		if ( this.object !== undefined ) {

			this.object.updateMatrixWorld();

			if ( this.object.parent === null ) {

				console.error( 'TransformControls: The attached 3D object must be a part of the scene graph.' );

			} else {

				this.object.parent.matrixWorld.decompose( this._parentPosition, this._parentQuaternion, this._parentScale );

			}

			this.object.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this._worldScale );

			this._parentQuaternionInv.copy( this._parentQuaternion ).invert();
			this._worldQuaternionInv.copy( this.worldQuaternion ).invert();

		}

		this.camera.updateMatrixWorld();
		this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this._cameraScale );

		if ( this.camera.isOrthographicCamera ) {

			this.camera.getWorldDirection( this.eye ).negate();

		} else {

			this.eye.copy( this.cameraPosition ).sub( this.worldPosition ).normalize();

		}

		super.updateMatrixWorld( this );

	}

	pointerHover( pointer ) {

		if ( this.object === undefined || this.dragging === true ) return;

		_raycaster.setFromCamera( pointer, this.camera );

		const intersect = intersectObjectWithRay( this._gizmo.picker[ this.mode ], _raycaster );

		if ( intersect ) {

			this.axis = intersect.object.name;

		} else {

			this.axis = null;

		}

	}

	pointerDown( pointer ) {

		if ( this.object === undefined || this.dragging === true || pointer.button !== 0 ) return;

		if ( this.axis !== null ) {

			_raycaster.setFromCamera( pointer, this.camera );

			const planeIntersect = intersectObjectWithRay( this._plane, _raycaster, true );

			if ( planeIntersect ) {

				this.object.updateMatrixWorld();
				this.object.parent.updateMatrixWorld();

				this._positionStart.copy( this.object.position );
				this._quaternionStart.copy( this.object.quaternion );
				this._scaleStart.copy( this.object.scale );

				this.object.matrixWorld.decompose( this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart );

				this.pointStart.copy( planeIntersect.point ).sub( this.worldPositionStart );

			}

			this.dragging = true;
			_mouseDownEvent.mode = this.mode;
			this.dispatchEvent( _mouseDownEvent );

		}

	}

	pointerMove( pointer ) {

		const axis = this.axis;
		const mode = this.mode;
		const object = this.object;
		let space = this.space;

		if ( mode === 'scale' ) {

			space = 'local';

		} else if ( axis === 'E' || axis === 'XYZE' || axis === 'XYZ' ) {

			space = 'world';

		}

		if ( object === undefined || axis === null || this.dragging === false || pointer.button !== - 1 ) return;

		_raycaster.setFromCamera( pointer, this.camera );

		const planeIntersect = intersectObjectWithRay( this._plane, _raycaster, true );

		if ( ! planeIntersect ) return;

		this.pointEnd.copy( planeIntersect.point ).sub( this.worldPositionStart );

		if ( mode === 'translate' ) {

			// Apply translate

			this._offset.copy( this.pointEnd ).sub( this.pointStart );

			if ( space === 'local' && axis !== 'XYZ' ) {

				this._offset.applyQuaternion( this._worldQuaternionInv );

			}

			if ( axis.indexOf( 'X' ) === - 1 ) this._offset.x = 0;
			if ( axis.indexOf( 'Y' ) === - 1 ) this._offset.y = 0;
			if ( axis.indexOf( 'Z' ) === - 1 ) this._offset.z = 0;

			if ( space === 'local' && axis !== 'XYZ' ) {

				this._offset.applyQuaternion( this._quaternionStart ).divide( this._parentScale );

			} else {

				this._offset.applyQuaternion( this._parentQuaternionInv ).divide( this._parentScale );

			}

			object.position.copy( this._offset ).add( this._positionStart );

			// Apply translation snap

			if ( this.translationSnap ) {

				if ( space === 'local' ) {

					object.position.applyQuaternion( _tempQuaternion.copy( this._quaternionStart ).invert() );

					if ( axis.search( 'X' ) !== - 1 ) {

						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Y' ) !== - 1 ) {

						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Z' ) !== - 1 ) {

						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

					}

					object.position.applyQuaternion( this._quaternionStart );

				}

				if ( space === 'world' ) {

					if ( object.parent ) {

						object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );

					}

					if ( axis.search( 'X' ) !== - 1 ) {

						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Y' ) !== - 1 ) {

						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Z' ) !== - 1 ) {

						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

					}

					if ( object.parent ) {

						object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );

					}

				}

			}

		} else if ( mode === 'scale' ) {

			if ( axis.search( 'XYZ' ) !== - 1 ) {

				let d = this.pointEnd.length() / this.pointStart.length();

				if ( this.pointEnd.dot( this.pointStart ) < 0 ) d *= - 1;

				_tempVector2.set( d, d, d );

			} else {

				_tempVector.copy( this.pointStart );
				_tempVector2.copy( this.pointEnd );

				_tempVector.applyQuaternion( this._worldQuaternionInv );
				_tempVector2.applyQuaternion( this._worldQuaternionInv );

				_tempVector2.divide( _tempVector );

				if ( axis.search( 'X' ) === - 1 ) {

					_tempVector2.x = 1;

				}

				if ( axis.search( 'Y' ) === - 1 ) {

					_tempVector2.y = 1;

				}

				if ( axis.search( 'Z' ) === - 1 ) {

					_tempVector2.z = 1;

				}

			}

			// Apply scale

			object.scale.copy( this._scaleStart ).multiply( _tempVector2 );

			if ( this.scaleSnap ) {

				if ( axis.search( 'X' ) !== - 1 ) {

					object.scale.x = Math.round( object.scale.x / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

				}

				if ( axis.search( 'Y' ) !== - 1 ) {

					object.scale.y = Math.round( object.scale.y / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

				}

				if ( axis.search( 'Z' ) !== - 1 ) {

					object.scale.z = Math.round( object.scale.z / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

				}

			}

		} else if ( mode === 'rotate' ) {

			this._offset.copy( this.pointEnd ).sub( this.pointStart );

			const ROTATION_SPEED = 20 / this.worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );

			if ( axis === 'E' ) {

				this.rotationAxis.copy( this.eye );
				this.rotationAngle = this.pointEnd.angleTo( this.pointStart );

				this._startNorm.copy( this.pointStart ).normalize();
				this._endNorm.copy( this.pointEnd ).normalize();

				this.rotationAngle *= ( this._endNorm.cross( this._startNorm ).dot( this.eye ) < 0 ? 1 : - 1 );

			} else if ( axis === 'XYZE' ) {

				this.rotationAxis.copy( this._offset ).cross( this.eye ).normalize();
				this.rotationAngle = this._offset.dot( _tempVector.copy( this.rotationAxis ).cross( this.eye ) ) * ROTATION_SPEED;

			} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {

				this.rotationAxis.copy( _unit[ axis ] );

				_tempVector.copy( _unit[ axis ] );

				if ( space === 'local' ) {

					_tempVector.applyQuaternion( this.worldQuaternion );

				}

				this.rotationAngle = this._offset.dot( _tempVector.cross( this.eye ).normalize() ) * ROTATION_SPEED;

			}

			// Apply rotation snap

			if ( this.rotationSnap ) this.rotationAngle = Math.round( this.rotationAngle / this.rotationSnap ) * this.rotationSnap;

			// Apply rotate
			if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {

				object.quaternion.copy( this._quaternionStart );
				object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) ).normalize();

			} else {

				this.rotationAxis.applyQuaternion( this._parentQuaternionInv );
				object.quaternion.copy( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) );
				object.quaternion.multiply( this._quaternionStart ).normalize();

			}

		}

		this.dispatchEvent( _changeEvent );
		this.dispatchEvent( _objectChangeEvent );

	}

	pointerUp( pointer ) {

		if ( pointer.button !== 0 ) return;

		if ( this.dragging && ( this.axis !== null ) ) {

			_mouseUpEvent.mode = this.mode;
			this.dispatchEvent( _mouseUpEvent );

		}

		this.dragging = false;
		this.axis = null;

	}

	dispose() {

		this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this.domElement.removeEventListener( 'pointermove', this._onPointerHover );
		this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this.domElement.removeEventListener( 'pointerup', this._onPointerUp );

		this.traverse( function ( child ) {

			if ( child.geometry ) child.geometry.dispose();
			if ( child.material ) child.material.dispose();

		} );

	}

	// Set current object
	attach( object ) {

		this.object = object;
		this.visible = true;

		return this;

	}

	// Detach from object
	detach() {

		this.object = undefined;
		this.visible = false;
		this.axis = null;

		return this;

	}

	reset() {

		if ( ! this.enabled ) return;

		if ( this.dragging ) {

			this.object.position.copy( this._positionStart );
			this.object.quaternion.copy( this._quaternionStart );
			this.object.scale.copy( this._scaleStart );

			this.dispatchEvent( _changeEvent );
			this.dispatchEvent( _objectChangeEvent );

			this.pointStart.copy( this.pointEnd );

		}

	}

	getRaycaster() {

		return _raycaster;

	}

	// TODO: deprecate

	getMode() {

		return this.mode;

	}

	setMode( mode ) {

		this.mode = mode;

	}

	setTranslationSnap( translationSnap ) {

		this.translationSnap = translationSnap;

	}

	setRotationSnap( rotationSnap ) {

		this.rotationSnap = rotationSnap;

	}

	setScaleSnap( scaleSnap ) {

		this.scaleSnap = scaleSnap;

	}

	setSize( size ) {

		this.size = size;

	}

	setSpace( space ) {

		this.space = space;

	}

}

// mouse / touch event handlers

function getPointer( event ) {

	if ( this.domElement.ownerDocument.pointerLockElement ) {

		return {
			x: 0,
			y: 0,
			button: event.button
		};

	} else {

		const rect = this.domElement.getBoundingClientRect();

		return {
			x: ( event.clientX - rect.left ) / rect.width * 2 - 1,
			y: - ( event.clientY - rect.top ) / rect.height * 2 + 1,
			button: event.button
		};

	}

}

function onPointerHover( event ) {

	if ( ! this.enabled ) return;

	switch ( event.pointerType ) {

		case 'mouse':
		case 'pen':
			this.pointerHover( this._getPointer( event ) );
			break;

	}

}

function onPointerDown( event ) {

	if ( ! this.enabled ) return;

	if ( ! document.pointerLockElement ) {

		this.domElement.setPointerCapture( event.pointerId );

	}

	this.domElement.addEventListener( 'pointermove', this._onPointerMove );

	this.pointerHover( this._getPointer( event ) );
	this.pointerDown( this._getPointer( event ) );

}

function onPointerMove( event ) {

	if ( ! this.enabled ) return;

	this.pointerMove( this._getPointer( event ) );

}

function onPointerUp( event ) {

	if ( ! this.enabled ) return;

	this.domElement.releasePointerCapture( event.pointerId );

	this.domElement.removeEventListener( 'pointermove', this._onPointerMove );

	this.pointerUp( this._getPointer( event ) );

}

function intersectObjectWithRay( object, raycaster, includeInvisible ) {

	const allIntersections = raycaster.intersectObject( object, true );

	for ( let i = 0; i < allIntersections.length; i ++ ) {

		if ( allIntersections[ i ].object.visible || includeInvisible ) {

			return allIntersections[ i ];

		}

	}

	return false;

}

//

// Reusable utility variables

const _tempEuler = new Euler();
const _alignVector = new Vector3( 0, 1, 0 );
const _zeroVector = new Vector3( 0, 0, 0 );
const _lookAtMatrix = new Matrix4();
const _tempQuaternion2 = new Quaternion();
const _identityQuaternion = new Quaternion();
const _dirVector = new Vector3();
const _tempMatrix = new Matrix4();

const _unitX = new Vector3( 1, 0, 0 );
const _unitY = new Vector3( 0, 1, 0 );
const _unitZ = new Vector3( 0, 0, 1 );

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

class TransformControlsGizmo extends Object3D {

	constructor() {

		super();

		this.isTransformControlsGizmo = true;

		this.type = 'TransformControlsGizmo';

		// shared materials

		const gizmoMaterial = new MeshBasicMaterial( {
			depthTest: false,
			depthWrite: false,
			fog: false,
			toneMapped: false,
			transparent: true
		} );

		const gizmoLineMaterial = new LineBasicMaterial( {
			depthTest: false,
			depthWrite: false,
			fog: false,
			toneMapped: false,
			transparent: true
		} );

		// Make unique material for each axis/color

		const matInvisible = gizmoMaterial.clone();
		matInvisible.opacity = 0.15;

		const matHelper = gizmoLineMaterial.clone();
		matHelper.opacity = 0.5;

		const matRed = gizmoMaterial.clone();
		matRed.color.setHex( 0xff0000 );

		const matGreen = gizmoMaterial.clone();
		matGreen.color.setHex( 0x00ff00 );

		const matBlue = gizmoMaterial.clone();
		matBlue.color.setHex( 0x0000ff );

		const matRedTransparent = gizmoMaterial.clone();
		matRedTransparent.color.setHex( 0xff0000 );
		matRedTransparent.opacity = 0.5;

		const matGreenTransparent = gizmoMaterial.clone();
		matGreenTransparent.color.setHex( 0x00ff00 );
		matGreenTransparent.opacity = 0.5;

		const matBlueTransparent = gizmoMaterial.clone();
		matBlueTransparent.color.setHex( 0x0000ff );
		matBlueTransparent.opacity = 0.5;

		const matWhiteTransparent = gizmoMaterial.clone();
		matWhiteTransparent.opacity = 0.25;

		const matYellowTransparent = gizmoMaterial.clone();
		matYellowTransparent.color.setHex( 0xffff00 );
		matYellowTransparent.opacity = 0.25;

		const matYellow = gizmoMaterial.clone();
		matYellow.color.setHex( 0xffff00 );

		const matGray = gizmoMaterial.clone();
		matGray.color.setHex( 0x787878 );

		// reusable geometry

		const arrowGeometry = new CylinderGeometry( 0, 0.04, 0.1, 12 );
		arrowGeometry.translate( 0, 0.05, 0 );

		const scaleHandleGeometry = new BoxGeometry( 0.08, 0.08, 0.08 );
		scaleHandleGeometry.translate( 0, 0.04, 0 );

		const lineGeometry = new BufferGeometry();
		lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

		const lineGeometry2 = new CylinderGeometry( 0.0075, 0.0075, 0.5, 3 );
		lineGeometry2.translate( 0, 0.25, 0 );

		function CircleGeometry( radius, arc ) {

			const geometry = new TorusGeometry( radius, 0.0075, 3, 64, arc * Math.PI * 2 );
			geometry.rotateY( Math.PI / 2 );
			geometry.rotateX( Math.PI / 2 );
			return geometry;

		}

		// Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

		function TranslateHelperGeometry() {

			const geometry = new BufferGeometry();

			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );

			return geometry;

		}

		// Gizmo definitions - custom hierarchy definitions for setupGizmo() function

		const gizmoTranslate = {
			X: [
				[ new Mesh( arrowGeometry, matRed ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( arrowGeometry, matRed ), [ - 0.5, 0, 0 ], [ 0, 0, Math.PI / 2 ]],
				[ new Mesh( lineGeometry2, matRed ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]
			],
			Y: [
				[ new Mesh( arrowGeometry, matGreen ), [ 0, 0.5, 0 ]],
				[ new Mesh( arrowGeometry, matGreen ), [ 0, - 0.5, 0 ], [ Math.PI, 0, 0 ]],
				[ new Mesh( lineGeometry2, matGreen ) ]
			],
			Z: [
				[ new Mesh( arrowGeometry, matBlue ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]],
				[ new Mesh( arrowGeometry, matBlue ), [ 0, 0, - 0.5 ], [ - Math.PI / 2, 0, 0 ]],
				[ new Mesh( lineGeometry2, matBlue ), null, [ Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new Mesh( new OctahedronGeometry( 0.1, 0 ), matWhiteTransparent.clone() ), [ 0, 0, 0 ]]
			],
			XY: [
				[ new Mesh( new BoxGeometry( 0.15, 0.15, 0.01 ), matBlueTransparent.clone() ), [ 0.15, 0.15, 0 ]]
			],
			YZ: [
				[ new Mesh( new BoxGeometry( 0.15, 0.15, 0.01 ), matRedTransparent.clone() ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new Mesh( new BoxGeometry( 0.15, 0.15, 0.01 ), matGreenTransparent.clone() ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]
			]
		};

		const pickerTranslate = {
			X: [
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0.3, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ - 0.3, 0, 0 ], [ 0, 0, Math.PI / 2 ]]
			],
			Y: [
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0.3, 0 ]],
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, - 0.3, 0 ], [ 0, 0, Math.PI ]]
			],
			Z: [
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, 0.3 ], [ Math.PI / 2, 0, 0 ]],
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, - 0.3 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new Mesh( new OctahedronGeometry( 0.2, 0 ), matInvisible ) ]
			],
			XY: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0.15, 0 ]]
			],
			YZ: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]
			]
		};

		const helperTranslate = {
			START: [
				[ new Mesh( new OctahedronGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
			],
			END: [
				[ new Mesh( new OctahedronGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
			],
			DELTA: [
				[ new Line( TranslateHelperGeometry(), matHelper ), null, null, null, 'helper' ]
			],
			X: [
				[ new Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			],
			Y: [
				[ new Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
			],
			Z: [
				[ new Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		const gizmoRotate = {
			XYZE: [
				[ new Mesh( CircleGeometry( 0.5, 1 ), matGray ), null, [ 0, Math.PI / 2, 0 ]]
			],
			X: [
				[ new Mesh( CircleGeometry( 0.5, 0.5 ), matRed ) ]
			],
			Y: [
				[ new Mesh( CircleGeometry( 0.5, 0.5 ), matGreen ), null, [ 0, 0, - Math.PI / 2 ]]
			],
			Z: [
				[ new Mesh( CircleGeometry( 0.5, 0.5 ), matBlue ), null, [ 0, Math.PI / 2, 0 ]]
			],
			E: [
				[ new Mesh( CircleGeometry( 0.75, 1 ), matYellowTransparent ), null, [ 0, Math.PI / 2, 0 ]]
			]
		};

		const helperRotate = {
			AXIS: [
				[ new Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		const pickerRotate = {
			XYZE: [
				[ new Mesh( new SphereGeometry( 0.25, 10, 8 ), matInvisible ) ]
			],
			X: [
				[ new Mesh( new TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ]],
			],
			Y: [
				[ new Mesh( new TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]],
			],
			Z: [
				[ new Mesh( new TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
			],
			E: [
				[ new Mesh( new TorusGeometry( 0.75, 0.1, 2, 24 ), matInvisible ) ]
			]
		};

		const gizmoScale = {
			X: [
				[ new Mesh( scaleHandleGeometry, matRed ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( lineGeometry2, matRed ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( scaleHandleGeometry, matRed ), [ - 0.5, 0, 0 ], [ 0, 0, Math.PI / 2 ]],
			],
			Y: [
				[ new Mesh( scaleHandleGeometry, matGreen ), [ 0, 0.5, 0 ]],
				[ new Mesh( lineGeometry2, matGreen ) ],
				[ new Mesh( scaleHandleGeometry, matGreen ), [ 0, - 0.5, 0 ], [ 0, 0, Math.PI ]],
			],
			Z: [
				[ new Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]],
				[ new Mesh( lineGeometry2, matBlue ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]],
				[ new Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, - 0.5 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XY: [
				[ new Mesh( new BoxGeometry( 0.15, 0.15, 0.01 ), matBlueTransparent ), [ 0.15, 0.15, 0 ]]
			],
			YZ: [
				[ new Mesh( new BoxGeometry( 0.15, 0.15, 0.01 ), matRedTransparent ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new Mesh( new BoxGeometry( 0.15, 0.15, 0.01 ), matGreenTransparent ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new Mesh( new BoxGeometry( 0.1, 0.1, 0.1 ), matWhiteTransparent.clone() ) ],
			]
		};

		const pickerScale = {
			X: [
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0.3, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ - 0.3, 0, 0 ], [ 0, 0, Math.PI / 2 ]]
			],
			Y: [
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0.3, 0 ]],
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, - 0.3, 0 ], [ 0, 0, Math.PI ]]
			],
			Z: [
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, 0.3 ], [ Math.PI / 2, 0, 0 ]],
				[ new Mesh( new CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, - 0.3 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XY: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0.15, 0 ]],
			],
			YZ: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]],
			],
			XZ: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]],
			],
			XYZ: [
				[ new Mesh( new BoxGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 0, 0 ]],
			]
		};

		const helperScale = {
			X: [
				[ new Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			],
			Y: [
				[ new Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
			],
			Z: [
				[ new Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		// Creates an Object3D with gizmos described in custom hierarchy definition.

		function setupGizmo( gizmoMap ) {

			const gizmo = new Object3D();

			for ( const name in gizmoMap ) {

				for ( let i = gizmoMap[ name ].length; i --; ) {

					const object = gizmoMap[ name ][ i ][ 0 ].clone();
					const position = gizmoMap[ name ][ i ][ 1 ];
					const rotation = gizmoMap[ name ][ i ][ 2 ];
					const scale = gizmoMap[ name ][ i ][ 3 ];
					const tag = gizmoMap[ name ][ i ][ 4 ];

					// name and tag properties are essential for picking and updating logic.
					object.name = name;
					object.tag = tag;

					if ( position ) {

						object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );

					}

					if ( rotation ) {

						object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

					}

					if ( scale ) {

						object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

					}

					object.updateMatrix();

					const tempGeometry = object.geometry.clone();
					tempGeometry.applyMatrix4( object.matrix );
					object.geometry = tempGeometry;
					object.renderOrder = Infinity;

					object.position.set( 0, 0, 0 );
					object.rotation.set( 0, 0, 0 );
					object.scale.set( 1, 1, 1 );

					gizmo.add( object );

				}

			}

			return gizmo;

		}

		// Gizmo creation

		this.gizmo = {};
		this.picker = {};
		this.helper = {};

		this.add( this.gizmo[ 'translate' ] = setupGizmo( gizmoTranslate ) );
		this.add( this.gizmo[ 'rotate' ] = setupGizmo( gizmoRotate ) );
		this.add( this.gizmo[ 'scale' ] = setupGizmo( gizmoScale ) );
		this.add( this.picker[ 'translate' ] = setupGizmo( pickerTranslate ) );
		this.add( this.picker[ 'rotate' ] = setupGizmo( pickerRotate ) );
		this.add( this.picker[ 'scale' ] = setupGizmo( pickerScale ) );
		this.add( this.helper[ 'translate' ] = setupGizmo( helperTranslate ) );
		this.add( this.helper[ 'rotate' ] = setupGizmo( helperRotate ) );
		this.add( this.helper[ 'scale' ] = setupGizmo( helperScale ) );

		// Pickers should be hidden always

		this.picker[ 'translate' ].visible = false;
		this.picker[ 'rotate' ].visible = false;
		this.picker[ 'scale' ].visible = false;

	}

	// updateMatrixWorld will update transformations and appearance of individual handles

	updateMatrixWorld( force ) {

		const space = ( this.mode === 'scale' ) ? 'local' : this.space; // scale always oriented to local rotation

		const quaternion = ( space === 'local' ) ? this.worldQuaternion : _identityQuaternion;

		// Show only gizmos for current transform mode

		this.gizmo[ 'translate' ].visible = this.mode === 'translate';
		this.gizmo[ 'rotate' ].visible = this.mode === 'rotate';
		this.gizmo[ 'scale' ].visible = this.mode === 'scale';

		this.helper[ 'translate' ].visible = this.mode === 'translate';
		this.helper[ 'rotate' ].visible = this.mode === 'rotate';
		this.helper[ 'scale' ].visible = this.mode === 'scale';


		let handles = [];
		handles = handles.concat( this.picker[ this.mode ].children );
		handles = handles.concat( this.gizmo[ this.mode ].children );
		handles = handles.concat( this.helper[ this.mode ].children );

		for ( let i = 0; i < handles.length; i ++ ) {

			const handle = handles[ i ];

			// hide aligned to camera

			handle.visible = true;
			handle.rotation.set( 0, 0, 0 );
			handle.position.copy( this.worldPosition );

			let factor;

			if ( this.camera.isOrthographicCamera ) {

				factor = ( this.camera.top - this.camera.bottom ) / this.camera.zoom;

			} else {

				factor = this.worldPosition.distanceTo( this.cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );

			}

			handle.scale.set( 1, 1, 1 ).multiplyScalar( factor * this.size / 4 );

			// TODO: simplify helpers and consider decoupling from gizmo

			if ( handle.tag === 'helper' ) {

				handle.visible = false;

				if ( handle.name === 'AXIS' ) {

					handle.visible = !! this.axis;

					if ( this.axis === 'X' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, 0, 0 ) );
						handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

						if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

							handle.visible = false;

						}

					}

					if ( this.axis === 'Y' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, 0, Math.PI / 2 ) );
						handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

						if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

							handle.visible = false;

						}

					}

					if ( this.axis === 'Z' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, Math.PI / 2, 0 ) );
						handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

						if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

							handle.visible = false;

						}

					}

					if ( this.axis === 'XYZE' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, Math.PI / 2, 0 ) );
						_alignVector.copy( this.rotationAxis );
						handle.quaternion.setFromRotationMatrix( _lookAtMatrix.lookAt( _zeroVector, _alignVector, _unitY ) );
						handle.quaternion.multiply( _tempQuaternion );
						handle.visible = this.dragging;

					}

					if ( this.axis === 'E' ) {

						handle.visible = false;

					}


				} else if ( handle.name === 'START' ) {

					handle.position.copy( this.worldPositionStart );
					handle.visible = this.dragging;

				} else if ( handle.name === 'END' ) {

					handle.position.copy( this.worldPosition );
					handle.visible = this.dragging;

				} else if ( handle.name === 'DELTA' ) {

					handle.position.copy( this.worldPositionStart );
					handle.quaternion.copy( this.worldQuaternionStart );
					_tempVector.set( 1e-10, 1e-10, 1e-10 ).add( this.worldPositionStart ).sub( this.worldPosition ).multiplyScalar( - 1 );
					_tempVector.applyQuaternion( this.worldQuaternionStart.clone().invert() );
					handle.scale.copy( _tempVector );
					handle.visible = this.dragging;

				} else {

					handle.quaternion.copy( quaternion );

					if ( this.dragging ) {

						handle.position.copy( this.worldPositionStart );

					} else {

						handle.position.copy( this.worldPosition );

					}

					if ( this.axis ) {

						handle.visible = this.axis.search( handle.name ) !== - 1;

					}

				}

				// If updating helper, skip rest of the loop
				continue;

			}

			// Align handles to current local or world rotation

			handle.quaternion.copy( quaternion );

			if ( this.mode === 'translate' || this.mode === 'scale' ) {

				// Hide translate and scale axis facing the camera

				const AXIS_HIDE_THRESHOLD = 0.99;
				const PLANE_HIDE_THRESHOLD = 0.2;

				if ( handle.name === 'X' ) {

					if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'Y' ) {

					if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'Z' ) {

					if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'XY' ) {

					if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'YZ' ) {

					if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'XZ' ) {

					if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

			} else if ( this.mode === 'rotate' ) {

				// Align handles to current local or world rotation

				_tempQuaternion2.copy( quaternion );
				_alignVector.copy( this.eye ).applyQuaternion( _tempQuaternion.copy( quaternion ).invert() );

				if ( handle.name.search( 'E' ) !== - 1 ) {

					handle.quaternion.setFromRotationMatrix( _lookAtMatrix.lookAt( this.eye, _zeroVector, _unitY ) );

				}

				if ( handle.name === 'X' ) {

					_tempQuaternion.setFromAxisAngle( _unitX, Math.atan2( - _alignVector.y, _alignVector.z ) );
					_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );
					handle.quaternion.copy( _tempQuaternion );

				}

				if ( handle.name === 'Y' ) {

					_tempQuaternion.setFromAxisAngle( _unitY, Math.atan2( _alignVector.x, _alignVector.z ) );
					_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );
					handle.quaternion.copy( _tempQuaternion );

				}

				if ( handle.name === 'Z' ) {

					_tempQuaternion.setFromAxisAngle( _unitZ, Math.atan2( _alignVector.y, _alignVector.x ) );
					_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );
					handle.quaternion.copy( _tempQuaternion );

				}

			}

			// Hide disabled axes
			handle.visible = handle.visible && ( handle.name.indexOf( 'X' ) === - 1 || this.showX );
			handle.visible = handle.visible && ( handle.name.indexOf( 'Y' ) === - 1 || this.showY );
			handle.visible = handle.visible && ( handle.name.indexOf( 'Z' ) === - 1 || this.showZ );
			handle.visible = handle.visible && ( handle.name.indexOf( 'E' ) === - 1 || ( this.showX && this.showY && this.showZ ) );

			// highlight selected axis

			handle.material._color = handle.material._color || handle.material.color.clone();
			handle.material._opacity = handle.material._opacity || handle.material.opacity;

			handle.material.color.copy( handle.material._color );
			handle.material.opacity = handle.material._opacity;

			if ( this.enabled && this.axis ) {

				if ( handle.name === this.axis ) {

					handle.material.color.setHex( 0xffff00 );
					handle.material.opacity = 1.0;

				} else if ( this.axis.split( '' ).some( function ( a ) {

					return handle.name === a;

				} ) ) {

					handle.material.color.setHex( 0xffff00 );
					handle.material.opacity = 1.0;

				}

			}

		}

		super.updateMatrixWorld( force );

	}

}

//

class TransformControlsPlane extends Mesh {

	constructor() {

		super(
			new PlaneGeometry( 100000, 100000, 2, 2 ),
			new MeshBasicMaterial( { visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1, toneMapped: false } )
		);

		this.isTransformControlsPlane = true;

		this.type = 'TransformControlsPlane';

	}

	updateMatrixWorld( force ) {

		let space = this.space;

		this.position.copy( this.worldPosition );

		if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation

		_v1.copy( _unitX ).applyQuaternion( space === 'local' ? this.worldQuaternion : _identityQuaternion );
		_v2.copy( _unitY ).applyQuaternion( space === 'local' ? this.worldQuaternion : _identityQuaternion );
		_v3.copy( _unitZ ).applyQuaternion( space === 'local' ? this.worldQuaternion : _identityQuaternion );

		// Align the plane for current transform mode, axis and space.

		_alignVector.copy( _v2 );

		switch ( this.mode ) {

			case 'translate':
			case 'scale':
				switch ( this.axis ) {

					case 'X':
						_alignVector.copy( this.eye ).cross( _v1 );
						_dirVector.copy( _v1 ).cross( _alignVector );
						break;
					case 'Y':
						_alignVector.copy( this.eye ).cross( _v2 );
						_dirVector.copy( _v2 ).cross( _alignVector );
						break;
					case 'Z':
						_alignVector.copy( this.eye ).cross( _v3 );
						_dirVector.copy( _v3 ).cross( _alignVector );
						break;
					case 'XY':
						_dirVector.copy( _v3 );
						break;
					case 'YZ':
						_dirVector.copy( _v1 );
						break;
					case 'XZ':
						_alignVector.copy( _v3 );
						_dirVector.copy( _v2 );
						break;
					case 'XYZ':
					case 'E':
						_dirVector.set( 0, 0, 0 );
						break;

				}

				break;
			case 'rotate':
			default:
				// special case for rotate
				_dirVector.set( 0, 0, 0 );

		}

		if ( _dirVector.length() === 0 ) {

			// If in rotate mode, make the plane parallel to camera
			this.quaternion.copy( this.cameraQuaternion );

		} else {

			_tempMatrix.lookAt( _tempVector.set( 0, 0, 0 ), _dirVector, _alignVector );

			this.quaternion.setFromRotationMatrix( _tempMatrix );

		}

		super.updateMatrixWorld( force );

	}

}

/* eslint-disable no-console */
/*
 * @Date: 2023-06-21 18:27:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-27 17:52:10
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/log.js
 */

function printInfo(key) {
  console.count(`info:${key}`);
}

function print(...msg) {
  console.log(...msg);
}

/*
 * @Date: 2023-06-29 14:57:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 18:31:38
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Stats.js
 */

class Stats {
  constructor(editor) {
    this.enable = true;

    const dom = new UISpan();
    const objectCol = new UIText();
    const verticesCol = new UIText();
    const trianglesCol = new UIText();
    const frameTimeCol = new UIText();

    dom.add(objectCol);
    dom.add(new UIBreak());
    dom.add(verticesCol);
    dom.add(new UIBreak());
    dom.add(trianglesCol);
    dom.add(new UIBreak());
    dom.add(frameTimeCol);

    dom.setStyle({
      bottom: '10px',
      left: '10px',
      position: 'absolute',
    });
    dom.setId('Stats');

    const [objLabel, vecLabel, triLabel, famLabel] = [
      'objects : ',
      'vertices : ',
      'triangles : ',
      'frameTime : ',
    ];

    objectCol.setTextContent(`${objLabel}0`);
    verticesCol.setTextContent(`${vecLabel}0`);
    trianglesCol.setTextContent(`${triLabel}0`);
    frameTimeCol.setTextContent(`${famLabel}0 ms`);

    this.domElement = dom.domElement;

    function update() {
      const { scene } = editor;

      let objects = 0;
      let vertices = 0;
      let triangles = 0;

      for (let i = 0, l = scene.children.length; i < l; i++) {
        const object = scene.children[i];

        // eslint-disable-next-line no-loop-func
        object.traverseVisible((child) => {
          objects++;

          if (child?.isMesh || child?.isPoints) {
            const { geometry } = child;
            vertices += geometry.attributes.position.count;

            if (child.isMesh) {
              if (geometry.index !== null) {
                triangles += geometry.index.count / 3;
              } else {
                triangles += geometry.attributes.position.count / 3;
              }
            }
          }
        });
      }

      objectCol.setTextContent(objLabel + objects);
      verticesCol.setTextContent(vecLabel + vertices);
      trianglesCol.setTextContent(triLabel + triangles);
    }

    editor.signals.sceneRendered.add((frameTime) => {
      frameTimeCol.setTextContent(`${famLabel + frameTime.toFixed(2)} ms`);
    });

    editor.signals.objectAdded.add(update);

    this.show = function () {
      dom.show();
    };

    this.hide = function () {
      dom.hide();
    };
  }
}

/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 20:58:53
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/ViewPort.js
 */

class ViewPort {
  constructor(editor) {
    const { signals } = editor;

    const renderer = initRenderer();
    renderer.setAnimationLoop(animate);

    const { scene } = editor;
    const { sceneHelper } = editor;
    const { target } = editor;

    target.append(renderer.domElement);

    const gridHelper = new GridHelper(50, 50, 0x888888);
    gridHelper.rotateX(Math.PI / 2);
    gridHelper.isHelper = true;

    const transformControls = new TransformControls(editor.viewPortCamera, target);
    transformControls.addEventListener('change', onTransformControlsChange);
    transformControls.addEventListener('mouseDown', onTransformControlsMouseDown);
    transformControls.addEventListener('mouseUp', onTransformControlsMouseUp);
    sceneHelper.add(transformControls);

    const controls = new OrbitControls(editor.viewPortCamera, target);
    let needsUpdate = false;
    controls.addEventListener('change', () => {
      needsUpdate = true;
    });

    const viewHelper = new ViewHelper(editor.viewPortCamera, target);

    const box = new Box3();
    const selectionBox = new Box3Helper(box);
    selectionBox.visible = false;
    selectionBox.material.transparent = true;
    selectionBox.material.depthTest = false;
    sceneHelper.add(selectionBox);

    this.stats = new Stats(editor);

    target.append(this.stats.domElement);

    // main
    let startTime; let
      endTime;
    function onRender() {
      startTime = performance.now();

      renderer.render(scene, editor.viewPortCamera);
      renderer.autoClear = false;
      sceneHelper.add(gridHelper);
      renderer.render(sceneHelper, editor.viewPortCamera);
      sceneHelper.remove(gridHelper);
      viewHelper.render(renderer);
      renderer.autoClear = true;
      needsUpdate = false;

      endTime = performance.now();

      signals.sceneRendered.dispatch(endTime - startTime);
    }

    function onResize() {
      const { width, height } = target.getBoundingClientRect();
      const camera = editor.viewPortCamera;
      renderer.setSize(width, height);

      if (camera.type === 'OrthographicCamera') {
        camera.top = 15 * (height / width);
        camera.bottom = -15 * (height / width);
      } else if (camera.type === 'PerspectiveCamera') {
        camera.aspect = width / height;
      }

      camera.updateProjectionMatrix();
    }

    // TransformControls

    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;

    function onTransformControlsChange() {
      const { object } = transformControls;

      if (object !== undefined) {
        box.setFromObject(object, true);
        onRender();
      }
    }

    function onTransformControlsMouseDown() {
      const { object } = transformControls;

      if (object !== undefined) {
        objectPositionOnDown = object.position.clone();
        objectRotationOnDown = object.rotation.clone();
        objectScaleOnDown = object.scale.clone();

        controls.enabled = false;
      }
    }

    function onTransformControlsMouseUp() {
      const { object } = transformControls;

      if (object !== undefined) {
        switch (transformControls.getMode) {
          case 'translate':
            if (!objectPositionOnDown.equals(object.position)) ;
            break;
          case 'rotate':
            if (!objectRotationOnDown.equals(object.rotation)) ;
            break;
          case 'scale':
            if (!objectScaleOnDown.equals(object.scale)) ;
            break;
            // skip default
        }
        controls.enabled = true;
      }
    }

    // Selection

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    function getIntersects(point) {
      mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      raycaster.setFromCamera(mouse, editor.viewPortCamera);

      // 筛选需要检测的对象
      const objects = [];

      scene.traverseVisible((child) => {
        objects.push(child);
      });

      for (let i = 0, l = sceneHelper.children.length; i < l; i++) {
        const child = sceneHelper.children[i];
        // 排除掉transformControl 和 selectionBox
        const enablePicked = child.uuid !== transformControls.uuid && child.uuid !== selectionBox.uuid && child.visible;
        if (enablePicked) {
          objects.push(sceneHelper.children[i]);
        }
      }

      return raycaster.intersectObjects(objects, false);
    }

    // Mouse

    const onDownPosition = new Vector2();
    const onUpPosition = new Vector2();
    const onDoubleClickPosition = new Vector2();

    function getMousePosition(x, y) {
      const { left, top, width, height } = target.getBoundingClientRect();
      return [(x - left) / width, (y - top) / height];
    }

    function onMouseDown(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onDownPosition.fromArray(mousePosition);

      target.addEventListener('mouseup', onMouseUp);
    }

    function onMouseUp(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onUpPosition.fromArray(mousePosition);

      handelClick();

      target.removeEventListener('mouseup', onMouseUp);
    }

    function handelClick() {
      if (onDownPosition.distanceTo(onUpPosition) === 0) {
        const intersects = getIntersects(onUpPosition);

        console.log(intersects, 'handelClick');

        const intersectsObjectsUUId = intersects.map((item) => item?.object?.uuid).filter((id) => id !== undefined);

        signals.intersectionsDetected.dispatch(intersectsObjectsUUId);

        onRender();
      }
    }

    function onDoubleClick(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onDoubleClickPosition.fromArray(mousePosition);

      const intersects = getIntersects(onDoubleClickPosition);
      if (intersects.length > 0) {
        intersects[0];
        // TODO 物体聚焦
        // signals.objectFocused.dispatch( intersect.object );
      }
    }

    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('dblclick', onDoubleClick);

    // Animate

    const clock = new Clock();

    function animate() {
      const delta = clock.getDelta();

      if (viewHelper.animating === true) {
        viewHelper.update(delta);
        needsUpdate = true;
      }

      if (needsUpdate === true) onRender();
    }

    // signals

    signals.windowResize.add(() => {
      printInfo('editor resized');
      onResize();
      onRender();
    });

    signals.windowResize.dispatch();

    signals.objectSelected.add((selectIds) => {
      transformControls.detach();
      selectionBox.visible = false;

      const object = editor.getObjectByUUID(selectIds[0]);
      print('signals.objectSelected->', object);

      if (object !== undefined && object !== scene && object !== editor.viewPortCamera) {
        box.setFromObject(object, true);

        if (box.isEmpty() === false) {
          selectionBox.visible = true;
        }

        transformControls.attach(object);
      }
    });

    signals.sceneGraphChanged.add(() => {
      onRender();
    });

    signals.viewPortCameraChanged.add(() => {
      transformControls.camera = editor.viewPortCamera;
      controls.object = editor.viewPortCamera;
      viewHelper.object = editor.viewPortCamera;

      editor.viewPortCamera.lookAt(controls.target);

      onResize();
    });
  }
}

export { CoordinateHelper, CustomGridHelper, Editor, ViewHelper, ViewPort };
