/**
 * @file: slide-show and grid-display manager.
 */

(function() {
 /***
  *
  */
 Slides = function (config) {
   //intialize config
   this.initConfig(config);

   //initialize each slide in our grid
   this.initGrid();

   //bind to events in DOM for our features
   this.initBindings();

   //start the viewer, if necessary
   this.createViewer();

   return this;
 }

 /**
  * Initialize configuration with our own defaults.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.initConfig = function (config) {
   var self = this;

   //default configuration
   this.conf = config || {};
   this.conf = {
     slider: self.conf.slider || null,
     images: self.conf.images || null,
     pageSize: self.conf.pageSize || 3,
     current: self.conf.current || null,
     currentPage: self.conf.currentPage || (function () {
       return self.pageNumber(self.conf.current || 0);
     })(),
     slideTag: self.conf.slideTag || 'li',
     viewerID: self.conf.viewerID || 'viewer',
     filmStrip: self.conf.filmStrip || false,
     slideClass: self.conf.slideClass || 'slide',
     jqc: self.conf.context || window.document,
     jq: self.conf.jq || (function () {
       if ('slider' in self.conf && 'jquery' in self.conf.slider) {
         return self.conf.slider.constructor;
       }
       else {
         return null;
       }
     })(),
   }

   //sanity check
   if (this.conf.images == null || this.conf.slider == null) {
     var ConfigurationException, e;
     function ConfigurationException () {
       this.name = 'ConfigurationException';
       this.message = 'Must pass "slider" and "images" properties to config object of Slides().';
     }
     e = new ConfigurationException();
     console.error(e.message);
     throw e;
   }
 }

 /**
  * Create necessary grid, DOM elements, and initialize event bindings as
  * necessary.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.initGrid = function () {
   var $slide, S = this;

   //sanity check
   var $slides = this.conf.jq('.slide', this.conf.slider);
   if ('length' in $slides && $slides.length > 0) {
     //grid already exists
     return this;
   }

   this.conf.currentPage = this.conf.currentPage || 0;
   for (var i in this.conf.images) {
     //get our slide markup
     $slide = this.conf.jq(this.getSlideMarkup(i));
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
         if (S.conf.current === null) {
           //user doesn't have viewer open; switch pages.
           S.previousPage();
         }
         else {
           S.previous();
         }
         break;

       //next slide
       case 39: // right-arrow
       case 74: // j
       case 78: // n
         if (S.conf.current === null) {
           //user doesn't have viewer open; switch pages.
           S.nextPage();
         }
         else {
           S.next();
         }
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
   this.pre = this.pre || [];
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
   var page = this.pageNumber(index);

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
  * Get the page number for the proposed index.
  */
 Slides.prototype.pageNumber = function (index) {
   if (!index) {
     return null;
   }

   var page = Math.floor(index / this.conf.pageSize);
   if (index % this.conf.pageSize) {
     ++page;

     if (page != 0) {
       page -= 1;
     }
   }

   return page;
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
   slide += ' />'

   return slide;
 }

 /**
  * Initialize the viewer and create scroll locks.
  */
 Slides.prototype.createViewer = function(index) {
   index = (typeof(index) == 'undefined')? this.conf.current : index;
   if (!index || !this.setCurrent(index)) {
     return false;
   }

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
   this.conf.current = null;
   if (parseInt(this.conf.currentPage, 10) == NaN) {
     document.location.hash = '';
   }
   else {
     document.location.hash = 'page/' + (this.conf.currentPage + 1);
   }

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
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    ];
    var $html = this.conf.jq('html');

    //retain current settings
    this.modal = this.modal || {
      lock: {
        scrollPosition: scrollPos,
        overFlow: $html.css('overflow'),
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
   var modal = '';

   var styles = this.viewerStyles(index);

   //build the actual markup
   modal += '<div id="' + this.conf.viewerID + '" style="' + styles.viewer + '">';
   modal += '<div class="viewing" style="' + styles.viewing + '">';
   modal += this.getImgTag(index, 'medium');
   modal += '</div>';
   modal += '</div>';

   return modal;
 }

 /**
  * Return strings to be used as the "style" attribute of viewer and its inner
  * viewing div.
  */
 Slides.prototype.viewerStyles = function (index) {
   var viewer = [], viewing = [], left = 0, top = 0;

   //
   //viewer container
   //
   viewer.push('position: absolute');
   viewer.push('background-color: rgba(0, 0, 0, 0.05)');
   viewer.push('width: 100%');
   viewer.push('height: 100%');
   viewer.push('z-index: 999');
   viewer.push('top: 0');
   viewer.push('left: 0');
   viewer = this.conf.jq.trim(viewer.join('; '));

   //
   //image container
   // - Determine useful positoins/sizes based on the given image.
   //
   if (this.pre[index]) {
     top = (this.conf.jq(window).height() - this.pre[index].naturalHeight) / 2;
     left = this.pre[index].naturalWidth / 2;
   }
   viewing.push('position: relative');
   viewing.push('top: ' + top + 'px');
   viewing.push('left: 50%');
   viewing.push('margin-left: -' + left + 'px');
   viewing = this.conf.jq.trim(viewing.join('; '));

   return {
     viewer: viewer,
     viewing: viewing
   };
 }

 /**
  *
  */
 Slides.prototype.view = function (index) {
   if (!this.setCurrent(index)) {
     return this;
   }

   var $viewing = this.conf.jq('#' + this.conf.viewerID + ' .viewing', this.conf.jqc);
   var requested = this.getImgTag(index, 'medium');
   var $current = this.conf.jq('img', $viewing);

   var S = this;
   $current.fadeOut(function () {
     var styles = S.viewerStyles(index);
     $current.remove();
     S.conf.jq(requested).hide().appendTo($viewing);

     //adjust for the new image
     $viewing.attr('style', styles.viewing)
       .parent('#' + S.conf.viewerID)
       .attr('style', styles.viewer);

     S.conf.jq('img', $viewing).fadeIn();
   });
   return this;
 }

 /**
  * Update the this.conf.current to a new index.
  */
 Slides.prototype.setCurrent = function (index) {
   var live = this.conf.current;
   if (index && this.checkViewerBounds(index)) {
     this.conf.current = parseInt(index, 10);
     document.location.hash = 'slide/' + (this.conf.current + 1);
   }
   else {
     return false;
   }

   //
   //update our page if necessary
   //
   var shouldBePage = this.pageNumber(this.conf.current);
   if (shouldBePage != this.conf.currentPage) {
     this.setPage(shouldBePage, this.pageNumber(live));
   }

   return true;
 }

 /**
  * Set our current page of slides.
  *
  * @param int page
  *   Numeric 0-based index of the page number you'd like to see slides for.
  * @param int current
  *   Optional page number currently being viewed, if not the same page as
  *   this.conf.current (which may have been updated already to something else,
  *   before this method was called). Defaults to
  *   this.pageNumber(this.conf.current)
  *   @see this.setCurrent for example use-case.
  */
 Slides.prototype.setPage = function (page, current) {
   current = (typeof(current) == 'undefined')? this.pageNumber(this.conf.current) : current;

   var i = 0, $slide,
       liveSlides = this.slidesOnPage(current),
       newSlides = this.slidesOnPage(page);

   //
   //hide currently live slide
   //
   for (i in liveSlides) {
     this.conf.jq('[data-slide="' + liveSlides[i] + '"]',
         this.conf.slider).hide();
   }

   //
   //load slides onto grid
   //
   i = 0;
   for (i in newSlides) {
     this.preLoad(newSlides[i]);
     $slide = this.conf.jq('[data-slide="' + newSlides[i] + '"]',
         this.conf.slider);

     if (!$slide.children('img').length) {
       $slide.append(this.getImgTag(newSlides[i]));
     }
     $slide.show();
   }

   //keep track of the new page
   this.conf.currentPage = page;
   if (this.conf.current == null) {
     //viewer is closed, appropriate to update #page/x
     document.location.hash = 'page/' + (this.conf.currentPage + 1);
   }
 }

 /**
  * Return an array of integers representing the index values of slides that we
  * *should* theoritically find on a given page.
  */
 Slides.prototype.slidesOnPage = function (page) {
   var slides = [], last, first;
   page = (typeof(page) == 'undefined')? this.conf.current : page;
   if (page == null) {
     return slides;
   }

   last = (this.conf.pageSize * (page + 1));
   first = last - this.conf.pageSize;
   for (var i = first; i < last; i++) {
     slides.push(i);
   }

   return slides;
 }

 /**
  * Determine if the proposed index is within our bounds.
  *
  * @TODO: this should be "protected/private".
  */
 Slides.prototype.checkViewerBounds = function (index) {
   var $viewer = this.conf.jq('#' + this.conf.viewerID, this.conf.jqc);
   if (index > this.conf.images.length || index < 0) {
     //let the user know
     $viewer.addClass('reach');

     //be more specific
     if (index < 0) {
       $viewer.addClass('reached-beginning');
     }
     else {
       $viewer.addClass('reached-end');
     }
     window.setTimeout(function() {
         $viewer
           .removeClass('reach')
           .removeClass('reached-beginning')
           .removeClass('reached-end');
     }, 1500);

     return false;
   }
   return true;
 }

 /**
  * Load the requested page of slides within the grid.
  */
 Slides.prototype.loadPage = function (page) {
   //@TODO: code this

   return this;
 }

 /**
  * Switch our current viewer to the next slide.
  */
 Slides.prototype.next = function () {
   this.view((this.conf.current * 1) + 1);
   return this;
 }

 /**
  * @TODO: code this
  */
 Slides.prototype.nextPage = function () {
   return this;
 }

 /**
  * Switch our current viewer to the previous slide.
  */
 Slides.prototype.previous = function () {
   this.view((this.conf.current * 1) - 1);
   return this;
 }

 /**
  * @TODO: code this
  */
 Slides.prototype.previousPage = function () {
   this.view((this.conf.currentPage * 1) - 1);
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

