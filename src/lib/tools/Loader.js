import { Loader, TextureLoader } from '../three/three.module.js';
import { GLTFLoader } from '../three/GLTFLoader.js';
import { FBXLoader } from '../three/FBXLoader.js';
import { OBJLoader } from '../three/OBJLoader.js'

const loaderMap = {
    gltf: GLTFLoader,
    fbx: FBXLoader,
    image: TextureLoader,
    obj: OBJLoader
}

class OmnipotentLoader extends Loader {
    constructor(manager) {
        super(manager);
        this.instances = {}
    }

    load(url, onLoad, onProgress, onError) {
        const fileType = this.#getFileType(url);
        if(fileType === 'unknown'){
            onError && onError();
            return console.error('unknown file type');
        }
        const loader = this.instances[fileType] !== undefined ? this.instances[fileType] : new loaderMap[fileType](this.manager);
        this.path !== '' && loader.setPath(this.path);
        return loader.load(url, onLoad, onProgress, onError);
    }

    loadAsync(url, onProgress) {
        const scope = this;
        return new Promise((resolve, reject) => {
            scope.load(url, resolve, onProgress, reject);
        });
    }

    parse(/*any*/) {
        console.warn('OmnipotentLoader can`t parse');
        return this;
    }

    setPath(path) {
        Object.values(this.instances).forEach(loader => {
            loader.setPath(path);
        });
        return super.setPath(path);
    }

    #getFileType(url) {
        const ext = url.split('.').pop().toLowerCase();
        switch (ext) {
            case 'glb':
            case 'gltf':
                return 'gltf';
            case 'fbx':
                return 'fbx';
            case 'obj':
                return 'obj';
            case 'png':
            case 'jpg':
                return 'image';
            default:
                console.warn('unknown ext: ' + ext);
                return 'unknown';
        }
    }
}

export { OmnipotentLoader }