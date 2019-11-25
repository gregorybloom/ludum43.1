// CommonJS ClassLoader Hack
var classLoadList = ["BufferLoad"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMESOUNDS"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


GAMESOUNDS={

	audioContext: null,
  buffers: null,

  audioComponents: null,

	resourceURL: "",
	musicSource: null,
	audioElement: null,
	playing: false,
	musicOn: false,
  volume: 0.4,

  nodeArray:['source','gain','convolver','biquad','compressor','delay'],

	gameSFX:[]
};

//	https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
//  https://www.sitepoint.com/html5-web-audio-api-tutorial-building-virtual-synth-pad/

GAMESOUNDS.init = function()
{
  GAMESOUNDS.audioContext = GAMEMUSIC.audioContext;
    /*  API changed, disabling Music for now */
	GAMESOUNDS.declareResources();

	return true;
};
GAMESOUNDS.loadResources = function() {
};
GAMESOUNDS.loadSoundList = function(context, soundlist) {
	var onLoaded = function(buffers) {
		this.buffers = buffers;
	}.bind(this);

  var loader = new BufferLoad(context, this.resourceURL, soundlist, onLoaded);
  loader.load();
};
GAMESOUNDS.loadReverb = function(context, soundlist,fn) {
/*
  if(typeof fn === "undefined" || fn == null)   fn=onLoaded;

  var ctx = this;
  var loader = new BufferLoad(context,  baseurl, soundlist, fn);
  function onLoaded(buffer) {
      ctx.reverb={};
      ctx.reverb.buffer = buffer;
  }
  loader.load();
};
/**/
    function reverbObject (url) {
        this.source = url;
        loadAudio2(this, url);
    }

    function loadAudio2(object, url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            GAMESOUNDS.audioContext.decodeAudioData(request.response, function(buffer) {
//                object.buffer = buffer;
          GAMESOUNDS.reverb={};
          GAMESOUNDS.reverb.buffer = buffer;
            });
        }
        request.send();
    }
//    var domain="http://gwbloom.com/dev/games/ludum/ludum36/";
//    new reverbObject('sounds/effects/1407409273irHall.ogg');
};
/**/
//  if(typeof fn === "undefined" || fn == null)   fn=onLoaded;

//  var ctx = this;
//  var loader = new BufferLoad(context,  baseurl, soundlist, fn);
//  function onLoaded(buffers) {
//    ctx.buffers = buffers;
//  }
//  loader.load();



GAMESOUNDS.makeSource = function(type,vol,mods) {
  if(GAMEMUSIC.mute)    return;
  if(GAMESOUNDS.buffers==null)    return null;
  if(typeof mods.nodedata == "undefined")  mods.nodedata = {};
  var sobj = {};
  sobj.obj = {};

  var addstuff=['source','compressor','gain'];
  if(typeof mods.nodelist !== "undefined")      addstuff = addstuff.concat(mods.nodelist);

  for (var k in addstuff) {
    var val = addstuff[k];
    var data = {};
    if(val == 'source')   data.type = type;
    if(val == 'gain')   data.vol = vol;

    if(typeof mods.nodedata[type] !== 'undefined') {
      for (k in mods.nodedata[type]) {
        data[k] = mods.nodedata[type][k];
      }
    }
    GAMESOUNDS.addAudioNode(sobj,val,data);
  }
  return sobj;
};

