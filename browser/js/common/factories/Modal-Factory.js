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
                //make an array of all the files to pass to backend
                var files = toArray(document.getElementById(id).files);
                console.log(Array.isArray(files));
                return $http.post('/api/upload', {files: files});
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