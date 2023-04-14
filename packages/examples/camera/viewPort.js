import {
    Scene,
    PerspectiveCamera,
    PointLight,
    Mesh,
    Color,
    BoxGeometry,
    OrthographicCamera,
    MeshLambertMaterial,
    Vector3,
    WebGLRenderer,
    MeshNormalMaterial
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
    initRenderer, resize,
    initOrthographicCamera,
    initCustomGrid
} from '../../lib/tools/index.js';
import { CC2SSC } from '../../lib/tools/func.js'
import { GUI } from '../../lib/util/lil-gui.module.min.js';
import { rotationFormula } from '../../lib/tools/RodriguesRotationFormula.js'

import { Stats } from '../../lib/util/Stats.js';
import { Matrix4 } from '../../lib/three/three.module.js';
import { Spherical } from '../../lib/three/three.module.js';
import { CustomGrid } from '../../lib/three/customGrid.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const stats = new Stats();
    stats.showPanel(0);
    const dom = document.getElementById('webgl-output');
    dom.append(stats.dom);
    const camera = initOrthographicCamera(new Vector3(0, 0, 100));
    camera.up.set(0, 0, 1);



    const scene = new Scene();
    scene.background = new Color(0xf0f0f0);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    resize(renderer, camera);

    const customGrid = initCustomGrid(scene, 50, 50);

    const cameraGrid = new CustomGrid(50,30,1,1,'#ff0000','#00fff0');

    camera.add(cameraGrid);
    cameraGrid.position.z = -40;
    scene.add(camera);

    const customCamera = initOrthographicCamera(new Vector3(0, 0, 100));
    const customRenderer = new WebGLRenderer({antialias: true});

    const boxMesh = new Mesh(new BoxGeometry(3,4,5),new MeshNormalMaterial());
    scene.add(boxMesh)


    customRenderer.setSize(300,200);
    const dom2 = document.querySelector('#webgl-output2');
    dom2.append(customRenderer.domElement);

    function render() {
        stats.begin();
        orbitControls.update();
        renderer.render(scene, camera);
        customRenderer.render(scene,customCamera)
        customGrid.position.copy(orbitControls.target);
        const unit = (1/camera.zoom) ** 2;
        customGrid.scale.set(unit,unit,unit);
        stats.end();
        requestAnimationFrame(render);
    }
    render();
    window.camera = camera;
    window.scene = scene;
    window.orbitControls = orbitControls;




    const originDirection = new Vector3(0, 0, 1);

    document.addEventListener('click', (e) => {
        const {offsetX,offsetY} = e;
        const { width, height } = dom.getBoundingClientRect();
        const cpi = camera.projectionMatrixInverse.elements;
        const { x, y, z } = camera.position;

        const MP0 = cpi[0];
        const MP5 = cpi[5]

        const [divisionX, divisionY] = [width / MP0 / 2, height / -MP5 / 2];

        const zeroX = (width - x * width / MP0) / 2;
        const zeroY = (height + y * height / MP5) / 2;

        const posX = (offsetX - zeroX) / divisionX;
        const posY = (offsetY - zeroY) / divisionY;

        console.log(posX,posY);
    })
    console.log(orbitControls);








    orbitControls.addEventListener('change', (e) => {
        const unit = 1/camera.zoom;
        cameraGrid.scale.set(unit,unit,unit);
    })


}
