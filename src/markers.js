import * as BABYLON from 'babylonjs';

const diameter = 0.05;
const opacityOfInactiveMarker = 0.8;

const markerColors = {
  active: new BABYLON.Color3(0, 0, 1),
  inactive: new BABYLON.Color3(1, 0, 0)
}

// create scaling animation of marker pulse
const scale = new BABYLON.Animation('scaleMarker', 'scaling', 10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
const scale_keys = [
  {
    frame: 0,
    value: new BABYLON.Vector3(1, 1, 1)
  },
  {
    frame: 10,
    value: new BABYLON.Vector3(3, 3, 3)
  }
];
scale.setKeys(scale_keys);

const fade = new BABYLON.Animation('fadeMarker', 'material.alpha', 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
const fade_keys = [
  {
    frame: 0,
    value: opacityOfInactiveMarker
  },
  {
    frame: 10,
    value: 0
  }
];
fade.setKeys(fade_keys);

let markersAnimation;

function Markers(babylon) {
  this._babylon = babylon;

  this.markers = [];
  this.activeMarker = null;

  const markerMaterials = {
    inactive: new BABYLON.StandardMaterial('material_for_markers', this._babylon.scene),
    active: new BABYLON.StandardMaterial('material_for_active_markers', this._babylon.scene)
  }

  for (const state in markerMaterials) {
    const material = markerMaterials[state];
    material.disableLighting = true;
    material.emissiveColor = markerColors[state];
  }

  markerMaterials['inactive'].alpha = opacityOfInactiveMarker;

  markersAnimation = new BABYLON.AnimationGroup("animation_group_for_markers", this._babylon.scene);
}

Markers.prototype.bulkCreate = function (markers) {
  for (marker of markers) {
    this.create(marker);
  }
}

Markers.prototype.create = function (marker) {
  marker.arrayPosition = this.markers.length;
  this.markers.push(marker);
  this.drawMarker(marker);
}

Markers.prototype.drawMarker = function (marker) {
  const drawing = BABYLON.MeshBuilder.CreateSphere('marker_' + marker.id, { diameter }, this._babylon.scene);
  const pulse = BABYLON.MeshBuilder.CreateSphere('pulse_of_marker_' + marker.id, { diameter }, this._babylon.scene);

  pulse.parent = drawing;
  drawing.parent = this._babylon.model;
  drawing.material = markerMaterials['inactive'].clone();
  pulse.material = markerMaterials['inactive'].clone();
  drawing.position = new BABYLON.Vector3(...marker.picked.ref);
  drawing.translate(new BABYLON.Vector3(...marker.picked.refNormal), diameter/2 , BABYLON.Space.WORLD);
  pulse.actionManager = new BABYLON.ActionManager(this._babylon.scene);
  pulse.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      this.trigger({
        type: 'markerClicked',
        marker
      });
    })
  );
  markersAnimation.addTargetedAnimation(scale, pulse);
  markersAnimation.addTargetedAnimation(fade, pulse);
  markersAnimation.normalize(0, 12);
  markersAnimation.play(true);
  marker.drawing = {
    main: drawing,
    pulse: pulse
  }

}

Markers.prototype.setMarkerActive = function (marker) {
  if (this.activeMarker) {
    this.changeOpticalState(false, this.activeMarker.drawing);
  }
  this.activeMarker = marker;
  this.changeOpticalState(true, this.activeMarker.drawing);
}

Markers.prototype.changeOpticalState = function (isNewStateActive, drawing) {
    drawing.pulse.isVisible = !isNewStateActive ? 1 : 0;
    const state = !isNewStateActive ? 'inactive' : 'active';
    drawing.main.material = this.markerMaterials[state].clone();
}

export default Markers;
