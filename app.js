var express = require('express'),
    mozhg = require('./lib/mozhg');
var	app = express();

app.get('/changeset/:changesetId', (req, res) => {
    // TODO: validate changesetid.
    var changesetToVerifyId = req.params.changesetId;

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
            res.send({isOnNightly: valid});
        });
    });
});

app.use(express.static('public'));

var port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});
