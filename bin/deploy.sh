#!/usr/bin/env bash
#
# Deploys the $1 directory output for current build to github.io pages

(( BASH_VERSINFO[0] < 4 )) && exit 99  # panic and tear hair out
set -e
set -x


#
# basic info and tools...
#
colEnd='\033[0m'  # end cap
colRed='\e[1;31m'
colGrn='\e[1;32m'

popdBranch="$(git symbolic-ref --short HEAD)"
srcBranch='src'
targetBranch='master'
repoDir="$(npm root)"
repoDir="${repoDir%/node_modules}"
pushTarget=origin
# TODO(zacsh) Figure out how to get this from npm directly (in npm run scripts
# this is $npm_package_config_temp/, but not accessible via `npm config`
# command...)
buildDir="$1"


[ "$popdBranch" = "$srcBranch" ] || exit 99

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
  if [ -n "$(git ls-files)" ]; then
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
  if [ -n "$mkTmpTemplate" ];then
    printf 'Cleaning up temp files, suffixed, "%s"-\n' "$mkTmpTemplate"
    if [ -n "$buildTarBall" ];then rm "$buildTarBall";fi
    if [ -n "$tempRepo" ];then     rm -rf "$tempRepo";fi
  fi
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

versionDeploy="$(npm run -s version)"
if isRepoDirty; then
  if [ "$1" = -p ];then
    fatalError 99 'NOT IMPLEMENTED: -p(rompt) to force deploy\n'
  else
    fatalError 1 'MUST FIX before deploying: repo is dirty or has untracked files.\n'
  fi
fi

# ensure we don't have merge conflicts
git checkout "$targetBranch"
git pull origin  "$targetBranch" > /dev/null
remotePushedTarget="$(git config --get "remote.${pushTarget}.url")"
git checkout "$popdBranch"

mkTmpTemplate="$(basename "$repoDir")-deploy-v$versionDeploy"


# setup somewhere else, don't want to make a mess of current repo
tempRepo="$(mktemp -d -t "${mkTmpTemplate}-repo.XXXXXXX")"
git clone "$repoDir" "$tempRepo"
cd "$tempRepo"
git checkout "$popdBranch"
buildTarBall="$(mktemp -t "${mkTmpTemplate}.XXXXXXX.tgz")"
npm install > /dev/null # too noisy
npm run clean
npm run build
cd "$buildDir"
tar -zcvf "$buildTarBall" ./*

cd "$tempRepo"

# unpack assets to top-level dir ./
git checkout "$targetBranch"
gitRmRepoContents > /dev/null  # clean house
tar -xvf "$buildTarBall"
git add .

if ! isRepoDirty;then
  fatalError 2 \
    'Nothing to deploy: v.%s built identically to %s at %s\n' \
    "$versionDeploy" "$targetBranch" "$(getCurrentHash)"
fi

git commit -a -m "$(buildDeployCommitMsg "$versionDeploy")" >/dev/null  # too noisy
ghPagesDeployHash="$(getCurrentHash)"
git push "$remotePushedTarget" "$targetBranch"

cleanup  # cleanup after ourselves

cd "$repoDir"
printf "\n\n${colGrn}DEPLOY PUSHED${colEnd}: %s/tree/%s\n" \
    "$remotePushedTarget" "$ghPagesDeployHash"
