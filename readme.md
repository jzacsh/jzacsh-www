Code for Jonathan Zacsh's personal website.

## Development
**NOTE**: Pre-requisite that you run `npm install` once.

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

To automatically generate _(`npm run build`)_ and deploy _(`git {commit,push}`)
a new `master` branch to github:
```bash
npm run deploy
```
