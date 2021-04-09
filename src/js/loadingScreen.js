// Implements interface ILoadingScreen from Babylon.js

const LoadingScreen = (function ($) {

  /**
   * Constructor function
   * @param {jQuery} $container - Container of the rendering canvas
   */
  function LoadingScreen($container) {
    this.$el = $(`<div class="h5p-babylonbox--loading-screen">
      <div class="container">
        <div class="text">0%</div>
        <div class="progress-bar">
          <div class="inner"></div>
        </div>
      </div>
    </div>`).appendTo($container).hide();
    this._$canvas = $container.find('canvas');
    this.percent = 0;
  }

  /**
   * Displays loading screen
   */
  LoadingScreen.prototype.displayLoadingUI = function () {
    this._$canvas.css('filter', 'blur(10px)');
    this.$el.show();
  }

  /**
   * Hides loading screen
   */
  LoadingScreen.prototype.hideLoadingUI = function () {
    this.$el.animate({ opacity: 0 }, 500);
    setTimeout(() => {
      this._$canvas.css('filter', 'blur(0)');
      this.$el.detach();
      delete this;
    }, 500);

  }

  /**
   * Handles onProgress event from BABYLON.SceneLoader.ImportMesh and update percentage
   * @param {Event} event
   */
  LoadingScreen.prototype.getProgressHandlerFunction = function () {
    return (event) => {
      if (event.lengthComputable) {
        this.percent = (event.loaded * 100 / event.total).toFixed();
      } else {
        const dlCount = event.loaded / (1024 * 1024);
        this.percent = Math.floor(dlCount * 100.0) / 100.0;
      }
      this.$el.find('.text').html(this.percent + '%');
      this.$el.find('.progress-bar .inner').css('width', this.percent + '%');
    }
  }

  return LoadingScreen;

  })(H5P.jQuery);

export default LoadingScreen;
