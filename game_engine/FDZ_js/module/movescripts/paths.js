// CommonJS ClassLoader Hack
var classLoadList = ["MoveActorBasicPath"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["CubicBezierPath","QuadBezierPath","LinearPath"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function CubicBezierPath() {
}
CubicBezierPath.prototype = new MoveActorBasicPath;
CubicBezierPath.prototype.identity = function() {
	return ('CubicBezierPath (' +this._dom.id+ ')');
};
CubicBezierPath.prototype.init = function() {
	MoveActorBasicPath.prototype.init.call(this);
	this.ptC1={x:0,y:0};
	this.ptC2={x:0,y:0};
};


CubicBezierPath.prototype.getPosition = function(t, start, end) {
	if(t < 0 || t > 1)		return this.getPositionWithLoopPath(t, start, end);
	if(typeof this.ptC1 === "undefined" || typeof this.ptC2 === "undefined") {
		return LinearPath.prototype.getPosition.call(undefined,t,start,end);
	}

	var getPtAlongBezier = function(t,pt1,pt2,ptC1,ptC2) {
		var nx = (1-t)*(1-t)*(1-t)*pt1.x + t*t*t*pt2.x + 3*(1-t)*(1-t)*t*ptC1.x + 3*(1-t)*t*t*ptC2.x;
		var ny = (1-t)*(1-t)*(1-t)*pt1.y + t*t*t*pt2.y + 3*(1-t)*(1-t)*t*ptC1.y + 3*(1-t)*t*t*ptC2.y;
		return {x:nx,y:ny};
	};
	var nstart = {x:0,y:0};
	var nend = {x:(end.x-start.x),y:(end.y-start.y)};

	var pos = getPtAlongBezier(t,nstart,nend,this.ptC1,this.ptC2);
//	console.log(pos);
	return pos;
};
CubicBezierPath.prototype.getPathLength = function(start, end, t0, t1) {
	if(typeof this.ptC1 === "undefined" || typeof this.ptC2 === "undefined") {
		return LinearPath.prototype.getPathLength.call(undefined, start, end, t0, t1);
	}

	var a = {};
	var b = {};
	var p0 = {x:0,y:0};
	var p1 = {x:(end.x-start.x),y:(end.y-start.y)};
	var pC1 = this.ptC1;
	var pC2 = this.ptC2;
	if(t0 == 0 && t1 == 1) {
		var _bezier_point = function(t, start, control_1, control_2, end)
		{
		    /* Formula from Wikipedia article on Bezier curves. */
		   var total = start * (1.0 - t) * (1.0 - t)  * (1.0 - t)
		           + (3.0 *  control_1 * (1.0 - t) * (1.0 - t)  * t)
			   + (3.0 *  control_2 * (1.0 - t) * t          * t)
		  	   +              (end * t         * t          * t);
			 return total;
		};
		var length = 0.0;
    var steps = 10;
		var previous_dot = null;
    for (i = 0; i <= steps; i++) {
			var at = i / steps;
			var dot = {};
			dot.x = _bezier_point (at, p0.x, pC1.x,
					       pC2.x, p1.x);
			dot.y = _bezier_point (at, p0.y, pC1.y,
					       pC2.y, p1.y);
			if (i > 0) {
			    var x_diff = dot.x - previous_dot.x;
			    var y_diff = dot.y - previous_dot.y;
			    length += Math.sqrt (x_diff * x_diff + y_diff * y_diff);
			}
			previous_dot = dot;
    }
		return length;
  }
	else {
		var dt = t1-t0;

		var thisDiff = {x:0,y:0};
		thisDiff.x = dt *(end.x - start.x);
		thisDiff.y = dt *(end.y - start.y);

		var dD = Math.sqrt( thisDiff.x*thisDiff.x + thisDiff.y*thisDiff.y );
		return dD;
	}

};
CubicBezierPath.alloc = function() {
	var vc = new CubicBezierPath();
	vc.init();
	return vc;
};




function QuadBezierPath() {
}
QuadBezierPath.prototype = new MoveActorBasicPath;
QuadBezierPath.prototype.identity = function() {
	return ('QuadBezierPath (' +this._dom.id+ ')');
};
QuadBezierPath.prototype.init = function() {
	MoveActorBasicPath.prototype.init.call(this);
	this.ptB={x:0,y:0};
};


QuadBezierPath.prototype.getPosition = function(t, start, end) {
	if(t < 0 || t > 1)		return this.getPositionWithLoopPath(t, start, end);
	if(typeof this.ptB === "undefined") {
		return LinearPath.prototype.getPosition.call(undefined,t,start,end);
	}

	var getPtAlongBezier = function(t,pt1,pt2,ptB) {
		var nx = (1-t)*(1-t)*pt1.x + t*t*pt2.x + 2*(1-t)*t*ptB.x;
		var ny = (1-t)*(1-t)*pt1.y + t*t*pt2.y + 2*(1-t)*t*ptB.y;
		return {x:nx,y:ny};
	};
	var nstart = {x:0,y:0};
	var nend = {x:(end.x-start.x),y:(end.y-start.y)};

	var pos = getPtAlongBezier(t,nstart,nend,this.ptB);
//	console.log(pos);
	return pos;
};
QuadBezierPath.prototype.getPathLength = function(start, end, t0, t1) {
	if(typeof this.ptB === "undefined") {
		return LinearPath.prototype.getPathLength.call(undefined, start, end, t0, t1);
	}


	var a = {};
	var b = {};
	var p0 = {x:0,y:0};
	var p2 = {x:(end.x-start.x),y:(end.y-start.y)};
	var p1 = this.ptB;
	if(t0 == 0 && t1 == 1) {
		a.x = p0.x - 2*p1.x + p2.x;
	  a.y = p0.y - 2*p1.y + p2.y;
	  b.x = 2*p1.x - 2*p0.x;
	  b.y = 2*p1.y - 2*p0.y;
	  var A = 4*(a.x*a.x + a.y*a.y);
	  var B = 4*(a.x*b.x + a.y*b.y);
	  var C = b.x*b.x + b.y*b.y;

	  var Sabc = 2*Math.sqrt(A+B+C);
	  var A_2 = Math.sqrt(A);
	  var A_32 = 2*A*A_2;
	  var C_2 = 2*Math.sqrt(C);
	  var BA = B/A_2;

	  return ( A_32*Sabc +
	           A_2*B*(Sabc-C_2) +
	           (4*C*A-B*B)*Math.log( (2*A_2+BA+Sabc)/(BA+C_2) )
	         )/(4*A_32);
  }
	else {
		var dt = t1-t0;

		var thisDiff = {x:0,y:0};
		thisDiff.x = dt *(end.x - start.x);
		thisDiff.y = dt *(end.y - start.y);

		var dD = Math.sqrt( thisDiff.x*thisDiff.x + thisDiff.y*thisDiff.y );
		return dD;
	}

};
QuadBezierPath.alloc = function() {
	var vc = new QuadBezierPath();
	vc.init();
	return vc;
};






function LinearPath() {
}
LinearPath.prototype = new MoveActorBasicPath;
LinearPath.prototype.identity = function() {
	return ('LinearPath (' +this._dom.id+ ')');
};
LinearPath.prototype.getPosition = function(t, start, end) {
	if(t < 0 || t > 1)		return this.getPositionWithLoopPath(t, start, end);
	var pos = {x:0,y:0};
	pos.x = (end.x-start.x)*t;// + start.x;
	pos.y = (end.y-start.y)*t;// + start.y;
	return pos;
};
LinearPath.prototype.getPathLength = function(start, end, t0, t1) {
	var dt = t1-t0;

	var thisDiff = {x:0,y:0};
	thisDiff.x = dt *(end.x - start.x);
	thisDiff.y = dt *(end.y - start.y);

	var dD = Math.sqrt( thisDiff.x*thisDiff.x + thisDiff.y*thisDiff.y );
	return dD;
};
LinearPath.alloc = function() {
	var vc = new LinearPath();
	vc.init();
	return vc;
};


exports.classSet = {};
exports.classSet.CubicBezierPath = CubicBezierPath;
exports.classSet.QuadBezierPath = QuadBezierPath;
exports.classSet.LinearPath = LinearPath;

exports.classSet._loadJSEngineClasses = _loadJSEngineClasses;
