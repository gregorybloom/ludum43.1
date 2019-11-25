// CommonJS ClassLoader Hack
var classLoadList = ["Actor","CharActor","TelPathActor","TeleMoveLineActor","EnemyCircleBlaster","EnemySquareBlaster","EnemyJumperActor"];
classLoadList.push("LaserBoxActor","MirrorActor","OrbActor","BlockActor","SwitchActor");
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["TeleportRayActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});




function TeleportRayActor() {
}
TeleportRayActor.prototype = new Actor;
TeleportRayActor.prototype.identity = function() {
	return ('TeleportRayActor (' +this._dom.id+ ')');
};
TeleportRayActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.BASEPATHLINEFADE = 8000;


	this.laserBoxActor = null;
  this.laserReflectorActor = null;

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

  this.shortened = false;

  this.teleportHost = null;
  this.teleportPoints = null;
	this.teleportTouches = {};

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();
  this.startCount = -1;

	this.size = {w:24,h:36};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.rayType = "player";
};
TeleportRayActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
//	this.steps = null;
};
TeleportRayActor.prototype.setRayParams = function(orig,dest) {
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
TeleportRayActor.prototype.cutRayPoint = function(imp,imppt) {

  var curD = GAMEGEOM.getDistance(this.laserTip,this.laserOrigin);
  var impD = GAMEGEOM.getDistance(imppt,this.laserOrigin);
  if(curD <= impD)    return false;

  this.shortened = true;
	this.laserImpact = imp;
	this.laserTip = {x:imppt.x,y:imppt.y};

//	var angdiff = this.getAngleFromHeading(this.laserTip) - this.facingAngle;
//	if( Math.abs(angdiff%360) > 15 )	this.laserTip = {x:this.laserOrigin.x,y:this.laserOrigin.y};

	var Lx = (this.laserTip.x-this.laserOrigin.x);
	var Ly = (this.laserTip.y-this.laserOrigin.y);
	this.laserLength = Math.sqrt(Lx*Lx+Ly*Ly);

  return true;
};
TeleportRayActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

TeleportRayActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
  if(!this.alive)   return;
};
TeleportRayActor.prototype.teleport = function() {
  if(!this.teleportPoints)    return;
  var GW = GAMEMODEL.gameSession.gameWorld;
  var GP = GW.gamePlayer;

    var pospts = this.teleportPoints[0];
    var posptf = this.teleportPoints[1];
    var pospt = this.teleportPoints[2];
    var parentposition = this.teleportPoints[3];

    if(this.shortened) {
        var dstep = GAMEGEOM.getDistance(this.laserTip,this.laserOrigin);
        var dray = GAMEGEOM.subtractPoints(this.laserTip,this.laserOrigin);
        pospt.x = dray.x + this.laserOrigin.x;
        pospt.y = dray.y + this.laserOrigin.y;
        posptf.x = dray.x + this.laserOrigin.x + 2*dray.x/dstep;
        posptf.y = dray.y + this.laserOrigin.y + 2*dray.y/dstep;
    }

		for(var i in this.teleportTouches) {
			var itemact = this.teleportTouches[i]['obj'];
			if(itemact instanceof OrbActor) {
				if(this.teleportHost.colorNum == itemact.colorNum && this.teleportHost instanceof CharActor) {
					this.teleportHost.health = Math.min( (this.teleportHost.health+2), this.teleportHost.maxhealth );
				}
				this.teleportHost.colorNum = itemact.colorNum;
				itemact.alive = false;
				itemact.clear();
			}
			if(itemact instanceof EnemyCircleBlaster || itemact instanceof EnemyJumperActor || itemact instanceof CharActor) {
				itemact.health -= 2;
				if(itemact instanceof CharActor)				itemact.impact(null,4.0);
				if(itemact instanceof EnemyJumperActor)		itemact.impact(null,2.0);
//					itemact.beginDeath();
			}
		}
		this.teleportTouches={};

			if(this.rayType == "player") {
				var teleffect = TelPathActor.alloc();
				var ptarry = [pospts, posptf, pospt, parentposition];
				for(var i in ptarry) {
					ptarry[i].x = Math.round(ptarry[i].x*4)/4;
					ptarry[i].y = Math.round(ptarry[i].y*4)/4;
				}

				teleffect.setPoints(pospts, posptf, pospt, parentposition);
				teleffect.lifeTimer.lifeTime = this.BASEPATHLINEFADE;
				teleffect.colorNum = this.teleportHost.colorNum;

				if(this.teleportHost && this.teleportHost.teleCircle) {
					if(this.teleportHost instanceof CharActor)							this.teleportHost.teleCircle.pathChain.addTelePath(teleffect);
//					else if(this.teleportHost instanceof EnemyJumperActor)	this.teleportHost.teleCircle.pathChain.addTelePath(teleffect);
				}

				//                  start    end    drawend   drawstart
				GAMEMODEL.gameSession.gameWorld.addActor(teleffect,'act');
			}

  		var teleline = TeleMoveLineActor.alloc();
			teleline.lineType = this.rayType;
			teleline.colorNum = this.teleportHost.colorNum;
			if(this.rayType == "enemy")		teleline.colorNum = 17;
      teleline.setPoints(parentposition, pospt);
  		teleline.lifeTimer.lifeTime = this.BASEPATHLINEFADE;
      GAMEMODEL.gameSession.gameWorld.addActor(teleline,'act');

			if(this.rayType == "player") {
//	  		teleCircle.teleItemList[teleffect.id] = teleffect;
//				teleCircle.teleLineList.push(teleffect);
/*	  		var addList1 = teleCircle.checkLastSegment(teleffect);

				var addList2 = [];
				teleCircle.findIntersects(teleffect,addList2,"overlaptest");
				var addList3 = [];
				teleCircle.findIntersects(teleffect,addList3,"edgetest");
				var addList4 = [];
				teleCircle.findIntersects(teleffect,addList4,"intersectiontest");
				/**/
			}


  //		for(var i in addList1) teleCircle.addIntersectCircle( addList1[i], "segment" );
  //		for(var i in addList2) teleCircle.addIntersectCircle( addList2[i], "overlap" );
  //		for(var i in addList3) teleCircle.addIntersectCircle( addList3[i], "touch" );
  //		for(var i in addList4) teleCircle.addIntersectCircle( addList4[i], "intersection" );

  this.teleportHost.updatePosition(this.laserTip);
  this.teleportHost = null;
	this.alive = false;
	this.clear();
};

