/*
 * @Date: 2023-06-13 23:01:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-11 01:39:54
 * @FilePath: /threejs-demo/packages/f-engine/example/index.js
 */
import {
 Mesh, BoxGeometry, MeshNormalMaterial, Vector3 ,Color
} from 'three';
import { MainViewPort, Editor } from '../build/cad.es.js';
import { GUI } from './lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const dom = document.getElementById('cad');
  const editor = new Editor(dom);
  const viewPort = new MainViewPort(editor);

  console.log(viewPort);

  dom.addEventListener('resize', () => {
    editor.signals.windowResize.dispatch();
  });

 

  editor.addEventListener('objectAdded',(object)=>{
    console.log('EventDispatcher.objectAdded->',object);
  })

  editor.addEventListener('selectionChange',(object)=>{
    console.log('EventDispatcher.selectionChange->',object);
  })





  const control = {
    toggleViewportCamera(){
      editor.toggleViewportCamera();
    },
    transformMode:'translate',
    panelMode:'select',
    sceneBackgroundType:'None',
    sceneColor1:'#ffffff',
    sceneColor2:'#0000ff'
  }

  const objList = [];
  window.objList = objList

  const operation = {
    addObject(position){
      position = position ?? new Vector3((Math.random()-1) * 10,(Math.random()-1) * 10,0)
      const boxGeometry = new BoxGeometry(2, 2, 2);
      const boxMaterial = new MeshNormalMaterial();
      const boxMesh = new Mesh(boxGeometry, boxMaterial);
      boxMesh.position.copy(position)
      editor.addObject(boxMesh);
      editor.selectById(boxMesh.uuid)
      objList.push(boxMesh)
    },

    removeLastObject(){
      const obj = objList.at(-1);
      editor.removeObject(obj);
      objList.length --;
    },

    removeSelectedObject(){
      const selected = editor.selected[0]
      editor.removeObjectByUuid(selected)
    }
  
  }

  operation.addObject(new Vector3(0,0,0))
  operation.addObject(new Vector3(0,1,0))

  const setBackGround = (e)=>{
    if(e=== 'None'){
      editor.setSceneBackground(null)
    }else if('Color'){
      editor.setSceneBackground(new Color(control.sceneColor1))
    }
  }


  const gui = new GUI();
  gui.open();
  const CFolder = gui.addFolder('Camera')
  CFolder.add(control,'toggleViewportCamera').name('Toggle Viewport Camera');
  CFolder.add(control,'transformMode',{translate:'translate',rotate:'rotate',scale:'scale'}).name('Set Transform Mode').onChange((e)=>{
    viewPort.setTransformMode(e)
  })
  CFolder.add(control,'sceneBackgroundType',{None:'None',Color:"Color",Texture:'Texture'}).name('Scene Background Type').onChange(setBackGround)
  CFolder.addColor(control,'sceneColor1').onChange(()=>{
    setBackGround(control.sceneBackgroundType)
  })

  const OFolder = gui.addFolder('Operation')
  OFolder.add(operation,'addObject').name('Add Object');
  OFolder.add(operation,'removeLastObject').name('Remove Last Object');
  OFolder.add(operation,'removeSelectedObject').name('Remove Selected Object')



  window.editor = editor;
  window.viewPort = viewPort;
}
