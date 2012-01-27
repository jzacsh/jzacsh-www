/**
 * SvgToCanvas - an SVG rendering library, using HTML's Canvas API.
 *
 * Overview:
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
 *
 * @note Almost all understanding of HTML's Canvas API comes from whatwg.org's
 * documentation.
 * @see http://developers.whatwg.org/the-canvas-element.html
 */


/**
 * Initialize storage build methods needed to use this library.
 *
 * @note Public: accessing this API is encouraged.
 *
 * @param object svgNode
 *   The <svg> node, as found somewhere in the DOM tree of our page.
 * @param object canvasNode
 *   The <canvas> node, as found somewhere in the DOM tree, on which we
 *   should be rendering our 2d representation of svgNode
 *   @note: don't pass the canvas "context" (ie.: don't call getContext()).
 * @param object config
 *     Optional configuration object containing any of the following properties
 *     to modify behavior of rendering process.
 *     @TODO: code this:
 *   - mirrorSize <bool>: re-size our canvas according to the SVG node's
 *     original size.
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
var SvgToCanvas = function (svgNode, canvasNode, config) {
  //sanity check
  if (svgNode.nodeName.toLowerCase() != 'svg' ||
      canvasNode.nodeName.toLowerCase() != 'canvas') {
    console.error('SVG or Canvas nodes passed incorrectly.');
    return null;
  }

  //the crticial DOM elements we need to do anything
  this.svg = svgNode;
  this.canvas = canvasNode;
  this.context = this.canvas.getContext('2d');
  if (!this.context) {
    console.error('Could not get canvas context with canvas.getContext("2d").');
    return false;
  }

  //store our rendering configuration.
  this.config = config || null;

  var commands = 'mzlhvcsqta';
  /**
   * SVG "commands", as found in [d] attribute of a <path> element, according
   * to W3G specification.
   *
   * @see this.applyPathCommand()
   *
   * @return <RegExp>
   *   Regular expression corresponding to the property being referenced.
   */
  this.regex = {
    commands: (function () {
      var regex = '[';
      regex += commands;
      regex += ']';
      return (new RegExp(regex, 'ig'));
    })(),
    hexStyle: (function () {
      var regex = '^#';
      for (var i = 0; i < 6; i++) {
        regex += '[a-f|0-9]';
      }
      regex += '$';
      return (new RegExp(regex, 'i'));
    })(),
  }

  return this;
}

/**
 * Render, in canvas calling all necessary internal methods to map our SVG
 * data to Canvas APIs. This is the public method that should be called by
 * end users, after they've received a mapper object from this.mapToCanvas().
 *
 * @note Public: accessing this API is encouraged.
 */
SvgToCanvas.prototype.renderToCanvas = function () {
  this.context.beginPath();
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
}

/**
 * Render a particular <path>, on our DOM's canvas.
 *
 * @param object pathNode
 *   The <path> node, as found somewhere in the DOM tree of SVG data.
 */
