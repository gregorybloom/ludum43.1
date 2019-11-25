// CommonJS ClassLoader Hack
var classLoadList = ["ShapeObject"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["CircleShape"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function CircleShape() {
}
CircleShape.prototype = new ShapeObject;
CircleShape.prototype.identity = function() {
	return ('CircleShape (' +this._dom.id+ ')');
};
CircleShape.prototype.init = function() {
	ShapeObject.prototype.init.call(this);

	this.radius = 5;
	this.lastRadius = this.radius;
	this.update();
};
CircleShape.prototype.clear = function() {
};
CircleShape.prototype.updateBounding = function() {
     ShapeObject.prototype.updateBounding.call(this);
};
CircleShape.prototype.update = function() {
	if(this.lastRadius == this.radius)		return;
	var d = this.radius*2;
	this.size = {w:d,h:d};
	this.updateBounding();
	this.currentRadius = this.radius;
};
CircleShape.prototype.collideVs = function(act) {
	if(act instanceof ShapeObject) {}
	else {return;}
	if(typeof getpt === "undefined" || getpt == null)								getpt = false;
	if(getpt == "false" || getpt == "boolean")											getpt = false;
	if(getpt == "test" || getpt == "check")													getpt = false;

	this.update();
	var thisPt = this.getPt();

	if(act instanceof CircleShape)
	{
		act.update();
		var actPt = act.getPt();

		var pckg1 = this.getDiffs(["diffPt","diffD2"],actPt,thisPt);

		var diffR = this.radius+act.radius;
		var diffR2 = diffR*diffR;
		if(diffR2 < pckg1["diffD2"])											return false;
		else {
			if(getpt == false)										return true;

			if(getpt.includes("closest") || getpt.includes("farthest")) {
				this.getDiffs(["diffD1","diffUnitVec"],actPt,thisPt,pckg1);
			}

			var returnobj={};
			if(getpt.includes("center")) {
				returnobj['center'] = GAMEGEOM.getPtBetweenPts(actPt,thisPt);
			}
			if(getpt.includes("closest") || getpt.includes("farthest")) {
				var diffDR = diffR - pckg1["diffD1"];

				if(getpt.includes("closest")) {
					returnobj['closest'] = {};
					returnobj['closest'].x = thisPt.x + pckg1["diffPt"].x/2 - pckg1["diffUnitVec"].x*diffDR/2;
					returnobj['closest'].y = thisPt.y + pckg1["diffPt"].y/2 - pckg1["diffUnitVec"].y*diffDR/2;
				}
				if(getpt.includes("farthest")) {
					returnobj['farthest'] = {};
					returnobj['farthest'].x = thisPt.x + pckg1["diffPt"].x/2 + pckg1["diffUnitVec"].x*diffDR/2;
					returnobj['farthest'].y = thisPt.y + pckg1["diffPt"].y/2 + pckg1["diffUnitVec"].y*diffDR/2;
				}
			}
			return returnobj;
		}
		return false;
	}
};

CircleShape.alloc = function() {
	var vc = new CircleShape();
	vc.init();
	return vc;
};

exports.CircleShape = CircleShape;
exports.CircleShape._loadJSEngineClasses = _loadJSEngineClasses;
