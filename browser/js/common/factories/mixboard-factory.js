app.factory('MixBoardFactory', function(){
    var MixBoardFactory = {};

    MixBoardFactory.getTimeObject = function(regionTime){
        return { m: ('0' + Math.floor( regionTime/60)).slice(-2),
               s: ('0' + Math.ceil( regionTime%60)).slice(-2)};
    };

    MixBoardFactory.getCurrentSong = function(library, track){
       return  _.find(library, function(libTrack) {
            return  libTrack._id == track._id;
            });
    };

    MixBoardFactory.createTimeline = function(wavesurfer){
        var timeline = Object.create(WaveSurfer.Timeline);

        timeline.init({
            wavesurfer: wavesurfer,
            container: "#track-timeline"
        });

        return timeline;
    };

    MixBoardFactory.createWaveForm = function(){
        return WaveSurfer.create({
            container: '#track-preview',
            waveColor: 'violet',
            progressColor: 'purple',
            loaderColor   : 'navy',
            cursorColor   : 'navy',
        });
    };

    MixBoardFactory.enableDragSelection = function(wavesurfer){
            wavesurfer.enableDragSelection({
                 color: 'rgba(0, 255, 0, 0.1)'
             });
    };

    MixBoardFactory.addRegion = function(wavesurfer, region){
        wavesurfer.addRegion({
           id: region.id,
           end: region.end,
           start: region.start,
           color: 'rgba(0, 255, 0, 0.1)'});

    };

    MixBoardFactory.addTrackToMix = function (track, mix) {
        if (track) {
            // EC - adds start and end times based on region/no region
            if (track.hasRegion){
            track.start = track.region.start;
            track.end = track.region.end;
            track.duration = track.end - track.start;
            } else {
            track.start =0;
            track.end = track.duration;
            }
             mix.push(track);
             console.log(mix);
        }
    };

    MixBoardFactory.reorderInPlace = function (index, item, event, dropArray){
        //MB: index is the index of the position where the draggable was dropped
        var originalArray = dropArray.slice(0);
        var originIndex = dropArray.indexOf(item);
        //MB:the draggable is put at the index position it was dropped onto
        dropArray[index] = item;
        //MB:start at the position the draggable came from and shift everything forward/backward
        if(index < originIndex){
            for (var idx = originIndex; idx > index; idx--){
                dropArray[idx] = originalArray[idx - 1];
            }
        }
        else{
            for (var idx = originIndex; idx < index; idx++){
                dropArray[idx] = originalArray[idx + 1];
            }
        }
    };

    MixBoardFactory.saveSegment = function(track){
        track.start = track.region.start;
        track.end = track.region.end;
    };
    return MixBoardFactory;
})
