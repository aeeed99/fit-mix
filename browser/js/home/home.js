app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl',
    });
});

app.controller('HomeCtrl', function($scope, HomeFactory){
// this is a test to see that we can get all tracks
 HomeFactory.getTracks()
    .then(function(tracks){
        console.log("tracks", tracks)
    })

})
