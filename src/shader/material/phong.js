import {
 ShaderMaterial, Uniform, Color, Vector3 
} from 'three';

class CustomPhongMaterial extends ShaderMaterial {
    constructor() {
        super();
        this.uniforms = {
            // baseColor
            color: new Uniform(new Color(0xffffff)),
            //镜面反射颜色
            specular: new Uniform(new Color(0xffffff)),
            // 高光系数
            shininess: new Uniform(30),
            // 环境光颜色
            ambientLightColor: new Uniform(new Color(0xffffff)),
            // 光线颜色
            lightColor: new Uniform(new Color(0xffffff)),
            // 光线方向
            lightPosition: new Uniform(new Vector3(1, 1, 1)),
        };

        this.vertexShader = /* glsl */ `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalMatrix * normal;
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        this.fragmentShader = /* glsl */ `
            uniform vec3 color;
            uniform vec3 specular;
            uniform float shininess;
            uniform vec3 ambientLightColor;
            uniform vec3 lightColor;
            uniform vec3 lightPosition;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // 当前片元方向
                vec3 N = normalize(vNormal);
                // 当前片元的光线方向
                vec3 L = normalize(lightPosition - vPosition);
                // 当前片元到摄像机的方向
                vec3 V = normalize(-vPosition);
                // 计算反射光
                vec3 R = reflect(-L, N);

                // 总光照=环境反射+漫反射+镜面反射

                // 环境反射
                vec3 ambient = ambientLightColor * color;

                // 漫反射
                float diffuseFactor = max(dot(N, L), 0.0);
                vec3 diffuse = lightColor * diffuseFactor * color;

                // 镜面反射     
                float specularFactor = pow(max(dot(R, V), 0.0), shininess); 
                vec3 specularReflection = specular * specularFactor;    

                // 总光照
                vec3 totalLight = ambient + diffuse + specularReflection;

                gl_FragColor = vec4(totalLight, 1.0);
            }
        `;
    }
}

export { CustomPhongMaterial };