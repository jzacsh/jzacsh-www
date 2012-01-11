/**
 * @file my lazy attempt to *eventually* move things into their own files to
 * avoid clutter (not *necessarily* to reduce performance... but who cares
 * about performance?.. pfft... smerrill, I hope you're not reading this).
 *
 * This is just until I figure out enough python to dynamically include css/js
 * files when they're reference in the top of a poole md file's head (the way
 * I'm already doing with "bodyClass".
 */

/**
 * All behaviors should be defined here, or in other javascript files.
 */
jzacsh.behaviors.beerAndTabbed = function (context) {
  if (! $('body').hasClass('beerand')) {
    return;
  }

  var $lists = $('body.beerand .list', context);

  //create tabs
  var $listing = $('#listing', context);
  $lists.each(function () {
    var list = $(this).attr('data-list');
    var tab = '<span class="tab clickable" data-tab="'+ list +'">';
    tab += list + '</span>';

    $listing.append(tab);
  });

  //bind to new tabs
  $('.tab', $listing).click(function () {
    var $this = $(this);
    var requested = '[data-list="' + $this.attr('data-tab') + '"]';

    //the tab
    $this.addClass('active');
    $('#listing .tab').not('[data-tab="'+ $this.attr('data-tab') +'"]')
      .removeClass('active');

    //the content
    $lists.not(requested).removeClass('active');
    $(requested).addClass('active');
  });

  $('body.beerand .list[data-list="beer"]').addClass('active');
  $('body.beerand #listing [data-tab="beer"]').addClass('active');
}

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
  if ('length' in $svg && $svg.length > 0 &&
      'length' in $canvas && $canvas.length > 0) {
    var mapper = svgToCanvas.mapToCanvas($svg[0], $canvas[0], config);
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
 * Render SVG drawings from content.jzacsh.com/drawings via slider.js
 *
 * @see http://greweb.fr/slider
 */
jzacsh.behaviors.sliderjsDrawings = function (c) {
  var validListings = ['tablet', 'paper'];

  var slides = (function () {
    var s = [];
    var site = '/', //@TODO: http://content.jzacsh.com
      uri = 'inc/sample_imagedex.json'; //@TODO: drawings/imagedex.json

    $.getJSON(site + uri, function (dex) {
      var listing, path,
        regexFname = new RegExp('^/.*/.*/(.*)\.[pn|jpe?|sv]g$', 'i');
      for (var i in dex.files) {
        if (typeof dex.files[i] != 'object') {
          continue;
        }

        //only parse objects we've been asked to parse
        for (var idx in validListings) {
          if (validListings[idx] in dex.files[i]) {
            listing = validListings[idx];

            //run the the listing we're parsing
            for (var n in dex.files[i][listing]) {
              path = dex.files[i][listing][n];
              s.push({
                src: path,
                name: $.trim(path.replace(regexFname, "$1")
                  .replace(/[_-]/g, ' ')
                  .replace(/ +/g, ' ')
                  )
              });
            }
          }
        }
      }
    });
    return s;
  })();

  var slider = new Slider($('#sliderjs', c));
  slider.setPhotos(slides);
}

