/*
 * @Date: 2023-06-29 15:12:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-03 00:55:13
 * @FilePath: /threejs-demo/packages/f-engine/src/utils/ui.ts
 */
function createElement(type:string):HTMLElement {
  return document.createElement(type);
}

class UIElement {
  public domElement:HTMLElement
  constructor(dom:HTMLElement) {
    this.domElement = dom;
  }

  add(...element:HTMLElement[]) {
    for (let i = 0; i < element.length; i++) {
      const uiElement = element[i];
      if (uiElement instanceof UIElement) {
        this.domElement.append(uiElement.domElement);
      } else {
        console.warn('UIElement : ',uiElement,' is not an instance of UIElement');
      }
    }
  }

  remove(...element) {
    for (let i = 0; i < element.length; i++) {
      const uiElement = element[i];
      if (uiElement instanceof UIElement) {
        this.domElement.removeChild(uiElement.domElement);
      } else {
        console.warn(
          'UIElement : ',
          uiElement,
          ' is not an instance of UIElement',
        );
      }
    }
  }

  setStyle(style:Object) {
    Object.assign(this.domElement.style, style);
  }

  setTextContent(text:string) {
    this.domElement.textContent = text;
  }

  getTextContent() {
    return this.domElement.textContent;
  }

  setId(id:string) {
    this.domElement.id = id;
  }

  show() {
    this.domElement.style.display = 'block';
  }

  hide() {
    this.domElement.style.display = 'none';
  }
}

class UIDiv extends UIElement {
  constructor() {
    super(createElement('div'));
  }
}

class UISpan extends UIElement {
  constructor() {
    super(createElement('span'));
  }
}

class UIText extends UISpan {
  constructor() {
    super();
    this.domElement.className = 'UIText';
    this.domElement.style.cursor = 'default';
    this.domElement.style.display = 'inline-block';
    this.domElement.style.fontSize = '12px';
  }
}

class UIBreak extends UIElement {
  constructor() {
    super(createElement('br'));
  }
}

export {
  UIDiv, UISpan, UIText, UIBreak,
};
