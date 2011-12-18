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
 * @TODO: code for the 'options' object.
 *
 * Code issues:
 * @TODO: figure out if our answer to this, this.mapToCanvas(), works:
 * - how to store meta data, the way we would in java, using private
 *   properties, eg.:
 *   - when our initial renderToCanvas() method is called, we need to store the
 *     data passed so its globally accessable by all our internal methods and
 *     doesn't need to be passed around.
 */
var svgToCanvas = {
  /**
   * Initialize storage and return the methods needed to use this library.
   *
   * @TODO: Store canvasNode/context somewhere inside svgToCanvas.
   *
   * @param object svgNode
   *   The <svg> node, as found somewhere in the DOM tree of our page.
   * @param object canvasNode
   *   The <canvash> node, as found somewhere in the DOM tree, on which we
   *   should be rendering our 2d representation of svgNode
   *   @note: don't pass the canvas "context" (ie.: don't call getContext()).
   * @param object config
   *   @TODO: none of these are coded for:
   *   - reverse <bool>: Render the image in reverse order
   *   - speed <int>: milliseconds specifying how slowly each path should
   *     render.
   *   - effects <object>: Various special effects to change the normal
   *     rendering process.
   *     - sketchy <bool>: get the paths to vary speeds in their rendering,
   *       sometimes back-tracking (erasing?) to look as if a person is drawing
   *       this, live.
   */
  mapToCanvas: function (svgNode, canvasNode, config) {
    //store our critical data
    this.svg = svgNode;
    this.canvas = canvasNode;
    this.config = config;

    //return a well catered, useful structure.
    var mapper = this;
    return {
      renderToCanvas: mapper.renderToCanvas,
      /**
       * Utilities not necessarly meant for public use, but potentially useful.
       */
      utils: {
        renderPath: mapper.renderToCanvas,
      }
    };
  },

  /**
   * Render, with canvas
   */
  renderToCanvas: function () {
    //basic rendering for each path
    for (var i in paths) {
      this.renderPath(paths[i]);
      //@TODO: call this.renderPath() on each <path>.
    }

    //@TODO: code, then call methods to take the rest of our <svg> object into
    //consideration
  },

  /**
   * Render, in canvas.
   *
   * @TODO: either rename compileSVGPath to do more, or code calls to take care
   * of all other attributes Canvas API also covers, eg.: fillStyle().
   *
   * @param object pathNode
   *   The <path> node, as found somewhere in the DOM tree of SVG data.
   */
  renderPath: function (pathNode) {
    var dAttr, styles, data;
    for (var i in paths) {
      dAttr = paths[i].getAttribute('d');
      styles = { /* @TODO */ };
      data = compileSVGPath(dAttr, styles);
      console.warning('not yet coded!!'); //@TODO: do something with this data
      this.applyPathCommand(data.commands);
    }
  },

  /**
   * @TODO: this should be a private method of svgToCanvas.renderPath()
   *
   * Actually break down a given svg path, based on possible SVG "commands" and
   * styles.
   *
   * @param string dAttr
   *   The raw string for a given <path>.
   * @param object styles
   *   The strings from style-related attributes found in <path> node.
   *   - @TODO: document this object, when you start coding it.
   * @return Object
   *   - styles: Object
   *     Any path-wide styles found in <path> attributes.
   *   - commands: Array
   *     Collection of objects representing each of the SVG API "commands" that
   *     were called from a given "d" attribute of a parsed <path> element and
   *     the relevant data following that commmand.
   *     - command <String>: a valid SVG "command"
   *     @see this.svgPathCommands
   *     - data <Array>: typically 0 or more floats, usually representing X/Y
   *     axis coordinates.
   */
  compileSVGPath: function (dAttr, styles) {
    //
    //gather flags and data found in [d] attribute.
    //
    var flags = dAttr.match(this.spec.commandsRegex());
    var data = dAttr.split(this.spec.commandsRegex());
    data.shift();
    data = data.map(function (str) {
      return str.trim();
    });

    //sanity check
    if (data.length != flags.length) {
      console.warning('Length of flags in attribute not equal to length of data!');
    }

    /**
     * Compile our d-attribute data into an array in the order it was found.
     */
    var compileDAttr = function (keys, values) {
      var objectified = [];
      for (var i in values) {
        objectified.push({
          command: keys[i],
          data: values[i].split(','),
        });
      }
      return objectified;
    }

    /**
     * Gather style attributes we want to use from <path>, into a useful
     * object.
     */
    var compileStyles = function () {
      return null; //@TODO: append other path-wide attributes onto this array.
    }

    /**
     * Assume numeric element indexes match between the 'values' Array and the
     * 'keys' Array.
     */
    return {
      commands: compileDattr(flags, data),
      styles: compileStyles(styles),
    };
  },

  /**
   * @TODO: these should be a private property of our object of svgToCanvas
   *
   * SVG "commands", as found in [d] attribute of a <path> element, according
   * to W3G specification.
   *
   * @see http://www.w3.org/TR/SVG/paths.html
   */
  spec: {
    commands: 'mzlhvcsqta',
    commandsRegex: function () {
      var regex = '[';
      regex += this.commands; //@TODO: make sure this works!
      regex += ']';
      return (new RegExp(regex, 'ig'));
    }
  },

  /**
   * @TODO: this should be a private method of svgToCanvas.renderPath()
   *
   * Actual "mapping" of our Mapper, calling valid Canvas API methods for each
   * SVG "command" that's called.
   *
   * @param Array pathData
   *   @see this.compileSVGPath().commands
   */
  applyPathCommand: function(pathData) {
    /**
     * Call the correct Canvas API.
     */
    var applyCommand = function (command, data) {
      switch (svgCall) {
        /**
         * Start a new sub-path at the given (x,y) coordinate. M (uppercase)
         * indicates that absolute coordinates will follow; m (lowercase)
         * indicates that relative coordinates will follow. If a moveto is
         * followed by multiple pairs of coordinates, the subsequent pairs are
         * treated as implicit lineto commands. Hence, implicit lineto commands
         * will be relative if the moveto is relative, and absolute if the
         * moveto is absolute. If a relative moveto (m) appears as the first
         * element of the path, then it is treated as a pair of absolute
         * coordinates. In this case, subsequent pairs of coordinates are
         * treated as relative even though the initial moveto is interpreted as
         * an absolute moveto.
         */
        case 'M':
          console.error('Absolute "moveto"-command not yet implemented'); //@TODO: code this
          break;
        case 'm':
          console.error('Relative "moveto"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Close the current subpath by drawing a straight line from the
         * current point to current subpath's initial point. Since the Z and z
         * commands take no parameters, they have an identical effect.
         */
        case 'Z':
        case 'z':
          console.error('"closepath"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Draw a line from the current point to the given (x,y) coordinate
         * which becomes the new current point. L (uppercase) indicates that
         * absolute coordinates will follow; l (lowercase) indicates that
         * relative coordinates will follow. A number of coordinates pairs may
         * be specified to draw a polyline. At the end of the command, the new
         * current point is set to the final set of coordinates provided.
         */
        case 'L':
          console.error('Absolute "lineto"-command not yet implemented'); //@TODO: code this
          break;
        case 'l':
          console.error('Relative "lineto"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Draws a horizontal line from the current point (cpx, cpy) to (x,
         * cpy). H (uppercase) indicates that absolute coordinates will follow;
         * h (lowercase) indicates that relative coordinates will follow.
         * Multiple x values can be provided (although usually this doesn't
         * make sense). At the end of the command, the new current point
         * becomes (x, cpy) for the final value of x.
         */
        case 'H':
          console.error('Absolute "lineto"-command not yet implemented'); //@TODO: code this
          break;
        case 'h':
          console.error('Relative "lineto"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Draws a vertical line from the current point (cpx, cpy) to (cpx, y).
         * V (uppercase) indicates that absolute coordinates will follow; v
         * (lowercase) indicates that relative coordinates will follow.
         * Multiple y values can be provided (although usually this doesn't
         * make sense). At the end of the command, the new current point
         * becomes (cpx, y) for the final value of y.
         */
        case 'V':
        case 'v':
          break;

        /**
         * Draws a cubic Bézier curve from the current point to (x,y) using
         * (x1,y1) as the control point at the beginning of the curve and
         * (x2,y2) as the control point at the end of the curve. C (uppercase)
         * indicates that absolute coordinates will follow; c (lowercase)
         * indicates that relative coordinates will follow. Multiple sets of
         * coordinates may be specified to draw a polybézier. At the end of the
         * command, the new current point becomes the final (x,y) coordinate
         * pair used in the polybézier.
         */
        case 'C':
        case 'c':
          break;

        /**
         * Draws a cubic Bézier curve from the current point to (x,y). The
         * first control point is assumed to be the reflection of the second
         * control point on the previous command relative to the current point.
         * (If there is no previous command or if the previous command was not
         * an C, c, S or s, assume the first control point is coincident with
         * the current point.) (x2,y2) is the second control point (i.e., the
         * control point at the end of the curve). S (uppercase) indicates that
         * absolute coordinates will follow; s (lowercase) indicates that
         * relative coordinates will follow. Multiple sets of coordinates may
         * be specified to draw a polybézier. At the end of the command, the
         * new current point becomes the final (x,y) coordinate pair used in
         * the polybézier.
         */
        case 'S':
        case 's':
          break;

        /**
         * Draws a quadratic Bézier curve from the current point to (x,y) using
         * (x1,y1) as the control point. Q (uppercase) indicates that absolute
         * coordinates will follow; q (lowercase) indicates that relative
         * coordinates will follow. Multiple sets of coordinates may be
         * specified to draw a polybézier. At the end of the command, the new
         * current point becomes the final (x,y) coordinate pair used in the
         * polybézier.
         */
        case 'Q':
        case 'q':
          break;

        /**
         * Draws a quadratic Bézier curve from the current point to (x,y). The
         * control point is assumed to be the reflection of the control point
         * on the previous command relative to the current point. (If there is
         * no previous command or if the previous command was not a Q, q, T or
         * t, assume the control point is coincident with the current point.) T
         * (uppercase) indicates that absolute coordinates will follow; t
         * (lowercase) indicates that relative coordinates will follow. At the
         * end of the command, the new current point becomes the final (x,y)
         * coordinate pair used in the polybézier.
         */
        case 'T':
        case 't':
          break;

        /**
         * Draws an elliptical arc from the current point to (x, y). The size
         * and orientation of the ellipse are defined by two radii (rx, ry) and
         * an x-axis-rotation, which indicates how the ellipse as a whole is
         * rotated relative to the current coordinate system. The center (cx,
         * cy) of the ellipse is calculated automatically to satisfy the
         * constraints imposed by the other parameters. large-arc-flag and
         * sweep-flag contribute to the automatic calculations and help
         * determine how the arc is drawn.
         */
        case 'A':
        case 'a':
          break;
      }
    }

    for (var i in pathData) {
      applyCommand(pathData[i].command, pathData[i].data);
    }
  }
};

