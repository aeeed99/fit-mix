app.config(function($stateProvider){

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController'
    })
});

app.controller('MixBoardController', function($scope){
    $scope.hello = "Hello from the soon to be mix controller!";
    $scope.library = [
        {
            name: "Call me Maybe",
            artist: 'Carly Rae Jepsen',
            time: {
                m: 3,
                s: 24
            },
            bpm: 138
        },
        {
            name: "Shake it Off",
            artist: 'T Swift',
            time: {
                m: 3,
                s: 59
            },
            bpm: 145
        }
    ];
});
