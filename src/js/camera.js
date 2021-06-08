import { ArcRotateCamera, Vector3, AutoRotationBehavior, FramingBehavior } from 'babylonjs';

/**
 * Constructor function
 * @param {string} name - Name of the Babylon.js camera
 * @param {Object} canvas - Canvas that is used for rendering
 * @param {BABYLON.Scene} scene
 */
function Camera(name, canvas, scene) {

  this.autoRotationEnabled = false;

  // Get world dimensions
  // from https://github.com/Kompakkt/Viewer/blob/master/src/app/services/babylon/camera-handler.ts

  const worldExtends = scene.getWorldExtends();
  const worldSize = worldExtends.max.subtract(worldExtends.min);
  const worldCenter = worldExtends.min.add(worldSize.scale(0.5));

  let radius = worldSize.length() * 1.5;
  // empty scene scenario
  if (!isFinite(radius)) {
    radius = 1;
    worldCenter.copyFromFloats(0, 0, 0);
  }

  this.babylonObj = new ArcRotateCamera(
    name,
    -(Math.PI / 2),
    Math.PI / 2.5,
    radius,
    worldCenter,
    scene
  );
  this.babylonObj.lowerRadiusLimit = radius * 0.01;

  this.babylonObj.minZ = radius * 0.01;
  this.babylonObj.maxZ = radius * 1000;
  this.babylonObj.speed = radius * 0.2;

  this.babylonObj.attachControl(canvas, true);
  this.babylonObj.setTarget(new Vector3(0, 0, 0));
  this.babylonObj.allowUpsideDown = false;
}

/**
 * Starts auto rotation of camera
 * @param {number} speed - Speed of rotation
 */
Camera.prototype.startAutoRotation = function (speed) {
  if (this.autoRotationEnabled) {
    return;
  }
  this.pauseAutoRotation();
  this._autoRotation = new AutoRotationBehavior();
  this._autoRotation.idleRotationSpeed = speed || 0.15;
  this._autoRotation.attach(this.babylonObj);
  this._autoRotation.init();
  this.autoRotationEnabled = true;
}

/**
 * Pauses auto rotation of camera
 */
Camera.prototype.pauseAutoRotation = function () {
  if (this._autoRotation) {
    this._autoRotation.detach();
    delete this._autoRotation;
    this.autoRotationEnabled = false;
  }
}

/**
 * Sets Babylon.js framing behavior
 */
Camera.prototype.setFramingBehavior = function () {
  if (!this._framing) {
    this._framing = new FramingBehavior();
    this._framing.radiusScale = 20;
  }
  this._framing.attach(this.babylonObj);
}

export default Camera;
