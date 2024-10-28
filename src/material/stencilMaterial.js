import {
  Vector3,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  BoxGeometry,
  ConeGeometry,
  ReplaceStencilOp,
  PlaneGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  CapsuleGeometry,
  TorusGeometry,
  AlwaysStencilFunc,
  EqualStencilFunc,
  MeshBasicMaterial,
  SphereGeometry,
  KeepStencilOp,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initOrbitControls,
  initScene,
  initDirectionLight,
} from "../lib/tools/index.js";

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ stencil: true });
  renderer.setClearColor(0x888888);

  const camera = initOrthographicCamera(new Vector3(5, 5, 5));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 6;
  camera.updateProjectionMatrix();

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  orbitControls.target.set(0.3,0,-0.3);
  orbitControls.update();

  const scene = initScene();

  const light = initDirectionLight();
  camera.add(light);
  scene.add(camera);

  scene.add(new AmbientLight());

  const planeGeometry = new PlaneGeometry(1, 1);
  // Front Face Plane
  const frontFaceMaterial = new MeshPhongMaterial({
    color: 0xf7f7f7,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
    depthWrite: false,
  });
  const frontFace = new Mesh(planeGeometry, frontFaceMaterial);
  frontFace.renderOrder = 1;
  scene.add(frontFace);

  // Front Face Object
  const sphere = new SphereGeometry(0.5, 32,32);
  const sphereMaterial = new MeshPhongMaterial({
    color: 0xff0000,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: EqualStencilFunc,
  });
  const sphereMesh = new Mesh(sphere, sphereMaterial);
  sphereMesh.position.set(0, 0, -0.5);
  sphereMesh.scale.set(0.6, 0.6, 0.6);
  sphereMesh.renderOrder = 2;
  scene.add(sphereMesh);

  // Bottom Face Plane
  const BottomFaceMaterial = new MeshPhongMaterial({
    color: 0xf7f7f7,
    stencilWrite: true,
    stencilRef: 2,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
    depthWrite: false,
  });
  const bottomFace = new Mesh(planeGeometry, BottomFaceMaterial);
  bottomFace.rotation.x = Math.PI * 0.5;
  bottomFace.position.set(0, -0.5, -0.5);
  bottomFace.renderOrder = 3;
  scene.add(bottomFace);

  // Bottom Face Object
  const box = new BoxGeometry(1, 1, 1);
  const boxMaterial = new MeshPhongMaterial({
    color: 0xffff00,
    stencilWrite: true,
    stencilRef: 2,
    stencilFunc: EqualStencilFunc,
  });
  const boxMesh = new Mesh(box, boxMaterial);
  boxMesh.position.set(0, 0, -0.5);
  boxMesh.scale.set(0.5, 0.5, 0.5);
  boxMesh.renderOrder = 4;
  scene.add(boxMesh);

  // Top Face Plane
  const topFaceMaterial = new MeshPhongMaterial({
    color: 0xf7f7f7,
    stencilWrite: true,
    stencilRef: 3,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
    depthWrite: false,
  });
  const topFace = new Mesh(planeGeometry, topFaceMaterial);
  topFace.rotation.x = -Math.PI * 0.5;
  topFace.position.set(0, 0.5, -0.5);
  topFace.renderOrder = 5;
  scene.add(topFace);

  // Top Face Object
  const cone = new ConeGeometry(5, 10);
  const coneMaterial = new MeshPhongMaterial({
    color: 0xff00ff,
    stencilWrite: true,
    stencilRef: 3,
    stencilFunc: EqualStencilFunc,
  });
  const coneMesh = new Mesh(cone, coneMaterial);
  coneMesh.position.set(0, 0, -0.5);
  coneMesh.scale.set(0.05, 0.05, 0.05);
  coneMesh.renderOrder = 6;
  scene.add(coneMesh);

  // Left Face Plane
  const leftFaceMaterial = new MeshPhongMaterial({
    color: 0xf7f7f7,
    stencilWrite: true,
    stencilRef: 4,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
    depthWrite: false,
  });
  const lefFace = new Mesh(planeGeometry, leftFaceMaterial);
  lefFace.rotation.y = -Math.PI * 0.5;
  lefFace.position.set(-0.5, 0, -0.5);
  lefFace.renderOrder = 7;
  scene.add(lefFace);

  // Left Face Object
  const capsule = new CapsuleGeometry(5, 5);
  const capsuleMaterial = new MeshPhongMaterial({
    color: 0x00ff00,
    stencilWrite: true,
    stencilRef: 4,
    stencilFunc: EqualStencilFunc,
  });
  const capsuleMesh = new Mesh(capsule, capsuleMaterial);
  capsuleMesh.position.set(0, 0, -0.5);
  capsuleMesh.scale.set(0.05, 0.05, 0.05);
  capsuleMesh.renderOrder = 8;
  scene.add(capsuleMesh);

  // Right Face Plane
  const rightFaceMaterial = new MeshPhongMaterial({
    color: 0xf7f7f7,
    stencilWrite: true,
    stencilRef: 5,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
    depthWrite: false,
  });
  const rightFace = new Mesh(planeGeometry, rightFaceMaterial);
  rightFace.rotation.y = Math.PI * 0.5;
  rightFace.position.set(0.5, 0, -0.5);
  rightFace.renderOrder = 9;
  scene.add(rightFace);

  // Right Face Object
  const torus = new TorusGeometry(5, 2);
  const torusMaterial = new MeshPhongMaterial({
    color: 0x0000ff,
    stencilWrite: true,
    stencilRef: 5,
    stencilFunc: EqualStencilFunc,
  });
  const torusMesh = new Mesh(torus, torusMaterial);
  torusMesh.position.set(0, 0, -0.5);
  torusMesh.scale.set(0.05, 0.05, 0.05);
  torusMesh.renderOrder = 10;
  scene.add(torusMesh);

  // Back Face Plane
  const backFaceMaterial = new MeshPhongMaterial({
    color: 0xf7f7f7,
    stencilWrite: true,
    stencilRef: 6,
    stencilFunc: AlwaysStencilFunc,
    stencilZPass: ReplaceStencilOp,
    depthWrite: false,
  });
  const backFace = new Mesh(planeGeometry, backFaceMaterial);
  backFace.rotation.y = Math.PI;
  backFace.position.set(0, 0, -1);
  backFace.renderOrder = 11;
  scene.add(backFace);

  // Back Face Object
  const dodecahedron = new DodecahedronGeometry(5, 0);
  const dodecahedronMaterial = new MeshPhongMaterial({
    color: 0x111111,
    stencilWrite: true,
    stencilRef: 6,
    stencilFunc: EqualStencilFunc,
  });
  const dodecahedronMesh = new Mesh(dodecahedron, dodecahedronMaterial);
  dodecahedronMesh.position.set(0, 0, -0.5);
  dodecahedronMesh.scale.set(0.05, 0.05, 0.05);
  dodecahedronMesh.renderOrder = 12;
  scene.add(dodecahedronMesh);

  function render() {
    renderer.render(scene, camera);
    orbitControls.update();
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);
}
