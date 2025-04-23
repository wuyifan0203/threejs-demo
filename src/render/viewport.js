import {
    ShaderMaterial,
    Uniform,
    Vector2,
    Vector4,
} from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import {
    initRenderer,
    initOrthographicCamera,
    initGUI,
    resize
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    renderer.setClearColor(0xffffff);

    const screen = new FullScreenQuad(
        new ShaderMaterial({
            uniforms: {
                uTime: new Uniform(0),
                uResolution: new Uniform(new Vector2())
            },
            vertexShader: /*glsl*/`
                void main(){
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: /*glsl*/`
                uniform float uTime;
                uniform vec2 uResolution;
                void main(){
                    vec2 uv = gl_FragCoord.xy / uResolution;
                    vec2 st = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
                    float a = atan(st.y, st.x);
                    float d = length(st);
                    float c = cos(a * 10.0 - uTime * 2.0);
                    float n = sin(uTime + d * 10.0 + a * 2.0);
                    vec3 color = vec3(0.0);
                    color = vec3(c, n, sin(uTime * 0.1));
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        })
    );

    const renderSize = new Vector2(window.innerWidth, window.innerHeight);
    const viewport = new Vector4(0, 0, renderSize.x, renderSize.y);
    const scissor = new Vector4(0, 0, renderSize.x, renderSize.y);


    function render() {
        screen.material.uniforms.uTime.value = performance.now() / 1000;
        screen.material.uniforms.uResolution.value.copy(renderSize);
        screen.render(renderer);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera, (x, y) => {
        renderSize.set(x, y);
    });

    const controls = {
        enableScissor : false,
    }
    const gui = initGUI();
    const vf = gui.addFolder('viewport');
    vf.add(viewport, 'x', 0, renderSize.x).onChange(() => {
        renderer.setViewport(viewport);
    });
    vf.add(viewport, 'y', 0, renderSize.y).onChange(() => {
        renderer.setViewport(viewport);
    });
    vf.add(viewport, 'z', 0, renderSize.x).onChange(() => {
        renderer.setViewport(viewport);
    }).name('width');
    vf.add(viewport, 'w', 0, renderSize.y).onChange(() => {
        renderer.setViewport(viewport);
    }).name('height');
    const sf = gui.addFolder('scissor');
    sf.add(controls,'enableScissor').onChange((v) => {
        renderer.setScissorTest(v);
    });
    sf.add(scissor, 'x', 0, renderSize.x).onChange(() => {
        renderer.setScissor(scissor);
    });
    sf.add(scissor, 'y', 0, renderSize.y).onChange(() => {
        renderer.setScissor(scissor);
    });
    sf.add(scissor, 'z', 0, renderSize.x).onChange(() => {
        renderer.setScissor(scissor);
    }).name('width');
    sf.add(scissor, 'w', 0, renderSize.y).onChange(() => {
        renderer.setScissor(scissor);
    }).name('height');
    const rf = gui.addFolder('renderSIze');
    rf.add(renderSize, 'x', 0, window.innerWidth).onChange(() => {
        renderer.setSize(renderSize.x, renderSize.y);
    });
    rf.add(renderSize, 'y', 0, window.innerHeight).onChange(() => {
        renderer.setSize(renderSize.x, renderSize.y);
    });
}