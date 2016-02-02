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

app.controller('MixBoardController', function ($scope, tracks, MixBoardFactory) {

$scope.mixLength = 60;
$scope.slider1 = {
  value: 23,
    min: 30,
    max: 100,
  options: {
    floor: 0,
    ceil: $scope.mixLength,

   // draggableRange: true,
  // showTicks: true,
//showTicksValues: true
 }
};

$scope.slider2 = {
  value: 23,
    min: 30,
    max: 100,
  options: {
    floor: 0,
    ceil: $scope.mixLength,
  // showTicks: true,
 }
};

$scope.slider3 = {
  value: 23,
    min: 30,
    max: 100,
  options: {
    floor: 0,
    ceil: $scope.mixLength,
  // showTicks: true,
 }
};



$scope.minSlider = {

  options: {
    // floor: 0,
    // ceil: 450,
    stepsArray: ['Stretch', 'Warmup', 'Ramp Up', 'Peak', 'Cool Down'],
draggableRange: true,
showTicks: true,
showTicksValues: true
  }
};
    $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = [] //NP List of songs on the mix bar.
    $scope.library = tracks
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
            wavesurfer.destroy();
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
            $scope.isPlaying = true;
        });

        wavesurfer.on('region-updated', function () {
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
        $scope.selectedTrack = track;

        $scope.currentTrack.wavesurfer = wavesurfer
    };

    //MB:draggable things below here VVVVVVVVVVVVVVVVVVVV
    //$scope.mix is what we ng-repeat over for the playlist
    $scope.mix = [];
    $scope.addToMix = function (index, song, evt) {
        var copyOfSong;
        //MB:This is NOT to check for multiple of the same song on mix; it is to check if the song is coming from mix or library
        if (song.onMix === false) {
            copyOfSong = new $scope.Clone(song);
            copyOfSong.pseudoId = $scope.randomNumber();
            $scope.mix.push(copyOfSong);
            copyOfSong.onMix = true;
        }
        //MB:index is the index of the position where the draggable was dropped
        var originalArray = $scope.mix.slice(0);
        var originIndex;

        //MB:whether it came from the playlist or the library, the draggable is put at the index position it was dropped onto
        if (copyOfSong) {
            originIndex = $scope.mix.indexOf(copyOfSong);
            $scope.mix[index] = copyOfSong;
        }
        else {
            originIndex = $scope.mix.indexOf(song);
            $scope.mix[index] = song;
        }
        //MB:shift everything based on the new position of song
        if (index < originIndex) {
            for (var idx = originIndex; idx > index; idx--) {
                $scope.mix[idx] = originalArray[idx - 1];
            }
        }
        else {
            for (var idx = originIndex; idx < index; idx++) {
                $scope.mix[idx] = originalArray[idx + 1];
            }
        }
    };
    $scope.addToLibrary = function (index, song, evt) {
        //MB: index is the index of the position where the draggable was dropped
        var originalArray = $scope.library.slice(0);
        var originIndex = $scope.library.indexOf(song);
        //MB:the draggable is put at the index position it was dropped onto
        $scope.library[index] = song;
        //MB:start at the position the draggable came from and shift everything forward/backward
        if (index < originIndex) {
            for (var idx = originIndex; idx > index; idx--) {
                $scope.library[idx] = originalArray[idx - 1];
            }
        }
        else {
            for (var idx = originIndex; idx < index; idx++) {
                $scope.library[idx] = originalArray[idx + 1];
            }
        }
    };

    // NP: Add-to-mix functionality (non-DnD version)
    $scope.addSelectedTrackToMix = function () {
        if ($scope.selectedTrack) $scope.mix.push($scope.selectedTrack);
        $('track-panel').removeClass('track-selected');
        $scope.selectedTrack = null;
    };
    // PLAY / PAUSE FUNCTIONALITY
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


