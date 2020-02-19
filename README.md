Code for Jonathan Zacsh's personal website: https://j.zac.sh

## Development

This is a a repository of mostly text _(written in asciidoc)_ - and a tiny bit
of code - that is automatically turned into a directory of static HTML assets
using:
  1. `hugo` binary to compile and manage content
  1. simple Make commands: `build` and `deploy`

### Git Branches
  1. Source & content: `src` branch
  2. generated website: `master` branch

### Commands:

Build static content of this repo into HTTP static files for serving:
```bash
make build
```

#### Advanced

To make changes and live reload in your browser:
```bash
hugo server
```

To see final (CDN-ready) contents of `make build`:
```bash
xdg-open tmp/  # inspect

python3 -m http.server  # and serve it, if you'd like
```

#### Setup

Just one-time, after *first* cloning this codebase:
```bash
go get github.com/spf13/hugo
```

### Deploying

History of deploys can be seen on the `master` branch
[history in github's "network pane"](https://github.com/jzacsh/jzacsh.github.com/network)

To automatically generate _(`make build`)_ and deploy _(`git {commit,push}`)_
a new `master` branch to github:
```bash
TODO make this true again
make deploy
```

#### Deploying to AWS

A proven method that worked for me _previously_ - when Github pages didn't allow
for HTTPS static sites - was hosting on AWS Cloud Front. At some point the following worked:
```bash
make S3_BUCKET=my-bucket-name deployAws
```

And before AWS, I was using KeyCDN successfully as well (wiih `make
KEYCDN_ZONE=myzone deploy`).

#### Deploying to Google Cloud

I've learned that one can _also_ follow [this Google Cloud Storage
guide][googStaticSite] to serve most of this content via Google Cloud, but then
you'll find [the limitation that you cannot use HTTPs][googNoHttps].

[googStaticSite]: https://cloud.google.com/solutions/web-serving-overview#static-site
[googNoHttps]: https://cloud.google.com/storage/docs/troubleshooting#https

```bash
make GCS_BUCKET=my-bucket-name deployGcs
```
