/*
 * @Date: 2024-01-25 13:46:19
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-02 15:03:32
 * @FilePath: /threejs-demo/src/composer/BackgroundPass.js
 */

import { Pass, FullScreenQuad } from "..//lib/three/Pass.js";
import { ShaderMaterial, Vector4, Vector3 } from "three";

const vertexShader = /* glsl */ `
	void main() {
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
`;

const fragmentShader = /* glsl */ `
  uniform vec3 resolution;
  uniform vec4 colors[ARRAY_LENGTH];
  const int i = 0;

  vec3 linerInterpolation(float y){
    for(int i=1;i<ARRAY_LENGTH;i++){
      if(y<=colors[i].a){
        float t=colors[i].a-(colors[i - 1].a);
        float u=y-colors[i - 1].a;
        float v=u/t;
        return mix(colors[i-1].rgb,colors[i].rgb,v) / vec3(255.);
      }
    }
  }
    
  void main(){
    vec3 uv = gl_FragCoord.xyz / resolution.xyz;
    gl_FragColor = vec4(linerInterpolation(uv.y), 1.0);
  }
`;

class BackgroundPass extends Pass {
    constructor() {
        super();

        this.material = new ShaderMaterial({
            uniforms: {
                colors: { value: [new Vector4(0.0, 0.0, 0.0, 0.0), new Vector4(1, 1, 1, 1)] },
                resolution: { value: new Vector3() },
            },
            defines: {
                ARRAY_LENGTH: 0,
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

    render(renderer, _, readBuffer) {
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        if (this.clearDepth) {
            renderer.clearDepth();
        }

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(readBuffer);
            if (this.clear) {
                renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
            }
        }

        this.quad.render(renderer);


        renderer.autoClear = oldAutoClear;
    }

    setColors(colors) {
        if (colors.length < 2) {
            return console.log('colors length must be greater than 1');
        }
        this.material.uniforms['colors'].value = colors;
        this.material.defines['ARRAY_LENGTH'] = colors.length;
        this.material.needsUpdate = true;
    }

    setSize(width, height) {
        this.material.uniforms['resolution'].value.set(width, height, 1);
    }
}

export { BackgroundPass };