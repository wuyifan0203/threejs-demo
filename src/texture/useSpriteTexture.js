/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-12-26 16:50:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 13:40:21
 * @FilePath: /threejs-demo/src/texture/useSpriteTexture.js
 */
import {
    TextureLoader,
    Mesh,
    MeshStandardMaterial,
    Vector3,
    PlaneGeometry,
    SRGBColorSpace,
    NearestFilter,
    BufferGeometry,
    Float32BufferAttribute,
    CameraHelper
} from '../lib/three/three.module.js';
import {
    initOrbitControls,
    initRenderer,
    initScene,
    initOrthographicCamera,
    initGroundPlane,
    initDirectionLight,
    initAmbientLight,
    resize
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
    BOTTOM: 6,
    FRONT: 12,
    BACK: 18,
    LEFT: 24,
    RIGHT: 30
}

function updateUV(geometry, location, row, column, x, y) {
    const uv = geometry.getAttribute('uv');
    const index = locationMap[location];
    const originX = (x - 1) / row;
    const originY = (y - 1) / column;
    const targetX = x / row;
    const targetY = y / column;

    uv.setXY(index, originX, originY);
    uv.setXY(index + 1, targetX, originY);
    uv.setXY(index + 2, targetX, targetY);
    uv.setXY(index + 3, targetX, targetY);
    uv.setXY(index + 4, originX, targetY);
    uv.setXY(index + 5, originX, originY);
    uv.needsUpdate = true;
}


window.onload = async () => {
    init()
}

async function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    renderer.setClearColor(0xcccccc);
    const camera = initOrthographicCamera(new Vector3(0, -700, 520));
    camera.up.set(0, 0, 1);
    camera.zoom = 0.5;

    const scene = initScene();
    const controls = initOrbitControls(camera, renderer.domElement);
    controls.target.set(8, 2, 0);
    controls.update();
    const loader = new TextureLoader();

    const asp = window.innerWidth / window.innerHeight;
    const light = initDirectionLight();
    light.position.set(30, -40, 80);
    light.shadow.mapSize.width = 8192;
    light.shadow.mapSize.height = 8192;
    light.shadow.camera.near = 60;
    light.shadow.camera.far = 110;
    light.shadow.camera.left = -30;
    light.shadow.camera.right = 30;
    light.shadow.camera.top = 30 * asp;
    light.shadow.camera.bottom = -30 * asp;
    scene.add(light);

    initAmbientLight(scene);
    initGroundPlane(scene);

    const textures = [];
    for (let i = 0; i < paths.length; i++) {
        const texture = await loader.loadAsync(paths[i]);
        texture.colorSpace = SRGBColorSpace;
        texture.magFilter = NearestFilter;
        textures.push(texture);
    }

    const planeGeometry = new PlaneGeometry(1, 1);
    const grassPlane = new Mesh(planeGeometry, new MeshStandardMaterial({ map: textures[1] }));
    grassPlane.scale.set(2, 4, 1);
    grassPlane.rotateX(Math.PI / 2);
    grassPlane.position.set(-10, 4, 4);
    grassPlane.castShadow = true;
    scene.add(grassPlane);


    const grassCube = new Mesh(createCubeGeometry(), grassPlane.material);
    grassCube.position.set(-10, 0, 1);
    grassCube.receiveShadow = grassCube.castShadow = true;
    scene.add(grassCube);
    updateUV(grassCube.geometry, 'TOP', 1, 2, 1, 2);
    updateUV(grassCube.geometry, 'FRONT', 1, 2, 1, 1);
    updateUV(grassCube.geometry, 'BACK', 1, 2, 1, 1);
    updateUV(grassCube.geometry, 'LEFT', 1, 2, 1, 1);
    updateUV(grassCube.geometry, 'RIGHT', 1, 2, 1, 1);
    updateUV(grassCube.geometry, 'BOTTOM', 2, 4, 1, 1);

    const allMaterialPlane = new Mesh(planeGeometry, new MeshStandardMaterial({ map: textures[0] }));
    allMaterialPlane.scale.set(32, 16, 1);
    allMaterialPlane.rotateX(Math.PI / 2);
    allMaterialPlane.position.set(10, 4.5, 8);
    allMaterialPlane.receiveShadow = allMaterialPlane.castShadow = true;
    scene.add(allMaterialPlane);

    const keyMap = ['TOP', 'BOTTOM', 'FRONT', 'BACK', 'LEFT', 'RIGHT'];
    const objectMap = {
        // name:[top,bottom,front,back,left,right]
        wood: [[30, 14], [30, 14], [29, 14], [29, 14], [29, 14], [29, 14]],
        maple: [[2, 13], [2, 13], [1, 13], [1, 13], [1, 13], [1, 13]],
        bedrock: [[1, 15], [1, 15], [1, 15], [1, 15], [1, 15], [1, 15]],
        tnt: [[25, 15], [26, 15], [24, 15], [24, 15], [24, 15], [24, 15]],
        watermelon: [[27, 10], [27, 10], [26, 10], [26, 10], [26, 10], [26, 10]],
        pumpkin: [[10, 10], [10, 10], [12, 10], [11, 10], [11, 10], [11, 10]],
        box: [[23, 7], [23, 7], [25, 7], [24, 7], [24, 7], [24, 7]],
        mica: [[32, 13], [32, 13], [32, 13], [32, 13], [32, 13], [32, 13]],
        stone: [[27, 16], [27, 16], [27, 16], [27, 16], [27, 16], [27, 16]],
        copperOre: [[31, 13], [31, 13], [31, 13], [31, 13], [31, 13], [31, 13]],
        redOre: [[30, 13], [30, 13], [30, 13], [30, 13], [30, 13], [30, 13]],
        diamondOre: [[29, 13], [29, 13], [29, 13], [29, 13], [29, 13], [29, 13]],
        chloriteOre: [[28, 13], [28, 13], [28, 13], [28, 13], [28, 13], [28, 13]],
        coalOre: [[27, 13], [27, 13], [27, 13], [27, 13], [27, 13], [27, 13]],
        ironOre: [[26, 13], [26, 13], [26, 13], [26, 13], [26, 13], [26, 13]],
        goldOre: [[25, 13], [25, 13], [25, 13], [25, 13], [25, 13], [25, 13]],
        workbench: [[6, 12], [8, 13], [7, 12], [8, 12], [7, 12], [8, 12]],
        furnace: [[12, 12], [12, 12], [10, 12], [11, 12], [11, 12], [11, 12]]
    }

    let num = 0;
    for (const key in objectMap) {
        const location = objectMap[key];
        const mesh = new Mesh(createCubeGeometry(), allMaterialPlane.material);
        mesh.name = key;
        mesh.position.set((num % 8) * 4 - 5, -(Math.floor(num / 8)) * 4, 1);
        mesh.castShadow = mesh.receiveShadow = true;
        scene.add(mesh);

        for (let j = 0; j < location.length; j++) {
            const key = keyMap[j];
            const [x, y] = location[j]
            updateUV(mesh.geometry, key, 32, 16, x, y);
        }
        num++;
    }

    function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer,camera);
}
