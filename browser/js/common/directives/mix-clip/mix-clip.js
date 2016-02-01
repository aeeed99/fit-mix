app.directive('mixClip',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/mix-clip/mix-clip.html',
        scope: {
            trackInfo: '='
        },
        link: function(scope) {
            console.log("scope: ", scope.trackInfo);

        }
    };
});
