'use strict';

var THREE = require('three');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var THREE__namespace = /*#__PURE__*/_interopNamespaceDefault(THREE);

/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 17:54:56
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Container.js
 */
/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 17:37:05
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Container.js
 */
class Container {
  constructor() {
    this.cameras = {};
    this.lights = {};
    this.objects = {};
    this.geometries = {};
    this.materials = {};
    this.helpers = {};
    this.groups = {};
    this.textures = {};
  }

  register(object) {
    if (object?.isCamera) {
      this.cameras[object.id] = object;
    } else if (object?.isLight) {
      this.lights[object.id] = object;
    } else if (object?.isBufferGeometry) {
      this.geometries[object.id] = object;
    } else if (object?.isMaterial) {
      this.materials[object.id] = object;
    } else if (object?.isHelper) {
      this.helpers[object.id] = object;
    } else if (object?.isTexture) {
      this.textures[object.id] = object;
    } else if (object?.isGroup) {
      this.groups[object.id] = object;
    }
    this.objects[object.id] = object;
  }

  discard(object) {
    if (object?.isCamera) {
      delete this.cameras[object.id];
    } else if (object?.isLight) {
      delete this.lights[object.id];
    } else if (object?.isBufferGeometry) {
      delete this.geometries[object.id];
    } else if (object?.isMaterial) {
      delete this.materials[object.id];
    } else if (object?.isHelper) {
      delete this.helpers[object.id];
    } else if (object?.isTexture) {
      delete this.textures[object.id];
    } else if (object?.isGroup) {
      delete this.groups[object.id];
    }
    delete this.objects[object.id];
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
 * @Date: 2023-06-14 11:09:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 13:45:54
 * @FilePath: /threejs-demo/packages/app/CAD/src/lib/initialization.js
 */

function initPerspectiveCamera(initialPosition) {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);

  const position = (initialPosition !== undefined) ? initialPosition : new THREE.Vector3(0,5,10);
  camera.position.copy(position);

  camera.name = 'default_perspective_camera';
  camera.lookAt(new THREE.Vector3());
  return camera
}

function initRenderer(options = {}) {
    const renderer = new THREE.WebGLRenderer(Object.assign({antialias: true},options));
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xaaaaaa);

    return renderer
}


function initScene() {
    return new THREE.Scene()
}

/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 17:59:29
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Editor.js
 */

class Editor {
  constructor(target) {
    this.state = {};
    this.signals = {
      rendererCreate:new Signal()
    };
    this.target = target;
    this.container = new Container();
    this.scene = initScene();
    this.sceneHelper = initScene();
    this.camera = initPerspectiveCamera();
  }


  addObject(object,parent,index) {
    this.container.register(object);
    this.scene.add(object);
  }
  removeObject(object) {
    this.container.discard(object);
    this.scene.remove(object);
  }

  getObjectById(id) {
    this.container.findById(id);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
  }
}

/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 01:16:17
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/CoordinateHelper.js
 */

class CoordinateHelper extends THREE.Group {
  constructor(colors = { x: 'red', y: 'green', z: 'blue' }, axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    super();
    this.colors = colors;
    this.axesLength = axesLength;
    this.arrowsLength = arrowsLength;
    this.arrowsWidth = arrowsWidth;
    this.type = 'CoordinateHelper';
    const pos = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const origin = new THREE.Vector3();
    ['x', 'y', 'z'].forEach((key) => {
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(...pos[key]), origin, axesLength, colors[key], arrowsLength, arrowsWidth);
      arrow.renderOrder = Infinity;
      this.add(arrow);
    });
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
 * @LastEditTime: 2023-06-13 01:15:55
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/CustomGridHelper.js
 */

class CustomGridHelper extends THREE.LineSegments {
  constructor(width = 10, height = 10, divsion = 1, splice = 1, centerColor = 0xaaaaaa, baseColor = 0xdfdfdf, divsionColor = 0xeeeeee) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });
    super(geometry, material);
    this.type = 'CustomGridHelper';
    this.centerColor = new THREE.Color(centerColor);
    this.baseColor = new THREE.Color(baseColor);
    this.divsionColor = new THREE.Color(divsionColor);

    this.width = width;
    this.height = height;
    this.divsion = divsion;
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

    const { centerColor, baseColor, divsionColor, width, height, splice, divsion } = this;
    const [timesX, timesY] = [width / divsion * splice, height / divsion * splice];

    const vertices = [];
    const colors = [];
    let color, j10, isCenter,c =0;

    function loop(half, center, times, delta, axis) {
      const o = {};
      o.x = (k, half) => vertices.push(-half, k, 0, half, k, 0);
      o.y = (k, half) => vertices.push(k, -half, 0, k, half, 0);
      for (let j = 0, k = -half; j <= times; j++, k += delta) {
        o[axis](k, half);
        j10 = j % splice === 0;
        isCenter = j === center;
        
        color = divsionColor;
        if (isCenter) {
          color = centerColor;
        } else {
          if (j10 && !isCenter) {
            color = baseColor;
          }
        }

        color.toArray(colors, c); c += 3;
        color.toArray(colors, c); c += 3;
      }

    }

    loop(width/2, timesX / 2, timesX, delta, 'x');
    loop(height/2, timesY / 2, timesY, delta, 'y');

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    this.geometry.attributes.position.needUpdate = true;
    this.geometry.attributes.color.needUpdate = true;
  }

  dispose(){
    this.geometry.dispose();
    this.material.dispose();
  }
}

/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-15 15:13:02
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/src/ViewHelper.js
 */

const vpTemp = new THREE__namespace.Vector4();

