import { ArrowHelper, Group, Vector3 } from 'three';
class CoordinateHelper extends Group {
  constructor(colors = { x: 'red', y: 'green', z: 'blue' }, axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    super();
    this.colors = colors;
    this.axesLength = axesLength;
    this.arrowsLength = arrowsLength;
    this.arrowsWidth = arrowsWidth;
    this.type = 'CoordinateHelper';
    const pos = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const origin = new Vector3();
    ['x', 'y', 'z'].forEach(key => {
      const arrow = new ArrowHelper(new Vector3(...pos[key]), origin, axesLength, colors[key], arrowsLength, arrowsWidth);
      arrow.renderOrder = Infinity;
      this.add(arrow);
    })
  }

  setLength(axesLength = 10,arrowsLength = 1,arrowsWidth = arrowsLength * 0.5){
    this.traverse(child=>{
      child.setLength(axesLength,arrowsLength,arrowsWidth)
    })
  }

  dispose(){
    this.traverse((child)=>{
      child.dispose()
    })
  }
}

export {CoordinateHelper}