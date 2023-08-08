declare class UIElement {
    domElement: HTMLElement;
    constructor(dom: HTMLElement);
    add(...element: UIElement[]): void;
    remove(...element: UIElement[]): void;
    setStyle(style: Object): void;
    setTextContent(text: string): void;
    getTextContent(): string | null;
    setId(id: string): void;
    show(): void;
    hide(): void;
}
declare class UIDiv extends UIElement {
    constructor();
}
declare class UISpan extends UIElement {
    constructor();
}
declare class UIText extends UISpan {
    constructor();
}
declare class UIBreak extends UIElement {
    constructor();
}
export { UIDiv, UISpan, UIText, UIBreak, UIElement };
