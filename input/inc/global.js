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
//console.log(jQuery('body.beerand .beerandlist', context)); //@TODO: remove me!!    
//$('body.beerand .beerandlist', context).each(function () {
//  console.log('boop'); //@TODO: remove me!!    
//  $('<span class="tab">'+ $(this).attr('data-list') +'</span>')
//    .insertBefore('h3', this);
//});
}

/**
 * Pseudo-Drupal js behaviors API.
 *
 * @note: I <3 Drupal
 */
$(document).ready(function (context) {
  var context = context || document;

  if (jzacsh.jsEnabled) {
    // Execute all of them.
    jQuery.each(jzacsh.behaviors, function() {
      console.log(this); //@TODO: remove me!!    
      this(context);
    });
  }
});

