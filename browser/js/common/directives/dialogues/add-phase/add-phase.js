app.directive('addPhase', function() {

    return {
        restrict: 'E',
        //template: "This is a test",
        templateUrl: 'js/common/directives/dialogues/add-phase/add-phase.html',
        link: function(scope){
            scope.die = function(){
                $('add-phase').remove();
            }
        }
    }
});