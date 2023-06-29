/*
 * @Date: 2023-06-13 23:01:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 18:27:45
 * @FilePath: /threejs-demo/packages/app/CAD/example/index.js
 */
import { Mesh, BoxGeometry, MeshNormalMaterial } from 'three';
// eslint-disable-next-line import/extensions
import { ViewPort, Editor } from '../build/cad.esm.js';

window.onload = () => {
  init();
};

function init() {
  const dom = document.getElementById('cad');
  const editor = new Editor(dom);
  const viewPort = new ViewPort(editor);

  console.log(viewPort);

  dom.addEventListener('resize', () => {
    editor.signals.windowResize.dispatch();
  });

  const boxGeometry = new BoxGeometry(2, 2, 2);
  const boxMaterial = new MeshNormalMaterial();
  const boxMesh = new Mesh(boxGeometry, boxMaterial);

  editor.addObject(boxMesh);

  const btn = document.createElement('button');
  btn.innerText = 'Change Camera';

  btn.addEventListener('click', () => {
    editor.toggleViewportCamera();
  });

  document.body.append(btn);

  window.editor = editor;
  window.viewPort = viewPort;
}
