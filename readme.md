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

To automatically generate and deploy a new `master` branch:
```bash
npm run deploy
```
