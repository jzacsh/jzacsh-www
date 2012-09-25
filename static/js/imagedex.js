/**
 * Handling images and artwork pulled down from art-cdn, and indexed with
 * imagedex.json
 */
var jzacsh = jzacsh || {};
jzacsh.imagedex = jzacsh.imagedex || {};
jzacsh.imagedex.Slide = jzacsh.imagedex.Slide || {};

/**
 *
 * @param {string} slidePath
 *   Relative (to art-cdn) server path, for a single slide of art work.
 * @constructor
 */
jzacsh.imagedex.Slide = function(slidePath, server) {
  this.server = server;
  this.path = slidePath;

  this.src = server + this.path;
  this.name = this.getName_();
  this.medium = server + this.getMedium_();
  this.thumb =  server + this.getThumb_();

  return this;
};

/**
 * @private
 */
jzacsh.imagedex.Slide.prototype.getName_ = function() {
  return this.path
      //get just the file name
      .replace(/^\/.*\/(.*)\.[pn|jpe?|sv]+g$/i,
        "$1")
      //strip out file-name conventions
      .replace(/[_-]/g, ' ')
      //cleanup after the above slopiness
      .replace(/ +/g, ' ')
};

/**
 * @private
 */
jzacsh.imagedex.Slide.prototype.getThumb_ = function() {
  return '/scaled/small' + this.path.replace(/svg$/i, 'png');
};

/**
 * @private
 */
jzacsh.imagedex.Slide.prototype.getMedium_ = function() {
  return '/scaled/medium' + this.path.replace(/svg$/i, 'png');
};
