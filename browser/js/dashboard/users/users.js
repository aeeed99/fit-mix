app.config( $stateProvider => {

    $stateProvider.state('dashboard.users', {
        url: '/users',
        controller: 'UsersCtrl',
        templateUrl: 'js/dashboard/users/users.html',
        resolve : {
            users(DataFactory) {
                return DataFactory.fetchUsers();
            }
        }
    });

});

app.controller('UsersCtrl', ($scope, users) => {
    $scope.users = users;
})
