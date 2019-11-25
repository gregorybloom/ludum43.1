// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","Actor","CharActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["OrbActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function OrbActor() {
}
OrbActor.prototype = new Actor;
OrbActor.prototype.identity = function() {
	return ('OrbActor (' +this._dom.id+ ')');
};
OrbActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;
	this.itemClass = "ORB";
//	this.itemType = 0;

	this.scoreValue = 0;

	this.colorNum = 0;
	this.orbColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 5;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [4,7];
	this.alphaRange = [0.1,0.4];

	this.deathTimer = TimerObj.alloc();
	this.deathTimer.lifeTime = 8000;
	this.deathTimer.looping = false;


	this.lifelineTimer = TimerObj.alloc();
	this.lifelineTimer.lifeTime = 8000;
	this.lifelineTimer.looping = false;


	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.radius = 11;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.collisionModule = CollisionModule.alloc();
	this.collisionModule.parent = this;
	this.collisionModule.addShape( CircleShape.alloc() );
	this.collisionModule.shape.radius = this.radius;
};
OrbActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
OrbActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

OrbActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);


		if(this.itemClass == "ITEMBIT" || this.itemClass == "ITEMORB" || this.itemClass == "ORB") {

			var prop = {fill:true, color:"#EEEEEE", width:1};
			prop.source = "default";
			prop.writeTo = 1;
			var shape = {type:"circle",radius:this.radius};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);



			var c = this.lifelineTimer.getCycle();
			if(this.lifelineTimer.running && !c.cycled)	{
					var t = (c.time + this.lifelineTimer.lifeTime)/this.lifelineTimer.lifeTime;
					orbColor = this.getNumericColor(1-t,this.colorNum,'halo');
					var prop = {fill:false, color:orbColor, width:(this.radius/2+2)};
					prop.source = "default";
					prop.writeTo = 1;
					var shape = {type:"circle",radius:(2*this.radius/5)};
					var transf = {};
					GAMEVIEW.drawElement(this.position, shape, prop, transf);
			}

			var orbColor = this.getNumericColor(1,this.colorNum,'laser');
			var prop = {fill:true, color:orbColor, width:1};
			prop.source = "default";
			prop.writeTo = 1;
			var shape = {type:"circle",radius:this.radius/4};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);


			var WIDTH = 0.5;
			if(this.itemClass == "ITEMORB")		WIDTH = 1;

			var prop = {fill:false, color:"#000000", width:WIDTH};
			if(this.player == null && this.itemClass == "ITEMORB")					prop.color = "rgba(0,0,0,0.65)";
			prop.source = "default";
			prop.writeTo = 1;
			var shape = {type:"circle",radius:this.radius};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);

			if(this.deathTimer.running) {
				var c = this.deathTimer.getCycle();
				var t = c.time + this.deathTimer.lifeTime;
				var a = 0.35;
				if(t < 4000 && (t%1000 > 500) )			a = 0;
				else if(t < 6000 && (t%500 > 250) )	a = 0;
				else if( (t%300 > 150) )	a = 0;
				var prop = {fill:true, color:"rgba(0,0,0,"+a+")", width:1};
				prop.source = "default";
				prop.writeTo = 1;
				var shape = {type:"circle",radius:this.radius};
				var transf = {};
				GAMEVIEW.drawElement(this.position, shape, prop, transf);

			}


			if(this.player == null) {
				var prop = {fill:false, color:"#000000", width:WIDTH};
				prop.source = "default";
				prop.writeTo = 1;
				var shape = {type:"box",width:this.radius*1.5,height:this.radius*1.5};
				prop.color = "rgba(0,0,0,0.5)";
				var transf = {};
				GAMEVIEW.drawElement(this.position, shape, prop, transf);
			}

