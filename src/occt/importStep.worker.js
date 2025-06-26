import { initOpenCascade } from '../lib/other/opencascade/index.js';

initOpenCascade().then((occ)=>{
    console.log('occ init success: ', occ);

}).catch((err)=>{
    console.error('err: ', err);
})