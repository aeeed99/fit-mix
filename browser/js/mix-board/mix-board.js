app.config(function ($stateProvider) {

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController',
        resolve: {
            tracks: function (HomeFactory) {
                return HomeFactory.getTracks();
            }
        }
    })
});

app.controller('MixBoardController', function ($scope, $document, tracks, MixBoardFactory) {
        // HARD CODED RIGHT NOW
        $scope.mixLength = 600;
        $scope.workouts = [
            {name: "STRETCH",
             duration: 100,
             color: "one"
             },
            {name: "WARM UP",
             duration: 100,
             color: "two"
             },
            {name: "SPRINT",
             duration: 200,
             color: "three"

             },
            {name: "COOL DOWN",
             duration: 200,
             color: "one"
             }
        ]


    $scope.durSum = function(){
        var sum = 0;
        $scope.workouts.forEach(function(workout){
            sum+=workout.duration;
        })
        return sum
    };


    // $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = [] //NP List of songs on the mix bar.
    $scope.library = tracks;

    $scope.isLoaded = false;
    $scope.isPlaying = false;
    $scope.region;
    $scope.currentTrack;
    // CHES - have not had to use index variable yet but may come in handy..
    $scope.currentTrackIndex = $scope.library.indexOf($scope.currentTrack)
    var wavesurfer;
    var loadingPrev = false

    $scope.prevWave = function (track) {
        // CHES - "isLoaded" is for loading pre-saved data
        $scope.isLoaded = false;
        // CHES - remove previous wavesurfer if exists
        if (wavesurfer) {
            //wavesurfer.destroy();
            $("#track-preview").empty();
        }

        $scope.currentTrack = MixBoardFactory.getCurrentSong($scope.library, track)
        $scope.currentTrack.hasRegion = $scope.currentTrack.hasRegion ? $scope.currentTrack.hasRegion : false;

        // CHES - create waveform
        wavesurfer = MixBoardFactory.createWaveForm();

        wavesurfer.on('ready', function () {
            $scope.isLoaded = true;
            // CHES - removes loading bar
            hideProgress();
            $scope.$digest();
            // CHES - creates track timeline
            var timeline = MixBoardFactory.createTimeline(wavesurfer)
            MixBoardFactory.enableDragSelection(wavesurfer)

            // CHES - if it finds a pre-existing region, it will preload it
            if ($scope.currentTrack.region) {
                loadingPrev = true;
                wavesurfer.regions.list[$scope.currentTrack.region.id] = $scope.currentTrack.region;
                MixBoardFactory.addRegion(wavesurfer, $scope.currentTrack.region);
            }

            // CHES - play track once ready
            wavesurfer.play();
            console.log("waveform", wavesurfer)
            $scope.isPlaying = true;
        });

        wavesurfer.on('region-updated', function (region) {
            console.log("region-updated", region)
            $scope.currentTrack.region = region;
            $scope.currentTrack.region.startTime = MixBoardFactory.getTimeObject($scope.currentTrack.region.start);
            $scope.currentTrack.region.endTime = MixBoardFactory.getTimeObject($scope.currentTrack.region.end);

            $scope.$digest()
        });

        wavesurfer.on('region-created', function (region) {
            console.log("region-created")
            if ($scope.currentTrack.hasRegion && !loadingPrev) {
                // CHES - the second loadingPrev checks for whether we are reloading saved data
                region.remove()
            } else {
                $scope.currentTrack.region = region;
                $scope.currentTrack.region.startTime = MixBoardFactory.getTimeObject($scope.currentTrack.region.start);
                $scope.currentTrack.region.endTime = MixBoardFactory.getTimeObject($scope.currentTrack.region.end);
                $scope.currentTrack.hasRegion = true;
                loadingPrev = false;
                $scope.$digest();

                // CHES remove region on dbclick - from waveform AND curent track
                region.on('dblclick', function () {
                    $scope.currentTrack.hasRegion = false;
                    region.remove()
                    $scope.currentTrack.region = undefined;
                    $scope.$digest();
                })
            }
        });

        wavesurfer.on('loading', showProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
        wavesurfer.load(track.src);
      //  $scope.selectedTrack = track;
       // EC - TESTING REMOVING THIS TO SEE IF WE NEED IT
        $scope.currentTrack.wavesurfer = wavesurfer
    };


     //PLAY / PAUSE FUNCTIONALITY
        $(document).on('keyup', function(e) {
              if (e.which == 32 && $scope.isLoaded) {
                if ($scope.isPlaying){
                    wavesurfer.pause();
                } else{
                     wavesurfer.play();
                }
                $scope.isPlaying = !$scope.isPlaying
             }
        });

    $scope.reorderMix = function (index, track, event, mix) {
        MixBoardFactory.reorderInPlace(index, track, event, mix)
    };


    // NP: Add-to-mix functionality (non-DnD version)
    $scope.addSelectedTrackToMix = function (track, mix) {
        console.log("track", track)
        MixBoardFactory.addTrackToMix(track, $scope.mix);
        console.log("new mix", $scope.mix)
    };

    $scope.currentMixTrack;

    $scope.pauseMix=function(){
        console.log("current", $scope.currentTrack.wavesurfer.getCurrentTime());
        $scope.currentMixTrack.wavesurfer.pause()
    }

    $scope.playClip = function(restart){
        console.log("restart", restart)
        if (restart){ $scope.currentMixTrack = null; }
        var track;
        var trackIndex = $scope.currentMixTrack ? $scope.mix.indexOf($scope.currentMixTrack) : 0;
        var startTime;


        if ($scope.currentMixTrack){
             startTime  = $scope.currentMixTrack.currentProgress ? $scope.currentMixTrack.currentProgress : $scope.currentMixTrack.start;
        } else {
            startTime = $scope.mix[trackIndex].start;
        }

        track = $scope.currentMixTrack ? $scope.currentMixTrack : $scope.mix[0];

        $scope.currentMixTrack = track;
        console.log("playingTrack", track);
        console.log("trackIndex", trackIndex);
        console.log("start time", startTime)
        console.log("track end", track.end);
        track.wavesurfer.play(startTime, track.end);

        track.wavesurfer.on('audioprocess', function(process){
            if ($scope.currentMixTrack && track){
                $scope.currentMixTrack.currentProgress = process;
               // console.log("TRACK", track)
                if (track.end - process < .5  ){
                    console.log("OVER");
                    console.log("length", $scope.mix.length);
                    console.log("index", trackIndex);

                    track.wavesurfer.pause();
                    track=undefined;
                    if (trackIndex+1 < $scope.mix.length){
                        console.log("THERES MORE")
                        $scope.currentMixTrack = $scope.mix[trackIndex+1];
                        $scope.currentMixTrack.currentProgress = 0;
                        console.log("new index", trackIndex+1)
                        console.log("next up", $scope.currentMixTrack)
                        $scope.playClip()
                    } else {
                        console.log("no more left!!");
                        $scope.currentMixTrack = null; }
                }
            }
        })
    }

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
});


