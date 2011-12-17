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
    var context = canv.getContext('2d');

    //@TODO: code stuff!!
    context.strokeStyle = '#000000';
    context.fillStyle   = '#FFFF00';
    context.beginPath();
    context.arc(100, 100, 50, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
    context.fill();
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

    //@TODO: code this to instead of _fading_ in, rendering each point along
    //the vector slowly

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

