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

