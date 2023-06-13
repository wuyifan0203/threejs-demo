import {Editor} from '../build/cad.esm.js'
import {GridHelper} from 'three'

window.onload = ()=>{
    init()
}

function init() {
    const dom = document.getElementById('cad');
    const {width,height} = dom.getBoundingClientRect()
    const editor = new Editor(dom);
    editor.setSize(width,height);
    const gridHelper = new GridHelper(50,50);
    gridHelper.isHelper = true;
    editor.addObject(gridHelper);
    editor.player.play();


    window.editor = editor
}