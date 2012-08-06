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

/**
 * Render SVG drawings from art-cdn.jzacsh.com/ via slider.js
 */
jzacsh.behaviors.sliderjsDrawings = function (c) {
  var $sliderjs = $('#sliderjs', c);
  if (!($sliderjs && 'length' in $sliderjs && $sliderjs.length > 0)) {
    return false;
  }

  var validListings = ['tablet', 'paper'],
    uri = '/imagedex.json';

  var compileSlides = function (dex) {
    var listing, imgPath, imgName, current, src, images = [];

    for (var i in dex.files) {
      if (typeof dex.files[i] != 'object') {
        continue;
      }

      //only parse objects we've been asked to parse
      for (var idx in validListings) {
        if (!validListings[idx] in dex.files[i]) {
          continue;
        }
        listing = validListings[idx];

        //run the the listing we're parsing
        for (var n in dex.files[i][listing]) {
          imgPath = dex.files[i][listing][n];
          imgName = $.trim(imgPath
            //get just the file name
            .replace(/^\/.*\/.*\/(.*)\.[pn|jpe?|sv]+g$/i,
              "$1")
            //strip out file-name conventions
            .replace(/[_-]/g, ' ')
            //cleanup after the above slopiness
            .replace(/ +/g, ' ')
          );

          //
          //store our collections
          //
          current = {
            src: jzacsh.content + imgPath,
            name: imgName
          };
          images.push(current);

          //resized SVGs are converted to bitmap by imagedex
          src = current.src.replace(/svg$/i, 'png');

          //path to small images
          images[images.length - 1].thumb = src.replace(/jzacsh\.com\//,
              'jzacsh.com/scaled/small/');

          //path to medium images
          images[images.length - 1].medium = src.replace(/jzacsh\.com\//,
              'jzacsh.com/scaled/medium/');
        }
      }
    }

    return images;
  };

  var initSliderJs = function (json) {
    var conf = {
      slider: $sliderjs,
      images: compileSlides(json),
      context: c,
      pageSize: 9,
      filmStrip: '#filmstrip',
      nextButton: '#next-page',
      prevButton: '#prev-page'
    };

    //intialize slides
    var slider = new Slides(conf);
  }

  $.ajax({
    url: jzacsh.content + uri,
    dataType: 'jsonp',
    jsonp: false,
    jsonpCallback: 'drawings',
    success: initSliderJs
  });
}

