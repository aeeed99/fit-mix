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
    //MB: I LIVE ON THE EDGE ^^^^^^
    $scope.phases = [
        {
            name: "STRETCH",
            duration: 120,
            color: "one"
        },
        {
            name: "WARM UP",
            duration: 120,
            color: "two"
        },
        {
            name: "SPRINT",
            duration: 300,
            color: "three"

        },
        {
            name: "COOL DOWN",
            duration: 60,
            color: "one"
        }
    ];

    // $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = MixBoardFactory.getMix(); //NP List of songs on the mix bar.
    $scope.mixEffects = [];
    //sample: one sfx and one voice. distinction is mostly important for styling; anything
    //not a string is considered a sfx

    $scope.library = tracks;
    $scope.sfxBase = sfx;
    $scope.instructions = [];

    $scope.editTitle = false;
    $scope.mixName = "My awesome Playlist";
    $scope.tab = "music";

    $scope.isLoaded = false;
    $scope.isPlaying = false;
    $scope.region;
    $scope.currentTrack;
    $scope.currentSfx;
    // CHES - have not had to use index variable yet but may come in handy..
    $scope.currentTrackIndex = $scope.library.indexOf($scope.currentTrack);
    //var wavesurfer;
    //var loadingPrev = false;
    $scope.voices = responsiveVoice.getVoices();
    //MB: you all can hear them too, right?
    $scope.read = function(text){
        responsiveVoice.speak(text, "US English Female");
    }
    $scope.sfxTabClick = function(){
        $scope.tab = "sfx";
    }
    $scope.musicTabClick = function(){
        $scope.tab = "music";
    }
    $scope.voiceTabClick = function(){
        $scope.tab = "instructions";
    }
    $scope.stylizeEffect = function(effect){
        let style = {};
        //they're inverted!
        if (typeof(effect.effect) === 'string') style.color = "rgba(35,235,195,.75)";
        else style.color = "rgba(220,20,60,.75)";
        return style;
    }
    $scope.fillContainer = function(){
        return {width: '100%', height: '100%'};
    };
    $scope.selectSfx = function(sfx){
        console.log("shot got called");
        $scope.currentSfx = sfx;
        console.log($scope.currentSfx);
    }
    $scope.addVoiceToMix = function(text, trigger){
        let voice = text;
        trigger = +trigger;
        $scope.mixEffects.push({ effect: voice, trigger: trigger});
        $scope.mixEffects.sort(function(a, b){
            if (a.trigger > b.trigger) return 1;
            if (b. trigger > a.trigger) return -1;
            return 0;
        });
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
    }
    $scope.fillContainer = function () {
        return {width: '100%', height: '100%'};
    };

    // NP: Add-to-mix functionality (non-DnD version)
    $scope.addSelectedTrackToMix = function (track) {
        MixBoardFactory.addTrackToMix(track);
        console.log("scope mix", $scope.mix)
    };

    $scope.addEffectToMix = function(effectTrigger){
        let effect = $scope.currentSfx;
        let trigger = +effectTrigger;
        $scope.mixEffects.push({ effect: effect, trigger: trigger });
        $scope.mixEffects.sort(function(a, b){
            console.log(a);
            console.log(b);
            if (a.trigger > b.trigger) return 1;
            if (b. trigger > a.trigger) return -1;
            return 0;
        });
    };

    $scope.currentMixTrack;

});

app.controller('mixEditController', function ($scope, MixBoardFactory, ModalFactory) {
    $scope.mixLength = 600;
    $scope.durSum = function () {
        var sum = 0;
        $scope.phases.forEach(function (phase) {
            sum += phase.duration;
        });
        return sum
    };
    $scope.reorderMix = function (index, item, event, array) {
        //phases don't have artists, so this ensures no dragging between phases and mix
        if (item.artist) {
            MixBoardFactory.reorderInPlace(index, item, event, array);
            $scope.$digest();
        }
    };
    $scope.reorderPhase = function (index, item, event, array) {
        //phases don't have artists, so this ensures no dragging between phases and mix
        if (!item.artist) {
            MixBoardFactory.reorderInPlace(index, item, event, array);
        }
    };
    $scope.prettyDuration = function (track) {
        return (track.duration - track.duration % 60) / 60 + ":" + track.duration % 60;
    };
    $scope.stylizer = function (track) {
        let style = {
            float: 'left',
            height: '100%'
        };
        style.width = (track.duration / $scope.mixLength) * 100 + '%';
        return style;
    };
    $scope.openAddPhase = () => ModalFactory.openAddPhase($scope.phases);
});

