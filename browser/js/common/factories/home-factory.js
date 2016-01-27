app.factory('HomeFactory', function($http){
    var HomeFactory = {};
    var audio = document.createElement('audio');
    var isPlaying = false;

    HomeFactory.getTracks = function(){
            return $http.get('/api/tracks')
                .then(tracks => {
                    console.log("tracks in factory", tracks);
                   return tracks.data;
                });
        }

    HomeFactory.play =function(track){
        if (isPlaying){ HomeFactory.pause()}
         else{ audio.src  = '/api/tracks/' + track._id.toString() + '.audio';
        console.log("full audio", audio)
        console.log("src", audio.src)
        audio.load();
        audio.play()
        isPlaying = true;
    }
    }

    HomeFactory.pause =function(){
        audio.pause();
        isPlaying = false;
    }
    return HomeFactory
});
