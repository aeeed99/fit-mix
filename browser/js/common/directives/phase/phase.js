app.directive('phase',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/phase/phase.html',
        scope: {
            phaseInfo: '='
        }
    };
});
