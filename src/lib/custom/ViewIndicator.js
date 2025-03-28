/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 13:41:04
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-28 17:48:24
 * @FilePath: \threejs-demo\src\lib\custom\ViewIndicator.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    BufferGeometry,
    Vector3,
    BufferAttribute,
    CircleGeometry,
    Mesh,
    Object3D,
    MeshBasicMaterial,
    Group,
    ArrowHelper,
    Matrix4,
    Sprite,
    SpriteMaterial,
    CanvasTexture,
    Vector2,
    Vector4,
    OrthographicCamera,
    Raycaster,
    Quaternion,
    ShaderMaterial,
    Color,
    UniformsUtils,
} from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import {
    equal,
    HALF_PI,
    PI,
    TWO_PI,
    ZERO3,
} from "../tools/index.js";

const _v = /*PURE */ new Vector3();
const _matrix = /*PURE */ new Matrix4();
const targetQuaternion = /*PURE */ new Quaternion();
const currentQuaternion = /*PURE */ new Quaternion();

const _orthoCamera = new OrthographicCamera(- 2, 2, 2, - 2, 0, 6);
_orthoCamera.updateProjectionMatrix();
_orthoCamera.position.set(0, 0, 3);

const materialOption = {
    uniforms: {
        uColor: { value: new Color('#ffffff') },
        uOpacity: { value: 0.5 },
    },
    vertexShader:/*glsl*/ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: /*glsl*/`
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;

        const float Radius = 1.0;
        
        void main() {
            // 将UV坐标从[0,1]映射到[-1,1]
            vec2 uv = vUv * 2.0 - 1.0;
            // 使用smoothstep创建平滑边缘
            float circle = 1.0 - smoothstep(Radius - 0.01, Radius, length(uv));
            // 输出最终颜色
            gl_FragColor = vec4(uColor, uOpacity * circle);
        }
    `,
    transparent: true,
};

let _radius = 0;
const _viewport = new Vector4();
const _raycaster = new Raycaster();
const _mouse = new Vector2();

const directionMap = {
    0: new Vector3(1, 0, 0), // left
    1: new Vector3(-1, 0, 0), // right
    2: new Vector3(0, -1, 0), // back
    3: new Vector3(0, 1, 0), // front
    4: new Vector3(0, 0, -1), // top
    5: new Vector3(0, 0, 1), // bottom
    6: new Vector3(-1, -1, -1), // top-back-right
    7: new Vector3(1, -1, -1), // top-back-left
    8: new Vector3(-1, 1, -1), // top-front-right
    9: new Vector3(1, 1, -1), // top-front-left
    10: new Vector3(-1, -1, 1), // bottom-back-right
    11: new Vector3(1, -1, 1), // bottom-back-left
    12: new Vector3(-1, 1, 1), // bottom-front-right
    13: new Vector3(1, 1, 1), // bottom-front-left
    14: new Vector3(-1, -1, 0), // back-right
    15: new Vector3(-1, 1, 0), // front-right
    16: new Vector3(1, -1, 0), // back-left
    17: new Vector3(1, 1, 0), // front-left
    18: new Vector3(-1, 0, -1), // top-right
    19: new Vector3(-1, 0, 1), // bottom-right
    20: new Vector3(1, 0, -1), // top-left
    21: new Vector3(1, 0, 1), // bottom-left
    22: new Vector3(0, -1, -1), // top-back
    23: new Vector3(0, -1, 1), // bottom-back
    24: new Vector3(0, 1, -1), // front-top
    25: new Vector3(0, 1, 1), // front-bottom
}

