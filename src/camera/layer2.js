/*
 * @Date: 2023-09-13 16:19:45
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:43:30
 * @FilePath: /threejs-demo/src/camera/layer2.js
 */
import {
  Vector3,
  PointLight,
  Mesh,
  Color,
  BoxGeometry,
  MeshLambertMaterial,
} from '../lib/three/three.module.js';
import { 
  initRenderer, 
  initPerspectiveCamera, 
  initScene,
  initAmbientLight,
 } from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();

  const position = new Vector3(0, 0, 20);
  const views = [
    {
      left: 0,
      top: 0.5,
      width: 0.5,
      height: 0.5,
      // 111 => 7
      layers: [1, 1, 1],
      color: new Color(0xffffff)
    },
    {
      left: 0.5,
      top: 0.5,
      width: 0.5,
      height: 0.5,
      // 100 => 4
      layers: [1, 0, 0],
      color: new Color(0xff0000)
    },
    {
      left: 0,
      top: 0,
      width: 0.5,
      height: 0.5,
      // 010 => 2
      layers: [0, 1, 0],
      color: new Color(0x00ff00)
    },
    {
      left: 0.5,
      top: 0,
      width: 0.5,
      height: 0.5,
      // 101 => 5
      layers: [1, 0, 1],
      color: new Color(0x0000ff)
    }
  ]

  const cameras = views.map((view) => {
    const camera = initPerspectiveCamera(position);
    view.layers.forEach((isEnable, i) => {
      isEnable === 1 ? camera.layers.enable(i) : camera.layers.disable(i)
    })

    console.log('camera.layer.mask:', camera.layers.mask);
    return camera
  })

  const light = new PointLight(0xffffff, 3,0,0);
  light.position.set(0, 0, 20);
  light.layers.enable(0);
  light.layers.enable(1);
  light.layers.enable(2);

  const scene = initScene();
  scene.background = new Color(0xf0f0f0);
  scene.add(light);

  initAmbientLight(scene);

  let windowWidth = 0, windowHeight = 0;

  function updateSize() {
    if (windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      renderer.setSize(windowWidth, windowHeight);
    }
  }
  updateSize();

  renderer.setAnimationLoop(() => {
    views.forEach((view, i) => {
      const left = Math.floor(windowWidth * (view.left));
      const top = Math.floor(windowHeight * (view.top));
      const width = Math.floor(windowWidth * view.width);
      const height = Math.floor(windowHeight * view.height);

      renderer.setViewport(left, top, width, height);
      renderer.setScissor(left, top, width, height);
      renderer.setScissorTest(true);
      renderer.setClearColor(view.color);

      const camera = cameras[i];
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    })
  })

  const redMaterial = new MeshLambertMaterial({ color: 'red' });
  const greenMaterial = new MeshLambertMaterial({ color: 'green' });
  const blueMaterial = new MeshLambertMaterial({ color: 'blue' });

  const geometry = new BoxGeometry(3, 3, 3);

  // 001(默认)
  const mesh1 = new Mesh(geometry, redMaterial);
  mesh1.position.set(-5, 0, 0);
  mesh1.layers.enable(0);
  mesh1.layers.disable(1);
  mesh1.layers.disable(2);
  //010
  const mesh2 = new Mesh(geometry, greenMaterial);
  mesh2.layers.disable(0);
  mesh2.layers.enable(1);
  mesh2.layers.disable(2);
  // 100
  const mesh3 = new Mesh(geometry, blueMaterial);
  mesh3.position.set(5, 0, 0);
  mesh3.layers.disable(0);
  mesh3.layers.disable(1);
  mesh3.layers.enable(2);

  const meshes = [mesh1, mesh2, mesh3];
  meshes.forEach((m) => {
    console.log('mesh.layers.mask:', m.layers.mask);
  });

  // 为 z.y.x 即 2^x + 2^y + 2^z
  // 修改值为  ｜
  // 判断值为  &

  views.forEach((_, i) => {
    const cameraMask = cameras[i].layers.mask;
    meshes.forEach((m, j) => {
      const meshMask = m.layers.mask;
      console.log(`camera${i}.layers & mesh${j}.layers: ${cameraMask & meshMask} ,show:${((cameraMask & meshMask) > 0)}`);
      // 结论 与运算为0的一定不展示
    })
  })

  scene.add(mesh1, mesh2, mesh3);

}
