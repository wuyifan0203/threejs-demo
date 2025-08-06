/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-06-23 16:13:21
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-06 11:42:18
 * @FilePath: \threejs-demo\src\lib\custom\OmnipotentLoader.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
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
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const loaderMap = {
    gltf: GLTFLoader,
    fbx: FBXLoader,
    image: TextureLoader,
    obj: OBJLoader,
    cube: CubeTextureLoader,
    audio: AudioLoader,
    hdr: RGBELoader,
    drc: DRACOLoader
}

const defaultManager = new LoadingManager();

class OmnipotentLoader extends Loader {
    constructor(manager = defaultManager) {
        super(manager);
        this.instances = {}
        this.libPath = {
            dracoDecoderPath: '',
            dracoEncoderPath: '',
        };
        this.workerLimit = 2;
    }

    /**
     * @description 设置加载器的路径
     * @param {{[key: string]: string}} path 路径对象
     * @return {void}
     * @example
     * loader.setLibPath({
     *     dracoDecoderPath: 'https://threejs.org/examples/js/libs/draco/',
     *     // 其他加载器的路径
     * })
     */
    setLibPath(path) {
        this.libPath = { ...this.libPath, ...path };
    }

    setWorkerLimit(limit) {
        this.workerLimit = limit;
        Object.values(this.instances).forEach(loader => {
            if (Object.hasOwn(loader, 'setWorkerLimit')) {
                loader.setWorkerLimit(limit);
            }
        });
    }


    load(urls, onLoad, onProgress, onError) {
        if (Array.isArray(urls)) {
            const loader = this.getLoaderInstance('cube');
            return loader.load(urls, onLoad, onProgress, onError);
        } else {
            const fileType = this.#getFileType(urls);
            if (fileType === 'unknown') {
                const errorMessage = 'Unknown file type: ' + urls;
                console.error(errorMessage);
                onError && onError(new Error(errorMessage));
                return;
            }
            const loader = this.getLoaderInstance(fileType);
            return loader.load(urls, onLoad, onProgress, onError);
        }
    }

    getLoaderInstance(fileType) {
        if (!this.instances[fileType]) {
            const loader = new loaderMap[fileType](this.manager);
            if (this.path !== '') {
                loader.setPath(this.path);
            }
            if (loader instanceof DRACOLoader) {
                loader.setDecoderPath(this.libPath.dracoDecoderPath);
                loader.setDecoderConfig({type: 'js'});
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
            'mp3': 'audio',
            'wav': 'audio',
            'hdr': 'hdr',
            'drc': 'drc'
        };
        return typeMap[ext] || 'unknown';
    }
}

export { OmnipotentLoader }