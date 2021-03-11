import * as BABYLON from 'babylonjs';

const Marker = (function () {

  const diameter = 0.05;

  function Marker(options) {
    H5P.EventDispatcher.call(this);

    this.id = options.id;
    this._options = options;
    this.content = options.content;
  }

  Marker.prototype = Object.create(H5P.EventDispatcher.prototype);
  Marker.prototype.constructor = Marker;

  Marker.prototype.draw = function (model, scene) {
    const drawing = BABYLON.MeshBuilder.CreateSphere(
      'marker_' + this.id,
      { diameter },
      scene
    );
    const pulse = BABYLON.MeshBuilder.CreateSphere(
      'pulse_of_marker_' + this.id,
      { diameter },
      scene
    );
    pulse.parent = drawing;
    drawing.parent = model;
    drawing.position = new BABYLON.Vector3(
      this._options.position.x,
      this._options.position.y,
      this._options.position.z
    );
    drawing.translate(
      new BABYLON.Vector3(
        this._options.normalRef.x,
        this._options.normalRef.y,
        this._options.normalRef.z
      ),
      diameter / 2,
      BABYLON.Space.WORLD
    );
    pulse.actionManager = new BABYLON.ActionManager(scene);
    pulse.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger, () => {
          this.trigger('markerClicked', this);
        }
      )
    );
    this.drawing = drawing;
    this.pulse = pulse;
  }

  Marker.prototype.colorize = function (material) {
    this.drawing.material = material.clone();
    this.pulse.material = material.clone();
  }

  Marker.prototype.remove = function () {
    this.drawing.dispose();
    this.pulse.dispose();
    delete this;
  }

  return Marker;

})();

export default Marker;