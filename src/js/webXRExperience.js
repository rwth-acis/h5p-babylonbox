import * as BABYLON from 'babylonjs';
import WebXRPolyfill from 'webxr-polyfill';

/**
 * Constructor function
 * @param {Object} canvas - Canvas which is used for rendering
 * @param {BABYLON.Scene} scene
 */
function WebXRExperience(canvas, scene) {
    if (!navigator.xr) {
      new WebXRPolyfill();
    }
    this._canvas = canvas;
    this._scene = scene;
    this.inWebXR = false;
    this.inFullscreen = false;
}

/**
 * Returns whether WebXR is supported or not
 * @return {boolean} - True if WebXR is supported
 */
WebXRExperience.prototype.isSupported = async function () {
  return await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
}

/**
 * Starts WebXR experience
 */
WebXRExperience.prototype.start = async function () {
  if (!this.isSupported()) {
    throw 'WebXR is not supported';
  }

  if (!this._xrHelper) {
    this._xrHelper = await BABYLON.WebXRExperienceHelper.CreateAsync(this._scene);
    this._observeStates();
  }

  this._keydownHandler = () => {
    if (event.key === 'Escape') {
      this.exit();
    }
  }

  document.body.addEventListener('keydown', this._keydownHandler);
  await this._xrHelper.enterXRAsync('immersive-vr', 'local-floor');
}

/**
 * Ends WebXR experience
 */
WebXRExperience.prototype.exit = async function () {
  if (!this.inWebXR || !this._xrHelper) {
    return;
  }
  await this._xrHelper.exitXRAsync();
}

/**
 * Observes when WebXR is entered or leaved
 * @private
 */
WebXRExperience.prototype._observeStates = function () {
  this._xrHelper.onStateChangedObservable.add((state) => {
      switch (state) {
        case BABYLON.WebXRState.IN_XR:
          // XR is initialized and already submitted one frame
          this.inWebXR = true;
          break;
        case BABYLON.WebXRState.ENTERING_XR:
          // xr is being initialized, enter XR request was made
          break;
        case BABYLON.WebXRState.EXITING_XR:
          // xr exit request was made. not yet done.
          break;
        case BABYLON.WebXRState.NOT_IN_XR:
          // either our or not yet in XR
          this.exitFullscreen();
          document.removeEventListener('keydown', this._keydownHandler);
          this.inWebXR = false;
          break;
      }
  });
}

/**
 * Opens WebXR experience in fullscreen mode
 */
WebXRExperience.prototype.enterFullscreen = function () {
  this._fullscreenchangeHandler = () => {
    if (document.fullscreenElement === this._canvas) {
      // enter fullscreen
    }
    else {
      // exit fullscreen
      this.exit();
    }
  }

  this._canvas.addEventListener(
    'fullscreenchange',
    this._fullscreenchangeHandler
  );
  this._canvas.requestFullscreen();
  this.inFullscreen = true;
}

/**
 * Closes WebXR experience in fullscreen mode
 */
WebXRExperience.prototype.exitFullscreen = function () {
  if (!this.inFullscreen || document.fullscreenElement !== this._canvas) {
    return;
  }
  this._canvas.removeEventListener(
    'fullscreenchange',
    this._fullscreenchangeHandler
  );
  document.exitFullscreen();
  this.inFullscreen = false;
}

/*
Annotation GUI in WebXR (is shown when annotation was clicked)
var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui");
var box = new BABYLON.GUI.Rectangle();
box.height = "50px";
box.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
box.cornerRadius = 10;
box.color = "white";
box.background = "rgba(0, 0, 0, 0.4)";
box.paddingLeft = "10px";
box.paddingRight = "10px";
box.paddingBottom = "10px";
box.thickness = 0;
advancedTexture.addControl(box);

var label = new BABYLON.GUI.TextBlock();
label.text = "Nervenbahnen";
label.fontSize = 20;
box.addControl(label);

box.isVisible = false;
*/

export default WebXRExperience;
