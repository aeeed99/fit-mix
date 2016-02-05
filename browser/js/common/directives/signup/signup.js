app.directive('signUp', (DataFactory, $timeout) => {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/signup/signup.html',
        link(scope, el, attrs) {
            let $emailInput = angular.element(el[0].querySelector('#userEmail'));
            let $confirmPassword = angular.element(el[0].querySelector('#confirm-password'));
            let $signupPassword = angular.element(el[0].querySelector('#signup-password'));
            let timer1 = null;
            let timer2 = null;
            $emailInput.on("keypress", e => {
                if (timer1) $timeout.cancel(timer1)
                timer1 = $timeout(() => {
                    DataFactory.checkEmailIsValid($emailInput.val())
                        .then(email => {
                            scope.validEmail = email.validEmail;
                        });
                }, 2000)
            });

            $confirmPassword.on("keypress", e => {
                if (timer2) $timeout.cancel(timer2);
                timer2 = $timeout(() => {
                    scope.validPassword = $confirmPassword.val() === $signupPassword.val();
                }, 500);
            });
        }
    }
});
