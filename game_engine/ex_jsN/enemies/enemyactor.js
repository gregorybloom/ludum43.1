// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","Actor","MotionModule"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EnemyActor() {
}
EnemyActor.prototype = new Actor;
EnemyActor.prototype.identity = function() {
	return ('EnemyActor (' +this._dom.id+ ')');
};
EnemyActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.deadLength = 100;

	this.shotTimer = TimerObj.alloc();
	this.shotTimer.lifeTime = 2000;

	this.deathTimer = TimerObj.alloc();
	this.deathTimer.lifeTime = 1000;
	this.deathTimer.looping = false;

	this.deathRadius = 4;

	this.ticksDiff = 0;
	this.heading = {x:0,y:0};
	this.unitSpeed = 0.04;
	this.health = 1;

	this.stepsTimer = TimerObj.alloc();
	this.stepsTimer.lifeTime = 0;
	this.stepsTimer.looping = false;

	this.steps = [];
	this.currStep = null;
	this.stepNum = -1;


	this.target = null;


	this.startedTimer = TimerObj.alloc();
	this.startedTimer.lifeTime = 0;
	this.startedTimer.looping = false;

	this.motionModule = MotionModule.alloc();
	this.motionModule.target = this;
};
EnemyActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};

EnemyActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

EnemyActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
EnemyActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.stepsTimer.update();
	this.shotTimer.update();
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

		if(!this.shotTimer.running) {
			this.shotTimer.startTimer();
		}
	}
	else {

		var newPos = {x:this.position.x,y:this.position.y};
			newPos.x += this.heading.x*this.unitSpeed*this.ticksDiff;
			newPos.y += this.heading.y*this.unitSpeed*this.ticksDiff;
		this.updatePosition(newPos);

		if(!this.deathTimer.running) {
			this.checkStep();
			this.midStep( this.stepsTimer.cycledBy, this.stepNum,this.currStep );
			this.checkShoot();
		}
	}
};
EnemyActor.prototype.loadStep = function(name, dur) {
	this.steps.push({name:name,dur:dur});
};
EnemyActor.prototype.checkStep = function() {
	var curtime = GAMEMODEL.getTime();
	for(var i in this.steps) {
		var thisstep = this.steps[i];
		if(typeof thisstep.dur['time'] !== "undefined") {
			if(this.stepsTimer.cycledBy	> thisstep.dur.time) {

				this.stepsTimer.startTimer();
				this.stepNum+=1;

				this.beginStep(this.stepNum,'');
//				this.currStep = this.beginStep(this.stepNum,this.currStep);

				this.steps.splice(i,1);
				return;
			}
		}
	}
};
EnemyActor.prototype.midStep = function(timeplace,stepnum,step) {
};
EnemyActor.prototype.beginStep = function(stepnum,stepdata) {

};
EnemyActor.prototype.checkShoot = function() {
	var c = this.shotTimer.getCycle();
	if(this.shotTimer.running && c.cycled)	{
		this.beginShoot();
	}
};
EnemyActor.prototype.beginShoot = function() {

};
EnemyActor.prototype.checkDeath = function() {
	if(this.deathTimer.running)			return;
	if(this.health <= 0)		this.beginDeath();
};
EnemyActor.prototype.checkEnd = function() {
	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && c.cycled)	{
		this.clear();
		this.alive = false;
	}
};
EnemyActor.prototype.beginDeath = function() {
	this.deathTimer.startTimer();
};
EnemyActor.prototype.updateDeath = function() {
	if(!this.deathTimer.running)		return;
};

EnemyActor.prototype.getHeadingAt = function(pt) {
	var P = {x:0,y:0};
	P.x = pt.x - this.absPosition.x;
	P.y = pt.y - this.absPosition.y;
	var d = Math.sqrt(P.x*P.x + P.y*P.y);
	P.x /= d;
	P.y /= d;
	return P;
};
EnemyActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	if(act  instanceof EnemyActor && act.deathTimer.running)	return;
//	if(act  instanceof ShotActor && act.deathTimer.running)		return;
	if(this.deathTimer.running)												return;
	Actor.prototype.collide.call(this,act);
};

EnemyActor.alloc = function() {
	var vc = new EnemyActor();
	vc.init();
	return vc;
};


exports.EnemyActor = EnemyActor;
exports.EnemyActor._loadJSEngineClasses = _loadJSEngineClasses;
