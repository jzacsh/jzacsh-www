/**
 * @fileoverview Angular.js Controllers
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */
var jzacsh = jzacsh || {};
jzacsh.controllers = jzacsh.controllers || {};

/* ng:include Banner */
jzacsh.controllers.BannerCtrl = function($scope) {
  $scope.subpages = [
    { url: '#/about', title: 'About'},
    { url: '#/drawings', title: 'Drawings'}
  ];
};

/* ng:include Footer */
jzacsh.controllers.FooterCtrl = function($scope) {
  $scope.elsewhere = (function() {
    var elseLinks = function(name, url, title) {
      return {
        name: name,
        url: url,
        title: title? title : name,
      };
    };
    return [
      elseLinks('google', 'http://profiles.google.com/jzacsh/about', 'google+'),
      elseLinks('twitter', 'http://www.twitter.com/jzacsh/'),
      elseLinks('github', 'http://www.github.com/jzacsh/'),
    ];
  })();
};

/* about.html controller */
jzacsh.controllers.AboutPageCtrl = function($scope) {};

/* drawings.html controller */
jzacsh.controllers.DrawingsPageCtrl = function($scope, $window, $timeout, Slides, LockScroll) {
  /**
   * Slides of artwork, keyed by the particular medium they're created in.
   * @type {Object.<string,Array.<jzacsh.imagedex.Slide>>}
   */
  $scope.slides = [];

  /**
   * Raw server-side paths to artwork, keyed by the medium of the work.
   * @type {Object.<string,Array.<string>>}
   * @const
   */
  $scope.slidePaths = {};

  /**
   * Initial number of slides to show user on a single page.
   * @type {number}
   * @const
   */
  $scope.ART_GRID = 9;

  /**
   * Initial page of slides to show user (using a 1-based index).
   * @type {number}
   * @const
   */
  $scope.ART_PAGE = 1;

  /**
   * Reset some basic user-facing configuration that is pecific to a given
   * medium of slides.
   */
  $scope.mediumSwitched = function() {
    $scope.ART_PAGE = 1;
    $scope.settings.currentSlide = false;
  };

  /**
   * Setter for the current {jzacsh.imagedex.Slide} slide being viewed.
   *
   * @param {jzacsh.imagedex.Slide} slide
   *   The slide that should be currently viewed.
   */
  $scope.setCurrentSlide = function(slide) {
    LockScroll.set(!!slide);
    $scope.settings.currentSlide = slide;
  };

  /**
   * @param {number} preferred
   *   The preferred number of slides to show at a time, unless that number is
   *   greater than the total number of slides within a set of [medium] work.
   * @param {string} medium
   *   The particular art medium for which the number of possible pages should
   *   be returned.
   * @return {number}
   *   The most realistic max-number of slides to show for a grid.
   */
  $scope.maxGridSize = function(preferred, medium) {
    if (!angular.isArray($scope.slidePaths[medium])) {
      return;
    }

    return preferred > $scope.slidePaths[medium].length ?
           $scope.slidePaths[medium].length : preferred;
  };

  /**
   * The number of pages of slides, given the [medium] of slides being paged
   * and the size of each page, as indicated by {@link $scope.ART_GRID}.
   *
   * @param {string} medium
   *   The particular art medium for which the number of possible pages should
   *   be returned.
   * @return {number}
   *   Number of possible pages to be viewed of slides in [medium].
   */
  $scope.getNumberOfPages = function(medium) {
    // Only process if $scope.slidePaths are loaded
    if (angular.isArray($scope.slidePaths[medium])) {
      return Math.ceil($scope.slidePaths[medium].length / $scope.ART_GRID);
    }
  };

  /**
   * Number of pages to add to {@link ART_PAGE}, the current/visible page
   * number.
   * @param {number} increment
   */
  $scope.addToPage = function(increment) {
    $scope.ART_PAGE += increment;
  };

  /**
   * Available mediums of artwork to show.
   * @type {Array.<string>}
   * @const
   */
  $scope.ART_MEDIUMS = [
    'paper',
    'tablet'
  ];

  /**
   * User-selected settings.
   */
  $scope.settings = {
    // Initial medium of artwork to show
    ART_MEDIUM: $scope.ART_MEDIUMS[0],

    // @type {jzacsh.imagedex.Slide}
    // The slide currently being viewed on the lightbox. False by default, not
    // showing a slide.
    currentSlide: false
  };

  $scope.nerdUrls = {
    inotify: 'https://github.com/rvoicilas/inotify-tools/wiki/',
    imagedex: 'https://github.com/jzacsh/imagedex',
    imageMagick: 'https://github.com/jzacsh/bin/blob/master/share/prep_images',
    jsondrawings: 'http://art-cdn.jzacsh.com/imagedex.json',
    bash4: 'http://wiki.bash-hackers.org/bash4',
    prepimg: 'https://github.com/jzacsh/bin/blob/master/share/prep_images',
    apidrawings: 'https://github.com/jzacsh/bin/blob/master/share/api_drawings',
  };

  /**
   * @param {number} pageNumber
   *   Page number (a 1-based index) of slides from {@link $scope.slides} to
   *   make visible.
   *   @see $scope.ART_PAGE
   * @param {number} pageSize
   *   Number of slides to show per-page.
   *   @see $scope.ART_GRID
   * @param {string} medium
   *   The medium of artwork that is being paged through.
   *   @see $scope.settings.ART_MEDIUM
   * @return {Array.<jzacsh.imagedex.Slide>}
   *   Slides for page, [pageNumber].
   */
  $scope.getPageOfSlides = function(pageNumber, pageSize, medium) {
    if (!$scope.imagedexLoaded) {
      return false;
    }
    var i = 0;

    // Make everything else invisible
    for (i = 0; i < $scope.ART_MEDIUMS.length; i++) {
      for (var n = 0; n < $scope.ART_MEDIUMS[i].length; n++) {
        if ($scope.ART_MEDIUMS[i][n]) {
          $scope.ART_MEDIUMS[i][n].visible = false;
        }
      }
    }

    var firstSlide = ($scope.ART_PAGE - 1) * $scope.ART_GRID;
    var lastSlide = (pageNumber * pageSize) - 1;

    // Make sure the requested slides have been loaded
    for (i = 0; i <= lastSlide; i++) {
      if (!$scope.slides[medium][i]) {
        $scope.loadPaneOfSlides(
            $scope.slides[medium],
            $scope.slidePaths[medium],
            firstSlide,
            pageSize);
        break;
      }
    }

    var tmpSlides = [];
    for (i = 0; i < pageSize; i++) {
      tmpSlides.push($scope.slides[medium][firstSlide + i]);
    }
    return tmpSlides;
  };

  /**
   * @param {string} medium
   *   The particular medium of slides of artwork to be viewed.
   * @return {Object.<string,number>}
   *   User-friendly metadata about slides included on a given page for medium,
   *   [medium], given the current page number {@link $scope.ART_PAGE}.
   *   - from: 1-based index of the first slide number, of the whole set within
   *     [medium]),being shown.
   *   - to: same as 'from' property, but the 1-based index of the last slide
   *     to be shown on the current page.
   */
  $scope.slidesOnPage = function(medium) {
    var metaData = {};
    if (!$scope.imagedexLoaded) {
      return metaData;
    }

    metaData.from = (($scope.ART_PAGE - 1) * $scope.ART_GRID) + 1;

    var lastPossibleSlide = $scope.slidePaths[medium].length;
    metaData.to = $scope.ART_PAGE * $scope.ART_GRID;
    metaData.to = metaData.to > lastPossibleSlide ?
                  lastPossibleSlide : metaData.to;

    return metaData;
  };

  /**
   * @param {Array.<jzacsh.imagedex.Slide>} slides
   *   Location that each slide loaded from [paths] should be stored in (pass
   *   by reference).
   * @param {Array.<string>} paths
   *   Server-side paths (relative) to {@link jzacsh.content} CDN.
   * @param {number} from
   *   Array index indicating the first slide that should be loaded.
   * @param {number} quantity
   *   Number of slides that should be loaded, sequentially follwoing
   *   slides[from].
   */
  $scope.loadPaneOfSlides = function(slides, paths, from, quantity) {
    var slide;
    for (var i = 0; i < quantity && (from + i < paths.length); i++) {
      slide = new jzacsh.imagedex.Slide(paths[from + i], jzacsh.content);
      slide.visible = true;
      slides.push(slide);
    }
  };

  /**
   * Load the first pane of slides.
   */
  var handleImagedex = function(imagedexjson) {
    $scope.imagedex = imagedexjson;
    for (var i = 0; i < imagedexjson.length; i++) {
      if (angular.isObject(imagedexjson[i])) {
        // Number of available mediums makes this a negligible nested-loop
        for (var n = 0; n < $scope.ART_MEDIUMS.length; n++) {
          if ($scope.ART_MEDIUMS[n] in imagedexjson[i]) {
            $scope.slidePaths[$scope.ART_MEDIUMS[n]] = imagedexjson[i][$scope.ART_MEDIUMS[n]];
            $scope.slides[$scope.ART_MEDIUMS[n]] = $scope.slides[$scope.ART_MEDIUMS[n]] || [];

            // Initialize the first page of the first medium to be shown
            if ($scope.ART_MEDIUMS[n] == $scope.settings.ART_MEDIUM) {
              $scope.loadPaneOfSlides(
                  $scope.slides[$scope.settings.ART_MEDIUM],
                  imagedexjson[i][$scope.settings.ART_MEDIUM],
                  0, // start on slide 0
                  $scope.ART_GRID); // number of slides
            }
          }
        }
      }
    }
    $scope.imagedexLoaded = true;
  };

  $scope.fmlHack_i = 0;
  var fmlHack = function() {
    var cleanUpSomeOfHack = function() {
      $timeout.cancel($scope.fmlHack);
      delete $scope.fmlHack_i;
    };

    if ($window.jonDrawings) {
      handleImagedex($window.jonDrawings.files);
      cleanUpSomeOfHack();
    } else if (++$scope.fmlHack_i > 10) {
      cleanUpSomeOfHack();
    }
  };
  $scope.fmlHack = $timeout(fmlHack, 1000);
};

/* beer.html controller */
jzacsh.controllers.BeerPageCtrl = function($scope) {
  $scope.beer = jzacsh.data.beer;
};
