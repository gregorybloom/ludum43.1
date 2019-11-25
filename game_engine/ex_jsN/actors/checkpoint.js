// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TimerObj"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["CheckpointActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function CheckpointActor() {
}
CheckpointActor.prototype = new Actor;
CheckpointActor.prototype.identity = function() {
	return ('CheckpointActor (' +this._dom.id+ ')');
};
CheckpointActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.heading = {x:-1,y:0};
	this.unitSpeed = 0.15;

	this.progress = 0;
	this.step = 0;
	this.stage = 0;
	this.level = 0;
	this.pColor = 0;

	this.radius = 15;
	this.colorNum = 5;

	this.dropId = null;

	this.activated = false;

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.dark = false;
	this.saved = false;
	this.stepsTimer = TimerObj.alloc();
	this.stepsTimer.lifeTime = 0;
	this.stepsTimer.looping = false;

	this.startedTimer = TimerObj.alloc();
	this.startedTimer.lifeTime = 0;
	this.startedTimer.looping = false;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [4,7];
  this.alphaRange = [0.1,0.4];

	this.size = {w:40,h:40};
	this.position = {x:0,y:0};
	this.updatePosition();
};
CheckpointActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
CheckpointActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

CheckpointActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);

	var prop = {fill:true, color:"#EEEEEE", width:1};
	prop.source = "default";
	prop.writeTo = 1;
	var shape = {type:"circle",radius:this.radius};
	var transf = {};
	GAMEVIEW.drawElement(this.position, shape, prop, transf);


		var orbColor = this.getNumericColor(1,this.colorNum,'laser');

		var prop = {fill:false, color:orbColor, width:2};
		prop.source = "default";
		prop.writeTo = 1;
		var shape = {type:"circle",radius:7};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);

			var prop = {fill:false, color:this.haloColor,width:this.haloWidth};
			prop.source = "default";
			prop.writeTo = 1;
			var shape = {type:"circle",radius:(this.radius)};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);

	var orbColor2 = this.getNumericColor(0.3,7,'halo');

	var prop = {fill:true, color:orbColor2};
	prop.source = "default";
	prop.writeTo = 1;
	var shape = {type:"circle",radius:(this.radius)};
	var transf = {};
	GAMEVIEW.drawElement(this.position, shape, prop, transf);

		var prop = {fill:true, color:this.orbColor};
		prop.source = "default";
		prop.writeTo = 1;
		var shape = {type:"circle",radius:this.haloWidth};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);



	var prop = {fill:false, color:this.orbColor, width:1};
	prop.source = "default";
	prop.writeTo = 1;
	var shape = {type:"circle",radius:this.radius/2};
	var transf = {};
	GAMEVIEW.drawElement(this.position, shape, prop, transf);

	var prop = {fill:false, color:"#FFFFFF", width:2};
	prop.source = "default";
	prop.writeTo = 1;
	var shape = {type:"circle",radius:(2*this.radius/3)};
	var transf = {};
	GAMEVIEW.drawElement(this.position, shape, prop, transf);


	var prop = {fill:false, color:"#000000", width:1.5};
	prop.source = "default";
	prop.writeTo = 1;
	var shape = {type:"circle",radius:this.radius};
	var transf = {};
	GAMEVIEW.drawElement(this.position, shape, prop, transf);


	if(this.dark) {
		var prop = {fill:true, color:"rgba(0,0,0,0.55)"};
		prop.source = "default";
		prop.writeTo = 1;
		var shape = {type:"circle",radius:this.radius};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);
	}

