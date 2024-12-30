import {
    Mesh,
    Vector3,
    PlaneGeometry,
    CanvasTexture,
    Vector2,
    BufferGeometry,
    MathUtils,
    MeshPhysicalMaterial,
    Color,
} from 'three';
import { SimplexNoise } from '../lib/custom/SimplexNoise.js';

import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initPerspectiveCamera,
    initDirectionLight,
    HALF_PI,
    initAmbientLight,
    initGUI
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.setClearColor(new Color('gainsboro'));
    const camera = initPerspectiveCamera(new Vector3(0, 5, 8));
    const scene = initScene();

    initAmbientLight(scene);

    const orbitControl = initOrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = orbitControl.autoRotate = true;

    const light = initDirectionLight();
    light.position.set(0, 5, 0);
    scene.add(light);


    resize(renderer, camera);

    const size = new Vector2(10, 10);
    const halfSize = new Vector2();
    const segments = new Vector2();

    const geometry = new BufferGeometry();

    const lutTexture = createLutTexture();
    const terrain = new Mesh(geometry, new MeshPhysicalMaterial({
        map: lutTexture,
        metalness: 0,
        roughness: 1,
        side: 2,
    }));

    terrain.rotation.x = -HALF_PI;
    scene.add(terrain);


    function updateSize() {
        segments.copy(size).multiplyScalar(50);
        halfSize.copy(size).multiplyScalar(0.5);
        const plane = new PlaneGeometry(size.x, size.y, segments.x, segments.y);
        plane.computeVertexNormals();

        geometry.dispose();
        ['position', 'normal', 'uv'].forEach((key) => {
            geometry.setAttribute(key, plane.getAttribute(key));
        });
        geometry.setIndex(plane.getIndex());
    }

    function updateTerrain() {
        const { position, uv, normal } = geometry.attributes;
        const simplex = new SimplexNoise();

        let [x, y, z] = [0, 0, 0];
        // update all vertices - Z coordinate and texture coordinate
        for (let i = 0, j = position.count; i < j; i++) {
            // vertex coordinates
            [x, y] = [position.getX(i), position.getY(i)];
            // calculate elevation
            z = 0.4 * simplex.noise(0.2 * x, 0.2 * y) + 0.2 * simplex.noise(0.5 * x, 0.5 * y) + 0.1 * simplex.noise(1.5 * x, 1.5 * y);
            // make mountains more spiky, underwater more smooth
            z = z > 0 ? 4 * z ** 2 : - (z ** 2);

            // add tiny shallow water effect
            z = z + 0.003 * simplex.noise(50 * x, 50 * y);

            // shape vertical borders
            if (Math.abs(x) === halfSize.x || Math.abs(y) === halfSize.y) {
                z = -0.5;
            } else if (Math.abs(x) >= halfSize.x * (1 - 2 / segments.x) || Math.abs(y) >= halfSize.y * (1 - 2 / segments.y)) {
                z = 0;
            }

            position.setZ(i, z);
            uv.setXY(i, 0, MathUtils.mapLinear(z, -0.5, 1, 1, 0));
        }

        geometry.computeVertexNormals();
        // make sides black
        for (let j = 0, k = normal.count; j < k; j++) {
            [x, y] = [position.getX(j), position.getY(j)];
            if (Math.abs(x) >= halfSize.x * (1 - 2 / segments.x) || Math.abs(y) >= halfSize.y * (1 - 2 / segments.y)) {
                normal.setXYZ(j, 0, 0, 0);
            }
        }

        position.needsUpdate = normal.needsUpdate = uv.needsUpdate = true;
    }

    function update() {
        updateSize();
        updateTerrain();
    }

    update();

    const params = {
        autoGenerate: true
    }

    const gui = initGUI();
    gui.add(size, 'x', 2, 10, 1).name('Size Width:').onChange(updateSize);
    gui.add(size, 'y', 2, 10, 1).name('Size Height:').onChange(updateSize);
    gui.add(params, 'autoGenerate').name('Auto Generate');
    gui.add(orbitControl, 'autoRotate').name('Auto Rotate');

    setInterval(() => {
        params.autoGenerate && updateTerrain();
    }, 3000)


    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}


function createLutTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    camera.height = 128;
    const ctx = canvas.getContext('2d');

    const colorBar = {
        'black': 0.2,
        'blue': 0.33,
        'royalblue': 0.345,
        'yellow': 0.35,
        'forestgreen': 0.351,
        'seagreen': 0.7,
        'darkseagreen': 0.8,
        'white': 0.9
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    Object.entries(colorBar).forEach(([color, val]) => {
        gradient.addColorStop(val, color)
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const lutTexture = new CanvasTexture(canvas);

    return lutTexture;
}
