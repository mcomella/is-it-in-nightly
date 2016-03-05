# Is it on Nightly?
Find out if a given changeset is in the latest Nightly build.

[![Build
Status](https://travis-ci.org/mcomella/is-it-in-nightly.svg?branch=master)](https://travis-ci.org/mcomella/is-it-in-nightly)

## Setup
Install deps:

    npm install

## Run
To compile & run:

    ./build
    cd dist && python -m SimpleHTTPServer

By default, connect to `localhost:8000`.

## Misc
A previous version of this ran locally in a python script, accessing the user's
local pull of mozilla-central. You can find that in `local/`.
