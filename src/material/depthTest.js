import {
  Vector3,
  Mesh,
  BoxGeometry,
  PlaneGeometry,
  SphereGeometry,
  ConeGeometry,
  MeshStandardMaterial,
  NeverDepth,
  AlwaysDepth,
  LessDepth,
  LessEqualDepth,
  GreaterDepth,
  GreaterEqualDepth,
  NotEqualDepth,
  WebGLRenderTarget,
  DepthTexture,
  ShaderMaterial,
  Vector2,
  OrthographicCamera,
  DepthFormat,
  UnsignedShortType,
  NearestFilter,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initOrbitControls,
  initScene,
  initDirectionLight,
  initGUI,
  initAmbientLight,
} from "../lib/tools/index.js";
import { printRenderTarget, printTexture } from "../lib/util/catch.js";

window.onload = () => {
  init();
};

const depthFunc = {
  AlwaysDepth,
  LessDepth,
  NeverDepth,
  LessEqualDepth,
  GreaterDepth,
  GreaterEqualDepth,
  NotEqualDepth,
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D tDepth;
    uniform float uCameraNear;
	uniform float uCameraFar;

    float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	    // -near maps to 0; -far maps to 1
	    return ( viewZ + near ) / ( near - far );
    }

    float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	    // maps orthographic depth in [ 0, 1 ] to viewZ
	    return depth * ( near - far ) - near;
    }

    float readDepth( sampler2D depthSampler, vec2 coord ) {
        float fragCoordZ = texture2D( depthSampler, coord ).x;
        float viewZ = orthographicDepthToViewZ( fragCoordZ, uCameraNear, uCameraFar );
        return viewZToOrthographicDepth( viewZ, uCameraNear, uCameraFar );
    }

    void main() {
        float depth = readDepth( tDepth, vUv );
        // float depth = smoothstep(uCameraNear, uCameraFar,  gl_FragCoord.z);

        gl_FragColor.rgb = 1.0 - vec3( depth );
        gl_FragColor.a = 1.0;
    }
`;

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(0, -100, 70));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.5;
  camera.updateProjectionMatrix();

  const scene = initScene();

  initAmbientLight(scene);

  const light = initDirectionLight();
  light.position.set(40, -40, 70);
  scene.add(light);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const size = new Vector2();
  renderer.getSize(size);

  const renderTarget = new WebGLRenderTarget(size.x, size.y, {
    depthTexture: new DepthTexture(size.x, size.y),
  });
  renderTarget.depthTexture.format = DepthFormat;
  renderTarget.depthTexture.type = UnsignedShortType;
  renderTarget.depthTexture.minFilter = NearestFilter;
  renderTarget.depthTexture.magFilter = NearestFilter;

  const plant = new Mesh(
    new PlaneGeometry(40, 20),
    new MeshStandardMaterial({ color: "chartreuse", side: 2 })
  );
  plant.rotateX(Math.PI / 2);

  const box = new Mesh(
    new BoxGeometry(10, 10, 10),
    new MeshStandardMaterial({ color: "yellow" })
  );
  box.position.set(-15, 15, 0);

  const sphere = new Mesh(
    new SphereGeometry(6, 32, 32),
    new MeshStandardMaterial({
      color: "red",
      depthFunc: depthFunc.GreaterDepth,
    })
  );
  sphere.position.set(15, 15, 0);

  const cone = new Mesh(
    new ConeGeometry(6, 12, 32),
    new MeshStandardMaterial({
      color: "deepSkyBlue",
      depthFunc: depthFunc.NotEqualDepth,
    })
  );
  cone.position.set(0, -15, 0);

  scene.add(box, plant, sphere, cone);
  const depthCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const depthPlant = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      uniforms: {
        tDepth: { value: renderTarget.depthTexture },
        uCameraFar: { value: camera.far },
        uCameraNear: { value: camera.near },
      },
      vertexShader,
      fragmentShader,
    })
  );

  const gui = initGUI();
  const df = gui.addFolder("DepthFunc");
  df.add(box.material, "depthFunc", depthFunc).name("Box").disable();
  df.add(plant.material, "depthFunc", depthFunc).name("Plant");
  df.add(sphere.material, "depthFunc", depthFunc).name("Sphere");
  df.add(cone.material, "depthFunc", depthFunc).name("Cone");

  gui.add(
    {
      catch() {
        printRenderTarget("renderTarget", renderer, renderTarget);
        printTexture("depthTexture", renderTarget.depthTexture, renderer);
      },
    },
    "catch"
  );

  function render(t) {
    const time = t / 1000;
    box.rotation.x = box.rotation.y = time;
    cone.rotation.z = time;
    cone.rotation.x = Math.sin(time) * 0.5;
    sphere.position.x = 13 + Math.sin(time) * 3;
    orbitControls.update();

    renderer.setViewport(0, 0, size.x, size.y);
    renderer.setScissor(0, 0, size.x, size.y);
    renderer.render(scene, camera);
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    depthPlant.material.uniforms.tDepth.value = renderTarget.depthTexture;

    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, size.x * 0.3, size.y * 0.3);
    renderer.setScissor(0, 0, size.x * 0.3, size.y * 0.3);
    renderer.render(depthPlant, depthCamera);
    renderer.setRenderTarget(null);
    renderer.setScissorTest(false);

    requestAnimationFrame(render);
  }
  render();
  resize(renderer, camera, (w, h) => {
    size.set(w, h);
    renderTarget.setSize(w, h);
    renderTarget.depthTexture.dispose();
    renderTarget.depthTexture = new DepthTexture(w, h);
  });
}
