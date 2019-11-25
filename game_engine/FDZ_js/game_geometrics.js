// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMEGEOM"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



GAMEGEOM={
};

GAMEGEOM.init = function()
{
	return true;
};

GAMEGEOM.roundOffValues = function(objval,roundval=100) {
	var newval = {};
	var arr = ['x','y','w','h','x1','x2','xc','y1','y2','yc'];
	for(var i in arr) {
		var k = arr[i];
		if(typeof objval[k] != "undefined") {
			newval[k] = Math.round(objval[k]*roundval)/roundval;
			if(newval[k] == -0)	newval[k] = 0;
		}
	}
	return newval;
};

GAMEGEOM.getPtBetweenPts = function(pt2,pt1) {
	var rpt = {x:0,y:0};
	rpt.x = (pt2.x-pt1.x)/2 + pt1.x;
	rpt.y = (pt2.y-pt1.y)/2 + pt1.y;
	return rpt;
};
GAMEGEOM.getAngleToPt = function(pt2,pt1=null) {
	if(pt1 == null) pt1 = {x:0,y:0};

	var angle = Math.atan2(-(pt2.y-pt1.y), (pt2.x-pt1.x));
	var degrees = -180*angle/Math.PI;
	degrees = Math.round(degrees*10)/10;
	degrees += 90;
	while(degrees < 0){degrees+=360;}
	while(degrees > 360){degrees-=360;}
	return degrees;
};

