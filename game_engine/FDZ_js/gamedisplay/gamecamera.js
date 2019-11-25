// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GameCamera"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function GameCamera() {
}
GameCamera.prototype = new Actor;
GameCamera.prototype.identity = function() {
	return ('GameCamera (' +this._dom.id+ ')');
};
GameCamera.prototype.init = function() {
	Actor.prototype.init.call(this);


	this.baseSize = {w:0,h:0};
	this.displaySize = {w:0,h:0};

	this.zoom = 1.0;


	this.containArea = null;
};


GameCamera.prototype.moveCameraTo = function(pos)
{
	this.updatePosition(pos);
};
GameCamera.prototype.shiftCameraTo = function(shift)
{
	var newpos = {};
	newpos.x = this.position.x + shift.x;
	newpos.y = this.position.y + shift.y;

	this.moveCameraTo(newpos);
};

GameCamera.prototype.getCameraShift = function()
{
	var vect = {x:0,y:0};
	vect.x = this.position.x - this.size.w / 2;
	vect.y = this.position.y - this.size.h / 2;
	return vect;
};

GameCamera.prototype.update = function()
{
	this.size.w = this.baseSize.w * this.zoom;
	this.size.h = this.baseSize.h * this.zoom;
	this.updatePosition();
};
GameCamera.prototype.zoomIn = function()
{
	this.zoom = this.zoom * 0.75;
};
GameCamera.prototype.zoomOut = function()
{
	this.zoom = this.zoom / 0.75;
};


GameCamera.alloc = function() {
	var vc = new GameCamera();
	vc.init();
	return vc;
};


exports.GameCamera = GameCamera;
exports.GameCamera._loadJSEngineClasses = _loadJSEngineClasses;
