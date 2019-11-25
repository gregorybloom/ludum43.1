// CommonJS ClassLoader Hack
var classLoadList = ["Actor","OrbActor","LaserBoxActor","SwitchActor","BlockActor","TelPathActor"];
classLoadList.push("EnemySquareBlaster","EnemyCircleBlaster","EnemyJumperActor");
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["StepRayActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});




function StepRayActor() {
}
StepRayActor.prototype = new Actor;
StepRayActor.prototype.identity = function() {
	return ('StepRayActor (' +this._dom.id+ ')');
};
StepRayActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.rayParentActor = null;
  this.rayReflectorActor = null;

	this.ticksDiff = 0;
	this.facingAngle = 0;
	this.heading = {x:0,y:0};

  this.collisionInfo = null;

	this.laserMaxLength = 1500;
//	this.laserPoints = [];
	this.facingAngle = 0.04;

	this.rayNumber = 0;
  this.laserImpact = -1;
	this.laserTip = {x:0,y:0};
	this.laserLength = this.laserMaxLength;
	this.laserOrigin = {x:0,y:0};
	this.laserHeading = this.getHeadingFromAngle(0);
  this.laserTip.x = this.laserOrigin.x + this.laserHeading.x * this.laserLength;
  this.laserTip.y = this.laserOrigin.y + this.laserHeading.y * this.laserLength;

	this.laserCollidedInto = null;
	this.laserCollidedOff = null;

	this.laserColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 19;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [13,19];
	this.alphaRange = [0.1,0.4];

	this.teleported = false;
  this.shortened = false;

  this.teleportHost = null;
//  this.teleportPoints = null;
	this.teleportTouches = {};

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();
  this.startCount = -1;

	this.size = {w:24,h:36};
	this.position = {x:0,y:0};
	this.updatePosition();
};
StepRayActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.rayReflectorActor = null;
//	this.steps = null;
};
StepRayActor.prototype.setRayPoint = function(orig,dest) {
	this.startCount = -1;
	this.teleported = false;
	this.shortened = false;

	this.laserImpact = -1;
	this.laserTip = {x:0,y:0};
	this.laserLength = this.laserMaxLength;

	this.laserOrigin = {x:orig.x,y:orig.y};
  this.laserTip = {x:dest.x,y:dest.y};

  var btwn = GAMEGEOM.getPtBetweenPts(orig,dest);
  this.updatePosition(btwn);
  var diff = GAMEGEOM.subtractPoints(orig,dest);
  this.size.w = Math.max(2,Math.abs(diff.x));
  this.size.h = Math.max(2,Math.abs(diff.y));

	this.facingAngle = GAMEGEOM.getAngleToPt(dest,orig);
	this.laserHeading = this.getHeadingFromAngle(this.facingAngle+180);
	this.laserCollidedInto = null;
	this.laserCollidedOff = null;

	this.laserColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "laser");
	this.haloColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "halo");
};
StepRayActor.prototype.cutRayPoint = function(imp,imppt) {

  var curD = GAMEGEOM.getDistance(this.laserTip,this.laserOrigin);
  var impD = GAMEGEOM.getDistance(imppt,this.laserOrigin);
  if(curD <= impD)    return false;

  this.shortened = true;
	this.laserImpact = imp;
	this.laserTip = {x:imppt.x,y:imppt.y};

	var Lx = (this.laserTip.x-this.laserOrigin.x);
	var Ly = (this.laserTip.y-this.laserOrigin.y);
	this.laserLength = Math.sqrt(Lx*Lx+Ly*Ly);

  return true;
};
StepRayActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

StepRayActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
  if(!this.alive)   return;
};
StepRayActor.prototype.teleport = function() {
//  if(!this.teleportPoints)    return;
	this.teleported = true;
  var GW = GAMEMODEL.gameSession.gameWorld;
  var GP = GW.gamePlayer;
  var teleCircle = GP.teleCircle;

		var impact = false;
		for(var i in this.teleportTouches) {
			var itemact = this.teleportTouches[i]['obj'];
			if(itemact instanceof OrbActor || itemact instanceof LaserBoxActor|| itemact instanceof SwitchActor) {
				impact = "basic";
			}
			if(itemact instanceof BlockActor) {
				impact = "basic";
			}
			if(itemact instanceof TelPathActor) {
				var links = itemact.chainParent.summarizeLinks(itemact.id);
				if(links['_summary']['_overlaps'] >= itemact.WALL_LEVEL)		impact = "basic";
				if(links['_summary']['_overlaps'] >= itemact.MIRROR_LEVEL) {
					impact = "reflect";
					this.laserHeading = this.teleportTouches[i]['ref'];
					this.facingAngle = this.teleportTouches[i]['angle'];
					this.teleportHost.heading = this.laserHeading;
					break;
				}
			}
			if(itemact instanceof EnemySquareBlaster) {
				impact = "basic";
			}
			if(itemact instanceof EnemyCircleBlaster) {
					itemact.health -= 2;
					impact = "basic";
			}
			if(itemact instanceof EnemyJumperActor) {
					itemact.health -= 0.5;
					itemact.impact(null,2.0);
					impact = "basic";
			}
		}
/**/
  this.teleportHost.updatePosition(this.laserTip);

	if(impact == "basic") 				this.teleportHost.beginDeath();
//	if(impact == "reflect")			this.teleportHost.beginDeath();

	this.teleportTouches={};
};

StepRayActor.prototype.update = function() {
	Actor.prototype.update.call(this);
	if(this.teleportHost == null)				this.alive = false;
	else if(!this.teleportHost.alive)		this.alive = false;
	if(!this.alive)		this.clear();
	if(!this.alive)		return;

  var diff = GAMEGEOM.subtractPoints(this.laserOrigin,this.laserTip);
  this.size.w = Math.max(2,Math.abs(diff.x));
  this.size.h = Math.max(2,Math.abs(diff.y));
	this.updatePosition();

  if(this.alive && !this.teleported) {
    if(this.teleportHost instanceof Actor)   this.teleport();
//    this.alive = false;
    return;
  }

	var curtime = GAMEMODEL.getTime();

//  this.setRayPoint(this.laserOrigin,this.laserTip);
  this.laserCollidedOff = this.rayParentActor;

	var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);


	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];
  if(this.rayParentActor instanceof StepRayActor) {
		this.haloAlpha = this.rayParentActor.haloAlpha;
		this.haloWidth = this.rayParentActor.haloWidth;
	}

	if(this.getNumericColor(this.haloAlpha, this.rayNumber, "laser")==false)	this.rayNumber=0;

	this.laserColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "laser");
	this.haloColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "halo");

  this.startCount+=1;
};

StepRayActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

StepRayActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(act == this.rayParentActor)	return false;
  if(act == this.rayReflectorActor)   return false;
	if(this.teleportHost instanceof Actor && !this.rayReflectorActor && this.teleportHost.firer == act)		return false;
	if(act instanceof LaserBoxActor)	return true;
  if(act instanceof CharActor)	return true;
  if(act instanceof TelPathActor) return true;
  if(act instanceof MirrorActor)	return true;
  if(act instanceof BlockActor)	return true;
	if(act instanceof SwitchActor)	return true;

	if(act instanceof OrbActor)		return true;
	if(act instanceof EnemyCircleBlaster)		return true;
	if(act instanceof EnemySquareBlaster)		return true;
	if(act instanceof EnemyJumperActor)		return true;

/*
	if(act instanceof DoorActor)	return true;/**/
	return false;
};

