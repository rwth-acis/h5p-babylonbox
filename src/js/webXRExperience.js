import { WebXRSessionManager, WebXRExperienceHelper, WebXRState } from 'babylonjs';
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
  return await WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
}

/**
 * Starts WebXR experience
 */
WebXRExperience.prototype.start = async function () {
  if (!this.isSupported()) {
    throw 'WebXR is not supported';
  }

  if (!this._xrHelper) {
    this._xrHelper = await WebXRExperienceHelper.CreateAsync(this._scene);
    this._observeStates();
  }

  this._keydownHandler = () => {
    if (event.key === 'Escape') {
      this.exit();
    }
  }

  document.body.addEventListener('keydown', this._keydownHandler);
  await this._xrHelper.enterXRAsync('immersive-vr', 'local-floor');

  if (d4t) {
    d4t.incr('inWebXR')
  }
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
        case WebXRState.IN_XR:
          // XR is initialized and already submitted one frame
          this.inWebXR = true;
          break;
        case WebXRState.ENTERING_XR:
          // xr is being initialized, enter XR request was made
          break;
        case WebXRState.EXITING_XR:
          // xr exit request was made. not yet done.
          break;
        case WebXRState.NOT_IN_XR:
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

export default WebXRExperience;
