/**
 * Re-invent the SVG rendering wheel that the browser already does for us, but
 * this time allow more options and flexibility. For example, we may want to
 * slow down, chop up, reverse, or apply who-knows-what effect to the process
 * of rendering our image.
 *
 * Canvas API. To re-render the XML data presented as SVG, we'll utilize the
 * Canvas API.
 *
 * High-level plans:
 * @TODO: get the very basics of re-rendering SVG protocol, via canvas.
 * @TODO: add an 'options' object, (see meta-data section in below 'todo').
 *
 * Code issues:
 * @TODO: figure out how to store meta data, the way we would in java, using
 * private properties, eg.:
 * - when our initial render() method is called, we need to store the data
 *   passed so its globally accessable by all our internal methods and doesn't
 *   need to be passed around.
 * @TODO: add an 'options' object that allows us to pass more information to
 * render()
 *   - eg.: reverse: true - to render the image in reverse order
 *   - eg.: speed: milliseconds - specify how slowly each path should be
 *   rendered.
 *   - eg.: effects: { sketchy: true}, get the paths to vary speeds in their
 *   rendering, sometimes back-tracking (erasing?) to look as if a person is
 *   drawing this, live.
 */
var svgToCanvas = {
  /**
   * Render, with canvas
   *
   * @TODO: Store canvasNode/context somewhere inside svgToCanvas.
   *
   * @param object svgNode
   *   The <svg> node, as found somewhere in the DOM tree of our page.
   * @param object canvasNode
   *   The <canvash> node, as found somewhere in the DOM tree, on which we
   *   should be rendering our 2d representation of svgNode
   *   @note: don't pass the canvas "context" (ie.: don't call getContext()).
   */
  render: function (svgNode, canvasNode) {
  },

  /**
   * Render, with canvas.
   *
   * @TODO: either rename explodeSVGdAttr to do more, or code calls to take
   * care of all other attributes Canvas API also covers, eg.: fillStyle().
   *
   * @param object pathNode
   *   The <path> node, as found somewhere in the DOM tree of SVG data.
   */
  renderPath: function (pathNode) {
  },

  /**
   * @TODO: this should be a private method of svgToCanvas.renderPath()
   *
   * Actually break down svg data, based on possible SVG "commands".
   *
   * @param string dAttr
   * @return Array blobData
   */
  explodeSVGdAttr: function (dAttr) {
    //gather flags and data according to specification
    var flags = dAttr.match(this.svgPathCommandsRegex());
    var data = dAttr.split(this.svgPathCommandsRegex());
    data.shift();
    data = data.map(function (str) { return str.trim(); });

    //sanity check
    if (data.length != flags.length) {
      console.warning('Length of flags in attribute not equal to length of data!');
    }

    /**
     * This function assumes numeric element indexes match across the 'values'
     * Array and the 'keys' Array.
     */
    var doubleArrayToObject = function (keys, values) {
      var objectified = [];
      for (var i in values) {
        objectified.push({
          command: keys[i],
          data: values[i].split(','),
        });
      }
      return objectified;
    }

    return doubleArrayToObject(flags, data);
  },

  /**
   * @TODO: these should be a private property of our object of svgToCanvas
   *
   * SVG "commands", as found in [d] attribute of a <path> element, according
   * to W3G specification.
   *
   * @see http://www.w3.org/TR/SVG/paths.html
   */
  svgPathCommands: 'mzlhvcsqta',
  svgPathCommandsRegex: function () {
    var regex = '[';
    regex += this.svgPathCommands;
    regex += ']'
    return (new RegExp(regex, 'ig'));
  },

  /**
   * @TODO: this should be a private method of svgToCanvas.renderPath()
   *
   * Actual "mapping" of our Mapper, calling valid Canvas API methods for each
   * SVG "command" that's called.
   *
   * @param Array pathData
   *   Collection of objects representing each of the SVG API "commands" that
   *   were called from a given "d" attribute of a parsed <path> element and
   *   the relevant data following that commmand.
   *   - command <String>: a valid SVG "command"
   *   @see this.svgPathCommands
   *   - data <Array>: typically 0 or more floats, usually representing X/Y
   *   axis coordinates.
   *   @see this.renderPath
   */
  applyPathCommand: function(pathData) {
    /**
     * Call the correct Canvas API.
     */
    var applyCommand = function (command, data) {
      switch (svgCall) {
        case m:
        case M:
          //@TODO: code this
          console.error('not yet implemented');
          break;

        case z:
        case Z:
          break;

        case l:
        case L:
          break;

        case h:
        case H:
          break;

        case v:
        case V:
          break;

        case c:
        case C:
          break;

        case s:
        case S:
          break;

        case q:
        case Q:
          break;

        case t:
        case T:
          break;

        case a:
        case A:
          break;
      }
    }

    for (var i in pathData) {
      applyCommand(pathData[i].command, pathData[i].data);
    }
  }
};
