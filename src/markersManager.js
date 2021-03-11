import * as BABYLON from 'babylonjs';
import Marker from './marker.js';

const MarkersManager = (function () {

  let markerAnimationGroup;
  let markerAnimations;
  let markerMaterials;

  function MarkersManager(babylonBox) {
    this._babylonBox = babylonBox;

    this.markers = [];
    this.activeMarker = null;

    this._initMaterials();
    this._initAnimations();
  }

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

  MarkersManager.prototype.addMarker = function (options) {
    const marker = new Marker(options);
    marker.arrayPosition = this.markers.length;
    this.markers.push(marker);
    this._drawMarker(marker);
    return marker;
  }

  MarkersManager.prototype.removeMarker = function (marker) {
    this.markers.splice(marker.arrayPosition, 1);
    marker.remove();
  }

  MarkersManager.prototype._drawMarker = function (marker) {
    marker.draw(this._babylonBox.model, this._babylonBox.scene);
    marker.colorize(markerMaterials.inactive.material);
    this._animateMarker(marker);
  }

  MarkersManager.prototype._animateMarker = function (marker) {
    markerAnimationGroup.addTargetedAnimation(markerAnimations.scale.obj, marker.pulse);
    markerAnimationGroup.addTargetedAnimation(markerAnimations.fade.obj, marker.pulse);
    markerAnimationGroup.normalize(0, 12);
    markerAnimationGroup.play(true);
  }

  MarkersManager.prototype.setMarkerActive = function (marker) {
    if (this.activeMarker) {
      this._changeOpticalState(false, this.activeMarker.drawing, this.activeMarker.pulse);
    }
    this.activeMarker = marker;
    this._changeOpticalState(true, his.activeMarker.drawing, his.activeMarker.pulse);
  }

  MarkersManager.prototype._changeOpticalState = function (isNewStateActive, drawing, pulse) {
      pulse.isVisible = !isNewStateActive ? 1 : 0;
      const state = !isNewStateActive ? 'inactive' : 'active';
      marker.colorize(markerMaterials[state].material);
  }

  return MarkersManager;

})();

export default MarkersManager;
