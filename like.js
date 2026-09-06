'use strict';

var libQ = require('kew');
var axios = require('axios');
var querystring = require('querystring');

// The generated yandex-music-client only exposes like add/remove (no dislike
// endpoints at all), so we call the raw API directly for both, reusing the
// OAuth header already prepared on the client instance.
function postTrackIds(client, uid, path, track_id) {
    var defer = libQ.defer();

    var params = querystring.stringify({ 'track-ids': track_id });
    var headers = Object.assign({}, client.request.config.HEADERS, {
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    axios.post('https://api.music.yandex.net/users/' + uid + '/' + path, params, { headers: headers })
        .then(function (resp) {
            defer.resolve(resp.data);
        }).catch(function (err) {
            defer.reject(new Error(err));
        });

    return defer.promise;
}

function likeTrack(client, uid, track_id) {
    return postTrackIds(client, uid, 'likes/tracks/add-multiple', track_id);
}

function unlikeTrack(client, uid, track_id) {
    return postTrackIds(client, uid, 'likes/tracks/remove', track_id);
}

function dislikeTrack(client, uid, track_id) {
    return postTrackIds(client, uid, 'dislikes/tracks/add-multiple', track_id);
}

function undislikeTrack(client, uid, track_id) {
    return postTrackIds(client, uid, 'dislikes/tracks/remove', track_id);
}

module.exports = {
    likeTrack: likeTrack,
    unlikeTrack: unlikeTrack,
    dislikeTrack: dislikeTrack,
    undislikeTrack: undislikeTrack
};
