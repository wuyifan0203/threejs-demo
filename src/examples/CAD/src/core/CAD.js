import { ViewHelper } from '../helper/ViewHelper.js';
import { OrbitControls } from '../controls/OrbitControls.js';
import { OrthographicCamera, Scene, Vector3, WebGLRenderer } from '../lib/three.module.js';
import { TransformControls } from '../controls/TransformControls.js';
import { Stats } from '../utils/Stats.js';
import { GPUStatsPanel } from '../utils/GPUStatsPanel.js';

const viewPosition = {
    '3D': new Vector3(1000, 1000, 1000),
    'XY': new Vector3(0, 0, 1000),
    'XZ': new Vector3(0, 1000, 0),
    'YZ': new Vector3(1000, 0, 0),
}

const s = 15;

class CAD {
    constructor(container, width, height) {
        this.height = height || window.innerHeight;
        this.width = width || window.innerWidth;
        this.insetHeight = this.height /3;
        this.insetWidth = this.width /3;
        this._container = container;
        container.style.position = 'absolute'
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setClearColor('#ffffff');
        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;
        const aspect = s * (this.height / this.width);
        this.cameras = {
            '3D': new OrthographicCamera(-s, s, aspect, -aspect, 1, 100000),
            '2D': new OrthographicCamera(-s, s, aspect, -aspect, 1, 100000)
        }
        this.mainCamera = this.cameras['3D'];
        this.cameras['3D'].up.set(0, 0, 1);
        this.cameras['3D'].position.copy(viewPosition['3D']);
        this.cameras['3D'].name = '3D';
        this.deputyCamera = this.cameras['2D'];
        this.cameras['2D'].up.set(0, 0, 1);
        this.cameras['2D'].position.copy(viewPosition['XY']);
        this.cameras['2D'].name = '2D';
        this.orbitControls = new OrbitControls(this.mainCamera, this.renderer.domElement);
        this.trasnlater = new TransformControls(this.mainCamera, this.renderer.domElement);
        this.viewHelper = new ViewHelper(this.mainCamera, this.renderer.domElement);
        // this.viewHelper.position.set(0.5, 0.5, 0);
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.gpuPanel = new GPUStatsPanel(this.renderer.getContext());
        this.stats.addPanel(this.gpuPanel);
        this.stats.showPanel(0);
        this.userData = {};
        this.mainView = '3D'
        container.appendChild(this.stats.dom);
        container.appendChild(this.renderer.domElement);
    }

    add(object) {
        this.scene.add(object);
    }

    remove() { }

    setView(viewName){
        this.mainView = viewName;
        if(viewName === '3D'){
            this.mainCamera = this.cameras['3D'];
            this.deputyCamera = this.cameras['2D'];
        }else{
            this.mainCamera = this.cameras['2D'];
            console.log(viewPosition[viewName]);
            this.mainCamera.position.copy(viewPosition[viewName]);
            this.deputyCamera = this.cameras['3D'];
        }
        this.mainCamera.updateProjectionMatrix();
        this.viewHelper.editorCamera = this.orbitControls.objec = this.mainCamera;
        this.orbitControls.update();
    }



    render() {
        requestAnimationFrame(() => this.render());
        this.gpuPanel.startQuery();
        this.renderer.clear();
        // console.log(this.mainCamera.name);
        // main
        this.renderer.render(this.scene, this.mainCamera);
        // others
        this.orbitControls.update();// !important
        this.viewHelper.render(this.renderer);
        this.stats.update();
        this.gpuPanel.endQuery();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.renderer.setSize(this.width, this.height);
        const aspect = s * height / width
        Object.values(this.cameras).forEach(camera => {
            camera.top = aspect;
            camera.bottom = - aspect;
            camera.updateProjectionMatrix()
        });
    }

}

export { CAD }