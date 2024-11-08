import { Loader, LoadingManager, TextureLoader } from '../three/three.module.js';
import { GLTFLoader } from '../three/GLTFLoader.js';
import { FBXLoader } from '../three/FBXLoader.js';
import { OBJLoader } from '../three/OBJLoader.js'

const loaderMap = {
    gltf: GLTFLoader,
    fbx: FBXLoader,
    image: TextureLoader,
    obj: OBJLoader
}

const defaultManager = new LoadingManager();

class OmnipotentLoader extends Loader {
    constructor(manager = defaultManager) {
        super(manager);
        this.instances = {}
    }

    load(url, onLoad, onProgress, onError) {
        const fileType = this.#getFileType(url);
        if (fileType === 'unknown') {
            const errorMessage = 'Unknown file type: ' + url;
            console.error(errorMessage);
            onError && onError(new Error(errorMessage));
            return;
        }
        const loader = this.#getLoaderInstance(fileType);
        return loader.load(url, onLoad, onProgress, onError);
    }

    #getLoaderInstance(fileType){
        if (!this.instances[fileType]) {
            const loader = new loaderMap[fileType](this.manager);
            if (this.path !== '') {
                loader.setPath(this.path);
            }
            this.instances[fileType] = loader;
        }
        return this.instances[fileType];
    }

    loadAsync(url, onProgress) {
        const scope = this;
        return new Promise((resolve, reject) => {
            scope.load(url, resolve, onProgress, (error)=>{
                console.error('Failed to load resource:', error);
                reject(error);
            });
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
        const typeMap = {
            'glb': 'gltf',
            'gltf': 'gltf',
            'fbx': 'fbx',
            'obj': 'obj',
            'png': 'image',
            'jpg': 'image'
        };
        return typeMap[ext] || 'unknown';
    }
}

export { OmnipotentLoader }