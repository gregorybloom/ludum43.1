// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["SmokeActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function SmokeActor() {
}
SmokeActor.prototype = new Actor;
SmokeActor.prototype.identity = function() {
	return ('SmokeActor ()');
};

SmokeActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.deadLength = 50;

	this.entered = false;
	this.enterTime = 0;
	this.intoTime = 3000;
	this.fadeTime = 3000;

	this.heading = {x:0,y:1};

	this.size={w:1,h:1};

	this.unitSpeedX = 0.03;
	this.unitSpeedY = 0.03;
	this.radius = 1;
	this.smokeAlpha = 0.4;

	this.radiusStart = 3;
	this.radiusEnd = 15;
	this.alphaStart = 0.4;
	this.alphaEnd = 0.1;


	this.startTime = 0;
	this.lifeTime = 1500;
};



SmokeActor.prototype.update = function() {
	Actor.prototype.update.call(this);
	this.updatePosition();

//	if(this.startTime == 0)		this.startTime = GAMEMODEL.getTime();
	if(this.startTime == 0)		this.startTime = GAMEMODEL.getTime();

	var curtime = GAMEMODEL.getTime();
	var t = Math.min(1, (curtime - this.startTime)/this.lifeTime);

	this.smokeAlpha = t*(this.alphaEnd - this.alphaStart) + this.alphaStart;
	this.radius		= t*(this.radiusEnd - this.radiusStart) + this.radiusStart;


	var newPos = {x:this.position.x,y:this.position.y};
	if(this.alive)
	{
		newPos.x += this.heading.x*this.unitSpeedX*this.ticksDiff;
		newPos.y += this.heading.y*this.unitSpeedY*this.ticksDiff;
	}
	this.updatePosition(newPos);


	if((this.startTime+this.lifeTime) <= curtime) {
		this.clear();
		this.alive = false;
	}


};

SmokeActor.prototype.draw = function() {

	GAMEVIEW.clearDrawMods();

 	var prop = {fill:true, color:"rgba(0,0,0,"+this.smokeAlpha+")"};
    prop.source = "default";
    prop.writeTo = 3;
 	var shape = {type:"circle",radius:this.radius};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);
};



SmokeActor.prototype.collideType = function(act) {
	return false;
};
SmokeActor.prototype.collideVs = function(act) {
};



SmokeActor.alloc = function() {
	var vc = new SmokeActor();
	vc.init();
	return vc;
};



exports.SmokeActor = SmokeActor;
exports.SmokeActor._loadJSEngineClasses = _loadJSEngineClasses;
