var ChangesetForm = require('./lib/ui/changesetform').ChangesetForm,
    mozhg = require('./lib/mozhg'),
    React = require('react'), // Used by reactify.
    ReactDOM = require('react-dom');

// TODO: Validate changeset.
var isItOnNightly = function (changesetToVerifyId, callback) {
    mozhg.getLatestNightlyChangesetId((err, latestNightlyChangesetId) => {
        if (err) {
            // TODO: Pass errors to client.
            console.error(err);
            return;
        }

        // TODO: It's slow if the answer is false.
        mozhg.isRevisionSetValid(changesetToVerifyId, latestNightlyChangesetId, (err, valid) => {
            if (err) {
                // TODO: Pass errors to client.
                console.error(err);
                return;
            }
            console.log('%s is in Nightly: %s', changesetToVerifyId, valid);
            callback(valid, changesetToVerifyId);
        });
    });
}

ReactDOM.render(
    <ChangesetForm callback={isItOnNightly} />,
    document.getElementById('form_content')
);
