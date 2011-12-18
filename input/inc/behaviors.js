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
    var sToC = svgToCanvas.mapToCanvas($svg[0], $canvas[0], config);
    sToC.render();
  }
}


/**
 * Try to manipulate and slowly "render" a set of SVG vectors, via css
 * show/hide.
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
      console.log('entered chain-link: %d\n', idx);
      if ($paths.length >= idx) {
        console.log('fading in path #%d\n', idx); //@TODO: remove me!!    
        $($paths[idx++]).fadeIn(fadeSpeed);
      }

      //now that idx is incremented...
      if ($paths.length >= idx) {
        console.log('setting up next link, #%d\n', idx); //@TODO: remove me!!    
        tids.push(setTimeout(fadeNextPath, linkLength,
              //parameters:
              idx, fadeSpeed, linkLength));
      }
    }

    console.log('triggering chain of %d paths...', $paths.length); //@TODO: remove me!!    
    //start the chain at 0
    tids.push(setTimeout(fadeNextPath, 100,
          //parameters:
          0, 3000, 3001));
    console.log('tids:', tids); //@TODO: remove me!!    
  }
}

