// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["Actor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function Actor() {
}
/*	Actor.prototype = new Module;
/**/
Actor.prototype.identity = function() {
	return ('Actor (?)');
};

Actor.prototype.init = function() {

	this.id = GAMEMODEL.makeid(15);

/*	Module.prototype.init.call(this);
/**/
	this.alive = true;
	this.size = {w:0,h:0};

	this.parent = null;

	this.baseOffset = {x:0.5,y:0.5};
	this.anchorOffset = {x:0.5,y:0.5};

	this.position = {x:0,y:0};
	this.absPosition = {x:0,y:0};

	this.box = {x:0,y:0,w:0,h:0};
	this.absBox = {x:0,y:0,w:0,h:0};

	this.actionMode = null;
	this.playingSounds = {};

	this.lastUpdateTicks = GAMEMODEL.getTime();
	this.thisUpdateTicks = GAMEMODEL.getTime();

	this.ticksDiff = 0;

	this.stepModule = null;
	this.actionModule = null;
	this.collisionModule = null;
	this.motionModule = null;
	this.animateModule = null;
	this.ranID = Math.floor(Math.random()*10000);
};


Actor.prototype.update = function() {
	if(!this.alive)		return;

	this.lastUpdateTicks = this.thisUpdateTicks;
//	this.thisUpdateTicks = GAMEMODEL.getTime();
	this.thisUpdateTicks = GAMEMODEL.getTime();
	this.ticksDiff = this.thisUpdateTicks - this.lastUpdateTicks;

	if(this.stepModule != null) 	this.stepModule.update();
	if(this.actionModule != null)	this.actionModule.update();
	if(this.collisionModule != null)	this.collisionModule.update();
	if(this.motionModule != null)	this.motionModule.update();
	if(this.animateModule != null)	this.animateModule.update();

	this.updatePosition();
};

Actor.prototype.draw = function() {
	if(!this.alive)		return;

	if(this.animateModule != null)		this.animateModule.draw();
};
Actor.prototype.clear = function() {
	if(this.stepModule)					this.stepModule.clear();
	if(this.actionModule)				this.actionModule.clear();
	if(this.collisionModule)		this.collisionModule.clear();
	if(this.motionModule)				this.motionModule.clear();
	if(this.animateModule)			this.animateModule.clear();
	this.stepModule = null;
	this.actionModule = null;
	this.collisionModule = null;
	this.motionModule = null;
	this.animateModule = null;
};
Actor.prototype.collide = function(act) {
		if(typeof act === "undefined")		return;
		if( !this.alive || !act.alive )				return;
		if(  !this.collideType(act)  )						return;

		if(this.collisionModule instanceof CollisionModule && act.collisionModule instanceof CollisionModule) {
				if(  GAMEGEOM.BoxIntersects(this.collisionModule.shape.getBounding(), act.collisionModule.shape.getBounding())==true  )
				{
						this.collideVs(act);
				}
		}
	  else if(  GAMEGEOM.BoxIntersects(this.absBox, act.absBox)==true  )
		{
				this.collideVs(act);
		}
};
Actor.prototype.collideType = function(act) {

};
Actor.prototype.collideVs = function(act) {

};
Actor.prototype.playSound = function(type,vol,rate,mods) {
	if(typeof mods === "undefined")		mods={};

	if(this.playingSounds[type] == null || typeof this.playingSounds[type] === "undefined") {

		var c = 0;
		if(GAMESOUNDS.playingSounds == null || typeof GAMESOUNDS.playingSounds === "undefined") {
			GAMESOUNDS.playingSounds = {};
		}
		while(GAMESOUNDS.playingSounds[c] != null || typeof GAMESOUNDS.playingSounds[c] !== "undefined") {
			c+=1;
		}
//		console.log('create channel #'+c+' for sound "'+type+'"');
		GAMESOUNDS.playingSounds[c]={};

		var sobj = GAMESOUNDS.makeSource(type,vol,mods);
		if(sobj == null || typeof sobj === "undefined")		return;

		var source = sobj.source;

		//  if(source == null)    delete GAMESOUNDS.playingSounds[c];
		 if(source == null)    return null;

		GAMESOUNDS.playingSounds[c] = sobj;

		sobj.time = GAMEMODEL.getTime();

		source.playbackRate.value = rate;

		this.playingSounds[type] = sobj;

		var ctx = this;
		source.onended = function() {
//			console.log('delete channel #'+c+' for sound "'+type+'"');
		    delete GAMESOUNDS.playingSounds[c];
			delete ctx.playingSounds[type];
		};
		source.start(0);
		return c;
	}

};

