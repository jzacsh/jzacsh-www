/**
 * @fileoverview Custom AngularJS Services.
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */
var jzacsh = jzacsh || {};
jzacsh.services = jzacsh.services || {};

/**
 * Fetch imagedex.json data on Slides to be displayed from CDN.
 *
 * @para {Object} $resource
 *   AngularJS' injected ngResource.
 */
jzacsh.services.Slides = function($resource) {
  // @TODO(zacsh) determine what's needed... JSONp?
  // return $resource('http://art-cdn.jzacsh.com/imagedex.json', {}, {});
  return $resource('http://art-cdn.jzacsh.com/imagedex_plain.json', {}, {});
};
