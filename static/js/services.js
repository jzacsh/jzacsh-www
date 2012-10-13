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
jzacsh.directives.zacshBox = function($window) {
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
       * Event handler for CLICK and KEYUP events on document.body. Will try to
       * let user out when it seems they're trying to escape.
       *
       * @param {Object} event
       *   The raw DOM event that occured.
       */
      var userTryingToEscape = function(event) {
        // User click elsewhere (on the glass on our lightbox).
        var alcatraz =
          (event.type == 'click' && clickedTargetWasLightbox(angular.element(event.target)[0]));
        if (!alcatraz && event.type == 'keyup' && (event.keyCode == 27 || event.char == 'esc')) {
          // User hit "ESCAPE" key
          alcatraz = true;
        }

        // Only react if user is trying to escape and we're actually visible
        if (scope.lightboxBuilt && alcatraz) {
          toggleLightbox(false /* close */);
          scope.$apply();
        }
      };

      /**
       * @param {boolean} lightbox
       *   If lightbox should be on or off.
       */
      var toggleLightbox = function(lightbox) {
        // Flag to keep UI-specific DOM nodes on/off
        scope.lightboxBuilt = !!lightbox;

        // Unset the "current slide" if necessary
        scope.zacshSlide = lightbox ? scope.zacshSlide : null;

        // Bindings to allow user to escape DOM nodes without AngularJS's help
        var addOrRemoveListener = lightbox ? 'addEventListener' : 'removeEventListener';
        $window.document.body[addOrRemoveListener]('click', userTryingToEscape);
        $window.document.body[addOrRemoveListener]('keyup', userTryingToEscape);
      };

      /**
       * @param {Element} clickedNode
       *   The DOM node that was clicked.
       * @return {boolean}
       *   If [clickedNode] is somewhere within this directive's tools.
       */
      var clickedTargetWasLightbox = function(clickedNode) {
        return clickedNode === document.getElementById('current');
      };

      scope.$watch('zacshSlide', function(slide) {
        toggleLightbox(!scope.lightboxBuilt && slide);
      });
    }
  };
};