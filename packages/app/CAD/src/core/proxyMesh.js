import { Mesh } from "../lib/three.module"
import {instance} from './CAD'

function createMesh(geometry, material) {
    const mesh = new Mesh(geometry, material);
    return new Proxy(mesh, {
        get(target, key) {
            return Reflect.get(target, key);
        },
        set(target, key, newValue) {
            if (key === 'geometry') {
                console.log('geometry has Change');
            } else if (key === 'material') {
                instance.collector.updateMaterial(material,target.id);
                console.log('material has change');
            }
            const res = Reflect.set(target, key, newValue);
            return res;
        }
    })
}

export {createMesh}