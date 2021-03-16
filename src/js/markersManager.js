import * as BABYLON from 'babylonjs';
import Marker from './marker.js';

const MarkersManager = (function () {

  let markerAnimationGroup;
  let markerAnimations;
  let markerMaterials;

  /**
   * Constructor function
   * @param {BabylonBox} babylonBox - BabylonBox instance
   */
  function MarkersManager(babylonBox) {
    this._babylonBox = babylonBox;

    this.markers = [];
    this.activeMarker = null;

    this._initMaterials();
    this._initAnimations();
  }

  /**
   * Creates programmatically all marker materials (for active and inactive)
   * @private
   */
  MarkersManager.prototype._initMaterials = function () {
    markerMaterials = {
      inactive: {
        opacity: 0.8,
        color: new BABYLON.Color3(1, 0, 0)
      },
      active: {
        color: new BABYLON.Color3(0, 0, 1)
      }
    }
    for (const state in markerMaterials) {
      const material = new BABYLON.StandardMaterial('material_for_' + state + '_markers', this._babylonBox.scene);
      material.disableLighting = true;
      material.emissiveColor = markerMaterials[state].color;
      markerMaterials[state].material = material;
    }
    markerMaterials.inactive.material.alpha = markerMaterials.inactive.opacity;
  }

  /**
   * Creates programmatically all marker animations (scale, fade)
   * @private
   */
  MarkersManager.prototype._initAnimations = function () {
    markerAnimations = {
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
            value: markerMaterials.inactive.opacity
          },
          {
            frame: 10,
            value: 0
          }
        ]
      }
    }
    for (const state in markerAnimations) {
      const animation = markerAnimations[state];
      animation.obj = new BABYLON.Animation(animation.transform + ' marker', animation.transform, 10, BABYLON.Animation['ANIMATIONTYPE_' + animation.valueType], BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      animation.obj.setKeys(animation.keys);
    }
    markerAnimationGroup = new BABYLON.AnimationGroup("animation_group_for_markers", this._babylonBox.scene);
  }

  /**
   * Creates marker and add it to markers list
   * @param {Object} options - Config object for marker
   */
  MarkersManager.prototype.addMarker = function (options) {
    const marker = new Marker(options);
    marker.arrayPosition = this.markers.length;
    this.markers.push(marker);
    this._drawMarker(marker);
    return marker;
  }

  /**
   * Removes marker
   * @param {Marker} marker - Marker to remove
   */
  MarkersManager.prototype.removeMarker = function (marker) {
    this.markers.splice(marker.arrayPosition, 1);
    marker.remove();
  }

  /**
   * Draws marker
   * @private
   * @param {Marker} marker - Marker to draw
   */
  MarkersManager.prototype._drawMarker = function (marker) {
    marker.draw(this._babylonBox.model, this._babylonBox.scene);
    marker.colorize(markerMaterials.inactive.material);
    this._animateMarker(marker);
  }

  /**
   * Animates marker with scale and fade
   * @param {Marker} marker - Marker to animate (must be drawed before)
   */
  MarkersManager.prototype._animateMarker = function (marker) {
    markerAnimationGroup.addTargetedAnimation(markerAnimations.scale.obj, marker.pulse);
    markerAnimationGroup.addTargetedAnimation(markerAnimations.fade.obj, marker.pulse);
    markerAnimationGroup.normalize(0, 12);
    markerAnimationGroup.play(true);
  }

  /**
   * Sets marker active
   * @param {Marker} marker - Marker that should be active
   */
  MarkersManager.prototype.setMarkerActive = function (marker) {
    if (this.activeMarker) {
      this._changeOpticalState(false, this.activeMarker);
    }
    this.activeMarker = marker;
    this._changeOpticalState(true, this.activeMarker);
  }

  /**
   * Changes the optical appearance
   * @param {boolean} isNewStateActive - Indicates whether the marker should have an active look
   * @param {Marker} marker - Marker that should change look
   */
  MarkersManager.prototype._changeOpticalState = function (isNewStateActive, marker) {
      pulse.isVisible = !isNewStateActive ? 1 : 0;
      const state = !isNewStateActive ? 'inactive' : 'active';
      marker.colorize(markerMaterials[state].material);
  }

  return MarkersManager;

})();

export default MarkersManager;
