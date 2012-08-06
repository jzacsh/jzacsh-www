/**
 * @fileoverview Angular.js Controllers
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */
var jzacsh = jzacsh || {};

/* ng:include Banner */
jzacsh.BannerCtrl = function($scope) {
  $scope.subpages = [
    { url: '/about', title: 'About'},
    { url: '/drawings', title: 'Drawings'}
  ];
};

/* ng:include Footer */
jzacsh.FooterCtrl = function($scope) {
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
jzacsh.AboutPageCtrl = function($scope) {};

/* drawings.html controller */
jzacsh.DrawingsPageCtrl = function($scope) {
  $scope.nerdUrls = {
    inotify: 'https://github.com/rvoicilas/inotify-tools/wiki/',
    imagedex: 'https://github.com/jzacsh/imagedex',
    imageMagick: 'https://github.com/jzacsh/bin/blob/master/share/prep_images',
    jsondrawings: 'http://art-cdn.jzacsh.com/imagedex.json',
    bash4: 'http://wiki.bash-hackers.org/bash4',
    prepimg: 'https://github.com/jzacsh/bin/blob/master/share/prep_images',
    apidrawings: 'https://github.com/jzacsh/bin/blob/master/share/api_drawings',
  };
};

/* beer.html controller */
jzacsh.BeerPageCtrl = function($scope) {
  $scope.beer = jzacsh.data.beer;
};
