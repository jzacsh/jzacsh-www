#!/usr/bin/env bash

die() { echo "usage: \`$(basename "$0")\` 'cmd' dir/" >&2; exit 1; }

(( $# == 2 )) || die
cmd="$1"; watchTarget="$2"
captureChanges() { command $cmd; }

{ [ -d "$watchTarget" ] && [ -r "$watchTarget" ]; } || die

captureChanges  # kick off one test run
watchForChanges(){
  inotifywait --event modify --recursive $watchTarget

  captureChanges # capture modification

  watchForChanges  # captured; now wait for the next one
}
watchForChanges # start infinite loop of modify->capture(via $cmd)
