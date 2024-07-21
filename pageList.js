/*
 * @Date: 2024-07-19 22:28:29
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-21 18:38:02
 * @FilePath: /threejs-demo/pageList.js
 */
const list = [
    {
        category: 'animation',
        title: 'Animation',
        pages: [
            {
                path: '/animate/useAnimation.html',
                title: 'Use Animation'
            },
            {
                path: '/animate/loadModalWithAnimation.html',
                title: 'Load Modal with Animation'
            },
            {
                path: '/tween/useTween.html',
                title: 'Use Tween'
            },
            {
                path: '/tween/portal.html',
                title: 'Portal'
            }
        ]
    },
    {
        category: 'renderer',
        title: 'Renderer',
        pages: [
            {
                path: '/render/useRenderTarget.html',
                title: 'Use Renderer Target'
            },
            {
                path: '/render/scissorTest.html',
                title: 'Use Scissor Test'
            },
            {
                path: '/render/renderDeepPeeling.html',
                title: 'Use Render DeepPeeling'
            },
            {
                path: '/render/renderWBOIT.html',
                title: 'Use Render WBOIT'
            }
        ]
    },
    {
        category: 'composer',
        title: 'Composer',
        pages: [
            {
                path: '/composer/useOITRenderPass.html',
                title: 'Use OITRenderPass'
            },
        ]
    },
    {
        category: 'controls',
        title: 'Controls',
        pages: [
            {
                path: '/controls/useOrbitControls.html',
                title: 'Use OrbitControls'
            },
            {
                path: '/controls/useFirstPersonControls.html',
                title: 'Use FirstPersonControls'
            },
            {
                path: '/controls/useArcBallControls.html',
                title: 'Use ArcBallControls'
            },
            {
                path: '/controls/useTrackballControls.html',
                title: 'Use TrackballControls'
            },
            {
                path: '/controls/usePointerLockControls.html',
                title: 'Use PointerLockControls'
            }
        ]
    },
    {
        category: 'camera',
        title: 'Camera',
        pages: [
            {
                path: '/camera/orthographic.html',
                title: 'Orthographic'
            },
            {
                path: '/camera/layer.html',
                title: 'Layer'
            },
        ]
    }
]

export { list }