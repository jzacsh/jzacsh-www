Code for Jonathan Zacsh's personal website.

## Development

**NOTE**: Pre-requisite that you run `npm install` once.

This is a a repository of mostly text _(written in markdown)_ - and a tiny bit of
coded - that is automatically turned into a directory of static HTML assets
using:
  1. some glue code via `package.json` `scipts` API
  2. [SuSi](https://github.com/AVGP/susi) static site generator _(ie: `npm run build`)_

### Git Branches
  1. Source & content: `src` branch
  2. generated content: `master` branch

### Commands:

To build the static content of this repo into HTTP static files for serving:
```bash
npm run build
```

To make changes and _automatically_ `npm run build`:
```bash
npm run watch
```

To see contents of an `npm run build`:
```bash
xdg-open tmp/  # inspect

python -m SimpleHTTPServer 8000  # and serve it, if you'd like
```

To modify/list above commands
```bash
npm run  # prints list based on package.json `scripts` map
```

### Deploying to Github as User Site

History of deploys can be seen on the `master` branch
[history in github's "network pane"](https://github.com/jzacsh/jzacsh.github.com/network)

To automatically generate _(`npm run build`)_ and deploy _(`git {commit,push}`)_
a new `master` branch to github:
```bash
npm run deploy
```
