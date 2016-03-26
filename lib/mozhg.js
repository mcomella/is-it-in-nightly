// This module could be better formatted by having a base hgweb module wrapped by
// a mozilla-specific module but it's probably not worth the abstraction because
// I don't expect it to see much use. :P

var cheerio = require('cheerio'),
    querystring = require('querystring'),
    request = require('request');

const HGWEB_URL = 'https://hg.mozilla.org',
    TREE = 'mozilla-central',
    LOG_COMMAND = 'changelog',
    JSON_LOG_COMMAND = 'json-' + LOG_COMMAND,
    CHANGESET_SUMMARY_LENGTH = 12;

const LATEST_NIGHTLY_HOST = 'https://archive.mozilla.org',
    LATEST_NIGHTLY_URL = LATEST_NIGHTLY_HOST + '/pub/mobile/nightly/latest-mozilla-central-android-api-15/',
    LATEST_NIGHTLY_JSON_REGEX = 'fennec-(\\d+).*\.multi\.android-arm\.json$';

function handleRequestError(err, callback) {
    if (err) {
        // We can error out with a variety of data so standardize on a string.
        callback(err.toString());
        console.error(err);
        return true;
    }
    return false;
}

function getLogUrl(start, end) {
    var queryParams = querystring.stringify({rev: start + '::' + end});
    return HGWEB_URL + '/' +
            TREE + '/' +
            LOG_COMMAND + '?' +
            queryParams;
}

function getUrlForChangelogForRevision(revision) {
    return HGWEB_URL + '/' +
            TREE + '/' +
            JSON_LOG_COMMAND + '/' +
            revision;
}

var isRevisionValid = function (id, callback) {
    var url = getUrlForChangelogForRevision(id);
    request(url, (err, res, body) => {
        if (handleRequestError(err, callback)) {
            return;
        }

        // If the revision is valid, we receive a a JSON obj w/ a node attr.
        // If not valid, we receive a String.
        var isValid;
        try {
            var parsed = JSON.parse(body);
            isValid = Boolean(parsed.node);
        } catch (e) {
            isValid = false;
        }
        callback(null, isValid);
    });
}
exports.isRevisionValid = isRevisionValid;

// TODO: This method sucks and would be better written if isRevisionValid was
// a Promise (e.g. Promise.all). However, I don't feel like setting up the
// infrastructure to test promises so we have this.
function areBothRevisionsValid(r1, r2, callback) {
    isRevisionValid(r1, function (err1, isR1Valid) {
        isRevisionValid(r2, function (err2, isR2Valid) {
            if (err1 || err2) {
                callback('' + err1 + err2);
            } else {
                callback(null, isR1Valid && isR2Valid);
            }
        });
    });
}

var isRevisionSetValid = function (start, end, callback) {
    // Finding a revision set via hgweb hangs for several seconds if a revision is
    // invalid so we fast error out by first verifying if the changesets are valid
    // before checking the full revision set.
    areBothRevisionsValid(start, end, function (err, areRevisionsValid) {
        if (err) {
            callback(err);
            return;
        }

        if (!areRevisionsValid) {
            console.log('Fast error out. One or more of the given revisions is invalid');
            callback(null, false);
            return;
        }

        // Ideally, we use the JSON api but it's not implemented yet.
        // Instead, we scrape the hgweb page.
        var url = getLogUrl(start, end);
        console.log('Accessing ' + url);
        request(url, (err, res, body) => {
            if (handleRequestError(err, callback)) {
                return;
            }

                var descendantRevisionShort = end.slice(0, CHANGESET_SUMMARY_LENGTH);
                var descendantRevisionMarkup = descendantRevisionShort + ':';

                // hgweb returns a page where `<div class='title' ...` represents:
                //   A) a title listing the revisions that are being search
                //   B) a changeset title of the form: `<changeset-id>: <changeset-summary`
                //
                // If an invalid revisionset is passed, only A) will be shown. Therefore, to verify
                // a revisionset is valid, we verify that B) appears for the descendant changeset,
                // which is traditionally the topmost commit in the page. We don't try to validate
                // the ancester changeset because it may not appear if the results are paginated.
                var $ = cheerio.load(body);
                var titleNodes = $('.title:contains("' + descendantRevisionShort + '")');
                // .filter() does not appear to return an Object I could call html() on so old school loop.
                var isValid = false;
                for (var i = 0; i < titleNodes.length; i++) {
                    if (titleNodes.eq(i).html().trimLeft().startsWith(descendantRevisionMarkup)) {
                        isValid = true;
                        break;
                    }
                }
                callback(null, isValid);
        });
    });
};
exports.isRevisionSetValid = isRevisionSetValid;

function getLatestChangesetJsonPathFromHtml(html) {
    var $ = cheerio.load(html);
    var linkNodes = $('a');
    var matches = [];
    for (var i = 0; i < linkNodes.length; i++) {
        var node = linkNodes.eq(i);

        var path = node.attr('href');
        var match = path.match(LATEST_NIGHTLY_JSON_REGEX);
        if (match) {
            matches.push({version: match[1], path: path});
        }
    }

    if (matches.length == 0) {
        console.err('Could not match regex to get latest Nightly changeset.');
        return null;
    }

    var latestVersion = matches.reduce((acc, match) => {
        if (match.version > acc.version) {
            return match;
        } else {
            return acc;
        }
    });
    return LATEST_NIGHTLY_HOST + latestVersion.path;
}

var getLatestNightlyChangesetId = function (callback) {
    request(LATEST_NIGHTLY_URL, (err, res, body) => {
        if (handleRequestError(err, callback)) {
            return;
        }

        var latestChangesetJson = getLatestChangesetJsonPathFromHtml(body);
        if (!latestChangesetJson) {
            callback('Latest Nightly changeset json file could not be found');
            return;
        }

        request({url: latestChangesetJson, json: true}, (error, res, body) => {
            if (handleRequestError(error, callback)) {
                return;
            }

            // TODO: validate status code?
            var latestChangesetId = body.moz_source_stamp;
            var err = (latestChangesetId) ? null : 'Could not retrieve changeset ID from JSON';
            callback(err, latestChangesetId);
        });
    });
};
exports.getLatestNightlyChangesetId = getLatestNightlyChangesetId;
