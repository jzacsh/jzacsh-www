/**
 * @file: Slide show and grid-display manager.
 *
 * @TODO(zacsh) refactor, abstract conf.current and conf.currentPage:
 *   Currently ClientURL and conf.current{,Page} are separate entities, they
 *   should be managed via a single API that keeps both conf.pager and
 *   conf.current* up to date in a reliable manner.
 * @TODO(zacsh) fix initialization of slide/# page/# on load:
 *   Once the above TODO is done, address this one, making sure initial load
 *   of the correct slide/page is correctly executed.
 * @TODO(zacsh) emit events at critical points:
 *   This will allow easy extension of many things (eg.: pulling the grid
 *   management into a separate class, that simply inspects and accepts an
 *   instantiated Slides object, or even allowing filmstrip feature to be
 *   similarly developed externally to Slides).
 * @TODO(zacsh) remove dependency on jQuery:
 *   Refactor to rely on plain DOM manipulation, in place of jQuery being
 *   passed in.
 */

/**
 * Closure defining Slides for global use and private classes for internal use.
 *   - Slides: Public class for Slide shows, which builds its own grid-display.
 *     Slides is attached to global scope that's passed in.
 *   - Pager: Private class to manage all of the logic for paging correctly in
 *     a single place.
 *   - ClientURL: Private class to manage and interface with
 *     window.document.location.hash, keeping all the pass-traversing logic in
 *     a single place.
 */
