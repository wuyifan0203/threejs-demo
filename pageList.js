/*
 * @Date: 2024-07-19 22:28:29
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-24 17:00:27
 * @FilePath: \threejs-demo\pageList.js
 */
const list = [
  {
    category: "animation",
    title: "Animation",
    pages: [
      {
        path: "/animate/useAnimation.html",
        title: "Use Animation",
      },
      {
        path: "/animate/loadModalWithAnimation.html",
        title: "Load Modal With Animation",
      },
      {
        path: "/tween/useTween.html",
        title: "Use Tween",
      },
      {
        path: "/tween/portal.html",
        title: "Portal",
      },
    ],
  },
  {
    category: "renderer",
    title: "Renderer",
    pages: [
      {
        path: "/render/useRenderTarget.html",
        title: "Use Render Target",
      },
      {
        path: "/render/scissorTest.html",
        title: "Use Scissor Test",
      },
      {
        path: "/render/renderDeepPeeling.html",
        title: "Use Deep Peeling",
      },
      {
        path: "/render/renderWBOIT.html",
        title: "Use Deep WBOIT",
      },
    ],
  },
  {
    category: "composer",
    title: "Composer",
    pages: [
      {
        path: "/composer/useOITRenderPass.html",
        title: "Use OIT Render Pass",
      },
      {
        path: "/composer/useCopyShader.html",
        title: "Use Copy Shader",
      },
      {
        path: "/composer/useBackgroundPass.html",
        title: "Use useBackground Pass",
      },
    ],
  },
  {
    category: "controls",
    title: "Controls",
    pages: [
      {
        path: "/controls/useArcballControls.html",
        title: "Use Arcball Controls",
      },
      {
        path: "/controls/useOrbitControls.html",
        title: "Use Orbit Controls",
      },
      {
        path: "/controls/useTrackballControls.html",
        title: "Use Trackball Controls",
      },
      {
        path: "/controls/useFirstPersonControls.html",
        title: "Use First Person Controls",
      },
      {
        path: "/controls/usePointerLockControls.html",
        title: "Use Pointer Lock Controls",
      },
    ],
  },
  {
    category: "camera",
    title: "Camera",
    pages: [
      {
        path: "/camera/orthographic.html",
        title: "Orthographic",
      },
      {
        path: "/camera/layer.html",
        title: "Layer",
      },
      {
        path: "/camera/layer2.html",
        title: "How to Use Layer",
      },
      {
        path: "/camera/dynamicGrid.html",
        title: "Dynamic Grid",
      },
      {
        path: "/camera/focusObject.html",
        title: "Focus Object by Orbit Controls",
      },
      {
        path: "/camera/saveState.html",
        title: "Save Camera State",
      },
    ],
  },
  {
    category: "light",
    title: "Light",
    pages: [
      {
        path: "/light/shadow.html",
        title: "Shadow",
      },
    ],
  },
  {
    category: "geometry",
    title: "Geometry",
    pages: [
      {
        path: "/geometry/parametricGeometry.html",
        title: "Parametric Geometry",
      },
      {
        path: "/geometry/ring.html",
        title: "Ring Geometry",
      },
      {
        path: "/geometry/extrudeGeometry.html",
        title: "Extrude Geometry",
      },
      {
        path: "/geometry/isSamplePolygon.html",
        title: "Judge if Sample Polygon",
      },
      {
        path: "/geometry/splitMesh.html",
        title: "Split Mesh",
      },
      {
        path: "/geometry/formulaPolygon.html",
        title: "Create Mesh Using Formula",
      },
      {
        path: "/geometry/lathePolygon.html",
        title: "Lathe Geometry",
      },
      {
        path: "/geometry/shapeGeometry.html",
        title: "Shape Geometry",
      },
    ],
  },
  {
    category: "material",
    title: "Material",
    pages: [
      {
        path: "/material/clipping.html",
        title: "Clipping",
      },
      {
        path: "/material/stencil.html",
        title: "Stencil",
      },
      {
        path: "/material/transport.html",
        title: "Transport",
      },
      {
        path: "/material/blendingTest.html",
        title: "Blending (WIP)",
      },
      {
        path: "/material/depthTest.html",
        title: "Depth Test (WIP)", 
      },
      {
        path: "/material/stencilMaterial.html",
        title: "Stencil Test (WIP)", 
      }
    ],
  },
  {
    category: "shader",
    title: "Shader",
    pages: [
      {
        path: "/shader/shaderToy.html",
        title: "Shader Toy Test",
      },
      {
        path: "/shader/fresnelEffect.html",
        title: "Fresnel Effect",
      },
      {
        path: "/shader/materialTest.html",
        title: "Custom Material",
      },
      {
        path: "/shader/cloud.html",
        title: "Cloud",
      },
      {
        path: "/shader/audioContext.html",
        title: "Audio Context Visualization",
      },
      {
        path: "/shader/grass.html",
        title: "Grass Land",
      },
    ],
  },
  {
    category: "object",
    title: "Object",
    pages: [
      {
        path: "/object/instanceMesh.html",
        title: "Use Instance Mesh",
      },
      {
        path: "/geometry/edgeGeometry.html",
        title: "Edge Geometry",
      },
    ],
  },
  {
    category: "line",
    title: "Line",
    pages: [
      {
        path: "/line/useLine.html",
        title: "Use Line",
      },
      {
        path: "/line/lineExtend.html",
        title: "Line Extend",
      },
      {
        path: "/line/line2.html",
        title: "Line2",
      },
    ],
  },
  {
    category: "particle",
    title: "Particle",
    pages: [
      {
        path: "/particle/common.html",
        title: "Common",
      },
      {
        path: "/particle/particlesTexture.html",
        title: "Particles Texture",
      },
      {
        path: "/particle/geometry.html",
        title: "Geometry",
      },
      {
        path: "/particle/GRAVITY.html",
        title: "Gravity",
      },
      {
        path: "/particle/image.html",
        title: "Image",
      },
      {
        path: "/particle/galaxy.html",
        title: "Galaxy",
      },
      {
        path: "/particle/rain.html",
        title: "Rain",
      },
    ],
  },
  {
    category: "helper",
    title: "Helper",
    pages: [
      {
        path: "/helper/viewHelperTest.html",
        title: "View Helper Test",
      },
      {
        path: "/helper/rulerHelper.html",
        title: "Ruler Helper Demo",
      },
    ],
  },
  {
    category: "intersection",
    title: "Intersection",
    pages: [
      {
        path: "/intersection/selectInstanceMesh.html",
        title: "Select InstanceMesh",
      },
    ],
  },
  {
    category: "math",
    title: "Math",
    pages: [
      {
        path: "/math/modalMatrix.html",
        title: "Modal Matrix",
      },
      {
        path: "/math/rotateMatrix.html",
        title: "Robotic Arm",
      },
      {
        path: "/math/viewMatrix.html",
        title: "Look At Ball",
      },
    ],
  },
  {
    category: "noise",
    title: "Noise",
    pages: [
      {
        path: "/noise/perlinNoiseDemo1.html",
        title: "Perlin Noise Demo 1",
      },
    ],
  },
  {
    category: "loader",
    title: "Loader",
    pages: [
      {
        path: "/loader/gltfLoader.html",
        title: "GLTF Loader",
      },
      {
        path: "/loader/cubeTextureLoader.html",
        title: "Cube Texture Loader",
      },
      {
        path: "/loader/rgbeLoader.html",
        title: "RGBE Loader",
      },
      {
        path: "/texture/commonTexture.html",
        title: "FBX Loader",
      },
      {
        path: "/loader/objLoader.html",
        title: "OBJ Loader",
      },
      {
        path: "/loader/usdzLoader.html",
        title: "USDZ Loader",
      },
    ],
  },

  {
    category: "texture",
    title: "Texture",
    pages: [
      {
        path: "/texture/commonTexture.html",
        title: "Common Texture",
      },
      {
        path: "/texture/colorMap.html",
        title: "View House 3D with `.map` Texture",
      },
      {
        path: "/texture/useTexture.html",
        title: "Use Texture",
      },
      {
        path: "/texture/useSpriteTexture.html",
        title: "Use Sprite Texture",
      },
      {
        path: "/texture/canvasTexture.html",
        title: "Use Canvas Texture",
      },
    ],
  },
  {
    category: "canvas",
    title: "Canvas",
    pages: [
      {
        path: "/canvas/canvasGradient.html",
        title: "Canvas Draw Gradient",
      },
      {
        path: "/canvas/addWaterMark.html",
        title: "WaterMark",
      },
    ],
  },
  {
    category: "cannon",
    title: "Cannon",
    pages: [
      {
        path: "/cannon/index.html",
        title: "Cannon 1",
      },
      {
        path: "/cannon/throw.html",
        title: "Throw Circle",
      },
      {
        path: "/cannon/lockConstraint.html",
        title: "Bridge (Lock Constraint)",
      },
      {
        path: "/cannon/pointConstraint.html",
        title: "Bridge (Point Constraint)",
      },
      {
        path: "/cannon/heightField.html",
        title: "Height Field",
      },
      {
        path: "/cannon/pointerLockControl.html",
        title: "Pointer Lock Controls",
      },
      {
        path: "/cannon/bowling.html",
        title: "Bowling Game",
      },
      {
        path: "/cannon/vehicle.html",
        title: "Vehicle",
      },
    ],
  },

  {
    category: "algorithms",
    title: "Algorithms",
    pages: [
      {
        path: "/algorithms/quadTreeDemo.html",
        title: "Quad Tree Demo",
      },
    ],
  },
  {
    category: "plot",
    title: "Plot",
    pages: [
      { path: "/plot/triangularMesh.html", title: "Triangular Mesh Plot" },
    ],
  },
  {
    category: "booleanOperation",
    title: "Boolean Operation",
    pages: [
      {
        path: "/booleanOperation/3d.html",
        title: "3D Boolean Operation",
      },
      {
        path: "/booleanOperation/2d.html",
        title: "2D Boolean Operation",
      },
    ],
  },
  {
    category: "others",
    title: "Others",
    pages: [
      {
        path: "/triangle/triangle.html",
        title: "Triangle",
      },
      {
        path: "/zFighting/pologyOffsetTest.html",
        title: "Polygon Offset Test",
      },
      {
        path: "/zFighting/renderOrderTest.html",
        title: "Use Polygon Offset",
      },
    ],
  },
];

export { list };
