app.config(function($stateProvider) {
    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/user/1',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html',
        resolve: {
            like: function(DataFactory, $stateParams) {
                return DataFactory.fetchUser($stateParams.userId);
            }
        }
    });

});

app.controller('AboutController', function($scope, like, ListFactory) {
    $scope.like = like;
    $scope.message;
    $scope.addToList = function(like) {
        ListFactory.addToList(likeId)
        .then(function(list) {
            $scope.list = list;
        })
        .then(null, function(err) {
            $scope.message = err.message;
        });
    };
});
