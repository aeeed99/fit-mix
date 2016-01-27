app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl',
    });
});

app.controller('HomeCtrl', function($scope){
    // var context;
    // window.addEventListener('load', init, false);
    // function init() {
    //      try {
    //         // Fix up for prefixing
    //         window.AudioContext = window.AudioContext||window.webkitAudioContext;
    //         context = new AudioContext();
    //         console.log("created", context)
    //       }
    //       catch(e) {
    //         alert('Web Audio API is not supported in this browser');
    //       }
    // }

    //     init()

    // var file = URL.createObjectURL(file);
    // audio_player.src = 'server/audio/WerkinGirls.wav';
    // audio_player.play();
 HomeFactory.getTracks()

})


app.factory('HomeFactory', function($http){
    var HomeFactory = {}
    HomeFactory.getTracks = function(){
            return $http.get('/api/tracks')
                .then(track => {
                    console.log("track", track);
                   return track.data;
                });
        },
})
