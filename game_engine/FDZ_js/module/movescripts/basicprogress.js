// CommonJS ClassLoader Hack
var classLoadList = ["MoveActorComponent"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MoveActorBasicProgress"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MoveActorBasicProgress() {
}
MoveActorBasicProgress.prototype = new MoveActorComponent;
MoveActorBasicProgress.prototype.identity = function() {
	return ('MoveActorBasicProgress (' +this._dom.id+ ')');
};
MoveActorBasicProgress.prototype.init = function() {
	this.lastStart = {x:0,y:0};
	this.lastEnd = {x:0,y:0};
	this.lastDiff = {x:0,y:0};

	this.lastDistance = 0;
	this.lastPath = null;

	this.progress = null;
};
MoveActorBasicProgress.prototype.start = function() {
};
MoveActorBasicProgress.prototype.update = function() {
};

MoveActorBasicProgress.prototype.getProgress = function(t) {
	if(this.progress != null)
	{
		t = this.progress.getProgress(t);
	}
	return this.calculateProgress(t);
};
MoveActorBasicProgress.prototype.getPathLength = function(start, end) {
	var thisDiff = {x:0,y:0};
	thisDiff.x = end.x - start.x;
	thisDiff.y = end.y - start.y;

	if(this.lastDiff.x == thisDiff.x && this.lastDiff.y == thisDiff.y)
	{
		if(this.lastPath == this.parentMoveActor.path)
		{
			return this.lastDistance;
		}
	}

	this.lastDiff = thisDiff;
	this.lastPath = this.parentMoveActor.path;

	this.lastDistance = 0.0;
	this.lastDistance = this.calculatePathLength(start, end);
	return this.lastDistance;
};
MoveActorBasicProgress.prototype.getPathInRange = function(start, end, t0, t1) {
	return this.parentMoveActor.path.getPathLength(start, end, t0, t1);
};
MoveActorBasicProgress.prototype.calculateProgress = function(t) {
	return 0.0;
};
MoveActorBasicProgress.prototype.calculatePathLength = function(start, end) {
	return 0.0;
};

MoveActorBasicProgress.alloc = function() {
	var vc = new MoveActorBasicProgress();
	vc.init();
	return vc;
};

exports.MoveActorBasicProgress = MoveActorBasicProgress;
exports.MoveActorBasicProgress._loadJSEngineClasses = _loadJSEngineClasses;