Actor.prototype.getAbsoluteShift = function() {
	var absShift = null;
	if(this.parent instanceof Actor)	absShift = this.parent.getAbsoluteShift();
	else 								absShift = {x:0,y:0};

	absShift.x += (this.anchorOffset.x-this.baseOffset.x) * this.size.w;
	absShift.y += (this.anchorOffset.y-this.baseOffset.y) * this.size.h;
	absShift.x += this.position.x;
	absShift.y += this.position.y;

	return absShift;
};
Actor.prototype.shiftPosition = function(shiftPos) {
	var P = {x:0,y:0};
	P.x = this.position.x+shiftPos.x;
	P.y = this.position.y+shiftPos.y;
	this.updatePosition(P);
};
Actor.prototype.updatePosition = function(newPos) {
	if(typeof newPos === "undefined")	newPos = this.position;
	var posShift = {};
	posShift.x = newPos.x + this.position.x;
	posShift.y = newPos.y + this.position.y;

	var offset = {};
	offset.x = this.baseOffset.x * this.size.w;
	offset.y = this.baseOffset.y * this.size.h;
	this.box.x = newPos.x - offset.x;
	this.box.y = newPos.y - offset.y;
	this.box.w = this.size.w;
	this.box.h = this.size.h;

	if(this.parent instanceof Actor) {
		var absShift = this.parent.getAbsoluteShift();
		this.absPosition.x = newPos.x + absShift.x;
		this.absPosition.y = newPos.y + absShift.y;
	} else {
		this.absPosition.x = newPos.x;
		this.absPosition.y = newPos.y;
	}

	this.absBox.x = this.absPosition.x - offset.x;
	this.absBox.y = this.absPosition.y - offset.y;
	this.absBox.w = this.size.w;
	this.absBox.h = this.size.h;

	this.position.x = newPos.x;
	this.position.y = newPos.y;
};





Actor.prototype.getHeadingFromAngle = function(a) {
    var P = {x:1,y:0};
    var angle = a*Math.PI/180;
    var PX = P.x;

    // Counter-clockwise rotation
    P.x = PX*Math.cos(angle) - P.y*Math.sin(angle);
    P.y = PX*Math.sin(angle) + P.y*Math.cos(angle);
    return P;
};
Actor.prototype.getHeadingAt = function(pt) {
    var P = {x:0,y:0};
    P.x = pt.x - this.absPosition.x;
    P.y = pt.y - this.absPosition.y;
    var d = Math.sqrt(P.x*P.x + P.y*P.y);
    P.x /= d;
    P.y /= d;
    return P;
};
Actor.prototype.getAngleFromHeading = function(pt) {
	var angle = Math.atan2(-pt.y, pt.x);
	var degrees = -180*angle/Math.PI;
	while(degrees < 0){degrees+=360;}
	return degrees;
};

