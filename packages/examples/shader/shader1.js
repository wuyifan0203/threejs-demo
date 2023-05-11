/* eslint-disable operator-linebreak */
/*
 * @Date: 2023-05-10 18:26:20
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-11 17:53:30
 * @FilePath: /threejs-demo/packages/examples/shader/shader1.js
 * @ShaderExample:https://www.shadertoy.com/view/4dl3zn
 */
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  Vector3,
  Scene,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  Vector2,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  resize,
} from '../../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  const camera = initPerspectiveCamera(new Vector3(0, 0, 10));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene = new Scene();

  renderer.setClearColor(0xffffff);

  const orbitControls = new OrbitControls(camera, renderer.domElement);

  const vertexShader = `
  precision mediump float;
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

  const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform float iTime;
  uniform vec2 iResolution;

  void main(){
      // origin code: vec2 uv = (2.0*fragCoord-iResolution.xy) / iResolution.y;
      vec2 uv = -1.0 + 2.0 * vUv;
      uv.x *=  iResolution.x / iResolution.y;
      // background 
      vec3 color = vec3(0.8 + 0.2 * uv.y);

      // bubbles
      for( int i = 0; i < 40; i++ ){
        // bubble seeds
        float pha = sin(float(i) * 546.13 + 1.0) * 0.5 + 0.5;
        float siz = pow(sin(float(i) * 651.74 + 5.0) * 0.5 + 0.5, 4.0);
        float pox = sin(float(i) * 321.55 + 4.1) * iResolution.x / iResolution.y;

        // bubble size, position and color
        float rad = 0.1 + 0.5 * siz;
        vec2  pos = vec2(pox, -1.0 - rad + (2.0 + 2.0 * rad) * mod(pha + 0.1 * iTime * (0.2 + 0.8 * siz),1.0));
        float dis = length(uv - pos);
        vec3  col = mix(vec3(0.94, 0.3, 0.0), vec3(0.1, 0.4, 0.8), 0.5 + 0.5 * sin(float(i) * 1.2 + 1.9));
        //    col+= 8.0*smoothstep( rad*0.95, rad, dis );

        // render
        float f = length(uv-pos) / rad;
        f = sqrt(clamp(1.0 - f * f, 0.0, 1.0));
        color -= col.zyx * (1.0 - smoothstep(rad * 0.95, rad, dis)) * f;
      }

      // vigneting
      color *= sqrt(1.5 - 0.5 * length(uv));

      gl_FragColor = vec4(color, 1.0);
  }`;

  const material = new ShaderMaterial({
    uniforms: {
      iTime: {
        value: 1.0,
      },
      iResolution: {
        value: new Vector2(1, 1),
      },
    },
    vertexShader,
    fragmentShader,
  });

  const geometry = new PlaneGeometry(10, 10, 10);

  const mesh = new Mesh(geometry, material);

  scene.add(mesh);

  resize(renderer, camera);

  const startTime = Date.now();

  function render() {
    material.uniforms.iTime.value = (Date.now() - startTime) / 1000;
    material.uniformsNeedUpdate = true;
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
