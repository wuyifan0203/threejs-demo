// version:"1,1,1"
const config =  {
  locateFile(path) {
    if (path.endsWith('.wasm')) {
      return '../lib/other/opencascade/opencascade.wasm.wasm'; // 直接返回路径
    }
    return path;
  },
}

export const initOpenCascade = async () => {
  try {
    const opencascadeModule = await import('./opencascade.wasm.js'); // 动态导入wasm.js文件
    return await new opencascadeModule.default(config);
  } catch (error) {
    throw new Error('OpenCascade 加载失败: ' + error.message);
  }
};