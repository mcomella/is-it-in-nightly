// This module could be better formatted by having a base hgweb module wrapped by
// a mozilla-specific module but it's probably not worth the abstraction because
// I don't expect it to see much use. :P

var cheerio = require('cheerio'),
    querystring = require('querystring'),
    request = require('request');

const HGWEB_URL = 'https://hg.mozilla.org',
    TREE = 'mozilla-central',
    LOG_COMMAND = 'changelog',
    CHANGESET_SUMMARY_LENGTH = 12;

const LATEST_NIGHTLY_HOST = 'https://archive.mozilla.org',
    LATEST_NIGHTLY_URL = LATEST_NIGHTLY_HOST + '/pub/mobile/nightly/latest-mozilla-central-android-api-15/',
    LATEST_NIGHTLY_JSON_REGEX = 'fennec-.*\.json$';

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

exports.isRevisionSetValid = function isRevisionSetValid(start, end, callback) {
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
};

function getLatestChangesetJsonPathFromHtml(html) {
    var $ = cheerio.load(html);
    var linkNodes = $('a');
    for (var i = 0; i < linkNodes.length; i++) {
        var node = linkNodes.eq(i);
        if (node.attr('href').match(LATEST_NIGHTLY_JSON_REGEX)) {
            return LATEST_NIGHTLY_HOST + node.attr('href');
        }
    }
}

exports.getLatestNightlyChangesetId = (callback) => {
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
