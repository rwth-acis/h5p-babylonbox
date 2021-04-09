import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

/**
 * Constructor function
 * @param {BABYLON.Scene} scene
 */
function Model(scene) {
  this._scene = scene;
}

/**
 * Imports the model async in the scene
 * @param {string} url - URL of the model
 * @param {function} onProgressHandler - Handler for updating the import progress
 */
Model.prototype.importAsync = async function (url, onProgressHandler) {
  const splittedUrl = url.split('/');
  const fileName = splittedUrl.pop();
  const path = splittedUrl.join('/') + '/';
  
  const imported = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    path,
    fileName,
    this._scene,
    onProgressHandler
  );
  this.env = imported.meshes[0];
  this.meshes = this.env.getChildMeshes();
  this.meshesIds = this.meshes.map((mesh) => { return mesh.id; });
}

export default Model;
