import * as BABYLON from 'babylonjs';
import WebXRPolyfill from 'webxr-polyfill';
import WebVRPolyfill from 'webvr-polyfill';
import AnnotationsManager from './annotationsManager.js';

const xrPolyfill = new WebXRPolyfill();
const vrPolyfill = new WebVRPolyfill();

H5P.BabylonBox = (function ($) {

  /**
   * Constructor function
   * @extends H5P.EventDispatcher
   * @param {Object} options - Config object for BabylonBox
   * @param {string} id - ID of BabylonBox instance
   */
  function BabylonBox(options, id) {
    H5P.EventDispatcher.call(this);
    this.id = id;
    this.options = $.extend({
      modelUrl: null,
      annotations: []
    }, options);
    this.webXRSupported = false;
    this.inWebXRExperience = false;
  }

  // extends H5P.EventDispatcher
  BabylonBox.prototype = Object.create(H5P.EventDispatcher.prototype);
  BabylonBox.prototype.constructor = BabylonBox;

  /**
   * Creates canvas and append it to container
   * @param {jQuery} $container - Canvas container
   */
  BabylonBox.prototype.attach = async function ($container) {
    this.$canvas = $('<canvas class="renderCanvas" />');
    this.$canvas.appendTo($container);
    this.engine = new BABYLON.Engine(this.$canvas[0], true);
    this._createScene();
    // this._initModelRotation();

    this.webXRSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
    if (this.webXRSupported) {
      console.log('check - WebXR supported');
      this.trigger('webXRSupported');
    }

    this._annotationsManager = new AnnotationsManager(this);
    for (const annotationOptions of this.options.annotations) {
      this._annotationsManager.addAnnotation(annotationOptions);
    }

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    H5P.$window.on('resize', () => {
      this.engine.resize();
    });

    this.$canvas.dblclick(() => {
      const picked = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
      if (picked && picked.pickedMesh && picked.pickedMesh.isPickable && picked.pickedMesh.id === 'model') {
        this.trigger('dblClick', {
          position: picked.pickedPoint,
          normalRef: picked.getNormal(true, true)
        });
      }
    });
  }

  /**
   * Stops rendering of frames
   */
  BabylonBox.prototype.stopRendering = function () {
    this.engine.stopRenderLoop();
  }

  /**
   * Creates Babylon.js scene with model, camera and light
   * @private
   */
  BabylonBox.prototype._createScene = function () {
    this.scene = new BABYLON.Scene(this.engine);
    // create cube
    this.model = BABYLON.MeshBuilder.CreateBox('model', {});
    // create camera
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new BABYLON.Vector3(0, 0, 0)
    );
    this.camera.attachControl(this.canvas, true);
    // create light
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(1, 1, 0)
    );
  }

  /**
   * Initiates rotation of model
   * @private
   */
  BabylonBox._initModelRotation = function () {
    const frameRate = 15;
    const rotation = new BABYLON.Animation(
      'modelRotation',
      'rotation.y',
      1, // 1 frame per second
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE // looped animation
    )
    rotation.setKeys([
      {frame: 0, value: 0},
      {frame: frameRate, value: 2 * Math.PI}
    ]);
    this.model.animations.push(rotation);
    // begin model rotation
    this.scene.beginAnimation(this.model, 0, frameRate, true);
  }

  /**
   * Adds new annotation to model
   * @param {Object} - Config object for annotation
   * @return {Annotation} - New created annotation
   */
  BabylonBox.prototype.addAnnotation = function (options) {
    if (this._annotationsManager) {
      return this._annotationsManager.addAnnotation(options);
    }
  }

  /**
   * Removes annotation from model
   * @param {Annotation} - Annotation to remove
   */
  BabylonBox.prototype.removeAnnotation = function (annotation) {
    this._annotationsManager.removeAnnotation(annotation);
  }

  /**
   * Gets all created annotations
   * @return {Annotation[]} - Array of all annotations
   */
  BabylonBox.prototype.getAnnotations = function () {
    if (this._annotationsManager) {
      return this._annotationsManager.annotations;
    }
    return this.options.annotations;
  }

  /**
   * Starts the WebXR Experience if WebXR is supported
   */
  BabylonBox.prototype.startWebXRExperience = async function () {
    if (!this.webXRSupported) {
      alert('WebXR is not supported');
      return;
    }
    const canvas = this.$canvas[0];
    if (!this._xrHelper) {
      this._xrHelper = await BABYLON.WebXRExperienceHelper.CreateAsync(this.scene);
      canvas.onfullscreenchange = async () => {
        if (document.fullscreenElement === canvas) {
          // enter fullscreen
          this.engine.resize();
        }
        else {
          // leave fullscreen
          this.exitWebXRExperience();
        }
      }
      this._xrHelper.onStateChangedObservable.add(async (state) => {
          switch (state) {
            case BABYLON.WebXRState.IN_XR:
              // XR is initialized and already submitted one frame
              break;
            case BABYLON.WebXRState.ENTERING_XR:
              // xr is being initialized, enter XR request was made
              // $('body').addClass('in-vr-mode');
              break;
            case BABYLON.WebXRState.EXITING_XR:
              // xr exit request was made. not yet done.
              break;
            case BABYLON.WebXRState.NOT_IN_XR:
              // either our or not yet in XR
              if (document.fullscreenElement === canvas) {
                document.exitFullscreen();
              }
              // $('body').removeClass('in-vr-mode');
              console.log('not in xr mode');
              break;
          }
      });
    }

    $('body').keydown((event) => {
      if (event.key === 'Escape') {
        this.exitWebXRExperience();
      }
    });

    await this._xrHelper.enterXRAsync('immersive-vr', 'local-floor');
    // canvas.requestFullscreen();
  }

  /**
   * Exits WebXR Experience
   */
  BabylonBox.prototype.exitWebXRExperience = async function () {
    if (this._xrHelper) {
      await this._xrHelper.exitXRAsync();
    }
  }

  return BabylonBox;

})(H5P.jQuery);

export default H5P.BabylonBox;
