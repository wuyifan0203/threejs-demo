import { OrthographicCamera, PerspectiveCamera } from "three";
import { GPUStatsPanel } from 'three/examples/jsm/utils/GPUStatsPanel';
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";

class MainViewPort extends ViewPort{
    constructor(editor:Editor,camera:PerspectiveCamera | OrthographicCamera,domElement:HTMLElement){
        super(editor,camera,domElement);
        this.type = 'MainViewPort';

        const statePanel = new StatsPanel();
        const gpuPanel = new GPUStatsPanel(this.renderer.getContext());
        statePanel.addPanel(gpuPanel);
        statePanel.showPanel(0);
        statePanel.dom.style.position = 'absolute';
        domElement.append(statePanel.dom);



    }
}

export { MainViewPort }