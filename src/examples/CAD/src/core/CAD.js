import { ViewHelper } from '../helper/ViewHelper.js';
import { OrbitControls } from '../controls/OrbitControls.js';
import { OrthographicCamera, Raycaster, WebGLRenderer,MOUSE, Vector2} from '../lib/three.module.js';
import { TransformControls } from '../controls/TransformControls.js';
import { Stats } from '../utils/Stats.js';
import { GPUStatsPanel } from '../utils/GPUStatsPanel.js';
import { RenderPass } from '../postprocessing/RenderPass.js';
import { EffectComposer } from '../postprocessing/EffectComposer.js';
import {S,VIEWPOSITION,MOUSESTYLE} from '../lib/constant.js';
import { Collector } from './Collector.js';

const raycaster = new Raycaster();
const raycastObjects = [];

class CAD {
    constructor(container, width, height) {
        this.height = height || window.innerHeight;
        this.width = width || window.innerWidth;
        this._container = container;
        container.style.position = 'absolute'
        this.collector = new Collector();
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setClearColor('#ffffff');
        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;
        const aspect = S * (this.height / this.width);
        this.cameras = {
            '3D': new OrthographicCamera(-S, S, aspect, -aspect, 1, 100000),
            '2D': new OrthographicCamera(-S, S, aspect, -aspect, 1, 100000)
        }
        this.mainCamera = this.cameras['3D'];
        this.cameras['3D'].up.set(0, 0, 1);
        this.cameras['3D'].position.copy(VIEWPOSITION['3D']);
        this.cameras['3D'].name = '3D';
        this.deputyCamera = this.cameras['2D'];
        this.cameras['2D'].up.set(0, 0, 1);
        this.cameras['2D'].position.copy(VIEWPOSITION['XY']);
        this.cameras['2D'].name = '2D';
        this.orbitControls = new OrbitControls(this.mainCamera, this.renderer.domElement);
        this.trasnlater = new TransformControls(this.mainCamera, this.renderer.domElement);
        this.viewHelper = new ViewHelper(this.mainCamera, this.renderer.domElement);
        this.viewHelper.position.set(0.5, 0.5, 0);
        this.stats = new Stats();
        this.stats.dom.style.position = 'absolute';
        this.gpuPanel = new GPUStatsPanel(this.renderer.getContext());
        this.stats.addPanel(this.gpuPanel);
        this.stats.showPanel(0);
        this.userData = {};
        this.mainView = '3D'
        container.appendChild(this.stats.dom);
        container.appendChild(this.renderer.domElement);
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.collector.scene, this.mainCamera);
        this.composer.addPass(this.renderPass);
        this.mode = 'SELECT';
        this.setMode(this.mode);
        this.listenerControl();
        this.selectChange = ()=>{};
    }

    add(object) {
        this.collector.track(object);
    }

    remove(object) {
        this.collector.track(object);
    }

    removeById(id){
        const object = this.collector.scene.getObjectById(id);
        this.remove(object);
    }

    setView(viewName) {
        this.mainView = viewName;
        if (viewName === '3D') {
            this.mainCamera = this.cameras['3D'];
            this.deputyCamera = this.cameras['2D'];
        } else {
            this.mainCamera = this.cameras['2D'];
            this.mainCamera.position.copy(VIEWPOSITION[viewName]);
            this.deputyCamera = this.cameras['3D'];
            this.mainCamera.updateProjectionMatrix();
        }
        this.renderPass.camera = this.viewHelper.editorCamera = this.orbitControls.object = this.mainCamera;
    }

    setMode(modeName){
        this.mode = modeName;
        if(modeName === 'SELECT'){
            this.orbitControls.mouseButtons = {
                LEFT:-1,
                MIDDLE:MOUSE.PAN,
                RIGHT:MOUSE.ROTATE
            }
            this._container.style.cursor = MOUSESTYLE.SELECT;
        }else if (modeName === 'ZOOM'){
            this.orbitControls.mouseButtons = {
                LEFT:MOUSE.DOLLY,
                MIDDLE:MOUSE.PAN,
                RIGHT:MOUSE.ROTATE
            }
            this._container.style.cursor = MOUSESTYLE.ZOOM;
        }else if(modeName === 'PAN'){
            this.orbitControls.mouseButtons = {
                LEFT:MOUSE.PAN,
                MIDDLE:MOUSE.DOLLY,
                RIGHT:MOUSE.ROTATE
            }
            this._container.style.cursor = MOUSESTYLE.PAN;
        }else if(modeName === 'ROTATE'){
            this.orbitControls.mouseButtons = {
                LEFT:MOUSE.ROTATE,
                MIDDLE:MOUSE.PAN,
                RIGHT:-1
            }
            this._container.style.cursor = MOUSESTYLE.ROTATE;
        }
    }

    render() {
        requestAnimationFrame(() => this.render());
        this.gpuPanel.startQuery();
        this.renderer.clear();
        // main
        this.composer.render()
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
        const aspect = S * height / width
        Object.values(this.cameras).forEach(camera => {
            camera.top = aspect;
            camera.bottom = - aspect;
            camera.updateProjectionMatrix()
        });
    }

    listenerControl(){
        const pointer = new Vector2();
        this.renderer.domElement.addEventListener('click',(event)=>{
            pointer.x = ( event.clientX / this.width ) * 2 - 1;
			pointer.y = - ( event.clientY /this.height ) * 2 + 1;  
            raycaster.setFromCamera(pointer,this.mainCamera);
            raycastObjects.length = [];
            raycaster.intersectObjects(this.collector.pool,true,raycastObjects);
            this.selectChange(raycastObjects)
        })

    }

}

export { CAD }