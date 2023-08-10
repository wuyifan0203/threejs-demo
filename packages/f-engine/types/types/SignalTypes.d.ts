import type { Signal } from "signals";
type SignalTypes<T> = {
    [k in keyof T]: Signal;
};
interface SignalsMap {
    'objectsSelected': Signal;
    'intersectionsDetected': Signal;
    'objectsAdded': Signal;
    'sceneGraphChanged': Signal;
    'sceneRendered': Signal;
    "transformModeChange": Signal;
    "objectsRemoved": Signal;
}
export { SignalTypes, SignalsMap };
