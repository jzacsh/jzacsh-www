#!/usr/bin/env bash
#
# Deploys the $1 directory output for current build to github.io pages

(( BASH_VERSINFO[0] < 4 )) && exit 99  # panic and tear hair out
set -euo pipefail
set -x

versionDeploy="$1"
buildDir="$2"
domainName="$3"

staticContentDir="$(readlink -f "$buildDir")"

#
# basic info and tools...
#
colEnd='\033[0m'  # end cap
colRed='\e[1;31m'
colGrn='\e[1;32m'

# current branch, eg: 'src', or 'some-experimental-thing'
popdBranch="$(git symbolic-ref --short HEAD)"

# the source of truth branch from which to build github pages static content
srcBranch='src'

# the branch we've told github (via UI settings) to render pages from
targetBranch='master'

repoDir="$(readlink -f "$(dirname "$0")/..")"
pushTarget=origin

[[ "$popdBranch" = "$srcBranch" ]] ||
  fatalError 1 'Expected to build from non-dirty "%s" branch, but in "%s"\n' \
    "$srcBranch" "$popdBranch"

# returns 1 if there is stuff uncommitted, or untracked in the repo
isRepoDirty() {
  test -n "$(git diff --shortstat 2>&1)" ||
    test -n "$(git status --porcelain 2>&1)"
}

# Prints commit message for the $targetBranch commit being made, given args:
# - $1 git version tag
buildDeployCommitMsg() {
  printf 'automatic github pages deploy, built from tree/%s v.%s' \
      "$popdBranch" \
      "$1"
}

getCurrentHash() {
  local hashHead
  hashHead="$(git show-ref --hash heads/$srcBranch)"
  printf '%s' "${hashHead:0:10}"
}

gitRmRepoContents() {
  git ls-files --others -i --exclude-standard | while read file; do
    rm -v "$file"  # git is so fng complicated stackoverflow.com/a/15931542
  done
  git clean -d --force -x  # rm untracked files and such
  if [[ -n "$(git ls-files)" ]]; then
    git rm -rf *
  fi
}

fatalError() {
  local err="$1"
  local msg="$2"
  shift 2

  printf "${colRed}ERROR:\t${colEnd}$msg" $@ >&2

  cleanup; exit $err
}

cleanup() {
  [[ -n "$mkTmpTemplate" ]] || return 0

  printf 'Cleaning up temp files, suffixed, "%s"-\n' "$mkTmpTemplate"
  if [[ -n "$tempRepo" ]];then rm -rf "$tempRepo";fi
}

# capture "set -e"; see:
#   man bash | less +/^\w*SHELL.BUILTIN.COMMANDS
dieErr() {
  printf 'Caught ERR, cleaning up before exit...\n' >&2
  cleanup
}
trap dieErr ERR


#
# actual deploy steps...
#

cd "$repoDir"  # ensure we're at the root of the repo

if isRepoDirty; then
  if [[ "$1" = -p ]];then
    fatalError 99 'NOT IMPLEMENTED: -p(rompt) to force deploy\n'
  else
    fatalError 1 'MUST FIX before deploying: repo is dirty or has untracked files.\n'
  fi
fi

# ensure we don't have merge conflicts
git checkout "$targetBranch"
git pull origin "$targetBranch" > /dev/null
remotePushedTarget="$(git config --get "remote.${pushTarget}.url")"
git checkout "$popdBranch"

mkTmpTemplate="$(basename "$repoDir")-deploy-v$versionDeploy"


# setup somewhere else, don't want to make a mess of current repo
tempRepo="$(mktemp -d -t  "${mkTmpTemplate}-repo.XXXXXXX")"
git clone "$repoDir" "$tempRepo"
cd "$tempRepo"
git checkout "$targetBranch"
# step 1: cleanup, removing all current static content
#find "$tempRepo" -path "$tempRepo"/.git -prune -o -exec rm {} +;
gitRmRepoContents > /dev/null
# step 2: install new static content
rsync --archive --acls --xattrs --verbose "$staticContentDir"/ ./
# step 3: write custom CNAME file for github
echo -n "$domainName" > CNAME
# step 4: stage so git knows about new static content
git add .

if ! isRepoDirty;then
  fatalError 2 \
    'Nothing to deploy: v.%s built identically to %s at %s\n' \
    "$versionDeploy" "$targetBranch" "$(getCurrentHash)"
fi

# step 5: write a custom commit message for new static content
git commit -a -m "$(buildDeployCommitMsg "$versionDeploy")" >/dev/null  # too noisy
ghPagesDeployHash="$(getCurrentHash)"

# step 6: deploy new static content to github
git push "$remotePushedTarget" "$targetBranch"

printf "\n\n${colGrn}DEPLOY PUSHED${colEnd}: %s/tree/%s\n" \
    "$remotePushedTarget" "$ghPagesDeployHash"

cleanup  # cleanup after ourselves