(function(global, window) {
  /**
   * Calculate basic Table of Contents for a set of items, where the two provided
   * knowns are the number of items and the size of chunk when viewing the items.
   *
   * @param {int} [setSize]
   *   The number of items that will be paged through.
   * @param {int} [chunkSize]
   *   The maximum preferred size of a chunk of the items being viewed.
   * @return {Pager}
   *   - setSize: [setSize]
   *   - chunkSize: [chunkSize]
   *   - numOfChunks: number of chunks our set will be broken into
   *   - lastChunkSize: number of items that will apprea in the last chunk
   *   - chunks: assuming [setSize] is the length of some array, this
   *   will be an array representing each chunk, in sequence, containing the
   *   array indexes from our set, that a given chunk will contain.
   * @constructor
   */
  var Pager = function (setSize, chunkSize) {
    var self = this;

    this.setSize = setSize;
    this.chunkSize = chunkSize;
    this.numOfChunks = Math.ceil(setSize / chunkSize);
    this.lastChunkSize = setSize % chunkSize || chunkSize;
    this.chunks = (function () {
      var indexes = [];

      var from = 0,
          chunk = 0,
          getTo = function() { return from + self.chunkSize - 1; };
      for (from = 0; from < self.setSize; from += (self.chunkSize)) {
        to = getTo();

        indexes[chunk] = { from: from, to: to };
        for (var n = from; (n <= to && n < self.setSize); n++) {
          indexes[chunk][n] = true;
        }

        if (!(to < self.setSize)) {
          // the last chunk item set that was set:
          indexes[chunk].to = n - 1;
        }

        ++chunk;
      }

      return indexes;
    })();

    return this;
  }

  /**
   * Determine which chunk should contain a given item in our set.
   *
   * @param {int} [item]
   *   The numeric index of the item out of the set this.setSize represents, for
   *   which we'd like to know the containing chunk. False if [index] is not
   *   within this.setSize.
   * @param {int|bool}
   *   The numeric index representing which chunk will contain [item], or false
   *   if this.isValidItem fails.
   *   @see this.isValidItem
   */
  Pager.prototype.getContainingChunk = function (item) {
    var self = this;
    if (!this.isValidItem(item)) {
      return false;
    }
    item = Math.floor(item);

    for (var i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].hasOwnProperty(item)) {
        return i;
      }
    }

    console.error("Warning: bug found in Pager.getContainingChunk," +
        " couldn't find chunk within this.chunks. Report: setSize=%d," +
        " chunkSize=%d, item=%d.\n", this.setSize, this.chunkSize, item);
  }

  /**
   * Determine if the proposed numeric index, [item], representing an item
   * within our paged set of items is possible.
   *
   * @param {int} [item]
   * @return {bool}
   */
  Pager.prototype.isValidItem = function (item) {
    item = parseInt(item, 10);
    return (!isNaN(item) && item >= 0 && item < this.setSize);
  }

  /**
   * Determine if [chunk] exists within our proposed set.
   *
   * @param {int} chunk
   */
  Pager.prototype.isValidChunk = function (chunk) {
    chunk = parseInt(chunk, 10);

    if (!isNaN(chunk) && chunk >= 0 && chunk < this.chunks.length) {
      return true;
    }
    return false;
  }

  /**
   * Return an Array of representing items a given chunk contains.
   *
   * @return {Array|bool} items
   *   False, if chunk is invalid.
   */
  Pager.prototype.getItemsInChunk = function (chunk) {
    // sanity check
    if (!this.isValidChunk(chunk)) {
      return false;
    }

    var items = [];
    for (var i = this.chunks[chunk].from; i <= this.chunks[chunk].to; i++) {
      items.push(i);
    }
    return items;
  }

  /**
   * Client-side URL management via hash on document.location.
   *
   * @note *very* basic, just to fulfill the needs of Slides.
   *
   * @param {Array} [paths]
   *   Set of possible Possible strings expected for use as hash paths.
   * @return {ClientURL} this
   * @constructor
   */
  var ClientURL = function (paths) {
    var self = this;
    if (!(window.document.hasOwnProperty('location') &&
          window.document.location.hasOwnProperty('hash'))) {
      return false;
    }

    this.loc = window.document.location;

    var pathRegex;
    this.regex = {};
    for (var i = 0; i < paths.length; i++) {
      pathRegex = '^#' + paths[i] + '\\/(\\d+)$';
      this.regex[paths[i]] = new RegExp(pathRegex);
    }

    // ensure getCurrent() runs correctly
    this._lastRun = this.loc.hash + '_neverRun';

    return this;
  }

  /**
   * Delete our client's current request.
   *
   * @return {ClientURL} this
   */
  ClientURL.prototype.clear = function (path) {
    this.loch.hash = '';
    return this;
  }

  /**
   * Get the current request being made via client-side GET request.
   *
   * @return {Object|false|null}
   *   If there is no request in location.hash null, false if the user
   *   requested something we're not configured to parse. Otherwise, an object
   *   with the following contents:
   *   - {string} [path]: the path the user is making a request on.
   *   - {int} [req]: the actual argument the user is requesting from this path.
   *   - {bool} [valid]: if the user's current request is valid according to
   *   this ClientURL instantiation.
   *   - {bool} [invalid]: opposite of valid
   */
  ClientURL.prototype.getCurrent = function () {
    var self = this;

    // check our cache, first
    if (this._lastRun != this.loc.hash) {
      var current = {
        invalid: false,
        path: null,
        req: null,
      };

      if (typeof this.loc.hash == 'undefined') {
        // trim superfluous slashes
        this.loc.hash = (function () {
          var leading = self.hash.match(/^\/*(.+)/);
          if (leading) {
            self.hash = leading.pop();
          }
          var trailing = self.hash.match(/(.+)\/+$/);
          if (trailing) {
            self.hash = trailing.pop();
          }
        })();

        if (this.getHash() != '') {
          var pathArg;
          for (var path in this.regex) {
            current.req = (function () {
              var found = self.getHash().match(self.regex[path]);
              return (typeof found == 'null'? null : parseInt(found.pop(), 10));
            })();

            if (current.req) {
              current.path = path;
              break;
            }
          }

          // user requested *something* that we don't understand
          current.invalid = true;
        }
      }

      // convenience
      current.valid = !current.invalid;

      // cache results
      this._current = current;
      this._lastRun = this.loc.hash;
    }
    return this._current;
  }

  /**
   * Get the current window.document.location.hash contents, falling back
   * safely on an empty string.
   *
   * @return {string}
   *   window.document.location.hash if defined, or an empty string.
   */
  ClientURL.prototype.getHash = function () {
    return this.loc.hash || '';
  }

  /**
   * Get the current request made via client-side GET request, regardless of
   * valiidity.
   *
   * @note calling ClientURL.prototype.getCurrent().req is probably better
   * suited for most cases.
   *
   * @return {string}
   *   The current contents of getHash(), with superfluous characters stripped
   *   out.
   *   @see this.getHash
   */
  ClientURL.prototype.getRawReq = function () {
    var rawHash = this.getHash();
    var haveRequest = rawHash.match(/^#(.*)$/);

    return haveRequest? haveRequest.pop() : rawHash;
  }

  /**
   * Determine if the current instantiation allows for path, [path].
   *
   * @param {string} [path]
   * @return {bool}
   */
  ClientURL.prototype.isValidPath = function (path) {
    return this.regex.hasOwnProperty(path);
  }

  /**
   * Determine if [path]/[req] is theoritically a possible request given the
   * current instantiation.
   *
   * @param {string} [path]
   * @param {string} [req]
   * @return {bool}
   */
  ClientURL.prototype.isValidReq = function (path, req) {
    if (this.isValidPath(path)) {
      var mockHash = '#' + path + '/' + req;
      return mockHash.match(this.regex[path])? true : false;
    }
    return false;
  }

  /**
   * Get the current request made via client-side GET request.
   *
   * @param {string} [path]
   *   The path for which you'd like to know the user's request.
   * @return {int|null|false}
   *   The argument passed via GET to [path]/. If [path] is not in our
   *   configuration, false is returned to indicate this function was called
   *   incorrectly. null, otherwise.
   */
  ClientURL.prototype.getPath = function (path) {
    // sanity check
    if (!this.regex.hasOwnProperty(path)) {
      console.error('ClientURL config error: requesting path="%s", but never' +
          ' instantiated with that path.', path);
      return false;
    }

    if (this.getCurrent().valid && path == this.getCurrent().path) {
      return this.getCurrent().req;
    }
    return null;
  }

  /**
   * Update location.hash to [path]/[req].
   *
   * @param {string} [path]
   *   A valid [path] that corresponds to something ClientURL was instantiated
   *   with.
   * @param {int} [req]
   *   A valid request argument to [path].
   * @return {ClientURL|bool}
   *   false if the requested setPath call would result in an invalid request.
   */
  ClientURL.prototype.setPath = function (path, req) {
    if (this.isValidReq(path, req)) {
      this.loc.hash = path + '/' + req;
      // emit an event here?
      return this;
    }
    return false;
  }


  /////////////////////////////////////////////////////////////////////////////


  /**
   * @constructor
   *
   * @param {Object} [config]
   *   Configuration for Slides instance, requiring only a few items but taking
   *   many options. Specifically:
   *   - slider: Required. jQuery selection of the DOM node that our of slides
   *     should be managed in.
   *   - pageSize: the maximum number of slides that should show up on a given
   *     page within our auto-managed grid.
   *     @see Pager
   *   - images: Required. Array of images that that will be used as slides,
   *     each represented as an Object with the following contents:
   *     - src: Required. absolute URL that should be used to render this
   *       slide.
   *     - name: Optional. Copy used to represent this image as a title.
   *     // ...: N number of copies of the "src" key, each named for their
   *        // intent (eg.: "medium", "small", "large").
   *        // @note: currently only "medium" is implemented, and no way of
   *        // extending this behavior for new keys has been thought of.
   *   - currentPage: Optional. Defaults to the page containing the current
   *     slide being viewed, or 0.
   *     @note requests specified via document.location.hash URL take
   *     precedence over this option.
   *   - slideTag: Optional. The DOM nodeType that should be used to wrap each
   *     slide image node. Defaults to 'span'.
   *   - viewerToolbarMarkup: self.conf.viewerToolbarMarkup || null,
   *   - viewerID: Optional. The css id that should be used when building
   *     viewer for slides to be displayed in. Defaults to 'viewer'.
   *   - nextButton: Optional. The jQuery selection of the DOM node for which
   *     clicks should be listened when binding calls to Slides.nextPage and
   *     Slides.previousPage. Defaults to null.
   *   - prevButton Optional. @see [config].nextButton. Defaults to null.
   *   - slideClass: Optional css class that should be used to mark up each
   *     slide. Defaults to 'slide'.
   *   - jq: Optional, as usually extracted from config.slider. If this won't
   *     be possible, then jQuery should be passed here.
   *   - jqc: Optional. The context parameter that should be used when calling
   *     jQuery self.conf.context, defaults to window.document.
   *   @see {Slides}.initConfig and {Slides} constructor
   */
  Slides = function (config) {
    // initialize private utilities
    this.url = new ClientURL(['slide', 'page']);
    this.pager = new Pager(config.images.length, (config.pageSize || 3));

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
    // End-user's GET request takes highest priority
    //
    config.current = this.url.getPath('slide') || null;
    if (!config.current) {
      config.currentPage = (function(conf) {
        var userSays = self.url.getPath('page');
        return typeof userSays == 'number'? userSays : conf;
      })(config.currentPage);
    }

    //
    // Load API caller's configuration
    //
    this.conf = config || {};

    //
    // Load default configuration.
    //
    this.conf = {
      slider: self.conf.slider || null,
      images: self.conf.images || null,
      current: self.conf.current || null,
      currentPage: (function () {
        if (self.pager.isValidChunk(self.conf.currentPage)) {
          return self.conf.currentPage;
        }
        else {
          return self.pager.getContainingChunk(self.conf.current || 0);
        }
      })(),
      slideTag: self.conf.slideTag || 'span',

      //@TODO(zacsh) code, then document this feature on Slides doxygen:
      filmStrip: self.conf.filmStrip || false,

      viewerToolbarMarkup: self.conf.viewerToolbarMarkup || null,
      IDs: {
        viewer: self.conf.viewerID || 'viewer',
        next: self.conf.nextButton || null,
        prev: self.conf.prevButton || null,
      },
      slideClass: self.conf.slideClass || 'slide',
      jqc: self.conf.context || window.document,
      jq: self.conf.jq || (function () {
        if (self.conf.hasOwnProperty('slider') &&
          typeof self.conf.slider.jquery != 'undefined') {
          return self.conf.slider.constructor;
        }
        else {
          return null;
        }
      })(),
    }

    // Sanity check
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

    // Check the user's requested-page number.
    if (!this.checkPageBounds(this.conf.currentPage)) {
      var lastPage = this.pager.getContainingChunk(this.pager.setSize - 1);

      if (this.url.getCurrent().invalid) {
        // user GET-requested a non-sensical page number (eg.: negative, or not
        // an int).
        this.conf.currentPage = 0;
        this.url.clear();
      }
      else if (this.url.getPath('page') > lastPage) {
        // user request was too high, adjust it to maximum
        this.conf.currentPage = lastPage;
        this.url.setPath('page', (lastPage + 1));
      }
    }

    // Let user know if they've reached an outer limit.
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

    //pre load images to enable dimension-based placement in the browser
    this.preLoadPage(this.conf.currentPage);

    //build the slides, configured for the correct page
    for (var i = 0; i< this.conf.images.length; i++) {
      //get our slide markup
      $slide = this.conf.jq(this.getSlideMarkup(i));

      //hide it if it's out of view
      if ($slide.attr('data-page') != this.conf.currentPage) {
        $slide.hide();
      }

      //append our slide to the DOM, hidden or not.
      $slide.appendTo(this.conf.slider);
    }
    this.conf.jq('<div class="clear"></div>').appendTo(this.conf.slider);
    this.conf.jq('<div id="' + this.conf.IDs.viewer + '"></div>').appendTo(window.document);

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
    this.conf.jq(this.conf.IDs.next).click(function () {
      S.nextPage();
    });
    this.conf.jq(this.conf.IDs.prev).click(function () {
      S.previousPage();
    });

    //
    //user clicks somewhere inside viewer
    //
    //@note user should write their own click handlers if they're generating
    //their own content
    //
    if (!this.conf.viewerToolbarMarkup) {
      //user clicks main full-size image link
      this.conf.jq(this.conf.jqc).on('click', '#' + this.conf.IDs.viewer + ' a', function (e) {
        e.preventDefault();
        window.document.location = S.conf.jq(this).attr('href');
      });

      //user clicks next/previous links
      var slideChanger = function (e) {
        if (S.conf.jq(this).hasClass('prev-slide')) {
          S.previous();
        }
        else if (S.conf.jq(this).hasClass('next-slide')) {
          S.next();
        }
        return false;
      };
      this.conf.jq(this.conf.jqc).on('click',
          '#' + this.conf.IDs.viewer + ' .prev-slide', slideChanger);
      this.conf.jq(this.conf.jqc).on('click',
          '#' + this.conf.IDs.viewer + ' .next-slide', slideChanger);
    }

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
   * Preload all images for a given page of slides, primarily so that we will
   * have dimension information on the image we're dealing with, *before* we
   * show it.
   * @TODO: this is probably hacky and sloppy. What to do, what to do??
   *
   * @see this.viewerStyles().
   *
   * @param <int> page
   *   Numeric index of the page of slides to be pre-loaded.
   * @param <boolean> buffer
   *   Indicates if immediately surrounding pages should be pre-loaded as well.
   *   This is recommended, so transitions to new pages do not result in
   *   dimension-less placement of an image in its view. Defaults to true.
   */
  Slides.prototype.preLoadPage = function (page, buffer) {
    buffer = (typeof(buffer) == 'undefined')? true : buffer;
    page = parseInt(page, 10);

    //store all pre-loaded images in this.pre
    this.pre = this.pre || (new Array(this.conf.images.length));

    var self = this, i;
    /**
     * Preload a given slide number.
     */
    var preLoad = function (index) {
      if (typeof(self.pre[index]) == 'undefined') {
        var $img = self.conf.jq(self.getImgTag(index, 'medium'));
        self.pre[index] = $img.get(0);
      }
    }

    //
    //pre-load our current page's images.
    //
    var currentSlides = this.pager.getItemsInChunk(this.conf.currentPage);
    for (i in currentSlides) {
      preLoad(currentSlides[i]);
    }

    //
    //pre-load for the surrounding pages.
    //
    if (buffer) {
      //second most likely place for our user to go.
      var next = this.conf.currentPage + 1;
      if (this.checkPageBounds(next, false)) {
        var nextSlides = this.pager.getItemsInChunk(next);
        for (i in nextSlides) {
          preLoad(nextSlides[i]);
        }
      }

      //third most likely place for our user to go.
      var prev = this.conf.currentPage - 1;
      if (this.checkPageBounds(prev, false)) {
        var prevSlides = this.pager.getItemsInChunk(prev);
        for (i in prevSlides) {
          preLoad(prevSlides[i]);
        }
      }
    }
  }

  /**
   * Build the correct markup for a slide at index.
   */
  Slides.prototype.getSlideMarkup = function (index, preload) {
    var slide = '';
    var page = this.pager.getContainingChunk(index);

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
   * Get the page number for a given image index.
   */
  Slides.prototype.pageNumber = function (index) {
    if (!index && index !== 0) {
      return null;
    }

;

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
      if (S.conf.jq(e.target).is('#' + S.conf.IDs.viewer)) {
        S.destroyViewer();
      }
    });
    //user clicks on image, that doesn't count.
    var $img = this.conf.jq('#' + this.conf.IDs.viewer + ' .viewing img');
    $img.click(function (e) {
      return false;
    });
  }

  /**
   * Destroy the slider viewer we've used to take over the DOM.
   */
  Slides.prototype.destroyViewer = function () {
    this.conf.current = null;
    this.url.setPath('page', (this.conf.currentPage + 1));

    this.breakModalLock();
    this.conf.jq('#' + this.conf.IDs.viewer + '', this.conf.jqc).remove();
  }

  /**
   * Retain and lock scroll settings for later.
   *
   * @note: this is only necessary if this.createViewer is using a modal window
   * that floats in the DOM, as opposed to inline elements on the page.
   */
  Slides.prototype.getModalLock = function () {
     var scrollPos = [
       window.pageXOffset || window.document.documentElement.scrollLeft || window.document.body.scrollLeft,
       window.pageYOffset || window.document.documentElement.scrollTop || window.document.body.scrollTop
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
     // @TODO(zacsh): fix scrollTo() call, doesn't seem to move you up when
     // instantiating a slide.
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
    index = parseInt(index, 10);
    var modal = '';

    var disabled, dataMove, styles = this.viewerStyles(index);

    //
    //build the actual markup
    //

    modal += '<div id="' + this.conf.IDs.viewer + '" style="' + styles.viewer + '">';

    //toolbar customizable-contents
    modal += this.viewerToolbarMarkup(index, styles.toolbar);

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
      //@note this depends on this.preLoadPage() having run for
      //this.conf.currentPage
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
   * Render the markup needed for a given slide's toolbar text, between the
   * "previous" and "next" links.
   *
   * @note This is a default, that is meant to be easily overridden via
   * this.conf object's API, with the "viewerToolbarMarkup" property.
   *
   * @see this.conf
   *
   * @param <int> index
   *   The slide index for which markup should be built.
   * @param <string> styles
   *   Optional [style] attribute markup that should be used for the toolbar's
   *   outter-most div.
   */
  Slides.prototype.viewerToolbarMarkup = function (index, styles) {
    if (typeof(this.conf.viewerToolbarMarkup) == 'function') {
      //user defined a custom callback
      return this.conf.viewerToolbarMarkup.call(this, index, styles);
    }

    var modal = '';

    //start
    modal += '<div class="toolbar"';
    if (styles) {
      modal += ' style="' + styles + '"';
    }
    modal += '>';

    //previous-slide button
    disabled = (index == 0)? ' color: rgba(255, 255, 255, 0.7);' : '';
    dataMove = (index == 0)? '' : ' data-move="' + (index - 1) + '"';
    modal += '<span class="slide-change prev-slide"' + dataMove;
    modal += ' style="float: left; cursor: pointer;' + disabled;
    modal += '">&laquo;&nbsp;Previous</span>';

    //current toolbar content
    modal += '<a class="orig" style="color: inherit; margin-left: 3em;"';
    modal += ' href="'+  this.conf.images[index].src +'" target="_blank">';
    modal += '"<em>' + this.conf.images[index].name + '</em>"';
    modal += '</a>';

    //next-slide button
    disabled = (index >= this.conf.images.length)? ' color: rgba(255, 255, 255, 0.7);' : '';
    dataMove = (index >= this.conf.images.length)? '' : (' data-move="' + (index + 1) + '"');
    modal += '<span class="slide-change next-slide"' + dataMove;
    modal += ' style="float: right; cursor: pointer;' + disabled;
    modal += '">Next&nbsp;&raquo;</span>';
    modal += '</div>'; //close toolbar

    return modal;
  }

  /**
   * Update our previously (@see this.initGrid) created DOM node with image
   * index, [index].
   *
   * @param {int} [index]
   *   The numeric 0-based index of the image that should  be placed in view.
   * @return {Slides} [this]
   */
  Slides.prototype.view = function (index) {
    if (!this.setCurrent(index)) {
      return this;
    }

    var $viewing = this.conf.jq('#' + this.conf.IDs.viewer + ' .viewing', this.conf.jqc),
      styles = this.viewerStyles(index),
      $toolbar = $viewing.siblings('.toolbar'),
      $current = this.conf.jq('img', $viewing),
      requested = this.getImgTag(index, 'medium'),
      toolbar = this.viewerToolbarMarkup(index, styles.toolbar);

    var S = this;
    $toolbar.fadeOut();
    $current.fadeOut(function () {
      //remove and rebuild our image
      $current.remove();
      S.conf.jq(requested).hide().appendTo($viewing);

      //adjust for the new image
      var $viewer = $viewing.attr('style', styles.viewing)
        .parent('#' + S.conf.IDs.viewer)
        .attr('style', styles.viewer);

      //remove and rebuild our toolbar
      $toolbar.remove();
      $toolbar = S.conf.jq(toolbar).hide().prependTo($viewer);

      //fade our new image in
      S.conf.jq('img', $viewing).fadeIn();

      //fade our new toolbar in
      $toolbar.fadeIn();
    });
    return this;
  }

  /**
   * Update the this.conf.current to a new index.
   */
  Slides.prototype.setCurrent = function (index) {
    index = parseInt(index, 10)
    var live = this.conf.current;
    if (this.pager.isValidItem(index) && this.checkViewerBounds(index)) {
      this.conf.current = index;
      this.url.setPath('slide', (this.conf.current + 1));
    }
    else {
      return false;
    }

    //
    //update our page if necessary
    //
    var shouldBePage = this.pager.getContainingChunk(this.conf.current);
    if (shouldBePage != this.conf.currentPage) {
      this.setPage(shouldBePage, this.pager.getContainingChunk(live));
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
   *   this.pager.getContainingChunk(this.conf.current)
   *   @see this.setCurrent for example use-case.
   */
  Slides.prototype.setPage = function (page, current) {
    current = (typeof(current) == 'undefined')? this.pager.getContainingChunk(this.conf.current) : current;
    if (this.checkPageBounds(page)) {
      //keep track of the new page
      this.conf.currentPage = page;
    }
    else {
      return false;
    }

    var i = 0, $slide,
        liveSlides = this.pager.getItemsInChunk(current) || [],
        newSlides = this.pager.getItemsInChunk(page) || [];

    //
    //hide currently live slide
    //
    for (i = 0; i < liveSlides.length; i++) {
      this.conf.jq('[data-slide="' + liveSlides[i] + '"]',
          this.conf.slider).hide();
    }

    //preload our new page of slides
    this.preLoadPage(page);

    //
    //load slides onto grid
    //
    i = 0;
    for (i = 0; i< newSlides.length; i++) {
      $slide = this.conf.jq('[data-slide="' + newSlides[i] + '"]',
          this.conf.slider);

      if (!$slide.children('img').length) {
        $slide.append(this.getImgTag(newSlides[i]));
      }
      $slide.show();
    }

    //let user know they're at one end or another
    this.warnBoundaryPage();

    //viewer is closed, appropriate to update #page/x
    if (this.conf.current === null) {
      this.url.setPath('page', (this.conf.currentPage + 1));
    }
  }

  /**
   * Determine if the proposed slide index is within our bounds.
   */
  Slides.prototype.checkViewerBounds = function (index, warn) {
    warn = (typeof(warn) == 'undefined')? true : warn;

    if (index > (this.conf.images.length - 1) || index < 0) {
      var $viewer = this.conf.jq('#' + this.conf.IDs.viewer, this.conf.jqc);

      //warn our user
      if (warn) {
        var bound;
        if (index < 0) {
          bound = 'low';
        }
        else {
          bound = 'high';
        }
        this.warnOutOfBounds($viewer, bound);
      }

      return false;
    }
    return true;
  }

  /**
   * Modify the dom by adding a few classes to let our user know they've
   * reached out of their bounds in some way.
   *
   * @return {Slides} [this]
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
   *
   * @return {Slides} [this]
   */
  Slides.prototype.warnBoundaryPage = function () {
    var lastPage = this.pageNumber(this.conf.images.length - 1);

    //give some feedback if we're currently at our boudnaries
    if (this.conf.currentPage === 0) {
      this.conf.jq(this.conf.IDs.prev, this.conf.jqc).addClass('disabled');
    }
    else if (this.conf.currentPage == lastPage) {
      this.conf.jq(this.conf.IDs.next, this.conf.jqc).addClass('disabled');
    }
    else {
      this.conf.jq(this.conf.IDs.prev, this.conf.jqc).removeClass('disabled');
      this.conf.jq(this.conf.IDs.next, this.conf.jqc).removeClass('disabled');
    }

    return this;
  }


  /**
   * An asthetic wrapper around Pager.isValidChunk, modifying our DOM if
   * necessary.
   *
   * @see Pager.isValidChunk
   *
   * @param {int} [page]
   *   Zero-based index of the page number slides are requested for.
   * @param {null|bool} [warn=true]
   *   Optionally indicate that we should go so far as to trigger warnings, if
   *   [page] is out of bounds.
   * @return {bool}
   */
  Slides.prototype.checkPageBounds = function (page, warn) {
    // defaults
    warn = (typeof(warn) == 'undefined')? true : warn;

    // only if input is sane
    if (!this.pager.isValidChunk(page)) {
      if (warn) {
        this.warnOutOfBounds(this.conf.slider, ((page < 0)? 'low' : 'high'));
      }
      return false;
    }
    return true;
  }

  /**
   * Switch our current viewer to the next slide.
   *
   * @return {Slides} [this]
   */
  Slides.prototype.next = function () {
    this.view((this.conf.current * 1 /*current === null, we want zero*/) + 1);
    return this;
  }

  /**
   * Switch our currently exposed section of the grid to the next page in line.
   *
   * @return {Slides} [this]
   */
  Slides.prototype.nextPage = function () {
    var current = parseInt(this.conf.currentPage, 10);
    this.setPage(current + 1, current);
    return this;
  }

  /**
   * Switch our current viewer to the previous slide.
   *
   * @return {Slides} [this]
   */
  Slides.prototype.previous = function () {
    this.view((this.conf.current * 1 /*current === null, we want zero*/) - 1);
    return this;
  }

  /**
   * Switch our currently exposed section of the grid to the previous page in line.
   *
   * @return {Slides} [this]
   */
  Slides.prototype.previousPage = function () {
    var current = parseInt(this.conf.currentPage, 10);
    this.setPage(current - 1, current);
    return this;
  }

  /**
   * @TODO: code this
   *
   * @return {Slides} [this]
   */
  Slides.prototype.pausePlay = function () {
    return this;
  }
})(this, window)

