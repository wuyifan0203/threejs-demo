/*
 * @Date: 2023-05-17 19:27:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-13 10:33:09
 * @FilePath: /threejs-demo/examples/src/helper/orbitControls.js
 */
import {
    Vector3,
    Scene,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
    Vector2,
    MathUtils
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
    console.log(this, object);
    const center = new Vector3();
    return (() => {
        if (object) {
            if (object.geometry.boundingSphere === null) {
                object.geometry.computeBoundingSphere();
            }

            center.copy(object.geometry.boundingSphere.center)


            console.log('R:', object.geometry.boundingSphere.radius);
            object.localToWorld(center);
            this.target.copy(center);
            console.log(center, this);

            const r = this.getDistance();

            const theta = this.getAzimuthalAngle();

            const phi = this.getPolarAngle();

            const x = r * Math.sin(phi) * Math.cos(theta) + this.target.x;
            const y = r * Math.sin(phi) * Math.sin(theta) + this.target.y;
            const z = r * Math.cos(phi) + this.target.z;

            console.log(new Vector3(x, y, z));

            console.log('distance', r);
            console.log('AzimuthalAngle', MathUtils.radToDeg(theta) );
            console.log('PolarAngle',MathUtils.radToDeg(phi));
            console.log(this.object.zoom, 'zoom');

            console.log({theta,phi});

            const { width, height } = this.domElement.getBoundingClientRect();

            const zoomRatio = Math.max(
                width / r * 2,
                height / r * 2
            );

            // console.log(zoomRatio);

            // this.object.zoom = zoomRatio;

            this.object.updateProjectionMatrix();

            this.update()


            console.log(getUnit(this.object,this.domElement));





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
    mesh1.position.set(2, 2, 0)

    scene.add(mesh, mesh1);


    // focus object


    controls.focusObject(mesh1);
}

function getUnit(camera,domElement) {
    const PMIX = camera.projectionMatrixInverse.elements[0];
    const PMIY = camera.projectionMatrixInverse.elements[5];

    const { width,height } = domElement.getBoundingClientRect();
    return [width / PMIX / 2,height / PMIY / 2];
    
}
