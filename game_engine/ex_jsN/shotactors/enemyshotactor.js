// CommonJS ClassLoader Hack
var classLoadList = ["BasicShotActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyShotActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function EnemyShotActor() {
}
EnemyShotActor.prototype = new BasicShotActor;
EnemyShotActor.prototype.identity = function() {
	return ('EnemyShotActor (' +this._dom.id+ ')');
};
EnemyShotActor.prototype.init = function() {
	BasicShotActor.prototype.init.call(this);

	this.size = {w:8,h:8};

	this.shotClass = "BULLETSHOT";
	this.shotType = 0;

	this.radius=4;
	this.unitSpeed = 0.3;
	this.firer=null;

	this.damage = 1;
	this.deathTimer.lifeTime = 200;

	this.deathRadius = this.radius;

	this.actionMode = "MODE_STILL";

	this.updatePosition();

  this.stepRay = null;
/*
	this.animateModule = AnimationModule.alloc();
	this.animateModule.target = this;
	this.animateModule.drawCollection = 0;
	this.animateModule.changeToAnimation(13, true);
/**/
};

EnemyShotActor.prototype.draw = function() {
	BasicShotActor.prototype.draw.call(this);
	if(!this.deathTimer.running) {
		GAMEVIEW.fillCircle(this.absPosition,this.radius,"#000000");
	} else {
		GAMEVIEW.drawCircle(this.absPosition,this.deathRadius,"#990000",1);
	}
};
EnemyShotActor.prototype.update = function() {
  if(!this.alive)   return;
  var spd = this.unitSpeed;
  this.unitSpeed = 0;
	BasicShotActor.prototype.update.call(this);
  this.unitSpeed = spd;

  if(this.deathTimer.running)   return;
  if(this.stepRay == null) {
    var raymove = StepRayActor.alloc();
    GAMEMODEL.gameSession.gameWorld.addActor(raymove,'ray');
    raymove.teleportHost = this;
    this.stepRay = raymove;
  }


  		var dstep = spd*this.ticksDiff;
      var P2 = {};
      P2.x = this.heading.x * dstep;
      P2.y = this.heading.y * dstep;

  		var pospt = {};
      pospt.x = P2.x + this.position.x;
      pospt.y = P2.y + this.position.y;
/*
  		var pospts = {};
      pospts.x = this.parent.position.x - 2*P2.x/dstep;
      pospts.y = this.parent.position.y - 2*P2.y/dstep;
      var posptf = {};
      posptf.x = P2.x + this.position.x + 2*P2.x/dstep;
      posptf.y = P2.y + this.position.y + 2*P2.y/dstep;
/**/
//      console.log('a',this.stepRay.teleported);
  		this.stepRay.setRayPoint(this.position,pospt);
//      console.log('b',this.stepRay.teleported);

//  		this.stepRay.teleportPoints = [pospts, posptf, pospt, this.parent.position];
  //    this.parent.updatePosition(pospt);

};
EnemyShotActor.prototype.updateDeath = function() {
	if(!this.deathTimer.running)		return;

	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && !c.cycled)	{
		var dt = this.deathTimer.cycledBy + this.deathTimer.lifeTime;

		var deathDiff = dt/this.deathTimer.lifeTime;
		this.deathRadius = this.radius + 2*(deathDiff);
	}

};
EnemyShotActor.prototype.collideType = function(act) {
	if(act == this.firer)		return false;
	if(act instanceof CharActor)	return true;
	return false;
};
EnemyShotActor.prototype.collideVs = function(act) {
	if(act instanceof CharActor)
	{
		if(act.invincTimer.running)		return;

		act.health -= this.damage;
		this.beginDeath();
		act.impact(null,2.0);

		if(GAMEVIEW.BoxIsInCamera(act.absBox)) {
			var r=0.3+ 0.3*Math.random();
			var v=1.55+ 0.1*Math.random();
			this.playSound(1,v,r);
		}
	}
};



EnemyShotActor.prototype.updateCurrentAnimation = function() {
//	if(this.animateModule == null)	return;
	if(this.lastHeading.x == 0 && this.lastHeading.y == 0)	return;


};
EnemyShotActor.prototype.updateMode = function() {
};
EnemyShotActor.prototype.midStep = function(timeplace,num,step) {
};
EnemyShotActor.prototype.beginStep = function(num,step) {

};


EnemyShotActor.alloc = function() {
	var vc = new EnemyShotActor();
	vc.init();
	return vc;
};



exports.EnemyShotActor = EnemyShotActor;
exports.EnemyShotActor._loadJSEngineClasses = _loadJSEngineClasses;
