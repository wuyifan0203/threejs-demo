/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:59:31
 * @FilePath: /threejs-demo/src/use dat.GUI/index.js
 */
import {
  Vector3,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Color,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initScene,
  initOrbitControls,
  initGUI
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

import { addMaterialGUI } from '../lib/tools/datGUIutils.js';

window.onload = function () {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene, 100, 100);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  draw(scene);

  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  renderer.setAnimationLoop(render);
}

function draw(scene) {
  const material = new MeshBasicMaterial();
  const sphereGeometry = new SphereGeometry(5, 32, 32);
  const mesh = new Mesh(sphereGeometry, material);


  scene.add(mesh);

  const controls = {
    test: material.color.getStyle(),
    scaleX: mesh.scale.x,
    speed: 0.1,
    autoUpdate: true,
    update(param) {
      console.log(param);
    },
    material,
    mesh,
    redraw() {
      if (mesh) scene.remove(controls.mesh);
      const newMesh = new Mesh(sphereGeometry, material);
      controls.mesh = newMesh;
      scene.add(newMesh);
      newMesh.scale.set(controls.scaleX, mesh.scale.y, mesh.scale.z);
    },
  };

  // 创建 gui 对象
  const gui = initGUI();
  console.log(gui);
  // gui 有 domElement属性 ， saveToLocalStorageIfPossible函数,width，等属性
  // 比如 修改宽度
  gui.width = 300;
  // 保存本地
  // 设置gui 位置
  gui.domElement.style.position = 'absolute';

  /// UI操作
  // 如果添加了不存在的属性会报错！！
  // 添加文件夹
  // 原码查看 folder 继承 gui类
  // addFolder 返回一个 GUI 对象
  const folder = gui.addFolder('folder name');
  // 展开文件夹
  folder.open();

  // 文件夹添加颜色选择控件
  folder.addColor(controls, 'test').onChange(() => {
    material.color.set(new Color(controls.test));
  });

  //  add(控件对象变量名，对象属性名，其它参数),会返回一个controller 对象
  // 不同的参数对应不同的控件
  // Number类型——slider
  // Boolean类型——复选框
  // Function类型——按钮
  // String——文本输入框、下拉菜单
  // Object——下拉菜单

  // 添加缩放系数拖动条菜单选项
  const slider = folder.add(controls, 'scaleX', 0.1, 2.5);
  // 添加转速下拉菜单选项
  folder.add(controls, 'speed', { low: 0.005, middle: 0.01, height: 0.1 });
  // 添加checkbox
  gui.add(controls, 'autoUpdate');
  // 添加按钮
  folder.add(controls, 'update', 'params');

  // 控件添加事件
  slider.onChange(() => {
    controls.redraw();
  });
  addMaterialGUI(gui, controls, material);
}
