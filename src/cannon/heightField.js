/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 14:28:13
 * @FilePath: /threejs-demo/src/cannon/heightField.js
 */
import {
    Clock,
    Vector3,
    MeshStandardMaterial,
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
    initStats,
    resize
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Vec3,
    Heightfield as HeightFieldShape,
    Sphere,
} from '../lib/other/physijs/cannon.js';
import { SimplexNoise } from '../lib/three/SimplexNoise.js';
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';

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

    // scene.add(initCoordinates(50))

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
    const utils = new CannonUtils(world, scene);

    const data = []
    for (let j = 0; j < 100; j++) {
        data[j] = [];
        for (let k = 0; k < 100; k++) {
            data[j][k] = octave(j / 100, k / 100, 16) * 40 - 20;
        }
    }

    const sphereShape = new Sphere(1);
    const sphereMaterial = new MeshStandardMaterial({ color: 0xffffff })

    const bodies = []

    for (let j = 0; j < 10; j++) {
        bodies[j] = []
        for (let k = 0; k < 10; k++) {
            const body = new Body({ mass: 1, shape: sphereShape });
            bodies[j][k] = body;
            body.position.set(j * 10 - 45, 20, k * 10 - 45);
            const mesh = CannonUtils.body2Mesh(body, sphereMaterial);
            utils.add(body, mesh)
        }
    }

    const terrainShape = new HeightFieldShape(data, { elementSize: 1 });
    const terrainBody = new Body({ mass: 0 });
    terrainBody.addShape(terrainShape);
    terrainBody.quaternion.setFromEuler(-Math.PI * 0.5, 0, 0, 'XYZ');
    terrainBody.position.set(-50, 0, 50);
    world.addBody(terrainBody);

    const material = new MeshStandardMaterial({ color: 'gray' });
    const fieldMesh = CannonUtils.body2Mesh(terrainBody, material);
    utils.add(terrainBody, fieldMesh);

    const clock = new Clock();

    (function render() {
        world.step(1 / 120, clock.getDelta());
        orbitControl.update();
        utils.update();
        renderer.render(scene, camera);
        stats.update();
        requestAnimationFrame(render);
    })()


    const operation = {
        reset() {
            for (let j = 0; j < bodies.length; j++) {
                for (let k = 0; k < bodies[0].length; k++) {
                    bodies[j][k].position.set(j * 10 - 45, 20, k * 10 - 45);
                    bodies[j][k].velocity.set(0, 0, 0);
                }
            }
        }
    }
    const gui = initGUI();
    gui.add(operation, 'reset');

    resize(renderer, camera);
}


