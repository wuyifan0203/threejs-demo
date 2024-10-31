/*
 * @Date: 2023-12-18 13:14:01
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-30 14:21:01
 * @FilePath: \threejs-demo\src\material\renderOrderTest.js
 */
import {
  Mesh,
  BoxGeometry,
  Vector3,
  MeshLambertMaterial,
  Box3,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initScene,
  resize,
  initGUI,
  initDirectionLight,
  initOrbitControls,
  initOrthographicCamera,
  initAmbientLight,
} from "../lib/tools/index.js";

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();

  const scene = initScene();

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.lookAt(new Vector3(0, 0, 0));
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const light = initDirectionLight();
  light.position.set(45, 50, 0);

  initAmbientLight(scene);
  camera.add(light);
  scene.add(camera);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  const redMaterial = new MeshLambertMaterial({ color: "red" });
  const skyBlueMaterial = new MeshLambertMaterial({ color: "#83ff00" });
  const blueMaterial = new MeshLambertMaterial({ color: "#0085ff" });
  const yellowMaterial = new MeshLambertMaterial({ color: "yellow" });
  const greenMaterial = new MeshLambertMaterial({ color: "aqua" });

  const geometry = new BoxGeometry(1, 1, 1);

  const mesh = new Mesh(geometry, redMaterial);
  mesh.scale.set(10, 5, 2);
  mesh.name = "mesh-red";
  scene.add(mesh);

  const mesh2 = new Mesh(geometry, blueMaterial);
  mesh2.scale.set(10, 10, 0.2);
  mesh2.position.set(0, 0, 0);
  mesh2.name = "mesh-blue";
  scene.add(mesh2);

  const mesh3 = new Mesh(geometry, greenMaterial);
  mesh3.scale.set(3, 3, 1);
  mesh3.position.set(0, 0, 0.5);
  mesh3.name = "mesh-green";
  scene.add(mesh3);

  const mesh4 = new Mesh(geometry, yellowMaterial);
  mesh4.scale.set(5, 2, 1);
  mesh4.position.set(0, 0, 0.5);
  mesh4.name = "mesh-yellow";
  scene.add(mesh4);

  const mesh5 = new Mesh(geometry, skyBlueMaterial);
  mesh5.scale.set(2, 5, 1);
  mesh5.position.set(0, 3, 0.5);
  mesh5.name = "mesh-skyBlue";
  scene.add(mesh5);

  const objects = [mesh, mesh2, mesh3, mesh4, mesh5];

  computePolygonOffset(objects);

  const objectMaterial = {};
  objects.map((obj) => {
    objectMaterial[obj.name] = {};
    objectMaterial[obj.name]["Units"] = obj.material.polygonOffsetUnits;
    objectMaterial[obj.name]["Factor"] = obj.material.polygonOffsetFactor;
  });

  const gui = initGUI();
  const o = { usePolygonOffset: true, transparent: false };
  gui.add(o, "usePolygonOffset").onChange((e) => {
    objects.forEach((o) => {
      o.material.polygonOffset = e;
      o.material.needsUpdate = true;
    });
  });

  gui.add(o, "transparent").onChange((e) => {
    objects.forEach((o) => {
      o.material.transparent = e;
      o.material.opacity = e ? 0.5 : 1;
      o.material.needsUpdate = true;
    });
  });
}

const target = new Box3();
const current = new Box3();
function computePolygonOffset(objects) {
  // Copy
  objects.forEach((obj) => {
    obj.material = obj.material.clone();
  });

  for (let j = 0, jl = objects.length; j < jl; j++) {
    const box3 = (() => {
      if (objects[j].geometry.boundingBox === null) {
        objects[j].geometry.computeBoundingBox();
      }
      return objects[j].geometry.boundingBox;
    })();
    target.copy(box3);
    objects[j].updateMatrixWorld();
    target.applyMatrix4(objects[j].matrixWorld);
    for (let k = j + 1, kl = objects.length; k < kl; k++) {
      const box3 = (() => {
        if (objects[k].geometry.boundingBox === null) {
          objects[k].geometry.computeBoundingBox();
        }
        return objects[k].geometry.boundingBox;
      })();

      current.copy(box3);
      objects[k].updateMatrixWorld();
      current.applyMatrix4(objects[k].matrixWorld);

      const isIntersect = target.intersectsBox(current);
      const isInner = target.containsBox(current);
      const isCutXMax = target.max.x === current.max.x;
      const isCutXMin = target.min.x === current.min.x;
      const isCutYMax = target.max.y === current.max.y;
      const isCutYMin = target.min.y === current.min.y;
      const isCutZMax = target.max.z === current.max.z;
      const isCutZMin = target.min.z === current.min.z;

      const isCut =
        isCutXMax ||
        isCutXMin ||
        isCutYMax ||
        isCutYMin ||
        isCutZMax ||
        isCutZMin;
      if (isInner && isCut) {
        // 包装盒内切
        console.log(objects[j].name, objects[k].name, "包装盒内切");
        const targetMaterial = objects[j].material;
        const currentMaterial = objects[k].material;

        targetMaterial.polygonOffset = true;
        currentMaterial.polygonOffset = true;
        targetMaterial.polygonOffsetFactor =
          targetMaterial.polygonOffsetFactor + 1;
        currentMaterial.polygonOffsetFactor =
          currentMaterial.polygonOffsetFactor - 1;
        targetMaterial.polygonOffsetUnits =
          targetMaterial.polygonOffsetUnits + 20;
        currentMaterial.polygonOffsetUnits =
          currentMaterial.polygonOffsetUnits - 20;
        targetMaterial.needsUpdate = true;
        currentMaterial.needsUpdate = true;
      } else if (isIntersect && isCut) {
        // 包装盒相交内切
        console.log(objects[j].name, objects[k].name, "包装盒相交内切");
        const targetMaterial = objects[j].material;
        const currentMaterial = objects[k].material;
        targetMaterial.polygonOffset = true;
        currentMaterial.polygonOffset = true;
        targetMaterial.polygonOffsetFactor =
          targetMaterial.polygonOffsetFactor + 1;
        currentMaterial.polygonOffsetFactor =
          currentMaterial.polygonOffsetFactor - 1;
        targetMaterial.polygonOffsetUnits =
          targetMaterial.polygonOffsetUnits + 20;
        currentMaterial.polygonOffsetUnits =
          currentMaterial.polygonOffsetUnits - 20;
        targetMaterial.needsUpdate = true;
        currentMaterial.needsUpdate = true;
      }
    }
  }
}
