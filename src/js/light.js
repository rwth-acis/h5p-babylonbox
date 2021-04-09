import * as BABYLON from 'babylonjs';

/**
 * Constructor function
 * @param {BABYLON.Scene} scene
 */
function Light(scene) {
  this.babylon = new BABYLON.HemisphericLight(
    'light',
    new BABYLON.Vector3(1, 1, 0),
    scene
  );
}

export default Light;
