class ScaleplateHelper{
    constructor(camera,container){
        this.camera = camera;
        this.container = container;
        this.vertical = document.createElement('canvas');
        this.horizontal = document.createElement('canvas');
        this.visible = true;
        this.container.append(this.horizontal,this.vertical);
    }

    update(){
        this.container
    }

    setView(){

    }

    set visible(val){
        this.horizontal.style.display = this.vertical.style.display = val ? 'block' : 'none'
    }

    get visible(){
        return this.visible;
    }

    dispose(){
        this.container.removeChild(this.horizontal,this.vertical);
        this.horizontal = this.vertical =  this.container = this.camera = null;
    }
}

export {ScaleplateHelper}