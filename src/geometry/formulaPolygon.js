import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    ExtrudeGeometry,
    Shape,
    Vector2,
} from 'three';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initPerspectiveCamera,
    initScene,
    initOrbitControls,
    initGUI,
    initViewHelper
} from '../lib/tools/index.js';

const {compile, isComplex} = math;

function round(num, bit = 14) {
    return Number(num.toFixed(bit));
}

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(14, -16, 15));
    const scene = initScene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);
    initCustomGrid(scene);
    initAxesHelper(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    const viewHelper = initViewHelper(camera, renderer.domElement);

    draw(scene);

    (function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
        requestAnimationFrame(render);
    })();

}

function draw(scene) {
    const material = new MeshNormalMaterial({
        depthTest: true,
        side: 2,
    });

    const funcList = [
        '2x+1',
        '2 * sin(x)',
        'x^2+1',
        'sqrt(0.5^2-(x-0.5)^2)',
        'sqrt(0.8^2-(x-0.8)^2)',
        '-0.189 * (11.92 - x)^1.15 + 7.5',
        'x * C',
    ];

    const controls = {
        func1: 1,
        func2: 2,
        isSymmetric: true,
    };

    const extrudeSettings = {
        steps: 2,
        depth: 1,
        bevelEnabled: false,
        bevelThickness: 1,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 1,
    };

    const geometryParams = {
        xMin: -11.92,
        xMax: 11.92,
        yMin: -7.5,
        yMax: 7.5,
        resolution: 200,
    };

    function getFormulaPoints() {
        const {
            xMax, xMin, yMax, yMin, resolution,
        } = geometryParams;
        const {isSymmetric, func1, func2} = controls;
        const delta = (xMax - xMin) / resolution;
        const positive = [];
        const negative = [];
        if (!isSymmetric) {
            const funcCompile1 = compile(funcList[func1]);
            const getY = computeFunc(funcCompile1, yMin, yMax);
            for (let index = 0, length = geometryParams.resolution - 1; index < length; index++) {
                const x = round(xMin + index * delta);
                const y = getY(x);
                if (!isComplex(y)) {
                    positive.push(new Vector2(x, y));
                    negative.push(new Vector2(x, -y));
                }
            }
            const y = getY(xMax);
            if (!isComplex(y)) {
                positive.push(new Vector2(xMax, y));
                negative.push(new Vector2(xMax, -y));
            }
        } else {
            const funcCompile1 = compile(funcList[func1]);
            const funcCompile2 = compile(funcList[func2]);
            const getY1 = computeFunc(funcCompile1, yMin, yMax);
            const getY2 = computeFunc(funcCompile2, yMin, yMax);
            for (let index = 0, length = geometryParams.resolution - 1; index < length; index++) {
                const x = round(xMin + index * delta);
                const y1 = getY1(x);
                const y2 = getY2(x);
                if (!isComplex(y1)) {
                    positive.push(new Vector2(x, y1));
                }
                if (!isComplex(y2)) {
                    negative.push(new Vector2(x, -y2));
                }
            }
            const y1 = getY1(xMax);
            const y2 = getY2(xMax);
            if (!isComplex(y1)) {
                positive.push(new Vector2(xMax, y1));
            }
            if (!isComplex(y2)) {
                negative.push(new Vector2(xMax, -y2));
            }
        }
        const result = [...positive, ...negative.reverse()];
        return result.length ? new Shape().setFromPoints(result) : new Shape();
    }

    function computeFunc(funcCompile, yMin, yMax) {
        return (x) => {
            let y = funcCompile.evaluate({x});
            if (y > yMax) {
                y = yMax;
            } else if (y < yMin) {
                y = yMin;
            }
            return y;
        };
    }

    const path = getFormulaPoints();
    const geometry = new ExtrudeGeometry(path, geometryParams);
    const mesh = new Mesh(geometry, material);

    scene.add(mesh);

    const getOptions = () => {
        const options = {};
        funcList.forEach((key, i) => {
            options[key] = i;
        });
        return options;
    };

    const gui = initGUI();
    gui.width = 320;
    const rangeSettingFolder = gui.addFolder('Range Setting');
    rangeSettingFolder.add(geometryParams, 'xMin', -25, 10, 0.01).onChange(() => update());
    rangeSettingFolder.add(geometryParams, 'xMax', -10, 25, 0.01).onChange(() => update());
    rangeSettingFolder.add(geometryParams, 'yMin', -10, 10, 0.1).onChange(() => update());
    rangeSettingFolder.add(geometryParams, 'yMax', -10, 10, 0.1).onChange(() => update());
    rangeSettingFolder.add(geometryParams, 'resolution', [10, 20, 50, 100, 200, 500]).onChange(() => update());

    const settingFolder = gui.addFolder('Setting');
    settingFolder.add(controls, 'func1', getOptions()).onChange(() => update());
    settingFolder.add(controls, 'isSymmetric').onChange(() => update());
    settingFolder.add(controls, 'func2', getOptions()).onChange(() => update());

    const geometryFolder = gui.addFolder('Geometry');
    geometryFolder.add(material, 'wireframe');
    geometryFolder.add(extrudeSettings, 'steps', 1, 10, 1).onChange(() => update());
    geometryFolder.add(extrudeSettings, 'depth', 0.5, 10, 0.1).onChange(() => update());
    geometryFolder.add(extrudeSettings, 'bevelEnabled', 1, 10, 1).onChange(() => update());
    geometryFolder.add(extrudeSettings, 'bevelSize', 0, 10, 1).onChange(() => update());
    geometryFolder.add(extrudeSettings, 'bevelSegments', 1, 10, 1).onChange(() => update());
    geometryFolder.add(extrudeSettings, 'bevelOffset', 1, 10, 1).onChange(() => update());

    function update() {
        mesh.geometry.dispose();
        const path = getFormulaPoints();
        mesh.geometry = new ExtrudeGeometry(path, extrudeSettings);
        mesh.geometry.needUpdate = true;
    }

    update();
}
