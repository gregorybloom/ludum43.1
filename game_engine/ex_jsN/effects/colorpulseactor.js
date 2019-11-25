// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ColorPulseActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function ColorPulseActor() {
}
ColorPulseActor.prototype = new Actor;
ColorPulseActor.prototype.identity = function() {
	return ('ColorPulseActor ()');
};

ColorPulseActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.deadLength = 50;

	this.entered = false;
	this.enterTime = 0;
	this.intoTime = 3000;
	this.fadeTime = 3000;

	this.heading = {x:0,y:0};

	this.size={w:1,h:1};

	this.unitSpeedX = 0.03;
	this.unitSpeedY = 0.03;
	this.radius = 1;
	this.smokeAlpha = 0.4;
	this.widthCircle = 6;

	this.widthStart = 6;
	this.widthEnd = 1;
	this.radiusStart = 3;
	this.radiusEnd = 10;
	this.alphaStart = 0.4;
	this.alphaEnd = 0.1;

	this.colorNum = 0;
	this.colorStr = "#FF0000";

	this.startTime = 0;
	this.lifeTime = 1500;
};

ColorPulseActor.prototype.update = function() {
	Actor.prototype.update.call(this);
	this.updatePosition();

//	if(this.startTime == 0)		this.startTime = GAMEMODEL.getTime();
	if(this.startTime == 0)		this.startTime = GAMEMODEL.getTime();

	var curtime = GAMEMODEL.getTime();
	var t = Math.min(1, (curtime - this.startTime)/this.lifeTime);

	this.smokeAlpha = t*(this.alphaEnd - this.alphaStart) + this.alphaStart;
	this.radius		= t*(this.radiusEnd - this.radiusStart) + this.radiusStart;
	this.widthCircle		= t*(this.widthEnd - this.widthStart) + this.widthStart;


	var newPos = {x:this.position.x,y:this.position.y};
	if(this.alive)
	{
		newPos.x += this.heading.x*this.unitSpeedX*this.ticksDiff;
		newPos.y += this.heading.y*this.unitSpeedY*this.ticksDiff;
	}
	this.updatePosition(newPos);


	this.colorStr = this.getNumericColor(this.smokeAlpha, this.colorNum, 'halo');

	if((this.startTime+this.lifeTime) <= curtime) {
		this.clear();
		this.alive = false;
	}


};

ColorPulseActor.prototype.draw = function() {

	GAMEVIEW.clearDrawMods();

 	var prop = {fill:false, color:this.colorStr,width:this.widthCircle};
    prop.source = "default";
    prop.writeTo = 3;
 	var shape = {type:"circle",radius:this.radius};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);
};



ColorPulseActor.prototype.collideType = function(act) {
	return false;
};
ColorPulseActor.prototype.collideVs = function(act) {
};



ColorPulseActor.alloc = function() {
	var vc = new ColorPulseActor();
	vc.init();
	return vc;
};



exports.ColorPulseActor = ColorPulseActor;
exports.ColorPulseActor._loadJSEngineClasses = _loadJSEngineClasses;
