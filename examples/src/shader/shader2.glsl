void mainImage(out vec4 fragColor,in vec2 fragCoord){

    // fragCoord vec2 代表当前片元在屏幕中的坐标
    // iResolution vec3 代表屏幕分辨率,是固定值
    // 以下注释为AI生成
    // iTime float 代表当前片元在屏幕中出现的时刻,是固定值
    // iTimeDelta float 代表从上一帧到当前帧经过的时间,是固定值
    // iFrame float 代表当前是第几帧,是固定值
    // iChannelTime float 代表当前纹理数据在屏幕中出现的时刻,是固定值
    // iChannelResolution vec3 代表当前纹理数据在屏幕中的分辨率,是固定值
    // iMouse vec4 代表鼠标信息,是固定值
    // iDate float 代表当前时间,是固定值
    // iSampleRate float 代表采样率,是固定值
    // iChannel0 sampler2D 代表纹理数据
    // iChannel1 sampler2D 代表纹理数据
    // iChannel2 sampler2D 代表纹理数据
    // iChannel3 sampler2D 代表纹理数据
    // iChannel4 sampler2D 代表纹理数据

    float r = float(fragCoord.x/iResolution.x);
    float g = float(fragCoord.y/iResolution.y);
    float b = float(iTime/iResolution.z);
    float a = float(1.0-r);

	fragColor = vec4(r,g,b,a);
}