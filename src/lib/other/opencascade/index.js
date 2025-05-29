// "version": "2.0.0-beta.b5ff984",

export const initOpenCascade = async () => {
  try {
    const opencascade =  await import('./occ.core.js'); // 动态导入wasm.js文件
    const instance = await new opencascade.default({
      locateFile(path) {
        if (path.endsWith('.wasm')) {
            return '../lib/other/opencascade/occ.core.wasm'; // 直接返回路径
        }
        return path;
      },
    });


    return instance;
  } catch (error) {
    throw new Error('OpenCascade 加载失败: ' + error.message);
  }
};