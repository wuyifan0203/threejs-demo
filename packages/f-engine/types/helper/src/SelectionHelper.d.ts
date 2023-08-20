import { Mesh } from "three";
declare class SelectionHelper {
    private selectedMaterial;
    private selectMesh;
    constructor(color?: string);
    setFromObjects(objects: Array<Mesh>): void;
}
export { SelectionHelper };
