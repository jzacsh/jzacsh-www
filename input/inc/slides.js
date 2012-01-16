/**
 * @file: slide-show and grid-display manager.
 */

(function() {
 /***
  *
  */
 Slides = function (config) {
   var S = this; //that

   //default configuration
   this.conf = config || {};
   this.conf = {
     slider: S.conf.slider || null,
     images: S.conf.images || null,
     current: S.conf.current || 0,
     currentPage: S.conf.currentPage || 1, //1-based index
     pageSize: S.conf.pageSize || 3,
     jqc: S.conf.context || window.document,
     jq: S.conf.jq || (function () {
       if ('jquery' in S.conf.slider) {
         return S.conf.slider.constructor
       }
       else {
         return null;
       }
     })(),
   }

   //sanity check
   if (S.conf.images == null || S.conf.slider == null) {
     console.error('Must pass "slider" and "images" properties to configuration oject of Slides().');
     return false;
   }

   //
   //initialization
   //
   (function () {
     var slide, page = 0;
     for (var i in S.conf.images) {
       //keep track of the page we're rendering slides for
       if ((i % S.conf.pageSize) == 0) {
         ++page;
       }

       slide = '';
       //
       //build this slide
       //
       slide += '<div class="slide"';
       slide += ' data-page="' + page + '"';
       slide += ' data-slide="' + i + '"';
       slide += ' title="' + S.conf.images[i].name + '"';
       slide += '>';
       if (page == S.conf.currentPage) {
         slide += '<img alt="' + S.conf.images[i].name + '"';
         slide += ' src="' + S.conf.images[i].thumb + '"';
         slide += '/>'
       }
       slide += '</div>';

       //
       // append our slide to the DOM, hidden or not.
       //
       slide = S.conf.jq(slide);
       if (page != S.conf.currentPage) {
         slide.hide();
       }
       slide.appendTo(S.conf.slider);
     }
     S.conf.jq('<div class="clear"></div>').appendTo(S.conf.slider);
   })();

   return this;
 }

 Slides.prototype.setSlide = function (index) {
   return this;
 }

 Slides.prototype.next = function () {
   this.setSlide(this.current + 1);
   return this;
 }
 Slides.prototype.previous = function () {
   this.setSlide(this.current - 1);
   return this;
 }
 Slides.prototype.pausePlay = function () {
   return this;
 }
})()

