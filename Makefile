TMPSRV    := tmp
BINDIR    := bin

TAGHASH   := TAG_VERSION_HASH
TAGTREE   := TAG_VERSION_TREE
TAGDATE   := TAG_VERSION_DATE
GIT_HEAD  := `git symbolic-ref --short HEAD`
GIT_VER   := $(shell git show-ref --hash heads/$(GIT_HEAD) | tee | cut -c 1-10)
GIT_TREE  := "https://github.com/jzacsh/jzacsh-www/tree/$(GIT_VER)"
GIT_DATE  := `git show -s --format='%cd' $(GIT_VER)`

build: compile tagbuild

compile: setupbuild
	hugo

setupbuild: clean
	mkdir -p $(TMPSRV)/

tagbuild: TAG_SRC=$(shell find $(TMPSRV) -type f -name '*.html')
tagbuild:
	sed --in-place "s|$(TAGHASH)|$(GIT_VER)|"  $(TAG_SRC)
	sed --in-place "s|$(TAGTREE)|$(GIT_TREE)|" $(TAG_SRC)
	sed --in-place "s|$(TAGDATE)|$(GIT_DATE)|" $(TAG_SRC)

clean:
	$(RM) -rf $(TMPSRV)/*

deploy: build
	$(BINDIR)/github-pages.sh $(GIT_VER) $(TMPSRV)

deployGcs: build
	cd "$(TMPSRV)/" && gsutil rsync -d -r gs://$(GCS_BUCKET) .

deployAws: build
	cd "$(TMPSRV)/" && aws s3 sync --acl public-read . s3://$(S3_BUCKET)

deployKcdn: build
	rsync --recursive "$(TMPSRV)/" keycdn:zones/${KYCDN_ZONE}

.PHONY: deploy clean tagbuild build setupbuild compile
