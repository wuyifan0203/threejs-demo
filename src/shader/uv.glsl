

void main(){
    
    vec2 uv=gl_FragCoord.xy/iResolution.xy;
    // 归一化
    uv=(uv-.5)*2.;
    // 宽高等比
    uv.x*=iResolution.x/iResolution.y;
    float d=length(uv);
    d -=0.3;
    
    // 1.
    // d=step(0.0,d);
    // 2.
    d=smoothstep(0.0,0.01,d);
    // 发光球体
    // d=.3/d;
    // d=pow(d,1.6);
    
    // gl_FragColor=vec4(uv,0,1.);
    gl_FragColor=vec4(vec3(d),1.);
}