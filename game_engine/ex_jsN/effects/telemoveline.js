// CommonJS ClassLoader Hack
var classLoadList = ["EffectActor","TeleMoveShadowActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["TeleMoveLineActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function TeleMoveLineActor() {
}
TeleMoveLineActor.prototype = new EffectActor;
TeleMoveLineActor.prototype.identity = function() {
	return ('TeleMoveLineActor (' +this._dom.id+ ')');
};
TeleMoveLineActor.prototype.init = function() {
	EffectActor.prototype.init.call(this);
	this.size = {w:20,h:20};
	this.position = {x:0,y:0};

	this.baseOffset = {x:0.5,y:0.5};
	this.actionMode = "MODE_STILL";

	this.drawShift = {x:0,y:0};

  this.startPt = {x:0,y:40};
  this.endPt = {x:40,y:40};
  this.distance = 40;

  this.flickerPts = [];
  this.flickerTimes = [];

  this.lifeTimer.lifeTime = 800;
	this.fadeInTimer.lifeTime = 0;
	this.fadeOutTimer.lifeTime = 500;

  this.colorNum = 0;
	this.effectColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 5;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [6,9];
	this.alphaRange = [0.3,0.4];

	this.lineType = "player";
	this.updatePosition();
};
TeleMoveLineActor.prototype.setPoints = function(start, end) {
	var Xlow = Math.min(start.x,end.x);
	var Xhigh = Math.max(start.x,end.x);
	var Ylow = Math.min(start.y,end.y);
	var Yhigh = Math.max(start.y,end.y);

	var pos = {};
	pos.x = Xlow + (Xhigh-Xlow)/2;
	pos.y = Ylow + (Yhigh-Ylow)/2;

	this.size.w = Math.abs(Xhigh-Xlow);
	this.size.h = Math.abs(Yhigh-Ylow);

	this.updatePosition(pos);

	this.startPt = {};
	this.startPt.x = start.x - pos.x;
	this.startPt.y = start.y - pos.y;

	this.endPt = {};
	this.endPt.x = end.x - pos.x;
	this.endPt.y = end.y - pos.y;


  this.distance = Math.sqrt( this.size.w*this.size.w + this.size.h*this.size.h );

  this.flickerPts = [];
  this.flickerTimes = [];

  this.setFlickerPts();

};
TeleMoveLineActor.prototype.setFlickerPts = function() {

  var count = Math.ceil(this.distance / 50);
  var shiftV = {};
  shiftV.x = (this.endPt.x - this.startPt.x)/this.distance;
  shiftV.y = (this.endPt.y - this.startPt.y)/this.distance;

  var base = {x:this.startPt.x + this.position.x,y:this.startPt.y + this.position.y};
  for(var i=0; i<count; i++) {
    var fpt = {};
    fpt.x = base.x + (i*shiftV.x*(this.distance/count));
    fpt.y = base.y + (i*shiftV.y*(this.distance/count));
    this.flickerPts.push(fpt);
//    console.log(this.position,shiftV,this.distance,(this.distance/count),i,fpt);
  }


  for(var i in this.flickerPts) {
    var pt = this.flickerPts[i];

    var telelinecircle = TeleMoveShadowActor.alloc();
		telelinecircle.shadowType = this.lineType;
		telelinecircle.colorNum = this.colorNum;
    telelinecircle.updatePosition(pt);
    GAMEMODEL.gameSession.gameWorld.addActor(telelinecircle,'act');

    var shift = 100 * parseInt(i);
    telelinecircle.lifeTimer.lifeTime = 50 + shift;
    telelinecircle.fadeInTimer.lifeTime = 0 + shift;
    telelinecircle.fadeOutTimer.lifeTime = 150;
  }



//  this.flickerPts = [];
//  this.flickerTimes = [];
};
TeleMoveLineActor.prototype.draw = function() {
//	EffectActor.prototype.draw.call(this);
	if(!this.alive)			return;


};
TeleMoveLineActor.prototype.update = function() {
	EffectActor.prototype.update.call(this);





  var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);

	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];

  this.effectColor = this.getNumericColor(this.haloAlpha, this.colorNum, 'orb');
	this.haloColor = this.getNumericColor(this.haloAlpha, this.colorNum, "halo");

};
TeleMoveLineActor.prototype.collide = function(act) {
//	Actor.prototype.collide.call(this,act);
};
TeleMoveLineActor.prototype.collideType = function(act) {
	return false;
};
TeleMoveLineActor.prototype.collideVs = function(act) {
};

TeleMoveLineActor.alloc = function() {
	var vc = new TeleMoveLineActor();
	vc.init();
	return vc;
};



exports.TeleMoveLineActor = TeleMoveLineActor;
exports.TeleMoveLineActor._loadJSEngineClasses = _loadJSEngineClasses;
