/**
 * @file: slide-show and grid-display manager.
 */

(function() {
 /***
  *
  */
 Slides = function (config) {
   var S = this; //that

   this.pre = [];
   //default configuration
   this.conf = config || {};
   this.conf = {
     slider: S.conf.slider || null,
     images: S.conf.images || null,
     current: S.conf.current || 0,
     currentPage: S.conf.currentPage || 1, //1-based index
     pageSize: S.conf.pageSize || 3,
     slideTag: S.conf.slideTag || 'li',
     slideClass: S.conf.slideClass || 'slide',
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
       if ($slide.attr('data-page') == S.conf.currentPage) {
         S.preLoad(i);
       }
       else {
         $slide.hide();
       }

       //append our slide to the DOM, hidden or not.
       $slide.appendTo(S.conf.slider);
     }
     S.conf.jq('<div class="clear"></div>').appendTo(S.conf.slider);
     S.conf.jq('<div id="viewer"></div>').appendTo(window.document);

     //
     //bind to various events
     //
     S.conf.jq('.' + S.conf.slideClass, S.conf.slider)
       .click(function (event) {
         S.createViewer(S.conf.jq(this).attr('data-slide'));
       });

     window.onkeyup = function (e) {
       //escape key
       if (e.keyCode == 27) {
         S.destroyViewer();
       }
     };
   })();

   return this;
 }

 Slides.prototype.preLoad = function (index) {
   var $img = this.conf.jq(this.getImgTag(index, 'medium')); // .appendTo(this.conf.jq('html'));
   this.pre[index] = $img.get(0);
 }

 /**
  * Build the correct markup for a slide at index.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.getSlideMarkup = function (index, preload) {
   var slide = '';

   //keep track of the page we're rendering slides for
   var page = Math.floor(index / this.conf.pageSize);
   if (index % this.conf.pageSize) {
     ++page;
   }

   //build our markup
   slide += '<' + this.conf.slideTag;
   slide += ' class="' + this.conf.slideClass + '"';
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
 Slides.prototype.getImgTag = function (index, version) {
   var slide = '';
   version = (typeof(version) == 'undefined')? 'thumb' : version;

   slide += '<img alt="' + this.conf.images[index].name + '"';
   slide += ' data-slide="' + index + '"';
   slide += ' data-version="' + version + '"';
   slide += ' src="' + this.conf.images[index][version] + '"';
   slide += '/>'

   return slide;
 }

 /**
  * Initialize the viewer and create scroll locks.
  */
 Slides.prototype.createViewer = function(index) {
   this.getModalLock();
   var img = this.getViewerMarkup(index);
   this.conf.jq(img).appendTo(this.conf.jq('body'));
 }

 /**
  * Retain and lock scroll settings for later.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.getModalLock = function () {
    var scrollPos = [
      self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    ];
    var $html = this.conf.jq('html');

    //retain current settings
    this.modal = this.modal || {
      lock: {
        scrollPosition: scrollPos,
        overflow: $html.css('overflow'),
      }
    };

    //lock our scroll
    window.scrollTo(scrollPos[0], scrollPos[1]);
    $html.css('overflow', 'hidden');
 }

 /**
  * Un-lock scroll position.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.breakModalLock = function () {
   if (!('modal' in this)) {
     return false;
   }

   var scrollPos = this.modal.lock.scrollPosition;

   //restore previous settings
   this.conf.jq('html').css('overflow', this.modal.lock.overFlow);
   window.scrollTo(scrollPos[0], scrollPos[1])

   //delete previous settings
   delete this.modal;
 }

 /**
  * Build the correct markup for modal window.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.getViewerMarkup = function (index) {
   var modal = '', style = [], left = 0, top = 0;

   //
   //viewer container
   //
   style.push('position: absolute');
   style.push('background-color: rgba(0, 0, 0, 0.05)');
   style.push('width: 100%');
   style.push('height: 100%');
   style.push('z-index: 999');
   style.push('top: 0');
   style.push('left: 0');
   viewerStyle = this.conf.jq.trim(style.join('; '));

   //determine useful positoins/sizes based on the given image
   top = (this.conf.jq(window).height() - this.pre[index].naturalHeight) / 2;
   left = this.pre[index].naturalWidth / 2;

   //
   //image container
   //
   style = [];
   style.push('position: relative');
   style.push('top: ' + top + 'px');
   style.push('left: 50%');
   style.push('margin-left: -' + left + 'px');
   viewingStyle = this.conf.jq.trim(style.join('; '));

   //build the actual markup
   modal += '<div id="viewer" style="' + viewerStyle + '">';
   modal += '<div class="viewing" style="' + viewingStyle + '">';
   modal += this.getImgTag(index, 'medium');
   modal += '</div><!--//.viewing-->';
   modal += '</div><!--//#viewer-->';

   return modal;
 }

 /**
  * Destroy the slider viewer we've used to take over the DOM.
  */
 Slides.prototype.destroyViewer = function () {
   this.breakModalLock();
   this.conf.jq('#viewer').remove();
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