app.controller('mixPlaybackController', function($scope, MixBoardFactory) {

    var trackIndex;
    $scope.mix =  MixBoardFactory.getMix();

    $scope.pauseMix=function(){
        $scope.currentMixTrack.wavesurfer.pause()
    };

    $scope.playClip = function (restart) {
        // EC - checks whether we are restartign or continuing from prev
         var waveArray = MixBoardFactory.createWaveArray();

        if (restart){
            console.log("restarting");

            if ($scope.currentMixTrack){
                console.log("pausing current");
                $scope.currentMixTrack.wavesurfer.pause();
            }

            trackIndex = 0;
            $scope.currentMixTrack = null;

            MixBoardFactory.resetMix();

        }

        trackIndex =  trackIndex ? trackIndex : 0;
        var startTime;

        if ($scope.currentMixTrack){
             startTime  = $scope.currentMixTrack.currentProgress ? $scope.currentMixTrack.currentProgress : $scope.currentMixTrack.start;
        } else {
            startTime = $scope.mix[trackIndex].start;
        }

        $scope.currentMixTrack = $scope.currentMixTrack ? $scope.currentMixTrack : $scope.mix[trackIndex];

        $scope.currentMixTrack.wavesurfer.play(startTime, $scope.currentMixTrack.end);

        $scope.currentMixTrack.wavesurfer.on('audioprocess', function(process){
            if ($scope.currentMixTrack){
                $scope.currentMixTrack.currentProgress = process;
                if (!$scope.currentMixTrack.fadeRegistered && $scope.currentMixTrack.fade >= ($scope.currentMixTrack.end-$scope.currentMixTrack.wavesurfer.getCurrentTime() ) ){
                        console.log("FADING", $scope.currentMixTrack)
                        $scope.currentMixTrack.wavesurfer.backend.gainNode.gain.setValueCurveAtTime(waveArray, $scope.currentMixTrack.wavesurfer.backend.ac.currentTime, $scope.currentMixTrack.fade);
                        $scope.currentMixTrack.fadeRegistered = true;
                        trackIndex+=1
                        $scope.currentMixTrack = $scope.mix[trackIndex];
                        $scope.currentMixTrack.currentProgress = 0;
                        console.log("next up after fade", $scope.currentMixTrack);
                        if ($scope.currentMixTrack) {$scope.playClip() };
                }
                else if ($scope.currentMixTrack.end - process < .5 && process < $scope.currentMixTrack.end ) {
                    $scope.currentMixTrack.wavesurfer.pause();
                    if (trackIndex+1 < $scope.mix.length){
                        trackIndex+=1
                        $scope.currentMixTrack = $scope.mix[trackIndex];
                        $scope.currentMixTrack.currentProgress = 0;
                        $scope.playClip()
                    } else {
                        console.log("no more left!!");
                        $scope.currentMixTrack = null;
                        trackIndex=0;
                      }
                }
            }
        });
    };
});

app.controller('prevWavController', function ($scope, MixBoardFactory) {
    var wavesurfer;
    var loadingPrev = false;


    $scope.prevWave = function (track) {

        // CHES - "isLoaded" is for loading pre-saved data
        $scope.isLoaded = false;
        // CHES - remove previous wavesurfer if exists
        if (wavesurfer) {
            wavesurfer.pause();
            $("#track-preview").empty();
        }
        $scope.lengthModels = {};
        $scope.currentTrack = MixBoardFactory.getCurrentSong($scope.library, track);
        $scope.currentTrack.hasRegion = $scope.currentTrack.hasRegion ? $scope.currentTrack.hasRegion : false;
        // EC - Setting up fader
        $scope.slider = {
            value: $scope.currentTrack.hasRegion ? $scope.currentTrack.region.start : 0,
            options: {
                floor: $scope.currentTrack.hasRegion ? $scope.currentTrack.region.start : 0,
                ceil: $scope.currentTrack.hasRegion ? $scope.currentTrack.region.end : $scope.currentTrack.duration,
                translate: function(value) {
                    if (value === 0){ return '0:00'}
                  return ('0' + Math.floor( value/60)).slice(-2) + ':' + ('0' + Math.ceil( value%60)).slice(-2);
                },
                onChange: function(id, modelValue, highValue){
                    $scope.currentTrack.fade = $scope.currentTrack.hasRegion ? $scope.currentTrack.region.end - modelValue : $scope.currentTrack.duration - modelValue;
                }
            }
        };

        // CHES - create waveform
        wavesurfer = MixBoardFactory.createWaveForm();

        wavesurfer.on('ready', function () {
            $scope.isLoaded = true;
            // CHES - removes loading bar

            $scope.currentTrack.fade = $scope.currentTrack.fade ? $scope.currentTrack.fade : undefined;
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
            $scope.slider.options.floor = $scope.currentTrack.region.start;
            $scope.slider.options.ceil = $scope.currentTrack.region.end;
            $scope.slider.value = $scope.currentTrack.region.start;
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
                    $scope.slider.options.floor = 0;
                    $scope.slider.options.ceil = $scope.currentTrack.duration;
                    $scope.slider.value = 0;
                    $scope.$digest();
                })
            }
        });

        wavesurfer.on('loading', showProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
        wavesurfer.load(track.src);

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
    $(document).on('keyup', function (e) {
        if (e.which == 32 && $scope.isLoaded) {
            if ($scope.isPlaying) {
                wavesurfer.pause();
            } else {
                wavesurfer.play();
            }
            $scope.isPlaying = !$scope.isPlaying
        }
    });
});

app.controller('actionButtonsController', function ($scope, MixBoardFactory, ModalFactory) {
    $scope.openUploadMusic = ModalFactory.openUploadMusic;
});

app.controller('mixHeaderController', function ($scope) {
    $scope.toggleEdit = function () {
        $scope.editTitle = !$scope.editTitle;
        if (!$scope.mixName && !$scope.editTitle) $scope.mixName = "click to edit title";
    }
});

app.controller('phaseModalController', function ($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close($scope.input);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('uploadModalController', function ($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close("upload-field");
    };
    $uibModalInstance.dismiss('cancel');
    //NP VVV Not working :( VVV
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
app.controller('modalInstanceController', function(){

});
