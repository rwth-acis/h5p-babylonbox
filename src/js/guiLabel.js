import { GUI } from 'babylonjs';

/**
 * Constructor function
 * @param {BABYLON.Scene} scene
 */
function GUILabel(scene) {
  const boxConfig = {
    height: '50px',
    verticalAlignment: GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
    cornerRadius: 10,
    color: 'white',
    background: 'rgba(0, 0, 0, 0.4)',
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingBottom: '10px',
    thickness: 0
  }
  this.babylonObj = GUI.AdvancedTexture.CreateFullscreenUI('ui', true, scene);
  const box = new GUI.Rectangle();
  for (const prop in boxConfig) {
    box[prop] = boxConfig[prop];
  }
  this.babylonObj.addControl(box);
  this.label = new GUI.TextBlock();
  this.label.fontSize = 20;
  box.addControl(this.label);
}

/**
 * Shows GUI label
 * @params {string} labelText - Text to place in label
 */
GUILabel.prototype.show = function (labelText) {
  this.label.text = labelText;
  this.babylonObj.isVisible = true;
}

/**
 * Hides GUI label
 */
GUILabel.prototype.hide = function () {
  this.babylonObj.isVisible = false;
}

export default GUILabel;