StepRayActor.prototype.collideVs = function(act) {

	if(act instanceof Actor && this.collideType(act))
	{
    this.collideLaserVs(act);
	}
};
//StepRayActor.prototype.collideSegmentVs = function(act,i,laserPt) {
StepRayActor.prototype.collideLaserVs = function(act) {

  if(act instanceof BlockActor || act instanceof EnemySquareBlaster)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var check2 = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.lineSegmentIntersectsBox(act.position, act.size, this.laserOrigin,this.laserTip, true));
		if(check2) {
			var P2s = check2;
			this.cutRayPoint(0,P2s);
			this.laserCollidedInto = act;
			return false;
		}
	}
	if(act instanceof LaserBoxActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.laserOrigin.x + this.laserHeading.x*(check.d-R/2);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(check.d-R/2);

      if( !this.cutRayPoint(0,P2) )    return false;
			this.teleportTouches[act.id] = {'obj':act,'pt':P2};
      this.laserCollidedInto = act;
			return true;
		}
	}
	if(act instanceof SwitchActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;
 		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.laserOrigin.x + this.laserHeading.x*(check.d-R);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(check.d-R);

			this.cutRayPoint(0,P2);
			this.teleportTouches[act.id] = {'obj':act,'pt':P2};
			this.collidedInto = act;
			return true;
		}
	}
	if(act instanceof CharActor)
	{
		if(GAMEMODEL.collideMode != "LASERTOUCH")			return false;
 		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.laserOrigin.x + this.laserHeading.x*(check.d-R);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(check.d-R);
			if( !this.cutRayPoint(0,P2) )        return false;
			this.teleportTouches[act.id] = {'obj':act,'pt':P2};
			this.collidedInto = act;
			return true;
		}
	}
	if(act instanceof OrbActor || act instanceof EnemyCircleBlaster || act instanceof EnemyJumperActor)
	{
//		if(GAMEMODEL.collideMode != "LASERTOUCH")			return false;
 		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R));
		if(check != false) {
//			var P2 = {x:0,y:0};
//			P2.x = this.laserOrigin.x + this.laserHeading.x*(check.d-R);
//			P2.y = this.laserOrigin.y + this.laserHeading.y*(check.d-R);
			if( !this.cutRayPoint(0,check) )        return false;
			this.teleportTouches[act.id] = {'obj':act,'pt':check};
			this.collidedInto = act;
			return true;
		}
	}
  if(act instanceof MirrorActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.laserOrigin.x + this.laserHeading.x*(check.d-R);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(check.d-R);
			if( !this.cutRayPoint(0,P2) )        return false;
//						this.teleportTouches[act.id] = {'obj':act,'pt':P2};
      this.laserCollidedInto = act;
		}
		return false;
	}

  if(act instanceof TelPathActor) {
    if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var links = act.chainParent.summarizeLinks(act.id);
		if(!links['_summary'])    				return false;
    if(links['_summary']['_overlaps'] < act.WALL_LEVEL)    return false;

    var P1 = {x:0,y:0};
    var P2 = {x:0,y:0};
		P1.x = this.laserOrigin.x;
		P1.y = this.laserOrigin.y;
		P2.x = this.laserOrigin.x + this.laserHeading.x*800;
		P2.y = this.laserOrigin.y + this.laserHeading.y*800;

    var Q1 = {x:(act.startPt.x+act.position.x), y:(act.startPt.y+act.position.y)};
		var Q2 = {x:(act.endPt.x+act.position.x), y:(act.endPt.y+act.position.y)};
		Q1.x = Math.round(Q1.x *10)/10;		Q1.y = Math.round(Q1.y *10)/10;
		Q2.x = Math.round(Q2.x *10)/10;		Q2.y = Math.round(Q2.y *10)/10;

    var result = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
//    var check = GAMEGEOM.isPtBetweenAB(result,laserPt.laserOrigin,laserPt.laserTip);
    if(result) {
      var R2 = {x:result.x,y:result.y};
			var R2t = { x:(R2.x-this.laserHeading.x*2),y:(R2.y-this.laserHeading.y*2) };

			if( !this.cutRayPoint(0,R2t) )    return false;
      if( Math.round(R2.x*100) == Math.round(this.laserOrigin.x*100)) {
        if( Math.round(R2.y*100) == Math.round(this.laserOrigin.y*100) )    return false;
      }
			this.teleportTouches[act.id] = {'obj':act,'pt':R2};
			if(links['_summary']['_overlaps'] >= act.MIRROR_LEVEL) {
        var a1 = GAMEGEOM.getAngleToPt(R2,this.laserOrigin);
        var n = GAMEGEOM.getAngleToPt(act.normal);
  			var da = n - a1;
				var H = this.getHeadingFromAngle(n+da);
				this.teleportTouches[act.id]['ref'] = H;
				this.teleportTouches[act.id]['angle'] = n+da;

				this.rayReflectorActor = act;
			}

      this.laserCollidedInto = act;
    }
  }			/**/
	return false;
};
StepRayActor.alloc = function() {
	var vc = new StepRayActor();
	vc.init();
	return vc;
};



exports.StepRayActor = StepRayActor;
exports.StepRayActor._loadJSEngineClasses = _loadJSEngineClasses;
