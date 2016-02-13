var express = require('express'),
    mozhg = require('./lib/mozhg');
var	app = express();

app.get('/', (req, res) => {
    // TODO: It's slow if the answer is false.
    mozhg.isRevisionSetValid('20d90d9a12ce', 'd719ac4bcbec', (err, valid) => {
        res.send('hello world ' + valid);
    });
});

app.use(express.static('public'));

var port = 5000;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});