GAMEGEOM.rotatePoint = function(pt, ang) {
    var a = ang*Math.PI/180;
	var xnew = pt.x * Math.cos(a) + pt.y * Math.sin(a);
	var ynew = -pt.x * Math.sin(a) + pt.y * Math.cos(a);
	return {x:xnew,y:ynew};
};
GAMEGEOM.VectorMagnitude = function(v)
{
	return Math.sqrt( v.x*v.x + v.y*v.y );
};
GAMEGEOM.CircleContainsPt = function(c,r, v)
{
    var d1 = c.x-v.x;
    var d2 = c.y-v.y;
    var d = d1*d1 + d2*d2;
    if(d <= (r*r))	return true;
	return false;
};
GAMEGEOM.BoxContainsPt = function(B1, v)
{
	var ptA = {x:0,y:0};
	var ptD = {x:0,y:0};
	ptA.x = B1.x;
	ptA.y = B1.y;
	ptD.x = B1.x + B1.w;
	ptD.y = B1.y + B1.h;

	if(v.x < ptA.x || v.x > ptD.x)	return false;
	if(v.y < ptA.y || v.y > ptD.y)	return false;
	return true;
};
GAMEGEOM.BoxContains = function(B1, B2)
{
	var ptA = {x:0,y:0};
	var ptD = {x:0,y:0};
	ptA.x = B1.x;
	ptA.y = B1.y;
	ptD.x = B1.x + B1.w;
	ptD.y = B1.y + B1.h;
	var B2ptA = {x:0,y:0};
	var B2ptD = {x:0,y:0};
	B2ptA.x = B2.x;
	B2ptA.y = B2.y;
	B2ptD.x = B2.x + B2.w;
	B2ptD.y = B2.y + B2.h;

	if(B2ptA.x < ptA.x || B2ptD.x > ptD.x)	return false;
	if(B2ptA.y < ptA.y || B2ptD.y > ptD.y)	return false;
	return true;
};
GAMEGEOM.BoxIntersects = function(B1, B2)
{
	var ptA = {x:0,y:0};
	var ptD = {x:0,y:0};
	ptA.x = B1.x;
	ptA.y = B1.y;
	ptD.x = B1.x + B1.w;
	ptD.y = B1.y + B1.h;
	var B2ptA = {x:0,y:0};
	var B2ptD = {x:0,y:0};
	B2ptA.x = B2.x;
	B2ptA.y = B2.y;
	B2ptD.x = B2.x + B2.w;
	B2ptD.y = B2.y + B2.h;

	if(ptA.x >= B2ptD.x)	return false;
	if(ptD.x <= B2ptA.x)	return false;
	if(ptA.y >= B2ptD.y)	return false;
	if(ptD.y <= B2ptA.y)	return false;
	return true;
};
GAMEGEOM.isPtBetweenAB = function(Pt,A,B) {
	if( (Pt.x==A.x) && (Pt.y==A.y) )		return true;
	if( (Pt.x==B.x) && (Pt.y==B.y) )		return true;

	var Ap = GAMEGEOM.subtractPoints(Pt,A);
	var Bp = GAMEGEOM.subtractPoints(Pt,B);
	var Dap = GAMEGEOM.getDistance(Pt,A);
	var Dbp = GAMEGEOM.getDistance(Pt,B);

	Ap.x /= Dap;	Ap.y /= Dap;
	Bp.x /= Dbp;	Bp.y /= Dbp;

	if( (Ap.x==-Bp.x) && (Ap.y==-Bp.y) )		return true;
	return false;

/*	var cross = GAMEGEOM.crossProduct(  GAMEGEOM.subtractPoints(B, A), GAMEGEOM.subtractPoints(Pt, A)  );
	if( Math.abs(cross) > Number.EPSILON )		return false;
	var dot = GAMEGEOM.dotProduct(  GAMEGEOM.subtractPoints(B, A), GAMEGEOM.subtractPoints(Pt, A)  );
	if(dot < 0)		return false;

	var sqlength = (B.x-A.x)*(B.x-A.x) + (B.y-A.y)*(B.y-A.y);
	if(dot > sqlength)		return false;
	return true;	/**/
};
GAMEGEOM.BoxIntersection = function(B1, B2)
{
	x1 = B1.x;
	y1 = B1.y;
	x2 = B1.x + B1.w;
	y2 = B1.y + B1.h;
	var B2ptA = {x:0,y:0};
	var B2ptD = {x:0,y:0};
	B2ptA.x = B2.x;
	B2ptA.y = B2.y;
	B2ptD.x = B2.x + B2.w;
	B2ptD.y = B2.y + B2.h;

	if(x1 < B2ptA.x)	x1 = B2ptA.x;
	if(y1 < B2ptA.y)	y1 = B2ptA.y;
	if(x2 > B2ptD.x)	x2 = B2ptD.x;
	if(y2 > B2ptD.y)	y2 = B2ptD.y;

	if(x1 > x2 || y1 > y2)
	{
		x2 = x1;
		y2 = y1;
	}

	var Newbox = {x:x1,y:y1,w:(x2-x1),h:(y2-y1)};
	return Newbox;
};
GAMEGEOM.EllipseCircle = function(E, C) {

	var toE = {x:0,y:0};
	toE.x = E.x - C.x;
	toE.y = E.y - C.y;

	var d = Math.sqrt( toE.x*toE.x + toE.y*toE.y );
	toE.x = toE.x * (C.r/d);
	toE.y = toE.y * (C.r/d);

	var P = {x:0,y:0};
	P.x = C.x + toE.x;
	P.y = C.y + toE.y;

	return GAMEGEOM.EllipsePoint(E, P);
};
GAMEGEOM.EllipsePoint = function(E, P) {

	var Xside = (P.x - E.x);
	Xside = Xside*Xside / ( (E.w/2)*(E.w/2) );
	var Yside = (P.y - E.y);
	Yside = Yside*Yside / ( (E.h/2)*(E.h/2) );

	if( (Xside + Yside) <= 1)		return true;
	return false;
};
GAMEGEOM.getDistance = function(p1, p2) {
	var lineDiff = {};
	lineDiff.x = p2.x - p1.x;
	lineDiff.y = p2.y - p1.y;
	var lineLength = Math.sqrt((lineDiff.x*lineDiff.x) + (lineDiff.y*lineDiff.y));
	return lineLength;
};
GAMEGEOM.shortestDistanceToLineSegment = function(pt,s1,s2) {
/*	function sqr(x) { return x * x }
	function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
	function distToSegmentSquared(p, v, w) {
	  var l2 = dist2(v, w);
	  if (l2 == 0) return dist2(p, v);
	  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	  t = Math.max(0, Math.min(1, t));
	  return dist2(p, { x: v.x + t * (w.x - v.x),
	                    y: v.y + t * (w.y - v.y) });
	}
	function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
	return distToSegment(pt,s1,s2);	/**/
	function pDistance(x, y, x1, y1, x2, y2) {

	  var A = x - x1;
	  var B = y - y1;
	  var C = x2 - x1;
	  var D = y2 - y1;

	  var dot = A * C + B * D;
	  var len_sq = C * C + D * D;
	  var param = -1;
	  if (len_sq != 0) //in case of 0 length line
	      param = dot / len_sq;

	  var xx, yy;

	  if (param < 0) {
	    xx = x1;
	    yy = y1;
	  }
	  else if (param > 1) {
	    xx = x2;
	    yy = y2;
	  }
	  else {
	    xx = x1 + param * C;
	    yy = y1 + param * D;
	  }

	  var dx = x - xx;
	  var dy = y - yy;
	  return Math.sqrt(dx * dx + dy * dy);
	};
	return pDistance(pt.x,pt.y,s1.x,s1.y,s2.x,s2.y);
};
GAMEGEOM.GetClosestPointToSegment = function(ptA, ptB, ptP, segmentClamp=true) {
		var AP = GAMEGEOM.subtractPoints(ptP, ptA);
		var AB = GAMEGEOM.subtractPoints(ptB, ptA);
		var ab2 = AB.x*AB.x + AB.y*AB.y;
		var ap_ab = AP.x*AB.x + AP.y*AB.y;
		var t = ap_ab / ab2;
		if (segmentClamp)
		{
				 if (t < 0.0) t = 0.0;
				 else if (t > 1.0) t = 1.0;
		}
		var ABp = {x:(AB.x*t),y:(AB.y*t)};
		var Closest = GAMEGEOM.addPoints(ptA, ABp);
		return Closest;
};
GAMEGEOM.getClosestPtInArray = function(origin,array) {
	if(!array)		return false;
	var Dlist = [];

	var smallest = 999999;
	var smallestI = -1;

	for( i in array) {
		var pt = array[i];
		var impD = GAMEGEOM.getDistance(pt,origin);
		var obj = {'d':impD,'pt':pt};
		Dlist.push(obj);

		if(impD < smallest)	{
			smallest = impD;
			smallestI = i;
		}
	}
	if(smallestI < 0)		return false
	return Dlist[smallestI].pt;
};
GAMEGEOM.segmentVsCircle = function(linePt1,linePt2,circlept,radius) {
	var D = GAMEGEOM.shortestDistanceToLineSegment(circlept,linePt1,linePt2);

	if(D > radius)		return false;

	var ptA = GAMEGEOM.roundOffValues(linePt1);
	var ptB = GAMEGEOM.roundOffValues(linePt2);
	var _Cpt = GAMEGEOM.roundOffValues(circlept);

	if(ptA.x == ptB.x && ptA.y == ptB.y) {
		if(D == radius)		return true;
		return false;
	}


	if(ptA.x != ptB.x && ptA.y != ptB.y) {
		var m = (ptB.y - ptA.y)/(ptB.x - ptA.x);
		var bLine = ptA.y - ptA.x * m;
		var bOLine = bLine - _Cpt.y;
		var quadA = m*m+1;
		var quadB = 2*m*bOLine - 2*_Cpt.x;
		var quadC = bOLine*bOLine + _Cpt.x*_Cpt.x - radius*radius;

		var underHAT = quadB*quadB - 4*quadA*quadC;
		if(underHAT > 0) {
			var Xv1 = (-quadB+Math.sqrt(underHAT))/(2*quadA);
			var Xv2 = (-quadB-Math.sqrt(underHAT))/(2*quadA);
			var Yv1 = m*Xv1 + bLine;
			var Yv2 = m*Xv2 + bLine;
			return [{x:Xv1,y:Yv1},{x:Xv2,y:Yv2}];
		}
		else return false
	}
	else if(ptA.x == ptB.x) {
		var Xv1 = ptA.x;
		var Xv2 = ptA.x;
		var underHAT = radius*radius - (ptA.x - circlept.x)*(ptA.x - circlept.x);
		if(underHAT > 0) {
			var Yv1 = circlept.y + Math.sqrt( underHAT );
			var Yv2 = circlept.y - Math.sqrt( underHAT );
			return [{x:Xv1,y:Yv1},{x:Xv2,y:Yv2}];
		}
		else return false;
	}
	else if(ptA.y == ptB.y) {
		var Yv1 = ptA.y;
		var Yv2 = ptA.y;
		var underHAT = radius*radius - (ptA.y - circlept.y)*(ptA.y - circlept.y);
		if(underHAT > 0) {
			var Xv1 = circlept.x + Math.sqrt( underHAT );
			var Xv2 = circlept.x - Math.sqrt( underHAT );
			return [{x:Xv1,y:Yv1},{x:Xv2,y:Yv2}];
		}
		else return false;
	}

};
GAMEGEOM.doSegmentsOverlap = function(p, p2, q, q2) {
	if(!GAMEGEOM.areSegmentsParallel(p,p2,q,q2))		return false;
	var p1o = GAMEGEOM.isPtBetweenAB(p, q,q2);
	var p2o = GAMEGEOM.isPtBetweenAB(p2, q,q2);

	if(p1o || p2o)		return true;
	return false;
};
GAMEGEOM.segmentsOverlapPoints = function(p, p2, q, q2) {
	var p1o = GAMEGEOM.isPtBetweenAB(p, q,q2);
	var p2o = GAMEGEOM.isPtBetweenAB(p2, q,q2);
	var q1o = GAMEGEOM.isPtBetweenAB(q, p,p2);
	var q2o = GAMEGEOM.isPtBetweenAB(q2, p,p2);
	if(p1o && p2o)		return [p,p2];
	if(q1o && q2o)		return [q,q2];
	if(p2o && q1o)		return [q,p2];
	if(p1o && q2o)		return [q2,p];
	return false;
};
GAMEGEOM.segmentsOverlapLength = function(p, p2, q, q2) {
	var ptarr = GAMEGEOM.segmentsOverlapPoints(p,p2,q,q2);
	if(!ptarr)	return false;
	return GAMEGEOM.getDistance(ptarr[0],ptarr[1]);
};

