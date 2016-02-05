app.config( $stateProvider => {

    $stateProvider.state('dashboard', {
        url: '/dashboard/:userId',
        controller: 'DashboardCtrl',
        templateUrl: 'js/dashboard/dashboard.html',
        resolve : {
            user($stateParams, DataFactory) {
                return DataFactory.fetchUser($stateParams.userId);
            }
        }
    });

});

app.controller('DashboardCtrl', ($scope, $state, DataFactory, user) => {

    $scope.user = user;

    $scope.goTo = {
        users() {
            $state.go('dashboard.users');
        }
    };
});
