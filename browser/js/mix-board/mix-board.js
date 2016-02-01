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
    $scope.region;
    $scope.currentTrack;
    $scope.currentTrackIndex = $scope.library.indexOf($scope.currentTrack)
    var wavesurfer;
    var loadingPrev = false
    //$scope.currentTrack.hasRegion = false;

    $scope.prevWave = function(track){
        console.log("saved", $scope.library)

        $scope.isLoaded=false;
        // CHES remove previous wavesurfer if exists
         if (wavesurfer){
            wavesurfer.destroy();
            $("#track-preview").empty();
            console.log("destroy", $scope.currentTrack)
         }

        $scope.currentTrack = _.find($scope.library, function(libTrack) {
            return  libTrack._id == track._id
        });

        console.log("found currentTrack", $scope.currentTrack)

        $scope.currentTrack.hasRegion = $scope.currentTrack.hasRegion ? $scope.currentTrack.hasRegion : false;

         // CHES create waveform
         wavesurfer = WaveSurfer.create({
            container: '#track-preview',
            waveColor: 'violet',
            progressColor: 'purple',
            loaderColor   : 'navy',
            cursorColor   : 'navy',
        });


        wavesurfer.on('ready', function () {
            $scope.isLoaded=true;
            hideProgress();
            $scope.$digest();
            var timeline = Object.create(WaveSurfer.Timeline);

            timeline.init({
                wavesurfer: wavesurfer,
                container: "#track-timeline"
            });

           wavesurfer.enableDragSelection({
                color: 'rgba(0, 255, 0, 0.1)'
            });

            if ($scope.currentTrack.region){
                loadingPrev  =true;
                console.log("regions before",wavesurfer )
                wavesurfer.regions.list[$scope.currentTrack.region.id] = $scope.currentTrack.region;
                wavesurfer.addRegion({
                    id: $scope.currentTrack.region.id,
                    end: $scope.currentTrack.region.end,
                    start: $scope.currentTrack.region.start,
                    color: 'rgba(0, 255, 0, 0.1)'});

                console.log("tried to update regions", wavesurfer)
            }
            wavesurfer.play();
            $scope.isPlaying = true;
            console.log("currentTrack region?", $scope.currentTrack.region);
        });

        wavesurfer.on('region-updated', function(){
            console.log("datas", wavesurfer)

             $scope.currentTrack.region.startTime = { m: Math.floor( $scope.currentTrack.region.start/60),
                                         s: Math.ceil( $scope.currentTrack.region.start%60)};
             $scope.currentTrack.region.endTime = { m: Math.floor( $scope.currentTrack.region.end/60),
                                         s: Math.ceil( $scope.currentTrack.region.end%60)};
             console.log("new", $scope.library)
             $scope.$digest()
        });

       wavesurfer.on('region-created', function(region){
        console.log("region", region);
        console.log("currentTracktrying", $scope.currentTrack)
        if ($scope.currentTrack.hasRegion && !loadingPrev){
            region.remove()
            console.log("CANT DO THAT")
        } else {
            $scope.currentTrack.region=region;
             $scope.currentTrack.region.startTime = { m: Math.floor( $scope.currentTrack.region.start/60),
                                         s: Math.ceil( $scope.currentTrack.region.start%60)};
             $scope.currentTrack.region.endTime = { m: Math.floor( $scope.currentTrack.region.end/60),
                                         s: Math.ceil( $scope.currentTrack.region.end%60)};
            $scope.currentTrack.hasRegion=true;
            console.log("i am creating a region", $scope.currentTrack)
            loadingPrev  =false;
            $scope.$digest();

           region.on('dblclick', function(){
             $scope.currentTrack.hasRegion=false;
             region.remove()
             $scope.currentTrack.region=undefined;
             console.log("dbl track", $scope.currentTrack)
             $scope.$digest()
           })
          }
        });

        wavesurfer.on('loading', showProgress);
      //  wavesurfer.on('ready', hideProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
        wavesurfer.load(track.src);
        $scope.currentTrack.wavesurfer=wavesurfer
        //console.log("currentTrack", $scope.currentTrack)

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
})


