/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-12-26 16:50:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-01 18:09:20
 * @FilePath: /threejs-demo/src/texture/useTexture.js
 */
import {
    TextureLoader,
    Mesh,
    MeshBasicMaterial,
    Vector3,
    PlaneGeometry,
    UVMapping,
    CubeReflectionMapping,
    CubeRefractionMapping,
    EquirectangularReflectionMapping,
    EquirectangularRefractionMapping
} from '../lib/three/three.module.js';
import {
    initOrbitControls,
    initRenderer,
    initScene,
    initOrthographicCamera,
    initGUI
} from '../lib/tools/index.js';

const path = '../../public/images/sky1/nx.png';

window.onload = async () => {
    init()
}

async function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, 0, 200));
    camera.lookAt(0, 0, 0);

    const scene = initScene();
    renderer.setClearColor(0xffffff);
    const controls = initOrbitControls(camera, renderer.domElement);

    const texture = await new TextureLoader().loadAsync(path);
    const material = new MeshBasicMaterial({ map: texture });

    scene.add(new Mesh(new PlaneGeometry(10, 10), material));


    function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    console.log(texture);

    function update() {
        texture.needsUpdate = true;
    }


    const gui = initGUI();
    gui.add(material, 'mapping', {
        'UV(default)': UVMapping,
        'CubeReflection(立方体反射)': CubeReflectionMapping,
        'CubeRefraction(立方体折射)': CubeRefractionMapping,
        'EquirectangularReflection(等距反射)': EquirectangularReflectionMapping,
        'EquirectangularRefraction(等距折射)': EquirectangularRefractionMapping,
    }).name('mapping(映射方式)').onFinishChange(update);

}
