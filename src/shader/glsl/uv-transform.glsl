const float PI=3.1415926;

float addEquilateralTriangle(in vec2 p,in float r){
    const float k=sqrt(3.);
    p.x=abs(p.x)-r;
    p.y=p.y+r/k;
    if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;
    p.x-=clamp(p.x,-2.*r,0.);
    return-length(p)*sign(p.y);
}

mat2 rotation2d(float angle){
    float s=sin(angle);
    float c=cos(angle);
    
    return mat2(
        c,-s,
        s,c
    );
}

vec2 rotate(vec2 v,float angle){
    return rotation2d(angle)*v;
}

// void main(){
    //     vec2 uv=gl_FragCoord.xy/iResolution.xy;
    //     uv=uv*2.-1.;
    //     uv.x*=iResolution.x/iResolution.y;
    
    //     // uv 平移 采用加减
    //     uv-=vec2(.5,.5);
    
    //     // uv 缩放 采用乘除
    //     uv/=vec2(.5,.5);
    
    //     // uv 镜像
    //     //x轴反转就y乘-1
    //     uv=vec2(uv.x,-uv.y);
    //     //y轴反转就x乘-1
    //     uv=vec2(-uv.x,uv.y);
    
    //     // uv 旋转
    //     // uv=rotate(uv,iTime);
    
    //     float d=addEquilateralTriangle(uv,.5);
    //     // 光滑
    //     d=smoothstep(0.,.01,d);
    
    //     // gl_FragColor=vec4(uv,0.,1.);
    
    //     gl_FragColor=vec4(vec2(d),1.,1.);
// }

// uv 重复
// void main(){
    //     vec2 uv=gl_FragCoord.xy/iResolution.xy;
    
    //     uv =fract(uv* vec2(2.,2.));
    //     uv = uv * 2. - 1.;
    //     uv.x *= iResolution.x / iResolution.y;
    
    //     float d=addEquilateralTriangle(uv,.5);
    //     d=smoothstep(0.,.01,d);
    
    //     // gl_FragColor=vec4(uv,0.,1.);
    //     gl_FragColor=vec4(vec3(d),1.);
// }

// uv 镜像

void main(){
    vec2 uv=gl_FragCoord.xy/iResolution.xy;

    uv=uv*2.-1.;
    uv.x*=iResolution.x/iResolution.y;

    uv.y= -abs(uv.y);

    uv+=vec2(0.0,0.5);
    
    float d=addEquilateralTriangle(uv,.3);
    d=smoothstep(0.,.01,d);
    
    // gl_FragColor=vec4(uv,0.,1.);
    gl_FragColor=vec4(vec3(d),1.);
}