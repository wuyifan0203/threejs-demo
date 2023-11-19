/*
 * @Date: 2023-05-17 10:09:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-06 18:08:17
 * @FilePath: /threejs-demo/packages/examples/canvas/canvasGradient.js
 */
/*
 * @Date: 2023-05-17 10:09:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-06 17:51:12
 * @FilePath: /threejs-demo/packages/examples/canvas/canvasGradient.js
 */
import { GUI } from '../lib/util/lil-gui.module.min.js';;

function init() {
  const width = window.innerWidth / 3;
  const height = window.innerHeight / 3;

  const Radial = document.createElement('canvas');
  const RadialCtx = Radial.getContext('2d');

  const Linear = document.createElement('canvas');
  const LinearCtx = Linear.getContext('2d');

  document.body.append(Linear);
  document.body.append(Radial);

  Linear.width = Radial.width = width;
  Linear.height = Radial.height = height;

  const linearControl = {
    x0: 0,
    y0: 0,
    x1: width,
    y1: 0,
  };

  const radialControl = {
    x0: 110,
    y0: 90,
    x1: 100,
    y1: 100,
    r0: 30,
    r1: 70,
  };

  const updateLinear = () => {
    const gradient = LinearCtx.createLinearGradient(linearControl.x0, linearControl.y0, linearControl.x1, linearControl.y1);
    drawCtx(LinearCtx, gradient);
  };

  const updateRadial = () => {
    const gradient = RadialCtx.createRadialGradient(radialControl.x0, radialControl.y0, radialControl.r0, radialControl.x1, radialControl.y1, radialControl.r1);
    drawCtx(RadialCtx, gradient);
  };

  function drawCtx(ctx, gradient) {
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.25, 'yellow');
    gradient.addColorStop(0.75, 'blue');
    gradient.addColorStop(1, 'green');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  updateLinear();
  updateRadial();

  const gui = new GUI();

  const linearFolder = gui.addFolder('Linear');
  const radialFolder = gui.addFolder('Radial');

  linearFolder.add(linearControl, 'x0', 0, width, 0.1).onChange(() => updateLinear());
  linearFolder.add(linearControl, 'y0', 0, height, 0.1).onChange(() => updateLinear());
  linearFolder.add(linearControl, 'x1', 0, width, 0.1).onChange(() => updateLinear());
  linearFolder.add(linearControl, 'y1', 0, height, 0.1).onChange(() => updateLinear());

  radialFolder.add(radialControl, 'x0', 0, width, 0.1).onChange(() => updateRadial());
  radialFolder.add(radialControl, 'y0', 0, height, 0.1).onChange(() => updateRadial());
  radialFolder.add(radialControl, 'x1', 0, width, 0.1).onChange(() => updateRadial());
  radialFolder.add(radialControl, 'y1', 0, height, 0.1).onChange(() => updateRadial());
  radialFolder.add(radialControl, 'r0', 0, 500, 0.1).onChange(() => updateRadial());
  radialFolder.add(radialControl, 'r1', 0, 500, 0.1).onChange(() => updateRadial());
}

window.onload = () => {
  init();
};
