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
      active: {
        color: new BABYLON.Color3(0, 0, 1)
      }
    }
    for (const state in annotationMaterials) {
      const material = new BABYLON.StandardMaterial('material_for_' + state + '_annotations', this._babylonBox.scene);
      material.disableLighting = true;
      material.emissiveColor = annotationMaterials[state].color;
      annotationMaterials[state].material = material;
    }
    annotationMaterials.inactive.material.alpha = annotationMaterials.inactive.opacity;
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
      const animation = annotationAnimations[state];
      animation.obj = new BABYLON.Animation(animation.transform + ' annotation', animation.transform, 10, BABYLON.Animation['ANIMATIONTYPE_' + animation.valueType], BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      animation.obj.setKeys(animation.keys);
    }
    annotationAnimationGroup = new BABYLON.AnimationGroup("animation_group_for_annotations", this._babylonBox.scene);
  }

  /**
   * Creates annotation and add it to annotations list
   * @param {Object} options - Config object for annotation
   */
  AnnotationsManager.prototype.addAnnotation = function (options) {
    const annotation = new Annotation(options);
    annotation.arrayPosition = this.annotations.length;
    this.annotations.push(annotation);
    this._drawAnnotation(annotation);
    return annotation;
  }

  /**
   * Removes annotation
   * @param {Annotation} annotation - Annotation to remove
   */
  AnnotationsManager.prototype.removeAnnotation = function (annotation) {
    this.annotations.splice(annotation.arrayPosition, 1);
    annotation.remove();
  }

  /**
   * Draws annotation
   * @private
   * @param {Annotation} annotation - Annotation to draw
   */
  AnnotationsManager.prototype._drawAnnotation = function (annotation) {
    annotation.draw(this._babylonBox.model, this._babylonBox.scene);
    annotation.colorize(annotationMaterials.inactive.material);
    this._animateAnnotation(annotation);
  }

  /**
   * Animates annotation with scale and fade
   * @param {Annotation} annotation - Annotation to animate (must be drawed before)
   */
  AnnotationsManager.prototype._animateAnnotation = function (annotation) {
    annotationAnimationGroup.addTargetedAnimation(annotationAnimations.scale.obj, annotation.pulse);
    annotationAnimationGroup.addTargetedAnimation(annotationAnimations.fade.obj, annotation.pulse);
    annotationAnimationGroup.normalize(0, 12);
    annotationAnimationGroup.play(true);
  }

  /**
   * Sets annotation active
   * @param {Annotation} annotation - Annotation that should be active
   */
  AnnotationsManager.prototype.setAnnotationActive = function (annotation) {
    if (this.activeAnnotation) {
      this._changeOpticalState(false, this.activeAnnotation);
    }
    this.activeAnnotation = annotation;
    this._changeOpticalState(true, this.activeAnnotation);
  }

  /**
   * Changes the optical appearance
   * @param {boolean} isNewStateActive - Indicates whether the annotation should have an active look
   * @param {Annotation} annotation - Annotation that should change look
   */
  AnnotationsManager.prototype._changeOpticalState = function (isNewStateActive, annotation) {
      pulse.isVisible = !isNewStateActive ? 1 : 0;
      const state = !isNewStateActive ? 'inactive' : 'active';
      annotation.colorize(annotationMaterials[state].material);
  }

  return AnnotationsManager;

})();

export default AnnotationsManager;
