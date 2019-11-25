// CommonJS ClassLoader Hack
var classLoadList = ["RayActor","EnemyActor","LaserBeamActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["LaserBeamActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});
/*
if(act instanceof CharActor)	return true;
if(act instanceof TelPathActor) return true;
if(act instanceof MirrorActor)	return true;
if(act instanceof TeleportRayActor)	return true;
if(act instanceof BlockActor)	return true;
if(act instanceof SwitchActor)	return true;
if(act instanceof EnemySquareBlaster)	return true;
if(act instanceof EnemyCircleBlaster)	return true;
if(act instanceof EnemyJumperActor)	return true;
/**/

function LaserBeamActor() {
}
LaserBeamActor.prototype = new RayActor;
LaserBeamActor.prototype.identity = function() {
	return ('LaserBeamActor (' +this._dom.id+ ')');
};
LaserBeamActor.prototype.init = function() {
	RayActor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.ticksDiff = 0;


	this.rayNumber = 0;
	this.laserType = "NORMAL";

	this.laserColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 19;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [13,19];
	this.alphaRange = [0.1,0.4];


	this.telePassThrough = true;


	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.size = {w:24,h:36};
	this.position = {x:0,y:0};
	this.updatePosition();
};
LaserBeamActor.prototype.clear = function() {
	RayActor.prototype.clear.call(this);
//	this.steps = null;
};

LaserBeamActor.prototype.matchOrKillRay = function(pt,angle) {
	if(this.rayChain instanceof LaserBeamActor) {
		if(this.rayChain.rayNumber != this.rayNumber)			    	return true;
	}
	return RayActor.prototype.matchOrKillRay.call(this,pt,angle);
};

LaserBeamActor.prototype.addRayAtPoint = function(pt,angle,actor) {
	var newBeam = RayActor.prototype.addRayAtPoint.call(this,pt,angle,actor);
	if(newBeam == null)			return null;

  newBeam.rayNumber = this.rayNumber;

  newBeam.haloAlpha = this.haloAlpha;
	newBeam.haloWidth = this.haloWidth;
	newBeam.strobeStart = this.strobeStart;
};
LaserBeamActor.prototype.setRayParams = function(orig,angle) {
	var newBeam = RayActor.prototype.setRayParams.call(this,orig,angle);

	this.laserColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "laser");
	this.haloColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "halo");
};
LaserBeamActor.prototype.cutRayPoint = function(imp,imppt) {
	return RayActor.prototype.cutRayPoint.call(this,imp,imppt);
};
LaserBeamActor.prototype.loadingData = function(data)
{
	RayActor.prototype.loadingData.call(this,data);
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

LaserBeamActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);
  if(!this.alive)   return;

	var laserLayer = 1;

	var lparts = ["halo","spothalo","laser","spot"];
	for(var p in lparts)  {
		var partType = lparts[p];

 		if(partType=="spot" || partType=="spothalo") {
			if(this.rayImpact < 0 && !this.shortened)		continue;
 		}

    var prop = {fill:false, color:this.laserColor};
    prop.source = "default";
    prop.writeTo = laserLayer;
    prop.width = this.haloWidth;
//     if(typeof this.drawLayer !== "undefined")		prop.writeTo = this.drawLayer;

    if(partType=="spot")		prop.fill = true;
		if(partType=="spothalo")	prop.fill = true;
    if(partType=="halo")		prop.color = this.haloColor;
		if(partType=="spothalo")	prop.color = this.haloColor;
		if(partType=="laser")   	prop.width = 7;

		var originPt = this.rayOrigin;
	 	if(partType=="spot" || partType=="spothalo")	originPt = this.rayTip;


      var shape = {type:"shape",pts:[],pt:originPt};
      var transf = {};

      if(partType=="spothalo")	shape = {type:"circle",radius:(this.haloWidth/2+2)};
	 		if(partType=="spot")		  shape = {type:"circle",radius:(this.haloWidth/4+1)};
      if(partType=="laser" || partType=="halo") {
        var pts = [];
        pts.push({x:0,y:0,t:'m'});
        var pt2 = GAMEGEOM.rotatePoint({x:0,y:this.rayLength},-this.facingAngle);

        pts.push({x:pt2.x,y:pt2.y,t:'l'});
        shape.pts = pts;  /**/
      }
      if(this.rayImpact >= 0) {
        if(partType=="laser" || partType=="halo") {
          shape.pts[1].x = this.rayTip.x - this.rayOrigin.x;
          shape.pts[1].y = this.rayTip.y - this.rayOrigin.y;
        }
      }
      else {
//          transf.actions=[{type:'r',angle:laserPt.laserAngle,x:0,y:(-laserPt.rayLength/2)}];
      }

      GAMEVIEW.drawElement(originPt, shape, prop, transf);
    }
  return;

 	var prop = {};
    prop.source = "lighter";
    prop.writeTo = laserLayer;
    prop.applyTo = 1;
 	var shape = {};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
