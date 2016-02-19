var mozhg = require('./lib/mozhg');

// TODO: Validate changeset.
var changesetToVerifyId = '7ced13d644be';

console.log('running application');

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
    });
});
