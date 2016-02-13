app.factory('MixBoardFactory', function($http){
    var MixBoardFactory = {};
    var tempID = 0;
    MixBoardFactory.currentMix = [];
    MixBoardFactory.cleanMix = [];
    MixBoardFactory.soundEffects = [];

    MixBoardFactory.saveMix = function(name, length){
        console.log("saveMix called with")
        console.log(name, length);
        console.log(this.currentMix);
        console.log(this.soundEffects);
        let mixTracks = this.currentMix;
        let mixEffects = this.soundEffects;
        $http.post('/api/mix/', {
            name: name,
            tracks: mixTracks,
            effects: mixEffects,
            length: length,
            published: true
        })
    };

    MixBoardFactory.getMix = function(){
        return MixBoardFactory.currentMix;
    };

    MixBoardFactory.getCleanMix = function(){
        console.log("cleanMix", MixBoardFactory.cleanMix);
        var newClean  = jQuery.extend( {}, MixBoardFactory.cleanMix);
        return newClean;
    };

    MixBoardFactory.getEffects = function(){
        return MixBoardFactory.soundEffects;
    };

    MixBoardFactory.addEffectToMix = function(effectTrigger, current, type){
        console.log("EFFECT", current);
        let effect = current;
        let trigger = +effectTrigger;
        MixBoardFactory.soundEffects.push({ effect: effect, trigger: trigger, type: type });
        MixBoardFactory.soundEffects.sort(function(a, b){
            if (a.trigger > b.trigger) return 1;
            if (b. trigger > a.trigger) return -1;
            return 0;
        });
        console.log("effects", MixBoardFactory.soundEffects)
    };

    MixBoardFactory.removeTrack = function(index){
        MixBoardFactory.currentMix.splice(index, 1);
        MixBoardFactory.cleanMix.splice(index, 1);
    };

    MixBoardFactory.resetMix = function(){
        MixBoardFactory.currentMix.forEach(function(mixTrack, index, arr){
         // TEST GAIN RESET
             console.log("pre edit", MixBoardFactory.currentMix[index])
           //  MixBoardFactory.currentMix[index].wavesurfer.backend.gainNode = mixTrack.wavesurfer.backend.ac.createGain()

             MixBoardFactory.currentMix[index].wavesurfer.backend.gainNode.gain.value = 1;
             MixBoardFactory.currentMix[index].fadeRegistered = false;
             console.log("fadeRegistered should be false",  MixBoardFactory.currentMix[index].fadeRegistered)
             MixBoardFactory.currentMix[index].currentProgress=0;
            // track.wavesurfer.backend.gainNode.gain.setValueCurveAtTime([1], track.wavesurfer.backend.ac.currentTime, track.end);
            // Below here is newest
              //mixTrack.wavesurfer.backend.gainNode.gain.setTargetAtTime(1.0, mixTrack.wavesurfer.backend.ac.currentTime, 0.1);
         //   debugger;
             console.log("new track", MixBoardFactory.currentMix[index])
        });

        console.log("edited mix", MixBoardFactory.currentMix)
    };

    MixBoardFactory.createWaveArray = function (){
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

        return waveArray;
    };

    MixBoardFactory.createQuickWaveArray = function (){
        var waveArray = new Float32Array(9);
        waveArray[0] = 0.9;
        waveArray[1] = 0.9;
        waveArray[2] = 0.8;
        waveArray[3] = 0.8;
        waveArray[4] = 0.7;
        waveArray[5] = 0.5;
        waveArray[6] = 0.3;
        waveArray[7] = 0.1;
        waveArray[8] = 1.0;

        return waveArray;
    };

    MixBoardFactory.getTimeObject = function(regionTime){
        return { m: ('0' + Math.floor( regionTime/60)).slice(-2),
               s: ('0' + Math.ceil( regionTime%60)).slice(-2),
               ms: ('0' +  (regionTime%600)).slice(-2)
           };
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
                 color: 'rgba(190,255,246,0.5)'
             });
    };

    MixBoardFactory.addRegion = function(wavesurfer, region){
        wavesurfer.addRegion({
           id: region.id,
           end: region.end,
           start: region.start,
           color: 'rgba(0, 255, 0, 0.1)'});

    };

    MixBoardFactory.addTrackToMix = function (track) {
        if (track) {
            // MB: are you EC or CHES? Make up your mind!
            // EC - adds start and end times based on region/no region
            if (track.hasRegion){
                track.start = track.region.start;
                track.end = track.region.end;
                track.duration = track.end - track.start;
            } else {
                track.start =0;
                track.end = track.wavesurfer.getDuration();
                track.duration = track.wavesurfer.getDuration();
            }
            // EC - makes a copy so this isn't pass by reference
             track.tempID = tempID;
             tempID+=1;
             var copy1 = jQuery.extend( {}, track)
             var copy2 = jQuery.extend( {}, track)
             MixBoardFactory.currentMix.push(copy1);
             MixBoardFactory.cleanMix.push(copy2);
             console.log(MixBoardFactory.currentMix);
             console.log("clean", MixBoardFactory.cleanMix);

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
});
