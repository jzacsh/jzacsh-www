/**
 * @file: slide-show and grid-display manager.
 */

(function() {
 /***
  *
  */
 Slides = function (config) {
   this.pre = [];

   //intialize config
   this.initConfig(config);

   //sanity check
   if (this.conf.images == null || this.conf.slider == null) {
     console.error('Must pass "slider" and "images" properties to configuration oject of Slides().');
     return false;
   }

   //initialize each slide in our grid
   this.initGrid();

   //bind to events in DOM for our features
   this.initBindings();

   return this;
 }

 /**
  * Initialize configuration with our own defaults.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.initConfig = function (config) {
   var S = this;

   //default configuration
   this.conf = config || {};
   this.conf = {
     slider: S.conf.slider || null,
     images: S.conf.images || null,
     current: S.conf.current || 0,
     currentPage: S.conf.currentPage || 1, //1-based index
     pageSize: S.conf.pageSize || 3,
     slideTag: S.conf.slideTag || 'li',
     viewerID: S.conf.viewerID || 'viewer',
     filmStrip: S.conf.filmStrip || false,
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
 }

 /**
  * Create necessary grid, DOM elements, and initialize event bindings as
  * necessary.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.initGrid = function () {
   var slide, S = this;

   //sanity check
   var $slides = this.conf.jq('.slide', this.conf.slider);
   if ('length' in $slides && $slides.length > 0) {
     return this;
   }

   for (var i in this.conf.images) {
     //get our slide markup
     slide = this.getSlideMarkup(i);

     $slide = this.conf.jq(slide, this.conf.jqc);
     if ($slide.attr('data-page') == this.conf.currentPage) {
       this.preLoad(i);
     }
     else {
       $slide.hide();
     }

     //append our slide to the DOM, hidden or not.
     $slide.appendTo(this.conf.slider);
   }
   this.conf.jq('<div class="clear"></div>').appendTo(this.conf.slider);
   this.conf.jq('<div id="' + this.conf.viewerID + '"></div>').appendTo(window.document);

   return this;
 }

 /**
  * Bind to various events to make our show work.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.initBindings = function () {
   var S = this;

   this.conf.jq('.' + this.conf.slideClass, this.conf.slider)
     .click(function (event) {
       S.createViewer(S.conf.jq(this).attr('data-slide'));
     });
   window.onkeyup = function (e) {
     switch (e.keyCode) {
       //close modal window
       case 27: // ESC
         S.destroyViewer();
         break;

       //previous slide
       case 37: // left-arrow
       case 75: // k
       case 80: // p
         S.previous();
         break;

       //next slide
       case 39: // right-arrow
       case 74: // j
       case 78: // n
         S.next();
         break;
     }
   };
 }

 /**
  * Preload image somewhere on the DOM, primarily so that we will have
  * dimension information on the image we're dealing with, before we show it.
  *
  * @TODO: this is probably hacky and sloppy. What to do, what to do??
  */
 Slides.prototype.preLoad = function (index) {
   var $img = this.conf.jq(this.getImgTag(index, 'medium'));
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
   this.current = index;

   this.getModalLock();
   var $viewer = this.conf.jq(this.getViewerMarkup(index));
   $viewer.appendTo(this.conf.jq('body'));

   var S = this;
   //allow user to click their way out of viewer
   $viewer.click(function (e) {
     e.preventDefault();
     S.destroyViewer();
   });
   //user clicks on image, that doesn't count.
   var $img = this.conf.jq('#' + this.conf.viewerID + ' .viewing img');
   $img.click(function (e) {
     return false;
   });
 }

 /**
  * Destroy the slider viewer we've used to take over the DOM.
  */
 Slides.prototype.destroyViewer = function () {
   this.current = null;

   this.breakModalLock();
   this.conf.jq('#' + this.conf.viewerID + '', this.conf.jqc).remove();
 }

 /**
  * Retain and lock scroll settings for later.
  *
  * @note: this is only necessary if this.createViewer is using a modal window
  * that floats in the DOM, as opposed to inline elements on the page.
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
   var modal = '', style, left = 0, top = 0;

   //
   //viewer container
   //
   style = [];
   style.push('position: absolute');
   style.push('background-color: rgba(0, 0, 0, 0.05)');
   style.push('width: 100%');
   style.push('height: 100%');
   style.push('z-index: 999');
   style.push('top: 0');
   style.push('left: 0');
   viewerStyle = this.conf.jq.trim(style.join('; '));


   //
   //image container
   //
   style = [];
   //determine useful positoins/sizes based on the given image
   top = (this.conf.jq(window).height() - this.pre[index].naturalHeight) / 2;
   left = this.pre[index].naturalWidth / 2;
   style.push('position: relative');
   style.push('top: ' + top + 'px');
   style.push('left: 50%');
   style.push('margin-left: -' + left + 'px');
   viewingStyle = this.conf.jq.trim(style.join('; '));

   //build the actual markup
   modal += '<div id="' + this.conf.viewerID + '" style="' + viewerStyle + '">';
   modal += '<div class="viewing" style="' + viewingStyle + '">';
   modal += this.getImgTag(index, 'medium');
   modal += '</div><!--//.viewing-->';
   modal += '</div><!--//#' + this.conf.viewerID + '-->';

   return modal;
 }

 /**
  *
  */
 Slides.prototype.view = function (index) {
   this.current = index;

   var $viewing = this.conf.jq('#' + this.conf.viewerID + ' .viewing', this.conf.jqc);
   var requested = this.getImgTag(index, 'medium');
   var $current = this.conf.jq('img', $viewing);

   var S = this;
   $current.fadeOut(function () {
     $current.remove();
     S.conf.jq(requested).hide().appendTo($viewing);
     S.conf.jq('img', $viewing).fadeIn();
   });
   return this;
 }

 /**
  * Load the requested page of slides within the grid.
  */
 Slides.prototype.loadPage = function (page) {
   //@TODO: code this

   return this;
 }

 /**
  *
  */
 Slides.prototype.next = function () {
   this.view((this.current * 1) + 1);
   return this;
 }

 /**
  *
  */
 Slides.prototype.previous = function () {
   this.view((this.current * 1) - 1);
   return this;
 }

 /**
  *
  */
 Slides.prototype.pausePlay = function () {
   //@TODO: code this

   return this;
 }
})()

