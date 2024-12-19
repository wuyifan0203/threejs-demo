import {
    Vector3,
    BufferGeometry,
    MathUtils,
    Group,
    AdditiveBlending,
    Box3,
    Vector2,
    ReinhardToneMapping
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initGUI,
    initScene,
    initOrbitControls,
    publicPath,
    getColor,
    resize
} from '../lib/tools/index.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

window.onload = async () => {
    await init();
};

async function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, 0, 100));
    camera.far = 500;
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    const scene = initScene();
    renderer.setClearColor('#262626');
    renderer.toneMapping = ReinhardToneMapping;

    const controls = initOrbitControls(camera, renderer.domElement);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.5, 0.8, 0.20);
    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    (function render() {
        controls.update();
        composer.render();
        requestAnimationFrame(render);
    })();

    const loader = new FontLoader();

    const fonts = [
        'gentilis_bold.typeface',
        'Dropshipe_Regular',
        'Beautiful_Athellin_Regular',
        'Valentine_Script_Regular',
    ];

    const fontObjects = {};
    for (const font of fonts) {
        fontObjects[font] = await loader.loadAsync(`../../${publicPath}/fonts/${font}.json`);
    }

    const geometryParams = {
        text: 'I miss you so much',
        font: fontObjects[fonts[2]],
        size: 3,
    }

    const fontLines = new Group();
    scene.add(fontLines);

    const tmpBox = new Box3();

    const params = {
        exposure: 1,
        lineWidth: 2,
    };

    resize(renderer, [camera], (w, h) => {
        composer.setSize(w, h);
        fontLines.traverse((child) => {
            if (child?.isLine2) {
                child.material.uniform.resolution.value.set(w, h);
                child.material.needsUpdate = true;
            }
        });
    });


    function createFont() {
        tmpBox.makeEmpty();
        const shapes = geometryParams.font.generateShapes(geometryParams.text, geometryParams.size);
        shapes.forEach((shape) => {
            const geometry = new LineGeometry().fromEdgesGeometry(new BufferGeometry().setFromPoints(shape.getPoints()));
            geometry.computeBoundingBox();
            tmpBox.union(geometry.boundingBox);
            const material = new LineMaterial({ color: getColor(MathUtils.randInt(30, 255)), blending: AdditiveBlending, linewidth: params.lineWidth });
            fontLines.add(new Line2(geometry, material));

            shape.holes.forEach((hole) => {
                const geometry = new LineGeometry().fromEdgesGeometry(new BufferGeometry().setFromPoints(hole.getPoints()));
                geometry.computeBoundingBox();
                tmpBox.union(geometry.boundingBox);
                const material = new LineMaterial({ color: getColor(MathUtils.randInt(30, 255)), blending: AdditiveBlending, linewidth: params.lineWidth });
                fontLines.add(new Line2(geometry, material));
            });
        });
        fontLines.position.set((tmpBox.max.x - tmpBox.min.x) * -0.5, (tmpBox.max.y - tmpBox.min.y) * -0.5, 0);
    }

    function update() {
        fontLines.children.forEach((line) => {
            line.material.dispose();
            line.geometry.dispose();
            fontLines.remove(line);
        });

        fontLines.clear();

        try {
            createFont();
        } catch (e) {
            alert('Don`t support special characters');
            console.log(e);
        }

    }

    update();



    const gui = initGUI();
    gui.add(geometryParams, 'font', fontObjects).onChange(update);
    gui.add(geometryParams, 'text', geometryParams.text).onChange(update);
    gui.add(geometryParams, 'size', 1, 50, 0.1).onChange(update);
    gui.add(params, 'lineWidth', 1, 5, 0.1).onChange(() => {
        fontLines.traverse(child => {
            if (child?.isLine2) {
                child.material.linewidth = params.lineWidth;
                child.material.needsUpdate = true;
            }
        });
    });
    const bloomFolder = gui.addFolder('bloom');
    bloomFolder.add(bloomPass, 'threshold', 0.15, 1.0).onChange(function (value) {
        bloomPass.threshold = Number(value);
    });

    bloomFolder.add(bloomPass, 'strength', 0.0, 3.0).onChange(function (value) {
        bloomPass.strength = Number(value);
    });

    gui.add(bloomPass, 'radius', 0.0, 1.0).step(0.01).onChange(function (value) {
        bloomPass.radius = Number(value);
    });

    const toneMappingFolder = gui.addFolder('tone mapping');

    toneMappingFolder.add(params, 'exposure', 0.1, 2).onChange(function (value) {
        renderer.toneMappingExposure = Math.pow(value, 4.0);
    });
}

