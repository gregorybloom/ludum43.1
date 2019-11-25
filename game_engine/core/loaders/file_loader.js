// CommonJS ClassLoader Hack
var classLoadList = ["ContentLoader"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports;     // Direct Load
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["FileLoader"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});

function FileLoader() {
}
FileLoader.prototype = new ContentLoader;
FileLoader.prototype.identity = function() {
	return ('FileLoader (' +this._dom.id+ ')');
};
FileLoader.prototype.init = function() {
	ContentLoader.prototype.init.call(this);
};
FileLoader.prototype.grabItemLabel = function(_loadItem) {
  var nameString = null;
  if(typeof _loadItem['nameset'] !== "undefined")			nameString = _loadItem['nameset'];
  else if(typeof _loadItem['name'] !== "undefined")		nameString = _loadItem['name'];
  else if(typeof _loadItem['label'] !== "undefined")		nameString = _loadItem['label'];
  return nameString;
};
FileLoader.prototype.loadEngineFiles = function(loadPhase,listName, fileList,GameEngine,opts,callback) {
	ContentLoader.prototype.loadEngineFiles.call(this,loadPhase,listName, fileList,GameEngine,opts,callback);
};
FileLoader.alloc = function() {
	var vc = new FileLoader();
	vc.init();
	return vc;
};


GameEngine.FileLoader = FileLoader.alloc();

exports.FileLoader = FileLoader;
exports.FileLoader._loadJSEngineClasses = _loadJSEngineClasses;
