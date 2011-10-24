/**
 * Basic rotation through the available JSON provided by imagedex
 */

$(document).ready(function () {
  $show = $('.slideshow > p a.starter');

  var imagedex = function () {
    var type = $('p.current-slide').attr('slide-type');
    if (type in window && 'files' in window[type]) {
      return window[type].files;
    }
  }

  $show.click(function () {
    if ($(this).hasClass('started')) {
      return false;
    }
    else {
      $('.slideshow > p a.starter').each(function () {
        $(this).addClass('started');
      });
    }

    var slideType = $(this).attr('data-role');
    var $base = $('.slideshow > p.base-slide img.base').parents('p');
    var $origclone = $base.clone();
    $origclone
      .addClass('current-slide')
      .attr('slide-type', slideType);
    $('img', $origclone).attr('class', 'slide');

    var slideFromPath = function (path, i) {
      var $clone = $origclone.clone();
      $('img', $clone)
        .attr('src', path)
        .css({
          'max-height': '80%',
          'max-width': '80%'
          })
        .parents('a.full-size')
          .attr('href', path);
      $clone
        .attr('data-index', i)
        .addClass('slide-'+ i);

      return $clone;
    }

    var dialogOpts = {
      autoOpen: false,
      closeOnEscape: true,
      height: 'auto',
      maxHeight: 600,
      maxWidth: 800,
      draggable: false,
      beforeClose: function () {
        $('.slideshow a#start.started').removeClass('started');
      }
    };

    $current = slideFromPath(imagedex()[0], 0);
    $current.dialog(dialogOpts);
    $current.dialog('open');
    $origclone.remove();

    var $move = $('p.current-slide > a.move');
    var transition = function (index) {
      if ($current.attr('data-index') != index) {
        var path = imagedex()[index];
        $('img', $current)
          .attr('src', path)
          .parents('a.full-size')
          .attr('href', path);

        $current
          .attr('data-index', index)
          .addClass('slide-'+ index);
      }
    };

    $(window.document).keydown(function (e) {
      $slide = $('p.current-slide.ui-dialog-content');
      if ('length' in $slide && $slide.length == 1) {
        if (e.keyCode == 37) {
          action = 'prev';
        }
        else if (e.keyCode == 39) {
          action = 'next';
        }
        else {
          action = false;
        }

        if (action) {
          $('a.move[data-role="'+ action +'"]', $slide).trigger('click');
        }
      }
    });

    $move.click(function() {
      var move = $(this).attr('data-role');
      var moveto = $(this).parents('p.current-slide').attr('data-index');

      if (move == 'prev') {
        --moveto;
      }
      else if (move == 'next') {
        ++moveto;
      }

      //sanity check
      var max = imagedex().length - 1;
      if (moveto < 0) {
        moveto = 0;
      }
      else if (moveto > max) {
        moveto = max;
      }

      transition(moveto);
    });

  });
});
