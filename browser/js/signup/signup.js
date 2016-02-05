
app.config($stateProvider => {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });

});

app.controller('SignupCtrl', ($scope, AuthService, $state, DataFactory) => {

    $scope.newUser = {
        email : null,
        password : null,
        confirmPassword : null
    }
    $scope.validEmail = true;
    $scope.error = null;
    $scope.validPassword = true;
    $scope.createUser = () => {
        let userData = {
            email : $scope.newUser.email,
            password : $scope.newUser.password
        }
        DataFactory.addUser(userData)
            .then(user => {
                $state.go('login');
            })
            .then(null, console.error.bind(console));
    }

});
