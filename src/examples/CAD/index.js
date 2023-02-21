
import { CustomGridHelper } from './src/helper/CustomGridHelper.js';
import { CoordinateHelper } from './src/helper/coordinateHelper.js';
import { CAD } from './src/core/CAD.js';
import dat from './src/utils/dat.gui.js';


const dom = document.querySelector('#cad')

const init = () => {
    const cad = new CAD(dom,window.innerWidth,window.innerHeight);
    cad.render();
    window.onresize = function () {
      const {width,height} = dom.getBoundingClientRect();
      cad.resize(width,height);
    }

    const controls = {
        view:'3D'
    }

    const gui = new dat.GUI();
    const viewFolder = gui.addFolder('View Select');
    viewFolder.add(controls,'view',['3D','XY','XZ','YZ']).name('View').onChange(e=>{
        console.log(e);
        cad.setView(e)
    })
    


    const customGrid = new CustomGridHelper(50, 50, 1, 10);
    cad.add(customGrid);

    const coordinateHelper = new CoordinateHelper({ x: 'red', y: 'green', z: 'blue' }, 26);
    cad.add(coordinateHelper);

    console.log(cad);
    window.cad = cad;
}


window.onload = function () {
    init()
}