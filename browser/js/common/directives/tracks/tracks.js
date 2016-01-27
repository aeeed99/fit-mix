app.directive('track', function () {
    return {
        scope: {
            theTrack: '=',
        },
        restrict: 'E',
        templateUrl: 'js/common/directives/tracks/track.html',
        link: function(scope, $element){
            console.log("scope", scope.theTrack)
            var myContainer = '#'+scope.theTrack.waveID;
            console.log("myContainer", myContainer)
            var wavesurfer = WaveSurfer.create({
                   container: myContainer,
                   waveColor: 'violet',
                   progressColor: 'purple'
            });

            console.log("wavesurfer", wavesurfer)

           wavesurfer.load(scope.theTrack.src);
        }
    };
});
