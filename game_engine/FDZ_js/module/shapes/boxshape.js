// CommonJS ClassLoader Hack
var classLoadList = ["ShapeObject"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["BoxShape"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function BoxShape() {
}
BoxShape.prototype = new ShapeObject;
BoxShape.prototype.identity = function() {
	return ('BoxShape (' +this._dom.id+ ')');
};
BoxShape.prototype.init = function() {
	ShapeObject.prototype.init.call(this);

	this.size = {w:5,h:5};
	this.lastSize = {w:5,h:5};
	this.update();
};
BoxShape.prototype.clear = function() {
};
BoxShape.prototype.updateBounding = function() {
	ShapeObject.prototype.updateBounding.call(this);
};
BoxShape.prototype.update = function() {
	if(JSON.stringify(this.size) === JSON.stringify(this.lastSize))		return;
	this.updateBounding();
	this.lastSize.w = this.size.w;
	this.lastSize.h = this.size.h;
};
BoxShape.prototype.collideVs = function(act,getpt) {
	if(act instanceof ShapeObject) {}
	else {return;}
	if(typeof getpt === "undefined" || getpt == null)								getpt = false;
	if(getpt == "false" || getpt == "boolean")											getpt = false;
	if(getpt == "test" || getpt == "check")													getpt = false;

	this.update();
	var thisPt = this.getPt();

	if(act instanceof BoxShape)
	{
			var returnobj = {};

			act.update();
			var actPt = act.getPt();

			var thisAx = thisPt.x-this.size.w/2;			var actAx = actPt.x-act.size.w/2;
			var thisBx = thisPt.x+this.size.w/2;			var actBx = actPt.x+act.size.w/2;
			if( thisBx < actAx )			return false;
			if( thisAx > actBx )			return false;
			var thisAy = thisPt.y-this.size.h/2;			var actAy = actPt.y-act.size.h/2;
			var thisCy = thisPt.y+this.size.h/2;			var actCy = actPt.y+act.size.h/2;
			if( thisCy < actAy )			return false;
			if( thisAy > actCy )			return false;

			if(getpt == false)			return true;

			if(getpt.includes("intersection")) {
					var intAx = (thisAx < actAx) ? actAx : thisAx;
					var intBx = (thisBx > actBx) ? actBx : thisBx;

					var intAy = (thisAy < actAy) ? actAy : thisAy;
					var intCy = (thisCy > actCy) ? actCy : thisCy;

					returnobj['intersection'] = {x1:intAx,x2:intBx,y1:intAy,y2:intCy, w:Math.abs(intBx-intAx),h:Math.abs(intCy-intAy), xc:(intBx+intAx)/2,yc:(intCy+intAy)/2};
			}
			return returnobj;
	}
	return false;
};

BoxShape.alloc = function() {
	var vc = new BoxShape();
	vc.init();
	return vc;
};

exports.BoxShape = BoxShape;
exports.BoxShape._loadJSEngineClasses = _loadJSEngineClasses;
