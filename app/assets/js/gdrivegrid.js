'use strict';
/**
 * @fileoverview This file conforms to the template expectations of
 * app/layouts/jslib.html; namely: this file expects jslibJsArgs to be a window
 * global containing the Google Drive HOST id of a public folder under which it
 * can find:
 *   1) an index.json file at the root listing the folder's contents
 *   2) art work to be displayed in this template.
 */

/** @constructor */
var httpRequest = function() {};


/**
 * Thin wrapper for {@link httpRequest.send}.
 * @param {string} url
 * @return {!Promise}
 */
httpRequest.get = function(url) {
  return httpRequest.send(url, httpRequest.Method.GET);
};


/** @enum {string} */
httpRequest.Method = {GET: 'GET', POST: 'POST'};


/**
 * Copy/pasted nearly verbatim from Apache2-licensed code snippet here:
 *   http://www.html5rocks.com/en/tutorials/es6/promises/
 *
 * @param {string} url
 * @param {httpRequest.Method} method
 * @return {!Promise}
 *     Promise to have made {@code method} request against {@code url}.
 */
httpRequest.send = function(url, method) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open(method, url);
    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() { reject(Error(arguments)); };

    req.send();
  });
};


/**
 * @param {string} publicFolderId
 * @constructor
 */
var GdriveHost = function(publicFolderId) {
  this.baseUrl = GdriveHost.BASE_URL + publicFolderId;
  this.get = httpRequest.get;

};


/** @const */
GdriveHost.BASE_URL = 'https://googledrive.com/host/';


/**
 * @param {string} relativePath
 * @return {string} Fully qualifieda path to {@code relativePath}.
 */
GdriveHost.prototype.getUrl = function(relativePath) {
 return this.baseUrl + '/' + relativePath;
};


/**
 * Thin wrapper for {@link httpRequest#get}.
 *
 * @param {string} path
 * @return {!Promise}
 */
GdriveHost.prototype.getRelativeFile = function(path) {
  return httpRequest.get(this.getUrl(path));
};


/**
 * @param {!GdriveHost} gdriveHost
 * @param {!Window} win
 * @constructor
 */
var Artwork = function(gdriveHost, win) {
  /** @private {!Document} */
  this.doc_ = win.document;

  /** @private {!Element} */
  this.rootEl_ = this.doc_.querySelectorAll('#contents')[0];

  /** @private {!Element} */
  this.containerEl_ = this.doc_.createElement('div');
  this.containerEl_.setAttribute('id', 'artwork');
  this.rootEl_.appendChild(this.containerEl_);

  /** @private {?Element} */
  this.gridEl_ = null;

  /** @private {!GdriveHost} */
  this.gdriveHost_ = gdriveHost;

  /** @private {Artwork.DirListing} */
  this.index_ = null;

  /** @private {!Array.<!Promise>} */
  this.queue_ = [];

  /** @private {!Object.<string, boolean>} */
  this.isLoaded_ = {};

  // Fetch artwork index
  this.queue_.push(
      this.gdriveHost_.
        getRelativeFile(Artwork.INDEX_PATH).
        then(function(index) {
          this.index_ = JSON.parse(index);
        }.bind(this)));
};


/**
 * Recursive array of relative filenames, keyed by the relative filename of the
 * directory they're children of.
 *
 * @typedef {Object.<string, Array.<string|!Object>>}
 */
Artwork.DirListing;


/** @const {string} expected subpath to a JSON index */
Artwork.INDEX_PATH = 'index.json';


/** @const {number} standard size of sections to add to grid */
Artwork.GRID_ADDITION = 8;


/** enum {boolean} */
Artwork.Enabled = {
  CAPTION: false
};


/** @return {!Promise} to be ready to render artwork. */
Artwork.prototype.ready = function() {
  return Promise.all(this.queue_);
};


/**
 * @param {string} subPath (may include slashes)
 * @return {string}
 * @private
 */
Artwork.prototype.getUrl_ = function(subPath) {
  return this.gdriveHost_.getUrl(encodeURI(subPath));
};


/**
 * Appends a thumbnail for {@code fileName} to Artwork grid.
 *
 * @param {string} fileName
 * @return {!Element} newly appended thumbnail for {@code fileName}
 * @private
 */
