// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["BufferLoad"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function BufferLoad(context, baseurl, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
	this.baseurl = baseurl;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoad.prototype.loadBuffer = function(url, index) {
	if( /^file\s*web\s*browser\s*$/.test(GameEngine.engineMode) )		return;

  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoad: XHR error');
  }

  request.send();
};

BufferLoad.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i) {
		this.loadBuffer(GameEngine.staticURLPath+"/"+this.baseurl+"/"+this.urlList[i], i);
	}
};


exports.BufferLoad = BufferLoad;
exports.BufferLoad._loadJSEngineClasses = _loadJSEngineClasses;
