app.directive('likeList', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/like-list/like-list.html',
        controller: function($scope, $rootScope, ListFactory, $state) {
            $rootScope.$on('LoadList', function(event, list) {
                $scope.list = list;
            });
            $scope.list = ListFactory.getCurrentList();
        }
    };
});
