app.factory('MixFactory', function () {
    return {
        addToMix: function (index, song, evt) {
            var copyOfSong;
            //MB:This is NOT to check for multiple of the same song on mix; it is to check if the song is coming from mix or library
            if(song.onMix === false){
                copyOfSong = new $scope.Clone(song);
                copyOfSong.pseudoId = $scope.randomNumber();
                $scope.mix.push(copyOfSong);
                copyOfSong.onMix = true;
            }
            //MB:index is the index of the position where the draggable was dropped
            var originalArray = $scope.mix.slice(0);
            var originIndex;

            //MB:whether it came from the playlist or the library, the draggable is put at the index position it was dropped onto
            if (copyOfSong){
                originIndex = $scope.mix.indexOf(copyOfSong);
                $scope.mix[index] = copyOfSong;
            }
            else{
                originIndex = $scope.mix.indexOf(song);
                $scope.mix[index] = song;
            }
            //MB:shift everything based on the new position of song
            if(index < originIndex){
                for (var idx = originIndex; idx > index; idx--){
                    $scope.mix[idx] = originalArray[idx - 1];
                }
            }
            else{
                for (var idx = originIndex; idx < index; idx++){
                    $scope.mix[idx] = originalArray[idx + 1];
                }
            }
        }
        //TODO: should we continue to refactor the drag controller into this factory?
    }
});