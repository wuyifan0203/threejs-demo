/*
 * @Date: 2023-07-06 14:18:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-15 17:47:34
 * @FilePath: /threejs-demo/packages/f-engine/vite.config.ts
 */
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';


export default defineConfig({
  root: './example', // 添加这一行
  base: './',
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
      '#': path.resolve(__dirname, './types'),
    },
  },
  server: {
    open: true,
    port: 3100
  },

  build: {
    minify: false,
    outDir: '../build',
    lib: {
      entry: '../src/index.ts',
      name: 'CadLibrary',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `cad.${format}.js`,
    },
    rollupOptions: {
      external: [
        'three',
        'signals',
        'mathjs',
        'poly2tri/dist/poly2tri',
        'polybooljs',
        'three/examples/jsm/controls/OrbitControls',
        'three/examples/jsm/controls/TransformControls',
        'three/examples/jsm/lines/LineSegments2',
        'three/examples/jsm/lines/LineMaterial',
        'three/examples/jsm/lines/LineSegmentsGeometry',
        'three/examples/jsm/loaders/STLLoader',
        'three/examples/jsm/utils/GPUStatsPanel',
        'three/examples/jsm/libs/stats.module',
        'three/examples/jsm/geometries/ParametricGeometry',
        'three/examples/jsm/exporters/STLExporter',
        'three/examples/jsm/postprocessing/ShaderPass',
        'three/examples/jsm/postprocessing/EffectComposer',
        'three/examples/jsm/postprocessing/RenderPass',
        'three/examples/jsm/postprocessing/MaskPass',
        'three/examples/jsm/shaders/FXAAShader',
        'three/examples/jsm/shaders/CopyShader',
        'three/examples/jsm/shaders/GammaCorrectionShader',
      ],
      output: {
        globals: {
          three: 'three',
          signals: 'signals',
          mathjs: 'mathjs',
          'poly2tri/dist/poly2tri': 'poly2tri/dist/poly2tri',
          polybooljs: 'polybooljs',
          'three/examples/jsm/controls/OrbitControls': 'OrbitControls',
          'three/examples/jsm/controls/TransformControls': 'TransformControls',
          'three/examples/jsm/lines/LineSegments2': 'LineSegments2',
          'three/examples/jsm/lines/LineMaterial': 'LineMaterial',
          'three/examples/jsm/lines/LineSegmentsGeometry': 'LineSegmentsGeometry',
          'three/examples/jsm/loaders/STLLoader': 'STLLoader',
          'three/examples/jsm/utils/GPUStatsPanel': 'GPUStatsPanel',
          'three/examples/jsm/libs/stats.module': 'stats',
          'three/examples/jsm/geometries/ParametricGeometry': 'ParametricGeometry',
          'three/examples/jsm/exporters/STLExporter': 'STLExporter',
          'three/examples/jsm/exporters/OBJExporter': 'OBJExporter',
          'three/examples/jsm/postprocessing/ShaderPass': 'ShaderPass',
          'three/examples/jsm/postprocessing/EffectComposer': 'EffectComposer',
          'three/examples/jsm/postprocessing/RenderPass': 'RenderPass',
          'three/examples/jsm/postprocessing/MaskPass': 'MaskPass',
          'three/examples/jsm/shaders/FXAAShader': 'FXAAShader',
          'three/examples/jsm/shaders/CopyShader': 'CopyShader',
          'three/examples/jsm/shaders/GammaCorrectionShader': 'GammaCorrectionShader',
        },
      },
    },
    emptyOutDir: true
  },
  plugins: [
    dts({
      entryRoot: '../src',
      outDir: "../types"
    })]
});
