/*
 * @Date: 2023-09-25 19:38:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-09 20:53:23
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/Factory.ts
 */

import {
    BoxGeometry,
    BufferGeometry,
    CylinderGeometry,
    type Material,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    MeshBasicMaterialParameters,
    MeshPhongMaterialParameters,
    MeshPhongMaterial,
    Light,
    AmbientLight,
    DirectionalLight,
    PointLight,
    SpotLight,
    PerspectiveCamera,
    OrthographicCamera,
    Camera
} from 'three';

import { Cube, Cylinder, Sphere } from '@/modules/structures';


type GeometryOptionsType = {}
class Meshes {
    static MeshMap = {
        cube: Cube,
        sphere: Sphere,
        cylinder:Cylinder
    }
    public static createMesh(type): Mesh {
        const mesh = new Meshes.MeshMap[type]()
        return mesh;
    }

    public static updateGeometry(mesh: Mesh, geometryOptions: GeometryOptionsType): void {
        const geometry = Geometries.createGeometry(geometryOptions);
        mesh.geometry.dispose();
        mesh.geometry = geometry;
        mesh.userData.geometryOptions = geometryOptions;
    }

    public static updateMaterial(mesh: Mesh, materialOptions: MaterialOptionsType): void {
        const material = Materials.createMaterial(materialOptions);
        // mesh.material.dispose();
        mesh.material = material;
        mesh.userData.materialOptions = materialOptions;
    }
}

class Geometries {
    public static createGeometry(options: any): BufferGeometry {
        switch (options.userType) {
            case 'cube':
                return new BoxGeometry(options.width, options.height, options.depth, options.widthSegments, options.heightSegments, options.depthSegments);
            case 'sphere':
                return new SphereGeometry(options.radius, options.widthSegments, options.heightSegments.options.phiStart, options.phiLength, options.thetaStart, options.thetaLength);
            case 'cylinder':
                return new CylinderGeometry(options.radiusTop, options.radiusBottom, options.height, options.radialSegments, options.heightSegments, options.openEnded, options.thetaStart, options.thetaLength);
            default:
                return new BufferGeometry();
        }
    }
}

type MaterialOptionsType = {
    userType: 'MeshBasic',
} & MeshBasicMaterialParameters | {
    userType: 'MeshPhong',
} & MeshPhongMaterialParameters;
class Materials {
    public static createMaterial(options: MaterialOptionsType | MaterialOptionsType[]): Material | Material[] {
        if (Array.isArray(options)) {
            return options.map(option => {
                return Materials.createMaterial(option) as Material;
            })
        } else {
            switch (options.userType) {
                case 'MeshBasic':
                    return new MeshBasicMaterial(options);
                case 'MeshPhong':
                    return new MeshPhongMaterial(options);
                default:
                    return new MeshBasicMaterial();
            }
        }
    }

}

class Lights {
    static LightMap = {
        ambient: AmbientLight,
        directional: DirectionalLight,
        point: PointLight,
        spot: SpotLight,
    }
    public static createLight(type): Light {
        const light:Light = new Lights.LightMap[type]();
        if(!(light as AmbientLight)?.isAmbientLight){
            light.position.set(10, 10, 10);
        }
        return light;
    }
}

class Cameras {
    static CameraMap = {
        perspective: PerspectiveCamera,
        orthographic: OrthographicCamera,
    }
    public static createCamera(type): Camera {
        return new Cameras.CameraMap[type]();
    }
}

export { Meshes, Materials, Geometries, Lights, Cameras } 