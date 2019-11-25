// CommonJS ClassLoader Hack
var classLoadList = ["MoveActorComponent"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MoveActorDuration","DurationByTime","DurationByDistance"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MoveActorDuration() {
}
MoveActorDuration.prototype = new MoveActorComponent;
MoveActorDuration.prototype.identity = function() {
	return ('MoveActorDuration (' +this._dom.id+ ')');
};
MoveActorDuration.prototype.init = function() {
};
MoveActorDuration.prototype.start = function() {
};
MoveActorDuration.prototype.update = function() {
};

MoveActorDuration.prototype.trimToLimit = function() {
};
MoveActorDuration.prototype.durationReached = function() {
	return false;
};
MoveActorDuration.alloc = function() {
	var vc = new MoveActorDuration();
	vc.init();
	return vc;
};




function DurationByTime() {
}
DurationByTime.prototype = new MoveActorDuration;
DurationByTime.prototype.identity = function() {
	return ('DurationByTime (' +this._dom.id+ ')');
};
DurationByTime.prototype.init = function() {
	MoveActorDuration.prototype.update.call(this);

	this.duration = 0;
};
DurationByTime.prototype.start = function() {
};
DurationByTime.prototype.update = function() {
};

DurationByTime.prototype.trimToLimit = function() {
	if(this.parentMoveActor != null)
	{
		var timeline = this.parentMoveActor.currTime - this.parentMoveActor.startTime;
		if(timeline > this.duration)	this.parentMoveActor.currTime -= (timeline - this.duration);
		if(timeline > this.duration)	this.parentMoveActor.diffTime -= (timeline - this.duration);
	}
};
DurationByTime.prototype.durationReached = function() {
	if(this.parentMoveActor != null)
	{
		if(this.parentMoveActor.sumTime >= this.duration)	return true;
	}
	return false;
};
DurationByTime.alloc = function() {
	var vc = new DurationByTime();
	vc.init();
	return vc;
};





function DurationByDistance() {
}
DurationByDistance.prototype = new MoveActorDuration;
DurationByDistance.prototype.identity = function() {
	return ('DurationByDistance (' +this._dom.id+ ')');
};
DurationByDistance.prototype.init = function() {
	MoveActorDuration.prototype.update.call(this);

	this.distance = 0;
};
DurationByDistance.prototype.start = function() {
};
DurationByDistance.prototype.update = function() {
};

DurationByDistance.prototype.trimToLimit = function() {
	if(this.parentMoveActor != null)
	{
		if(this.parentMoveActor.currStep.x == 0 && this.parentMoveActor.currStep.y == 0)	return;

		var currStep = this.parentMoveActor.currStep;
		var magn = Math.sqrt(  currStep.x*currStep.x + currStep.y*currStep.y  );
		var distFull = this.parentMoveActor.sumDist + magn;
		if(distFull > distance)
		{
			var dropTo = 1.0 - (  (distFull-this.distance)/magn);
			var dropBy = {x:dropTo*currStep.x, y:dropTo*currStep.y};
			this.parentMoveActor.currStep.x = dropBy.x;
			this.parentMoveActor.currStep.y = dropBy.y;
		}
	}
};
DurationByDistance.prototype.durationReached = function() {
	if(this.parentMoveActor != null)
	{
		if(this.parentMoveActor.sumDist >= this.distance)	return true;
	}
	return false;
};
DurationByDistance.alloc = function() {
	var vc = new DurationByDistance();
	vc.init();
	return vc;
};

exports.classSet = {};
exports.classSet.MoveActorDuration = MoveActorDuration;
exports.classSet.DurationByTime = DurationByTime;
exports.classSet.DurationByDistance = DurationByDistance;

exports.classSet._loadJSEngineClasses = _loadJSEngineClasses;
