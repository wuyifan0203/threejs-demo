import { ViewHelperBase } from "./ViewHelper";

class ViewHelper extends ViewHelperBase{
    constructor(camera,dom){
        super(camera,dom)

        const viewHelperDom = document.createElement('div');
        viewHelperDom.setAttribute('id','viewHelper');

        const style = {
            position:'absolute',
            right:'0px',
            bottom:'0px',
            height:'128px',
            width:'128px'
        }
        Object.assign(viewHelperDom.style,style);
        dom.append(viewHelperDom);

        viewHelperDom.addEventListener( 'pointerup', ( event ) => {

			event.stopPropagation();

			this.handleClick( event );

		} );

		viewHelperDom.addEventListener( 'pointerdown', function ( event ) {

			event.stopPropagation();

		} );

    }
}

export {ViewHelper}