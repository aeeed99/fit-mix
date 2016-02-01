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

    return MixBoardFactory;
})
