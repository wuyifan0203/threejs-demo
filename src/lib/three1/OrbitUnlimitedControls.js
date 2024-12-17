// OrbitUnlimitedControls, a camera controller for THREE.js that addresses some limitations of
// some other, widely used controllers:
// https://threejs.org/docs/#examples/en/controls/OrbitControls
// https://threejs.org/docs/#examples/en/controls/TrackballControls
//
// For looking around a scene, OrbitControls is a common choice.  But it has a limit on the
// rotation that can be achieved by moving the mouse vertically: the camera cannot go "over the
// north pole" or "under the south pole."
//
// TrackballControls does not have this limitation.  Yet it suffers from "twist" around the viewing
// axis, which gradually accumulates over the course of interaction and makes it difficult to
// return to an original orientation.  It also does not emit a "change" event on each camera
// movement, so updating the rendering to reflect the camera movement requires the use of
// Window.requestAnimationFrame().
//
// OrbitUnlimitedControls is free of these limitations.  It is meant to implement the API of
// OrbitControls (or at least the most important parts of that API), so it can be used as a simple
// replacement for that controller.

import * as THREE from './three.module.js';

// The states of the simple finite state machine for the trackballs interaction.
// The 'INDETERMINATE' state is for when the mouse is down but it has not yet moved
// far enough to know if it is a drag operation (for rotation) or just a click.

const State = Object.freeze({
  INACTIVE: Symbol('INACTIVE'),
  INDETERMINATE: Symbol('INDETERMINATE'),
  ROTATING: Symbol('ROTATING'),
  DOLLYING: Symbol('DOLLYING'),
  PANNING: Symbol('PANNING'),
});

const ClickThreshold = 2;

class OrbitUnlimitedControls extends THREE.EventDispatcher {
  constructor(object, domElement) {
    super();
    this.object = object;
    this.domElement = domElement;

    //

    // Public API that mirrors THREE.OrbitControls

    this.keyPanSpeed = 7;
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, };
    this.maxDistance = Infinity;
    this.minDistance = 0;
    this.rotateSpeed = 1;
    this.target = new THREE.Vector3();
    this.zoomSpeed = 1;

    // New public API

    // The standard 'click' event is sent by this.domElement for any 'mousedown'
    // followed by 'mouseup'.  But a more useful definition of a 'click' is when
    // the cursor moves less than ClickThreshold pixels between the 'mousedown'
    // and the 'mouseup'.  In that case, this.clicked will be true.
    this.clicked = false;

    // Specifies modifier keys to make a left-button mouse drag perform camera panning.
    // On an Apple keyboard, "alt" is "option", "ctrl" is "control", and "meta" is "command".
    this.usePanModAlt = true;
    this.usePanModShift = false;
    this.usePanModCtrl = false;
    this.usePanModMeta = false;

    //

    this.state = State.INACTIVE;

    this.changeEvent = { type: 'change' };

    this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    this.domElement.addEventListener('wheel', this.onMouseWheel, false);

    this.domElement.addEventListener('keydown', this.onKeyDown, false);

    if (this.domElement.tabIndex === -1) {
      // Must be set for 'keydown' to be received.
      this.domElement.tabIndex = 0;
    }

    // Used by reset().
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();

