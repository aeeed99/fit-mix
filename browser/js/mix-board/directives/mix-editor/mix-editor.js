app.directive('mixEditor', function(MixBoardFactory){
    return {
        restrict: 'E',
        templateUrl: 'js/mix-board/directives/mix-editor/mix-editor.html',
        controller: 'mixEditController',
        link: function (scope) {
            scope.removeTrack = function (trackIndex) {
              MixBoardFactory.removeTrack(trackIndex)
            }
        }
    }
});
