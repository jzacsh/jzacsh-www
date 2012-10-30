/**
 * @fileoverview Custom AngularJS Services and Directives.
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */
var jzacsh = jzacsh || {};
jzacsh.services = jzacsh.services || {};
jzacsh.directives = jzacsh.directives || {};

/**
 * Fetch imagedex.json data on Slides to be displayed from CDN.
 *
 * @para {Object} $resource
 *   AngularJS' injected ngResource.
 */
jzacsh.services.Slides = function($window, $http, $resource) {
  var imagedexUrl = 'http://art-cdn.jzacsh.com/imagedex.json';

  $http.defaults.useXDomain = true;
  $window.drawings = function(data) {
    // @TODO STUB! correct way to do this?
    //   not wrapped in function call: http://art-cdn.jzacsh.com/imagedex_plain.json
    //   CORS is enabled on this server!
    $window.jonDrawings = data;
  };
  return $http.jsonp(imagedexUrl);
};

/**
 * Shared "lock" state to determine if user should be able to scroll on the
 * page.
 */
jzacsh.services.LockScroll = function() {
  /**
   * @type {boolean} current "lock" state of the page's scroll.
   */
  var lockScroll = false;

  return {
    set: function(lock) {
      lockScroll = !!lock;
    },
    get: function() {
      return !!lockScroll;
    }
  };
};

/**
 * Display a {jzacsh.imagedex.Slide} slide object as a lightbox, specifically
 * catered to the needs of this jzacsh.com gallery.
 *
 * @return {Object}
 *   Factory method to build directive.
 */
jzacsh.directives.zacshBox = function($window, LockScroll) {
  return {
    restrict: 'E',

    scope: {
      // Slide to be displayed in the lightbox. False if nothing should be
      // displayed.
      // @type {jzacsh.imagedex.Slide}
      zacshSlide: '='
    },

    templateUrl: '/static/html/zacsh-box.html',

    link: function(scope, elm, attr, ctrl) {
      scope.lightboxBuilt = false;

      /**
       * @param {Object} clickTarget
       *   The target property of the click {@link Event}.
       * @return {boolean}
       *   If [clickedNode] is somewhere within this directive's tools.
       */
      var targetIsLightbox = function(clickTarget) {
        var clickedNode = angular.element(clickTarget)[0];
        return clickedNode === document.getElementById('current');
      };

      /**
       * Event handler for CLICK and KEYUP events on document.body. Will try to
       * let user out when it seems they're trying to escape.
       *
       * @param {Object} event
       *   The raw DOM event that occured.
       */
      var userTryingToEscape = function(event) {
        // User click elsewhere (on the glass on our lightbox).
        var clickedOnLightbox = (event.type == 'click' && targetIsLightbox(event.target));
        if (!clickedOnLightbox && event.type == 'keyup' && (event.keyCode == 27 || event.char == 'esc')) {
          // User hit "ESCAPE" key
          clickedOnLightbox = true;
        }

        // Only react if user is trying to escape and we're actually visible
        if (scope.lightboxBuilt && clickedOnLightbox) {
          toggleLightbox(false /* close */);
          scope.$apply();
        }
      };

      // $window coordinates of poor user before i started futzing
      scope.coords_ = { x: 0, y: 0 };

      /**
       * @param {boolean} lightbox
       *   If lightbox should be on or off.
       */
      var toggleLightbox = function(lightbox) {
        lightbox = !!lightbox;

        // Flag to keep UI-specific DOM nodes on/off
        scope.lightboxBuilt = lightbox;

        // Unset the "current slide" if necessary
        scope.zacshSlide = lightbox ? scope.zacshSlide : null;

        // Scroll user to top of screen, or put them back where they were
        if (lightbox) {
          // @TODO(zacsh) this is disorienting, maybe fade into this, or just
          // fix the lightbox properly?
          scope.coords_.x = $window.scrollX;
          scope.coords_.y = $window.scrollY;
          $window.scrollTo();
        } else {
          $window.scrollTo(scope.coords_.x, scope.coords_.y);
        }

        // Lock the screen so lightbox is all that's visible
        LockScroll.set(lightbox);

        // Bindings to allow user to escape DOM nodes without AngularJS's help
        var addOrRemoveListener = lightbox ? 'addEventListener' : 'removeEventListener';
        $window.document.body[addOrRemoveListener]('click', userTryingToEscape);
        $window.document.body[addOrRemoveListener]('keyup', userTryingToEscape);
      };

      scope.$watch('zacshSlide', function(slide) {
        toggleLightbox(!scope.lightboxBuilt && slide);
      });
    }
  };
};
