import * as BABYLON from 'babylonjs';

/**
 * Constructor function
 * @param {string} name - Name of the Babylon.js camera
 * @param {Object} canvas - Canvas that is used for rendering
 * @param {BABYLON.Scene} scene
 */
function Camera(name, canvas, scene) {
  this.babylon = new BABYLON.ArcRotateCamera(
    name,
    -Math.PI / 2,
    Math.PI / 2.5,
    20,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  this.babylon.attachControl(canvas, true);
  this.babylon.setTarget(new BABYLON.Vector3(0, 0, 0));
}

/**
 * Starts auto rotation of camera
 * @param {number} speed - Speed of rotation
 */
Camera.prototype.startAutoRotation = function (speed) {
  if (!this._autoRotation) {
    this._autoRotation = new BABYLON.AutoRotationBehavior();
  }
  this._autoRotation.idleRotationSpeed = speed || 0.3;
  this._autoRotation.attach(this.babylon);
}

/**
 * Sets Babylon.js framing behavior
 */
Camera.prototype.setFramingBehavior = function () {
  if (!this._framing) {
    this._framing = new BABYLON.FramingBehavior();
    this._framing.radiusScale = 20;
  }
  this._framing.attach(this.babylon);
}

export default Camera;
