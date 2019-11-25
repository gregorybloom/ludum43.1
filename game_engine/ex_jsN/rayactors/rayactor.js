// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["RayActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});

function RayActor() {
}
RayActor.prototype = new Actor;
RayActor.prototype.identity = function() {
	return ('RayActor (' +this._dom.id+ ')');
};
RayActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.rayParentActor = null;
  this.rayImpactActor = null;

  this.rayChain = null;
  this.rayChainNum = 0;

	this.heading = {x:0,y:0};

  this.collisionInfo = null;

	this.shortened = false;
	this.rayMaxLength = 1500;
	this.facingAngle = 0.04;

	this.rayImpact = -1;
	this.rayTip = {x:0,y:0};
	this.rayLength = this.rayMaxLength;
	this.rayOrigin = {x:0,y:0};
	this.rayHeading = this.getHeadingFromAngle(0);
  this.rayTip.x = this.rayOrigin.x + this.rayHeading.x * this.rayLength;
  this.rayTip.y = this.rayOrigin.y + this.rayHeading.y * this.rayLength;

	this.rayCollidedInto = [];
	this.rayCollidedOff = null;

	this.updatePosition();

	this.collisionModule = CollisionModule.alloc();
	this.collisionModule.parent = this;
	this.collisionModule.addShape( SegmentShape.alloc() );
	this.collisionModule.shape.pt1.x = this.rayOrigin.x;
	this.collisionModule.shape.pt1.y = this.rayOrigin.y;
	this.collisionModule.shape.pt2.x = this.rayTip.x;
	this.collisionModule.shape.pt2.y = this.rayTip.y;
};
RayActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
//	this.steps = null;
};
RayActor.prototype.collidedIntoActor = function(actor) {
	for(var i in this.rayCollidedInto) {
		if(this.rayCollidedInto[i] instanceof Actor) {
			if(this.rayCollidedInto[i].id == actor.id)		return true;
		}
	}
	return false;
};
RayActor.prototype.killRay = function() {
	if(this.rayChain instanceof RayActor)	this.rayChain.killRay();
	else if(this.rayChain instanceof Actor) {
		this.rayChain.alive = false;
		this.rayChain.clear();
	}
	this.rayChain = null;
	this.clear();
  this.alive = false;
};
RayActor.prototype.matchOrKillRay = function(pt,angle) {
	if(this.rayChain instanceof RayActor) {
		var kill = false;
		if(this.rayChain.rayOrigin.x != pt.x)	kill = true;
		if(this.rayChain.rayOrigin.y != pt.y)	kill = true;
		if(angle != null && this.rayChain.facingAngle != angle)	  kill = true;
//		if(this.rayChain.rayNumber != this.rayNumber)			    kill = true;

		if(kill)	this.rayChain.killRay();
		else		return false;
		return true;
	}
	return false;
};

