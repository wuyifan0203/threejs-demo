/*
 * @Date: 2023-08-19 16:03:47
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-19 16:04:31
 * @FilePath: /threejs-demo/examples/src/lib/three/TexturePass.js
 */
import {
	ShaderMaterial,
	UniformsUtils
} from './three.module.js';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from './CopyShader.js';

class TexturePass extends Pass {

	constructor( map, opacity ) {

		super();

		const shader = CopyShader;

		this.map = map;
		this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			depthTest: false,
			depthWrite: false,
			premultipliedAlpha: true

		} );

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad( null );

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.fsQuad.material = this.material;

		this.uniforms[ 'opacity' ].value = this.opacity;
		this.uniforms[ 'tDiffuse' ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;

	}

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

export { TexturePass };
