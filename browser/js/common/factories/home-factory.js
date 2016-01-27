app.factory('HomeFactory', function($http){
    var HomeFactory = {};
    var audio = document.createElement('audio');

    //     function load (song, songList) {
    //     audio.src = song.audioUrl;
    //     audio.load();
    //     currentSong = song;
    //     currentSongList = songList;
    //     progress = 0;
    // }
    HomeFactory.getTracks = function(){
            return $http.get('/api/tracks')
                .then(tracks => {
                    console.log("tracks in factory", tracks);
                   return tracks.data;
                });
        }
    HomeFactory.getAudio = function(song){
            audio.src  = '/api/tracks/' + song._id.toString() + '.audio';
            console.log("full audio", audio)
            console.log("src", audio.src)
            audio.load();
            audio.play()
        }
    return HomeFactory
});