RayActor.prototype.addRayAtPoint = function(pt,angle,actor) {
	if(this.rayChain instanceof RayActor) {
		var killed = this.matchOrKillRay(pt,angle);
		if(!killed)		return null;
	}

  var newBeam = RayActor.alloc();
	newBeam.setRayParams(pt,angle);

  newBeam.rayParentActor = this;
  newBeam.rayChainNum = this.rayChainNum+1;
	this.rayChain = newBeam;
  GAMEMODEL.gameSession.gameWorld.addActor(newBeam,'laser');
  GAMEMODEL.gameSession.gameWorld.addedRay = true;
  newBeam.rayImpactActor = actor;
  newBeam.update();
	return newBeam;
};
RayActor.prototype.setRayParams = function(orig,angle) {
	this.rayImpact = -1;
	this.rayTip = {x:0,y:0};
	this.rayLength = this.rayMaxLength;

	this.rayOrigin = {x:orig.x,y:orig.y};
	this.facingAngle = angle;
	this.rayHeading = this.getHeadingFromAngle(angle);
  this.rayTip.x = this.rayOrigin.x + this.rayHeading.x * this.rayLength;
  this.rayTip.y = this.rayOrigin.y + this.rayHeading.y * this.rayLength;


	this.rayTip.x = Math.round(this.rayTip.x*100)/100;	this.rayTip.y = Math.round(this.rayTip.y*100)/100;
	this.rayOrigin.x = Math.round(this.rayOrigin.x*100)/100;	this.rayOrigin.y = Math.round(this.rayOrigin.y*100)/100;
	if(this.rayTip.x == -0)	this.rayTip.x = 0;	if(this.rayTip.y == -0)	this.rayTip.y = 0;
	if(this.rayOrigin.x == -0)	this.rayOrigin.x = 0;	if(this.rayOrigin.y == -0)	this.rayOrigin.y = 0;


	this.rayCollidedInto = [];
	this.rayCollidedOff = null;

  this.size.w = this.rayMaxLength*2;
	this.size.h = this.rayMaxLength*2;

	if(this.collisionModule instanceof CollisionModule) {
		if(this.collisionModule.shape instanceof SegmentShape) {
			this.collisionModule.shape.pt1.x = this.rayOrigin.x;
			this.collisionModule.shape.pt1.y = this.rayOrigin.y;
			this.collisionModule.shape.pt2.x = this.rayTip.x;
			this.collisionModule.shape.pt2.y = this.rayTip.y;
		}
	}

	this.updatePosition(orig);
};
RayActor.prototype.cutRayPoint = function(imp,imppt) {

  var curD = GAMEGEOM.getDistance(this.rayTip,this.rayOrigin);
  var impD = GAMEGEOM.getDistance(imppt,this.rayOrigin);

  if(curD <= impD)    return false;


	this.rayImpact = imp;
	this.rayTip = {x:imppt.x,y:imppt.y};
	this.rayTip.x = Math.round(this.rayTip.x*100)/100;	this.rayTip.y = Math.round(this.rayTip.y*100)/100;
	if(this.rayTip.x == -0)	this.rayTip.x = 0;	if(this.rayTip.y == -0)	this.rayTip.y = 0;

	var Lx = (this.rayTip.x-this.rayOrigin.x);
	var Ly = (this.rayTip.y-this.rayOrigin.y);
	this.rayLength = Math.sqrt(Lx*Lx+Ly*Ly);

	if(this.rayChain instanceof RayActor) {
		var Lx = (this.rayChain.rayOrigin.x - this.rayOrigin.x);
		var Ly = (this.rayChain.rayOrigin.y - this.rayOrigin.y);
		var D = Math.sqrt(Lx*Lx+Ly*Ly);
		if( D > this.rayLength) {
			this.rayChain.killRay();
		}
	}

	if(this.collisionModule instanceof CollisionModule) {
		if(this.collisionModule.shape instanceof SegmentShape) {
			this.collisionModule.shape.pt1.x = this.rayOrigin.x;
			this.collisionModule.shape.pt1.y = this.rayOrigin.y;
			this.collisionModule.shape.pt2.x = this.rayTip.x;
			this.collisionModule.shape.pt2.y = this.rayTip.y;
		}
	}

  return true;
};
RayActor.prototype.loadingData = function(data)
{
};

RayActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
  if(!this.alive)   return;
};
RayActor.prototype.update = function() {
	Actor.prototype.update.call(this);

  if(this.rayChain instanceof RayActor) {
		if(this.rayLength==this.rayMaxLength)	this.rayChain.killRay();
		else	this.matchOrKillRay(this.rayTip,null);
		if(!this.rayChain.alive)		this.rayChain = null;
	}
  if(!this.alive)   return;

	this.size.w = this.rayMaxLength*2;
	this.size.h = this.rayMaxLength*2;
	this.updatePosition();

	var curtime = GAMEMODEL.getTime();

  this.setRayParams(this.position,this.facingAngle);
  this.rayCollidedOff = this.rayParentActor;

	if(this.rayParentActor instanceof LaserBoxActor || this.rayParentActor instanceof EnemyActor) {
	    this.updatePosition(this.rayParentActor.position);
	}
};

RayActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

RayActor.prototype.collideType = function(act) {
  if(!this.alive)         return false;
  if(!act.alive)         return false;
	if(act == this)					return false;
	if(act == this.rayParentActor)	return false;
  if(act == this.rayImpactActor)   return false;
	return false;
};

RayActor.prototype.collideVs = function(act) {

	if(act instanceof Actor && this.collideType(act))
	{
    this.collideRayVs(act);
	}
};
//RayActor.prototype.collideSegmentVs = function(act,i,laserPt) {
RayActor.prototype.collideRayVs = function(act) {
	return false;
};
RayActor.alloc = function() {
	var vc = new RayActor();
	vc.init();
	return vc;
};


exports.RayActor = RayActor;
exports.RayActor._loadJSEngineClasses = _loadJSEngineClasses;
