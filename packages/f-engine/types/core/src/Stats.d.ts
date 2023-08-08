import { Editor } from './Editor';
declare class Stats {
    domElement: HTMLElement;
    private dom;
    constructor(editor: Editor);
    show(): void;
    hide(): void;
}
export { Stats };
