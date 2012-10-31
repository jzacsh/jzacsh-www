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
       * Tracking transition between states because when lightbox opens and
       * event is binded, the handler *always* runs once _once_
       *
       * @TODO(zacsh) figure out why above explanation is the case - seems very
       * strange.
       *
       * @type {boolean}
       */
      scope.lightboxProgress = false;

      /**
       * @param {Object} clickTarget
       *   The target property of the click {@link Event}.
       * @return {boolean}
       *   If [clickTarget] is somewhere within this directive's tools.
       */
      var targetIsLightbox = function(clickTarget) {
        var clickedNode = angular.element(clickTarget)[0];
        return clickedNode === document.getElementById('current');
      };

      /**
       * @param {boolean} rawEvent
       *   If this transition is taking place outside of Angular's $digest
       *   cycle (eg.: in a raw DOM event).
       */
      var completeLightboxTransition = function(rawEvent) {
        // Flag to keep UI-specific DOM nodes on/off
        scope.lightboxBuilt = !!scope.lightboxProgress;
        scope.lightboxProgress = false;
        if (rawEvent) {
          scope.$apply();
        }
      };

      /**
       * Event handler for CLICK and KEYUP events on document.body. Will try to
       * let user out when it seems they're trying to escape.
       *
       * @param {Object} event
       *   The raw DOM event that occured.
       */
      var userTryingToEscape = function(event) {
        // Only react if we're actually visible
        if (scope.lightboxProgress || !scope.lightboxBuilt) {
          completeLightboxTransition(
              true /* outside of angular $digest cycle */);
          return;
        }

        // Make sense of the `event` triggered.
        var clickedOutsideLightbox = (event.type == 'click' && targetIsLightbox(event.target));
        var escKeyPressed = (event.type == 'keyup' && (event.keyCode == 27 || event.char == 'esc'));

        // escape attempted
        if (clickedOutsideLightbox || escKeyPressed) {
          buildLightbox(false /* close lightbox */);
          completeLightboxTransition(
              true /* outside of angular $digest cycle */);
        }
      };

      // $window coordinates of poor user before i started futzing
      scope.coords_ = { x: 0, y: 0 };

      /**
       * @param {boolean} lightbox
       *   New on/off state that the lightbox is transitioning to
       */
      var updateLightboxSettings = function(lightbox) {
        lightbox = !!lightbox;

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

        // Bindings to allow user to escape DOM nodes, once they've been built
        var addOrRemoveListener = lightbox ? 'addEventListener' : 'removeEventListener';
        $window.document.body[addOrRemoveListener]('click', userTryingToEscape);
        $window.document.body[addOrRemoveListener]('keyup', userTryingToEscape);

        // @see scope.lightboxProgress state explanation
        if (!lightbox) {
          completeLightboxTransition();
        }
      };

      /**
       * Turn on and build the lightbox based on a newly requested slide.
       *
       * @param {jzacsh.imagedex.Slide} slide
       *   The slide that should be displayed on the lightbox.
       */
      var buildLightbox = function(slide) {
        // Requested state
        scope.lightboxProgress = !!(!scope.lightboxBuilt && slide);

        // Manage Event listeners, scroll lock, etc.
        updateLightboxSettings(scope.lightboxProgress);

        // Unset the "current slide" if necessary
        scope.zacshSlide = scope.lightboxProgress ? scope.zacshSlide : null;
      };
      scope.$watch('zacshSlide', buildLightbox);
    }
  };
};
