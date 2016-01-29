app.directive('trackPanel',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/track-panel/track-panel.html',
        scope: {
            trackInfo: '='
        }
    };
});