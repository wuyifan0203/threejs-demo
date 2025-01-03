import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    ExtrudeGeometry,
    Shape,
    Vector2,
    Path,
} from 'three';
import {
    initRenderer,
    initPerspectiveCamera,
    initAxesHelper,
    initCustomGrid,
    resize,
    initScene,
    initOrbitControls,
    initGUI,
    initViewHelper
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
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

const funcList = {
    Square() {
        return {
            path: [
                [2, 2],
                [-2, 2],
                [-2, -2],
                [2, -2],
            ],
        };
    },
    InversSquare() {
        return {
            path: [
                [2, 2],
                [2, -2],
                [-2, -2],
                [-2, 2],
            ],
        };
    },
    SquareWithHole() {
        return {
            path: [
                [8, 8],
                [-8, 8],
                [-8, -8],
                [8, -8],
            ],
            holes: [[
                [1, 1],
                [0, 1],
                [-1, -1],
                [1, -1],
            ], [
                [3, 3],
                [3, 2],
                [2, 2],
                [2, 3],
            ]],
        };
    },

};

function draw(scene) {
    const list = Object.keys(funcList);

    const material = new MeshNormalMaterial({
        depthTest: true,
        side: 2,
    });

    const controls = {drawFunc: list[2]};

    const extrudeSettings = {
        steps: 2,
        depth: 3,
        bevelEnabled: false,
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 1,
    };

    function getShape(func) {
        const {path, holes} = func();

        const pathArray = path.map((vec2) => new Vector2(...vec2));
        const shape = new Shape(pathArray);
        if (holes) {
            holes.forEach((hole) => {
                shape.holes.push(new Path(hole.map((v) => new Vector2(...v))));
            });
        }
        return shape;
    }

    const shape = getShape(funcList[controls.drawFunc]);

    const parametric = new ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new Mesh(parametric, material);

    const gui = initGUI();

    function update() {
        parametric.dispose();
        mesh.geometry = new ExtrudeGeometry(getShape(funcList[controls.drawFunc]), extrudeSettings);
    }

    gui.add(controls, 'drawFunc', list).onChange(() => update());
    gui.add(material, 'wireframe');
    gui.add(extrudeSettings, 'steps', 1, 10, 1).onChange(() => update());
    gui.add(extrudeSettings, 'depth', 1, 10, 0.1).onChange(() => update());
    gui.add(extrudeSettings, 'bevelEnabled', 1, 10, 1).onChange(() => update());
    gui.add(extrudeSettings, 'bevelSize', 0, 10, 1).onChange(() => update());
    gui.add(extrudeSettings, 'bevelSegments', 1, 10, 1).onChange(() => update());
    gui.add(extrudeSettings, 'bevelOffset', 1, 10, 1).onChange(() => update());

    scene.add(mesh);
}
