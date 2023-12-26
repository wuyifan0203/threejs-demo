/*
 * @Date: 2023-05-04 13:54:25
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-04 15:04:17
 * @FilePath: /threejs-demo/packages/examples/canvas/useOneCanvas.js
 */
window.onload = () => {
  init();
};

function init() {
  const canvasWebglDOM = document.createElement('canvas');
  canvasWebglDOM.width = window.innerWidth;
  canvasWebglDOM.height = window.innerHeight;
  const gl = canvasWebglDOM.getContext('webgl');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertexShaderCode = 'attribute vec4 a_Position;\n'
    + 'void main() {\n'
    + '  gl_Position = a_Position;\n'
    + '}\n';
  const fragmentShaderCode = 'precision mediump float;\n'
    + 'void main() {\n'
    + '  gl_FragColor = vec4(0.0,0.0,1.0,1.0);\n'
    + '}\n';

  // 定义三角形顶点坐标
  const vertices = [
    0.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
  ];
  // 创建缓冲区
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // 编译和链接着色器程序
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  // 设置顶点属性指针
  const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_Position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  //   document.body.append(canvasWebglDOM);

  const canvas2DDOM = document.createElement('canvas');
  canvas2DDOM.width = window.innerWidth;
  canvas2DDOM.height = window.innerHeight;
  
  const ctx = canvas2DDOM.getContext('2d');
  ctx.drawImage(canvasWebglDOM, 0, 0);
  //   ctx.clearRect(0, 0, 300, 300);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 200, 200);
  ctx.font = '18px serif';
  ctx.fillText('这是canvas 2D', 200, 50);
  document.body.append(canvas2DDOM);
}
