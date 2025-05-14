// "version": "2.0.0-beta.b5ff984",

export const initOpenCascade = async (libs = []) => {
  try {
    const opencascadeModule =  await import('./opencascade.full.js'); // 动态导入wasm.js文件
    const instance = await new opencascadeModule.default({
      locateFile(path) {
        if (path.endsWith('.wasm')) {
            return '../lib/other/opencascade/opencascade.full.wasm'; // 直接返回路径
        }
        return path;
      },
    });

    if(instance.loadDynamicLibrary){
      for (let lib of libs) {
        await instance.loadDynamicLibrary(lib, { loadAsync: true, global: true, nodelete: true, allowUndefined: false });
      }
    }

    return instance;
  } catch (error) {
    throw new Error('OpenCascade 加载失败: ' + error.message);
  }
};