/*
			if(this.noTouchTimer.running) {
				var c = this.noTouchTimer.getCycle();
				var r = (c.time + this.noTouchTimer.lifeTime)/this.noTouchTimer.lifeTime;
				r = Math.abs((r*10)%2-1);
				var color = "rgba(255,255,255,"+(r*0.5+0.3)+")";
	//			GAMEVIEW.fillCircle(this.absPosition,this.radius,);
				var prop = {fill:true, color:color, width:WIDTH};
				prop.source = "default";
				prop.writeTo = 2;
				var shape = {type:"circle",radius:this.radius};
				var transf = {};
				GAMEVIEW.drawElement(this.position, shape, prop, transf);

			}		/**/

		}
/*
	var startRad = this.radius/2;

 	var prop = {fill:true, color:this.haloColor};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"circle",radius:(startRad+this.haloWidth)};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

 	var prop = {fill:true, color:this.haloColor};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"circle",radius:(startRad+this.haloWidth/2)};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);


 	var prop = {fill:true, color:this.orbColor, width:1};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"circle",radius:startRad};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);



 	var prop = {fill:false, color:"#000000", width:1.5};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"circle",radius:this.radius};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

/**/
//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
OrbActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.lifelineTimer.update();
	this.deathTimer.update();

	if(!this.lifelineTimer.running) {
		this.lifelineTimer.startTimer();
		this.lifelineTimer.update();
	}

	var c = this.lifelineTimer.getCycle();
	if(this.lifelineTimer.running && !this.deathTimer.running && c.cycled)	{
		this.deathTimer.startTimer();
		this.deathTimer.update();
	}
	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && c.cycled)	{
		this.killOrb();
	}

	this.updatePosition();

	var curtime = GAMEMODEL.getTime();

	if(this.itemClass == "ITEMBIT") {
		this.radius = 7*1.5;
	}
	if(this.itemClass == "ITEMORB") {
		this.radius = 12*1.5;
	}


	var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);

	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];


	this.orbColor = this.getNumericColor(this.haloAlpha, this.colorNum, 'orb');
	this.haloColor = this.getNumericColor(this.haloAlpha, this.colorNum, "halo");

};
OrbActor.prototype.killOrb = function() {
	if(!this.alive)		return;
	if(this.parentGrid instanceof BaseGrid) {
			var namept = this.parentGrid.getObjectLocation(this);
			if(typeof namept !== "undefined" ) {
				var PLSE = ColorPulseActor.alloc();
				PLSE.colorNum = this.colorNum;
				PLSE.colorStr = PLSE.getNumericColor(PLSE.smokeAlpha, PLSE.colorNum, 'halo');
				PLSE.lifeTime = 700;
				PLSE.radiusStart = this.radius;
				PLSE.radiusEnd = this.radius*2;
				this.parentGrid.addObject('pulse',PLSE,namept);

				var GW = GAMEMODEL.gameSession.gameWorld;
				GAMEMODEL.gameSession.gameWorld.addActor(PLSE,'act');
			}
	}
	this.clear();
	this.alive = false;
};
OrbActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

OrbActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(act instanceof CharActor)	return true;
	if(act instanceof BoxShiftActor)	return true;
	return false;
};
OrbActor.prototype.collideVs = function(act) {
	if(act instanceof CharActor)
	{
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;
		var D = GAMEGEOM.getDistance(this.position, act.position);
		var colls = (D <= (this.radius+act.radius));
//		var colls = GAMEGEOM.CircleContainsPt(this.position,this.radius, act.position);
		if(colls) {
			if(act.colorNum == this.colorNum && act instanceof CharActor) {
				act.health = Math.min( (act.health+2), act.maxhealth );
			}

			act.colorNum = this.colorNum;
			this.clear();
			this.alive = false;
		}
	}
	if(act instanceof BoxShiftActor)
	{
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;
		var D = GAMEGEOM.getDistance(this.position, act.position);
		var colls = (D <= (this.radius));
//		var colls = GAMEGEOM.CircleContainsPt(this.position,this.radius, act.position);
		if(colls) {
			this.killOrb();
		}
	}
};

OrbActor.alloc = function() {
	var vc = new OrbActor();
	vc.init();
	return vc;
};


exports.OrbActor = OrbActor;
exports.OrbActor._loadJSEngineClasses = _loadJSEngineClasses;
