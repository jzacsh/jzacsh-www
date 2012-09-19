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
jzacsh.controllers.DrawingsPageCtrl = function($scope, Slides) {
  $scope.nerdUrls = {
    inotify: 'https://github.com/rvoicilas/inotify-tools/wiki/',
    imagedex: 'https://github.com/jzacsh/imagedex',
    imageMagick: 'https://github.com/jzacsh/bin/blob/master/share/prep_images',
    jsondrawings: 'http://art-cdn.jzacsh.com/imagedex.json',
    bash4: 'http://wiki.bash-hackers.org/bash4',
    prepimg: 'https://github.com/jzacsh/bin/blob/master/share/prep_images',
    apidrawings: 'https://github.com/jzacsh/bin/blob/master/share/api_drawings',
  };

  console.info('injected `Slides`:', Slides); //@TODO: remove me!!    
  $scope.slides = Slides.get();

  /**
   * Setup binding and unbinding management for user-events specific to the
   * slide that is about to be viewed.
   *
   * @param {Object.<string,string>} slide
   *   An object containing URLs and basic user-facing metadata about a given
   *   slide.
   * @return {string}
   *   The "medium" property as found on the [slide] object, containing the URL
   *   for current "medium"-scaled version of [slide].
   */
  $scope.prepCurrentSlide = function(slide) {
    // @TODO(zacsh)!!

    return slide.medium;
  };
};

/* beer.html controller */
jzacsh.controllers.BeerPageCtrl = function($scope) {
  $scope.beer = jzacsh.data.beer;
};
