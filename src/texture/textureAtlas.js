import {
    InstancedBufferGeometry,
    PlaneGeometry,
    MathUtils,
    InstancedBufferAttribute,
    ShaderMaterial,
    Uniform,
    Quaternion,
    Vector2,
    Mesh,
    CanvasTexture,
    SRGBColorSpace,
} from 'three';
import {
    initRenderer,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    initPerspectiveCamera,
    initAmbientLight,
    initDirectionLight,
    getRainbowColor
} from '../lib/tools/index.js';

const { randFloatSpread } = MathUtils;

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera();

    const scene = initScene();
    initAxesHelper(scene);
    initAmbientLight(scene);

    const light = initDirectionLight();
    light.position.set(0, 0, 10);
    scene.add(light);

    renderer.setClearColor(0xface8d);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const geometry = new InstancedBufferGeometry().copy(new PlaneGeometry(2, 1));
    geometry.instanceCount = Infinity;

    const amount = 2048;
    const initPosition = new Float32Array(amount * 3);
    for (let j = 0, k = 0; j < amount; j++, k = j * 3) {
        initPosition[k + 0] = Math.round(randFloatSpread(50));
        initPosition[k + 1] = Math.round(randFloatSpread(50));
        initPosition[k + 2] = Math.round(randFloatSpread(50));
    }

    geometry.setAttribute('initPosition', new InstancedBufferAttribute(initPosition, 3));

    const texture = createMarkerTexture(4096, 32, 64);

    const material = new ShaderMaterial({
        uniforms: {
            quaternion: new Uniform(new Quaternion()),
            map: new Uniform(texture),
            textureDimensions: new Uniform(new Vector2(32, 64)),
        },
        vertexShader:/*glsl*/`
            uniform vec4 quaternion;
            uniform vec2 textureDimensions;

            attribute vec3 initPosition;
            varying vec2 vUv;

            vec3 applyQuaternion(vec3 v, vec4 q) {
                return v + 2.0 * cross(cross(v, q.xyz) + q.w*v, q.xyz);
            }

            void main() {
                vec3 pos = applyQuaternion(position,quaternion) + initPosition;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                float iID = float(gl_InstanceID);
                vec2 step = vec2(1.0 / textureDimensions.x, 1.0 / textureDimensions.y);

                // 纹理快的行号和列号
                float col = mod(iID, textureDimensions.x);
                float row = floor(iID / textureDimensions.x);
           
                // 纹理快的 UV 坐标
                vUv = (vec2(col,row) + uv) * step;
            }
        `,
        fragmentShader:/*glsl*/`
            uniform sampler2D map;
            varying vec2 vUv;

            void main() {
                gl_FragColor = vec4(texture2D(map, vUv).rgb, 1.);
            }
        `
    });

    const mesh = new Mesh(geometry, material);
    mesh.onBeforeRender = function () {
        material.uniforms.quaternion.value.copy(camera.quaternion).invert();
        material.needsUpdate = true;
    }
    scene.add(mesh);

    // scene.background = texture;

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);

    function createMarkerTexture(size, amountX, amountY) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const step = new Vector2(canvas.width / 32, canvas.height / 64);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.font = "bold 40px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = '#000';

        let [x, y] = [0, 0];

        for (let j = 0, t = 0; j < amountY; j++) {
            for (let k = 0; k < amountX; k++, t++) {
                x = (k + 0.5) * step.x;
                y = (amountY - j - 0.5) * step.y;
                ctx.fillText(t, x, y);

                ctx.strokeStyle = getRainbowColor(t);
                ctx.lineWidth = 5;
                ctx.strokeRect(x - step.x / 2 + 4, y - step.y / 2 + 4, step.x - 8, step.y - 8);
            }
        }

        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        return texture;
    }
}

