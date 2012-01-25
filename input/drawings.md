title: drawings
menu-position: 3
---

#Drawings

Drawings from various past sketchbooks and some recent work of the same style,
done in Inkscape with a computer tablet.

<div id="filmstrip"></div><!--//#filmstrip-->
<div id="slide-nav">
  <div id="prev-page" class="button slider"
    title="Previous Page of Slides">Prev</div>
  <div id="next-page" class="button slider"
    title="Next Page of Slides">Next</div>
</div>
<div id="sliderjs"></div><!--//#sliderjs-->

<hgroup markdown="1">
##Nerd Info
### note: *You can stop reading now if software doesn't excite you :)*
</hgroup>

This page is built and kept up to date automatically with the help of:

* [inotify-tools][inotify]: simple interface to the Linux kernel's
  filesystem-monitoring API that avoids polling.
* [imagedex][]: Basic [file system listing][jsondrawings] for JSON consumers.
* [ImageMagick][]: from Wikipedia, "*an open source software suite for
  displaying, converting, and editing raster image files.*"
* [Prep Images][prepimg] and [api_drawings][apidrawings]: Glue between the
  above tools! This is a [Bash 4][bash4] script run on inotify events when my
  artwork is updated; manipulates (*resizes, copies, etc.*) using ImageMagick
  and generates a new imagedex JSON file for this page's consumption.
* **slides.js**: (*coming soon*) open sourced slideshow/grid-management I wrote
  being used on this page.
* **svgToCanvas**: (*coming soon*) open sourced SVG rendering library using
  Canvas APIs. I wrote this specifically to allow fine-grained control of the
  render-process for SVG files (*sometimes visually noticable over a slow
  network connection*).

[inotify]: https://github.com/rvoicilas/inotify-tools/wiki/
[imagedex]: https://github.com/jzacsh/imagedex
[jsondrawings]: http://content.jzacsh.com/drawings/imagedex.json
[bash4]: http://wiki.bash-hackers.org/bash4
[ImageMagick]: https://github.com/jzacsh/bin/blob/master/share/prep_images
[prepimg]: https://github.com/jzacsh/bin/blob/master/share/prep_images
[apidrawings]: https://github.com/jzacsh/bin/blob/master/share/api_drawings
