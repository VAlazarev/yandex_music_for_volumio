'use strict';

var http = require('http');
var url = require('url');

// A tiny HTTP front end for the like/dislike actions, so they can be
// triggered from outside Volumio - Home Assistant calls these with its
// built-in rest_command, which speaks plain HTTP and cannot talk to
// Volumio's socket API. Volumio's own REST API is a fixed list of
// commands in the core with no way for a plugin to add to it.

function Api(plugin, logger) {
    var self = this;

    self.plugin = plugin;
    self.logger = logger;
    self.server = false;
};

Api.prototype.start = function(port) {
    var self = this;

    if (self.server) {
        return;
    }

    self.server = http.createServer(function (req, res) {
        var path = url.parse(req.url).pathname;
        var action;

        if (path == '/like') {
            action = self.plugin.likeCurrentTrack();
        } else if (path == '/dislike') {
            action = self.plugin.dislikeCurrentTrack();
        } else {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'not found'}));
            return;
        }

        action.then(function (result) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result));
        }).fail(function (err) {
            self.logger.error('[yandex_music] API ' + path + ' failed: ' + err);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: String(err && err.message ? err.message : err)}));
        });
    });

    self.server.on('error', function (err) {
        self.logger.error('[yandex_music] API server error: ' + err);
    });

    self.server.listen(port, '0.0.0.0');
};

Api.prototype.stop = function() {
    var self = this;

    if (self.server) {
        self.server.close();
        self.server = false;
    }
};

module.exports = Api;