let ViewHelper$1 = class ViewHelper extends THREE__namespace.Object3D {
  constructor(editorCamera, dom) {
    super();

    this.isViewHelper = true;

    this.editorCamera = editorCamera;

    this.animating = false;
    this.controls = null;

    const color1 = new THREE__namespace.Color('#ff3653');
    const color2 = new THREE__namespace.Color('#8adb00');
    const color3 = new THREE__namespace.Color('#2c8fff');

    const interactiveObjects = [];
    const raycaster = new THREE__namespace.Raycaster();
    const mouse = new THREE__namespace.Vector2();
    const dummy = new THREE__namespace.Object3D();

    const camera = new THREE__namespace.OrthographicCamera(-2, 2, 2, -2, 0, 4);
    camera.position.set(0, 0, 2);

    const geometry = new THREE__namespace.BoxGeometry(0.8, 0.05, 0.05).translate(0.4, 0, 0);

    const xAxis = new THREE__namespace.Mesh(geometry, getAxisMaterial(color1));
    const yAxis = new THREE__namespace.Mesh(geometry, getAxisMaterial(color2));
    const zAxis = new THREE__namespace.Mesh(geometry, getAxisMaterial(color3));

    yAxis.rotation.z = Math.PI / 2;
    zAxis.rotation.y = -Math.PI / 2;

    this.add(xAxis);
    this.add(zAxis);
    this.add(yAxis);

    const posXAxisHelper = new THREE__namespace.Sprite(getSpriteMaterial(color1, 'X'));
    posXAxisHelper.userData.type = 'posX';
    const posYAxisHelper = new THREE__namespace.Sprite(getSpriteMaterial(color2, 'Y'));
    posYAxisHelper.userData.type = 'posY';
    const posZAxisHelper = new THREE__namespace.Sprite(getSpriteMaterial(color3, 'Z'));
    posZAxisHelper.userData.type = 'posZ';
    const negXAxisHelper = new THREE__namespace.Sprite(getSpriteMaterial(color1));
    negXAxisHelper.userData.type = 'negX';
    const negYAxisHelper = new THREE__namespace.Sprite(getSpriteMaterial(color2));
    negYAxisHelper.userData.type = 'negY';
    const negZAxisHelper = new THREE__namespace.Sprite(getSpriteMaterial(color3));
    negZAxisHelper.userData.type = 'negZ';

    posXAxisHelper.position.x = 1;
    posYAxisHelper.position.y = 1;
    posZAxisHelper.position.z = 1;
    negXAxisHelper.position.x = -1;
    negXAxisHelper.scale.setScalar(0.8);
    negYAxisHelper.position.y = -1;
    negYAxisHelper.scale.setScalar(0.8);
    negZAxisHelper.position.z = -1;
    negZAxisHelper.scale.setScalar(0.8);

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

    const point = new THREE__namespace.Vector3();
    const dim = 128;
    const turnRate = 2 * Math.PI; // turn rate in angles per second

    this.render = function(renderer) {
      this.quaternion.copy(this.editorCamera.quaternion).invert();
      this.updateMatrixWorld();

      point.set(0, 0, 1);
      point.applyQuaternion(this.editorCamera.quaternion);

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

      const x = dom.offsetWidth - dim;

      renderer.clearDepth();

      renderer.getViewport(vpTemp);
      renderer.setViewport(x, 0, dim, dim);

      renderer.render(this, camera);

      renderer.setViewport(vpTemp.x, vpTemp.y, vpTemp.z, vpTemp.w);
    };

    const targetPosition = new THREE__namespace.Vector3();
    const targetQuaternion = new THREE__namespace.Quaternion();

    const q1 = new THREE__namespace.Quaternion();
    const q2 = new THREE__namespace.Quaternion();
    let radius = 0;

    this.handleClick = function(event) {
      if (this.animating === true) return false;

      const rect = dom.getBoundingClientRect();
      const offsetX = rect.left + (dom.offsetWidth - dim);
      const offsetY = rect.top + (dom.offsetHeight - dim);
      mouse.x = ((event.clientX - offsetX) / (rect.width - offsetX)) * 2 - 1;
      mouse.y = -((event.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const intersection = intersects[ 0 ];
        const object = intersection.object;

        prepareAnimationData(object, this.controls.center);

        this.animating = true;

        return true;
      } else {
        return false;
      }
    };

    this.update = function(delta) {
      const step = delta * turnRate;
      const focusPoint = this.controls.center;

      // animate position by doing a slerp and then scaling the position on the unit sphere

      q1.rotateTowards(q2, step);
      this.editorCamera.position.set(0, 0, 1).applyQuaternion(q1).multiplyScalar(radius).add(focusPoint);

      // animate orientation

      this.editorCamera.quaternion.rotateTowards(targetQuaternion, step);

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

    function prepareAnimationData(object, focusPoint) {
      switch (object.userData.type) {
        case 'posX':
          targetPosition.set(1, 0, 0);
          targetQuaternion.setFromEuler(new THREE__namespace.Euler(0, Math.PI * 0.5, 0));
          break;

        case 'posY':
          targetPosition.set(0, 1, 0);
          targetQuaternion.setFromEuler(new THREE__namespace.Euler(-Math.PI * 0.5, 0, 0));
          break;

        case 'posZ':
          targetPosition.set(0, 0, 1);
          targetQuaternion.setFromEuler(new THREE__namespace.Euler());
          break;

        case 'negX':
          targetPosition.set(-1, 0, 0);
          targetQuaternion.setFromEuler(new THREE__namespace.Euler(0, -Math.PI * 0.5, 0));
          break;

        case 'negY':
          targetPosition.set(0, -1, 0);
          targetQuaternion.setFromEuler(new THREE__namespace.Euler(Math.PI * 0.5, 0, 0));
          break;

        case 'negZ':
          targetPosition.set(0, 0, -1);
          targetQuaternion.setFromEuler(new THREE__namespace.Euler(0, Math.PI, 0));
          break;

        default:
          console.error('ViewHelper: Invalid axis.');
      }

      //

      radius = this.editorCamera.position.distanceTo(focusPoint);
      targetPosition.multiplyScalar(radius).add(focusPoint);

      dummy.position.copy(focusPoint);

      dummy.lookAt(this.editorCamera.position);
      q1.copy(dummy.quaternion);

      dummy.lookAt(targetPosition);
      q2.copy(dummy.quaternion);
    }

    function getAxisMaterial(color) {
      return new THREE__namespace.MeshBasicMaterial({ color: color, toneMapped: false });
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

      const texture = new THREE__namespace.CanvasTexture(canvas);

      return new THREE__namespace.SpriteMaterial({ map: texture, toneMapped: false });
    }
  }
};

class ViewHelper extends ViewHelper$1{
    constructor(camera,dom){
        super(camera,dom);

        const viewHelperDom = document.createElement('div');
        viewHelperDom.setAttribute('id','viewHelper');

        const style = {
            position:'absolute',
            right:'0px',
            bottom:'0px',
            height:'128px',
            width:'128px'
        };
        Object.assign(viewHelperDom.style,style);
        dom.append(viewHelperDom);

        viewHelperDom.addEventListener( 'pointerup', ( event ) => {

			event.stopPropagation();

			this.handleClick( event );

		} );

		viewHelperDom.addEventListener( 'pointerdown', function ( event ) {

			event.stopPropagation();

		} );

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

class OrbitControls extends THREE.EventDispatcher {
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
    this.target = new THREE.Vector3();

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
    this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

    // Touch fingers
    this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

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
      const offset = new THREE.Vector3();

      // so camera.up is the orbit axis
      const quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();

      const lastPosition = new THREE.Vector3();
      const lastQuaternion = new THREE.Quaternion();

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
    const spherical = new THREE.Spherical();
    const sphericalDelta = new THREE.Spherical();

    let scale = 1;
    const panOffset = new THREE.Vector3();
    let zoomChanged = false;

    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();

    const panStart = new THREE.Vector2();
    const panEnd = new THREE.Vector2();
    const panDelta = new THREE.Vector2();

    const dollyStart = new THREE.Vector2();
    const dollyEnd = new THREE.Vector2();
    const dollyDelta = new THREE.Vector2();

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
      const v = new THREE.Vector3();

      return function panLeft(distance, objectMatrix) {
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        panOffset.add(v);
      };
    }());

    const panUp = (function() {
      const v = new THREE.Vector3();

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
      const offset = new THREE.Vector3();

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
      console.log(dollyScale);
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
      const v = new THREE.Vector3(x, y, 0);

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
        case THREE.MOUSE.DOLLY:

          if (scope.enableZoom === false) return;

          handleMouseDownDolly(event);

          state = STATE.DOLLY;

          break;

        case THREE.MOUSE.ROTATE:

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

        case THREE.MOUSE.PAN:

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
            case THREE.TOUCH.ROTATE:

              if (scope.enableRotate === false) return;

              handleTouchStartRotate();

              state = STATE.TOUCH_ROTATE;

              break;

            case THREE.TOUCH.PAN:

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
            case THREE.TOUCH.DOLLY_PAN:

              if (scope.enableZoom === false && scope.enablePan === false) return;

              handleTouchStartDollyPan();

              state = STATE.TOUCH_DOLLY_PAN;

              break;

            case THREE.TOUCH.DOLLY_ROTATE:

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
        position = new THREE.Vector2();
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

const _raycaster = new THREE.Raycaster();

const _tempVector = new THREE.Vector3();
const _tempVector2 = new THREE.Vector3();
const _tempQuaternion = new THREE.Quaternion();
const _unit = {
	X: new THREE.Vector3( 1, 0, 0 ),
	Y: new THREE.Vector3( 0, 1, 0 ),
	Z: new THREE.Vector3( 0, 0, 1 )
};

const _changeEvent = { type: 'change' };
const _mouseDownEvent = { type: 'mouseDown' };
const _mouseUpEvent = { type: 'mouseUp', mode: null };
const _objectChangeEvent = { type: 'objectChange' };

class TransformControls extends THREE.Object3D {

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

		const worldPosition = new THREE.Vector3();
		const worldPositionStart = new THREE.Vector3();
		const worldQuaternion = new THREE.Quaternion();
		const worldQuaternionStart = new THREE.Quaternion();
		const cameraPosition = new THREE.Vector3();
		const cameraQuaternion = new THREE.Quaternion();
		const pointStart = new THREE.Vector3();
		const pointEnd = new THREE.Vector3();
		const rotationAxis = new THREE.Vector3();
		const rotationAngle = 0;
		const eye = new THREE.Vector3();

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

		this._offset = new THREE.Vector3();
		this._startNorm = new THREE.Vector3();
		this._endNorm = new THREE.Vector3();
		this._cameraScale = new THREE.Vector3();

		this._parentPosition = new THREE.Vector3();
		this._parentQuaternion = new THREE.Quaternion();
		this._parentQuaternionInv = new THREE.Quaternion();
		this._parentScale = new THREE.Vector3();

		this._worldScaleStart = new THREE.Vector3();
		this._worldQuaternionInv = new THREE.Quaternion();
		this._worldScale = new THREE.Vector3();

		this._positionStart = new THREE.Vector3();
		this._quaternionStart = new THREE.Quaternion();
		this._scaleStart = new THREE.Vector3();

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

const _tempEuler = new THREE.Euler();
const _alignVector = new THREE.Vector3( 0, 1, 0 );
const _zeroVector = new THREE.Vector3( 0, 0, 0 );
const _lookAtMatrix = new THREE.Matrix4();
const _tempQuaternion2 = new THREE.Quaternion();
const _identityQuaternion = new THREE.Quaternion();
const _dirVector = new THREE.Vector3();
const _tempMatrix = new THREE.Matrix4();

const _unitX = new THREE.Vector3( 1, 0, 0 );
const _unitY = new THREE.Vector3( 0, 1, 0 );
const _unitZ = new THREE.Vector3( 0, 0, 1 );

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

class TransformControlsGizmo extends THREE.Object3D {

	constructor() {

		super();

		this.isTransformControlsGizmo = true;

		this.type = 'TransformControlsGizmo';

		// shared materials

		const gizmoMaterial = new THREE.MeshBasicMaterial( {
			depthTest: false,
			depthWrite: false,
			fog: false,
			toneMapped: false,
			transparent: true
		} );

		const gizmoLineMaterial = new THREE.LineBasicMaterial( {
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

		const arrowGeometry = new THREE.CylinderGeometry( 0, 0.04, 0.1, 12 );
		arrowGeometry.translate( 0, 0.05, 0 );

		const scaleHandleGeometry = new THREE.BoxGeometry( 0.08, 0.08, 0.08 );
		scaleHandleGeometry.translate( 0, 0.04, 0 );

		const lineGeometry = new THREE.BufferGeometry();
		lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

		const lineGeometry2 = new THREE.CylinderGeometry( 0.0075, 0.0075, 0.5, 3 );
		lineGeometry2.translate( 0, 0.25, 0 );

		function CircleGeometry( radius, arc ) {

			const geometry = new THREE.TorusGeometry( radius, 0.0075, 3, 64, arc * Math.PI * 2 );
			geometry.rotateY( Math.PI / 2 );
			geometry.rotateX( Math.PI / 2 );
			return geometry;

		}

		// Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

		function TranslateHelperGeometry() {

			const geometry = new THREE.BufferGeometry();

			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );

			return geometry;

		}

		// Gizmo definitions - custom hierarchy definitions for setupGizmo() function

		const gizmoTranslate = {
			X: [
				[ new THREE.Mesh( arrowGeometry, matRed ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new THREE.Mesh( arrowGeometry, matRed ), [ - 0.5, 0, 0 ], [ 0, 0, Math.PI / 2 ]],
				[ new THREE.Mesh( lineGeometry2, matRed ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]
			],
			Y: [
				[ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, 0.5, 0 ]],
				[ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, - 0.5, 0 ], [ Math.PI, 0, 0 ]],
				[ new THREE.Mesh( lineGeometry2, matGreen ) ]
			],
			Z: [
				[ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]],
				[ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, - 0.5 ], [ - Math.PI / 2, 0, 0 ]],
				[ new THREE.Mesh( lineGeometry2, matBlue ), null, [ Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), matWhiteTransparent.clone() ), [ 0, 0, 0 ]]
			],
			XY: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matBlueTransparent.clone() ), [ 0.15, 0.15, 0 ]]
			],
			YZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matRedTransparent.clone() ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matGreenTransparent.clone() ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]
			]
		};

		const pickerTranslate = {
			X: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0.3, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ - 0.3, 0, 0 ], [ 0, 0, Math.PI / 2 ]]
			],
			Y: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0.3, 0 ]],
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, - 0.3, 0 ], [ 0, 0, Math.PI ]]
			],
			Z: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, 0.3 ], [ Math.PI / 2, 0, 0 ]],
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, - 0.3 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), matInvisible ) ]
			],
			XY: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0.15, 0 ]]
			],
			YZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]
			]
		};

		const helperTranslate = {
			START: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
			],
			END: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
			],
			DELTA: [
				[ new THREE.Line( TranslateHelperGeometry(), matHelper ), null, null, null, 'helper' ]
			],
			X: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			],
			Y: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
			],
			Z: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		const gizmoRotate = {
			XYZE: [
				[ new THREE.Mesh( CircleGeometry( 0.5, 1 ), matGray ), null, [ 0, Math.PI / 2, 0 ]]
			],
			X: [
				[ new THREE.Mesh( CircleGeometry( 0.5, 0.5 ), matRed ) ]
			],
			Y: [
				[ new THREE.Mesh( CircleGeometry( 0.5, 0.5 ), matGreen ), null, [ 0, 0, - Math.PI / 2 ]]
			],
			Z: [
				[ new THREE.Mesh( CircleGeometry( 0.5, 0.5 ), matBlue ), null, [ 0, Math.PI / 2, 0 ]]
			],
			E: [
				[ new THREE.Mesh( CircleGeometry( 0.75, 1 ), matYellowTransparent ), null, [ 0, Math.PI / 2, 0 ]]
			]
		};

		const helperRotate = {
			AXIS: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		const pickerRotate = {
			XYZE: [
				[ new THREE.Mesh( new THREE.SphereGeometry( 0.25, 10, 8 ), matInvisible ) ]
			],
			X: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ]],
			],
			Y: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]],
			],
			Z: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 0.5, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
			],
			E: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 0.75, 0.1, 2, 24 ), matInvisible ) ]
			]
		};

		const gizmoScale = {
			X: [
				[ new THREE.Mesh( scaleHandleGeometry, matRed ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new THREE.Mesh( lineGeometry2, matRed ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new THREE.Mesh( scaleHandleGeometry, matRed ), [ - 0.5, 0, 0 ], [ 0, 0, Math.PI / 2 ]],
			],
			Y: [
				[ new THREE.Mesh( scaleHandleGeometry, matGreen ), [ 0, 0.5, 0 ]],
				[ new THREE.Mesh( lineGeometry2, matGreen ) ],
				[ new THREE.Mesh( scaleHandleGeometry, matGreen ), [ 0, - 0.5, 0 ], [ 0, 0, Math.PI ]],
			],
			Z: [
				[ new THREE.Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]],
				[ new THREE.Mesh( lineGeometry2, matBlue ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]],
				[ new THREE.Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, - 0.5 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XY: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matBlueTransparent ), [ 0.15, 0.15, 0 ]]
			],
			YZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matRedTransparent ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.01 ), matGreenTransparent ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.1, 0.1, 0.1 ), matWhiteTransparent.clone() ) ],
			]
		};

		const pickerScale = {
			X: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0.3, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ - 0.3, 0, 0 ], [ 0, 0, Math.PI / 2 ]]
			],
			Y: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0.3, 0 ]],
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, - 0.3, 0 ], [ 0, 0, Math.PI ]]
			],
			Z: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, 0.3 ], [ Math.PI / 2, 0, 0 ]],
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 0.6, 4 ), matInvisible ), [ 0, 0, - 0.3 ], [ - Math.PI / 2, 0, 0 ]]
			],
			XY: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0.15, 0 ]],
			],
			YZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]],
			],
			XZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.01 ), matInvisible ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]],
			],
			XYZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 0, 0 ]],
			]
		};

		const helperScale = {
			X: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			],
			Y: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
			],
			Z: [
				[ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		// Creates an Object3D with gizmos described in custom hierarchy definition.

		function setupGizmo( gizmoMap ) {

			const gizmo = new THREE.Object3D();

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

class TransformControlsPlane extends THREE.Mesh {

	constructor() {

		super(
			new THREE.PlaneGeometry( 100000, 100000, 2, 2 ),
			new THREE.MeshBasicMaterial( { visible: false, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.1, toneMapped: false } )
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

class EditorControls extends THREE__namespace.EventDispatcher {
  constructor(object, domElement) {
    super();

    // API

    this.enabled = true;
    this.center = new THREE__namespace.Vector3();
    this.panSpeed = 0.002;
    this.zoomSpeed = 0.5;
    this.rotationSpeed = 0.005;
    this.maxZoom = Infinity;
    this.minZoom = 0;

    // internals

    var scope = this;
    var vector = new THREE__namespace.Vector3();
    var delta = new THREE__namespace.Vector3();
    var box = new THREE__namespace.Box3();

    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
    var state = STATE.NONE;

    var center = this.center;
    var normalMatrix = new THREE__namespace.Matrix3();
    var pointer = new THREE__namespace.Vector2();
    var pointerOld = new THREE__namespace.Vector2();
    var spherical = new THREE__namespace.Spherical();
    var sphere = new THREE__namespace.Sphere();

    // events

    var changeEvent = { type: "change" };

    this.focus = function (target) {
      var distance;

      box.setFromObject(target);

      if (box.isEmpty() === false) {
        box.getCenter(center);
        distance = box.getBoundingSphere(sphere).radius;
      } else {
        // Focusing on an Group, AmbientLight, etc

        center.setFromMatrixPosition(target.matrixWorld);
        distance = 0.1;
      }

      delta.set(0, 0, 1);
      delta.applyQuaternion(object.quaternion);
      delta.multiplyScalar(distance * 4);

      object.position.copy(center).add(delta);

      scope.dispatchEvent(changeEvent);
    };

    this.pan = function (delta) {
      var distance = object.position.distanceTo(center);

      delta.multiplyScalar(distance * scope.panSpeed);
      delta.applyMatrix3(normalMatrix.getNormalMatrix(object.matrix));

      object.position.add(delta);
      center.add(delta);

      scope.dispatchEvent(changeEvent);
    };

    this.zoom = function (delta) {
      if (object.type === "PerspectiveCamera") {
        var distance = object.position.distanceTo(center);
        delta.multiplyScalar(distance * scope.zoomSpeed);
        if (delta.length() > distance) return;
        delta.applyMatrix3(normalMatrix.getNormalMatrix(object.matrix));
        object.position.add(delta);
      } else if (object.type === "OrthographicCamera") {
        object.zoom = Math.max(
          scope.minZoom,
          Math.min(
            scope.maxZoom,
            delta.z > 0
              ? object.zoom * Math.pow(0.95, scope.zoomSpeed)
              : object.zoom / Math.pow(0.95, scope.zoomSpeed)
          )
        );
        object.updateProjectionMatrix();
      }

      scope.dispatchEvent(changeEvent);
    };

    this.rotate = function (delta) {
      vector.copy(object.position).sub(center);

      spherical.setFromVector3(vector);

      spherical.theta += delta.x * scope.rotationSpeed;
      spherical.phi += delta.y * scope.rotationSpeed;

      spherical.makeSafe();

      vector.setFromSpherical(spherical);

      object.position.copy(center).add(vector);

      object.lookAt(center);

      scope.dispatchEvent(changeEvent);
    };

    //

    function onPointerDown(event) {
      if (scope.enabled === false) return;

      switch (event.pointerType) {
        case "mouse":
        case "pen":
          onMouseDown(event);
          break;

        // TODO touch
      }

      domElement.ownerDocument.addEventListener("pointermove", onPointerMove);
      domElement.ownerDocument.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return;

      switch (event.pointerType) {
        case "mouse":
        case "pen":
          onMouseMove(event);
          break;

        // TODO touch
      }
    }

    function onPointerUp(event) {
      switch (event.pointerType) {
        case "mouse":
        case "pen":
          onMouseUp();
          break;

        // TODO touch
      }

      domElement.ownerDocument.removeEventListener(
        "pointermove",
        onPointerMove
      );
      domElement.ownerDocument.removeEventListener("pointerup", onPointerUp);
    }

    // mouse

    function onMouseDown(event) {
      if (event.button === 0) {
        state = STATE.ROTATE;
      } else if (event.button === 1) {
        state = STATE.ZOOM;
      } else if (event.button === 2) {
        state = STATE.PAN;
      }

      pointerOld.set(event.clientX, event.clientY);
    }

    function onMouseMove(event) {
      pointer.set(event.clientX, event.clientY);

      var movementX = pointer.x - pointerOld.x;
      var movementY = pointer.y - pointerOld.y;

      if (state === STATE.ROTATE) {
        scope.rotate(delta.set(-movementX, -movementY, 0));
      } else if (state === STATE.ZOOM) {
        scope.zoom(delta.set(0, 0, movementY));
      } else if (state === STATE.PAN) {
        scope.pan(delta.set(-movementX, movementY, 0));
      }

      pointerOld.set(event.clientX, event.clientY);
    }

    function onMouseUp() {
      state = STATE.NONE;
    }

    function onMouseWheel(event) {
      if (scope.enabled === false) return;

      event.preventDefault();

      // Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
      scope.zoom(delta.set(0, 0, event.deltaY > 0 ? 1 : -1));
    }

    function contextmenu(event) {
      event.preventDefault();
    }

    this.dispose = function () {
      domElement.removeEventListener("contextmenu", contextmenu);
      domElement.removeEventListener("dblclick", onMouseUp);
      domElement.removeEventListener("wheel", onMouseWheel);

      domElement.removeEventListener("pointerdown", onPointerDown);

      domElement.removeEventListener("touchstart", touchStart);
      domElement.removeEventListener("touchmove", touchMove);
    };

    domElement.addEventListener("contextmenu", contextmenu);
    domElement.addEventListener("dblclick", onMouseUp);
    domElement.addEventListener("wheel", onMouseWheel);

    domElement.addEventListener("pointerdown", onPointerDown);

    // touch

    var touches = [
      new THREE__namespace.Vector3(),
      new THREE__namespace.Vector3(),
      new THREE__namespace.Vector3(),
    ];
    var prevTouches = [
      new THREE__namespace.Vector3(),
      new THREE__namespace.Vector3(),
      new THREE__namespace.Vector3(),
    ];

    var prevDistance = null;

    function touchStart(event) {
      if (scope.enabled === false) return;

      switch (event.touches.length) {
        case 1:
          touches[0]
            .set(event.touches[0].pageX, event.touches[0].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          touches[1]
            .set(event.touches[0].pageX, event.touches[0].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          break;

        case 2:
          touches[0]
            .set(event.touches[0].pageX, event.touches[0].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          touches[1]
            .set(event.touches[1].pageX, event.touches[1].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          prevDistance = touches[0].distanceTo(touches[1]);
          break;
      }

      prevTouches[0].copy(touches[0]);
      prevTouches[1].copy(touches[1]);
    }

    function touchMove(event) {
      if (scope.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      function getClosest(touch, touches) {
        var closest = touches[0];

        for (var touch2 of touches) {
          if (closest.distanceTo(touch) > touch2.distanceTo(touch))
            closest = touch2;
        }

        return closest;
      }

      switch (event.touches.length) {
        case 1:
          touches[0]
            .set(event.touches[0].pageX, event.touches[0].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          touches[1]
            .set(event.touches[0].pageX, event.touches[0].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          scope.rotate(
            touches[0]
              .sub(getClosest(touches[0], prevTouches))
              .multiplyScalar(-1)
          );
          break;

        case 2:
          touches[0]
            .set(event.touches[0].pageX, event.touches[0].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          touches[1]
            .set(event.touches[1].pageX, event.touches[1].pageY, 0)
            .divideScalar(window.devicePixelRatio);
          var distance = touches[0].distanceTo(touches[1]);
          scope.zoom(delta.set(0, 0, prevDistance - distance));
          prevDistance = distance;

          var offset0 = touches[0]
            .clone()
            .sub(getClosest(touches[0], prevTouches));
          var offset1 = touches[1]
            .clone()
            .sub(getClosest(touches[1], prevTouches));
          offset0.x = -offset0.x;
          offset1.x = -offset1.x;

          scope.pan(offset0.add(offset1));

          break;
      }

      prevTouches[0].copy(touches[0]);
      prevTouches[1].copy(touches[1]);
    }

    domElement.addEventListener("touchstart", touchStart);
    domElement.addEventListener("touchmove", touchMove);
  }
}

/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );

	//

	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {

		for ( var i = 0; i < container.children.length; i ++ ) {

			container.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		mode = id;

	}

	//

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	}

	showPanel( 0 );

	return {

		REVISION: 16,

		dom: container,

		addPanel: addPanel,
		showPanel: showPanel,

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();

			msPanel.update( time - beginTime, 200 );

			if ( time > prevTime + 1000 ) {

				fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

				prevTime = time;
				frames = 0;

				if ( memPanel ) {

					var memory = performance.memory;
					memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

				}

			}

			return time;

		},

		update: function () {

			beginTime = this.end();

		},

		// Backwards Compatibility

		domElement: container,
		setMode: showPanel

	};

};

Stats.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 80 * PR, HEIGHT = 48 * PR,
			TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
			GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
			GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

	var canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:80px;height:48px';

	var context = canvas.getContext( '2d' );
	context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	context.fillStyle = bg;
	context.fillRect( 0, 0, WIDTH, HEIGHT );

	context.fillStyle = fg;
	context.fillText( name, TEXT_X, TEXT_Y );
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	context.fillStyle = bg;
	context.globalAlpha = 0.9;
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	return {

		dom: canvas,

		update: function ( value, maxValue ) {

			min = Math.min( min, value );
			max = Math.max( max, value );

			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, GRAPH_Y );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

			context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

		}

	};

};

// https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
// https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query_webgl2/
class GPUStatsPanel extends Stats.Panel {

	constructor( context, name = 'GPU MS' ) {

		super( name, '#f90', '#210' );

		let isWebGL2 = true;
		let extension = context.getExtension( 'EXT_disjoint_timer_query_webgl2' );
		if ( extension === null ) {

			isWebGL2 = false;
			extension = context.getExtension( 'EXT_disjoint_timer_query' );

			if ( extension === null ) {

				console.warn( 'GPUStatsPanel: disjoint_time_query extension not available.' );

			}

		}

		this.context = context;
		this.extension = extension;
		this.maxTime = 30;
		this.activeQueries = 0;

		this.startQuery = function () {

			const gl = this.context;
			const ext = this.extension;

			if ( ext === null ) {

				return;

			}

			// create the query object
			let query;
			if ( isWebGL2 ) {

				query = gl.createQuery();
				gl.beginQuery( ext.TIME_ELAPSED_EXT, query );

			} else {

				query = ext.createQueryEXT();
				ext.beginQueryEXT( ext.TIME_ELAPSED_EXT, query );

			}

			this.activeQueries ++;

			const checkQuery = () => {

				// check if the query is available and valid
				let available, disjoint, ns;
				if ( isWebGL2 ) {

					available = gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE );
					disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
					ns = gl.getQueryParameter( query, gl.QUERY_RESULT );

				} else {

					available = ext.getQueryObjectEXT( query, ext.QUERY_RESULT_AVAILABLE_EXT );
					disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
					ns = ext.getQueryObjectEXT( query, ext.QUERY_RESULT_EXT );

				}

				const ms = ns * 1e-6;
				if ( available ) {

					// update the display if it is valid
					if ( ! disjoint ) {

						this.update( ms, this.maxTime );

					}

					this.activeQueries --;


				} else if ( gl.isContextLost() === false ) {

					// otherwise try again the next frame
					requestAnimationFrame( checkQuery );

				}

			};

			requestAnimationFrame( checkQuery );

		};

		this.endQuery = function () {

			// finish the query measurement
			const ext = this.extension;
			const gl = this.context;

			if ( ext === null ) {

				return;

			}

			if ( isWebGL2 ) {

				gl.endQuery( ext.TIME_ELAPSED_EXT );

			} else {

				ext.endQueryEXT( ext.TIME_ELAPSED_EXT );

			}

		};

	}

}

/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:24:20
 * @FilePath: /threejs-demo/packages/app/CAD/src/postprocessing/Pass.js
 */

class Pass {

	constructor() {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	}

	setSize( /* width, height */ ) {}

	render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

	dispose() {}

}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new THREE.BufferGeometry();
_geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
_geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

class FullScreenQuad {

	constructor( material ) {

		this._mesh = new THREE.Mesh( _geometry, material );

	}

	dispose() {

		this._mesh.geometry.dispose();

	}

	render( renderer ) {

		renderer.render( this._mesh, _camera );

	}

	get material() {

		return this._mesh.material;

	}

	set material( value ) {

		this._mesh.material = value;

	}

}

/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:23:43
 * @FilePath: /threejs-demo/packages/app/CAD/src/postprocessing/RenderPass.js
 */

class RenderPass extends Pass {

	constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.overrideMaterial = overrideMaterial;

		this.clearColor = clearColor;
		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;
		this._oldClearColor = new THREE.Color();

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		let oldClearAlpha, oldOverrideMaterial;

		if ( this.overrideMaterial !== undefined ) {

			oldOverrideMaterial = this.scene.overrideMaterial;

			this.scene.overrideMaterial = this.overrideMaterial;

		}

		if ( this.clearColor ) {

			renderer.getClearColor( this._oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.clearDepth();

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
		if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
		renderer.render( this.scene, this.camera );

		if ( this.clearColor ) {

			renderer.setClearColor( this._oldClearColor, oldClearAlpha );

		}

		if ( this.overrideMaterial !== undefined ) {

			this.scene.overrideMaterial = oldOverrideMaterial;

		}

		renderer.autoClear = oldAutoClear;

	}

}

/**
 * Full-screen textured quad shader
 */

const CopyShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


		}`

};

/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:24:06
 * @FilePath: /threejs-demo/packages/app/CAD/src/postprocessing/ShaderPass.js
 */

class ShaderPass extends Pass {

	constructor( shader, textureID ) {

		super();

		this.textureID = ( textureID !== undefined ) ? textureID : 'tDiffuse';

		if ( shader instanceof THREE.ShaderMaterial ) {

			this.uniforms = shader.uniforms;

			this.material = shader;

		} else if ( shader ) {

			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			this.material = new THREE.ShaderMaterial( {

				defines: Object.assign( {}, shader.defines ),
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader

			} );

		}

		this.fsQuad = new FullScreenQuad( this.material );

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.fsQuad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			this.fsQuad.render( renderer );

		}

	}

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

class MaskPass extends Pass {

	constructor( scene, camera ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		this.needsSwap = false;

		this.inverse = false;

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const context = renderer.getContext();
		const state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		let writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );
		state.buffers.stencil.setLocked( true );

		// draw into the stencil buffer

		renderer.setRenderTarget( readBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.setLocked( false );
		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
		state.buffers.stencil.setLocked( true );

	}

}

class ClearMaskPass extends Pass {

	constructor() {

		super();

		this.needsSwap = false;

	}

	render( renderer /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		renderer.state.buffers.stencil.setLocked( false );
		renderer.state.buffers.stencil.setTest( false );

	}

}

class EffectComposer {

	constructor( renderer, renderTarget ) {

		this.renderer = renderer;

		if ( renderTarget === undefined ) {

			const size = renderer.getSize( new THREE.Vector2() );
			this._pixelRatio = renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = new THREE.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio );
			renderTarget.texture.name = 'EffectComposer.rt1';

		} else {

			this._pixelRatio = 1;
			this._width = renderTarget.width;
			this._height = renderTarget.height;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;

		this.passes = [];

		this.copyPass = new ShaderPass( CopyShader );

		this.clock = new THREE.Clock();

	}

	swapBuffers() {

		const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

	addPass( pass ) {

		this.passes.push( pass );
		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	}

	insertPass( pass, index ) {

		this.passes.splice( index, 0, pass );
		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	}

	removePass( pass ) {

		const index = this.passes.indexOf( pass );

		if ( index !== - 1 ) {

			this.passes.splice( index, 1 );

		}

	}

	isLastEnabledPass( passIndex ) {

		for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {

			if ( this.passes[ i ].enabled ) {

				return false;

			}

		}

		return true;

	}

	render( deltaTime ) {

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = this.clock.getDelta();

		}

		const currentRenderTarget = this.renderer.getRenderTarget();

		let maskActive = false;

		for ( let i = 0, il = this.passes.length; i < il; i ++ ) {

			const pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					const context = this.renderer.getContext();
					const stencil = this.renderer.state.buffers.stencil;

					//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

					//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
					stencil.setFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( MaskPass !== undefined ) {

				if ( pass instanceof MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

		this.renderer.setRenderTarget( currentRenderTarget );

	}

	reset( renderTarget ) {

		if ( renderTarget === undefined ) {

			const size = this.renderer.getSize( new THREE.Vector2() );
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	}

	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

		for ( let i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

		}

	}

	setPixelRatio( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

	dispose() {

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();

		this.copyPass.dispose();

	}

}

/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:23:55
 * @FilePath: /threejs-demo/packages/app/CAD/src/lib/constant.js
 */

const MOUSESTYLE = {
  SELECT: 'default',
  PAN: 'move',
  ZOOM: 'zoom-in',
  ROTATE: 'alias',
};

const VIEWPOSITION = {
  '3D': new THREE.Vector3(1000, 1000, 1000),
  XY: new THREE.Vector3(0, 0, 1000),
  XZ: new THREE.Vector3(0, 1000, 0),
  YZ: new THREE.Vector3(1000, 0, 0),
};

const S = 15;

/*
 * @Date: 2023-04-03 18:22:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:22:53
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Collector.js
 */

let currentAncestorId = null;
let currentParentId = null;
let selfId = null;

class Tip {
    constructor(selfId,parentId,ancestorId){
        this.id = selfId;
        this.parentId = parentId;
        this.ancestorId = ancestorId;
    }
}

class Collector{
    constructor(){
        this.scene = new THREE.Scene();
        this.textures = new Map();
        this.materials = new Map();
        this.geometries = new Map();
        this._exclusion = [];
        this.pool = [];
    }


    set exclusion(newValue){
        this._exclusion = newValue;
        this.textures.clear();
        this.materials.clear();
        this.geometries.clear();
        this.pool.length = 0;
        this.scene.children.forEach(obj=>this.track(obj,true));
    }


    track(object3D){
        this.scene.add(object3D);
        if(!this._exclusion.includes(object3D.type)){
            this.pool.push(object3D);
        }
    }

    collect(object){
        selfId = object.id;
        const isNeedCollect = object.children.length !== 0;
        if(isNeedCollect){
            object.children.forEach(o=>{
                this.collect(o);
                currentParentId = o.id;
            });
        }else {
            currentParentId = object?.parent?.id;
        }
        if(object.geometry !== undefined){
            this.geometries.set(new Tip(selfId,currentParentId,currentAncestorId),object.geometry);
        }
        if(object.material !== undefined){
            const material = object.material;
            if(Array.isArray(material)){
                material.forEach(m=>{
                    this.materials.set(new Tip(selfId,currentParentId,currentAncestorId),m);
                    this.collectTexture(m);
                });
            }else {
                this.materials.set(new Tip(selfId,currentParentId,currentAncestorId),material);
                this.collectTexture(material);
            }
        }
    }

    collectTexture(material){
        const inTextures = (texture)=>this.materials.set(new Tip(material.id,currentParentId,currentAncestorId),texture);
        material.alphaMap && inTextures(material.alphaMap);
        material.aoMap && inTextures(material.aoMap);
        material.envMap && inTextures(material.envMap);
        material.lightMap && inTextures(material.lightMap);
        material.map && inTextures(material.map);
        material.specularMap && inTextures(material.specularMap);
    }

    release(object){
        this.scene.remove(object);
        if(object.geometry){
            object.geometry.dispose();
        }
        if( object.material){
            if(Array.isArray(object.material)){
                object.material.forEach(m=>m.dispose());
            }else {
                object.material.dispose();
            }
        }
    }
}

const raycaster = new THREE.Raycaster();
const raycastObjects = [];

class CAD {
  constructor(container, width, height) {
    this.height = height || window.innerHeight;
    this.width = width || window.innerWidth;
    this._container = container;
    container.style.position = 'absolute';
    this.collector = new Collector();
    // this.scene = new Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#ffffff');
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    const aspect = S * (this.height / this.width);
    this.cameras = {
      '3D': new THREE.OrthographicCamera(-S, S, aspect, -aspect, 1, 100000),
      '2D': new THREE.OrthographicCamera(-S, S, aspect, -aspect, 1, 100000),
    };
    this.mainCamera = this.cameras['3D'];
    this.cameras['3D'].up.set(0, 0, 1);
    this.cameras['3D'].position.copy(VIEWPOSITION['3D']);
    this.cameras['3D'].name = '3D';
    this.deputyCamera = this.cameras['2D'];
    this.cameras['2D'].up.set(0, 0, 1);
    this.cameras['2D'].position.copy(VIEWPOSITION.XY);
    this.cameras['2D'].name = '2D';
    this.orbitControls = new OrbitControls(this.mainCamera, this.renderer.domElement);
    this.trasnlater = new TransformControls(this.mainCamera, this.renderer.domElement);
    this.viewHelper = new ViewHelper(this.mainCamera, this.renderer.domElement);
    this.viewHelper.position.set(0.5, 0.5, 0);
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.gpuPanel = new GPUStatsPanel(this.renderer.getContext());
    this.stats.addPanel(this.gpuPanel);
    this.stats.showPanel(0);
    this.userData = {};
    this.mainView = '3D';
    container.appendChild(this.stats.dom);
    container.appendChild(this.renderer.domElement);
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.collector.scene, this.mainCamera);
    this.composer.addPass(this.renderPass);
    this.mode = 'SELECT';
    this.setMode(this.mode);
    this.listenerControl();
    this.selectChange = () => {};
  }

  add(object) {
    this.collector.track(object);
  }

  remove(object) {
    this.collector.release(object);
  }

  removeById(id) {
    this.remove(this.collector.scene.getObjectById(id));
  }

  setView(viewName) {
    this.mainView = viewName;
    if (viewName === '3D') {
      this.mainCamera = this.cameras['3D'];
      this.deputyCamera = this.cameras['2D'];
    } else {
      this.mainCamera = this.cameras['2D'];
      this.mainCamera.position.copy(VIEWPOSITION[viewName]);
      this.deputyCamera = this.cameras['3D'];
      this.mainCamera.updateProjectionMatrix();
    }
    this.renderPass.camera = this.viewHelper.editorCamera = this.orbitControls.object = this.mainCamera;
  }

  setMode(modeName) {
    this.mode = modeName;
    if (modeName === 'SELECT') {
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      this._container.style.cursor = MOUSESTYLE.SELECT;
    } else if (modeName === 'ZOOM') {
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.DOLLY,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      this._container.style.cursor = MOUSESTYLE.ZOOM;
    } else if (modeName === 'PAN') {
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      this._container.style.cursor = MOUSESTYLE.PAN;
    } else if (modeName === 'ROTATE') {
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: -1,
      };
      this._container.style.cursor = MOUSESTYLE.ROTATE;
    }
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.gpuPanel.startQuery();
    this.renderer.clear();
    // main
    this.composer.render();
    // others
    this.orbitControls.update();// !important
    this.viewHelper.render(this.renderer);
    this.stats.update();
    this.gpuPanel.endQuery();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(this.width, this.height);
    const aspect = S * height / width;
    Object.values(this.cameras).forEach((camera) => {
      camera.top = aspect;
      camera.bottom = -aspect;
      camera.updateProjectionMatrix();
    });
  }

  listenerControl() {
    const pointer = new THREE.Vector2();
    this.renderer.domElement.addEventListener('click', (event) => {
      pointer.x = (event.clientX / this.width) * 2 - 1;
      pointer.y = -(event.clientY / this.height) * 2 + 1;
      raycaster.setFromCamera(pointer, this.mainCamera);
      raycastObjects.length = [];
      raycaster.intersectObjects(this.collector.pool, true, raycastObjects);
      this.selectChange(raycastObjects);
    });
  }
}

/*
 * @Date: 2023-06-13 23:12:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 00:20:42
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Control.js
 */

class Control {
    constructor(editor){
        this.orbitControls  = new OrbitControls(editor.camera,editor.target);
        this.tranformControls = new TransformControls(editor.camera,editor.target);
 

        this.orbitControls.addEventListener('change',()=>{
            editor.render();
        });
    }
}

/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-15 14:31:34
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/ViewPort.js
 */



class ViewPort {
  constructor(editor) {
    editor.signal;
    const renderer = initRenderer();
    const camera = editor.camera;
    const scene = editor.scene;
    const sceneHelper = editor.sceneHelper;
    const target = editor.target;

    target.append(renderer.domElement);

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888);
    gridHelper.isHelper = true;

    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;

    const transformControls = new TransformControls(camera, target);
    transformControls.addEventListener("change", onTransformControlsChange);
    transformControls.addEventListener("mouseDown",onTransformControlsMouseDown);
    transformControls.addEventListener("mouseUp", onTransformControlsMouseUp);
    sceneHelper.add(transformControls);

    const controls = new EditorControls(camera, target);
    controls.addEventListener("change", () => onRender());

    const viewHelper = new ViewHelper(camera, target);
    viewHelper.controls = controls;

    const box = new THREE.Box3();
    const selectionBox = new THREE.Box3Helper(box);
    selectionBox.visible = false;
    selectionBox.material.transparent = true;
    selectionBox.material.depthTest = false;
    sceneHelper.add(selectionBox);

    new THREE.Raycaster();
    new THREE.Vector2();

    function onRender() {
      performance.now();

      renderer.render(scene, camera);
      renderer.autoClear = false;
      sceneHelper.add(gridHelper);
      renderer.render(sceneHelper, camera);
      sceneHelper.remove(gridHelper);
      viewHelper.render(renderer);
      renderer.autoClear = true;

      performance.now();
    }

    function onResize() {
      const { width, height } = target.getBoundingClientRect();

      renderer.setSize(width, height);

      if (camera.type === "OrthographicCamera") {
        camera.top = 15 * (height / width);

        camera.bottom = -15 * (height / width);
      } else if (camera.type === "PerspectiveCamera") {
        camera.aspect = width / height;
      }

      camera.updateProjectionMatrix();
    }

    function onTransformControlsChange() {
      const object = transformControls.object;

      if (object !== undefined) {
        box.setFromObject(object, true);
        onRender();
      }
    }

    function onTransformControlsMouseDown() {
      const object = transformControls.object;

      if (object !== undefined) {
        objectPositionOnDown = object.position.clone();
        objectRotationOnDown = object.rotation.clone();
        objectScaleOnDown = object.scale.clone();

        controls.enabled = false;
      }
    }

    function onTransformControlsMouseUp() {
      const object = transformControls.object;

      if (object !== undefined) {
        switch (transformControls.getMode) {
          case "translate":
            if (!objectPositionOnDown.equals(object.position)) ;
            break;
          case "rotate":
            if (!objectRotationOnDown.equals(object.rotation)) ;
            break;
          case "scale":
            if (!objectScaleOnDown.equals(object.scale)) ;
            break;
        }
        controls.enabled = true;
      }
    }



    onResize();
    onRender();
  }
}

exports.CAD = CAD;
exports.Collector = Collector;
exports.Container = Container;
exports.Control = Control;
exports.CoordinateHelper = CoordinateHelper;
exports.CustomGridHelper = CustomGridHelper;
exports.Editor = Editor;
exports.ViewHelper = ViewHelper;
exports.ViewPort = ViewPort;
