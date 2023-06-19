/*
 * @Date: 2023-06-15 16:51:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-16 13:46:52
 * @FilePath: /threejs-demo/packages/examples/line/pathPreview.js
 */
import {
    Scene,
    Vector3,
    LineBasicMaterial,
    LineSegments,
    BufferGeometry,
    BufferAttribute,
    Path,
    Line,
    LineLoop,
    Points,
    PointsMaterial,
  } from '../../lib/three/three.module.js';
  import { OrbitControls } from '../../lib/three/OrbitControls.js';
  import {
    initRenderer,
    initOrthographicCamera,
    initAxesHelper,
    initCustomGrid,
  } from '../../lib/tools/index.js';

  import {innerPoints} from '../polygonScale/compute.js' 
  
  
  (function () {
    init();
  }());
  
  function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, 0, 100));
    camera.up.set(0, 0, 1);
    const scene = new Scene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene)
  
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false
    draw(scene);
  
    render();
    function render() {
      controls.update();
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
  }
  
  function draw(scene) {


    const data =[
        [
            0.4330127018922193,
            0.9893670579228859
        ],
        [
            0.4330127018922193,
            -0.9893670579228859
        ],
        [
            0.40079028275362316,
            -0.9865336953787626
        ],
        [
            0.3485021346338175,
            -0.9816423589914869
        ],
        [
            0.2962251122947749,
            -0.9765025262326478
        ],
        [
            0.24404761337211683,
            -0.971061103396025
        ],
        [
            0.19203387554648535,
            -0.9652303161523892
        ],
        [
            0.14033518772992054,
            -0.9588667704084488
        ],
        [
            0.08949813160242481,
            -0.9517184099297983
        ],
        [
            0.09044019968059458,
            -0.9518865048398578
        ],
        [
            0.040762671227949715,
            0
        ],
        [
            0.09044019968059458,
            0.9518865048398578
        ],
        [
            0.08949813160242481,
            0.9517184099297983
        ],
        [
            0.14033518772992054,
            0.9588667704084488
        ],
        [
            0.19203387554648535,
            0.9652303161523892
        ],
        [
            0.24404761337211683,
            0.971061103396025
        ],
        [
            0.2962251122947749,
            0.9765025262326478
        ],
        [
            0.3485021346338175,
            0.9816423589914869
        ],
        [
            0.40079028275362316,
            0.9865336953787626
        ]
    ]

  
    const LM1 = new LineBasicMaterial({ color:'green' });
    const LM2 = new LineBasicMaterial({ color :'blue'});

    const gM1 = new PointsMaterial({ color:'red',size:7 });
    const gM2 = new PointsMaterial({ color :'yellow',size:7});

    const g1 = useVec2Array(data,3);
    const g2 = useVec2Array(expendWidth(data,0.5),3)

    const rl = new LineLoop(g1,LM1);
    const el = new LineLoop(g2,LM2);

    const rP = new Points(g1,gM1);
    const eP = new Points(g2,gM2);
  
    scene.add(rl,el);  
    scene.add(rP,eP); 


  }
  

  function useVec2Array(data,height) {
    console.log(data.length);
    const vertex = [];
    for (let i = 0; i < data.length; i++) {
        const [x,y] = data[i]
        vertex.push(x,y,height)
    }
    return new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(vertex), 3));
  }

  function expendWidth(pointList, width) {
    const result = [];
    const { length } = pointList;
    for (let i = 0, j = length - 1; i < length; j = i++) {
      const q = i === length - 1 ? 0 : i + 1;
      result.push(innerPoints(pointList[j], pointList[i], pointList[q], width));
    }
  
    return result;
  }