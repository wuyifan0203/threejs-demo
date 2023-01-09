/* eslint-disable no-unused-vars */
const width = 800;
const height = 800;

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.append(canvas);

const ctx = canvas.getContext('2d');

const pointList = [];
canvas.addEventListener('click', (event) => {
  pointList.push([event.x, event.y]);
  //   ctx.arc(event.x, event.y, 2, 0, 2 * Math.PI);
  if (!pointList.length > 1) return;
  for (let index = 1; index < pointList.length; index++) {
    const lastPoint = pointList[index - 1];
    const point = pointList[index];
    ctx.moveTo(lastPoint[0], lastPoint[1]);
    ctx.lineTo(point[0], point[1]);
  }
  ctx.stroke();
});

canvas.addEventListener('dblclick', (event) => {
  // eslint-disable-next-line no-self-assign
  canvas.height = canvas.height;
});