SvgToCanvas.prototype.renderPath = function (pathNode) {
  //
  //compile data about this path
  //
  var data = this.compileSVGPath(pathNode.getAttribute('d'),
      pathNode.getAttribute('style'));

  var map = this;
  /**
   * Actual "mapping" of our Mapper, calling utilizing corresponding Canvas
   * APIs where SVG APIs are encountered in a given SVG <path>.
   *
   * @see http://www.w3.org/TR/SVG/paths.html
   */
  var applyPath = {
    /**
     * Map valid Canvas API methods for each SVG "style" defined.
     *
     * @param Object styles
     *   @see this.compileSVGPath().styles
     */
    styles: function (styles) {

      var apply = function (style, value) {
        switch (style) {
          case 'fill':
            if (map.spec.regex.hexStyle.test(value)) {
              map.context.fillStyle = value;
            }
            else {
              console.error('vaporware: only hex color-values currently implemented in svg=>canvas mapping, ignoring [style="%s: %s;"].', style, value);
            }
            break;

          case 'fill-opacity':
            console.error('vaporware: code for [style="%s"] not yet implemented.', style);
            break;

          case 'fill-rule':
            console.error('vaporware: code for [style="%s"] not yet implemented.', style);
            break;

          case 'stroke':
            if (map.spec.regex.hexStyle.test(value) || value == 'none') {
              map.context.strokeStyle = value;
            }
            else {
              console.error('vaporware: only hex color-values currently implemented in svg=>canvas mapping, ignoring [style="%s: %s;"].', style, value);
            }
            break;

          default:
            console.warn('Skipping unrecognized property in [style] attribute of SVG path, "%s".', i);
            return false;
            break;
        }
      }

      for (var i in styles) {
        apply(i, styles[i]);
      }
    },

    /**
     * Map valid Canvas API methods for each SVG "command" that's called.
     *
     * @param Array commands
     *   @see this.compileSVGPath().commands
     */
    commands: function(commands) {
      //relativity, e = mc^2
      var emc = [0, 0]; // x, y

      /**
       * Call the correct Canvas API.
       */
      var apply = function (command, data) {
        if (!command.match(map.spec.regex.commands)) {
          console.warn('Unknown SVG command found in [d] attribute of svg node id="%s".\n',
              map.svg.id);
          return false;
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
            if (data.length > 1) {
              emc = [0, 0];
            }
          //relative moveto
          case 'm':
            if (data.length > 1) {
              map.context.moveTo(emc[0] + data[0], emc[1] + data[1]);

              //remove the two we've used and simultaneously store our new
              //relative location
              emc[0] = data.shift();
              emc[1] = data.shift();

              if (data.length) {
                //continue processing the cooridnate pairs provided.
                apply(command, data);
              }
            }
            else {
              console.error('SVG Parse Error: in-sufficient number of coordinates to render "%" SVG-command, data below:', command);
              console.error(data);
              return false;
            }
            break;

          /**
           * Close the current subpath by drawing a straight line from the
           * current point to current subpath's initial point. Since the Z and z
           * commands take no parameters, they have an identical effect.
           */
          //closepath
          case 'Z':
          case 'z':
            map.context.closePath();
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
            if (data.length > 1) {
              emc = [0, 0];
            }
          //relative lineto
          case 'l':
            if (data.length > 1) {
              map.context.lineTo(emc[0] + data[0], emc[1] + data[1]);

              //remove the two we've used and simultaneously store our new
              //relative location
              emc[0] = data.shift();
              emc[1] = data.shift();

              if (data.length) {
                //continue processing the cooridnate pairs provided.
                apply(command, data);
              }
            }
            else {
              console.error('SVG Parse Error: in-sufficient number of coordinates to render "%" SVG-command; data below:', command);
              console.error(data);
              return false;
            }
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
            console.error('vaporware: Absolute "curveto"-command not yet implemented!'); //@TODO: code this
            break;
          //relative curveto
          case 'c':
            if (data.length > 2) {
              var coords = (function (d) {
                var c = [];
                for (var i in d) {
                  c.push(d[i].split(','));
                }
                return c;
              })(data);

              map.context.bezierCurveTo(coords[0], coords[1], coords[2], coords[3],
                  coords[4], coords[5]);

              /**
               * //@TODO: figure out what to do withthis if you ever code
               * "C"-command!
               *
               * //store our new relative location
               * emc[4] = data[4];
               * emc[5] = data[5];
               *
               * //remove the 6 we've used (2 pairs of "control points" and a
               * //pair of "current point")
               * for (var i = 0; i < 6; i++) {
               *   emc[i] = data.shift();
               * }
               *
               * if (data.length) {
               *   //continue processing the cooridnate pairs provided.
               *   apply(command, data);
               * }
               *
               */
            }
            else {
              console.error('SVG Parse Error: in-sufficient number of coordinates to render "%" SVG-command; data below:', command);
              console.error(data);
              return false;
            }
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

      //
      //run each SVG command provided
      //
      var applied;
      for (var i in commands) {
        applied = apply(commands[i].command, commands[i].data);
        if (applied === false) {
          return i;
        }
      }
      return null;
    }
  };

  //
  //initialize style properties in canvas, as defined by svg
  //
  var parseError = applyPath.styles(data.styles);

  //
  //run canvas APIs, as intneded by svg commands
  //
  var parseError = applyPath.commands(data.commands);
  if (parseError !== null) {
    console.error('SVG Parser: Pre-maturely ending render of path (at command #%d) due to malformed SVG data: %s.', parseError, dAttr);
  }
}

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
 *       @see this.svgPathCommands
 *     - data <Array>: typically 0 or more floats, usually representing X/Y
 *       axis coordinates.
 */
SvgToCanvas.prototype.compileSVGPath = function (dAttr, styles) {
  //
  //gather flags and data found in [d] attribute.
  //
  var flags = dAttr.match(this.spec.regex.commands);
  var data = dAttr.split(this.spec.regex.commands);
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
    var objectified = [], splitOn;
    for (var i in values) {
      if (keys[i] == 'c') {
        splitOn = ' ';
      }
      else {
        splitOn = ',';
      }

      objectified.push({
        command: keys[i],
        data: values[i].split(splitOn),
      });
    }
    return objectified;
  }

  /**
   * Gather style attributes we want to use from <path>, into a useful
   * object.
   */
  var compileStyles = function (s) {
    var compilation = {};
    s.split(';').map(function (style) {
      style = style.split(':');
      compilation[style[0]] = style[1];
    });
    return compilation;
  }

  /**
   * Assume numeric element indexes match between the 'values' Array and the
   * 'keys' Array.
   */
  return {
    commands: compileDAttr(flags, data),
    styles: compileStyles(styles),
  };
}

