/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-13 15:31:21
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-13 15:41:44
 * @FilePath: /threejs-demo/bin/cleanPage.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
( function () {
	/* Remove start screen (or press some button ) */
    // may be i do not need this
	const button = document.getElementById( 'startButton' );
	if ( button ) button.click();
	/* Remove gui and fonts */
	const style = document.createElement( 'style' );
	style.type = 'text/css';
	style.innerHTML = '#info, button, input, body > div.lil-gui, body > div.lbl { display: none !important; }';
	document.querySelector( 'head' ).appendChild( style );
	/* Remove Stats.js */
	for ( const element of document.querySelectorAll( 'div' ) ) {
		if ( getComputedStyle( element ).zIndex === '10000' ) {
			element.remove();
			break;
		}
	}
}() );