Actor.prototype.collideBoxToCircle = function(ptC,pt1,size,rad2) {
/*	var xydir={};
	if (ptC.x < pt1.x)	xydir.x=-1;

	var d = this.distanceSquareToPt(pt2,pt1);
	var r = (rad1+rad2);
	r=r*r;

	if(d <= r) {return true;}
	else {return false;}		/**/
};
Actor.prototype.collideCircles = function(pt1,pt2,rad1,rad2) {
	var d = this.distanceSquareToPt(pt2,pt1);
	var r = (rad1+rad2);
	r=r*r;

	if(d <= r) {return true;}
	else {return false;}
};
Actor.prototype.distanceSquareToPt = function(pt2,pt1) {
	if(typeof pt1 === "undefined")	pt1=this.absPosition;
	var d1 = (pt2.x - pt1.x);
	var d2 = (pt2.y - pt1.y);
	var d = d1*d1 + d2*d2;
	return d;
};
Actor.prototype.getDotProduct = function(ptU,ptV) {
	return ((ptU.x*ptV.x)+(ptU.y*ptV.y));
};
Actor.prototype.pointInsideRect = function(ptA,ptB,ptC,ptM,mode='bydot') {
	//	AB is vector AB, with coordinates (Bx-Ax,By-Ay), and dot(U,V) is the dot product of vectors U and V: Ux*Vx+Uy*Vy.
	// 0 <= dot(AB,AM) <= dot(AB,AB) && 0 <= dot(BC,BM) <= dot(BC,BC)
	var AM = {x:(ptM.x - ptA.x),y:(ptM.y - ptA.y)};
	var BM = {x:(ptM.x - ptB.x),y:(ptM.y - ptB.y)};
	var AB = {x:(ptB.x - ptA.x),y:(ptB.y - ptA.y)};
	var BC = {x:(ptC.x - ptB.x),y:(ptC.y - ptB.y)};
	var dotABAM = this.getDotProduct(AB,AM);
	var dotABAB = this.getDotProduct(AB,AB);
	var dotBCBM = this.getDotProduct(BC,BM);
	var dotBCBC = this.getDotProduct(BC,BC);
	var inside = (0 <= dotABAM) && (dotABAM <= dotABAB) && (0 <= dotBCBM) && (dotBCBM <= dotBCBC);
	return inside;
};
Actor.prototype.pointAlongEdge = function(ptC,pt1,pt2) {
	// if counterclockwise and convex, all checks on 'left/on' = inside
	var A = -(pt2.y - pt1.y);
	var B = pt2.x - pt1.x;
	var C = -(A * pt1.x) + (B * pt1.y)
	var D = (A * ptC.x) + (B * ptC.y) + C;
	if( D > 0)		return 'left';
	if(D == 0)		return 'on';
	return 'right';
};
Actor.prototype.ClosestPointOnLine = function(ptL1, ptL2, ptX) {
	var lx2 = ptL2.x;
      var A1 = ptL2.y - ptL1.y;
      var B1 = ptL1.x - ptL2.x;
      var C1 = (ptL2.y - ptL1.y)*ptL1.x + (ptL1.x - ptL1.x)*ptL1.y;
      var C2 = -B1*ptX.x + A1*ptX.y;
      var det = A1*A1 - -B1*B1;
      var cx = 0;
      var cy = 0;
      if(det != 0) {
            cx = ((A1*C1 - B1*C2)/det);
            cy = ((A1*C2 - -B1*C1)/det);
      }else{
            cx = ptX.x;
            cy = ptX.y;
      }
      return {x:cx, y:cy};
};
Actor.prototype.PtshortestLine = function(ptX,pt1,pt2) {
	var v21 = {x:(pt2.x - pt1.x),y:(pt2.y - pt1.y)}; 		// ( Direction vector of ray, from start to end )
	var v1X = {x:(pt1.x - ptX.x),y:(pt1.y - ptX.y)}; 		//	( Vector from center sphere to ray start )

	var len2 = this.getDotProduct(v21, v21);

	//t is a number in [0,1] describing
	//the closest point on the lineseg as a blend of endpoints..
	var t = Math.max(0, Math.min(len2, this.getDotProduct(v21, v1X))) / len2;

	//cp is the position (i.e actual coordinates) of the closest point on the seg
	var cp = {x:0,y:0};
	cp.x = pt1.x + t*v21.x;
	cp.y = pt1.y + t*v21.y;

	var pccp = {x:0,y:0};
	pccp.x = cp.x - ptX.x;
	pccp.y = cp.y - ptX.y;
	var L = Math.sqrt(pccp.x*pccp.x + pccp.y*pccp.y);
	return L;
};
Actor.prototype.collideCircleToPt = function(ptCenter,radius,pt1) {
	var pccp = {x:0,y:0};
	pccp.x = ptCenter.x - pt1.x;
	pccp.y = ptCenter.y - pt1.y;
	var R = Math.sqrt(pccp.x*pccp.x + pccp.y*pccp.y);
	return (R <= radius);
};
Actor.prototype.collideCircleToLine = function(ptCenter,radius,pt1,pt2) {
	var ptP = this.ClosestPointOnLine(pt1,pt2,ptCenter);
	var pccp = {x:0,y:0};
	pccp.x = ptCenter.x - ptP.x;
	pccp.y = ptCenter.y - ptP.y;
	var D = Math.sqrt(pccp.x*pccp.x + pccp.y*pccp.y);

//	var D = this.PtshortestLine(ptCenter,pt1,pt2);
	var diff = D - radius;
	if(diff <= 0)		return true;
	return false;
};
Actor.prototype.collideCircleToRect = function(ptCenter,radius,ptA,ptB,ptC,ptD) {
	var A = this.pointInsideRect(ptA,ptB,ptC,ptCenter);
	if(A) return true;
	var arr = [ptA,ptB,ptC,ptD];
	for(i=0; i<arr.length; i++) {
		var pt1 = arr[i];
		if((i+1) < arr.length)		var pt2 = arr[i+1];
		else 											var pt2 = arr[0];
		var B = this.collideCircleToLine(ptCenter,radius,pt1,pt2);
		if(A) return true;
	}
	return false;
};
Actor.prototype.getRectFromThickLine = function(pt1,pt2,w) {
	var ptV = {x:(pt2.x - pt1.x),y:(pt2.y - pt1.y)};
	var L = Math.sqrt(ptV.x*ptV.x + ptV.y*ptV.y);
	var ptH = {x:(ptV.x/L),y:(ptV.y/L)};
	var A = this.getAngleFromHeading(ptH);

	var ptH1 = this.getHeadingFromAngle((A-90));

	var ptA = {x:pt1.x,y:pt1.y};
	ptA.x += ptH1.x*(w/2);
	ptA.y += ptH1.y*(w/2);
	var ptD = {x:pt1.x,y:pt1.y};
	ptD.x -= ptH1.x*(w/2);
	ptD.y -= ptH1.y*(w/2);

	var ptB = {x:pt2.x,y:pt2.y};
	ptB.x += ptH1.x*(w/2);
	ptB.y += ptH1.y*(w/2);
	var ptC = {x:pt2.x,y:pt2.y};
	ptC.x -= ptH1.x*(w/2);
	ptC.y -= ptH1.y*(w/2);

	return [ptA,ptB,ptC,ptD];
};
Actor.prototype.collideBoxToLine = function(ptCenter,size,pt1,pt2) {
	var testfn = function(x,y) {
			var v = (pt2.y-pt1.y)*x + (pt1.x-pt2.x)*y + (pt2.x*pt1.y) - (pt1.x*pt2.y);
			return v;
	};

	var ptA={};
	var ptB={};
	var ptC={};
	var ptD={};
	ptA.x = ptCenter.x - size.w/2;
	ptA.y = ptCenter.y - size.h/2;
	ptB.x = ptCenter.x + size.w/2;
	ptB.y = ptCenter.y - size.h/2;
	ptC.x = ptCenter.x + size.w/2;
	ptC.y = ptCenter.y + size.h/2;
	ptD.x = ptCenter.x - size.w/2;
	ptD.y = ptCenter.y + size.h/2;

	var ar=[];
	ar.push( testfn(ptA) );
	ar.push( testfn(ptB) );
	ar.push( testfn(ptC) );
	ar.push( testfn(ptD) );
	if(ar[0] > 0 && ar[1] > 0 && ar[2] > 0 && ar[3] > 0)	return false;
	if(ar[0] < 0 && ar[1] < 0 && ar[2] < 0 && ar[3] < 0)	return false;
	if(pt1.x > ptC.x && pt2.x > ptC.x)	return false;
	if(pt1.y > ptC.y && pt2.y > ptC.y)	return false;
	if(pt1.x < ptA.x && pt2.x < ptA.x)	return false;
	if(pt1.y < ptA.y && pt2.y < ptA.y)	return false;
	return true;
};
Actor.prototype.clipLineIntoBox = function(ptCenter,size,pt1,pt2) {
	var ptA={};
	var ptC={};
	ptA.x = ptCenter.x - size.w/2;
	ptA.y = ptCenter.y - size.h/2;
	ptC.x = ptCenter.x + size.w/2;
	ptC.y = ptCenter.y + size.h/2;

	var ptN1 = {x:pt1.x,y:pt1.y};
	var ptN2 = {x:pt2.x,y:pt2.y};
	if(pt1.x < ptA.x)		ptN1.x = ptA.x;
	if(pt2.x < ptA.x)		ptN2.x = ptA.x;
	if(pt1.y < ptA.y)		ptN1.y = ptA.y;
	if(pt2.y < ptA.y)		ptN2.y = ptA.y;
	if(pt1.x > ptC.x)		ptN1.x = ptC.x;
	if(pt2.x > ptC.x)		ptN2.x = ptC.x;
	if(pt1.y > ptC.y)		ptN1.y = ptC.y;
	if(pt2.y > ptC.y)		ptN2.y = ptC.y;

	return [ptN1,ptN2];
};
Actor.prototype.getPtAlongBezier = function(t,pt1,pt2,ptB) {
	var x = (1-t)*(1-t)*pt1.x + t*t*pt2.x + 2*(1-t)*t*ptB.x;
	var y = (1-t)*(1-t)*pt1.y + t*t*pt2.y + 2*(1-t)*t*ptB.y;
	return {x:x,y:y};
};
Actor.prototype.getClosestTAlongBezier = function(ptO,pt1,pt2,ptB) {
};

Actor.alloc = function() {
	var vc = new Actor();
	vc.init();
	return vc;
};


exports.Actor = Actor;
exports.Actor._loadJSEngineClasses = _loadJSEngineClasses;
