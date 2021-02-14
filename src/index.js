import * as BABYLON from 'babylonjs';
import Markers from './markers.js';

H5P.BabylonBox = (function ($) {

  function BabylonBox(options, id) {
    this.id = id;

    this.attach = ($container) => {
      this.canvas = $('<canvas class="renderCanvas" />').appendTo($container)[0];
      this.engine = new BABYLON.Engine(this.canvas, true);
      createScene();
      // this.initModelRotation();
      this.markers = new Markers(this);
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
      H5P.$window.on('resize', () => {
        this.engine.resize();
      });
    }

    const createScene = () => {
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

    this.initModelRotation = () => {
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

  }

  return BabylonBox;

})(H5P.jQuery);