LaserBeamActor.prototype.update = function() {
	RayActor.prototype.update.call(this);


		var curStrobe = GAMEMODEL.getTime();
		var fullStrobeClock = 2*this.strobeClock;
		while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

		var diffStrobe = curStrobe - this.strobeStart;
		var D = (diffStrobe/this.strobeClock);
		if(D >= 1)	D = 1-(D-1);


		this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
		this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];
	  if(this.rayParentActor instanceof LaserBeamActor) {
			this.haloAlpha = this.rayParentActor.haloAlpha;
			this.haloWidth = this.rayParentActor.haloWidth;
		}

		if(this.getNumericColor(this.haloAlpha, this.rayNumber, "laser")==false)	this.rayNumber=0;

		if(this.rayParentActor instanceof LaserBoxActor || this.rayParentActor instanceof EnemyActor) {
		    this.updatePosition(this.rayParentActor.position);
		}

		this.laserColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "laser");
		this.haloColor = this.getNumericColor(this.haloAlpha, this.rayNumber, "halo");

};

LaserBeamActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

LaserBeamActor.prototype.collideType = function(act) {
  if(!this.alive)         return false;
  if(!act.alive)         return false;
	if(act == this)					return false;
	if(act == this.rayParentActor)	return false;
  if(act == this.laserReflectorActor)   return false;
//	if(act instanceof rayParentActor)	return true;

  if(act instanceof CharActor)	return true;
  if(act instanceof TelPathActor) return true;
  if(act instanceof MirrorActor)	return true;
  if(act instanceof TeleportRayActor)	return true;
  if(act instanceof BlockActor)	return true;
	if(act instanceof SwitchActor)	return true;
	if(act instanceof EnemySquareBlaster)	return true;
	if(act instanceof EnemyCircleBlaster)	return true;
	if(act instanceof EnemyJumperActor)	return true;

/*
	if(act instanceof DoorActor)	return true;
	if(act instanceof OrbActor)		return true;    /**/
	return false;
};

