// CommonJS ClassLoader Hack
var classLoadList = ["Actor","CharActor","BasicShotActor","EnemyActor","CheckpointActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["CamField"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


//	NOT IN USE

function CamField() {
}
CamField.prototype = new Actor;
CamField.prototype.identity = function() {
	return ('CamField (' +this._dom.id+ ')');
};
CamField.prototype.init = function() {
	Actor.prototype.init.call(this);

    this.size = {w:800,h:600};
    this.border = 75;
    this.updatePosition({x:0,y:0});

    this.borderBlock = "NESW";

    this.speedUp = 0.03;
    this.player = null;

    this.pace = 0.1;
    this.timeFrame = 0;
};

CamField.prototype.update = function() {
	Actor.prototype.update.call(this);
//	this.position.y -= this.speedUp*this.ticksDiff;
	this.updatePosition();

  var GW = GAMEMODEL.gameSession.gameWorld;
	var player = GW.gamePlayer;


  this.timeFrame += this.ticksDiff * this.pace;
//	player.shiftPosition({x:0,y:-(this.speedUp*this.ticksDiff)});


//	GAMEMODEL.modelCamera.updatePosition(this.position);
	if(GAMEMODEL.gameSession.gameCamera instanceof Actor) {
//		GAMEMODEL.gameSession.gameCamera.updatePosition(this.position);
	}
};
CamField.prototype.draw = function() {
//    GAMEVIEW.drawBox(this.absBox, "black");
};

CamField.prototype.collide = function(act) {
    if(typeof act === "undefined")      return;
    if( !this.alive || !act.alive )             return;
    if(  this.collideType(act) != true  )                           return;
    if(  GAMEGEOM.BoxContains(this.absBox, act.absBox)==false  )
    {
        this.collideVs(act);
    }
};

CamField.prototype.collideType = function(act) {
	if(act instanceof CharActor)	return true;
	if(act instanceof BasicShotActor)	return true;
	if(act instanceof EnemyActor)	return true;
	if(act instanceof CheckpointActor)	return true;
	return false;
};
CamField.prototype.collideVs = function( actor ) {
    if(actor instanceof BasicShotActor || actor instanceof EnemyActor || actor instanceof CheckpointActor) {
		if( (actor.absBox.x+100) < this.absBox.x)
		{
			actor.clear();
			actor.alive = false;
		}
	}
  /*  if(actor instanceof BasicShotActor) {
		if( this.borderBlock.indexOf("S") !== -1 )
		{
			var ptD = this.absBox.y + this.absBox.h;
			var ptactD = actor.absBox.y + actor.absBox.h;
			if(actor.deadLength)		ptactD -= actor.deadLength;
			if(ptactD > ptD)			actor.alive = false;
		}
	}	/**/
    if(actor instanceof CharActor && (GAMEGEOM.BoxContains(this.absBox, actor.absBox)==false)) {
    	if(actor.deathBegin)			return;
		var shiftpos = {x:0,y:0};
		if( actor.absBox.y < this.absBox.y && this.borderBlock.indexOf("N") !== -1)
		{
			var ptA = this.absBox.y;
			var ptactA = actor.absBox.y;
			if(ptactA < ptA)				shiftpos.y = ptA - ptactA;
		}
		if( this.borderBlock.indexOf("E") !== -1 )
		{
			var ptC = this.absBox.x + this.absBox.w;
			var ptactC = actor.absBox.x + actor.absBox.w;
			if(ptactC > ptC)				shiftpos.x = ptC - ptactC;
		}
		if( this.borderBlock.indexOf("S") !== -1 )
		{
			var ptD = this.absBox.y + this.absBox.h;
			var ptactD = actor.absBox.y + actor.absBox.h;
			if(ptactD > ptD)				shiftpos.y = ptD - ptactD;
		}
		if( actor.absBox.x < this.absBox.x && this.borderBlock.indexOf("W") !== -1 )
		{
			shiftpos.x = this.absBox.x - actor.absBox.x;
		}

		if(shiftpos.x != 0 || shiftpos.y != 0)
		{
			actor.shiftPosition(shiftpos);
		}
	}
};




CamField.alloc = function() {
	var vc = new CamField();
	vc.init();
	return vc;
};


exports.CamField = CamField;
exports.CamField._loadJSEngineClasses = _loadJSEngineClasses;
