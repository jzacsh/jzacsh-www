/**
 * Playing with canvas api.
 */
jzacsh.behaviors.drawSmiley = function (c) {
  //var canv = document.getElementById('airspace');
  var canv = $('#airspace', c)[0];

  //
  //check the element is in the DOM and browser supports canvas
  //
  if (canv.getContext) {
    //initalize a 2D drawing context
    var cc = canv.getContext('2d');

    //@TODO: code stuff!!
    cc.strokeStyle = '#000000';
    cc.fillStyle = '#FFFF00';
    cc.beginPath();
    cc.arc(300, 10, 50, 0, Math.PI * 2, true);
    cc.closePath();
    cc.stroke();
    cc.fill();
  }
}

/**
 * Read SVG data and re-render via canvas APIs.
 */
jzacsh.behaviors.svgToCanvas = function (c) {
  var $paths = [];
  $('#svg2 g path', c).each(function () {
    $paths.push(this);
    $(this).hide();
  });

  //actual juice
  if ('length' in $paths && $paths.length > 0) {
    //@TODO: draw onto canvas
    //
    //parse 'd' attribute for "M", "L", "z" and act according to SVG spec.:
    //http://www.w3.org/TR/SVG/paths.html
    //
    //
    //
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

