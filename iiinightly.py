#!/usr/bin/env python2
from argparse import ArgumentParser
import hglib
import json
import re
import sys
import urllib2

UPSTREAM = 'https://hg.mozilla.org/mozilla-central/'
LATEST_CHANGESET_DIR = 'https://archive.mozilla.org/pub/mobile/nightly/latest-mozilla-central-android-api-11/'
LATEST_CHANGESET_REGEX = re.compile('fennec-.*?\.json')  # TODO: fragile.

def parse_arguments():
  parser = ArgumentParser(description='todo')
  parser.add_argument('changeset')
  parser.add_argument('--path', default='.', help='Path to mozilla hg directory. '
                      'Defaults to the current directory')
  return parser.parse_args()


def is_changeset_in_nightly(changeset, repo_path):
  client = hglib.open(repo_path)
  # TODO: VERIFY is MOZILLA DIR BEFORE PULLING
  # TODO: PULL latest changesets: client.pull(UPSTREAM)
  latest_nightly_changeset_json = get_latest_nightly_changeset()
  latest_nightly_changeset = latest_nightly_changeset_json['moz_source_stamp']
  revset = changeset + '::' + latest_nightly_changeset
  matching_changesets = client.log(revset)

  client.close()  # TODO: close in all error conditions

  return bool(matching_changesets)


def get_latest_nightly_changeset():
  changeset_dir = urllib2.urlopen(LATEST_CHANGESET_DIR)
  json_file_url = LATEST_CHANGESET_DIR + LATEST_CHANGESET_REGEX.search(changeset_dir.read()).group(0)
  json_file = urllib2.urlopen(json_file_url)
  return json.loads(json_file.read())


def main():
  args = parse_arguments()
  isInNightly = is_changeset_in_nightly(args.changeset, args.path)

  if isInNightly:
    print 'Yes'
  else:
    print 'No'

if __name__ == "__main__":
  main()
