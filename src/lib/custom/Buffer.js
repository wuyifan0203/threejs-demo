import { BufferAttribute } from "three";

class Float64BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
        super(new Float64Array(array), itemSize, normalized);
    }
}

export { Float64BufferAttribute }