const upMap = [5, 5, 5, 5, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

/** [rotAxis rotValue][] */
const FACE_ROTATION = [
    1, -HALF_PI, 2, -HALF_PI,
    1, HALF_PI, 0, HALF_PI,
    2, PI, 0, -HALF_PI,
    0, 0, 0, HALF_PI,
    0, 0, 0, 0,
    1, -PI, 0, 0
];

const COORD = ['x', 'y', 'z'];
const connerFactor = 0.866; // Math.sqrt(3)/2
const edgeFactor = Math.SQRT2;

// params
const defaultParams = {
    face: {
        content: ['LEFT', 'RIGHT', 'BACK', 'FRONT', 'TOP', 'BOTTOM'],
        fontsSize: 28,
        range: 2,
        size: 1.3,
        radius: 0.4,
        smoothness: 4,
    },
    conner: {
        radius: 0.36,
        offset: 0.75,
        segments: 12,
    },
    edge: {
        width: 1.0,
        height: 0.36,
        offset: 0.85,
        radius: 0.144,
        smoothness: 3,
    },
    axis: {
        fontsSize: 48,
        length: 2.4,
    },
    color: {
        background: '#ffffff',
        backgroundOpacity: 0.5,
        hover: '#000055',
        faceContent: '#000000',
        axis: ['#ff4466', '#88ff44', '#4488ff',],
        faceOpacity: 1,
        face: '#ffffff',
    },
}

class ViewIndicator extends Object3D {
    constructor(camera, domElement, params = {}) {
        super();

        this.camera = camera;
        this.domElement = domElement;

        // 相机观察的中心点
        this.center = new Vector3();
        // 动画速度
        this.animateSpeed = TWO_PI;
        // 判断是否在运动
        this.animating = false;
        // 渲染的偏移量
        this.renderOffset = new Vector2(1, 1);
        // 渲染的大小
        this.renderSize = 128;

        this.isHover = false;

        const face = this.face = Object.assign({}, defaultParams.face, params.face || {});
        const color = this.color = Object.assign({}, defaultParams.color, params.color || {});
        const axis = this.axis = Object.assign({}, defaultParams.axis, params.axis || {});
        const conner = this.conner = Object.assign({}, defaultParams.conner, params.conner || {});
        const edge = this.edge = Object.assign({}, defaultParams.edge, params.edge || {});;

        const halfSize = face.range * 0.5;

        materialOption.uniforms = UniformsUtils.merge([
            { uColor: { value: new Color(color.background) } },
            { uOpacity: { value: color.backgroundOpacity } },
        ]);
        this.background = new FullScreenQuad(new ShaderMaterial(materialOption));

        // 指示器
        this.indicator = new Group();

        // FACE
        const faceGeometry = RectangleRounded(face.size, face.size, face.radius, face.smoothness);
        const faceMaterials = createFaceMaterials(face, color);

        for (let f = 0; f < 6; f++) {
            const [rotAxis1, rotValue1, rotAxis2, rotValue2] = FACE_ROTATION.slice(f * 4, (f + 1) * 4);

            const mesh = new Mesh(faceGeometry, faceMaterials[f]);
            mesh.userData.index = f;
            mesh.rotation[COORD[rotAxis1]] = rotValue1;
            mesh.rotation[COORD[rotAxis2]] = rotValue2;
            mesh.position.copy(directionMap[f]).multiplyScalar(halfSize).negate();;

            this.indicator.add(mesh);
        }

        // Conner 

        const connerGeometry = new CircleGeometry(conner.radius, conner.segments);

        for (let j = 0; j < 8; j++) {
            const mesh = new Mesh(connerGeometry, new MeshBasicMaterial({ color: color.face, transparent: true, opacity: color.faceOpacity }));
            mesh.userData.index = 6 + j;
            _v.copy(directionMap[6 + j]).normalize().negate();
            mesh.position.copy(_v).multiplyScalar(halfSize * connerFactor * conner.offset * 2);
            mesh.lookAt(_v.add(mesh.position));

            this.indicator.add(mesh);
        }

        // Edge
        const edgeGeometry = RectangleRounded(edge.width, edge.height, edge.radius, edge.smoothness);
        const edgeGeometries = [
            edgeGeometry,
            edgeGeometry.clone().rotateZ(HALF_PI),
            edgeGeometry,
        ]
        for (let j = 0; j < 12; j++) {
            const mesh = new Mesh(edgeGeometries[Math.ceil((j + 1) / 4) - 1], new MeshBasicMaterial({ color: color.face, transparent: true, opacity: color.faceOpacity }));
            mesh.userData.index = 14 + j;
            _v.copy(directionMap[j + 14]).normalize().negate();
            mesh.position.copy(_v).multiplyScalar(halfSize * edgeFactor * edge.offset);
            _matrix.lookAt(mesh.position, ZERO3, mesh.up);
            mesh.quaternion.setFromRotationMatrix(_matrix);

            this.indicator.add(mesh);
        }

        this.coordinate = new Group();
        this.sprites = new Group();

        const spriteMaterials = createSpriteMaterials(color.axis, axis.fontsSize);

        const startPos = new Vector3(-halfSize, -halfSize, -halfSize);

        [0, 3, 5].forEach((index, i) => {
            _v.copy(directionMap[index])
            const arrow = new ArrowHelper(_v, startPos, axis.length, color.axis[i], 0.5, 0.2);
            this.coordinate.add(arrow);

            const sprite = new Sprite(spriteMaterials[i]);
            sprite.position.copy(_v).multiplyScalar(axis.length + 0.1).add(arrow.position);
            this.sprites.add(sprite);
        });

        this.add(this.indicator);
        this.add(this.coordinate);
        this.add(this.sprites);
    }

    render(renderer) {
        this.quaternion.copy(this.camera.quaternion).invert();
        this.updateMatrixWorld();

        currentQuaternion.copy(this.camera.quaternion);

        _v.x = (this.domElement.offsetWidth - this.renderSize) * this.renderOffset.x;
        _v.y = (this.domElement.offsetHeight - this.renderSize) * (1 - this.renderOffset.y);


        renderer.getViewport(_viewport);
        renderer.setViewport(_v.x, _v.y, this.renderSize, this.renderSize);
        renderer.clearDepth();

        if (this.isHover) {
            this.background.render(renderer);
            renderer.clearDepth();
        }

        renderer.render(this, _orthoCamera);

        renderer.setViewport(_viewport.x, _viewport.y, _viewport.z, _viewport.w);
    }

    handleClick(event) {
        if (this.animating) return;
        this.indicator.children.forEach((child) => {
            child.material.color.set(this.color.face);
        });
        if (!this.containCursor(event)) return;

        _raycaster.setFromCamera(_mouse, _orthoCamera);
        const intersects = _raycaster.intersectObjects(this.indicator.children);
        if (intersects.length) {
            const object = intersects[0].object;
            object.material.color.set(this.color.hover);
            this._prepareAnimate(object);
            this.animating = true;
        } else {
            this.animating = false;
        }
    }

    handleMove(event) {
        this.indicator.children.forEach((child) => {
            child.material.color.set(this.color.face);
        });
        this.isHover = false;
        if (!this.containCursor(event)) return;
        this.isHover = true;

        _raycaster.setFromCamera(_mouse, _orthoCamera);
        const intersects = _raycaster.intersectObjects(this.indicator.children);
        if (intersects.length) {
            const object = intersects[0].object;
            object.material.color.set(this.color.hover);
        }
    }

    containCursor({ clientX, clientY }) {
        const { renderSize, renderOffset } = this;
        const { offsetHeight, offsetWidth } = this.domElement;

        const left = (offsetWidth - renderSize) * renderOffset.x;
        const top = (offsetHeight - renderSize) * renderOffset.y;
        const right = left + renderSize;
        const bottom = top + renderSize;

        const result = left <= clientX && clientX <= right && top <= clientY && clientY <= bottom;
        if (result) {
            _mouse.x = (clientX - left) / renderSize * 2 - 1;
            _mouse.y = - (clientY - top) / renderSize * 2 + 1;
        }

        return result;
    }

    _prepareAnimate(object) {
        _radius = this.camera.position.distanceTo(this.center);

        const index = object.userData.index;
        _v.copy(directionMap[upMap[index]]);
        targetQuaternion.setFromRotationMatrix(_matrix.lookAt(ZERO3, directionMap[index], _v));
        this.camera.up.copy(_v);
    }

    update(deltaTime) {
        currentQuaternion.rotateTowards(targetQuaternion, deltaTime * this.animateSpeed);
        this.camera.quaternion.copy(currentQuaternion);
        this.camera.position.set(0, 0, 1).applyQuaternion(currentQuaternion).multiplyScalar(_radius).add(this.center);

        this.animating = !equal(currentQuaternion.angleTo(targetQuaternion), 0);
    }

    dispose() {
        this.sprites.children.forEach((sprite) => {
            sprite.material.dispose();
            sprite.material.map.dispose();
            sprite.removeFromParent();
        });

        this.coordinate.children.forEach((arrow) => {
            arrow.removeFromParent();
            arrow.dispose();
        });

        this.indicator.children.forEach((object) => {
            object.geometry.dispose();
            object.material.dispose();
            object.material.map && object.material.map.dispose();
            object.removeFromParent();
        });

        this.coordinate.removeFromParent();
        this.indicator.removeFromParent();
        this.sprites.removeFromParent();
    }
}

function RectangleRounded(w, h, r, s) { // width, height, radius corner, smoothness
    s = Math.max(Math.floor(s), 1);
    // helper const's
    const wi = w / 2 - r;		// inner width
    const hi = h / 2 - r;		// inner height
    const ul = r / w;			// u left
    const ur = (w - r) / w;	// u right
    const vl = r / h;			// v low
    const vh = (h - r) / h;	// v high	

    const positions = [wi, hi, 0, -wi, hi, 0, -wi, -hi, 0, wi, -hi, 0];

    const uvs = [ur, vh, ul, vh, ul, vl, ur, vl];

    const n = [
        3 * (s + 1) + 3, 3 * (s + 1) + 4, s + 4, s + 5,
        2 * (s + 1) + 4, 2, 1, 2 * (s + 1) + 3,
        3, 4 * (s + 1) + 3, 4, 0
    ];

    const indices = [
        n[0], n[1], n[2], n[0], n[2], n[3],
        n[4], n[5], n[6], n[4], n[6], n[7],
        n[8], n[9], n[10], n[8], n[10], n[11]
    ];

    let phi, cos, sin, xc, yc, uc, vc, idx;

    for (let i = 0; i < 4; i++) {

        xc = i < 1 || i > 2 ? wi : -wi;
        yc = i < 2 ? hi : -hi;

        uc = i < 1 || i > 2 ? ur : ul;
        vc = i < 2 ? vh : vl;

        for (let j = 0, k = 0; j <= s; j++, k = j / s) {

            phi = HALF_PI * (i + k);
            cos = Math.cos(phi);
            sin = Math.sin(phi);

            positions.push(xc + r * cos, yc + r * sin, 0);
            uvs.push(uc + ul * cos, vc + vl * sin);

            if (j < s) {
                idx = (s + 1) * i + j + 4;
                indices.push(i, idx, idx + 1);
            }
        }
    }

    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeVertexNormals();

    return geometry;
}


function createFaceMaterials({ content, fontsSize }, { faceContent, face, faceOpacity }) {
    const dpi = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    const resolution = 128;
    canvas.width = resolution * dpi * 6;
    canvas.height = resolution * dpi;

    const context = canvas.getContext('2d');
    context.fillStyle = face;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `bold ${fontsSize * dpi}px Arial`;
    context.fillStyle = faceContent;
    context.textBaseline = "middle";

    content.forEach((text, i) => {
        const textWidth = context.measureText(text).width / dpi;
        context.fillText(content[i], resolution * i + (resolution - textWidth) / 2 * dpi, resolution / 2 * dpi);
    });

    const pice = 1 / (6 * dpi);

    return content.map((_, i) => {
        const texture = new CanvasTexture(canvas);
        texture.repeat.set(pice, 1);
        texture.offset.set(i * pice, 0);

        return new MeshBasicMaterial({
            color: face,
            map: texture,
            transparent: true,
            opacity: faceOpacity,
            side: faceOpacity < 1 ? 2 : 0
        });
    })
}

function createSpriteMaterials(color, fontSize) {
    const dpi = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = 64 * dpi * 3;
    canvas.height = 64 * dpi;
    const context = canvas.getContext('2d');
    context.font = `${fontSize * dpi}px Arial bold`;
    COORD.forEach((_, i) => {
        context.fillStyle = color[i];
        context.fillText(COORD[i], (64 * i + 20) * dpi, 45 * dpi);
    });

    const pice = 1 / (3 * dpi);

    return COORD.map((key, i) => {
        const texture = new CanvasTexture(canvas);
        texture.repeat.set(pice, 1);
        texture.offset.set(i * pice, 0);

        const material = new SpriteMaterial({
            map: texture,
            transparent: true,
        })
        material.name = key;
        return material;
    })
}

export { ViewIndicator };