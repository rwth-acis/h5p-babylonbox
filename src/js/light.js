import { HemisphericLight, Vector3 } from 'babylonjs';

/**
 * Constructor function
 * @param {BABYLON.Scene} scene
 */
function Light(scene) {
  this.babylonObj = new HemisphericLight(
    'light',
    new Vector3(1, 1, 0),
    scene
  );
}

export default Light;
