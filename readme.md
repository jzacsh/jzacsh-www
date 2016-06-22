Code for Jonathan Zacsh's personal website: https://j.zac.sh

## Development

This is a a repository of mostly text _(written in markdown)_ - and a tiny bit of
coded - that is automatically turned into a directory of static HTML assets
using:
  1. some glue code via `package.json` `scipts` API
  2. [SuSi](https://github.com/AVGP/susi) static site generator _(ie: `npm run build`)_

### Git Branches
  1. Source & content: `src` branch
  2. generated website: `master` branch

### Commands:

Build static content of this repo into HTTP static files for serving:
```bash
npm run build
```

#### Advanced

To make changes and _automatically_ `npm run build`:
```bash
npm run watch
```

To see contents of an `npm run build`:
```bash
xdg-open tmp/  # inspect

python3 -m http.server  # and serve it, if you'd like
```

To modify/list above commands
```bash
npm run  # prints list based on package.json `scripts` map
```

#### Setup

Just one-time, after *first* cloning this codebase:
```bash
npm install
```

### Deploying to KeyCDN

History of deploys can be seen on the `master` branch
[history in github's "network pane"](https://github.com/jzacsh/jzacsh.github.com/network)

To automatically generate _(`npm run build`)_ and deploy _(`git {commit,push}`)_
a new `master` branch to github:
```bash
npm run deploy
```

Optionally: [KeyCDN's simple `curl` command to purge cache](https://www.keycdn.com/api#purge-zone-cache)
