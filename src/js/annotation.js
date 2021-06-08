import { MeshBuilder, Vector3, Space, ActionManager, ExecuteCodeAction } from 'babylonjs';

const Annotation = (function () {

  const DIAMETER = 0.15;

  /**
   * Constructor function
   * @extends H5P.EventDispatcher
   * @param {Object} - Config object for annotation
   */
  function Annotation(options) {
    H5P.EventDispatcher.call(this);
    Object.assign(this, options);
  }

  Annotation.prototype = Object.create(H5P.EventDispatcher.prototype);
  Annotation.prototype.constructor = Annotation;

  /**
   * Draws annotation on canvas
   * @param {BABYLON.Mesh} model - model where annotation should attach to
   * @param {BABYLON.Scene} scene - Scene of the model
   */
  Annotation.prototype.draw = function (scene) {
    const drawing = MeshBuilder.CreateSphere(
      'annotation_' + this.id,
      { diameter: DIAMETER },
      scene
    );
    const pulse = MeshBuilder.CreateSphere(
      'pulse_of_annotation_' + this.id,
      { diameter: DIAMETER },
      scene
    );
    pulse.parent = drawing;
    drawing.position = new Vector3(
      this.position.x,
      this.position.y,
      this.position.z
    );
    drawing.translate(
      new Vector3(
        this.normalRef.x,
        this.normalRef.y,
        this.normalRef.z
      ),
      DIAMETER / 2,
      Space.WORLD
    );
    pulse.actionManager = new ActionManager(scene);
    // register click trigger
    pulse.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPickTrigger, () => {
          this.trigger('picked', this);
        }
      )
    );
    // register pointer over trigger
    pulse.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger, () => {
          this.trigger('pointerover', this);
        }
      )
    );
    // register pointer out trigger
    pulse.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOutTrigger, () => {
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

  Annotation.prototype.show = function () {
    this.drawing.isVisible = true;
    this.pulse.isVisible = true;
  }

  Annotation.prototype.hide = function () {
    this.drawing.isVisible = false;
    this.pulse.isVisible = false;
  }

  return Annotation;

})();

export default Annotation;
