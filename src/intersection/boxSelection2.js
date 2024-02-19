/*
 * @Date: 2023-09-06 10:24:50
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-19 18:03:50
 * @FilePath: /threejs-demo/src/intersection/boxSelection2.js
 */
import {
    BoxGeometry,
    Mesh, Vector2, Vector3, MeshBasicMaterial, Quaternion, Euler, Clock, Object3D, Vector4, CanvasTexture, Color, OrthographicCamera, Raycaster
} from '../lib/three/three.module.js'
import {
    initAxesHelper,
    initScene,
    initCoordinates,
    initCustomGrid,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
} from '../lib/tools/common.js';

window.onload = () => {
    init();
}

function init() {
    const renderer = initRenderer();
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, 0, 100));
    renderer.setClearColor(0xffffff, 1);
    renderer.autoClear = false;
    camera.lookAt(0, 0, 10);
    camera.up.set(0, 0, 1);
    camera.matrixWorldNeedsUpdate = true;
    camera.updateProjectionMatrix();

    const coord = initCoordinates(50);
    scene.add(coord);
    initAxesHelper(scene);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);

    const viewHelper = new ViewHelper(camera, renderer.domElement);

    function reader() {
        controls.update();
        renderer.render(scene, camera);

        viewHelper.render(renderer);
    }

    renderer.setAnimationLoop(reader);



    const cursor = new Vector2();
    renderer.domElement.addEventListener('click', (event) => {
        const { clientX, clientY } = event

        const { width, height } = renderer.domElement;

        const outWidth = width - viewHelper.dim;
        const outHeight = height - viewHelper.dim;

        if (clientX > outWidth && clientY > outHeight) {
            cursor.x = clientX;
            cursor.y = clientY;
            viewHelper.target.copy(controls.target);
            viewHelper.handelClick(cursor);
        }
    })

}

const raycaster = new Raycaster();
const mouse = new Vector2();

const vpTemp = new Vector4();
const colorX = new Color('#ff3653');
const colorY = new Color('#8adb00');
const colorZ = new Color('#2c8fff');

const posXM = getMaterial(colorX, '+X');
const negXM = getMaterial(colorX, '-X');
const posYM = getMaterial(colorY, '+Y');
const negYM = getMaterial(colorY, '-Y');
const posZM = getMaterial(colorZ, '+Z');
const negZM = getMaterial(colorZ, '-Z');

posXM.map.center.set(0.5, 0.5)
posXM.map.rotation = Math.PI / 2;
posXM.map.needsUpdate = true;

negXM.map.center.set(0.5, 0.5)
negXM.map.rotation = - Math.PI / 2;
negXM.map.needsUpdate = true;

posYM.map.center.set(0.5, 0.5);
posYM.map.rotation = Math.PI;
posYM.map.needsUpdate = true;

const geometry = new BoxGeometry(2, 2, 2);

class ViewHelper extends Object3D {
    constructor(camera, dom) {
        super();

        this.camera = camera;
        this.dom = dom;

        this.animating = false;

        this._camera = new OrthographicCamera(-2, 2, 2, -2, 0, 4);
        this._camera.position.set(0, 0, 2);
        this._camera.up.set(0, 1, 0);
        this._camera.lookAt(0, 0, 0);

        this._camera.updateProjectionMatrix();

        this.target = new Vector3();


        this.object = new Mesh(geometry, [posXM, negXM, posYM, negYM, posZM, negZM]);

        this.add(this.object);

        this.dim = 128;

    }

    render(renderer) {
        this.quaternion.copy(this.camera.quaternion).invert();
        this.updateMatrixWorld();

        const x = this.dom.offsetWidth - this.dim;

        renderer.clearDepth();

        renderer.getViewport(vpTemp);
        renderer.setViewport(x, 0, this.dim, this.dim);

        renderer.render(this, this._camera);

        renderer.setViewport(vpTemp.x, vpTemp.y, vpTemp.z, vpTemp.w);
    }

    handelClick(cursor) {
        // if (this.animating === true) return false;

        const rect = this.dom.getBoundingClientRect();
        const offsetX = rect.left + (this.dom.offsetWidth - this.dim);
        const offsetY = rect.top + (this.dom.offsetHeight - this.dim);
        mouse.x = ((cursor.x - offsetX) / (rect.width - offsetX)) * 2 - 1;
        mouse.y = -((cursor.y - offsetY) / (rect.bottom - offsetY)) * 2 + 1;

        raycaster.setFromCamera(mouse, this._camera);

        const intersects = raycaster.intersectObjects(this.children, false);

        if(intersects.length){
            const intersection = intersects[0];
            const normal = intersection.normal;

            this.prepareAnimationData(normal)

            // this.animating = true;
        }
    }

    prepareAnimationData(normal){

        console.log(normal);

        if (posX.equals(direction)) {
           
        } else if (negX.equals(direction)) {
   
        } else if (posY.equals(direction)) {
       
        } else if (negY.equals(direction)) {
     
        } else if (posZ.equals(direction)) {
      
        } else if (negZ.equals(direction)) {
 
        } else {
            console.error('ViewHelper: Invalid axis.');
        }


    }
}

function getMaterial(color, text = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext('2d');
    context.beginPath();
    context.arc(32, 32, 48, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = color.getStyle();
    context.fill();

    if (text !== null) {
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillStyle = '#000000';
        context.fillText(text, 32, 41);
    }

    const texture = new CanvasTexture(canvas);

    return new MeshBasicMaterial({ map: texture, toneMapped: false });
}