GAMEGEOM.areSegmentsParallel = function(p, p2, q, q2) {
	if( (p2.x-p.x) == 0 && (q2.x-q.x) == 0 )		return true;
	if( (p2.x-p.x) == 0 || (q2.x-q.x) == 0 )		return false;
	var slope1 = (p2.y-p.y)/(p2.x-p.x);
	var slope2 = (q2.y-q.y)/(q2.x-q.x);
	if(slope1 == slope2)		return true;
	return false;
};

GAMEGEOM.lineSegmentIntersectsBox = function(p, size, q, q2, returnpts=false) {
	var ptA = {x:p.x,y:p.y};		var ptB = {x:p.x,y:p.y};
	var ptC = {x:p.x,y:p.y};		var ptD = {x:p.x,y:p.y};
	var arr = [ptA,ptB,ptC,ptD];
	for(var i in arr) {
		if(i==0||i==2)		{arr[i].x-=size.w/2}
		else 							{arr[i].x+=size.w/2}
		if(i<2)		{arr[i].y-=size.h/2}
		if(i>1)		{arr[i].y+=size.h/2}
	}
	var segs = [];
	for(var i=0; i<4; i++) {
		var j=(i+1)%4;
		var res = GAMEGEOM.doLineSegmentsIntersect(arr[i], arr[j], q, q2, true);
		if(res) segs.push(res);
	}
	if(segs.length == 0) {
		var B = {x:ptA.x,y:ptA.y,w:size.w,h:size.h};
		var res = GAMEGEOM.BoxContainsPt(B,q);
		if(res)	segs.push(res);
		var res = GAMEGEOM.BoxContainsPt(B,q2);
		if(res)	segs.push(res);
	}
	if(segs.length == 0)	return false;
	if(returnpts)		return segs;
	return true;
};

