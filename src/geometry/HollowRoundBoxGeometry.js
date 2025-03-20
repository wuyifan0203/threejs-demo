import {
    Mesh,
    MeshBasicMaterial,
    Vector3,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    initLoader,
    Image_Path
} from '../lib/tools/index.js';
import { HollowRoundBoxGeometry } from '../lib/custom/HollowRoundBoxGeometry.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, -200, 200));
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);

    const loader = initLoader();
    const uvTexture = loader.load(`../../${Image_Path}/others/uv_grid_opengl.jpg`);
    const mesh = new Mesh(
        new HollowRoundBoxGeometry(3, 0.2, 3),
        new MeshBasicMaterial({ map: uvTexture, wireframe: false })
    );
    scene.add(mesh);


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
}