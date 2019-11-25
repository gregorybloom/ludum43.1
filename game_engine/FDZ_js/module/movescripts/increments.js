// CommonJS ClassLoader Hack
var classLoadList = ["MoveActorComponent"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MoveActorIncrement","IncrementBySpeed"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MoveActorIncrement() {
}
MoveActorIncrement.prototype = new MoveActorComponent;
MoveActorIncrement.prototype.identity = function() {
	return ('MoveActorIncrement (' +this._dom.id+ ')');
};
MoveActorIncrement.prototype.init = function() {
};
MoveActorIncrement.prototype.start = function() {
};
MoveActorIncrement.prototype.update = function() {
};

MoveActorIncrement.prototype.getTotal = function() {
};
MoveActorIncrement.prototype.calculateNewTop = function(dt) {
	if(this.parentMoveActor == null)		return 0;
	var t = this.getCurrentTop() + this.getStep(dt);
//	console.log(t+'='+this.getCurrentTop() +"+"+ this.getStep(dt));
	return t;
};
MoveActorIncrement.prototype.getCurrentTop = function() {
};
MoveActorIncrement.prototype.getStep = function(dt) {
};
MoveActorIncrement.alloc = function() {
	var vc = new MoveActorIncrement();
	vc.init();
	return vc;
};




function IncrementBySpeed() {
}
IncrementBySpeed.prototype = new MoveActorIncrement;
IncrementBySpeed.prototype.identity = function() {
	return ('IncrementBySpeed (' +this._dom.id+ ')');
};
IncrementBySpeed.prototype.init = function() {
	MoveActorIncrement.prototype.update.call(this);

	this.travelDist = 0;
	this.finalDist = 0;
	this.spdPerTick = 0;
};
IncrementBySpeed.prototype.start = function() {
};
IncrementBySpeed.prototype.update = function() {
};

IncrementBySpeed.prototype.getTotal = function() {
	if(this.parentMoveActor == null)		return 1.0;
	if(this.parentMoveActor.path == null)	return 1.0;

	var startPt = this.parentMoveActor.startPt;
	var currEndPt = this.parentMoveActor.currEndPt;
	this.finalDist = this.parentMoveActor.progress.getPathLength( startPt, currEndPt );

	if(this.finalDist == 0.0)	this.finalDist = 1.0;
	return this.finalDist;
};
IncrementBySpeed.prototype.calculateNewTop = function(dt) {
	this.travelDist += this.getStep(dt);
	return MoveActorIncrement.prototype.calculateNewTop.call(this,dt);
};

IncrementBySpeed.prototype.getCurrentTop = function() {
	return (this.travelDist);
};
IncrementBySpeed.prototype.getStep = function(dt) {
	return this.spdPerTick*(dt);
};
IncrementBySpeed.alloc = function() {
	var vc = new IncrementBySpeed();
	vc.init();
	return vc;
};


exports.classSet = {};
exports.classSet.MoveActorIncrement = MoveActorIncrement;
exports.classSet.IncrementBySpeed = IncrementBySpeed;

exports.classSet._loadJSEngineClasses = _loadJSEngineClasses;
