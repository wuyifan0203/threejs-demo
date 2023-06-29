/* eslint-disable max-classes-per-file */
/*
 * @Date: 2023-06-29 15:12:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 18:12:14
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/ui.js
 */
function createElement(type) {
  return document.createElement(type);
}

class UIElement {
  constructor(dom) {
    this.domElement = dom;
  }

  add(...element) {
    for (let i = 0; i < element.length; i++) {
      const uiElement = element[i];
      if (uiElement instanceof UIElement) {
        this.domElement.append(uiElement.domElement);
      } else {
        console.warn(
          'UIElement : ',
          uiElement,
          ' is not an instance of UIElement',
        );
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

  setStyle(style) {
    Object.assign(this.domElement.style, style);
  }

  setTextContent(text) {
    this.domElement.textContent = text;
  }

  getTextContent() {
    return this.domElement.textContent;
  }

  setId(id) {
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