/*
	var prop = {fill:false, color:"rgba(0,0,0,0.5)", width:1.5};
	prop.source = "default";
	prop.writeTo = 2;
	var shape = {type:"shape",pts:[]};
	var transf = {};
	shape.pts.push({x:-5,y:0,t:'m'});
	shape.pts.push({x1:-5,y1:0, xb:0,yb:20, x2:-4,y2:20, t:'b'});

	GAMEVIEW.drawElement(this.position, shape, prop, transf);
/**/

	if(this.dark) {
		var e = 80 - 40*0.7;
		GAMEVIEW.drawEllipses(this.position, {h:e,w:10}, {x:0,y:0}, true, 1, "rgba(0,0,0,0.75)", 1);
	}
	if(!this.dark && !this.saved) {
		var prop = {fill:true, color:"rgba(226,226,226,0.45)", width:1.5};
		prop.source = "default";
		prop.writeTo = 1;
		var shape = {type:"circle",radius:this.radius};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);

		GAMEVIEW.drawEllipses(this.position, {h:80,w:10}, {x:0,y:0}, true, 1, "rgba(0,0,0,0.5)", 1);
	}
	if(!this.dark && this.saved) {
		var c = this.stepsTimer.getCycle();
		if(c.time > 0) {
			var e = 80 - 40*( Math.min(2000,c.time)/2000);
			GAMEVIEW.drawEllipses(this.position, {h:e,w:10}, {x:0,y:0}, true, 1, "rgba(0,0,0,0.5)", 1);
		}
		if(c.time > 0 && c.time < 1400) {
			var d = 420/this.unitSpeed;
			var r = 30 + 60*(c.time/1400);
			var a = 1;
			if(c.time > 600)		a = 1-(c.time-600)/800;
			var orbColor3 = this.getNumericColor(a,7,'halo');

			var prop = {fill:false, color:orbColor3, width:2.5};
			prop.source = "default";
			prop.writeTo = 1;
			var shape = {type:"circle",radius:(r)};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);
		}
	}

//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
CheckpointActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.startedTimer.update();
	this.stepsTimer.update();

	this.updatePosition();

	var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);
	if(this.dark)		D=0.2;


	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];

	this.orbColor = this.getNumericColor(this.haloAlpha, this.colorNum, 'orb');
	this.haloColor = this.getNumericColor(this.haloAlpha, this.colorNum, "halo");

	if(!this.startedTimer.running) {
		this.startedTimer.startTimer();
		this.startedTimer.update();

	}
	else {

		var newPos = {x:this.position.x,y:this.position.y};
			newPos.x += this.heading.x*this.unitSpeed*this.ticksDiff;
			newPos.y += this.heading.y*this.unitSpeed*this.ticksDiff;
		this.updatePosition(newPos);
	}


	if(this.position.x < -100) {
		if(!this.saved) {
			this.saveCheckpoint();
		}
	}

};
CheckpointActor.prototype.saveCheckpoint = function() {
	this.saved = true;

	var GW = GAMEMODEL.gameSession.gameWorld;
	GW.dropper.savedCheckpt={};
	GW.dropper.savedCheckpt.progress = this.progress;
	GW.dropper.savedCheckpt.step = this.step;
	GW.dropper.savedCheckpt.stage = this.stage;
	GW.dropper.savedCheckpt.pColor = this.pColor;
	GW.dropper.savedCheckpt.lastId = this.dropId;
	this.stepsTimer.startTimer();
	this.stepsTimer.update();
};
CheckpointActor.prototype.mouseClickAt = function(kInput) {

//    var screenPt = GAMEVIEW.PtToDrawCoords(this.position);
//    var d1 = kInput.pos.x-screenPt.x;
//    var d2 = kInput.pos.y-screenPt.y;
	var screenPt = GAMEVIEW.DrawPtToWorldCoords(kInput.pos);
    var clicked = GAMEGEOM.BoxContainsPt(this.absBox,screenPt);

    if(clicked) {
        if(kInput.bpress) {
            this.activated = !this.activated;
        }
    }
};

CheckpointActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

CheckpointActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(act instanceof CharActor)	return true;
	return false;
};
CheckpointActor.prototype.collideVs = function(act) {
	if(act instanceof CharActor)
	{
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;
		var D = GAMEGEOM.getDistance(this.position, act.position);
		var colls = (D <= (this.radius+act.radius));
//		var colls = GAMEGEOM.CircleContainsPt(this.position,this.radius, act.position);
		if(colls && !this.dark && !this.saved) {
			this.saveCheckpoint();
		}
	}

};
CheckpointActor.alloc = function() {
	var vc = new CheckpointActor();
	vc.init();
	return vc;
};


exports.CheckpointActor = CheckpointActor;
exports.CheckpointActor._loadJSEngineClasses = _loadJSEngineClasses;
