app.directive('trackPanel',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/track-panel/track-panel.html',
        scope: {
            trackInfo: '='
        },
        link: function(scope, element) {
            console.log("scope: ", scope.trackInfo);
            element.on('click', function(){
                $('track-panel').removeClass('track-selected');
                $(this).addClass('track-selected');
            });
        }
    };
});
