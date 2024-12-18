/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-18 12:17:03
 * @FilePath: \threejs-demo\src\cannon\pointerLockControl.js
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
    Float32BufferAttribute,
    PerspectiveCamera,
    SphereGeometry,
    MeshBasicMaterial,
    Ray
} from 'three';
import {
    initRenderer,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates,
    initStats,
    rainbowColors,
    resize,
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Vec3,
    Box,
    Sphere,
    Material,
    ContactMaterial,
    GSSolver,
    SplitSolver
} from '../lib/other/physijs/cannon.js';
import { PointerLockControlsCannon } from '../lib/other/physijs/PointerLockControlsCannon.js'
import { SimplexNoise } from '../lib/custom/SimplexNoise.js';

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
    const instructions = document.getElementById('instructions');

    const stats = initStats();
    const renderer = initRenderer({});
    const scene = initScene();

    const playEye = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const playerInitPosition = new Vector3(0, 5, 0);

    const world = new World({ gravity: new Vec3(0, -9.8, 0) });
    const solver = new GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;
    world.solver = new SplitSolver(solver);

    // build scene

    initAmbientLight(scene);
    scene.add(initCoordinates(50))

    const aspect = window.innerWidth / window.innerHeight;
    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 100 * aspect;
    light.shadow.camera.bottom = -100 * aspect;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 200;
    scene.add(light);

    //  init player

    const playerShape = new Sphere(2);

    const playerBody = new Body({ mass: 100000, shape: playerShape, material: new Material({ friction: 1 }) });
    playerBody.position.copy(playerInitPosition);
    playerBody.linearDamping = 0.8
    world.addBody(playerBody);



    const playerControl = new PointerLockControlsCannon(playEye, playerBody);
    playerControl.jumpVelocity = 10;
    playerControl.velocityFactor = 0.5;

    // init terrain

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


    const terrainBody = new Body({ mass: 0, material: new Material({ friction: 1 }) });
    world.addBody(terrainBody);
    const boxShape = new Box(new Vec3(boxSize / 2, boxSize / 2, boxSize / 2));
    terrainBody.position.set(-fieldSize, 0, -fieldSize);

    let height = 0;
    for (let j = 0; j < fieldSize; j++) {
        for (let k = 0; k < fieldSize; k++) {
            height = octave(j / fieldSize, k / fieldSize, 16) * 40 - 20;
            height = Math.floor(height);
            height = height % 2 === 0 ? height - 1 : height;
            const mesh = new Mesh(geometry, material);
            mesh.receiveShadow = mesh.castShadow = true;


            mesh.position.set(j * boxSize, height, k * boxSize);
            terrainMesh.add(mesh);

            terrainBody.addShape(boxShape, new Vec3(j * boxSize, height, k * boxSize));
        }
    }

    const playContactMaterial = new ContactMaterial(playerBody.material, terrainBody.material, { friction: 1, restitution: 0 });
    world.addContactMaterial(playContactMaterial);

    // init PointerLockControls
    const player = playerControl.getObject();
    player.name = 'player';
    player.visible = false;
    scene.add(player);

    instructions.addEventListener('click', () => {
        playerControl.lock()
    })

    let animate = undefined;
    playerControl.addEventListener('lock', () => {
        playerControl.enabled = true;
        instructions.style.display = 'none';
        playRender();
    })

    playerControl.addEventListener('unlock', () => {
        playerControl.enabled = false;
        instructions.style.display = 'flex';
        animate !== undefined && cancelAnimationFrame(animate);
    })


    //  ???

    const contactMaterial = new ContactMaterial(playerBody, terrainBody, { friction: 1, restitution: 0.3 })
    world.addContactMaterial(contactMaterial);

    const playerMesh = new Mesh(new SphereGeometry(2), new MeshBasicMaterial({ color: 0xffff00 }));
    scene.add(playerMesh);

    // Shoot

    const shootVelocity = 15
    const ballShape = new Sphere(0.5)
    const ballGeometry = new SphereGeometry(ballShape.radius, 32, 32);

    const materialPool = rainbowColors.map(color => new MeshStandardMaterial({ color }));


    const tmpV = new Vector3();
    const tmpRay = new Ray();

    const ballMeshes = [];
    const balls = [];

    const getDirection = () => {
        tmpV.set(0, 0, 1);
        tmpV.unproject(playEye);
        tmpRay.origin.copy(playerBody.position);
        tmpRay.direction.copy(tmpV).sub(playerBody.position).normalize();
    }

    let i = 0;

    window.addEventListener('click', (event) => {
        if (!playerControl.enabled) {
            return
        }

        const ballBody = new Body({ mass: 1 })
        ballBody.addShape(ballShape)
        const ballMesh = new Mesh(ballGeometry, materialPool[i % 7]);

        ballMesh.castShadow = ballMesh.receiveShadow = true;

        world.addBody(ballBody)
        scene.add(ballMesh);
        balls.push(ballBody)
        ballMeshes.push(ballMesh)

        getDirection()
        const shootDirection = tmpRay.direction;
        ballBody.velocity.set(
            shootDirection.x * shootVelocity,
            shootDirection.y * shootVelocity,
            shootDirection.z * shootVelocity
        )

        // Move the ball outside the player sphere
        const x = playerBody.position.x + shootDirection.x * (playerShape.radius * 1.02 + ballShape.radius)
        const y = playerBody.position.y + shootDirection.y * (playerShape.radius * 1.02 + ballShape.radius)
        const z = playerBody.position.z + shootDirection.z * (playerShape.radius * 1.02 + ballShape.radius)
        ballBody.position.set(x, y, z)
        ballMesh.position.copy(ballBody.position);
        i++;
    })


    // render

    const clock = new Clock();

    function update() {
        const dt = clock.getDelta();
        world.step(1 / 120, dt);
        renderer.render(scene, playEye);
        playerControl.update(dt);
        stats.update();
        playerMesh.position.copy(playerBody.position);

        ballMeshes.forEach((ballMesh, i) => {
            ballMesh.position.copy(balls[i].position);
            ballMesh.quaternion.copy(balls[i].quaternion);
        })
    }

    function playRender() {
        update()
        animate = requestAnimationFrame(playRender);
    }

    update();

    window.addEventListener('keypress', (evt) => {
        if (evt.key == 'R') {
            playerBody.position.copy(playerInitPosition);
            playerBody.quaternion.set(0, 0, 0, 1);
            playerBody.velocity.set(0, 0, 0);
        }
    })

    resize(renderer, playEye, update)
}


