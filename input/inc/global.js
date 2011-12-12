/**
 * @file Javascript I want run all over the site.
 */

var jzacsh = jzacsh || { behaviors: {} };

jzacsh.jsEnabled = document.getElementsByTagName &&
  document.createElement &&
  document.createTextNode &&
  document.documentElement &&
  document.getElementById;

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
    var tab = '<span class="tab" data-tab="'+ list +'">'+ list +'</span>';
    $listing.append(tab);
  });

  //bind to new tabs
  $('.tab', $listing).click(function () {
    var requested = '[data-list="' + $(this).attr('data-tab') + '"]';
    $lists.not(requested).removeClass('active');
    $(requested).addClass('active');
  });
}

/**
 * Pseudo-Drupal js behaviors API.
 *
 * @note: I <3 Drupal
 */
$(document).ready(function () {
  var context = context || document;

  if (jzacsh.jsEnabled) {
    // Execute all of them.
    jQuery.each(jzacsh.behaviors, function() {
      this(context);
    });
  }
});

