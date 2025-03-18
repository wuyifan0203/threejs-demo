import {
    CubeTextureLoader,
    Loader,
    LoadingManager,
    TextureLoader,
    AudioLoader
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loaderMap = {
    gltf: GLTFLoader,
    fbx: FBXLoader,
    image: TextureLoader,
    obj: OBJLoader,
    cube: CubeTextureLoader,
    audio: AudioLoader,
}

const defaultManager = new LoadingManager();

class OmnipotentLoader extends Loader {
    constructor(manager = defaultManager) {
        super(manager);
        this.instances = {}
    }

    load(urls, onLoad, onProgress, onError) {
        if (Array.isArray(urls)) {
            const loader = this.#getLoaderInstance('cube');
            return loader.load(urls, onLoad, onProgress, onError);
        } else {
            const fileType = this.#getFileType(urls);
            if (fileType === 'unknown') {
                const errorMessage = 'Unknown file type: ' + urls;
                console.error(errorMessage);
                onError && onError(new Error(errorMessage));
                return;
            }
            const loader = this.#getLoaderInstance(fileType);
            return loader.load(urls, onLoad, onProgress, onError);
        }
    }

    #getLoaderInstance(fileType) {
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
        if (Array.isArray(url)) {
            console.error('loadAsync cant`t support array');
            return;
        }
        const scope = this;
        return new Promise((resolve, reject) => {
            scope.load(url, resolve, onProgress, (error) => {
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
            'jpg': 'image',
            'jpeg': 'image',
            'webp': 'image',
            'mp3': 'audio'
        };
        return typeMap[ext] || 'unknown';
    }
}

export { OmnipotentLoader }