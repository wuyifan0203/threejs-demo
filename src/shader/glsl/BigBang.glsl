// Created by Benoit Marini - 2020
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// https://www.shadertoy.com/view/wdtczM

void mainImage(out vec4 o,vec2 F){
    vec2 R=iResolution.xy;
    o-=o;
    for(float d,t=iTime*.1,i=0.;i>-1.;i-=.06)
    {d=fract(i-3.*t);
        vec4 c=vec4((F-R*.5)/R.y*d,i,0)*28.;
        for(int j=0;j++<27;)
        c.xzyw=abs(c/dot(c,c)
        -vec4(7.-.2*sin(t),6.3,.7,1.-cos(t/.8))/7.);
        o-=c*c.yzww*d--*d/vec4(3,5,1,1);
    }
}
