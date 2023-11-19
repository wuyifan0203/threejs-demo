/*
 * @Date: 2023-08-14 19:11:03
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-14 20:58:12
 * @FilePath: /threejs-demo/examples/src/intersection/raycaster.js
 */

import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
    Scene,
    Vector3,
    Vector2,
    Mesh,
    AmbientLight,
    BoxGeometry,
    MeshBasicMaterial,
    ReplaceStencilOp,
    NotEqualStencilFunc,
    PointLight,
    Raycaster,
    MeshLambertMaterial,
    DirectionalLight
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initCustomGrid,
} from '../lib/tools/index.js';

import { TransformControls } from '../lib/three/TransformControls.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.setClearColor(0xefefef);
    //   renderer.setAnimationLoop(render);
    renderer.shadowMap.enabled = true;
    const camera = initOrthographicCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    const transformControls = new TransformControls(camera, renderer.domElement);


    transformControls.addEventListener('change', () => {
        render()
    })



    orbitControls.addEventListener('change', () => {
        render();
    })


    const scene = new Scene();
    initCustomGrid(scene);

    scene.add(new AmbientLight());

    const pointLight = new DirectionalLight(0xffffff);
    pointLight.angle = Math.PI / 4;
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.camera.near = camera.near;
    pointLight.shadow.camera.far = camera.far;
    pointLight.intensity = 1;
    pointLight.position.set(100, 100, 100);

    scene.add(pointLight);
    scene.add(transformControls);

    const geometry = new BoxGeometry(2, 2, 2);
    const normalMaterial = new MeshLambertMaterial({
        color: '#00ff00',
        opacity: 1,
        stencilWrite: true,
        stencilRef: 1,
        stencilZPass: ReplaceStencilOp,
    });

    const faceMaterial = new MeshBasicMaterial({
        color: 'orange',
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: NotEqualStencilFunc,
    });

    const normalObject = new Mesh(geometry, normalMaterial);
    const faceObject = new Mesh(geometry, faceMaterial);
    faceObject.scale.set(1.05, 1.05, 1.05);




    scene.add(normalObject, faceObject);

    transformControls.attach(normalObject)

    render()

    function render() {
        renderer.clear();
        renderer.render(scene, camera);
        faceObject.updateMatrixWorld(faceObject)
    }

    resize(renderer, camera);

    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const _pointDownPos = new Vector2();
    const _pointUpPos = new Vector2();

    function onPointerDown(event) {
        const array = getMousePosition(event.clientX,event.clientY)
        _pointDownPos.fromArray(array);
        renderer.domElement.addEventListener('pointerup', onMouseUp);
    }

    function onMouseUp(e) {
        const array = getMousePosition(e.clientX,e.clientY)
        _pointUpPos.fromArray(array);
        if(_pointDownPos.distanceTo(_pointUpPos) === 0){
            handelClick
        }
    }



    function handelClick() {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        for (let i = 0; i < intersects.length; i++) {
            intersects[i].object.material.color.set(0xff0000);
        }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
}

function getMousePosition(x, y) {
    return [(x / window.innerWidth) * 2 - 1, - (y / window.innerHeight) * 2 + 1];
}