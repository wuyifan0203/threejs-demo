import { BufferGeometry } from "three";

class Shape {
    constructor(parameters) {
        this.parameters = parameters;
        this.object = null
    }

    static convertBufferGeometry(occShape) {
        const geometry = new BufferGeometry();
    }
}