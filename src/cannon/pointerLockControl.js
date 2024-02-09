/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-09 23:25:04
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
    NearestFilter,
    Float32BufferAttribute
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates,
    initStats,
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Vec3,
    Box,
    Sphere,
    Material,
} from '../lib/other/physijs/cannon.js';
import { PointerLockControlsCannon } from '../lib/other/physijs/PointerLockControlsCannon.js'
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

    const instructions = document.getElementById('instructions');

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

    // const orbitControl = initOrbitControls(camera, renderer.domElement);



    const world = new World({ gravity: new Vec3(0, -9.8, 0) });

    const sphereShape = new Sphere(1);

    const sphereBody = new Body({ mass: 5, shape: sphereShape, material: new Material() });
    world.addBody(sphereBody);

    const controls = new PointerLockControlsCannon(camera, sphereBody);

    const texture = new TextureLoader().load('../../public/images/minecraft/atlas.png');
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = NearestFilter;

    const boxSize = 2;
    const fieldSize = 60;
    const geometry = new BoxGeometry(boxSize, boxSize, boxSize);
    const material = new MeshStandardMaterial({ map: texture });
    const terrainMesh = new Group();
    terrainMesh.position.set(-fieldSize, 0, -fieldSize);
    scene.add(terrainMesh);

    geometry.deleteAttribute('uv');
    geometry.setAttribute('uv', new Float32BufferAttribute([
        0, 0.5, 1, 0.5, 0, 0, 1, 0,
        0, 0.5, 1, 0.5, 0, 0, 1, 0,
        0, 0.5, 0, 1, 1, 0.5, 1, 1,
        0, 0.5, 0, 1, 1, 0.5, 1, 1,
        0, 0.5, 1, 0.5, 0, 0, 1, 0,
        0, 0.5, 1, 0.5, 0, 0, 1, 0,
    ], 2));


    const terrainBody = new Body({ mass: 0 });
    const boxShape = new Box(new Vec3(boxSize / 2, boxSize / 2, boxSize / 2));
    terrainBody.position.set(-fieldSize, 0, -fieldSize);

    let height = 0;
    for (let j = 0; j < fieldSize; j++) {
        for (let k = 0; k < fieldSize; k++) {
            height = octave(j / fieldSize, k / fieldSize, 16) * 40 - 20;
            height = Math.floor(height)
            const mesh = new Mesh(geometry, material);
            mesh.receiveShadow = mesh.castShadow = true;

            mesh.position.set(j * boxSize, height, k * boxSize);
            terrainMesh.add(mesh);

            terrainBody.addShape(boxShape, new Vec3(j * boxSize, height, k * boxSize));
        }
    }

    scene.add(controls.getObject());


    instructions.addEventListener('click', () => {
        controls.lock()
    })

    controls.addEventListener('lock', () => {
        console.log(66);
        controls.enabled = true
        instructions.style.display = 'none'
    })

    controls.addEventListener('unlock', () => {
        controls.enabled = false
        instructions.style.display = 'block';
    })


    world.addBody(terrainBody);

    const clock = new Clock();
    function render() {
        const dt = clock.getDelta();
        world.step(1 / 120, dt);
        // orbitControl.update();
        renderer.render(scene, camera);
        controls.update(dt);
        stats.update();
    }

    renderer.setAnimationLoop(render);

}


