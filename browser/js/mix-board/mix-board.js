app.config(function($stateProvider){

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController'
    })
});

app.controller('MixBoardController', function($scope, myThing){
    $scope.hello = "Hello from the soon to be mix controller!";
    $scope.foo = myThing;
});

app.value('testLibrary', [
    {

    }
]);