GAMESOUNDS.playSound = function(type,vol,rate,mods) {
	if( /^file.*browser\s*$/.test(GameEngine.engineMode) ) {
		console.log('File Browser Mode.  SFX',type,'will not play.');
		return;
	}


	if(typeof mods === "undefined")		mods={};

  var c = 0;
  if(GAMESOUNDS.playingSounds == null || typeof GAMESOUNDS.playingSounds === "undefined") {
    GAMESOUNDS.playingSounds = {};
  }
  while(GAMESOUNDS.playingSounds[c] != null || typeof GAMESOUNDS.playingSounds[c] !== "undefined") {
    c+=1;
  }
//  console.log('create channel #'+c+' for sound "'+type+'"');
  GAMESOUNDS.playingSounds[c]={};


  var sobj = GAMESOUNDS.makeSource(type,vol,mods);
  var source = sobj.source;

//  if(source == null)    delete GAMESOUNDS.playingSounds[c];
  if(source == null)    return null;

  GAMESOUNDS.playingSounds[c] = sobj;

  sobj.time = GAMEMODEL.modelClock.elapsedMS();

  source.playbackRate.value = rate;

  var ctx = GAMESOUNDS;
  source.onended = function() {
//    console.log('delete channel #'+c+' for sound "'+type+'"');
    delete ctx.playingSounds[c];
  };
  source.start(0);
  //  source.stop();
  return c;
};
GAMESOUNDS.connectAudioNode = function(sobj,type,attach) {
  var place=-1;
  for (var key in GAMESOUNDS.nodeArray) {
    var val = GAMESOUNDS.nodeArray[key];
    if(val == type)   place = key;
    if(place >= 0)    break;
  }
  if(place < 0)   return;

  var prev=-1;
  for (var k in GAMESOUNDS.nodeArray) {
    var val = GAMESOUNDS.nodeArray[k];
    if(k >= place)    break;
    if(  sobj.nodelist.indexOf(val) >= 0  ) prev = sobj.nodelist.indexOf(val);
  }
  var next=-1;
  for (var k in GAMESOUNDS.nodeArray) {
    var val = GAMESOUNDS.nodeArray[k];
    if(k <= place)    continue;
    if(  sobj.nodelist.indexOf(val) >= 0  ) next = sobj.nodelist.indexOf(val);
    if(next >= 0)   break;
  }

  var prevObj = null;
  var nextObj = null;
  var prevName = null;
  var nextName = null;
  if(prev >= 0)     prevName = sobj.nodelist[prev];
  if(next >= 0)     nextName = sobj.nodelist[next];
  if(prevName != null)  prevObj = sobj.obj[prevName];
  if(nextName != null)  nextObj = sobj.obj[nextName];

  var curName = GAMESOUNDS.nodeArray[place];
  var curObj = sobj.obj[curName];
  if(attach == true) {
    if(prevObj != null) prevObj.disconnect(0);
    if(prevObj != null) prevObj.connect(curObj);

    if(nextObj != null) curObj.connect(nextObj);
    else        curObj.connect(GAMESOUNDS.audioContext.destination);

    var cur = prev+1;
    sobj.nodelist.splice(cur,0,curName);
//    console.log(  '  - added "'+curName+'" at '+cur+' : '+sobj.nodelist.join()  );
//    console.log(  '  - - reconnected "'+prevName+'" at '+prev+' to '+curName+' at '+cur  );
  }
  else {
    curObj.disconnect(0);
    if(prevObj != null) {
      prevObj.disconnect(0);
      if(nextObj != null)   prevObj.connect(nextObj);
      else          prevObj.connect(GAMESOUNDS.audioContext.destination);
    }
    var cur = sobj.nodelist.indexOf(curName);
    sobj.nodelist.splice(cur,1);
//    console.log(  '  - removed "'+curName+'" at '+cur+' : '+sobj.nodelist.join()  );
//    console.log(  '  - - reconnected "'+prevName+'" at '+prev+' to '+nextName+' at '+next  );
  }
};
GAMESOUNDS.addAudioNode = function(sobj,type,data) {
  if(typeof sobj.nodelist === "undefined")    sobj.nodelist = [];
  if(typeof sobj.nodedata === "undefined")    sobj.nodedata = {};

  var obj = sobj.obj;
  if(type=='source') {
    obj.source = GAMESOUNDS.audioContext.createBufferSource();
    obj.source.buffer = GAMESOUNDS.buffers[data.type];
//    obj.source.loop = false;
    sobj.source = obj.source;
    delete data.type;
  }
  if(type=='compressor') {
    obj.compressor = GAMESOUNDS.audioContext.createDynamicsCompressor();
  }
  if(type=='gain') {
    //  http://www.html5rocks.com/en/tutorials/webaudio/intro/#toc-xfade
    //  https://www.w3.org/TR/webaudio/#AudioParam
    obj.gain = GAMESOUNDS.audioContext.createGain();
    var v = data.vol* GAMEMUSIC.volume *1.45;
    if(v > 1) v=1;
    obj.gain.gain.value = v;
    delete data.vol;
  }
  if(type=='convolver') {
    obj.convolver = GAMESOUNDS.audioContext.createConvolver();
    obj.convolver.buffer = GAMESOUNDS.reverb.buffer;
  }
  if(type=='biquad') {
    //    https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
    //    https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBiquadFilter
      obj.biquad = GAMESOUNDS.audioContext.createBiquadFilter();
      obj.biquad.type = "lowpass";
      obj.biquad.frequency.value = 350;//this.fqValue;
//        biquad.Q.value = 500;//this.qValue;
  }
  if(type=='delay') {
      obj.delay = GAMESOUNDS.audioContext.createDelay(data.time);
      obj.delay.delayTime = data.time;
      delete data.time;
  }

  if(typeof obj[type] !== "undefined") {
    for (var k in data) {
      var ptr = obj[type];

      var parts = k.split(":");
      while(parts.length > 1) {
        var first = parts.shift();
        if(typeof ptr[first] === "undefined")   ptr = undefined;
        else {
          ptr = ptr[first];
        }
      }
      if(typeof ptr === "undefined")    continue;

      var pt = parts.shift();
      if(typeof ptr[pt] === "undefined")    continue;

      ptr[pt] = data[k];
    }
  }



  GAMESOUNDS.connectAudioNode(sobj,type,true);
};
GAMESOUNDS.dropAudioNode = function(sobj,type) {
  if(typeof sobj.nodelist === "undefined")  return;
  var obj = sobj.obj;

  GAMESOUNDS.connectAudioNode(sobj,type,false);
  if(typeof sobj[type] !== "undefined")   delete sobj[type];
};

exports.GAMESOUNDS = GAMESOUNDS;
exports.GAMESOUNDS._loadJSEngineClasses = _loadJSEngineClasses;
