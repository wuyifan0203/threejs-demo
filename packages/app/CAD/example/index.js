/*
 * @Date: 2023-06-13 23:01:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 20:48:42
 * @FilePath: /threejs-demo/packages/app/CAD/example/index.js
 */
import { Mesh, BoxGeometry, MeshNormalMaterial, Vector3 } from 'three';
// eslint-disable-next-line import/extensions
import { ViewPort, Editor } from '../build/cad.esm.js';
import { GUI } from './lil-gui.module.min.js';

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

 

  editor.addEventListener('objectAdded',(object)=>{
    console.log('EventDispatcher.objectAdded->',object);
  })





  const control = {
    toggleViewportCamera(){
      editor.toggleViewportCamera();
    }
  }

  const operation = {
    addObject(position){
      position = position ?? new Vector3((Math.random()-1) * 10,(Math.random()-1) * 10,0)
      const boxGeometry = new BoxGeometry(2, 2, 2);
      const boxMaterial = new MeshNormalMaterial();
      const boxMesh = new Mesh(boxGeometry, boxMaterial);
      boxMesh.position.copy(position)
      editor.addObject(boxMesh);
    }
  }

  operation.addObject(new Vector3(0,0,0))
  operation.addObject(new Vector3(0,1,0))



  const gui = new GUI();
  gui.open();
  const CFolder = gui.addFolder('Camera')
  CFolder.add(control,'toggleViewportCamera').name('Toggle Viewport Camera');

  const OFolder = gui.addFolder('Operation')
  OFolder.add(operation,'addObject').name('Add Object')

  window.editor = editor;
  window.viewPort = viewPort;
}
