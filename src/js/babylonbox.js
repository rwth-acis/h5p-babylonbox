import { Engine, Scene } from 'babylonjs';
import 'pepjs';
import AnnotationsManager from './annotationsManager.js';
import Camera from './camera.js';
import Light from './light.js';
import Model from './model.js';
import LoadingScreen from './loadingScreen.js';
import WebXRExperience from './webXRExperience.js';
import GUILabel from './guiLabel.js';

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
      modelUrl: 'http://models.babylonjs.com/CornellBox/cornellBox.glb',
      annotations: []
    }, options);
    this.webXRSupported = false;
  }

  // extends H5P.EventDispatcher
  BabylonBox.prototype = Object.create(H5P.EventDispatcher.prototype);
  BabylonBox.prototype.constructor = BabylonBox;

  /**
   * Creates canvas and append it to container
   * @param {jQuery} $container - Canvas container
   */
  BabylonBox.prototype.attach = async function ($wrapper) {
    this._$container = $(`<div class="h5p-babylonbox"></div>`).appendTo($wrapper);

    this.$canvas = $(`<canvas
      class="h5p-babylonbox--canvas"
      touch-action="none"
    />`);
    this.$canvas.appendTo(this._$container);

    await this._createBabylonScene();

    // Check WebXR support
    this.webXR = new WebXRExperience(this.$canvas[0], this.scene);
    const webXRSupported = await this.webXR.isSupported();
    if (webXRSupported) {
      console.log('WebXR is supported in your browser');
      this.trigger('WebXR supported');
    }

    this._annotationsManager = new AnnotationsManager(this);
    for (const annotationOptions of this.options.annotations) {
      this.addAnnotation(annotationOptions);
    }

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    H5P.$window.on('resize', () => {
      this.engine.resize();
    });

    this.$canvas.dblclick(() => {
      const picked = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
      if (
        picked &&
        picked.pickedMesh &&
        picked.pickedMesh.isPickable &&
        this.model.meshesIds.includes(picked.pickedMesh.id)
      ) {
        this.trigger('dblClick', {
          position: picked.pickedPoint,
          normalRef: picked.getNormal(true, true)
        });
      }
    });

    setTimeout(() => {
      this.trigger('ready');
    }, 500);
  }

  /**
   * Stops rendering of frames
   */
  BabylonBox.prototype.stopRendering = function () {
    this.engine.stopRenderLoop();
  }

  /**
   * Creates Babylon.js scene with loading screen, model, camera and light
   * @private
   */
  BabylonBox.prototype._createBabylonScene = async function () {
    this.engine = new Engine(this.$canvas[0], true);
    this.scene = new Scene(this.engine);

    // Create and show loading screen
    this.engine.loadingScreen = new LoadingScreen(this._$container);
    this.engine.displayLoadingUI();

    // Import model from url
    this.model = new Model(this.scene);
    await this.model.importAsync(
      this.options.modelUrl,
      this.engine.loadingScreen.getProgressHandlerFunction()
    );

    this.engine.hideLoadingUI();

    // Create camera
    this.camera = new Camera('camera', this.$canvas[0], this.scene);

    // Create light
    this.light = new Light(this.scene);
  }

  /**
   * Adds new annotation to model
   * @param {Object} - Config object for annotation
   * @return {Annotation} - New created annotation
   */
  BabylonBox.prototype.addAnnotation = function (options) {
    if (this._annotationsManager) {
      const annotation = this._annotationsManager.addAnnotation(options);
      annotation.on('picked', ({ data }) => {
        this.trigger('annotation picked', data);
      });
      annotation.on('pointerover', ({ data }) => {
        this.trigger('annotation pointerover', data);
      });
      annotation.on('pointerout', ({ data }) => {
        this.trigger('annotation pointerout', data);
      });
      return annotation;
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
   * Gets the index of the annotation
   * @param {Annotation} annotation - Annotation for which the index is to be determined
   * @return {number} - Index of annotation, returns -1 if annotation not exists
   */
  BabylonBox.prototype.getIndexOfAnnotation = function (annotation) {
    return this.getAnnotations().indexOf(annotation);
  }

  /**
   * Sets optical state of annotation
   * @param {string} state - State of the annotation (inactive, active, hover)
   * @param {Annotation} annotation - Annotation that should have the state
   */
   BabylonBox.prototype.setAnnotationState = function (state, annotation) {
     this._annotationsManager.setAnnotationState(state, annotation);
   }

   /**
    * Makes all annotations visible
    */
   BabylonBox.prototype.showAllAnnotations = function () {
     for (const annotation of this.getAnnotations()) {
       this.setAnnotationState('inactive', annotation);
       annotation.show();
     }
   }

   /**
    * Hides all annotations
    */
   BabylonBox.prototype.hideAllAnnotations = function () {
     for (const annotation of this.getAnnotations()) {
       annotation.hide();
     }
   }

  /**
   * Starts the WebXR Experience if WebXR is supported
   */
  BabylonBox.prototype.startWebXRExperience = async function () {
    const webXRSupported = await this.webXR.isSupported();
    if (!webXRSupported) {
      alert('WebXR is not supported');
      return;
    }
    if (!this.guiLabel) {
      this.guiLabel = GUILabel(this.scene);
    }
    this.webXR.start();
  }

  /**
   * Exits WebXR Experience
   */
  BabylonBox.prototype.exitWebXRExperience = async function () {
    if (this.guiLabel) {
      this.guiLabel.hide();
    }
    this.showAllAnnotations();
    this.webXR.exit();
  }

  return BabylonBox;

})(H5P.jQuery);

export default H5P.BabylonBox;
