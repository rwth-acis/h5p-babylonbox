import * as BABYLON from 'babylonjs';

const Annotation = (function () {

  const diameter = 0.05;

  /**
   * Constructor function
   * @extends H5P.EventDispatcher
   * @param {Object} - Config object for annotation
   */
  function Annotation(options) {
    H5P.EventDispatcher.call(this);

    this.id = options.id;
    this._options = options;
    this.content = options.content;
  }

  Annotation.prototype = Object.create(H5P.EventDispatcher.prototype);
  Annotation.prototype.constructor = Annotation;

  /**
   * Draws annotation on canvas
   * @param {BABYLON.Mesh} model - model where annotation should attach to
   * @param {BABYLON.Scene} scene - Scene of the model
   */
  Annotation.prototype.draw = function (model, scene) {
    const drawing = BABYLON.MeshBuilder.CreateSphere(
      'annotation_' + this.id,
      { diameter },
      scene
    );
    const pulse = BABYLON.MeshBuilder.CreateSphere(
      'pulse_of_annotation_' + this.id,
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
          this.trigger('annotationClicked', this);
        }
      )
    );
    this.drawing = drawing;
    this.pulse = pulse;
  }

  /**
   * Colorize annotation
   * @param {BABYLON.StandardMaterial} - Material for annotation
   */
  Annotation.prototype.colorize = function (material) {
    this.drawing.material = material.clone();
    this.pulse.material = material.clone();
  }

  /**
   * Remove annotation
   */
  Annotation.prototype.remove = function () {
    this.drawing.dispose();
    this.pulse.dispose();
    delete this;
  }

  return Annotation;

})();

export default Annotation;
