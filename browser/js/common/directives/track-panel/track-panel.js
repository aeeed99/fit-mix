app.directive('trackPanel',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/track-panel/track-panel.html',
        scope: {
            trackInfo: '='
        },
        link: function(scope) {
            console.log("scope: ", scope.trackInfo);

        }
    };
});
