// CommonJS ClassLoader Hack
var classLoadList = ["MoveActorComponent"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MoveActorBasicPath"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MoveActorBasicPath() {
}
MoveActorBasicPath.prototype = new MoveActorComponent;
MoveActorBasicPath.prototype.identity = function() {
	return ('MoveActorBasicPath (' +this._dom.id+ ')');
};
MoveActorBasicPath.prototype.init = function() {
};
MoveActorBasicPath.prototype.start = function() {
};
MoveActorBasicPath.prototype.update = function() {
};

MoveActorBasicPath.prototype.getPositionWithLoopPath = function(t, start, end) {
	var diff = {x:0,y:0};
	diff.x = end.x - start.x;
	diff.y = end.y - start.y;

	var repeat = 0;
	while(t < 0)
	{
		t=t +1;
		repeat=repeat -1;
	}
	while(t > 1)
	{
		t=t -1;
		repeat=repeat +1;
	}

	var dstart = {x:start.x,y:start.y};
	dstart.x = dstart.x+ diff.x*repeat;
	dstart.y = dstart.y+ diff.y*repeat;
	var dend = {x:end.x,y:end.y};
	dend.x = dend.x+ diff.x*repeat;
	dend.y = dend.y+ diff.y*repeat;

	return this.getPosition(t, dstart, dend);
};
MoveActorBasicPath.prototype.getPosition = function(t, start, end) {
	if(t < 0.0 || t > 1.0)		return this.getPositionWithLoopPath(t, start, end);
	return start;
};
MoveActorBasicPath.prototype.getPathLength = function(start, end, t0, t1) {
	return 0.0;
};
MoveActorBasicPath.alloc = function() {
	var vc = new MoveActorBasicPath();
	vc.init();
	return vc;
};


exports.MoveActorBasicPath = MoveActorBasicPath;
exports.MoveActorBasicPath._loadJSEngineClasses = _loadJSEngineClasses;
