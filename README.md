[![Build
Status](https://travis-ci.org/mcomella/is-it-in-nightly.svg?branch=master)](https://travis-ci.org/mcomella/is-it-in-nightly)

# Is it in Nightly?
Find out if a given changeset is in the latest Nightly build. Try it live at
[mcomella.xyz/is-it-in-nightly](mcomella.xyz/is-it-in-nightly).

## Setup
Install deps:

    npm install

## Run
To compile:

    ./build

Open the file locally in your browser. On OS X:

    open dist/index.html

Or host a local web server:

    cd dist && python -m SimpleHTTPServer

By default, connect to `localhost:8000`.

## Test
Run:

    npm test
