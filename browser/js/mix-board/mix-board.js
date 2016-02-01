app.config(function ($stateProvider) {

    $stateProvider.state('mix-board', {
        url: '/mix-board',
        templateUrl: 'js/mix-board/mix-board.html',
        controller: 'MixBoardController',
        resolve: {
            tracks: function (HomeFactory) {
                //console.log("[resolve] starting..", $stateParams);
                return HomeFactory.getTracks();
            }
        }
    })
});

app.controller('MixBoardController', function ($scope, tracks) {
    $scope.selectedTrack = null; //NP adding to mix will access this var for data manipulation
    $scope.mix = [] //NP List of songs on the mix bar.
    $scope.library = tracks;
    console.log("LIB", $scope.library);
    $scope.isLoaded = false;
    $scope.isPlaying = false;
    var wavesurfer;
    $scope.prevWave = function (track) {

        $scope.isLoaded = false;
        if (wavesurfer) {
            wavesurfer.destroy();
            $("#track-preview").empty();
        }
        wavesurfer = WaveSurfer.create({
            container: '#track-preview',
            waveColor: 'violet',
            progressColor: 'purple',
            loaderColor: 'navy',
            cursorColor: 'navy'
        });

        console.log('wavesurfer: ', wavesurfer);

        wavesurfer.on('ready', function () {
            $scope.isLoaded = true;
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

            wavesurfer.play();
            $scope.isPlaying = true;
        });

        wavesurfer.on('region-updated', function () {
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
        //Add clicked directory to selectedTrack (in case we want to add it)
        $scope.selectedTrack = track;
    };

    // PLAY / PAUSE FUNCTIONALITY
    $(document).on('keyup', function (e) {
        console.log("SPACE");
        if (e.which == 32 && $scope.isLoaded) {
            if ($scope.isPlaying) {
                wavesurfer.pause();
            } else {
                wavesurfer.play();
            }
            $scope.isPlaying = !$scope.isPlaying
        }
    });

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
    }
});