Artwork.prototype.addArtToGrid_ = function(fileName) {
  var fileUrl = this.getUrl_(fileName);

  var thumbNailEl = this.doc_.createElement('li');
  thumbNailEl.setAttribute('class', 'thumbnail');

  var anchorEl = this.doc_.createElement('a');
  anchorEl.setAttribute('target', '_blank');
  anchorEl.setAttribute('href', fileUrl);
  thumbNailEl.appendChild(anchorEl);

  var imgEl = this.doc_.createElement('img');
  imgEl.setAttribute('src', fileUrl);
  // TODO(zacsh) remove this hard-coded performance net for the browser, once i
  // am serving multiple sizes
  imgEl.setAttribute('width', '300px');
  anchorEl.appendChild(imgEl);

  if (Artwork.Enabled.CAPTION) {
    var captionEl = this.doc_.createElement('span');
    captionEl.setAttribute('class', 'caption');
    captionEl.textContent = fileName;
    anchorEl.appendChild(captionEl);
  }

  this.gridEl_.appendChild(thumbNailEl);
  this.isLoaded_[fileName] = true;
  return thumbNailEl;
};


/**
 * Renders a visual grid of artwork on the page.
 * @param {!Array.<string>} artwork
 */
Artwork.prototype.addToGrid = function(artwork) {
  if (!this.gridEl_) {
    this.buildGrid_();
  }

  artwork.forEach(function(work) {
    if (!this.isGoodAdd_(work)) {
      return;
    }

    this.addArtToGrid_(work);
  }.bind(this));
};


/** @private */
Artwork.prototype.buildGrid_ = function() {
  this.gridEl_ = this.doc_.createElement('ul');
  this.gridEl_.setAttribute('class', 'grid');
  this.containerEl_.appendChild(this.gridEl_);

  var buttonEl = this.doc_.createElement('button');
  buttonEl.textContent = 'Load more';
  buttonEl.addEventListener('click', this.addMoreArt.bind(this));
  this.containerEl_.appendChild(buttonEl);
};


/**
 * @param {string|!Object} artwork value of {@link Artwork.DirListing}.
 * @return {boolean}
 * @private
 */
Artwork.prototype.isGoodAdd_ = function(artwork) {
  return Boolean(
      // TODO(zacsh): deal with this when you break artwork into "vector" vs
      // "raster" vs "doodle"
      typeof artwork != 'object' &&

      // TODO(zacsh) remove this guard once i'm serving multiple sizes; ie:
      // using this cron script, again:
      // github.com/jzacsh/bin/blob/master/share/prep_images
      !artwork.match(/\.svg$/) &&

      artwork != Artwork.INDEX_PATH &&

      !this.isLoaded_[artwork]);
};


/**
 * @param {number} subsetSize
 * @return {!Array.<string>}
 * @private
 */
// TODO remove use of this once some sort of paging mechanism is in place
Artwork.prototype.getRandomSubset_ = function(subsetSize) {
  if (subsetSize === this.index_.artwork.length) {
    return this.index_.artwork.slice();  // bad request, mock new array
  }

  var getRandArt = Artwork.getRandomIntExclusive_.
      bind(null  /*this*/, 0  /*min*/, this.index_.artwork.length);

  var tries = 0, maxTries = 2 * subsetSize; // while loops make me nervous

  var subset = [];
  while (++tries < maxTries && subset.length < subsetSize) {
    var randArt = this.index_.artwork[getRandArt()];
    if (!this.isGoodAdd_(randArt)) {
      continue;
    }

    subset.push(randArt);
  }
  return subset;
};


/** Loads random small subset of artwork into the grid. */
Artwork.prototype.addRandomArt = function() {
  this.addToGrid(this.getRandomSubset_(Artwork.GRID_ADDITION  /*size*/));
};


/** Loads random small subset of artwork into the grid. */
Artwork.prototype.addMoreArt = function() {
  var added = 0;
  this.addToGrid(this.index_.artwork.filter(function(artwork, i) {
    var willAdd = added < Artwork.GRID_ADDITION && this.isGoodAdd_(artwork);
    added += willAdd;
    return willAdd;
  }.bind(this)));
};


/**
 * NOTE: Taken from MIT-licensed (at least)[1] snippets on this page:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * [1]: developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 * @private
 */
Artwork.getRandomIntExclusive_ = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};


var gdriveHost = new GdriveHost(window.jslibJsargs);
var artwork = new Artwork(gdriveHost, this  /*window*/);


artwork.ready().then(function() {
  artwork.addRandomArt();
});
