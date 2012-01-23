/**
 * @file: slide-show and grid-display manager.
 *
 * @TODO: bug: click slide #2 on page 1, hit left-key, cannot transition to 1st slide.
 */

(function() {
  /***
   *
   */
  Slides = function (config) {
    //some constants
    this.regex = {
      slideHash: /^#slide\/(\d+)$/,
      pageHash: /^#page\/(\d+)$/,
    };

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
   */
  Slides.prototype.initConfig = function (config) {
    var self = this;

    //
    //end-user's GET request takes highest priority
    //
    var current = document.location.hash.match(this.regex.slideHash),
        page = document.location.hash.match(this.regex.pageHash);
    if (current && 'length' in current && current.length > 1) {
      config.current = parseInt(current.pop(), 10) - 1;
    }
    else if (page && 'length' in page && page.length > 0) {
      config.currentPage = parseInt(page.pop(), 10) - 1;
    }


    //
    //default configuration
    //
    this.conf = config || {};
    this.conf = {
      slider: self.conf.slider || null,
      images: self.conf.images || null,
      pageSize: self.conf.pageSize || 3,
      current: self.conf.current || null,
      currentPage: (function () {
        if (!self.conf.currentPage && self.conf.currentPage !== 0) {
          return self.pageNumber(self.conf.current || 0);
        }
        else {
          return self.conf.currentPage;
        }
      })(),
      slideTag: self.conf.slideTag || 'span',
      viewerID: self.conf.viewerID || 'viewer',
      filmStrip: self.conf.filmStrip || false,
      nextButton: self.conf.nextButton || null,
      prevButton: self.conf.prevButton || null,
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

    //check the user's requested-page number.
    if (!this.checkPageBounds(this.conf.currentPage)) {
      var pageReq = document.location.hash.match(this.regex.pageHash),
        lastPage = this.pageNumber(this.conf.images.length - 1);

      //user GET-requested a non-sensical page number
      if (!pageReq) {
        this.conf.currentPage = 0;
      }
      else if (parseInt(pageReq.pop(), 10) > lastPage) {
        this.conf.currentPage = lastPage;

        //user just made a request that was too high
        document.location.hash = 'page/' + (lastPage + 1);
      }
      else {
        this.conf.currentPage = 0;

        //the user *did* make a hash-page request and its no good
        document.location.hash = '';
      }
    }

    //let user know if they're at one end or another
    this.warnBoundaryPage();
  }

  /**
   * Create necessary grid, DOM elements, and initialize event bindings as
   * necessary.
   */
  Slides.prototype.initGrid = function () {
    var $slide, S = this;

    //sanity check
    var $slides = this.conf.jq('.slide', this.conf.slider);
    if ('length' in $slides && $slides.length > 0) {
      //grid already exists
      return this;
    }

    //build the slides, configured for the correct page
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
   */
  Slides.prototype.initBindings = function () {
    var S = this;

    //
    //user clicks on a thumbnail
    //
    this.conf.jq('.' + this.conf.slideClass, this.conf.slider)
      .click(function (event) {
        S.createViewer(S.conf.jq(this).attr('data-slide'));
      });

    //
    //user clicks on "next/previous"-page buttons
    //
    this.conf.jq(this.conf.nextButton).click(function () {
      S.nextPage();
    });
    this.conf.jq(this.conf.prevButton).click(function () {
      S.previousPage();
    });

    //
    //keyboard events
    //
    this.conf.jq(this.conf.jqc).keyup(function (e) {
      switch (e.which) {
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
    });
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
    if (!index && index !== 0) {
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
   */
  Slides.prototype.getViewerMarkup = function (index) {
    var modal = '';

    var styles = this.viewerStyles(index);

    //
    //build the actual markup
    //

    modal += '<div id="' + this.conf.viewerID + '" style="' + styles.viewer + '">';

    //toolbar
    modal += '<div class="toolbar" style="' + styles.toolbar + '">';
    modal += '<span class="prev-slide" style="float: left;">&laquo;&nbsp;Previous</span>';

    modal += '<span class="orig" style="margin-left: 3em;">';
    modal += 'Full size ';
    modal += '"<em style="text-decoration: underline;">';
    modal += this.conf.images[index].name + '</em>"';
    modal += '</span>';

    modal += '<span class="next-slide" style="float: right;">Next&nbsp;&raquo;</span>';
    modal += '</div>'; //close toolbar

    //actual viewer content
    modal += '<div class="viewing" style="' + styles.viewing + '">';
    modal += this.getImgTag(index, 'medium');
    modal += '</div>';

    modal += '</div>'; //close the viewer

    return modal;
  }

  /**
   * Return strings to be used as the "style" attribute of viewer and its inner
   * viewing div.
   */
  Slides.prototype.viewerStyles = function (index) {
    var viewer = [], viewing = [], toolbar = [], left = 0, top = 0;

    //calculate some image-dependent dimensions
    if (this.pre[index]) {
      top = (this.conf.jq(window).height() - this.pre[index].naturalHeight) / 2;
      left = this.pre[index].naturalWidth / 2;
    }

    //
    //viewer container
    //
    viewer.push('position: absolute');
    viewer.push('background-color: rgba(0, 0, 0, 0.5)');
    viewer.push('width: 100%');
    viewer.push('height: 100%');
    viewer.push('z-index: 999');
    viewer.push('top: 0');
    viewer.push('left: 0');
    viewer = this.conf.jq.trim(viewer.join('; '));

    //
    //toolbar for buttons/links
    //
    toolbar.push('position: relative');
    toolbar.push('top: ' + top + 'px');
    toolbar.push('left: 50%');
    toolbar.push('margin-left: -' + left + 'px');
    toolbar.push('color: #ffffff');
    toolbar.push('height: 2em');
    toolbar.push('line-height: 2em');
    toolbar.push('font-size: 1em');
    toolbar.push('font-weight: bold');
    toolbar.push('text-align: left');
    toolbar.push('background-color: rgba(0, 0, 0, 0.3)');
    toolbar.push('width: ' + (this.pre[index].naturalWidth - 12) + 'px');
    toolbar.push('padding-left: 6px');
    toolbar.push('padding-right: 6px');
    toolbar.push('margin-bottom: 1ex');
    toolbar.push('-webkit-border-radius: 3px');
    toolbar.push('-moz-border-radius: 3px');
    toolbar.push('border-radius: 3px');
    toolbar = this.conf.jq.trim(toolbar.join('; '));

    //
    //image container
    // - Determine useful positoins/sizes based on the given image.
    //
    viewing.push('position: relative');
    viewing.push('top: ' + top + 'px');
    viewing.push('left: 50%');
    viewing.push('margin-left: -' + left + 'px');
    viewing.push('width: ' + this.pre[index].naturalWidth + 'px');
    viewing = this.conf.jq.trim(viewing.join('; '));

    return {
      viewer: viewer,
      viewing: viewing,
      toolbar: toolbar
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
    if (this.checkPageBounds(page)) {
      //keep track of the new page
      this.conf.currentPage = page;
    }
    else {
      return false;
    }

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

    //let user know they're at one end or another
    this.warnBoundaryPage();

    //
    //update hash for our user
    //
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
   * Determine if the proposed slide index is within our bounds.
   */
  Slides.prototype.checkViewerBounds = function (index) {
    if (index > this.conf.images.length || index < 0) {
      var $viewer = this.conf.jq('#' + this.conf.viewerID, this.conf.jqc);

      //warn our user
      var bound;
      if (index < 0) {
        bound = 'low';
      }
      else {
        bound = 'high';
      }
      this.warnOutOfBounds($viewer, bound);

      return false;
    }
    return true;
  }

  /**
   * Modify the dom by addeding a few classes to let our user know they've
   * reached out of their bounds in some way.
   */
  Slides.prototype.warnOutOfBounds = function (boundedBy, limit, warning) {
    warning = parseInt(warning, 10)? warning : 1500;

    boundedBy.addClass('reach');
    boundedBy.addClass('reached-' + limit);
    window.setTimeout(function() {
        boundedBy
          .removeClass('reach')
          .removeClass('reached-' + limit);
    }, warning);

    return this;
  }

  /**
   * Modify the DOM by adding a few classes to let our user know they've
   * reached page boundaries.
   */
  Slides.prototype.warnBoundaryPage = function () {
    var lastPage = this.pageNumber(this.conf.images.length - 1);

    //give some feedback if we're currently at our boudnaries
    if (this.conf.currentPage == lastPage || this.conf.currentPage == 0) {
      if (this.conf.currentPage == 0) {
        this.conf.jq(this.conf.prevButton, this.conf.jqc).addClass('disabled');
      }
      else {
        this.conf.jq(this.conf.nextButton, this.conf.jqc).addClass('disabled');
      }
    }
    else {
      this.conf.jq(this.conf.prevButton, this.conf.jqc).removeClass('disabled');
      this.conf.jq(this.conf.nextButton, this.conf.jqc).removeClass('disabled');
    }

    return this;
  }


  /**
   * Determine if the proposed page index is within our bounds.
   */
  Slides.prototype.checkPageBounds = function (page) {
    page = parseInt(page, 10);

    var lastPage = this.pageNumber(this.conf.images.length - 1);
    if (page == NaN || page < 0 || page > lastPage) {
      var limit;
      if (page < 0) {
        limit = 'low';
      }
      else {
        limit = 'high';
      }
      this.warnOutOfBounds(this.conf.slider, limit);
      return false;
    }
    return true;
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
    var current = parseInt(this.conf.currentPage, 10);
    this.setPage(current + 1, current);
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
    var current = parseInt(this.conf.currentPage, 10);
    this.setPage(current - 1, current);
    return this;
  }

  /**
   * @TODO: code this
   */
  Slides.prototype.pausePlay = function () {

    return this;
  }
})()

