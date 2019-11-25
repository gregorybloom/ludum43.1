// CommonJS ClassLoader Hack
var classLoadList = ["MoveActorBasicProgress"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["LinearProgress"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function LinearProgress() {
}
LinearProgress.prototype = new MoveActorBasicProgress;
LinearProgress.prototype.identity = function() {
	return ('LinearProgress (' +this._dom.id+ ')');
};
LinearProgress.prototype.calculateProgress = function(t) {
	return t;
};
LinearProgress.prototype.calculatePathLength = function(start, end) {
	return this.getPathInRange(start, end, 0, 1);
};
LinearProgress.alloc = function() {
	var vc = new LinearProgress();
	vc.init();
	return vc;
};


exports.LinearProgress = LinearProgress;
exports.LinearProgress._loadJSEngineClasses = _loadJSEngineClasses;
