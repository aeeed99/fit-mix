app.factory('HomeFactory', function ($http) {
    var HomeFactory = {};
    var audio = document.createElement('audio');
    var isPlaying = false;

    HomeFactory.getTracks = function() {
        return $http.get('/api/tracks')
            .then(tracks => {
                console.log('HomeFactory.getTracks input tracks: ', tracks);
                return tracks.data;
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
