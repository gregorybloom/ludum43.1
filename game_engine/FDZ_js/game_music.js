// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMEMUSIC"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



GAMEMUSIC={

  audioContext: null,
  audioComponents: null,

  audioElement: null,

	resourceURL: "",
  musicSource: null,
  playing: false,
  musicOn: false,
  mute: false,
  volume: 0.35,

  gameSongs:[],
  currSong:0
};

//  https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video

GAMEMUSIC.init = function()
{
	GAMEMUSIC.declareResources();

  if(typeof webkitAudioContext !== "undefined")
  {
                console.log( 'webkit audio graph' );
    this.audioContext = new webkitAudioContext();
  }
  else if(typeof AudioContext !== "undefined")
  {
                console.log( 'audio context' );
    this.audioContext = new AudioContext();
  }
  else
  {
    console.log('AudioContext not supported!');
    return false;
  }

    /*  API changed, disabling Music for now */
  this.audioElement = null;

  return true;
};
GAMEMUSIC.loadResources = function() {};

GAMEMUSIC.createAudioElement = function(urls) {
    var audioElement = document.createElement("audio");

    audioElement.autoplay = false;
    audioElement.loop = true;
//    audioElement.loop = false;

    for (var i = 0; i < urls.length; ++i) {
        if(!urls[i])    continue;
        var typeStr = "audio/" + urls[i].split(".").pop();

        if (audioElement.canPlayType === undefined ||
            audioElement.canPlayType(typeStr).replace(/no/, "")) {

						var srcurl = urls[i];

            var sourceElement = document.createElement("source");
            sourceElement.type = typeStr;
            sourceElement.src = srcurl;
            audioElement.appendChild(sourceElement);
            console.log("Using audio asset: " + srcurl);
        }
    }

    return audioElement;
};
GAMEMUSIC.createFilterNode = function() {
  var filterNode = this.audioContext.createBiquadFilter();

  // Specify this is a lowpass filter
  filterNode.type = "highpass";

  // Quieten sounds over 220Hz
  filterNode.frequency.value = 220;
  return filterNode;
};
GAMEMUSIC.createOscillatorNode = function() {
  var oscillatorNode = this.audioContext.createOscillator();
//  oscillatorNode.sineWave.frequency.value = 900;
//  oscillatorNode.sineWave.noteOn(0);
  oscillatorNode.type = "square"; // Square wave
  oscillatorNode.frequency.value = 100;
  oscillatorNode.connect(this.audioContext.destination);
//  oscillatorNode.start(0);

  return oscillatorNode;
};
GAMEMUSIC.filterUp = function() {
  if(this.audioComponents && this.audioComponents.filterNode) {
    this.audioComponents.filterNode.frequency.value += 10;
    console.log('frequency: ' + this.audioComponents.filterNode.frequency.value);
  }
};
GAMEMUSIC.filterDown = function() {
  if(this.audioComponents && this.audioComponents.filterNode) {
    this.audioComponents.filterNode.frequency.value -= 10;
    console.log('frequency: ' + this.audioComponents.filterNode.frequency.value);
  }
};
GAMEMUSIC.volumeUp = function() {
  this.volume += 0.1
  if(this.volume > 1) this.volume = 1;
  if(this.audioComponents && this.audioComponents.gainNode) {
    this.audioComponents.gainNode.gain.value = this.volume;
    console.log('volume: ' + this.audioComponents.gainNode.gain.value);
  }
};
GAMEMUSIC.volumeDown = function() {
  this.volume -= 0.1;
  if(this.volume < 0) this.volume = 0;
  if(this.audioComponents && this.audioComponents.gainNode) {
    this.audioComponents.gainNode.gain.value = this.volume;
    console.log('volume: ' + this.audioComponents.gainNode.gain.value);
  }
};


GAMEMUSIC.playAudio = function(){
	console.log('play audio');
  if(this.audioElement == null || typeof this.audioElement === "undefined")
  {
			var urlbase = GameEngine.staticURLPath+"/"+this.resourceURL;
      this.audioElement = GAMEMUSIC.createAudioElement( [  urlbase+"/"+this.gameSongs[this.currSong]  ] );

      this.audioElement.volume = this.volume;

//  http://creativejs.com/resources/web-audio-api-getting-started/
      if(this.audioElement){
          this.audioComponents = {};

          var source = this.audioContext.createMediaElementSource( this.audioElement );

          this.audioComponents.analyser = this.audioContext.createAnalyser();
          this.audioComponents.gainNode = this.audioContext.createGain();
          this.audioComponents.filterNode = GAMEMUSIC.createFilterNode();
          this.audioComponents.sineWave = GAMEMUSIC.createOscillatorNode();

/*
          this.audioComponents.gainNode = this.audioContext.createGainNode();
          this.audioComponents.sineWave.frequency.value = 900;
          this.audioComponents.sineWave.noteOn(0);
          this.audioComponents.sineWave.connect(gainNode);
          this.audioComponents.gainNode.connect(this.audioContext.destination);
/**/
//          source.connect(this.audioComponents.analyser);
//          this.audioComponents.analyser.connect(this.audioContext.destination);

          source.connect(this.audioComponents.gainNode);
//          this.audioComponents.gainNode.connect(this.audioContext.destination);
          this.audioComponents.gainNode.connect(this.audioComponents.filterNode);
          this.audioComponents.filterNode.connect(this.audioContext.destination);
      }
  }
  else
  {
    this.audioElement.setAttribute('src', GameEngine.staticURLPath+"/"+this.gameSongs[this.currSong] );
  }

  if(this.audioElement) {
		if( /^file.*browser\s*$/.test(GameEngine.engineMode) ) {
			console.log('File Browser Mode.  Music',this.currSong,'will not play.');
			return;
		}

    if(this.audioComponents && this.audioComponents.gainNode.gain.value) {
        this.audioComponents.gainNode.gain.value = this.volume;
    }

    console.log('play audio: '+ this.currSong + '-'+ this.gameSongs[this.currSong])
        this.audioElement.play();

        this.playing = true;
/*        if(this.audioElement != null)
      {
        audioElement.stop(0);
        delete this.audioElement;
      } /**/
        this.musicOn=true;
    }
};

