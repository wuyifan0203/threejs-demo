/*
 * @Date: 2024-01-25 13:46:19
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-25 19:24:39
 * @FilePath: /threejs-demo/src/composer/BackgroundPass.js
 */

import { Pass, FullScreenQuad } from "..//lib/three/Pass.js";
import { ShaderMaterial, Vector4 } from "../lib/three/three.module.js";
import { catchRenderTarget, printfImage } from "../lib/util/catch.js";

const vertexShader = /* glsl */ `
	void main() {
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
`;

const fragmentShader = /* glsl */ `
    uniform float rotation;
    uniform vec3 resolution;
    uniform vec4 colorPos[2];

    // mat2 rotation2d(float angle){
    // float s=sin(angle);
    // float c=cos(angle);

    // return mat2(
    //     c,-s,
    //     s,c
    // );
    // }

    // vec2 rotate(vec2 v,float angle){
    //     return rotation2d(angle)*v;
    // }

    // vec3 linearGradient(float positionY){
    //     for (int i = 0; i < colorPos.length(); i++) {
    //         if(positionY <= colorPos[i].y){
    //             return mix(colorPos[i],colorPos[i+1],positionY);
    //         }else{
    //             continue;
    //         }
    //     }
    // }
  
    void main(){
        vec2 uv=gl_FragCoord.xy/resolution.xy;

        vec3 gradientColor = mix(vec3(colorPos[0]), vec3(colorPos[1]), uv.y);
        // gl_FragColor = vec4(vec3(colorPos[0]), 1.0);    
        gl_FragColor = vec4(uv.x,uv.y,0.0, 1.0);
    }
`;

class BackgroundPass extends Pass {
    constructor(rotation = 0) {
        super();

        this.material = new ShaderMaterial({
            uniforms: {
                rotation: { value: rotation },
                colorPos: {
                    value: [
                        new Vector4(1, 0, 1, 0),
                        new Vector4(1, 1, 0, 1)
                    ]
                }
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
            vertexShader,
            fragmentShader
        })

        this.quad = new FullScreenQuad(this.material);
        this.clearDepth = false;
    }

    render(renderer, writeBuffer) {
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        if (this.clearDepth) {
            renderer.clearDepth();
        }

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) {
                renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
            }
        }

        this.quad.render(renderer);


        renderer.autoClear = oldAutoClear;
    }
}

export { BackgroundPass };