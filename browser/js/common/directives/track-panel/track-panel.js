app.directive('trackPanel',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/track-panel/track-panel.html',
        scope: {
            trackInfo: '=',
            panelIdentifier: '='
        },
        link: function(scope, element) {
            element.on('click', function(){
                $('track-panel').removeClass('track-selected');
                $(this).addClass('track-selected');
            });
        }
    };
});
