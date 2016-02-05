app.config(function ($stateProvider) {

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController',
        resolve: {
            tracks: function (HomeFactory) {
                return HomeFactory.getTracks();
            },
            sfx: function (HomeFactory) {
                return HomeFactory.getSfx();
            }
        }
    })
});

app.controller('MixBoardController', function ($scope, $document, tracks, sfx, MixBoardFactory) {
    // HARD CODED RIGHT NOW

    String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };
    //MB: I LIVE ON THE EDGE ^^^^^^
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
    ];

    // $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = []; //NP List of songs on the mix bar.
    $scope.mixSfx = [{name: "horn", trigger: 60},{name: "alarm", trigger: 120}];

    $scope.library = tracks;
    $scope.sfxBase = sfx;

    $scope.editTitle = false;
    $scope.mixName = "My awesome Playlist";
    $scope.tab = "music";

    $scope.isLoaded = false;
    $scope.isPlaying = false;
    $scope.region;
    $scope.currentTrack;
    // CHES - have not had to use index variable yet but may come in handy..
    $scope.currentTrackIndex = $scope.library.indexOf($scope.currentTrack);
    //var wavesurfer;
    //var loadingPrev = false;
    $scope.hideForReal = function(){
        if($scope.tab !== 'music'){
            return {display: 'none'};
        }
    }
    $scope.sfxTabClick = function(){
        $scope.tab = "sfx";
    }
    $scope.musicTabClick = function(){
        $scope.tab = "music";
    }
    $scope.stylizeSfx = function(sfx){
        let style = {};
        style["margin-left"] = '60px';
        return style;
    }
    $scope.fillContainer = function(){
        return {width: '100%', height: '100%'};
    };

    $scope.stylizeTrack = function(track){
        //MB: sfx have no artist, so sfx get t-p-4
        if(!track.artist){
            return "track-panel-4";
        }
        else if((track.end < track.duration && track.end !== null) || track.start > 0){
            return "track-panel-3";
        }
        return "track-panel-1";
    };
    // NP: Add-to-mix functionality (non-DnD version)
    $scope.addSelectedTrackToMix = function (track, mix) {
        MixBoardFactory.addTrackToMix(track, $scope.mix);
    };

    $scope.currentMixTrack;

});

app.controller('mixEditController', function($scope, MixBoardFactory){
    $scope.durSum = function(){
        var sum = 0;
        $scope.phases.forEach(function(phase){
            sum+=phase.duration;
        });
        return sum
    };
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
    $scope.prettyDuration = function(track){
        return (track.duration - track.duration % 60) / 60 + ":" + track.duration % 60;
    };
    $scope.stylizer = function(track){
        let style = {
            float: 'left',
            height: '100%'
        };
        style.width = (track.duration / $scope.mixLength) * 100 + '%';
        return style;
    }
});

app.controller('mixPlaybackController', function($scope){
    $scope.pauseMix=function(){
        $scope.currentMixTrack.wavesurfer.pause()
    };

    $scope.playClip = function(restart){
        // EC - checks whether we are restartign or continuing from prev
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
        track.wavesurfer.play(startTime, track.end);

        track.wavesurfer.on('audioprocess', function(process){
            if ($scope.currentMixTrack && track){
                $scope.currentMixTrack.currentProgress = process;
                if (track.end - process < .5  ){
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
    };
});

app.controller('prevWavController', function($scope, MixBoardFactory){
    var wavesurfer;
    var loadingPrev = false;
    $scope.prevWave = function (track) {

        // CHES - "isLoaded" is for loading pre-saved data
        $scope.isLoaded = false;
        // CHES - remove previous wavesurfer if exists
        if (wavesurfer) {
            //wavesurfer.destroy();
            $("#track-preview").empty();
        }
        $scope.lengthModels = {};
        $scope.currentTrack = MixBoardFactory.getCurrentSong($scope.library, track);
        $scope.currentTrack.hasRegion = $scope.currentTrack.hasRegion ? $scope.currentTrack.hasRegion : false;

        // CHES - create waveform
        wavesurfer = MixBoardFactory.createWaveForm();

        wavesurfer.on('ready', function () {
            $scope.isLoaded = true;
            // CHES - removes loading bar
            hideProgress();
            $scope.$digest();
            // CHES - creates track timeline
            var timeline = MixBoardFactory.createTimeline(wavesurfer);
            MixBoardFactory.enableDragSelection(wavesurfer);

            // CHES - if it finds a pre-existing region, it will preload it
            if ($scope.currentTrack.region) {
                loadingPrev = true;
                wavesurfer.regions.list[$scope.currentTrack.region.id] = $scope.currentTrack.region;
                MixBoardFactory.addRegion(wavesurfer, $scope.currentTrack.region);
            }

            // CHES - play track once ready
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
                    region.remove();
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
});

app.controller('actionButtonsController', function($scope, MixBoardFactory){
    $scope.addSegmentToLibrary = function(track){
        let newTrack = track;
        MixBoardFactory.saveSegment(newTrack);
        $scope.library.push(newTrack);
    }
});

app.controller('mixHeaderController', function($scope){
    $scope.toggleEdit = function(){
        console.log("SCOPE", $scope.mixName);
        $scope.editTitle = !$scope.editTitle;
        if(!$scope.mixName && !$scope.editTitle) $scope.mixName = "click to edit title";
    }
});

app.controller('modalController', function($scope, $uibModal){

    $scope.open = function(){

        var modal = $uibModal.open({
            animation: true,
            template: 'Hello!',
            controller: 'modalInstanceController',
            size: 'sm',
        })
    }
});
app.controller('modalInstanceController', function(){

});
