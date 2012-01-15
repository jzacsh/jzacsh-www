/**
 * @file: slide-show and grid-display manager.
 */

(function() {
 /***
  *
  */
 Slides = function (config) {
   this.config = config;
   //
   //default configuration
   //
   var config = this.config || {};
   this.conf = {
     current: config.current || 0,
     jq: config.jq || this.slider.constructor,
     jqcontext: config.context || window.document,
     slider: config.slider || null,
     images: config.photos || null
   }

   //sanity check
   if (this.conf.images == null || this.conf.slider == null) {
     console.error('Must pass "slider" and "images" properties to configuration oject of Slides().');
     return false;
   }

   // initialize a bunch of empty slides
   (function () {
     for (var i in that.images) {
       this.conf.jq('<div class="slide" data-slide="' + i + '"></div>')
         .append(that.slider);
     }
     that.slider.hide();
   })();

   return this;
 }

 Slides.prototype.setSlide = function (index) {
   return this;
 }

 Slides.prototype.next = function () {
   that.setSlide(that.current + 1);
   return this;
 }
 Slides.prototype.previous = function () {
   that.setSlide(that.current - 1);
   return this;
 }
 Slides.prototype.pausePlay = function () {
   return this;
 }
})()

