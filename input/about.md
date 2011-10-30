
title: about
menu-position: 9
---

## Jonathan Zacsh

I'm a computer science student, currently working full time as a web developer.
Most of my experience is in [drupal][] module and theme development, but
I also spend a decent amount of time studying/playing with:

  * node.js
  * python
  * client-side javascript

I am also a lover of the [awesome music][amazonmusic] [last.fm][lastfm] brings my way.

###Code

Below are utilities I wrote either because I needed the tool myself or I wanted
to play with the technology they're built in (or both). More importantly
though, these are utilities I tried to write with some sort of re–usability in
mind, so others can enjoy. If anything comes in handy (or breaks) please feel
free to let me know.

<section class="projects" markdown="1">

* [punch][]<br />
  Punch is a cli utility to handle time–tracking. Though punch was first written
  in bash for a "punch–card" model of use, I am now actively porting/rewriting it
  in node.js to provide a real–time web interface.
  <div class="fork">
  To fork this, run: <input
    value="git clone git://github.com/jzacsh/punch.git" />
  </div>

* [build_int][]<br />
  Build–int is a light-weight continous integration script written in bash to be
  run in cron. It works by polling for changes with `git` and rebuilding the
  target repository if necessary, always leaving out repo files, (eg.: .git/
  directory).
  <div class="fork">
  To fork this, run: <input
    value="git clone git://github.com/jzacsh/bin.git" />
  </div>

* [study.js][studyjs]<br />
  Study.js is a flash card application to help you study. Under active
  development, study.js is being written in node.js with a mongodb data store.
  <div class="fork">
  To fork this, run: <input
    value="git clone git://jzacsh.com/foss/studyjs.git" />
  </div>

* [drupalsh][]<br />
  Drupalsh is a set of bash scripts and functions for Drupal developers who spend
  a lot of time on the command line running through typical drupal–related tasks.
  <div class="fork">
  To fork this, run: <input
    value="git clone git://github.com/jzacsh/drupalsh.git" />
  </div>

* [etherback][]<br />
  etherback is a bash script to automatically backup any etherpad (or any
  raw–text source) document. Specifically, its made to run in cron, as this
  scirpt doesn't bother creating new backup files if it sees an old backup with
  the same contents already exists in its destination directory.
  <div class="fork">
  To fork this, run: <input
    value="curl -s https://raw.github.com/jzacsh/bin/master/share/etherback" />
  </div>

</section><!--//.projects-->

###Other Code

If I've had particular fun writing a script, I'll probably make note of it in
the above list (eg.: etherback). However, since none of them deserve their very
own repo, you can find them all bundled together in my personal ~/bin/ scripts.
The most useful stuff is generally in `~/bin/share` and `~/bin/lib`.

####Off the Github Track, code.jzacsh.com

A lot of code I write for fun isn't necessarily worthy of github-exposure, but
still open sourced. All code not found on github is [served directly from
gitweb][gitweb] (_hat tip to [gitolite][]_).

####Sneakily Forking my Stuff

Feel free to clone any project you find listed, by using the URL structure:
`git://jzacsh.com/directory/repo.git`. For example:

  1. project "kittens": `http://code.jzacsh.com/?p=foss/kittens.git`
  2. `git clone git://jzacsh.com/foss/kittens.git`

[drupal]: http://drupal.org/user/427067
[punch]: https://github.com/jzacsh/punch
[build_int]: https://github.com/jzacsh/bin/blob/master/share/build_int
[studyjs]: http://code.jzacsh.com/?p=foss/studyjs.git
[drupalsh]: https://github.com/jzacsh/drupalsh
[etherback]: https://github.com/jzacsh/bin/blob/master/share/etherback
[gitweb]: http://code.jzacsh.com/
[gitolite]: https://github.com/sitaramc/gitolite/wiki/ "self-hosted, self-managed git repositories."
[amazonmusic]: http://amzn.com/w/3BQ5MBGPPCPZS
[lastfm]: http://www.last.fm/user/jzacsh
