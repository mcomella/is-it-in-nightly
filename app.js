var express = require('express'),
    jsdom = require('jsdom'),
    mozhg = require('./lib/mozhg');
var	app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    mozhg.isRevisionSetValid('20d90d9a12ce', 'd719ac4bcbec', (err, valid) => {
        res.send('hello world ' + valid);
    });
});

app.use(express.static('public'));

var port = 5000;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});
