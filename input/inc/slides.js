/**
 * @file: slide-show and grid-display manager.
 */

(function() {
 /***
  *
  */
 window.Slides = function ($slider, photos, config) {
   this.slider = $slider;
   this.images = photos;
   var jq = this.slider.constructor;
   that = this;

   this.initSlides = function () {
     for (var i in that.images) {
       jq('<div class="slide" data-slide="' + i + '"></div>')
         .append(that.slider);
     }
     that.slider.hide();
   }

   /**
    * Actually fill in our DOM with these images.
    */

   this.setSlide = function (index) {
   }

   this.next = function () {
     that.setSlide(that.current + 1);
   }
   this.previous = function () {
     that.setSlide(that.current - 1);
   }
   this.pausePlay = function () {
   }
   return this;
 }
})()

