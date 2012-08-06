/**
 * @fileoverview Angular.js Controllers
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */
var jzacsh = jzacsh || {};

jzacsh.MainPageCtrl = function($scope) {
  $scope.subpages = [
    { url: '/about', title: 'About'},
    { url: '/drawings', title: 'Drawings'}
  ];
};

//@TODO(zacsh): ng:include? ng:template? how should we approach footer?
var _footer = function($scope) {
  var elseLinks = function(name, url, title) {
    return {
      name: name,
      url: url,
      title: title? title : name,
    };
  };
  $scope.elsewhere = [
    elsewheres('google', 'http://profiles.google.com/jzacsh/about', 'google+'),
    elsewheres('twitter', 'http://www.twitter.com/jzacsh/'),
    elsewheres('github', 'http://www.github.com/jzacsh/'),
    elsewheres(),
  ];
};
