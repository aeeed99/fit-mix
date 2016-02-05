app.directive('track', function() {
    return {
        scope: {
            theTrack: '=',
        },
        restrict: 'E',
        templateUrl: 'js/common/directives/tracks/track.html'
    };
});
