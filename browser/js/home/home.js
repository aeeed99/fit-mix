app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
            tracks: function(HomeFactory) {
                //console.log("[resolve] starting..", $stateParams);
                return HomeFactory.getTracks();
            }
        }
    });
});

app.controller('HomeCtrl', function ($scope, HomeFactory, tracks) {
    // this is a test to see that we can get all tracks

    $scope.tracks = tracks;
    var idCounter = 0;

    $scope.tracks.forEach(function (track) {
        track.waveID = 'wave' + idCounter;
        console.log('waveID: ', track.waveID);
        idCounter++;
    });

    console.log('tracks: ', $scope.tracks);

    $scope.tracks.forEach(function (track) {
        track.src = '/api/tracks/' + track._id.toString() + '.audio';
    });

    $scope.playTrack = function(track) {
        HomeFactory.play(track);
    };

});
