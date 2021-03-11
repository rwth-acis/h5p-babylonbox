import * as BABYLON from 'babylonjs';
import MarkersManager from './markersManager.js';

H5P.BabylonBox = (function ($) {

  function BabylonBox(options, id) {
    H5P.EventDispatcher.call(this);
    this.id = id;
    this.options = $.extend({
      file: null,
      markers: []
    }, options);
  }

  BabylonBox.prototype = Object.create(H5P.EventDispatcher.prototype);
  BabylonBox.prototype.constructor = BabylonBox;

  BabylonBox.prototype.attach = function ($container) {
    this.$canvas = $('<canvas class="renderCanvas" />');
    this.$canvas.appendTo($container);
    this.engine = new BABYLON.Engine(this.$canvas[0], true);
    this._createScene();
    // this._initModelRotation();

    this._markersManager = new MarkersManager(this);
    for (const markerOptions of this.options.markers) {
      this._markersManager.addMarker(markerOptions);
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

  BabylonBox.prototype.stopRendering = function () {
    this.engine.stopRenderLoop();
  }

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

  BabylonBox.prototype.addMarker = function (options) {
    if (this._markersManager) {
      return this._markersManager.addMarker(options);
    }
  }

  BabylonBox.prototype.removeMarker = function (marker) {
    this._markersManager.removeMarker(marker);
  }

  BabylonBox.prototype.getMarkers = function() {
    if (this._markersManager) {
      return this._markersManager.markers;
    }
    return this.options.markers;
  }

  return BabylonBox;

})(H5P.jQuery);
