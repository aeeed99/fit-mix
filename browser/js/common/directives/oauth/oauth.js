'use strict';
app.directive('oauth', function() {
    return {
        scope : {
            providerName: '@'
        },
        restrict: 'E',
        templateUrl: 'js/common/directives/oauth/oauth.html'
    }
});
