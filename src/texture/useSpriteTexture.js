/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-12-26 16:50:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-04 18:05:17
 * @FilePath: /threejs-demo/src/texture/useSpriteTexture.js
 */
import {
    TextureLoader,
    Mesh,
    MeshBasicMaterial,
    Vector3,
    PlaneGeometry,
    BoxGeometry,
    SRGBColorSpace,
    NearestFilter,
    BufferGeometry,
    Float32BufferAttribute,
    BufferAttribute
} from '../lib/three/three.module.js';
import {
    initOrbitControls,
    initRenderer,
    initScene,
    initOrthographicCamera,
    initGUI,
    initCustomGrid
} from '../lib/tools/index.js';

const basePath = '../../public/images/minecraft/';

const paths = [
    basePath + 'material-texture.png',
    basePath + 'atlas.png'
];


function createCubeGeometry() {
    ///   3 ________ 2                             0:[-1,-1, 1]   
    //    /|       /|     Z                        1:[ 1,-1, 1]                           <-
    //  0/_|______/ | 1   |  /y                    2:[ 1, 1, 1]                          ____
    //   | |      | |     | /                      3:[-1, 1, 1]               /| ^      |   /
    //   |5|______|_| 6   |/                       4:[-1,-1,-1]              / | |      |  /
    //   |/_______|/      |----------->x           5:[-1, 1,-1]             /  |        | /
    //  4         7                                6:[ 1, 1,-1]            /___|        |/
    ///                                            7:[ 1,-1,-1]             ->        
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute([
        // 0.1,2 TOP
        -1, -1, 1, 1, -1, 1, 1, 1, 1,
        // 2,3,0 TOP
        1, 1, 1, -1, 1, 1, -1, -1, 1,
        // 7,4,5 BOTTOM
        1, -1, -1, -1, -1, -1, -1, 1, -1,
        // 5,6,7 BOTTOM
        -1, 1, -1, 1, 1, -1, 1, -1, -1,
        // 4,7,1 FRONT
        -1, -1, -1, 1, -1, -1, 1, -1, 1,
        // 1,0,4 FRONT
        1, -1, 1, -1, -1, 1, -1, -1, -1,
        // 6,5,3 BACK
        1, 1, -1, -1, 1, -1, -1, 1, 1,
        // 3,2,6 BACK
        -1, 1, 1, 1, 1, 1, 1, 1, -1,
        // 5,4,0 LEFT
        -1, 1, -1, -1, -1, -1, -1, -1, 1,
        // 0,3,5 LEFT
        -1, -1, 1, -1, 1, 1, -1, 1, -1,
        //7,6,2 RIGHT
        1, -1, -1, 1, 1, -1, 1, 1, 1,
        // 2,1,7 RIGHT
        1, 1, 1, 1, -1, 1, 1, -1, -1
    ], 3))

    geometry.setAttribute('uv', new Float32BufferAttribute([
        // 0.1,2 TOP
        0, 0, 1, 0, 1, 1,
        // 2,3,0 TOP
        1, 1, 0, 1, 0, 0,
        // 7,4,5 BOTTOM
        0, 0, 1, 0, 1, 1,
        // 5,6,7 BOTTOM
        1, 1, 0, 1, 0, 0,
        // 4,7,1 FRONT
        0, 0, 1, 0, 1, 1,
        // 1,0,4 FRONT
        1, 1, 0, 1, 0, 0,
        // 6,5,3 BACK
        0, 0, 1, 0, 1, 1,
        // 3,2,6 BACK
        1, 1, 0, 1, 0, 0,
        //5,4,0 LEFT
        0, 0, 1, 0, 1, 1,
        //0,3,5 LEFT
        1, 1, 0, 1, 0, 0,
        //7,6,2 RIGHT
        0, 0, 1, 0, 1, 1,
        // 2,1,7 RIGHT
        1, 1, 0, 1, 0, 0,
    ], 2))


    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
}

const locationMap = {
    TOP: 0,
    BOTTOM: 7,
    FRONT: 13,
    BACK: 19,
    LEFT: 25,
    RIGHT: 31
}

function updateUV(geometry, location, row, column, x, y) {
    const uv = geometry.getAttribute('uv');
    const v = new BufferAttribute();
    const index = locationMap[location];
    for (let j = 0; j < 6; j++) {
        const k = index + j;
        uv.setXY(k, uv.getX(k) / row + 1, uv.getY(k) / column + 1);
    }
    uv.needsUpdate = true;
}


window.onload = async () => {
    init()
}

async function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, -20, 2));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.zoom = 1;

    const scene = initScene();
    renderer.setClearColor(0xffffff);
    const controls = initOrbitControls(camera, renderer.domElement);

    const loader = new TextureLoader();

    initCustomGrid(scene)


    const textures = [];
    for (let i = 0; i < paths.length; i++) {
        const texture = await loader.loadAsync(paths[i]);
        texture.colorSpace = SRGBColorSpace;
        texture.magFilter = NearestFilter;
        textures.push(texture);
    }

    const grassPlane = new Mesh(new PlaneGeometry(4, 8), new MeshBasicMaterial({ map: textures[1], side: 2 }));
    scene.add(grassPlane);
    grassPlane.position.set(0, 4, 4);
    grassPlane.rotateX(Math.PI / 2);



    const material = new MeshBasicMaterial({ map: textures[1], wireframe: false })
    const cube = new Mesh(createCubeGeometry(), material);
    cube.scale.set(2, 2, 2);
    cube.position.set(0, 0, 0);

    // cube.geometry.attributes.uv

    function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();
}
