/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-02-28 16:39:44
 * @FilePath: /threejs-demo/src/examples/zFighting/test.js
 */
import {
    Scene,
    PerspectiveCamera,
    MeshPhongMaterial,
    PointLight,
    Mesh,
    Color,
    BoxGeometry,
    AmbientLight,
    MeshLambertMaterial,
    MeshBasicMaterial,
    EdgesGeometry,
    LineSegments,
    LineBasicMaterial,
    DirectionalLight,
    PlaneGeometry
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
    initRenderer, resize,
} from '../../lib/tools/index.js';
import {GUI} from '../../lib/util/lil-gui.module.min.js';

import { Stats } from '../../lib/util/Stats.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const stats = new Stats();
    stats.showPanel(0);
    document.getElementById('webgl-output').append(stats.dom);
    const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
    camera.up.set(0,0,1)
    camera.position.set(5,5,5);
    renderer.setClearColor(0xffffff)

    const light = new DirectionalLight( 0xffffff, 1 ); 
  
    const scene = new Scene();
    const ambientLight = new AmbientLight(0xffffff);
    scene.add(ambientLight,light);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    resize(renderer, camera);

    function render() {
        stats.begin();
        orbitControls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        light.position.copy(camera.position);
        stats.end();
    }
    render();
    window.camera = camera;
    window.scene = scene;
    const redMaterial = new MeshPhongMaterial({ color: 'red'});
    const greenMaterial = new MeshPhongMaterial({ color: 'blue' });
    const blueMaterial = new MeshPhongMaterial({ color: 'yellow'});


    const mlist = [redMaterial,greenMaterial,blueMaterial]
    const plane = new PlaneGeometry(1,1);

    const mesh = new Mesh(plane,redMaterial);
    mesh.scale.set(10,10,1);
    scene.add(mesh);

    const mesh2 = new Mesh(plane,greenMaterial);
    mesh2.scale.set(4,4,1);
    scene.add(mesh2);

    const mesh3 = new Mesh(plane,blueMaterial);
    mesh3.scale.set(2,2,1);
    scene.add(mesh3);

    const gui = new GUI();

    const material = {
        polygonOffset:false,
        polygonOffsetFactor:0,
        polygonOffsetUnits:0,
        shininess:0,
        transparent: false,
        depthTest: true,
        depthWrite: true,
        opacity:1
    }

    gui.add(material,'polygonOffset').onChange(e=>{
        mlist.forEach(m=>{
            m.polygonOffset = e
        })
    })

    gui.add(material,'polygonOffsetFactor',-100,100,1).onChange(e=>{
        mlist.forEach(m=>{
            m.polygonOffsetFactor = e
        })
    })

    gui.add(material,'polygonOffsetUnits',-100,100,0.1).onChange(e=>{
        mlist.forEach(m=>{
            m.polygonOffsetUnits = e
        })
    })

    gui.add(material,'shininess',0,100,0.01).onChange(e=>{
        mlist.forEach(m=>{
            m.shininess = e
        })
    })

    gui.add(material,'transparent').onChange(e=>{
        mlist.forEach(m=>{
            m.transparent = e
        })
    })

    gui.add(material,'depthTest').onChange(e=>{
        mlist.forEach(m=>{
            m.depthTest = e
        })
    })

    gui.add(material,'depthWrite',0,100,0.01).onChange(e=>{
        mlist.forEach(m=>{
            m.depthWrite = e
        })
    })

    gui.add(material,'opacity',0,1,0.01).onChange(e=>{
        mlist.forEach(m=>{
            m.opacity = e
        })
    })

}