/***********************************/

/**
 * @author Peter Kelley
 * @author pgkelley4@gmail.com
 */

/**
 * See if two line segments intersect. This uses the
 * vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 *
 * @param {Object} p point object with x and y coordinates
 *  representing the start of the 1st line.
 * @param {Object} p2 point object with x and y coordinates
 *  representing the end of the 1st line.
 * @param {Object} q point object with x and y coordinates
 *  representing the start of the 2nd line.
 * @param {Object} q2 point object with x and y coordinates
 *  representing the end of the 2nd line.
 */
GAMEGEOM.doLineSegmentsIntersect = function(p, p2, q, q2, returnpt=false) {
	var r = GAMEGEOM.subtractPoints(p2, p);
	var s = GAMEGEOM.subtractPoints(q2, q);

	var uNumerator = GAMEGEOM.crossProduct(GAMEGEOM.subtractPoints(q, p), r);
	var denominator = GAMEGEOM.crossProduct(r, s);

	if (uNumerator == 0 && denominator == 0) {
		// They are coLlinear

		// Do they touch? (Are any of the points equal?)
		if (GAMEGEOM.equalPoints(p, q) || GAMEGEOM.equalPoints(p, q2) || GAMEGEOM.equalPoints(p2, q) || GAMEGEOM.equalPoints(p2, q2)) {
			if(!returnpt)		return true;
			else if(GAMEGEOM.equalPoints(p, q))			return p;
			else if(GAMEGEOM.equalPoints(p, q2))		return p;
			else if(GAMEGEOM.equalPoints(p2, q))		return p2;
			else if(GAMEGEOM.equalPoints(p, q2))		return p2;
		}
		// Do they overlap? (Are all the point differences in either direction the same sign)
		var returnval = !GAMEGEOM.allEqual(
				(q.x - p.x < 0),
				(q.x - p2.x < 0),
				(q2.x - p.x < 0),
				(q2.x - p2.x < 0)) ||
			!GAMEGEOM.allEqual(
				(q.y - p.y < 0),
				(q.y - p2.y < 0),
				(q2.y - p.y < 0),
				(q2.y - p2.y < 0));
		if(!returnval)			return false;
		else if(!returnpt)	return true;
		else 								return GAMEGEOM.getLineSegmentsIntersection(p,p2,q,q2);

	}

	if (denominator == 0) {
		// lines are paralell
		return false;
	}

	var u = uNumerator / denominator;
	var t = GAMEGEOM.crossProduct(GAMEGEOM.subtractPoints(q, p), s) / denominator;

	var returnval = (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);

	if(!returnval)			return false;
	else if(!returnpt)	return true;
	else 								return GAMEGEOM.getLineSegmentsIntersection(p,p2,q,q2);
};

