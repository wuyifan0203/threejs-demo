import { Editor } from './Editor';
declare class Selector {
    private editor;
    constructor(editor: Editor);
    select(selectIds: string[]): void;
    detach(): void;
}
export { Selector };
