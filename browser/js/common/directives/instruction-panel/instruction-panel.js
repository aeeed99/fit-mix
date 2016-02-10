app.directive('instructionPanel',function(){
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/instruction-panel/instruction-panel.html',
        scope: {
            instructionInfo: '=',
            panelIdentifier: '='
        },
        link: function(scope, element) {
            element.on('click', function(){
                $('instruction-panel').removeClass('track-selected');
                $(this).addClass('track-selected');
            });
        }
    };
});
