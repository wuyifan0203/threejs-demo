import {
    Box3,
    BoxGeometry,
    Mesh,
    MeshNormalMaterial,
    Ray,
    SphereGeometry,
    Vector3,
    Color,
    Group
} from '../lib/three/three.module.js';
import {
    initPerspectiveCamera,
    initScene,
    initRenderer,
    initOrbitControls,
    initOrthographicCamera,
    initGUI
} from '../lib/tools/index.js'

window.onload = () => {
    init();
}

function init() {
    const scene = initScene();
    const camera = initPerspectiveCamera(new Vector3(0, 5, -50));
    camera.zoom = 0.8;
    camera.updateProjectionMatrix();

    const renderer = initRenderer();
    const orbitControls = initOrbitControls(camera, renderer.domElement);
    orbitControls.autoRotate = true;

    const box = new Box3();
    const compareBox = new Box3();

    const geometry = new SphereGeometry(1.5, 16, 16);
    geometry.computeBoundingBox();
    const material = new MeshNormalMaterial();

    const meshGroup = new Group();
    scene.add(meshGroup);

    const controls = {
        list: 10
    };

    const wallMesh = new Mesh(new BoxGeometry(18, 10, 2), material);
    wallMesh.position.set(0, 0, 0);
    wallMesh.geometry.computeBoundingBox();
    scene.add(wallMesh);

    const ray1 = new Ray();
    const ray2 = new Ray();

    const godEye = new initOrthographicCamera(new Vector3(-10, 100, 10));
    godEye.zoom = 0.4;
    godEye.lookAt(0, 0, 10)
    godEye.updateProjectionMatrix();
    const backgroundColor = new Color('#dddddd');

    function updateList() {
        meshGroup.clear();
        for (let j = 0, l = controls.list; j < l; j++) {
            for (let k = 0; k < l; k++) {
                const mesh = new Mesh(geometry, material);
                mesh.position.set(j * 4, 0, k * 4)
                meshGroup.add(mesh);
            }
        }
        meshGroup.position.set(-2 * controls.list, 0, 4);
    }


    function occlusionCulling() {
        compareBox.copy(wallMesh.geometry.boundingBox);
        compareBox.applyMatrix4(wallMesh.matrixWorld);
        meshGroup.children.forEach(mesh => {
            box.copy(mesh.geometry.boundingBox);
            box.applyMatrix4(mesh.matrixWorld);
            ray1.set(box.min, camera.position);
            ray2.set(box.max, camera.position);
            mesh.visible = !(ray1.intersectsBox(compareBox) && ray2.intersectsBox(compareBox));
        });
    }

    updateList();
    function render() {
        orbitControls.update();
        occlusionCulling();
        renderer.setScissorTest(true);
        renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        scene.background = null;
        renderer.render(scene, camera);

        renderer.setScissor(0, 0, window.innerWidth / 4, window.innerHeight / 4);
        renderer.setViewport(0, 0, window.innerWidth / 4, window.innerHeight / 4);
        scene.background = backgroundColor;
        renderer.render(scene, godEye);

        renderer.setScissorTest(false);
        requestAnimationFrame(render);
    }
    render();

    const gui = initGUI();
    gui.add(orbitControls, 'autoRotate');
    gui.add(controls, 'list', 0, 10, 1).onFinishChange(updateList)

}