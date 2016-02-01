app.config(function($stateProvider){

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController',
        resolve: {
            tracks: function(HomeFactory) {
                //console.log("[resolve] starting..", $stateParams);
                return HomeFactory.getTracks();
            }
        }
    })
});

app.controller('MixBoardController', function($scope, tracks){
    $scope.hello = "Hello from the soon to be mix controller!";
    $scope.library = tracks
    console.log("LIB", $scope.library)
    $scope.isLoaded = false;
    $scope.isPlaying = false;
    var wavesurfer
    $scope.prevWave = function(track){

        $scope.isLoaded=false;
         if (wavesurfer){
            wavesurfer.destroy();
            $("#track-preview").empty();
         }
         wavesurfer = WaveSurfer.create({
            container: '#track-preview',
            waveColor: 'violet',
            progressColor: 'purple',
            loaderColor   : 'navy',
            cursorColor   : 'navy',


        });

        console.log('wavesurfer: ', wavesurfer);

        wavesurfer.on('ready', function () {
            $scope.isLoaded=true;
            hideProgress()
            $scope.$digest()
            var timeline = Object.create(WaveSurfer.Timeline);

            timeline.init({
                wavesurfer: wavesurfer,
                container: "#track-timeline"
            });
           wavesurfer.enableDragSelection({
                color: 'rgba(0, 255, 0, 0.1)'
            });

            wavesurfer.play();
            $scope.isPlaying = true;
        });

        wavesurfer.on('region-updated', function(){
            console.log("data", wavesurfer)
        });


    /* Progress bar */
        var progressDiv = document.querySelector('#progress-bar');
        var progressBar = progressDiv.querySelector('.progress-bar');

        var showProgress = function (percent) {
            progressDiv.style.display = 'block';
            progressBar.style.width = percent + '%';
        };

        var hideProgress = function () {
            progressDiv.style.display = 'none';
        };

        wavesurfer.on('loading', showProgress);
      //  wavesurfer.on('ready', hideProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
        wavesurfer.load(track.src);

    };
      // PLAY / PAUSE FUNCTIONALITY
        $(document).on('keyup', function(e) {
            console.log("SPACE")
             if (e.which == 32 && $scope.isLoaded) {
                if ($scope.isPlaying){
                    wavesurfer.pause();
                } else{
                     wavesurfer.play();
                }
                $scope.isPlaying = !$scope.isPlaying
             }
        });
})