/**
 * Calculate the cross product of the two points.
 *
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 *
 * @return the cross product result as a float
 */
GAMEGEOM.crossProduct = function(point1, point2) {
	return point1.x * point2.y - point1.y * point2.x;
};
GAMEGEOM.dotProduct = function(point1, point2) {
	return point1.x * point2.x + point1.y * point2.y;
};
/**
 * Subtract the second point from the first.
 *
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 *
 * @return the subtraction result as a point object
 */
GAMEGEOM.subtractPoints = function(point1, point2) {
	var result = {};
	result.x = point1.x - point2.x;
	result.y = point1.y - point2.y;

	return result;
};
GAMEGEOM.addPoints = function(point1, point2) {
	var result = {};
	result.x = point1.x + point2.x;
	result.y = point1.y + point2.y;

	return result;
};

/**
 * See if the points are equal.
 *
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 *
 * @return if the points are equal
 */
GAMEGEOM.equalPoints = function(point1, point2) {
	return (point1.x == point2.x) && (point1.y == point2.y)
};

/**
 * See if all arguments are equal.
 *
 * @param {...} args arguments that will be compared by '=='.
 *
 * @return if all arguments are equal
 */
GAMEGEOM.allEqual = function(arguments) {
	var firstValue = arguments[0],
		i;
	for (i = 1; i < arguments.length; i += 1) {
		if (arguments[i] != firstValue) {
			return false;
		}
	}
	return true;
};

// 	https://stackoverflow.com/questions/16140831/how-to-find-the-polygon-enclosing-a-point-from-a-set-of-lines

GAMEGEOM.getLineSegmentsIntersection = function(p, p2, q, q2) {
	var E = GAMEGEOM.subtractPoints(p2,p);
	var F = GAMEGEOM.subtractPoints(q2,q);
	var P = {x:(-E.y),y:E.x};
	var hlow = GAMEGEOM.dotProduct(F,P);
	var hhigh = GAMEGEOM.dotProduct( GAMEGEOM.subtractPoints(p,q) , P);

	if(hlow == 0)		return false;
	var h = hhigh / hlow;
	if(h <= 0)		return false;
	if(h >= 1)		return false;

	var InterPt = {};
	InterPt.x = q.x + F.x * h;
	InterPt.y = q.y + F.y * h;
	return 	InterPt;
};

exports.GAMEGEOM = GAMEGEOM;
exports.GAMEGEOM._loadJSEngineClasses = _loadJSEngineClasses;
