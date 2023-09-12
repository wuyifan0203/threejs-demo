/*
 * @Date: 2023-05-17 19:27:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-12 20:27:14
 * @FilePath: /threejs-demo/examples/src/helper/orbitControls.js
 */
import {
    Vector3,
    Scene,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
    Vector2,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initOrthographicCamera,
} from '../lib/tools/index.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

OrbitControls.prototype.focusObject = function (object) {
    console.log(this,object);
    const center = new Vector3()
    return (()=>{
        if (object) {
            if(object.geometry.boundingBox === null){
                object.geometry.computeBoundingBox();
            }
            object.geometry.boundingBox.getCenter(center);

            object.localToWorld(center);
            this.target.copy(center);
            console.log(center,this);
       
    
        }
    })()
}

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    const scene = new Scene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);
    initCustomGrid(scene);
    initAxesHelper(scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.zoomToCursor = true;
    const viewHelper = new ViewHelper(camera, renderer.domElement);


    function animate() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
    }

    renderer.setAnimationLoop(animate);

    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshNormalMaterial({});

    const mesh = new Mesh(geometry, material);

    const mesh1 = new Mesh(geometry, material);
    mesh1.position.set(2,2,0)

    scene.add(mesh,mesh1);


    // focus object

    controls.focusObject(mesh);

    controls.focusObject(mesh1);
}
