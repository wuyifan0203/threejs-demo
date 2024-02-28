// void mainImage(out vec4 fragColor,in vec2 fragCoord)
// {
    //     // 将屏幕坐标转换为-1到1的范围
    //     vec2 uv=(fragCoord-.5*iResolution.xy)/iResolution.y;
    
    //     // 基础噪声，模拟水波纹
    //     float noise=fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453);
    
    //     // 创建波动效果
    //     float wave=sin(uv.x*10.+iTime)*cos(uv.y*10.+iTime)*.25;
    
    //     // 将噪声和波动效果结合
    //     float waterSurface=noise+wave;
    
    //     // 水的颜色，可以根据需要调整
    //     vec3 waterColor=vec3(0.0824, 0.2353, 0.8549)+waterSurface*.5;
    
    //     // 输出最终颜色
    //     fragColor=vec4(waterColor,1.);
// }

// 柏林噪声函数
float noise(vec2 p){
    return fract(sin(dot(p,vec2(13.9898,78.233)))*43758.5453123);
}

// 平滑的柏林噪声
float snoise(vec2 p){
    vec2 f=fract(p);
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(noise(floor(p)),noise(floor(p)+vec2(1.,0.)),u.x),
    mix(noise(floor(p)+vec2(0.,1.)),noise(floor(p)+vec2(1.,1.)),u.x),u.y);
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy;
    uv=uv*2.-1.;
    uv.x*=iResolution.x/iResolution.y;
    
    // 时间变量，用于动态效果
    float time=iTime*.3;
    
    // 使用柏林噪声创建水面纹理
    float n=0.;
    for(int i=1;i<4;i++){
        float scale=pow(2.,float(i));
        n+=snoise(uv*scale+time)/scale;
    }
    
    // 计算水面法线
    vec3 normal=normalize(vec3(snoise(uv+vec2(.1,0.))-snoise(uv-vec2(.1,0.)),
    snoise(uv+vec2(0.,.1))-snoise(uv-vec2(0.,.1)),
1.));

// 简单的光照模型
vec3 lightDir=normalize(vec3(.5,.8,.6));
float diff=max(dot(normal,lightDir),0.);

// 水的颜色
vec3 waterColor=mix(vec3(0.,.2,.4),vec3(.1,.3,.5),diff);

fragColor=vec4(waterColor+.5*n*diff,1.);
}
