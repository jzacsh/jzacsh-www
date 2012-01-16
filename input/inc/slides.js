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
     slideTag: S.conf.slideTag || 'li',
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

   //initialize each slide in our grid
   (function () {
     var slide;
     for (var i in S.conf.images) {
       //get our slide markup
       slide = S.getSlideMarkup(i);

       $slide = S.conf.jq(slide);
       if ($slide.attr('data-page') != S.conf.currentPage) {
         $slide.hide();
       }

       //append our slide to the DOM, hidden or not.
       $slide.appendTo(S.conf.slider);
     }
     S.conf.jq('<div class="clear"></div>').appendTo(S.conf.slider);
   })();

   return this;
 }

 /**
  * Build the correct markup for a slide at index.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.getSlideMarkup = function (index) {
   slide = '';

   //keep track of the page we're rendering slides for
   var page = Math.floor(index / this.conf.pageSize);
   if (index % this.conf.pageSize) {
     ++page;
   }

   //build our markup
   slide += '<' + this.conf.slideTag;
   slide += ' class="slide"';
   slide += ' data-page="' + page + '"';
   slide += ' data-slide="' + index + '"';
   slide += ' title="' + this.conf.images[index].name + '"';
   slide += '>';
   if (page == this.conf.currentPage) {
     slide += this.getImgTag(index);
   }
   slide += '</' + this.conf.slideTag + '>'

   return slide;
 }

 /**
  * Build the correct markup for a slide at index.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.getImgTag = function (index) {
   slide = '';

   slide += '<img alt="' + this.conf.images[index].name + '"';
   slide += ' src="' + this.conf.images[index].thumb + '"';
   slide += '/>'

   return slide;
 }

 /**
  *
  */
 Slides.prototype.setSlide = function (index) {
   return this;
 }

 /**
  *
  */
 Slides.prototype.next = function () {
   this.setSlide(this.current + 1);
   return this;
 }

 /**
  *
  */
 Slides.prototype.previous = function () {
   this.setSlide(this.current - 1);
   return this;
 }

 /**
  *
  */
 Slides.prototype.pausePlay = function () {
   return this;
 }
})()

