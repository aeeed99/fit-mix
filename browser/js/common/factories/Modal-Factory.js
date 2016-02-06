app.factory('ModalFactory', function($uibModal){
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
                var files = document.getElementById(id).files;
                console.log("FIES", files);
                for (var k in files) {
                    if (Number.isNaN(parseInt(k))) continue;
                    (function (file) {
                        var fileReader = new FileReader();
                        fileReader.onload = function(e) {
                            //get file content
                            var text = e.target.result;
                            console.log("result", text);
                        };
                    })(files[k])
                    //What do after files???
                }
            });
        }
    }
});