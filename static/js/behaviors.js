/**
 * @file my lazy attempt to *eventually* move things into their own files to
 * avoid clutter (not *necessarily* to reduce performance... but who cares
 * about performance?.. pfft... smerrill, I hope you're not reading this).
 *
 * This is just until I figure out enough python to dynamically include css/js
 * files when they're reference in the top of a poole md file's head (the way
 * I'm already doing with "bodyClass".
 */

var jzacsh = jzacsh || {};
jzacsh.behaviors = jzacsh.behaviors || {};

jzacsh.data = jzacsh.data || {};
jzacsh.content = 'http://art-cdn.jzacsh.com';

/**
 * Read SVG data and re-render via canvas APIs.
 */
jzacsh.behaviors.svgToCanvas = function (c) {
  var $svg = $('#svg2', c).first(),
      $canvas = $('#airspace', c).first(),
      config = {
        reverse: false,
        speed: 400,
        sketchy: true,
      };

  //render our SVG image as canvas, using svgToCanvas lib.
  if ($svg && 'length' in $svg && $svg.length > 0 &&
      $canvas && 'length' in $canvas && $canvas.length > 0) {
    var mapper = new SvgToCanvas($svg[0], $canvas[0], config);
    if (mapper) {
      mapper.renderToCanvas();
    }
  }
}


/**
 * Try to manipulate and slowly "render" a set of SVG vectors, via css
 * show/hide, before bothering with canvas.
 */
jzacsh.behaviors.svgRender = function (c) {
  var $paths = [];
  $('#svg2 g path', c).each(function () {
    $paths.push(this);
    $(this).hide();
  });

  //actual juice
  if ('length' in $paths && $paths.length > 0) {
    var tids = [];

    //
    //the callback chain
    //
    var fadeNextPath = function (idx, fadeSpeed, linkLength) {
      if ($paths.length >= idx) {
        $($paths[idx++]).fadeIn(fadeSpeed);
      }

      //now that idx is incremented...
      if ($paths.length >= idx) {
        tids.push(setTimeout(fadeNextPath, linkLength,
              //parameters:
              idx, fadeSpeed, linkLength));
      }
    }

    //start the chain at 0
    tids.push(setTimeout(fadeNextPath, 100,
          //parameters:
          0, 3000, 3001));
  }
}