GAMEMUSIC.pauseAudio = function(){
	console.log('pause audio');
  if (this.playing) {
    // Stop all sources.
    /*    for (var i = 0, length = this.sources.length; i < length; i++) {
    var src = this.sources[i];
    src.stop(0);  /**/
    if(this.audioElement != null)
    {
      this.audioElement.pause();
    }

    this.playing = !this.playing;
  }
  else
  {
    var targetStart = this.audioContext.currentTime + 0.1;
    // Start all sources simultaneously.
/*    for (var i = 0, length = this.buffers.length; i < length; i++) {
      this.playSound(i, targetStart);
    }
    this.setIntensity(0); /**/
    if(this.audioElement != null)  this.audioElement.play();
    else              GAMEMUSIC.playAudio();

    this.playing = !this.playing;
  }

};
GAMEMUSIC.stopAudio = function(){
  console.log('stop audio')

  if(this.audioElement != null) {
    this.audioElement.pause();
    this.audioElement.src='';

    this.audioElement.removeAttribute("src");
  }

  this.musicOn=false;
};
GAMEMUSIC.nextAudio = function(){
  this.currSong = (this.currSong+1)%this.gameSongs.length;
  console.log('next audio: '+this.currSong)

  if(this.musicOn)
  {
    GAMEMUSIC.stopAudio();
    GAMEMUSIC.playAudio();
  }
};

GAMEMUSIC.toggleAudio = function() {
  console.log('toggle audio, musicOn: '+!this.musicOn)

  if(this.musicOn)
  {
    GAMEMUSIC.stopAudio();
  }
  else
  {
    GAMEMUSIC.playAudio();
  }

};



// works fine, i can hear a sound


/*
function BackgroundIntensity(buttonElement, rangeElement, context) {
  var ctx = this;

  buttonElement.addEventListener('click', function() {
    ctx.playPause.call(ctx);
  });

  rangeElement.addEventListener('change', function(e) {
    var value = parseInt(e.target.value);
    var max = parseInt(e.target.max);
    ctx.setIntensity(value / max);
  });

  var sources = ["music/07_from_the_legend_of_zelda_-_triforce_of_the_gods_''hyrule_castle''.mp3", "08_from_the_legend_of_zelda_-_triforce_of_the_gods_''legend_of_zelda_theme''.mp3"];

  // Load all sources.
  var ctx = this;
  loader = new BufferLoad(context, sources, onLoaded);
  loader.load();

  function onLoaded(buffers) {
    // Store the buffers.
    ctx.buffers = buffers;
  }

  this.sources = new Array(sources.length);
  this.gains = new Array(sources.length);
}

BackgroundIntensity.prototype.playPause = function() {
  if (this.playing) {
    // Stop all sources.
    for (var i = 0, length = this.sources.length; i < length; i++) {
      var src = this.sources[i];
      src.stop(0);
    }
  } else {
    var targetStart = context.currentTime + 0.1;
    // Start all sources simultaneously.
    for (var i = 0, length = this.buffers.length; i < length; i++) {
      this.playSound(i, targetStart);
    }
    this.setIntensity(0);
  }
  this.playing = !this.playing;
}

BackgroundIntensity.prototype.setIntensity = function(normVal) {
  var value = normVal * (this.gains.length - 1);
  // First reset gains on all nodes.
  for (var i = 0; i < this.gains.length; i++) {
    this.gains[i].gain.value = 0;
  }
  // Decide which two nodes we are currently between, and do an equal
  // power crossfade between them.
  var leftNode = Math.floor(value);
  // Normalize the value between 0 and 1.
  var x = value - leftNode;
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
  //console.log(gain1, gain2);
  // Set the two gains accordingly.
  this.gains[leftNode].gain.value = gain1;
  // Check to make sure that there's a right node.
  if (leftNode < this.gains.length - 1) {
    // If there is, adjust its gain.
    this.gains[leftNode + 1].gain.value = gain2;
  }
}

BackgroundIntensity.prototype.playSound = function(index, targetTime) {
  var buffer = this.buffers[index];
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  var gainNode = context.createGainNode();
  // Make a gain node.
  source.connect(gainNode);
  gainNode.connect(context.destination);
  // Save the source and gain node.
  this.sources[index] = source;
  this.gains[index] = gainNode;
  source.start(targetTime);
}
/**/


exports.GAMEMUSIC = GAMEMUSIC;
exports.GAMEMUSIC._loadJSEngineClasses = _loadJSEngineClasses;
