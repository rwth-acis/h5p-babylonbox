import * as BABYLON from 'babylonjs';

const Annotation = (function () {

  const DIAMETER = 0.05;

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
  Annotation.prototype.draw = function (scene) {
    const drawing = BABYLON.MeshBuilder.CreateSphere(
      'annotation_' + this.id,
      { DIAMETER },
      scene
    );
    const pulse = BABYLON.MeshBuilder.CreateSphere(
      'pulse_of_annotation_' + this.id,
      { DIAMETER },
      scene
    );
    pulse.parent = drawing;
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
      DIAMETER / 2,
      BABYLON.Space.WORLD
    );
    pulse.actionManager = new BABYLON.ActionManager(scene);
    // register click trigger
    pulse.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger, () => {
          this.trigger('picked', this);
        }
      )
    );
    // register pointer over trigger
    pulse.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger, () => {
          this.trigger('pointerover', this);
        }
      )
    );
    // register pointer out trigger
    pulse.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger, () => {
          this.trigger('pointerout', this);
        }
      )
    );
    this.drawing = drawing;
    this.pulse = pulse;
  }

  /**
   * Set material of annotation
   * @param {BABYLON.StandardMaterial} - Material for annotation
   */
  Annotation.prototype.setMaterial = function (material) {
    this.drawing.material = material.clone();
    this.pulse.material = material.clone();
  }

  /**
   * Changes material of annotation
   * @param {string} key - Key for material object
   * @param {any} value - Value of material change
   */
  Annotation.prototype.changeMaterial = function (key, value) {
    this.drawing.material[key] = value;
    this.pulse.material[key] = value;
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
