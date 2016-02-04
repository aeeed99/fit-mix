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
    $scope.phases = [
        {name: "STRETCH",
         duration: 120,
         color: "one"
         },
        {name: "WARM UP",
         duration: 120,
         color: "two"
         },
        {name: "SPRINT",
         duration: 300,
         color: "three"

         },
        {name: "COOL DOWN",
         duration: 60,
         color: "one"
         }
    ]

    $scope.durSum = function(){
        var sum = 0;
        $scope.phases.forEach(function(phase){
            sum+=phase.duration;
        })
        return sum
    };


    // $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = [] //NP List of songs on the mix bar.
    $scope.library = tracks;

    $scope.editTitle = false;
    $scope.mixName = "My awesome Playlist";

    $scope.isLoaded = false;
    $scope.isPlaying = false;
    $scope.region;
    $scope.currentTrack;
    // CHES - have not had to use index variable yet but may come in handy..
    $scope.currentTrackIndex = $scope.library.indexOf($scope.currentTrack)
    var wavesurfer;
    var loadingPrev = false
    $scope.fillContainer = function(){
        return {width: '100%', height: '100%'};
    }
    $scope.prevWave = function (track) {
        // CHES - "isLoaded" is for loading pre-saved data
        $scope.isLoaded = false;
        // CHES - remove previous wavesurfer if exists
        if (wavesurfer) {
            //wavesurfer.destroy();
            $("#track-preview").empty();
        }
        $scope.lengthModels = {};
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
            console.log("my new wavesurfer", wavesurfer)
            wavesurfer.play();
            $scope.isPlaying = true;
        });

        wavesurfer.on('region-updated', function (region) {
            $scope.currentTrack.region = region;
            $scope.currentTrack.region.startTime = MixBoardFactory.getTimeObject($scope.currentTrack.region.start);
            $scope.currentTrack.region.endTime = MixBoardFactory.getTimeObject($scope.currentTrack.region.end);

            $scope.$digest()
        });

        wavesurfer.on('region-created', function (region) {
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

    $scope.reorderMix = function (index, item, event, array) {
        //phases don't have artists, so this ensures no dragging between phases and mix
        if(item.artist){
            MixBoardFactory.reorderInPlace(index, item, event, array);
        }
    };
    $scope.reorderPhase = function (index, item, event, array) {
        //phases don't have artists, so this ensures no dragging between phases and mix
        if(!item.artist){
            MixBoardFactory.reorderInPlace(index, item, event, array);
        }
    };
    $scope.toggleEdit = function(){
        $scope.editTitle = !$scope.editTitle;
        if(!$scope.mixName && !$scope.editTitle) $scope.mixName = "click to edit title";
    }
    $scope.prettyDuration = function(track){
        return (track.duration - track.duration % 60) / 60 + ":" + track.duration % 60;
    }
    $scope.addSegmentToLibrary = function(track){
        let newTrack = track;
        MixBoardFactory.saveSegment(newTrack);
        $scope.library.push(newTrack);
    }
    $scope.stylizer = function(track){
        let style = {
            float: 'left',
            height: '100%'
        };
        style.width = (track.duration / $scope.mixLength * 100) + '%';
        return style;
    }
    $scope.stylizeTrack = function(track){
        if(track.end || track.start){
            console.log("this sumbitch should have the style of panel-3");
            return "track-panel-3";
        }
        return "track-panel-1";
    };
    // NP: Add-to-mix functionality (non-DnD version)
    $scope.addSelectedTrackToMix = function (track, mix) {
        MixBoardFactory.addTrackToMix(track, $scope.mix);
    };

    $scope.currentMixTrack;

    $scope.pauseMix=function(){
        $scope.currentMixTrack.wavesurfer.pause()
    }

    $scope.playClip = function(restart){
        // EC - checks whether we are restartign or continuing from prev
            var waveArray = new Float32Array(9);
            waveArray[0] = 0.9;
            waveArray[1] = 0.9;
            waveArray[2] = 0.8;
            waveArray[3] = 0.8;
            waveArray[4] = 0.7;
            waveArray[5] = 0.5;
            waveArray[6] = 0.3;
            waveArray[7] = 0.1;
            waveArray[8] = 0.0;

            var waveArrayUp = new Float32Array(9);
            waveArrayUp[0] = 0.1;
            waveArrayUp[1] = 0.1;
            waveArrayUp[2] = 0.2;
            waveArrayUp[3] = 0.2;
            waveArrayUp[4] = 0.3;
            waveArrayUp[5] = 0.5;
            waveArrayUp[6] = 0.7;
            waveArrayUp[7] = 0.9;
            waveArrayUp[8] = 1.0;
            //console.log("gain", gainNode);
           // console.log("scope gain", $scope.mix[0])
           // console.log("linearRampToValueAtTime", track.wavesurfer.backend.ac.currentTime + 5);
            //gainNode.gain.linearRampToValueAtTime(0, 100);
            // track.wavesurfer.backend.gainNode.gain.exponentialRampToValueAtTime( 0.01, Math.floor(track.wavesurfer.backend.ac.currentTime) + 2);
          //  track.wavesurfer.backend.gainNode.gain.linearRampToValueAtTime( 0, Math.floor(track.wavesurfer.backend.ac.currentTime) + 5);

        if (restart){
            if ($scope.currentMixTrack){
                console.log("pausing current");
                $scope.currentMixTrack.wavesurfer.pause();
            }
            $scope.currentMixTrack = null;
            $scope.mix.forEach(function(track){
                track.wavesurfer.backend.gainNode.gain.value = 1;
                track.fadeRegistered = false;
               // track.wavesurfer.backend.gainNode.gain.setValueCurveAtTime([1], track.wavesurfer.backend.ac.currentTime, track.end);
                track.wavesurfer.backend.gainNode.gain.setTargetAtTime(1.0, track.wavesurfer.backend.ac.currentTime + 1, 0.1);
                console.log("new track", track)
            })
            console.log("edited mix", $scope.mix)

        }
        var track;
        var trackIndex = $scope.currentMixTrack ? $scope.mix.indexOf($scope.currentMixTrack) : 0;
        var startTime;

        if ($scope.currentMixTrack){
             startTime  = $scope.currentMixTrack.currentProgress ? $scope.currentMixTrack.currentProgress : $scope.currentMixTrack.start;
        } else {
            startTime = $scope.mix[trackIndex].start;
        }

        $scope.mix[0].fade = 4;

        track = $scope.currentMixTrack ? $scope.currentMixTrack : $scope.mix[0];
        track.fadeRegistered;
        $scope.currentMixTrack = track;
        console.log("track playing",  track)
        console.log("wavesurfer", track.wavesurfer);
        console.log("currentTime", track.wavesurfer.backend.ac.currentTime);
        //$scope.currentMixTrack.wavesurfer.backend.ac.currentTime = 0;

        track.wavesurfer.play(startTime, track.end);
        //track.wavesurfer.backend.gainNode.gain.value = 0;
        // track.wavesurfer.backend.gainNode.gain.linearRampToValueAtTime(0, track.wavesurfer.backend.ac.currentTime + 5);
  // currentTime/ x = start/finish
  // ( 5 seconds * track.wavesurfer.backend.ac.currentTime)


        track.wavesurfer.on('audioprocess', function(process){
            if ($scope.currentMixTrack && track){
                $scope.currentMixTrack.currentProgress = process;
            //    console.log("process", process);
             //   console.log("currentTime", $scope.currentMixTrack.wavesurfer.backend.ac.currentTime)
            if ( !track.fadeRegistered && track.fade >= (track.end-process)){
                console.log("FADING", track)
                    console.log("I SHOULD HAPPEN ONCE")
                    track.wavesurfer.backend.gainNode.gain.setValueCurveAtTime(waveArray, track.wavesurfer.backend.ac.currentTime, 4);
                    track.fadeRegistered = true;
                    $scope.currentMixTrack = $scope.mix[1];
                    $scope.currentMixTrack.currentProgress = 0;
                    // $scope.mix[1].wavesurfer.play($scope.mix[1].start, $scope.mix[1].end)
                    //$scope.mix[2].wavesurfer.play(0, $scope.mix[2].end)
                     $scope.playClip();
                }
                else if (track.end - process < .5  ){
                    track.wavesurfer.pause();
                    track=undefined;
                    if (trackIndex+1 < $scope.mix.length){
                        $scope.currentMixTrack = $scope.mix[trackIndex+1];
                        $scope.currentMixTrack.currentProgress = 0;
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

    $scope.gainTest = function(){
        var track = $scope.mix[0];
        console.log("track", track)
        console.log("currentProgress", track.currentProgress)
        var gainNode = track.wavesurfer.backend.gainNode;

        function changeGain(){
            //gainNode.gain.value = 0;
            console.log("gain", gainNode);
            console.log("scope gain", $scope.mix[0])
            console.log("linearRampToValueAtTime", track.wavesurfer.backend.ac.currentTime + 5)
            //gainNode.gain.linearRampToValueAtTime(0, 100);
            // track.wavesurfer.backend.gainNode.gain.exponentialRampToValueAtTime( 0.01, Math.floor(track.wavesurfer.backend.ac.currentTime) + 2);
            track.wavesurfer.backend.gainNode.gain.linearRampToValueAtTime( 0, Math.floor(track.wavesurfer.backend.ac.currentTime) + 5);

            console.log("gain", gainNode);
        }
         changeGain();
    }

    $scope.gainCurveTest = function(){
        var track = $scope.mix[0];
        console.log("track", track)
        console.log("currentProgress", track.currentProgress)
        var gainNode = track.wavesurfer.backend.gainNode;

        function changeGain(){
            //gainNode.gain.value = 0;
            var waveArray = new Float32Array(9);
            waveArray[0] = 0.9;
            waveArray[1] = 0.9;
            waveArray[2] = 0.8;
            waveArray[3] = 0.8;
            waveArray[4] = 0.7;
            waveArray[5] = 0.5;
            waveArray[6] = 0.3;
            waveArray[7] = 0.1;
            waveArray[8] = 0.0;
            console.log("gain", gainNode);
            console.log("scope gain", $scope.mix[0])
            console.log("linearRampToValueAtTime", track.wavesurfer.backend.ac.currentTime + 5);
            //gainNode.gain.linearRampToValueAtTime(0, 100);
            // track.wavesurfer.backend.gainNode.gain.exponentialRampToValueAtTime( 0.01, Math.floor(track.wavesurfer.backend.ac.currentTime) + 2);
          //  track.wavesurfer.backend.gainNode.gain.linearRampToValueAtTime( 0, Math.floor(track.wavesurfer.backend.ac.currentTime) + 5);
            track.wavesurfer.backend.gainNode.gain.setValueCurveAtTime(waveArray, track.wavesurfer.backend.ac.currentTime+4, 4)
            track.fade = 4;
            console.log("gain", gainNode);
        }
         changeGain();
    }


});


