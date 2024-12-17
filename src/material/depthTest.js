import {
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
  PerspectiveCamera,
} from "three";
import {
  initRenderer,
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

    float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
      // -near maps to 0; -far maps to 1
      return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
    }
    
    float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
      // maps perspective depth in [ 0, 1 ] to viewZ
      return ( near * far ) / ( ( far - near ) * depth - far );
    }

    float readDepth( sampler2D depthSampler, vec2 coord ) {
        float fragCoordZ = texture2D( depthSampler, coord ).x;
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, uCameraNear, uCameraFar );
        return viewZToPerspectiveDepth( viewZ, uCameraNear, uCameraFar );
    }

    void main() {
        float depth = readDepth( tDepth, vUv );
        depth = pow(depth,3.0);

        gl_FragColor.rgb = 1.0 - vec3( depth );
        gl_FragColor.a = 1.0;
    }
`;

const fragmentShaderTexture = /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;

    vec4 gammaCorrect( in vec4 value ) {
      return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
    }
    
    void main() {
        gl_FragColor = gammaCorrect(texture2D( tDiffuse, vUv ));
    }
`;

function init() {
  const renderer = initRenderer();
  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    10,
    60
  );
  camera.position.set(0, -30, 25);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const scene = initScene();

  initAmbientLight(scene);

  const light = initDirectionLight();
  light.position.set(40, -40, 70);
  scene.add(light);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const size = new Vector2();
  renderer.getSize(size);

  // init target
  // #region
  const renderTarget = new WebGLRenderTarget(size.x, size.y);
  renderTarget.depthTexture = new DepthTexture();
  renderTarget.depthTexture.format = DepthFormat;
  renderTarget.depthTexture.type = UnsignedShortType;
  renderTarget.depthTexture.minFilter = NearestFilter;
  renderTarget.depthTexture.magFilter = NearestFilter;

  const viewCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const planeGeometry = new PlaneGeometry(2, 2);
  const depthPlant = new Mesh(
    planeGeometry,
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

  const colorPlant = new Mesh(planeGeometry, new ShaderMaterial({
    uniforms: {
      tDiffuse: { value: renderTarget.texture },
    },
    vertexShader,
    fragmentShader:fragmentShaderTexture,
  }));
  // #endregion

  // init scene
  //#region
  const plant = new Mesh(
    planeGeometry,
    new MeshStandardMaterial({ color: "chartreuse", side: 2 })
  );
  plant.scale.set(20, 10, 0);
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

  //#endregion

  //init gui
  //#region
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
  //#endregion

  function render(t) {
    const time = t / 1000;
    box.rotation.x = box.rotation.y = time;
    cone.rotation.z = time;
    cone.rotation.x = Math.sin(time) * 0.5;
    sphere.position.x = 13 + Math.sin(time) * 3;
    orbitControls.update();

    renderViewPort();

    requestAnimationFrame(render);
  }
  render();

  function renderViewPort() {

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    depthPlant.material.uniforms.tDepth.value = renderTarget.depthTexture;
    colorPlant.material.uniforms.tDiffuse.value = renderTarget.texture;
    renderer.setRenderTarget(null);

    renderer.setViewport(0, 0, size.x, size.y);
    renderer.setScissor(0, 0, size.x, size.y);
    renderer.render(depthPlant, viewCamera);

    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, size.x * 0.3, size.y * 0.3);
    renderer.setScissor(0, 0, size.x * 0.3, size.y * 0.3);
    renderer.render(colorPlant, viewCamera);
    renderer.setScissorTest(false);
  }

  resize(renderer, camera, (w, h) => {
    size.set(w, h);
    renderTarget.setSize(w, h);
  });
}
