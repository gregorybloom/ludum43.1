// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["BasicShotActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function BasicShotActor() {
}
BasicShotActor.prototype = new Actor;
BasicShotActor.prototype.identity = function() {
	return ('BasicShotActor (' +this._dom.id+ ')');
};
BasicShotActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.shotClass = "BASICSHOT";
	this.shotType = 0;

	this.size = {w:8,h:8};
	this.position = {x:0,y:0};

	this.heading = {x:0,y:0};
	this.direction = 0;

	this.steps = [];
	this.stepsTimer = TimerObj.alloc();
	this.stepsTimer.lifeTime = 0;
	this.stepsTimer.looping = false;
	this.currStep = null;
	this.stepNum = -1;

	this.startedTimer = TimerObj.alloc();
	this.startedTimer.lifeTime = 0;
	this.startedTimer.looping = false;

	this.lifeTimer = TimerObj.alloc();
	this.lifeTimer.lifeTime = 10000;

	this.deathTimer = TimerObj.alloc();
	this.deathTimer.lifeTime = 1000;
	this.deathTimer.looping = false;

	this.deathRadius = 4;

	this.deadLength = 50;

	this.ticksDiff = 0;
	this.unitSpeed = 0.3;
	this.radius=4;
	this.firer=null;

	this.updatePosition();

	this.motionModule = MotionModule.alloc();
	this.motionModule.target = this;
};

BasicShotActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
};
BasicShotActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.startedTimer.update();
	this.stepsTimer.update();
	this.lifeTimer.update();
	this.deathTimer.update();

	this.checkDeath();
	this.updateDeath();
	this.checkEnd();

	var curtime = GAMEMODEL.getTime();

	if(!this.startedTimer.running) {
		this.startedTimer.startTimer();
		this.startedTimer.update();

		this.stepsTimer.startTimer();
		this.stepsTimer.update();

		this.lifeTimer.startTimer();
	}
	else {
		var newPos = {x:this.position.x,y:this.position.y};
			newPos.x += this.heading.x*this.unitSpeed*this.ticksDiff;
			newPos.y += this.heading.y*this.unitSpeed*this.ticksDiff;
			this.updatePosition(newPos);

		if(!this.deathTimer.running) {
			this.midStep( this.stepsTimer.cycledBy, this.stepNum,this.currStep );
		}
	}

	var c = this.lifeTimer.getCycle();
	if(this.lifeTimer.running && c.cycled)	{
		this.alive = false;
		this.clear();
	}


//	if(this.animateModule != null)	this.animateModule.update();
};
BasicShotActor.prototype.loadStep = function(name, dur) {
	this.steps.push({name:name,dur:dur});
};

BasicShotActor.prototype.checkStep = function() {
	var curtime = GAMEMODEL.getTime();
	for(var i in this.steps) {
		var thisstep = this.steps[i];
		if(typeof thisstep.dur['time'] !== "undefined") {

			if(this.stepsTimer.cycledBy	> thisstep.dur.time) {

				this.stepsTimer.startTimer();
				this.stepNum+=1;
				this.currStep = this.beginStep(this.stepNum,this.currStep);

				this.steps.splice(i,1);
				return;
			}
		}
	}
};
BasicShotActor.prototype.midStep = function(timeplace,num,step) {
};
BasicShotActor.prototype.beginStep = function(num,step) {

};
BasicShotActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	if(act  instanceof EnemyActor && act.deathTimer.running)	return;
	if(act  instanceof BasicShotActor && act.deathTimer.running)		return;
	if(this.deathTimer.running)									return;
	Actor.prototype.collide.call(this,act);

};
BasicShotActor.prototype.collideType = function(act) {
	if(act == this.firer)		return false;
	return false;
};
BasicShotActor.prototype.collideVs = function(act) {

};
BasicShotActor.prototype.checkDeath = function() {
	if(this.deathTimer.running)			return;
};
BasicShotActor.prototype.checkEnd = function() {
	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && c.cycled)	{
		this.alive = false;
		this.clear();
	}
};
BasicShotActor.prototype.beginDeath = function() {
	if(this.deathTimer.running)		return;
	this.deathTimer.startTimer();
	this.heading.x = 0;
	this.heading.y = 0;
};
BasicShotActor.prototype.updateDeath = function() {
	if(!this.deathTimer.running)		return;
};


BasicShotActor.prototype.updateCurrentAnimation = function() {
//	if(this.animateModule == null)	return;
	if(this.lastHeading.x == 0 && this.lastHeading.y == 0)	return;


};
BasicShotActor.prototype.updateMode = function() {
};


BasicShotActor.alloc = function() {
	var vc = new BasicShotActor();
	vc.init();
	return vc;
};


exports.BasicShotActor = BasicShotActor;
exports.BasicShotActor._loadJSEngineClasses = _loadJSEngineClasses;
