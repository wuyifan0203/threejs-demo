(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("three"), require("signals"), require("three/examples/jsm/postprocessing/EffectComposer"), require("three/examples/jsm/controls/OrbitControls"), require("three/examples/jsm/postprocessing/RenderPass"), require("three/examples/jsm/postprocessing/ShaderPass"), require("three/examples/jsm/shaders/CopyShader"), require("three/examples/jsm/controls/TransformControls"), require("three/examples/jsm/libs/stats.module")) : typeof define === "function" && define.amd ? define(["exports", "three", "signals", "three/examples/jsm/postprocessing/EffectComposer", "three/examples/jsm/controls/OrbitControls", "three/examples/jsm/postprocessing/RenderPass", "three/examples/jsm/postprocessing/ShaderPass", "three/examples/jsm/shaders/CopyShader", "three/examples/jsm/controls/TransformControls", "three/examples/jsm/libs/stats.module"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.CadLibrary = {}, global.three, global.signals, global.EffectComposer, global.OrbitControls, global.RenderPass, global.ShaderPass, global.CopyShader, global.TransformControls, global.stats));
})(this, function(exports2, three, signals, EffectComposer, OrbitControls, RenderPass, ShaderPass, CopyShader$1, TransformControls, StatsPanel) {
  "use strict";
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
        objectsSelected: new signals.Signal(),
        intersectionsDetected: new signals.Signal(),
        objectsAdded: new signals.Signal(),
        sceneGraphChanged: new signals.Signal(),
        sceneRendered: new signals.Signal(),
        transformModeChange: new signals.Signal(),
        objectsRemoved: new signals.Signal()
      };
      this.scene = new three.Scene();
      this.scene.name = "main-scene";
      this.sceneHelper = new three.Scene();
      this.sceneHelper.name = "scene-helper";
      this.sceneBackground = new three.Scene();
      this.sceneBackground.name = "scene-background";
      this.sceneBackground.background = new three.Color(0);
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
  const FXAAShader = {
    uniforms: {
      "tDiffuse": { value: null },
      "resolution": { value: new three.Vector2(1 / 1024, 1 / 512) }
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
      this.size = new three.Vector2();
      this.name = "";
      this.type = "ViewPort";
      this.onAfterRender = () => {
      };
      this.onBeforeRender = () => {
      };
      this.renderer = new three.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
      this.renderer.setClearColor(15724527);
      this.renderer.autoClear = false;
      this.domElement = document.createElement("div");
      this.domElement.style.position = "absolute";
      this.domElement.setAttribute("id", "F-ViewPort");
      this.domElement.appendChild(this.renderer.domElement);
      domElement.append(this.domElement);
      const { sceneBackground, scene, sceneHelper } = this.editor;
      const bgRenderPass = new RenderPass.RenderPass(sceneBackground, this.camera);
      bgRenderPass.clear = false;
      const mainRenderPass = new RenderPass.RenderPass(scene, this.camera);
      mainRenderPass.clear = false;
      const helperRenderPass = new RenderPass.RenderPass(sceneHelper, this.camera);
      helperRenderPass.clear = false;
      const copyPass = new ShaderPass.ShaderPass(CopyShader$1.CopyShader);
      const fxaaPass = new ShaderPass.ShaderPass(FXAAShader);
      this.composer = new EffectComposer.EffectComposer(this.renderer);
      this.composer.addPass(bgRenderPass);
      this.composer.addPass(mainRenderPass);
      this.composer.addPass(helperRenderPass);
      this.composer.addPass(fxaaPass);
      this.composer.addPass(copyPass);
      this.orbitControls = new OrbitControls.OrbitControls(camera, this.renderer.domElement);
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
  const _camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const _geometry = new three.BufferGeometry();
  _geometry.setAttribute("position", new three.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
  _geometry.setAttribute("uv", new three.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  class FullScreenQuad {
    constructor(material) {
      this._mesh = new three.Mesh(_geometry, material);
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
  class OutlinePass extends Pass {
    constructor(resolution, scene, camera, selectedObjects) {
      super();
      this.renderScene = scene;
      this.renderCamera = camera;
      this.selectedObjects = selectedObjects !== void 0 ? selectedObjects : [];
      this.visibleEdgeColor = new three.Color(1, 1, 1);
      this.hiddenEdgeColor = new three.Color(0.1, 0.04, 0.02);
      this.edgeGlow = 0;
      this.usePatternTexture = false;
      this.edgeThickness = 1;
      this.edgeStrength = 3;
      this.downSampleRatio = 2;
      this.pulsePeriod = 0;
      this._visibilityCache = /* @__PURE__ */ new Map();
      this.resolution = resolution !== void 0 ? new three.Vector2(resolution.x, resolution.y) : new three.Vector2(256, 256);
      const resx = Math.round(this.resolution.x / this.downSampleRatio);
      const resy = Math.round(this.resolution.y / this.downSampleRatio);
      this.renderTargetMaskBuffer = new three.WebGLRenderTarget(this.resolution.x, this.resolution.y);
      this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
      this.renderTargetMaskBuffer.texture.generateMipmaps = false;
      this.depthMaterial = new three.MeshDepthMaterial();
      this.depthMaterial.side = three.DoubleSide;
      this.depthMaterial.depthPacking = three.RGBADepthPacking;
      this.depthMaterial.blending = three.NoBlending;
      this.prepareMaskMaterial = this.getPrepareMaskMaterial();
      this.prepareMaskMaterial.side = three.DoubleSide;
      this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(this.prepareMaskMaterial.fragmentShader, this.renderCamera);
      this.renderTargetDepthBuffer = new three.WebGLRenderTarget(this.resolution.x, this.resolution.y, { type: three.HalfFloatType });
      this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
      this.renderTargetDepthBuffer.texture.generateMipmaps = false;
      this.renderTargetMaskDownSampleBuffer = new three.WebGLRenderTarget(resx, resy, { type: three.HalfFloatType });
      this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample";
      this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;
      this.renderTargetBlurBuffer1 = new three.WebGLRenderTarget(resx, resy, { type: three.HalfFloatType });
      this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
      this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
      this.renderTargetBlurBuffer2 = new three.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), { type: three.HalfFloatType });
      this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
      this.renderTargetBlurBuffer2.texture.generateMipmaps = false;
      this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
      this.renderTargetEdgeBuffer1 = new three.WebGLRenderTarget(resx, resy, { type: three.HalfFloatType });
      this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
      this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
      this.renderTargetEdgeBuffer2 = new three.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), { type: three.HalfFloatType });
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
      this.copyUniforms = three.UniformsUtils.clone(copyShader.uniforms);
      this.materialCopy = new three.ShaderMaterial({
        uniforms: this.copyUniforms,
        vertexShader: copyShader.vertexShader,
        fragmentShader: copyShader.fragmentShader,
        blending: three.NoBlending,
        depthTest: false,
        depthWrite: false
      });
      this.enabled = true;
      this.needsSwap = false;
      this._oldClearColor = new three.Color();
      this.oldClearAlpha = 1;
      this.fsQuad = new FullScreenQuad(null);
      this.tempPulseColor1 = new three.Color();
      this.tempPulseColor2 = new three.Color();
      this.textureMatrix = new three.Matrix4();
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
      return new three.ShaderMaterial({
        uniforms: {
          "depthTexture": { value: null },
          "cameraNearFar": { value: new three.Vector2(0.5, 0.5) },
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
      return new three.ShaderMaterial({
        uniforms: {
          "maskTexture": { value: null },
          "texSize": { value: new three.Vector2(0.5, 0.5) },
          "visibleEdgeColor": { value: new three.Vector3(1, 1, 1) },
          "hiddenEdgeColor": { value: new three.Vector3(1, 1, 1) }
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
      return new three.ShaderMaterial({
        defines: {
          "MAX_RADIUS": maxRadius
        },
        uniforms: {
          "colorTexture": { value: null },
          "texSize": { value: new three.Vector2(0.5, 0.5) },
          "direction": { value: new three.Vector2(0.5, 0.5) },
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
      return new three.ShaderMaterial({
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
        blending: three.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true
      });
    }
  }
  OutlinePass.BlurDirectionX = new three.Vector2(1, 0);
  OutlinePass.BlurDirectionY = new three.Vector2(0, 1);
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
  class ViewHelper extends ViewHelper$1 {
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
    constructor(transformControl, editor) {
      this.transformControl = transformControl;
      this.objectPositionOnDown = new three.Vector3();
      this.objectRotationOnDown = new three.Quaternion();
      this.objectScaleOnDown = new three.Vector3();
      this.editor = editor;
    }
    handleChange() {
      const { object } = this.transformControl;
      if (object !== void 0) {
        this.editor.signals.sceneGraphChanged.dispatch();
      }
    }
    handleMouseDown(orbitControls) {
      const { object } = this.transformControl;
      if (object !== void 0) {
        this.objectPositionOnDown.copy(object.position);
        this.objectRotationOnDown.copy(object.quaternion);
        this.objectScaleOnDown.copy(object.scale);
        orbitControls.enabled = false;
      }
    }
    handleMouseUp(orbitControls) {
      const { object } = this.transformControl;
      if (object !== void 0) {
        switch (this.transformControl.getMode()) {
          case "translate":
            if (!this.objectPositionOnDown.equals(object.position)) {
              this.editor.dispatchEvent("objectTranslate", object, this.objectPositionOnDown, object.position);
            }
            break;
          case "rotate":
            if (!this.objectRotationOnDown.equals(object.quaternion)) {
              this.editor.dispatchEvent("objectRotate", object, this.objectRotationOnDown, object.quaternion);
            }
            break;
          case "scale":
            if (!this.objectScaleOnDown.equals(object.scale)) {
              this.editor.dispatchEvent("objectScale", object, this.objectScaleOnDown, object.scale);
            }
            break;
        }
        orbitControls.enabled = true;
      }
    }
  }
  const _raycaster = new three.Raycaster();
  const _mouse = new three.Vector2();
  const _onDownPosition = new three.Vector2();
  const _onUpPosition = new three.Vector2();
  class MainViewPort extends ViewPort {
    constructor(editor, camera, domElement) {
      super(editor, camera, domElement);
      this.type = "MainViewPort";
      this.clock = new three.Clock();
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
      this.viewHelper = new ViewHelper(camera, this.domElement);
      this.transformControl = new TransformControls.TransformControls(camera, this.renderer.domElement);
      this.editor.addHelper(this.transformControl);
      const handler = new TransformControlHandler(this.transformControl, editor);
      this.transformControl.addEventListener("change", () => handler.handleChange());
      this.transformControl.addEventListener("mouseDown", () => handler.handleMouseDown(this.orbitControls));
      this.transformControl.addEventListener("mouseUp", () => handler.handleMouseUp(this.orbitControls));
      const outlinePass = new OutlinePass(this.size, this.editor.scene, this.camera);
      outlinePass.hiddenEdgeColor = outlinePass.visibleEdgeColor = new three.Color("#e29240");
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
    setOptionMode(mode) {
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
  exports2.Container = Container;
  exports2.Editor = Editor;
  exports2.MainViewPort = MainViewPort;
  exports2.ViewHelper = ViewHelper;
  exports2.ViewPort = ViewPort;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
