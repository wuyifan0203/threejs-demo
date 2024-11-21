import { BufferAttribute } from "./three.module.js";

class Float64BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Float64Array(array), itemSize, normalized);
    }
}

export { Float64BufferAttribute }