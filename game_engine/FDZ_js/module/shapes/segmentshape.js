// CommonJS ClassLoader Hack
var classLoadList = ["ShapeObject"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["SegmentShape"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function SegmentShape() {
}
SegmentShape.prototype = new ShapeObject;
SegmentShape.prototype.identity = function() {
	return ('SegmentShape (' +this._dom.id+ ')');
};
SegmentShape.prototype.init = function() {
	ShapeObject.prototype.init.call(this);

	this.pt1 = {x:0,y:0};
	this.pt2 = {x:0,y:0};
	this.lastPt1 = {x:0,y:0};
	this.lastPt2 = {x:0,y:0};
	this.update();
};
SegmentShape.prototype.clear = function() {
};
SegmentShape.prototype.updateBounding = function() {
	ShapeObject.prototype.updateBounding.call(this);
};
SegmentShape.prototype.updateBounding = function() {
	this.boundingBox = {x1:0,y1:0,x2:0,y2:0};
	this.boundingBox.x1 = (this.pt1.x < this.pt2.x) ? this.pt1.x : this.pt2.x;
	this.boundingBox.x2 = (this.pt1.x > this.pt2.x) ? this.pt1.x : this.pt2.x;
	this.boundingBox.y1 = (this.pt1.y < this.pt2.y) ? this.pt1.y : this.pt2.y;
	this.boundingBox.y2 = (this.pt1.y > this.pt2.y) ? this.pt1.y : this.pt2.y;
};
SegmentShape.prototype.update = function() {
	if(JSON.stringify(this.pt1) === JSON.stringify(this.lastPt1)) {
		if(JSON.stringify(this.pt2) === JSON.stringify(this.lastPt2)) {
			return;
		}
	}
	this.updateBounding();
	this.lastPt1.x = this.pt1.x;
	this.lastPt1.y = this.pt1.y;
	this.lastPt2.x = this.pt2.x;
	this.lastPt2.y = this.pt2.y;
};
SegmentShape.prototype.collideVs = function(act,getpt) {
	if(act instanceof ShapeObject) {}
	else {return;}
	if(typeof getpt === "undefined" || getpt == null)								getpt = false;
	if(getpt == "false" || getpt == "boolean")											getpt = false;
	if(getpt == "test" || getpt == "check")													getpt = false;

	this.update();
	var thisPt = this.getPt();

	if(act instanceof SegmentShape)
	{
			act.update();
			var actPt = act.getPt();

			var P1 = {};			var P2 = {};			var Q1 = {};			var Q2 = {};
			P1.x = this.pt1.x + thisPt.x;			P1.y = this.pt1.y + thisPt.y;
			P2.x = this.pt2.x + thisPt.x;			P2.y = this.pt2.y + thisPt.y;
			Q1.x = act.pt1.x + actPt.x;				Q1.y = act.pt1.y + actPt.y;
			Q2.x = act.pt2.x + actPt.x;				Q2.y = act.pt2.y + actPt.y;
			var arr = [P1,P2,Q1,Q2];
			for (var i = 0, l = arr.length; i < l; i++) {
			    var obj = arr[i];
					obj.x = Math.round(obj.x*10)/10;
					obj.y = Math.round(obj.y*10)/10;
			}

			if(getpt == false) {
				return GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, false);
			}

	    var result = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
	    if(result) {
					if(getpt.includes("intersection")) {
			      var R2 = {x:result.x,y:result.y};
/*
			      var curD = GAMEGEOM.getDistance(P2,P1);
			      var impD = GAMEGEOM.getDistance(R2,P1);
			      if(curD <= impD)    return false;		/**/
						returnobj['intersection'] = R2;
					}
	    }
			return returnobj;
	}
	return false;
};

SegmentShape.alloc = function() {
	var vc = new SegmentShape();
	vc.init();
	return vc;
};

exports.SegmentShape = SegmentShape;
exports.SegmentShape._loadJSEngineClasses = _loadJSEngineClasses;
