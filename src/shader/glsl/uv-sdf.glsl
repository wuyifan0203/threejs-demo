/* Main function, uniforms & utils */
#ifdef GL_ES
precision mediump float;
#endif

// sdf from https://iquilezles.org/articles/distfunctions2d/
// 这个网站有很多关于2D SDF的代码

float addCircle(vec2 center,float radius){
    return length(center)-radius;
}

float addBox(in vec2 p,in vec2 b){
    vec2 d=abs(p)-b;
    return length(max(d,0.))+min(max(d.x,d.y),0.);
    
}

float addStar5(in vec2 p,in float r,in float rf){
    const vec2 k1=vec2(.809016994375,-.587785252292);
    const vec2 k2=vec2(-k1.x,k1.y);
    p.x=abs(p.x);
    p-=2.*max(dot(k1,p),0.)*k1;
    p-=2.*max(dot(k2,p),0.)*k2;
    p.x=abs(p.x);
    p.y-=r;
    vec2 ba=rf*vec2(-k1.y,k1.x)-vec2(0,1);
    float h=clamp(dot(p,ba)/dot(ba,ba),0.,r);
    return length(p-ba*h)*sign(p.y*ba.x-p.x*ba.y);
}

float adMoon(vec2 p, float d, float ra, float rb )
{
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0) )
          return length(p-vec2(a,b));
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

void main(){
    vec2 uv=gl_FragCoord.xy/iResolution.xy;
    uv=uv*2.-1.;
    uv.x*=iResolution.x/iResolution.y;
    
    float d=addCircle(uv,.5);
    
    d=addBox(uv,vec2(.25,.15));
    
    d=addStar5(uv,.5,.5);

    d=adMoon(uv,0.5,0.8,0.6);
    
    // 光滑
    d=smoothstep(0.,.01,d);
    
    gl_FragColor=vec4(vec2(d),1.,1.);
}