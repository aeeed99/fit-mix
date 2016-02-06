app.factory('HomeFactory', function ($http) {
    var HomeFactory = {};
    var audio = document.createElement('audio');
    var isPlaying = false;

    HomeFactory.getTracks = function() {
        return $http.get('/api/tracks')
            .then(tracks => {
                tracks.data.forEach(function(track){
                    track.time = { m: Math.floor(track.duration/60),
                                   s: Math.ceil(track.duration%60)};
                    track.src = '/api/tracks/' + track._id.toString() + '.audio';
                })
                return tracks.data;
            });
    };

    HomeFactory.getSfx = function() {
        return $http.get('/api/sfx')
            .then(sfxes => {
                sfxes.data.forEach(function(sfx){
                    sfx.src = '/api/sfx/' + sfx._id.toString() + '.audio';
                })
                return sfxes.data;
            });
    };

    HomeFactory.play = function(track) {
        if (isPlaying) {
            HomeFactory.pause();
        } else {
            audio.src = '/api/tracks/' + track._id.toString() + '.audio';
            console.log('Full audio: ', audio);
            console.log('audio src: ', audio.src);
            audio.load();
            audio.play();
            isPlaying = true;
        }
    };

    HomeFactory.pause = function() {
        audio.pause();
        isPlaying = false;
    };
    return HomeFactory;
});
