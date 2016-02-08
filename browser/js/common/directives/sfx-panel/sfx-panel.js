app.directive('sfxPanel',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/sfx-panel/sfx-panel.html',
        scope: {
            sfxInfo: '=',
            panelIdentifier: '='
        },
        link: function(scope, element) {
            element.on('click', function(){
                $('sfx-panel').removeClass('track-selected');
                $(this).addClass('track-selected');
            });
        }
    };
});