TeleportRayActor.prototype.update = function() {
	Actor.prototype.update.call(this);

  var diff = GAMEGEOM.subtractPoints(this.laserOrigin,this.laserTip);
  this.size.w = Math.max(2,Math.abs(diff.x));
  this.size.h = Math.max(2,Math.abs(diff.y));
	this.updatePosition();

  if(this.startCount >= 0 && this.alive) {
    if(this.teleportHost instanceof Actor)   this.teleport();
    this.alive = false;
		this.clear();
    return;
  }

	var curtime = GAMEMODEL.getTime();

  this.setRayParams(this.laserOrigin,this.laserTip);
  this.laserCollidedOff = this.laserBoxActor;

	var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);


	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];
  if(this.laserBoxActor instanceof TeleportRayActor) {
		this.haloAlpha = this.laserBoxActor.haloAlpha;
		this.haloWidth = this.laserBoxActor.haloWidth;
	}

	if(this.getNumericColor(this.haloAlpha, this.rayNumber, "laser")==false)	this.rayNumber=0;


	this.laserColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "laser");
	this.haloColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "halo");

  this.startCount+=1;
};

TeleportRayActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

TeleportRayActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(!this.alive)					return false;
	if(act == this.teleportHost)		return false;
	if(act == this.laserBoxActor)	return false;
  if(act == this.laserReflectorActor)   return false;
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

TeleportRayActor.prototype.collideVs = function(act) {

	if(act instanceof Actor && this.collideType(act))
	{
    this.collideLaserVs(act);
/*		var carry = false;
		for(var i in this.laserPoints) {
			var laserPt = this.laserPoints[i];

			var fau = this.collideSegmentVs(act,i,laserPt);
			carry = carry | fau;

			if(carry == true) {
//				recalcCollides(this,i,act,laserPt);
			}

		}   /**/
	}
};
TeleportRayActor.prototype.collideLaserVs = function(act) {

  if(act instanceof BlockActor || act instanceof EnemySquareBlaster)
	{
		if(act.deathTimer.running)		return;
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

//		if(act.solid == false)		return false;
//		if(act.transparent == true)	return false;
		var check2 = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.lineSegmentIntersectsBox(act.position, act.size, this.laserOrigin,this.laserTip, true));
			if(check2) {
				var P2 = check2;
				if(this.teleportHost instanceof CharActor || this.teleportHost instanceof EnemyBlasterActor) {
					var Ps = this.laserHeading;		Ps.x *= -this.teleportHost.radius;		Ps.y *= -this.teleportHost.radius;
					P2 = GAMEGEOM.addPoints(P2,Ps);
				}

				this.cutRayPoint(0,P2);
				this.laserCollidedInto = act;

				if(act instanceof EnemySquareBlaster)		this.teleportTouches[act.id] = {'obj':act,'pt':P2};
				return false;
			}
	}
	if(act instanceof LaserBoxActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R*R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.laserOrigin.x + this.laserHeading.x*(R/2);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(R/2);

      if( !this.cutRayPoint(0,P2) )    return false;
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
			P2.x = this.laserOrigin.x + this.laserHeading.x*(R/2);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(R/2);

			this.cutRayPoint(0,P2);
			this.laserCollidedInto = act;
			return true;
		}
	}
	if(act instanceof OrbActor || act instanceof EnemyCircleBlaster || act instanceof EnemyJumperActor || act instanceof CharActor)
	{
		if(this.rayType == "player" && act instanceof CharActor)		return false;

		if(GAMEMODEL.collideMode != "LASERTOUCH")			return false;
 		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.laserOrigin, GAMEGEOM.segmentVsCircle(this.laserOrigin,this.laserTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.laserOrigin.x + this.laserHeading.x*(check.d-R);
			P2.y = this.laserOrigin.y + this.laserHeading.y*(check.d-R);
			this.teleportTouches[act.id] = {'obj':act,'pt':P2};
			this.laserCollidedInto = act;
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
      this.laserCollidedInto = act;
		}
		return false;
	}

	return false;
};
TeleportRayActor.alloc = function() {
	var vc = new TeleportRayActor();
	vc.init();
	return vc;
};


exports.TeleportRayActor = TeleportRayActor;
exports.TeleportRayActor._loadJSEngineClasses = _loadJSEngineClasses;
