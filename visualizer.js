var someinfo = document.getElementById("someinfo");

// this height and width vars used to set canvas dimensions respectively
var WIDTH = document.body.offsetWidth;
var HEIGHT = document.body.offsetHeight;

// Interesting parameters to tweak!
var SMOOTHING = 0.8;
var FFT_SIZE = 2048;

function VisualizerSample() {
  this.analyser = context.createAnalyser();
  this.analyser.connect(context.destination);
  this.analyser.minDecibels = -140;
  this.analyser.maxDecibels = 0;
  loadSounds(this, {
    buffer: 'bensound.ogg'
  }, onLoaded);
  this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
  this.times = new Uint8Array(this.analyser.frequencyBinCount);

  function onLoaded() {
    button.removeAttribute('disabled');
    button.innerHTML = 'Play/pause';
  };

  this.isPlaying = false;
  this.startTime = 0;
  this.startOffset = 0;
}

// Toggle playback
VisualizerSample.prototype.togglePlayback = function() {
  if (this.isPlaying) {
    // Stop playback
    this.source[this.source.stop ? 'stop': 'noteOff'](0);
    this.startOffset += context.currentTime - this.startTime;
    console.log('paused at', this.startOffset);
    // Save the position of the play head.
  } else {
    this.startTime = context.currentTime;
    console.log('started at', this.startOffset);
    this.source = context.createBufferSource();
    // Connect graph
    this.source.connect(this.analyser);
    this.source.buffer = this.buffer;
    this.source.loop = true;
    // Start playback, but make sure we stay in bound of the buffer.
    this.source[this.source.start ? 'start' : 'noteOn'](0, this.startOffset % this.buffer.duration);
    // Start visualizer.
    requestAnimFrame(this.draw.bind(this));
  }
  this.isPlaying = !this.isPlaying;
}


VisualizerSample.prototype.draw = function() {
  this.analyser.smoothingTimeConstant = SMOOTHING;
  this.analyser.fftSize = FFT_SIZE;

  // Get the frequency data from the currently playing music
  this.analyser.getByteFrequencyData(this.freqs);
  this.analyser.getByteTimeDomainData(this.times);

  var width = Math.floor(1/this.freqs.length, 10);

  var canvas = document.querySelector('canvas');
  var drawContext = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  // Draw the frequency domain chart.
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    someinfo.innerHTML = this.freqs.toString(); // display all the numbers which are changed to viz bars
    var value = this.freqs[i];
    var percent = value / 256;
    // height of each bar
    var height = HEIGHT * percent;
    // offset is where on y-axis the bar starts to draw
    var offset = HEIGHT - height - 1;
    // width of the bar, the parameter frequencyBinCount is constant e.g. 1024 here
    var barWidth = WIDTH/this.analyser.frequencyBinCount;
    // hue is for color of the bars
    var hue = i/this.analyser.frequencyBinCount * 360;
    // bardistance param to set distance between bars
    // change to see effect
    var bardistance = 0;

    // lines below for rectangle created bars
    /* drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
       drawContext.fillRect(i * (barWidth + bardistance), offset, barWidth, height);*/

    // lines below for line created bars
    drawContext.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
    drawContext.beginPath();
    drawContext.moveTo(i * (barWidth + bardistance), offset);
    drawContext.lineTo(i * (barWidth + bardistance), height);
    drawContext.stroke();
  }

  // Draw the time domain chart.
  // for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
  //   var value = this.times[i];
  //   var percent = value / 256;
  //   var height = HEIGHT * percent;
  //   var offset = HEIGHT - height - 1;
  //   var barWidth = WIDTH/this.analyser.frequencyBinCount;
  //   drawContext.fillStyle = 'white';
  //   drawContext.fillRect(i * barWidth, offset, 1, 2);
  // }

  if (this.isPlaying) {
    requestAnimFrame(this.draw.bind(this));
  }
}

VisualizerSample.prototype.getFrequencyValue = function(freq) {
  var nyquist = context.sampleRate/2;
  var index = Math.round(freq/nyquist * this.freqs.length);
  return this.freqs[index];
}

// create new instance of visualizer and let it work
var sample = new VisualizerSample();
  document.getElementById('togglePlay').addEventListener('click', function() {
  sample.togglePlayback();
});
