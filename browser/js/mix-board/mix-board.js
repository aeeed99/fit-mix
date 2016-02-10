app.config(function ($stateProvider) {

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController',
        params: {'wizardData': null},
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

app.controller('MixBoardController', function ($scope, $document, $stateParams, tracks, sfx, MixBoardFactory) {
    // HARD CODED RIGHT NOW
    //MB: I LIVE ON THE EDGE ^^^^^^
  $scope.predefinedPhases = [
        [{
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        },
        {
            name: "EXERCISE",
            duration: 30,
            color: "one"
        },
        {
            name: "REST",
            duration: 30,
            color: "three"

        }],
        [{
            name: "POSITION ONE",
            duration: 600,
            color: "one"
        },
        {
            name: "POSITION TWO",
            duration: 600,
            color: "three"

        },
        {
            name: "POSITION THREE",
            duration: 600,
            color: "two"
        }],
        [{
            name: "CARDIO",
            duration: 1200,
            color: "one"
        },
        {
            name: "STRENGTH",
            duration: 1200,
            color: "three"

        },
        {
            name: "ABS",
            duration: 1200,
            color: "two"
        }]
    ]
    var sfxPlaying;
    var currentSfx;
    var audio = new Audio();
    var context = new webkitAudioContext();
    var analyser = context.createAnalyser();
    var source;

    // $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = MixBoardFactory.getMix(); //NP List of songs on the mix bar.
    $scope.mixEffects = MixBoardFactory.getEffects();
    //sample: one sfx and one voice. distinction is mostly important for styling; anything
    //not a string is considered a sfx
    $scope.wizardData = $stateParams.wizardData;
    $scope.library = tracks;
    $scope.sfxBase = sfx;
    $scope.instructions = ["hello", "goodbye"];

    console.log("sfxBase", $scope.sfxBase);

    $scope.editTitle = false;
    $scope.mixName = function(){
        if($scope.wizardData && $scope.wizardData.name){
            return $scope.wizardData.name
        }
            return "My FitMix";
    }();
    $scope.mixLength = function(){
        if($scope.wizardData && $scope.wizardData.duration){
            let minutes = 0;
            let hours = 0;
            if ($scope.wizardData.duration.minutes) minutes = $scope.wizardData.duration.minutes * 60;
            if ($scope.wizardData.duration.hours) hours = $scope.wizardData.duration.hours * 3600;
            return hours + minutes;
        }
        return 1800;
    }();
    $scope.phases = function(){
        console.log("goddamn phases")
        if($scope.wizardData && $scope.wizardData.selectedStructure.number){
            return $scope.predefinedPhases[$scope.wizardData.selectedStructure.number];
        }
        return {};
    }();
    $scope.tab = "music";

    $scope.isLoaded = false;
    $scope.isPlaying = false;
    $scope.region;
    $scope.currentTrack;
    $scope.currentSfx;
    $scope.disableSpace;

    $scope.currentInstruction;
    (function startup(){
        console.log("startup fx ran");
    }());
    // CHES - have not had to use index variable yet but may come in handy..
    $scope.currentTrackIndex = $scope.library.indexOf($scope.currentTrack);
    //var wavesurfer;
    //var loadingPrev = false;
    $scope.voices = responsiveVoice.getVoices();
    //MB: you all can hear them too, right?
    $scope.read = function(text){
        responsiveVoice.speak(text, "US English Female");
    };

    $scope.musicTabClick = function(){
        $scope.tab = "music";
        $scope.disableSpace = false;
        $('.music-button').show();
        $('.sfx-button').hide();
        $('.instruction-button').hide();
    };
    $scope.sfxTabClick = function(){
        $scope.tab = "sfx";
        $scope.disableSpace = false;
        if ($scope.isPlaying){
            wavesurfer.pause();
            $scope.isPlaying = false;
        }
        $('.sfx-button').show();
        $('.music-button').hide();
        $('.instruction-button').hide();
    };
    $scope.voiceTabClick = function(){
        $scope.tab = "instructions";
        $scope.disableSpace = true;
        if ($scope.isPlaying){
            wavesurfer.pause();
            $scope.isPlaying = false;
        }
        $('.instruction-button').show();
        $('.music-button').hide();
        $('.sfx-button').hide();
    };
    $scope.stylizeEffect = function(effect){
        let style = {};
        //they're inverted!
        if (typeof(effect.effect) === 'string') style.color = "rgba(35,235,195,.75)";
        else style.color = "rgba(220,20,60,.75)";
        return style;
    };

    $scope.fillContainer = function(){
        return {width: '100%', height: '100%'};
    };

    $scope.selectSfx = function(sfx){
        $scope.currentSfx = sfx;
        console.log($scope.currentSfx);
        if (sfxPlaying) {
            console.log("pausing");
            audio.pause();
            // sfxPlaying=false;
        }
        if (currentSfx == sfx){
            console.log("stopped current");
            sfxPlaying = false;
            currentSfx = null;
        } else{
            console.log("playing new sound");
            //audio = new Audio();
            //context = new webkitAudioContext();
            //analyser = context.createAnalyser();
            audio.src = sfx.src;
            audio.controls = true;
            audio.autoplay = true;
            sfxPlaying = true;
            currentSfx = sfx;
            source = context.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(context.destination);
            currentSfx = sfx;
            sfxPlaying=true;
        }

    };
    $scope.selectInstruction = function(instruction){
        $scope.currentInstruction = instruction;
    };
    $scope.addVoiceToMix = function(text, trigger){
        MixBoardFactory.addEffectToMix( trigger, text , "voice")
    };

    $scope.stylizeTrack = function(track){
        //MB: sfx have no artist, so sfx get t-p-4
        return "track-panel-1";
    };
    $scope.fillContainer = function () {
        return {width: '100%', height: '100%'};
    };

    // NP: Add-to-mix functionality (non-DnD version)
    $scope.addSelectedTrackToMix = function (track) {
        MixBoardFactory.addTrackToMix(track);
        $('button').blur();
    };

    $scope.addEffectToMix = function(effectTrigger){
        MixBoardFactory.addEffectToMix(effectTrigger, $scope.currentSfx, "sfx");
        console.log("mixEffects", MixBoardFactory.getEffects())
    };

    $scope.addInstructionToMix = function(triggerTime){
        let effect = $scope.currentInstruction;
        let trigger = +triggerTime;
        MixBoardFactory.addEffectToMix( trigger, effect, "voice")
    };

    $scope.currentMixTrack;

});

app.controller('mixEditController', function ($scope, MixBoardFactory, ModalFactory) {
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
    $scope.openAddInstruction = () => ModalFactory.openAddInstruction($scope.instructions);
});

app.controller('mixPlaybackController', function($scope, MixBoardFactory) {

    var trackIndex;
    $scope.mix =  MixBoardFactory.getMix();
    var timeLogged = 0;
    var trackProgress = 0;

    $scope.totalTimePassed = timeLogged + trackProgress;
    $scope.formattedTimePassed = MixBoardFactory.getTimeObject($scope.totalTimePassed);
    $scope.soundEffects = MixBoardFactory.getEffects();
    $scope.effectIndex = 0;

    $scope.pauseMix=function(){
        $scope.currentMixTrack.wavesurfer.pause()
    };


    $scope.playClip = function (restart) {
            console.log("MY EFFECTS", $scope.soundEffects);

        // EC - checks whether we are restartign or continuing from prev
         var waveArray = MixBoardFactory.createWaveArray();
        if (restart){
            console.log("restarting");

            if ($scope.currentMixTrack){
                console.log("pausing current");
                $scope.currentMixTrack.wavesurfer.pause();
            }
            timeLogged=0;
            trackProgress=0;
            $scope.effectIndex = 0;
            trackIndex = 0;
            $scope.currentMixTrack = null;
            $scope.soundEffects = MixBoardFactory.getEffects();
           // $scope.mix = MixBoardFactory.getCleanMix();
           MixBoardFactory.resetMix();

        }

        trackIndex =  trackIndex ? trackIndex : 0;
        var startTime;

        if ($scope.currentMixTrack){
             startTime  = $scope.currentMixTrack.currentProgress ? $scope.currentMixTrack.currentProgress : $scope.currentMixTrack.start;
        } else {
            startTime = $scope.mix[trackIndex].start;
        }
        console.log("startTime", startTime);

        $scope.currentMixTrack = $scope.currentMixTrack ? $scope.currentMixTrack : $scope.mix[trackIndex];

        console.log("now up", $scope.currentMixTrack);
      //  debugger;
        $scope.currentMixTrack.wavesurfer.play(startTime, $scope.currentMixTrack.end);

        $scope.currentMixTrack.wavesurfer.on('audioprocess', function(process){
          //  console.log("process", process)
            trackProgress = process - $scope.currentMixTrack.start;
            $scope.totalTimePassed = timeLogged + trackProgress;
            $scope.formattedTimePassed = MixBoardFactory.getTimeObject($scope.totalTimePassed);
            $scope.$digest();
            if ($scope.soundEffects[$scope.effectIndex] && $scope.soundEffects[$scope.effectIndex].trigger - $scope.totalTimePassed <= .2  ){
                    console.log("PLAY EFFECT NOW!!!!");
              if ($scope.soundEffects[$scope.effectIndex].type == "voice") {
                console.log("PAUSING BECAUSE VOICE");

               // $scope.read($scope.soundEffects[$scope.effectIndex].effect)
                function voiceEndCallback() {
                    console.log("Voice ended");
                    $scope.playClip();

                }
                function voiceStartCalback() {
                    console.log("Voice Started");
                    $scope.currentMixTrack.wavesurfer.pause();
                }

                var parameters = {
                    onend: voiceEndCallback,
                    onstart: voiceStartCalback
                };

                responsiveVoice.speak($scope.soundEffects[$scope.effectIndex].effect,"UK English Female", parameters);
              }
              else {
               // $scope.currentMixTrack.wavesurfer.backend.gainNode.gain.setValueCurveAtTime(MixBoardFactory.createQuickWaveArray(), $scope.currentMixTrack.wavesurfer.backend.ac.currentTime, 2);
                var sfxAudio = new Audio();
                var context = new webkitAudioContext();
                var analyser = context.createAnalyser();
                sfxAudio.src = $scope.soundEffects[$scope.effectIndex].effect.src;
                sfxAudio.controls = true;
                sfxAudio.autoplay = true;
                var source = context.createMediaElementSource(sfxAudio);
                source.connect(analyser);
                analyser.connect(context.destination);

             }

            $scope.effectIndex+=1;
            console.log("new effect", $scope.effectIndex);
            console.log("new effect name", $scope.soundEffects[$scope.effectIndex])
            }
           // console.log("the process", trackProgress)
            //console.log("trackProgress", $scope.totalTimePassed )

            if ($scope.currentMixTrack){
                $scope.currentMixTrack.currentProgress = process;
                if ($scope.currentMixTrack.fade >$scope.currentMixTrack.startTime && !$scope.currentMixTrack.fadeRegistered && $scope.currentMixTrack.fade >= ($scope.currentMixTrack.end-$scope.currentMixTrack.wavesurfer.getCurrentTime() ) ){
                        console.log("FADING", $scope.currentMixTrack);
                        $scope.currentMixTrack.wavesurfer.backend.gainNode.gain.setValueCurveAtTime(waveArray, $scope.currentMixTrack.wavesurfer.backend.ac.currentTime, $scope.currentMixTrack.fade);
                        $scope.currentMixTrack.fadeRegistered = true;
                        trackIndex+=1;
                        $scope.currentMixTrack = $scope.mix[trackIndex];
                        $scope.currentMixTrack.currentProgress = 0;
                        console.log("next up after fade", $scope.currentMixTrack);
                        if ($scope.currentMixTrack) {$scope.playClip() }
                }
                else if ($scope.currentMixTrack.end - $scope.currentMixTrack.currentProgress < .2 && $scope.currentMixTrack.currentProgress < $scope.currentMixTrack.end ) {
                    $scope.currentMixTrack.wavesurfer.pause();
                    if (trackIndex+1 < $scope.mix.length){
                        console.log("time logged pre", timeLogged);
                        console.log("duration pre", $scope.currentMixTrack.duration);
                        timeLogged += $scope.currentMixTrack.duration;
                        console.log("next");
                        console.log("timeLogged", timeLogged);
                        trackProgress = 0;
                        console.log("trackProgress", trackProgress);
                        trackIndex+=1;
                        $scope.currentMixTrack = $scope.mix[trackIndex];
                        $scope.currentMixTrack.currentProgress = 0;
                        console.log("track", $scope.currentMixTrack);
                        $scope.playClip()
                    } else {
                        console.log("no more left!!");
                        timeLogged = 0;
                        trackProgress = 0;
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
    $scope.addFade;

    $scope.showFader = function(){
        $scope.addFade = !$scope.addFade;
    };

    $scope.prevWave = function (track) {
        console.log("track", track);
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
        if (e.which == 18 && $scope.isLoaded && !$scope.disableSpace) {
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
