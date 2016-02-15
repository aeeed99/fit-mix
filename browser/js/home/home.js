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
    })
        .state('home.welcome', {
            url: "",
            templateUrl: 'js/home/states/welcome.html',
            controller: function($scope, $state){
                $scope.wizard = function(){ $state.go('home.wizard'); }
            }
        })
        .state('home.wizard', {
            url: "",
            templateUrl: 'js/home/states/wizard.html',
            controller: 'wizardController'
        })
});

app.controller('HomeCtrl', function ($scope, $state, HomeFactory, tracks) {
    // this is a test to see that we can get all tracks
    $state.transitionTo('home.welcome');
    $scope.tracks = tracks;
    var idCounter = 0;
    $scope.myInterval = 3000;
    $scope.slides = [
        {
            text: "hello",
            id: 1,
            image: "http://www.fillmurray.com/1600/900",
            active: true
        }
    ]

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
app.controller('wizardController', function($scope, $state){
    $scope.mixData = {
        duration: null
    };
    $scope.structures = [
        {
            name: "HIIT",
            description: "A \"High Intensity Interval Training\" structure that alternates between "+
                "maximum effort and resting sprints.",
            number: 0
        },
        {
            name: "Spin Class",
            description: "A long structure based on a basic loop sequence. Includes recommended "+
                "riding positions that are repeated three times.",
            number: 1
        },
        {
            name: "3-cycle Shred",
            description: "Inspired by Jillian Michaels' routines. Provdes a series of 3/2/1-minute "+
                "sections, with cardio/strength/abs recommended for each section respectively.",
            number: 2
        },
        {
            name: "Custom",
            description: "If you select custom, you can create and add stages to your mix during creation."
        }
    ];

    $scope.startMix = function(){
        $state.go('mix-board', { wizardData: $scope.mixData })
    }

});
