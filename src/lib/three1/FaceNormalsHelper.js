/*
 * @Date: 2023-02-06 16:09:26
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-02-10 14:35:23
 * @FilePath: /threejs-demo/src/lib/three/FaceNormalsHelper.js
 */
/* eslint-disable constructor-super */
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineSegments,
  LineBasicMaterial,
  Vector3
} from './three.module.js';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const cb = new Vector3();
const ab = new Vector3();
const faceCenter = new Vector3();

class FaceNormalsHelper extends LineSegments {
  constructor(object, size = 1, color = 0x008000) {
    let nNormals = 0;

    const objGeometry = object.geometry;

    if (objGeometry && objGeometry.isGeometry) {
      console.error('THREE.FaceNormalsHelper no longer supports Geometry. Use BufferGeometry instead.');
      return;
    } else if (objGeometry && objGeometry.isBufferGeometry) {
      if(!objGeometry.attributes.normal){
        console.error('THREE.FaceNormalsHelper no longer supports BufferGeometry without normal in attributes.');
        return;
      }
      nNormals = objGeometry.attributes.normal.count;
    }

    //

    const geometry = new BufferGeometry();

    const positions = new Float32BufferAttribute(nNormals * 6,3);

    geometry.setAttribute('position', positions);

    super(geometry, new LineBasicMaterial({ color, toneMapped: false }));

    this.object = object;
    this.size = size;
    this.type = 'FaceNormalsHelper';

    this.matrixAutoUpdate = false;

    this.update();
  }

  update() {
    this.object.updateMatrixWorld(true);

    const position = this.geometry.attributes.position;

    const objGeometry = this.object.geometry;

    if (objGeometry && objGeometry.isGeometry) {
      console.error('THREE.VertexNormalsHelper no longer supports Geometry. Use BufferGeometry instead.');
      return;
    } else if (objGeometry && objGeometry.isBufferGeometry) {
      const objPos = objGeometry.attributes.position;

      const objIdx = objGeometry.index;
      if(objIdx){
        
        let idx = 0;
      
        for (let j = 0, jl = objIdx.count; j < jl; j=j+3) {
          const vA = objIdx.getX( j + 0 );
          const vB = objIdx.getX( j + 1 );
          const vC = objIdx.getX( j + 2 );
  
          _v1.fromBufferAttribute( objPos, vA );
          _v2.fromBufferAttribute( objPos, vB );
          _v3.fromBufferAttribute( objPos, vC );
  
          cb.subVectors( _v3, _v2 );
          ab.subVectors( _v1, _v2 );
          cb.cross( ab );
  
          faceCenter.set(
            (_v1.x + _v2.x + _v3.x )/ 3,
            (_v1.y + _v2.y + _v3.y )/ 3,
            (_v1.z + _v2.z + _v3.z )/ 3,
          )
    
  
          cb.normalize().multiplyScalar(this.size).add(faceCenter);
  
          position.setXYZ(idx, faceCenter.x, faceCenter.y, faceCenter.z);
  
          idx++;
          
          position.setXYZ(idx, cb.x, cb.y, cb.z);
          
          idx++;
  
        }
      }else{
        let idx = 0;
      
        for (let j = 0, jl = objPos.count; j < jl; j=j+3) {
          _v1.fromBufferAttribute( objPos, j );
          _v2.fromBufferAttribute( objPos, j+1 );
          _v3.fromBufferAttribute( objPos, j+2 );
  
          cb.subVectors( _v3, _v2 );
          ab.subVectors( _v1, _v2 );
          cb.cross( ab );
  
          faceCenter.set(
            (_v1.x + _v2.x + _v3.x )/ 3,
            (_v1.y + _v2.y + _v3.y )/ 3,
            (_v1.z + _v2.z + _v3.z )/ 3,
          )
    
  
          cb.normalize().multiplyScalar(this.size).add(faceCenter);
  
          position.setXYZ(idx, faceCenter.x, faceCenter.y, faceCenter.z);
  
          idx++;
          
          position.setXYZ(idx, cb.x, cb.y, cb.z);
          
          idx++;
  
        }
      }


    }

    position.needsUpdate = true;
  }
}

export { FaceNormalsHelper };
