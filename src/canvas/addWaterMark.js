/*
 * @Date: 2023-05-17 10:09:04
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-15 11:38:52
 * @FilePath: \threejs-demo\src\canvas\addWaterMark.js
 */
import { initGUI } from "../lib/tools/common.js";

function init() {


  const Linear = document.createElement("canvas");
  const LinearCtx = Linear.getContext("2d");

  document.body.append(Linear);
  Linear.style.width = `100vw`;
  Linear.style.height = `100vh`;

  const { width, height } = Linear.getBoundingClientRect();

  Linear.width = width;
  Linear.height = height;


  const gradient = LinearCtx.createLinearGradient(0, 0, width, 0);

  const control = {
    col: 100,
    row: 100,
    ph: 100,
    pw: 20,
    fontSize: 20,
    rotate: 45,
    markText: "Test",
  };
  const updateCtx = () => {
    drawCtx(LinearCtx, gradient);
  };

  function drawCtx(ctx, gradient) {
    const { col, row, ph, pw, fontSize, markText, rotate } = control;
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.25, "yellow");
    gradient.addColorStop(0.75, "blue");
    gradient.addColorStop(1, "green");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px microsoft yahei`;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    const { width: w } = ctx.measureText(markText);
    const h = parseInt(ctx.font, 10) * 1.2;

    const angle = (rotate * Math.PI) / 180;
    for (let c = -col / 2; c < col / 2; c++) {
      const ch = c * (ph + h);
      for (let r = -row / 2; r < row / 2; r++) {
        ctx.rotate(-angle);
        ctx.fillText(markText, ch, r * (pw + w));
        ctx.rotate(angle); // 把水印偏转角度调整为原来的，不然他会一直转
      }
    }
  }

  updateCtx();

  const gui = initGUI();
  gui.add(control, "markText").onChange(updateCtx).name("Text");
  gui
    .add(control, "fontSize", 12, 100, 1)
    .onChange(updateCtx)
    .name("Font Size");
  gui
    .add(control, "rotate", 0, 360, 1)
    .onChange(updateCtx)
    .name("Rotate Angle");
  gui.add(control, "col", 10, 200, 1).onChange(updateCtx).name("Col");
  gui.add(control, "row", 10, 200, 1).onChange(updateCtx).name("Row");
  gui.add(control, "ph", 10, 200, 1).onChange(updateCtx).name("Padding Height");
  gui.add(control, "pw", 10, 200, 1).onChange(updateCtx).name("Padding Width");
}

window.onload = () => {
  init();
};
