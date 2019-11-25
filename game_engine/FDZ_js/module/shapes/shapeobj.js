// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ShapeObject"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function ShapeObject() {
}
ShapeObject.prototype.identity = function() {
	return ('ShapeObject (?)');
};
ShapeObject.prototype.init = function() {
	this.parent = null;

	this.pointShift = {x:0,y:0};
	this.size = {w:0,h:0};
	this.boundingBox = {x1:0,y1:0,x2:0,y2:0};
};
ShapeObject.prototype.clear = function() {
};
ShapeObject.prototype.update = function() {

};
ShapeObject.prototype.updateBounding = function() {
	var w = this.size.w;
	var h = this.size.h;
	this.boundingBox = {x1:-w/2,y1:-h/2,x2:w/2,y2:h/2};
};
ShapeObject.prototype.getBounding = function() {
	var bBox = Object.assign({}, this.boundingBox);
	var pPt = this.getPt();
	bBox.x1 += pPt.x;
	bBox.y1 += pPt.y;
	bBox.x2 += pPt.x;
	bBox.y2 += pPt.y;
	return bBox;
};
ShapeObject.prototype.getPt = function() {
	if(this.parent == null)	return null;

	if(this.parent instanceof CollisionModule) {}
	else if(this.parent instanceof Actor) {}
	else {return null;}

	if(this.parent.parent != null) {}
	else if(this.parent instanceof Actor) {}
	else {return null;}

	var ptval={x:this.pointShift.x,y:this.pointShift.y};

	var targetpt=null;
	if(this.target && this.target instanceof CollisionModule)	{
		if(this.target.target && this.target.target instanceof Actor)				targetpt = this.target.target.absPosition;
		else if(this.target.parent && this.target.parent instanceof Actor)	targetpt = this.target.parent.absPosition;
	}
	else if(this.parent && this.parent instanceof CollisionModule)	{
		if(this.parent.target && this.parent.target instanceof Actor)				targetpt = this.parent.target.absPosition;
		else if(this.parent.parent && this.parent.parent instanceof Actor)	targetpt = this.parent.parent.absPosition;
	}
	else if(this.target && this.target instanceof Actor)			targetpt = this.target.absPosition;
	else if(this.parent && this.parent instanceof Actor)			targetpt = this.parent.absPosition;

	if(targetpt) {
		ptval.x+=targetpt.x;
		ptval.y+=targetpt.y;
	}

	return ptval;
};

ShapeObject.prototype.getDiffs = function(sets,pt2,pt1,passin) {
	var retobj={};

	if(typeof passin !== "undefined") {
		retobj=passin;
/*		var arr=["diffPt","diffD2","diffD1"];
		arr.forEach(function(entry,index) {
			if(passin[entry] != undefined)	retobj[entry] = passin[entry];
		});	/**/
	}

	if(sets.indexOf("diffPt") >= 0) {
		retobj['diffPt'] = {x:0,y:0};
		retobj['diffPt'].y = pt2.y - pt1.y;
		retobj['diffPt'].x = pt2.x - pt1.x;
	}
	if(sets.indexOf("diffD2") >= 0) {
		if(retobj["diffPt"] != undefined)		retobj['diffD2'] = retobj['diffPt'].x*retobj['diffPt'].x + retobj['diffPt'].y*retobj['diffPt'].y;
		else 																retobj['diffD2'] = (pt2.x-pt1.x)*(pt2.x-pt1.x) + (pt2.y-pt1.y)*(pt2.y-pt1.y);
	}
	if(sets.indexOf("diffD1") >= 0) {
		if(retobj["diffD2"] != undefined)				retobj['diffD1']=Math.sqrt(retobj['diffD2']);
		else if(retobj["diffPt"] != undefined)	retobj['diffD1']=Math.sqrt(retobj['diffPt'].x*retobj['diffPt'].x + retobj['diffPt'].y*retobj['diffPt'].y);
		else 																		retobj['diffD1']=Math.sqrt(  (pt2.x-pt1.x)*(pt2.x-pt1.x) + (pt2.y-pt1.y)*(pt2.y-pt1.y)  );
	}
	if(sets.indexOf("diffUnitVec") >= 0) {
		if(retobj["diffPt"] != undefined) {
			if(retobj["diffD1"] != undefined)				var D1 = retobj["diffD1"];
			else if(retobj["diffD2"] != undefined)	var D1 = Math.sqrt(retobj['diffD2']);

			retobj['diffUnitVec'] = {};
			retobj['diffUnitVec'].x = retobj["diffPt"].x/D1;
			retobj['diffUnitVec'].y = retobj["diffPt"].y/D1;
		}
	}
	return retobj;
};
ShapeObject.prototype.collideVs = function(act,getpt) {
};
ShapeObject.prototype.collideShapes = function(act) {
};
ShapeObject.alloc = function() {
	var vc = new ShapeObject();
	vc.init();
	return vc;
};


exports.ShapeObject = ShapeObject;
exports.ShapeObject._loadJSEngineClasses = _loadJSEngineClasses;
