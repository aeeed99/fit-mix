app.factory('ModalFactory', function($uibModal, $http){
    return {
        openAddPhase: function (pushTo) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'js/mix-board/modals/add-phase-modal.html',
                controller: 'phaseModalController',
                size: 'sm'
            });
            modal.result.then(input => {
                pushTo.push({
                    name: input.name,
                    duration: input.duration,
                    color: "two"
                });
                window.setTimeout(function(){
                    let $aPhase = $('.phase-area');
                    $aPhase.mouseenter(function(){
                        let $this = $(this);
                        $this.children('#phase-edit-button').addClass('shown');
                    });
                    $aPhase.mouseleave(function(){
                        $(this).children('#phase-edit-button').removeClass('shown');
                    });
                }, 10);
            });
        },
        openUploadMusic: function() {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'js/mix-board/modals/upload-music-modal.html',
                controller: 'uploadModalController',
                size: 'sm'
            });
            modal.result.then((id) => {
                console.log("Called with id " + id);
            });
        },
        openAddInstruction: function (pushTo) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'js/mix-board/modals/create-instruction-modal.html',
                controller: 'phaseModalController',
                size: 'sm'
            });
            modal.result.then(input => {
                //MB: trigger time is set by user later, so all that is necessary is text
                pushTo.push(input.text);
            });
        }
    }
});

function toArray(obj){
    let result = [];
    for (let k in obj){
        let n = parseInt(k)
        if(!Number.isNaN(n)){
            result[n] = obj[k]
        }
    }
    return result;
}
