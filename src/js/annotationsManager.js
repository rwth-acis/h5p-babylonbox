import * as BABYLON from 'babylonjs';
import Annotation from './annotation.js';

const AnnotationsManager = (function () {

  let annotationAnimationGroup;
  let annotationAnimations;
  let annotationMaterials;

  /**
   * Constructor function
   * @param {BabylonBox} babylonBox - BabylonBox instance
   */
  function AnnotationsManager(babylonBox) {
    this._babylonBox = babylonBox;

    this.annotations = [];
    this.activeAnnotation = null;

    this._initMaterials();
    this._initAnimations();
  }

  /**
   * Creates programmatically all annotation materials (for active and inactive)
   * @private
   */
  AnnotationsManager.prototype._initMaterials = function () {
    annotationMaterials = {
      inactive: {
        opacity: 0.8,
        color: new BABYLON.Color3(1, 0, 0)
      },
      hover: {
        opacity: 1,
        color: new BABYLON.Color3(1, 0, 0)
      },
      active: {
        color: new BABYLON.Color3(0, 0, 1)
      }
    }
    for (const state in annotationMaterials) {
      const configObj = annotationMaterials[state];
      const material = new BABYLON.StandardMaterial(
        'material for ' + state + ' annotations',
        this._babylonBox.scene
      );
      material.disableLighting = true;

      if (configObj.color) {
        material.emissiveColor = configObj.color;
      }
      if (configObj.opacity) {
        material.alpha = configObj.opacity;
      }

      configObj.material = material;
    }
  }

  /**
   * Creates programmatically all annotation animations (scale, fade)
   * @private
   */
  AnnotationsManager.prototype._initAnimations = function () {
    annotationAnimations = {
      scale: {
        transform: 'scaling',
        valueType: 'VECTOR3',
        keys: [
          {
            frame: 0,
            value: new BABYLON.Vector3(1, 1, 1)
          },
          {
            frame: 10,
            value: new BABYLON.Vector3(3, 3, 3)
          }
        ]
      },
      fade: {
        transform: 'material.alpha',
        valueType: 'FLOAT',
        keys: [
          {
            frame: 0,
            value: annotationMaterials.inactive.opacity
          },
          {
            frame: 10,
            value: 0
          }
        ]
      }
    }
    for (const state in annotationAnimations) {
      const configObj = annotationAnimations[state];
      configObj.obj = new BABYLON.Animation(
        state + ' annotation',
        configObj.transform,
        10,
        BABYLON.Animation['ANIMATIONTYPE_' + configObj.valueType],
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      configObj.obj.setKeys(configObj.keys);
    }
    annotationAnimationGroup = new BABYLON.AnimationGroup(
      "animation group for annotations",
      this._babylonBox.scene
    );
  }

  /**
   * Creates annotation and add it to annotations list
   * @param {Object} options - Config object for annotation
   */
  AnnotationsManager.prototype.addAnnotation = function (options) {
    const annotation = new Annotation(options);
    this.annotations.push(annotation);
    this._drawAnnotation(annotation);
    return annotation;
  }

  /**
   * Removes annotation
   * @param {Annotation} annotation - Annotation to remove
   */
  AnnotationsManager.prototype.removeAnnotation = function (annotation) {
    const arrayPosition = this.annotations.indexOf(annotation);
    if (arrayPosition >= 0) {
      this.annotations.splice(arrayPosition, 1);
      annotation.remove();
    }
  }

  /**
   * Draws annotation
   * @private
   * @param {Annotation} annotation - Annotation to draw
   */
  AnnotationsManager.prototype._drawAnnotation = function (annotation) {
    annotation.draw(this._babylonBox.scene);
    annotation.colorize(annotationMaterials.inactive.material);
    this._animateAnnotation(annotation);
  }

  /**
   * Animates annotation with scale and fade
   * @param {Annotation} annotation - Annotation to animate (must be drawed before)
   */
  AnnotationsManager.prototype._animateAnnotation = function (annotation) {
    annotationAnimationGroup.addTargetedAnimation(
      annotationAnimations.scale.obj,
      annotation.pulse
    );
    annotationAnimationGroup.addTargetedAnimation(
      annotationAnimations.fade.obj,
      annotation.pulse
    );
    annotationAnimationGroup.normalize(0, 12);
    annotationAnimationGroup.play(true);
  }

  /**
   * Sets optical state of annotation
   * @param {string} state - State of the annotation (inactive, active, hover)
   * @param {Annotation} annotation - Annotation that should have the state
   */
   AnnotationsManager.prototype.setAnnotationState = function (state, annotation) {
     switch (state) {
       case 'active': this._setAnnotationActive(annotation); break;
       case 'hover': this._changeOpticalState('hover', true, annotation); break;
       default: this._changeOpticalState('inactive', true, annotation);
     }
   }

  /**
   * Sets annotation active
   * @private
   * @param {Annotation} annotation - Annotation that should be active
   */
  AnnotationsManager.prototype._setAnnotationActive = function (annotation) {
    if (this.activeAnnotation) {
      this._changeOpticalState('inactive', true, this.activeAnnotation);
    }
    this.activeAnnotation = annotation;
    this._changeOpticalState('active', false, this.activeAnnotation);
  }

  /**
   * Changes the optical appearance
   * @private
   * @param {string} state - State of the annotation
   * @param {boolean} hasPulse - Indicates whether the pulse should be shown
   * @param {Annotation} annotation - Annotation that should change look
   */
  AnnotationsManager.prototype._changeOpticalState = function (state, hasPulse, annotation) {
      annotation.pulse.isVisible = hasPulse;
      annotation.colorize(annotationMaterials[state].material);
  }

  return AnnotationsManager;

})();

export default AnnotationsManager;
