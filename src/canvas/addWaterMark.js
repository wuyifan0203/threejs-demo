/*
 * @Date: 2023-05-17 10:09:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-06 18:31:13
 * @FilePath: /threejs-demo/packages/examples/canvas/addWaterMark.js
 */
import { GUI } from '../lib/util/lil-gui.module.min.js';;

function init() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const Linear = document.createElement('canvas');
  const LinearCtx = Linear.getContext('2d');

  document.body.append(Linear);

  Linear.width = width;
  Linear.height = height;

  const gradient = LinearCtx.createLinearGradient(0, 0, width, 0);

  const control = {
    col: 100,
    row: 100,
    ph: 100,
    pw: 20,
    fontSize: 20,
  };
  const updateCtx = () => {
    drawCtx(LinearCtx, gradient);
  };

  function drawCtx(ctx, gradient) {
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.25, 'yellow');
    gradient.addColorStop(0.75, 'blue');
    gradient.addColorStop(1, 'green');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${control.fontSize}px microsoft yahei`;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    const { width: w } = ctx.measureText('Text');
    const h = parseInt(ctx.font, 10) * 1.2;
    for (let c = -control.col / 2; c < control.col / 2; c++) {
      const ch = c * (control.ph + h);
      for (let r = -control.row / 2; r < control.row / 2; r++) {
        ctx.rotate((-45 * Math.PI) / 180);
        ctx.fillText('Text', ch, r * (control.pw + w));
        ctx.rotate((45 * Math.PI) / 180); // 把水印偏转角度调整为原来的，不然他会一直转
      }
    }
  }

  updateCtx();

  const gui = new GUI();
}

window.onload = () => {
  init();
};
