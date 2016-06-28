TMPSRV    := tmp

TAGHASH   := TAG_VERSION_HASH
TAGTREE   := TAG_VERSION_TREE
TAGDATE   := TAG_VERSION_DATE
TAG_SRC   := $(shell find $(TMPSRV) -type f -name '*.html')
GIT_HEAD  := `git symbolic-ref --short HEAD`
GIT_VER   := $(shell git show-ref --hash heads/$(GIT_HEAD) | tee | cut -c 1-10)
GIT_TREE  := "https://github.com/jzacsh-www/tree/$(GIT_VER)"
GIT_DATE  := `git show -s --format='%cd' $(GIT_VER)`

build: compile tagbuild

compile: setupbuild
	hugo

setupbuild: clean
	mkdir -p $(TMPSRV)/

tagbuild:
	sed -i "s|$(TAGHASH)|$(GIT_VER)|"  $(TAG_SRC)
	sed -i "s|$(TAGTREE)|$(GIT_TREE)|" $(TAG_SRC)
	sed -i "s|$(TAGDATE)|$(GIT_DATE)|" $(TAG_SRC)

clean:
	$(RM) -rf $(TMPSRV)/*

# TODO was originally usig this
# https://gist.github.com/93c3f39a7bdfb5f665c8.git#98d8709
# as a way to continue pushing to github, to maintain a `master` that shows the
# snapshots website content for me
archive:
	@echol 'NOT IMPLEMENTED' gh-pages-deploy "$(TMPSRV)/"

deploy: archive
	rsync --recursive "$(TMPSRV)/" keycdn:zones/jzacsh/

.PHONY: deploy archive, clean tagbuild build setupbuild compile
