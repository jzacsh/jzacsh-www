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
