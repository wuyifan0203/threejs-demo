/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-01 17:49:29
 * @FilePath: /threejs-demo/src/cannon/pointerLockControl.js
 */
import {
    Clock,
    Vector3,
    MeshStandardMaterial,
    BoxGeometry, Mesh,
    Group,
    TextureLoader,
    SRGBColorSpace,
    NearestFilter
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates,
    initStats
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Vec3,
    Box,
} from '../lib/other/physijs/cannon.js';
import { SimplexNoise } from '../lib/three/SimplexNoise.js';

const simplex = new SimplexNoise(4);
function map(val, smin, smax, emin, emax) {
    const t = (val - smin) / (smax - smin)
    return (emax - emin) * t + emin
}
function noise(nx, ny) {
    return map(simplex.noise(nx, ny), -1, 1, 0, 1)
}
function octave(nx, ny, octaves) {
    let val = 0;
    let freq = 1;
    let max = 0;
    let amp = 1;
    for (let i = 0; i < octaves; i++) {
        val += noise(nx * freq, ny * freq) * amp;
        max += amp;
        amp /= 2;
        freq *= 2;
    }
    return val / max;
}

window.onload = () => {
    init();
};

function init() {
    const stats = initStats();
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(500, 500, 500));
    camera.zoom = 0.25;
    camera.updateProjectionMatrix();

    const scene = initScene();

    initAmbientLight(scene);

    scene.add(initCoordinates(50))

    const aspect = window.innerWidth / window.innerHeight;

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    light.shadow.camera.left = -100
    light.shadow.camera.right = 100
    light.shadow.camera.top = 100 * aspect
    light.shadow.camera.bottom = -100 * aspect
    light.shadow.camera.near = camera.near
    light.shadow.camera.far = camera.far
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const world = new World({
        gravity: new Vec3(0, -9.8, 0)
    });

    const texture = new TextureLoader().load('../../public/images/others/atlas.png');
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = NearestFilter;

    const boxSize = 2;
    const geometry = new BoxGeometry(boxSize, boxSize, boxSize);
    const material = new MeshStandardMaterial({ map: texture });
    const terrainMesh = new Group();
    scene.add(terrainMesh);

    const terrainBody = new Body({ mass: 0 });
    const boxShape = new Box(new Vec3(boxSize / 2, boxSize / 2, boxSize / 2));
    world.addBody(terrainBody);

    let height = 0;
    for (let j = 0; j < 100; j++) {
        for (let k = 0; k < 100; k++) {
            height = octave(j / 100, k / 100, 16) * 40 - 20;
            height = Math.floor(height)
            const mesh = new Mesh(geometry, material);

            console.log(height);
            mesh.position.set(j * boxSize, height, k * boxSize);
            terrainMesh.add(mesh);
        }
    }




    const clock = new Clock();
    function render() {
        world.step(1 / 120, clock.getDelta());
        orbitControl.update();
        renderer.render(scene, camera);
        stats.update();
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();
}


