/**
 * svgToCanvas - an SVG rendering library, using HTML's Canvas API.
 *
 * Purpose:
 *   Re-invent the SVG rendering wheel that the browser already does for us,
 *   but this time allow more options and flexibility. For example, we may want
 *   to slow down, chop up, reverse, or apply who-knows-what effect to the
 *   process of rendering our image.
 *
 * Approach:
 *   Utilize HTML Canvas API to re-render the SVG data we've been dealt.
 *
 * High-level plans:
 * @TODO: get the very basics of re-rendering SVG protocol, via canvas.
 * @TODO: code for the 'options' object.
 * @TODO: take implementation notes into consideration:
 *   http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
 *
 * @note Almost all understanding of SVG specification comes from w3.org
 * documentation.
 * @see http://www.w3.org/TR/SVG
 */
var svgToCanvas = {
  /**
   * Initialize storage build methods needed to use this library.
   *
   * @note Public: accessing this API is encouraged.
   *
   * @param object svgNode
   *   The <svg> node, as found somewhere in the DOM tree of our page.
   * @param object canvasNode
   *   The <canvash> node, as found somewhere in the DOM tree, on which we
   *   should be rendering our 2d representation of svgNode
   *   @note: don't pass the canvas "context" (ie.: don't call getContext()).
   * @param object config
   *     @TODO: code this:
   *   - preCompiled <object>: The object this.compileSVGPath() (and other
   *     JSON/parsing functions would have generated), allowing our library to
   *     do the one thing it wants: play with the Canvas API (ie.: make calls
   *     to this.applyPathCommand()).
   *     @note This will allow us to run svgToCanvas compile/parse-methods on
   *     server-side (with the help of DOM libraries, of course), simply
   *     producing JSON files to consume, here.
   *     @TODO: code this:
   *   - reverse <bool>: Render the image in reverse order
   *   - speed <int>: milliseconds specifying how slowly each path should
   *     render.
   *     @TODO: code this:
   *   - effects <object>: Various special effects to change the normal
   *     rendering process.
   *     - sketchy <bool>: get the paths to vary speeds in their rendering,
   *       sometimes back-tracking (erasing?) to look as if a person is drawing
   *       this, live.
   */
  mapToCanvas: function (svgNode, canvasNode, config) {
    //sanity check
    if (svgNode.nodeName.toLowerCase() != 'svg' ||
        canvasNode.nodeName.toLowerCase() != 'canvas') {
      console.error('SVG or Canvas nodes passed incorrectly.');
      return null;
    }

    this.svg = svgNode;
    this.canvas = canvasNode;
    this.config = config;

    //
    //expose everything
    //
    return this;
  },

  /**
   * Render, in canvas calling all necessary internal methods to map our SVG
   * data to Canvas APIs. This is the public method that should be called by
   * end users, after they've received a mapper object from this.mapToCanvas().
   *
   * @note Public: accessing this API is encouraged.
   */
  renderToCanvas: function () {
    //
    //basic rendering for each path
    //
    var paths = this.svg.getElementsByTagName('path');
    for (var i in paths) {
      //for some reason we atually hit the 'length' property.
      if (typeof paths[i] === 'object' &&
          'nodeName' in paths[i] && paths[i].nodeName == 'path') {
        this.renderPath(paths[i]);
      }
    }

    //@TODO: code, then call methods to take the rest of our <svg> object into
    //consideration
  },

  /**
   * Render a particular <path>, on our DOM's canvas.
   *
   * @TODO: Private; perhaps encapsulate within the public this.renderToCanvas()?
   *
   * @TODO: either rename compileSVGPath to do more, or code calls to take care
   * of all other attributes Canvas API also covers, eg.: fillStyle().
   *
   * @param object pathNode
   *   The <path> node, as found somewhere in the DOM tree of SVG data.
   */
  renderPath: function (pathNode) {
    var dAttr, styles, data;
    dAttr = pathNode.getAttribute('d');
    styles = { /* @TODO: style-[x] attributes on this <path> node */ };
    data = this.compileSVGPath(dAttr, styles);
    this.applyPathCommand(data.commands);

    //@TODO: do something with this data
    console.error('vaporware: Nothing Coded for "style" attributes!! (styles: %s)\n',
        data.styles);
  },

  /**
   * Actually break down a given svg path, based on possible SVG "commands" and
   * styles.
   *
   * @TODO: Private; perhaps encapsulate within the public this.renderToCanvas()?
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
      console.error('Length of flags in attribute not equal to length of data!');
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
      commands: compileDAttr(flags, data),
      styles: compileStyles(styles),
    };
  },

  /**
   * SVG "commands", as found in [d] attribute of a <path> element, according
   * to W3G specification.
   *
   * @TODO: Private; perhaps encapsulate within the public this.renderToCanvas()?
   *
   * @see this.applyPathCommand()
   */
  spec: {
    commands: 'mzlhvcsqta',
    commandsRegex: function () {
      var regex = '[';
      regex += this.commands;
      regex += ']';
      return (new RegExp(regex, 'ig'));
    }
  },

  /**
   * Actual "mapping" of our Mapper, calling valid Canvas API methods for each
   * SVG "command" that's called.
   *
   * @TODO: Private; perhaps encapsulate within the public this.renderToCanvas()?
   *
   * @see http://www.w3.org/TR/SVG/paths.html
   *
   * @param Array pathData
   *   @see this.compileSVGPath().commands
   */
  applyPathCommand: function(pathData) {
    /**
     * Call the correct Canvas API.
     */
    var lib = this;
    var applyCommand = function (command, data) {
      if (!command.match(lib.spec.commandsRegex())) {
        console.warn('Unknown SVG command found in [d] attribute of svg node id="%s".\n',
            lib.svg.id);
      }

      switch (command) {
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
        //absolute moveto
        case 'M':
          console.error('vaporware: Absolute "moveto"-command not yet implemented'); //@TODO: code this
          break;
        //relative moveto
        case 'm':
          console.error('vaporware: Relative "moveto"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Close the current subpath by drawing a straight line from the
         * current point to current subpath's initial point. Since the Z and z
         * commands take no parameters, they have an identical effect.
         */
        //closepath
        case 'Z':
        case 'z':
          console.error('vaporware: "closepath"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Draw a line from the current point to the given (x,y) coordinate
         * which becomes the new current point. L (uppercase) indicates that
         * absolute coordinates will follow; l (lowercase) indicates that
         * relative coordinates will follow. A number of coordinates pairs may
         * be specified to draw a polyline. At the end of the command, the new
         * current point is set to the final set of coordinates provided.
         */
        //absolute lineto
        case 'L':
          console.error('vaporware: Absolute "lineto"-command not yet implemented'); //@TODO: code this
          break;
        //relative lineto
        case 'l':
          console.error('vaporware: Relative "lineto"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Draws a horizontal line from the current point (cpx, cpy) to (x,
         * cpy). H (uppercase) indicates that absolute coordinates will follow;
         * h (lowercase) indicates that relative coordinates will follow.
         * Multiple x values can be provided (although usually this doesn't
         * make sense). At the end of the command, the new current point
         * becomes (x, cpy) for the final value of x.
         */
        //absolute horizontal lineto
        case 'H':
          console.error('vaporware: Absolute "lineto"-command not yet implemented'); //@TODO: code this
          break;
        //relative horizontal lineto
        case 'h':
          console.error('vaporware: Relative "lineto"-command not yet implemented'); //@TODO: code this
          break;

        /**
         * Draws a vertical line from the current point (cpx, cpy) to (cpx, y).
         * V (uppercase) indicates that absolute coordinates will follow; v
         * (lowercase) indicates that relative coordinates will follow.
         * Multiple y values can be provided (although usually this doesn't
         * make sense). At the end of the command, the new current point
         * becomes (cpx, y) for the final value of y.
         */
        //absolute vertical lineto
        case 'V':
          console.error('vaporware: Absolute "vertical lineto"-command not yet implemented'); //@TODO: code this
          break;
        //relative vertical lineto
        case 'v':
          console.error('vaporware: Relative "vertical lineto"-command not yet implemented'); //@TODO: code this
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
        //absolute curveto
        case 'C':
          console.error('vaporware: Absolute "curveto"-command not yet implemented'); //@TODO: code this
          break;
        //relative curveto
        case 'c':
          console.error('vaporware: Relative "curveto"-command not yet implemented'); //@TODO: code this
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
        //absolute shorthand/smooth curveto
        case 'S':
          console.error('vaporware: Absolute "shorthand/smooth curveto"-command not yet implemented'); //@TODO: code this
          break;
        //relative shorthand/smooth curveto
        case 's':
          console.error('vaporware: Relative "shorthand/smooth curveto"-command not yet implemented'); //@TODO: code this
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
        //absolute quadratic Bézier curveto
        case 'Q':
          console.error('vaporware: Absolute "quadtratic Bézier curveto"-command not yet implemented'); //@TODO: code this
          break;
        //relative quadratic Bézier curveto
        case 'q':
          console.error('vaporware: Relative "quadtratic Bézier curveto"-command not yet implemented'); //@TODO: code this
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
        //absolute Shorthand/smooth quadratic Bézier curveto
        case 'T':
          console.error('vaporware: Absolute "Shorthand/smooth quadratic Bézier curveto"-command not yet implemented'); //@TODO: code this
          break;
        //relative Shorthand/smooth quadratic Bézier curveto
        case 't':
          console.error('vaporware: Relative "Shorthand/smooth quadratic Bézier curveto"-command not yet implemented'); //@TODO: code this
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
        //absolute elliptical arc
        case 'A':
          console.error('vaporware: Absolute "elliptical arc"-command not yet implemented'); //@TODO: code this
          break;
        //relative elliptical arc
        case 'a':
          console.error('vaporware: Relative "elliptical arc"-command not yet implemented'); //@TODO: code this
          break;
      }
    }

    for (var i in pathData) {
      applyCommand(pathData[i].command, pathData[i].data);
    }
  }
};

