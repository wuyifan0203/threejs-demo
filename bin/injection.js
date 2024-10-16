/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-13 19:19:20
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-16 17:16:12
 * @FilePath: \threejs-demo\bin\injection.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
(function () {

    // 代理random
    /* Deterministic random */
    window.Math._random = window.Math.random;
    let seed = Math.PI / 4;

    window.Math.random = function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

  
    /* Deterministic timer */
    window.performance._now = performance.now;

      //代理performance
    let frameId = 0;
    const now = () => frameId * 16;
    window.Date.now = now;
    window.Date.prototype.getTime = now;
    window.performance.now = now;

    /* Deterministic RAF */
    const RAF = window.requestAnimationFrame;
    window._renderStarted = false;
    window._renderFinished = false;

    const maxFrameId = 2;
    window.requestAnimationFrame = function (cb) {
        if (!window._renderStarted) {
            setTimeout(function () {
                requestAnimationFrame(cb);
            }, 50);
        } else {
            RAF(function () {
                if (frameId++ < maxFrameId) {
                    cb(now());
                } else {
                    window._renderFinished = true;
                }
            });
        }
    };

    /* Semi-determitistic video */
    const play = HTMLVideoElement.prototype.play;

    HTMLVideoElement.prototype.play = async function () {
        play.call(this);
        this.addEventListener('timeupdate', () => this.pause());
        function renew() {
            this.load();
            play.call(this);
            RAF(renew);
        }
        RAF(renew);
    };

}());
