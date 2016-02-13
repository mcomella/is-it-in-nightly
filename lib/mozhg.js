// This module could be better formatted by having a base hgweb module wrapped by
// a mozilla-specific module but it's probably not worth the abstraction because
// I don't expect it to see much use. :P

var jsdom = require('jsdom')
    querystring = require('querystring');

const HGWEB_URL = 'http://hg.mozilla.org',
    TREE = 'mozilla-central',
    LOG_COMMAND = 'changelog';

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
    jsdom.env(url,
        [],
        (err, window) => {
            if (err) {
                callback(err);
                return;
            }

            var isValid;
            try {
                // hgweb returns a page where `<div class='title' ...` represents:
                //   A) a title listing the revisions that are being search
                //   B) a changeset title of the form: `<changeset-id>: <changeset-summary`
                //
                // If an invalid revisionset is passed, only A) will be shown. Therefore, to verify
                // a revisionset is valid, we verify that B) appears for the descendant changeset,
                // which is traditionally the topmost commit in the page. We don't try to validate
                // the ancester changeset because it may not appear if the results are paginated.
                var descendantRevisionMarkup = end + ':';
                var titleNodes = window.document.getElementsByClassName('title');
                isValid = Array.prototype.some.call(titleNodes, (node) => {
                    return node.innerHTML.trimLeft().startsWith(descendantRevisionMarkup);
                });
            } catch (domErr) {
                callback(domErr);
                return;
            }
            callback(null, isValid);
        });
};
