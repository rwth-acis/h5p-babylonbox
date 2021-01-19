import * as BABYLON from 'babylonjs';

const Markers = (function ($) {

    function Markers(babylon) {
      const diameter = 0.05;
      const markerColors = {
        active: new BABYLON.Color3(0, 0, 1),
        inactive: new BABYLON.Color3(1, 0, 0)
      }
      const opacityOfInactiveMarker = 0.8;

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

      // create fading animation of marker pulse
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

      const markersAnimation = new BABYLON.AnimationGroup("animation_group_for_markers");

      this.markers = [];
      this.activeMarker = null;

      const markerMaterials = {
        inactive: new BABYLON.StandardMaterial('material_for_markers', babylon.scene),
        active: new BABYLON.StandardMaterial('material_for_active_markers', babylon.scene)
      }
      for (const state in markerMaterials) {
        const material = markerMaterials[state];
        material.disableLighting = true;
        material.emissiveColor = markerColors[state];
      }
      markerMaterials['inactive'].alpha = opacityOfInactiveMarker;

      this.bulkCreate = (markers) => {
        for (marker of markers) {
          this.new(marker)
        }
      }

      this.create = (marker) => {
        marker.arrayPosition = this.markers.length
        this.markers.push(marker);
        this.drawMarker(marker);
      }

      this.drawMarker = (marker) => {
        const drawing = BABYLON.MeshBuilder.CreateSphere('marker_' + marker.id, { diameter }, babylon.scene);
        const pulse = BABYLON.MeshBuilder.CreateSphere('pulse_of_marker_' + marker.id, { diameter }, babylon.scene);
        pulse.parent = drawing;
        drawing.parent = babylon.model;
        drawing.material = markerMaterials['inactive'].clone();
        pulse.material = markerMaterials['inactive'].clone();
        drawing.position = new BABYLON.Vector3(...marker.picked.ref);
        drawing.translate(new BABYLON.Vector3(...marker.picked.refNormal), diameter/2 , BABYLON.Space.WORLD);
        pulse.actionManager = new BABYLON.ActionManager(babylon.scene);
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

      this.setActiveMarker = (marker) => {
        if (this.activeMarker) {
          this.changeOpticalState(false, this.activeMarker.drawing);
        }
        this.activeMarker = marker;
        this.changeOpticalState(true, this.activeMarker.drawing);
      }

      this.changeOpticalState = (isNewStateActive, drawing) => {
        if (!isNewStateActive) {
          drawing.pulse.isVisible = 1;
          drawing.drawed.main.material = this.markerMaterials['inactive'].clone();
          return;
        }
        drawing.pulse.isVisible = 0;
        drawing.main.material = this.markerMaterial['active'].clone();
      }

   }
   return Markers;

})(H5P.jQuery);

export default Markers;
