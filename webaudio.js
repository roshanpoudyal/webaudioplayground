(function() {
    var context, 
        soundSource, 
        soundBuffer,
        url = 'dubstep.ogg';

    // Step 1 - Initialise the Audio Context
    // There can be only one!
    function init() {
        if (typeof AudioContext !== "undefined") {
            context = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            context = new webkitAudioContext();
        } else {
            throw new Error('AudioContext not supported. :(');
        }
    }

    // Step 2: Load our Sound using XHR
    function startSound() {
        // Note: this loads asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        // Our asynchronous callback
        request.onload = function() {
            var audioData = request.response;

            audioGraph(audioData);


        };

        request.send();
    }

    // Finally: tell the source when to start
    function playSound() {
        // play the source now
        soundSource.start(context.currentTime);
    }

    function stopSound() {
        // stop the source now
        soundSource.stop(context.currentTime);
    }

    // Events for the play/stop bottons
    document.querySelector('.play').addEventListener('click', startSound);
    document.querySelector('.stop').addEventListener('click', stopSound);


    // This is the code we are interested in
    function audioGraph(audioData) {
        // create a sound source
        soundSource = context.createBufferSource();

        // The Audio Context handles creating source buffers from raw binary
        context.decodeAudioData(audioData, function(soundBuffer){
            // Add the buffered data to our object
            soundSource.buffer = soundBuffer;
    
            volumeNode = context.createGain();
    
            //Set the volume
            volumeNode.gain.value = 0.1;
    
            // Wiring
            soundSource.connect(volumeNode);
            volumeNode.connect(context.destination);
            
            filterNode = context.createBiquadFilter();
 
            // Specify this is a lowpass filter
            filterNode.type = 0;
 
            // Quieten sounds over 220Hz
            filterNode.frequency.value = 220;
 
            soundSource.connect(volumeNode);
            volumeNode.connect(filterNode);
            filterNode.connect(context.destination);
    
            // Finally
            playSound(soundSource);
        });
      
    }


    init();


}());
