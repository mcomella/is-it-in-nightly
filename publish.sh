#!/bin/bash

# TODO: It'd be great if we can stash first but then I need to know how
# to save the output of a command (i.e. we don't want to `stash pop` if
# we didn't stash.
echo "Building..." && ./build && \
    mkdir publish && \
    echo "Copying dist/* to publish/..." && cp -r dist/* publish && \
    echo "Checkout docs branch..." && git checkout gh-pages && \
    echo "Copying publish/* to ." && cp -r publish/* . && \
    echo "Commiting changes..." && \
        git commit -am "Automated commit via publish.sh" && \
    echo "Pushing to github..." && git push origin gh-pages:gh-pages
git checkout master
