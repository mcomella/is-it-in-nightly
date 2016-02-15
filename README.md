# Is it on Nightly?
Find out if a given changeset is in the latest Nightly build.

## Setup
Install deps:

    npm install

## Run
To run locally:

    ./run_dev

By default, connect to `localhost:5000`.

To run via heroku Procfile:

    ./heroku local web

## Config
You can use the `PORT` environment variable to specify an alternative port.

## Misc
A previous version of this ran locally in a python script, accessing the user's
local pull of mozilla-central. You can find that in `local/`.
