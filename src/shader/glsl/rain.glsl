// void mainImage(out vec4 fragColor, in vec2 fragCoord) {
//     vec2 uv = fragCoord / iResolution.xy;

//     // 生成随机的雨滴位置
//     float randPos = fract(sin(dot(fragCoord, vec2(12.9898, 78.233))) * 43758.5453);

//     // 雨滴的滑落效果，模拟雨滴随时间向下移动
//     float rain = smoothstep(0.4, 0.0, mod(uv.y + iTime * randPos * 0.5, 1.0));

//     // 计算雨滴宽度和强度，使其看起来更自然
//     float width = smoothstep(0.01, 0.02, abs(uv.x - randPos));
//     rain *= width;

//     // 混合雨滴和背景颜色
//     vec3 bgColor = vec3(0.1, 0.1, 0.2);  // 暗蓝色背景
//     vec3 rainColor = vec3(0.8, 0.8, 0.9); // 浅蓝色雨滴

//     // 最终颜色，根据雨滴的存在增加亮度
//     vec3 color = mix(bgColor, rainColor, rain);

//     fragColor = vec4(color, 1.0);
// }

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(13.9898,78.233))) * 43758.5453);
}

// 伪造的多重柏林噪声函数
float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p = p*2.02;
    f += 0.2500 * noise(p); p = p*2.03;
    f += 0.1250 * noise(p); p = p*2.01;
    f += 0.0625 * noise(p);
    return f;
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    uv *= 2.0; // 扩大 UV 范围以使效果更加显著

    // 模拟水滴的流动路径
    float t = iTime * 0.2; // 减慢时间的流逝
    vec2 p = uv * 25.0 + vec2(t, t); // 创建 UV 格网并加入时间变化
    p = fract(p) - 0.5;

    // 使用柏林噪声生成水滴形状和路径
    float noise = fbm(p);
    float flow = smoothstep(0.4, 0.6, noise); // 使用 smoothstep 精细控制流动的边缘

    // 水滴颜色和背景
    vec3 waterColor = vec3(0.2, 0.4, 0.6); // 水的颜色
    vec3 bgColor = vec3(0.05, 0.05, 0.1); // 深色背景

    // 混合背景和水滴颜色
    vec3 color = mix(bgColor, waterColor, flow);

    // 输出最终颜色
    fragColor = vec4(color, 1.0);
}