LaserBeamActor.prototype.collideVs = function(act) {

	if(act instanceof Actor && this.collideType(act))
	{
    this.collideLaserVs(act);
	}
};
//LaserBeamActor.prototype.collideSegmentVs = function(act,i,laserPt) {
LaserBeamActor.prototype.collideLaserVs = function(act) {

  if(act instanceof MirrorActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.segmentVsCircle(this.rayOrigin,this.rayTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.rayOrigin.x + this.rayHeading.x*(check.d-R);
			P2.y = this.rayOrigin.y + this.rayHeading.y*(check.d-R);
			if( !this.cutRayPoint(0,P2) )        return false;
      this.rayCollidedInto.push(act);
			var a1 = act.getAngleFromHeading(P2);
			var ao = act.getAngleFromHeading(this.rayOrigin);
			var da = a1 - ao;
			this.addLaserAtPoint(P2,(da+a1),act);
		}
		return false;
	}
  if(act instanceof TeleportRayActor) {
    if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;
    if(!act.teleportHost)   return false;
		if(this.telePassThrough)			return false;
    var fullprot = act.teleportHost.colorProtect(act.teleportHost.colorNum,this.rayNumber);
    if( fullprot )   return;

    var P1 = {x:0,y:0};
    var P2 = {x:0,y:0};
		P1.x = this.rayOrigin.x;
		P1.y = this.rayOrigin.y;
		P2.x = this.rayOrigin.x + this.rayHeading.x*this.rayMaxLength;
		P2.y = this.rayOrigin.y + this.rayHeading.y*this.rayMaxLength;

    var Q1 = {x:(act.rayOrigin.x), y:(act.rayOrigin.y)};
		var Q2 = {x:(act.rayTip.x), y:(act.rayTip.y)};
		Q1.x = Math.round(Q1.x *10)/10;		Q1.y = Math.round(Q1.y *10)/10;
		Q2.x = Math.round(Q2.x *10)/10;		Q2.y = Math.round(Q2.y *10)/10;

    var result = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
//    var check = GAMEGEOM.isPtBetweenAB(result,laserPt.rayOrigin,laserPt.rayTip);
    if(result) {
      var R2 = {x:result.x,y:result.y};

      var curD = GAMEGEOM.getDistance(this.rayTip,this.rayOrigin);
      var impD = GAMEGEOM.getDistance(R2,this.rayOrigin);
      if(curD <= impD)    return false;

      if( Math.round(R2.x*100) == Math.round(this.rayOrigin.x*100)) {
        if( Math.round(R2.y*100) == Math.round(this.rayOrigin.y*100) )    return false;
      }
			this.rayCollidedInto.push(act);
      act.cutRayPoint(0,R2);
    }
  }
  if(act instanceof TelPathActor) {
    if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;
		var links = act.chainParent.summarizeLinks(act.id);

    if(!links['_summary'])           return false;
    if(links['_summary']['_overlaps'] < act.WALL_LEVEL)    return false;

    var P1 = {x:0,y:0};
    var P2 = {x:0,y:0};
		P1.x = this.rayOrigin.x;
		P1.y = this.rayOrigin.y;
		P2.x = this.rayOrigin.x + this.rayHeading.x*800;
		P2.y = this.rayOrigin.y + this.rayHeading.y*800;

    var Q1 = {x:(act.startPt.x+act.position.x), y:(act.startPt.y+act.position.y)};
		var Q2 = {x:(act.endPt.x+act.position.x), y:(act.endPt.y+act.position.y)};
		Q1.x = Math.round(Q1.x *10)/10;		Q1.y = Math.round(Q1.y *10)/10;
		Q2.x = Math.round(Q2.x *10)/10;		Q2.y = Math.round(Q2.y *10)/10;

    var result = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
//    var check = GAMEGEOM.isPtBetweenAB(result,laserPt.rayOrigin,laserPt.rayTip);
    if(result) {
      var R2 = {x:result.x,y:result.y};

			if( !this.cutRayPoint(0,R2) )    return false;
      if( Math.round(R2.x*100) == Math.round(this.rayOrigin.x*100)) {
        if( Math.round(R2.y*100) == Math.round(this.rayOrigin.y*100) )    return false;
      }
			this.rayCollidedInto.push(act);


      if(links['_summary']['_overlaps'] >= act.MIRROR_LEVEL) {
        var R2t = {};
        R2t.x = R2.x - this.rayHeading.x*2;
        R2t.y = R2.y - this.rayHeading.y*2;
        var a1 = GAMEGEOM.getAngleToPt(R2,this.rayOrigin);
        var n = GAMEGEOM.getAngleToPt(act.normal);
  			var da = n - a1;
  			this.addLaserAtPoint(R2t,(n+da),act);

      }

    }
  }
	if(act instanceof LaserBoxActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.segmentVsCircle(this.rayOrigin,this.rayTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.rayOrigin.x + this.rayHeading.x*(check.d-R);
			P2.y = this.rayOrigin.y + this.rayHeading.y*(check.d-R);

      if( !this.cutRayPoint(0,P2) )    return false;
			this.rayCollidedInto.push(act);
			return true;
		}
	}
//	if(act instanceof BlockActor || act instanceof DoorActor)
	if(act instanceof BlockActor)
	{
		if(GAMEMODEL.collideMode != "LASERBLOCK")			return false;

		if(act.solid == false)		return false;
		if(act.transparent == true)	return false;

		var check2 = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.lineSegmentIntersectsBox(act.position, act.size, this.rayOrigin,this.rayTip, true));
			if(check2) {
				var P2s = check2;

				this.rayCollidedInto.push(act);
				this.cutRayPoint(0,P2s);
				this.rayCollidedInto.push(act);
				return true;
			}
	}
	if(act instanceof EnemyCircleBlaster || act instanceof EnemyJumperActor)
	{
		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.segmentVsCircle(this.rayOrigin,this.rayTip,act.position,R));
		if(check != false) {
			var P2 = GAMEGEOM.GetClosestPointToSegment(this.rayOrigin, this.rayTip, act.position);
			var P2s = check;

			if(GAMEMODEL.collideMode == "LASERBLOCK" || GAMEMODEL.collideMode == "EFFECTS") {
				this.rayCollidedInto.push(act);
				if(GAMEMODEL.collideMode != "EFFECTS")	this.cutRayPoint(0,P2);

				if(GAMEMODEL.collideMode == "EFFECTS")	this.cutRayPoint(0,P2s);
				if(GAMEMODEL.collideMode == "EFFECTS" && this.colorProtect(act.colorNum,this.rayNumber))		return;
				if(GAMEMODEL.collideMode == "EFFECTS")	act.beginDeath();
			}
			return false;
		}
	}
	if(act instanceof EnemySquareBlaster)
	{
		if(GAMEMODEL.collideMode == "LASERBLOCK" || GAMEMODEL.collideMode == "EFFECTS") {

			if(act.solid == false)		return false;
			if(act.transparent == true)	return false;
			var check2 = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.lineSegmentIntersectsBox(act.position, act.size, this.rayOrigin,this.rayTip, true));
				if(check2) {
					var P2 = GAMEGEOM.GetClosestPointToSegment(this.rayOrigin, this.rayTip, act.position);
					var P2s = check2;

					if(GAMEMODEL.collideMode != "EFFECTS")	this.cutRayPoint(0,P2);
					this.rayCollidedInto.push(act);

					if(GAMEMODEL.collideMode == "EFFECTS" && act.colorProtect(act.colorNum,this.rayNumber))		return false;
					if(GAMEMODEL.collideMode == "EFFECTS")	act.beginDeath();
					return true;
				}
		}
	}
	if(act instanceof SwitchActor)
	{
		if(GAMEMODEL.collideMode != "LASERTOUCH")			return false;
 		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.segmentVsCircle(this.rayOrigin,this.rayTip,act.position,R));
		if(check != false) {
			var P2 = {x:0,y:0};
			P2.x = this.rayOrigin.x + this.rayHeading.x*(check.d-R);
			P2.y = this.rayOrigin.y + this.rayHeading.y*(check.d-R);

			this.cutRayPoint(0,P2);
			this.collidedInto = act;
			act.addTouchRay(this.rayNumber);
			return true;
		}
	}
	if(act instanceof CharActor)
	{
		var R = act.radius;
		var check = GAMEGEOM.getClosestPtInArray(this.rayOrigin, GAMEGEOM.segmentVsCircle(this.rayOrigin,this.rayTip,act.position,R));
		if(check != false) {
			var P2 = GAMEGEOM.GetClosestPointToSegment(this.rayOrigin, this.rayTip, act.position);
			var P2s = check;
//			var P2 = {x:0,y:0};
//			var P2s = {x:0,y:0};

			if(GAMEMODEL.collideMode == "LASERBLOCK" || GAMEMODEL.collideMode == "EFFECTS") {
				if(GAMEMODEL.collideMode != "EFFECTS")	this.cutRayPoint(0,P2);
				this.rayCollidedInto.push(act);

				if(GAMEMODEL.collideMode == "EFFECTS")	this.cutRayPoint(0,P2s);
				if(GAMEMODEL.collideMode == "EFFECTS")	act.laserBurn(this.rayNumber,P2,this.facingAngle);
			}
			return false;
		}
	}
	return false;
};
LaserBeamActor.alloc = function() {
	var vc = new LaserBeamActor();
	vc.init();
	return vc;
};


exports.LaserBeamActor = LaserBeamActor;
exports.LaserBeamActor._loadJSEngineClasses = _loadJSEngineClasses;