    this.update();
  }

  reset = () => {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.update();
  }

  update = () => {
    this.object.lookAt(this.target);
    if (this.state !== State.ROTATING) {
      this.fixUp();
    }
    this.dispatchEvent(this.changeEvent);
  }

  onMouseDown = (event) => {
    this.state = State.INDETERMINATE;
    this.prev = new THREE.Vector2(event.clientX, event.clientY);

    event.preventDefault();
    // Manually set the focus, because preventDefault() prevents automatic setting.
    if (this.domElement.focus) {
      this.domElement.focus();
    } else {
      window.focus();
    }

    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mouseup', this.onMouseUp, false);

    this.domElement.addEventListener('contextmenu', this.onContextMenu, false);
  }

  onMouseWheel = (event) => {
    event.preventDefault();

    this.state = State.DOLLYING;
    this.prev = new THREE.Vector2(0, 0);
    this.dolly(0, -event.deltaY);
  }

  onMouseMove = (event) => {
    event.preventDefault();

    switch (event.buttons) {
      case 1:
        if (this.eventHasPanModifier(event)) {
          this.pan(event.clientX, event.clientY);
        } else {
          this.rotate(event.clientX, event.clientY);
        }
        break;
      case 2:
        this.pan(event.clientX, event.clientY);
        break;
      case 4:
        this.dolly(event.clientX, event.clientY);
        break;
      default:
        break;
    }
  }

  onMouseUp = () => {
    if (this.state === State.ROTATING) {
      // At the end of the dragging operation, recompute this.camera.up so it is orthogonal
      // to the vector from this.camera.position to this.target.
      this.fixUp();
    }
    this.clicked = (this.state === State.INDETERMINATE);
    this.state = State.INACTIVE;

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
  }

  onKeyDown = (event) => {
    let doPan = false;
    let x;
    let y;

    switch (event.keyCode) {
      case this.keys.UP:
        doPan = true;
        [x, y] = [0, this.keyPanSpeed];
        break;
      case this.keys.DOWN:
        doPan = true;
        [x, y] = [0, -this.keyPanSpeed];
        break;
      case this.keys.LEFT:
        doPan = true;
        [x, y] = [this.keyPanSpeed, 0];
        break;
      case this.keys.RIGHT:
        doPan = true;
        [x, y] = [-this.keyPanSpeed, 0];
        break;
      default:
        break;
    }

    if (doPan) {
      event.preventDefault();
      this.state = State.PANNING;

      this.prev = new THREE.Vector2(0, 0);
      this.pan(x, y);
    }
  }

  onContextMenu = (event) => {
    // Prevent the context menu from appearing when the secondary button is clicked,
    // since that button is used for panning.
    event.preventDefault();
  }

  eventHasPanModifier = (event) => (
    (event.shiftKey && this.usePanModShift) ||
    (event.altKey && this.usePanModAlt) ||
    (event.ctrlKey && this.usePanModCtrl) ||
    (event.metaKey && this.usePanModMeta)
  )

  rotate = (x, y) => {
    const curr = new THREE.Vector2(x, y);
    if (this.state === State.INDETERMINATE) {
      const distance = curr.manhattanDistanceTo(this.prev);
      if (distance > ClickThreshold) {
        this.state = State.ROTATING;

        // When the mouse has moved far enough that we know the user is not just clicking,
        // prepare to convert each subsequent mouse motion into camera rotation using
        // spherical coordinates.  We use spherical coordinates to compute the new, rotated
        // position of the camera as if the camera started in a default orientation,
        // positioned on the positive Z axis looking towards the origin.  Then we map the
        // rotated position to the camera's true configuration.  The orientation part of that
        // mapping is a "basis matrix", which repositions a point expressed relative to the
        // standard X, Y an Z axes to a new point where the axes have changed as follows:
        // - the Z axis has become the (normalized) vector from this.target to this.object.position
        // - the Y axis has become this.object.up
        // - the X axis has become the (normalized) cross product of the other two axes
        // The remaining part of the mapping translates the origin to the location of
        // this.target.

        const zAxis = new THREE.Vector3().subVectors(this.object.position, this.target);
        this.radius = zAxis.length();
        zAxis.divideScalar(this.radius);
        const yAxis = this.object.up;
        const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
        this.basisMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
        const tr = new THREE.Matrix4().makeTranslation(this.target.x, this.target.y, this.target.z);
        this.basisMatrix.premultiply(tr);
      }
    }
    if (this.state === State.ROTATING) {
      // Compute the new, rotated position of the camera based on spherical coordinates.  Use the
      // "physics (ISO convention)" version of spherical coordinates described here, but with the
      // axes spun, to make their X become our Z, their Y become our X and their Z become our Y.
      // Based on the following approach, using spherical coordinates:
      // https://en.wikipedia.org/wiki/Spherical_coordinate_system
      // The algorithm combines details of these two approaches:
      // 1. Livingston et al.:
      // http://www.cs.unc.edu/~livingst/navigate.html
      // 2. Rohner:
      // https://andreasrohner.at/posts/Web%20Development/JavaScript/Simple-orbital-camera-controls-for-THREE-js/

      // Like Livingston et al., use spherical coordinates as if the camera is in a default
      // orientation, positioned on the positive Z axis looking towards the origin, and then use
      // a basis matrix to map the result according to the camera's true configuration.  With this
      // approach, the inclination (theta) and azimuth (phi) are computed directly from the the
      // amount the mouse has moved since the initial location on the 'mousedown' event.  Note that
      // the inclination starts at pi/2, not 0.  Note also that Livingtson et al. swap the meanings
      // of phi and theta.
      const delta = new THREE.Vector2().subVectors(curr, this.prev);

      const speed = 2.0 * this.rotateSpeed;
      delta.multiplyScalar(speed);

      const phi = -delta.x * (Math.PI / this.domElement.clientWidth);
      let theta = -delta.y * (Math.PI / this.domElement.clientHeight) + Math.PI / 2;

      // Prevent the inclination from getting too close to 0 or pi.  In either of those case,
      // spherical coordinates stop working, due to "gimbal lock".
      const eps = 0.01;
      theta = Math.max(theta, eps);
      theta = Math.min(theta, Math.PI - eps);

      // Given the inclination and azimuth determined by the latest mouse position, compute the
      // new position of the camera using spherical coordinates.  Both Livingston et al. and Rohner
      // do a version of this computation, but Rohner's is easier to understand.  Note that Rohner
      // has the camera looking down the X axis initially, with Z being the initial "up".  We follow
      // the more standard convention of having the camera look down the Z axis, with Y being "up".
      // So Rohner's X is our Z, Y is our X, Rohner's Z is our Y.
      const pos = new THREE.Vector3();
      pos.z = this.radius * Math.sin(theta) * Math.cos(phi);
      pos.x = this.radius * Math.sin(theta) * Math.sin(phi);
      pos.y = this.radius * Math.cos(theta);

      // Finally, use the basis matrix to update the new camera position to account for the actual
      // configuration of the camera as of the "mousedown" event.
      pos.applyMatrix4(this.basisMatrix);
      this.object.position.copy(pos);

      // Then use a "lookAt" matrix to further update the camera to point at this.target.
      // As Rohner points out, "lookAt" requires this.object.up, but as long as the elevation
      // does not go to 0 or pi, the this.object.up as of the 'mousedown' event will work.
      // Also, trigger rendering based on the updated camera.  But do not call this.fixup(),
      // as doing so will result in twisting about the view axis.  Call this.fixup() only
      // when dragging is done
      this.update();
    }
  }

  dolly = (x, y) => {
    const curr = new THREE.Vector2(x, y);
    if (this.state === State.INDETERMINATE) {
      const distance = curr.manhattanDistanceTo(this.prev);
      if (distance > ClickThreshold) {
        this.state = State.DOLLYING;
      }
    }

    if (this.state === State.DOLLYING) {
      // "Dollying" (giving a "zooming" effect by moving the position of the camera, instead of by
      // changing the field of view) involves finding a new position along the vector from the
      // camera to the target.
      const toTarget = new THREE.Vector3().subVectors(this.target, this.object.position);
      const distToTarget = toTarget.length();

      // The maximum distance the camera can move on a single mouse drag is determined by
      // this.maxDistance and this.minDistance, with a cap.
      const distLimit = 2 * distToTarget;
      const distForFullDrag = Math.min(this.maxDistance - this.minDistance, distLimit);

      // Use that maximum distance, with the height of the DOM element being the maximum
      // number of pixels moved in a mouse drag, to get a scaling factor.
      const heightPx = this.domElement.clientHeight;
      const pxToWorld = distForFullDrag / heightPx;

      // Adjust this factor by the zoomSpeed from the public API and convert the latest mouse move
      // to a distance for moving the camera.
      const speed = this.zoomSpeed * pxToWorld;
      const deltaY = this.prev.y - y;
      const delta = speed * deltaY;

      // Apply the scaling factor to convert the pixels in the latest mouse move to a world
      // distance.
      if ((this.minDistance <= distToTarget + delta)
        && (distToTarget + delta <= this.maxDistance)) {
        const deltaToTarget = toTarget.multiplyScalar(delta / distToTarget);
        this.object.position.sub(deltaToTarget);

        this.update();
        this.prev = curr;
      }
    }
  }

  pan = (x, y) => {
    const curr = new THREE.Vector2(x, y);
    if (this.state === State.INDETERMINATE) {
      const distance = curr.manhattanDistanceTo(this.prev);
      if (distance > ClickThreshold) {
        this.state = State.PANNING;
      }
    }

    if (this.state === State.PANNING) {
      // Panning moves the position of the camera in the plane whose normal is the viewing vector,
      // the vector from the current camera position to the target.  So treat that vector as the
      // Z axis, and find the corresponding X and Y axes.
      const zAxis = new THREE.Vector3().subVectors(this.target, this.object.position);
      const distToTarget = zAxis.length();
      zAxis.divideScalar(distToTarget);
      const yAxis = this.object.up.clone();
      const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();

      // The maximum distance the camera can move (along these X and Y axes) on a single mouse drag
      // is the distance that would move the target point outside the viewing frustum.  To compute
      // that maximum distance, think of the frustum as two right triangles sharing the viewing
      // vector as one side; that maximum distance is twice the side opposite the corner where the
      // camera is located.  At that corner, the angle of each triangle is half this.object.fov,
      // and the rest follows from basic trigonometry.
      const halfHeightWorld = Math.tan((this.object.fov / 2) * (Math.PI / 360)) * distToTarget;

      // Use that maximum distance, with the height of the DOM element being the maximum
      // number of pixels moved in a mouse drag, to get a scaling factor.
      const halfHeightPx = this.domElement.clientHeight / 2;
      const pxToWorld = halfHeightWorld / halfHeightPx;

      // Apply the scaling factor to convert the pixels in the latest mouse move to a world
      // distance.
      const delta = new THREE.Vector2().subVectors(curr, this.prev);
      const deltaX = xAxis.multiplyScalar(delta.x * pxToWorld);
      const deltaY = yAxis.multiplyScalar(delta.y * pxToWorld);
      this.object.position.add(deltaX);
      this.object.position.add(deltaY);

      // Note that when panning, the target moves along with the camera, staying offset by the
      // same viewing vector that was in use at the start of the mouse movement.
      const toTarget = zAxis.multiplyScalar(distToTarget);
      const target = new THREE.Vector3().addVectors(this.object.position, toTarget);
      this.target = target;

      this.update();
      this.prev = curr;
    }
  }

  fixUp = () => {
    // The current this.object.up may be almost aligned with this "view" vector.
    const view = new THREE.Vector3().subVectors(this.target, this.object.position).normalize();

    // So first find the vector off to the side, orthogonal to both this.object.up and
    // the "view" vector.
    const side = new THREE.Vector3().crossVectors(view, this.object.up).normalize();

    // Then find the vector orthogonal to both this "side" vector and the "view" vector.
    // This vector will be the new "up" vector.
    const up = new THREE.Vector3().crossVectors(side, view).normalize();
    this.object.up.copy(up);
  }
}

export { OrbitUnlimitedControls };
