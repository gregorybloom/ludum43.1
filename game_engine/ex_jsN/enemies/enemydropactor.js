// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyDropActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EnemyDropActor() {
}
EnemyDropActor.prototype = new Actor;
EnemyDropActor.prototype.identity = function() {
	return ('EnemyDropActor (' +this._dom.id+ ')');
};
EnemyDropActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.ticksDiff = 0;
	this.heading = {x:0,y:0};
	this.unitSpeed = 0.04;
	this.health = 0;



	this.deathTimer = TimerObj.alloc();
	this.deathTimer.lifeTime = 1300;
	this.deathTimer.looping = false;
	this.deathRadiusStart = 100;
	this.deathRadius = this.deathRadiusStart;
	this.beginSpawn = false;

	this.dropped = false;

	this.subject = null;

	this.size = {w:8,h:8};

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();
};
EnemyDropActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};

EnemyDropActor.prototype.loadingData = function(data)
{
};

EnemyDropActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
	if(this.beginSpawn && this.deathTimer.started) {
		if(this.deathRadius <= 0)		return;
		var prop = {fill:false, color:"#666666",width:2};
		prop.source = "default";
		prop.writeTo = 1;
		var shape = {type:"circle",radius:(this.deathRadius)};
		var transf = {};
		GAMEVIEW.drawElement(this.absPosition, shape, prop, transf);
	}
};
EnemyDropActor.prototype.update = function() {
	Actor.prototype.update.call(this);
	this.deathTimer.update();
	this.checkDeath();
	if(this.beginSpawn)		this.updateDeath();

	var curtime = GAMEMODEL.getTime();

	if(!this.started) {
		this.started = true;
		this.startedTime = GAMEMODEL.getTime();
		this.stepCooldown = GAMEMODEL.getTime();
	}
	else {
		var newPos = {x:this.position.x,y:this.position.y};
			newPos.x += this.heading.x*this.unitSpeed*this.ticksDiff;
			newPos.y += this.heading.y*this.unitSpeed*this.ticksDiff;
		this.updatePosition(newPos);

	}
};

EnemyDropActor.prototype.checkDeath = function() {
	if(this.beginSpawn)			return;
	if(this.started)			this.beginDeath();
};

EnemyDropActor.prototype.beginDeath = function() {
	this.deathTimer.startTimer();
	this.beginSpawn = true;
};
EnemyDropActor.prototype.updateDeath = function() {
	if(this.beginSpawn) {
		var curtime = GAMEMODEL.getTime();

		var deathDiff = (curtime - this.deathTimer.startTime)/this.deathTimer.lifeTime;

		var subjR = 0;
		if(this.subject != null && typeof this.subject.radius !== "undefined") {
				subjR = this.subject.radius;
		}

		this.deathRadius = Math.abs(this.deathRadiusStart-subjR)*(1-deathDiff) + Math.min(subjR,this.deathRadiusStart);
		if( (deathDiff) > 1)		this.deathRadius=0;

		var cycleobj = this.deathTimer.getCycle();
		if(cycleobj.cycled && !this.dropped) {
			this.dropSubject();
		}
	}

};

EnemyDropActor.prototype.dropSubject = function() {
		this.dropped = true;
		if(this.subject instanceof Actor) {
			var GW = GAMEMODEL.gameSession.gameWorldList[0];
			this.subject.updatePosition(this.position);
			this.subject.lastUpdateTicks = GAMEMODEL.getTime();
			this.subject.thisUpdateTicks = GAMEMODEL.getTime();

			GW.addActor(this.subject,'act');
			this.subject=null;
		}
		this.clear();
		this.alive = false;
};

EnemyDropActor.alloc = function() {
	var vc = new EnemyDropActor();
	vc.init();
	return vc;
};

exports.EnemyDropActor = EnemyDropActor;
exports.EnemyDropActor._loadJSEngineClasses = _loadJSEngineClasses;
