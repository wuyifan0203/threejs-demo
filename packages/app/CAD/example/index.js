import { CAD, CoordinateHelper, CustomGridHelper } from '../build/cad.esm.js';
import { BoxGeometry, Color, Mesh, MeshBasicMaterial } from '../src/lib/three.module.js'

import dat from '../src/utils/dat.gui.js';


const dom = document.querySelector('#cad')

const init = () => {
    const cad = new CAD(dom, window.innerWidth, window.innerHeight);
    cad.render();
    window.onresize = function () {
        const { width, height } = dom.getBoundingClientRect();
        cad.resize(width, height);
    }

    const controls = {
        view: '3D',
        mode: 'SELECT'
    }

    const gui = new dat.GUI();
    const viewFolder = gui.addFolder('View Select');
    viewFolder.add(controls, 'view', ['3D', 'XY', 'XZ', 'YZ']).name('View:').onChange(e => {
        console.log(e);
        cad.setView(e)
    });

    const modeFolder = gui.addFolder('Mode Select');
    modeFolder.add(controls, 'mode', ['SELECT', 'ZOOM', 'PAN', 'ROTATE']).name('Mode:').onChange(e => {
        console.log(e);
        cad.setMode(e);
    });

    console.log(cad.renderer);

    const customGrid = new CustomGridHelper(50, 50, 1, 10);
    cad.add(customGrid);

    const coordinateHelper = new CoordinateHelper({ x: 'red', y: 'green', z: 'blue' }, 26);
    cad.add(coordinateHelper);

    cad.selectChange = (obj) => {
        console.log(obj);
    }
    cad.collector.exclusion = ['CoordinateHelper', 'CustomGridHelper'];

    const box = new BoxGeometry(1,1,1);
    const material = new MeshBasicMaterial({
        color:'blue',
        transparent:true,
        opacity:0.5,
        side:2,
        depthTest : false

    });

    const mesh = new Mesh(box,material);
    mesh.name = 'box1';

    cad.add(mesh);

    mesh.material.color.set(new Color(1,0,0))

    // mesh.material = new MeshBasicMaterial({})

    console.log(cad);

    window.cad = cad;
}


window.onload = function () {
    init()
}

