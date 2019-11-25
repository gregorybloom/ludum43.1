// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TimerObj","EnemyActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["DropperActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function DropperActor()
{
}

DropperActor.prototype = new Actor;

DropperActor.prototype.identity = function()
{
	return ('DropperActor ()');
};

DropperActor.prototype.init = function()
{
	Actor.prototype.init.call(this);
	this.position = {x: 0, y: 0};
	this.radius = 20;
	this.size = {w: 5, h: 5};
	this.target = null;
	this.actionMode = "MODE_STILL";
	this.progress = 0;
	this.stage = 0;
	this.subStep = 0;
	this.loadedItems = {};
	this.changeStep = {};
	this.deathList = {};

	this.savedCheckpt = null;
	this.updatePosition();

	this.startedTimer = TimerObj.alloc();
	this.startedTimer.lifeTime = 0;
	this.startedTimer.looping = false;
};
DropperActor.prototype.cutToProgress = function( toProgress,curstep=null,curstage=null,dropid=null )
{
	if(curstage == null)	curstage = this.stage;
	if(curstep == null)		curstep = this.subStep;

	for(var i in this.loadedItems) {
		if(this.loadedItems[i].stage == curstage) {
			if(this.loadedItems[i].subStep == curstep) {
				if(this.loadedItems[i].dropAt <= toProgress) {
					delete this.loadedItems[i];
				}
			}
			else if(this.loadedItems[i].subStep < curstep) {
				delete this.loadedItems[i];
			}
		}
		else if(this.loadedItems[i].stage < curstage) {
			delete this.loadedItems[i];
		}
	}
	if(dropid && this.loadedItems[dropid]) {
		delete this.loadedItems[dropid];
	}

	this.startedTimer.savedTime = toProgress;
	this.progress = toProgress;
	this.stage = curstage;
	this.subStep = curstep;
};

DropperActor.prototype.draw = function()
{
//	GAMEVIEW.fillCircle(this.position, 100, "#FF6600");
};

DropperActor.prototype.update = function()
{
	Actor.prototype.update.call(this);
//	console.log(this.progress,this.subStep,this.stage);

	this.startedTimer.update();


	if(!this.startedTimer.running) {
		this.startedTimer.startTimer();
	}
	else {
		var c = this.startedTimer.getCycle();
		if (c.cycled) {
			this.progress = c.time;
		}
	}

	var dropsleft = this.tryDrop();
	if(!dropsleft)	this.trySceneStep();
	this.tryCleaning();
};
//    GW.dropper.addAndProcessLoad( "000", 0, 0, 500, "function",[generated1],{'fn':LEVELLOADER.createActor,'args':[,"EnemyCircleBlaster",{x:350,y:0}]} );
DropperActor.prototype.addAndProcessLoad = function(_id, _stage, _sub, _dropLevel, _ptype, _payloadfns, _args) {
	var item = {id: _id, stage: _stage, subStep: _sub, dropped:false, dropAt: _dropLevel, payloadType: null, args: null, payload: null, target: null};
	_args.id = _id;
	item.payloadType = _ptype;
	item.payload = _payloadfns;
	item.args = _args;
	this.loadedItems[_id]=item;
};

DropperActor.prototype.addLoad = function(_id, _stage, _sub, _dropLevel, _ptype, _payload)
{
	var item = {id: _id, stage: _stage, subStep: _sub, dropped:false, dropAt: _dropLevel, payloadType: null, payload: null, target: null};
	item.payloadType = _ptype;
	item.payload = _payload;
	this.loadedItems[_id]=item;
};
DropperActor.prototype.trySceneStep = function() {
	var c = 0;
	for(var i in this.deathList) {
		if(!this.deathList[i])							continue;
		else if(this.deathList[i].alive)		c+=1;
	}
	if(c > 0)		return;

	var step = this.subStep+1;
	for(var i in this.loadedItems) {
		if(this.loadedItems[i].stage == this.stage) {
			if(this.loadedItems[i].subStep == step) {
				this.progress = 0;
				this.startedTimer.startTimer();
				this.subStep = step;
				return;
			}
		}
	}

	step = 0;
	var stage = this.stage+1;
	for(var i in this.loadedItems) {
		if(this.loadedItems[i].stage == stage) {
			this.progress = 0;
			this.startedTimer.startTimer();
			this.subStep = step;
			this.stage = stage;
			console.log("New stage: ",this.stage);
			return;
		}
	}
};

DropperActor.prototype.tryDrop = function()
{
	var leftoverdrops = false;
	for(var i in this.loadedItems) {
		if(this.loadedItems[i].stage == this.stage) {
			if(this.loadedItems[i].subStep == this.subStep) {
				if(this.loadedItems[i].dropAt <= this.progress) {
					this.dropLoaded(this.loadedItems[i].dropAt,this.loadedItems[i]);
					delete this.loadedItems[i];
					leftoverdrops = true;
				}
				else {
					leftoverdrops = true;
//					return leftoverdrops;
				}
			}
			else if(this.loadedItems[i].subStep > this.subStep) {
//				return leftoverdrops;
			}
		}
		else if (this.loadedItems[i].stage > this.stage) {
//			return leftoverdrops;
		}
	}
	return leftoverdrops;
};

DropperActor.prototype.dropLoaded = function(time,item)
{
	if(item.dropped)		return;
	item.dropped = true;

	var payload = item.payload;
	var target = item.target;
	var type = item.payloadType;
	var actor = null;

	if(type == "function") {
		payload.call(this);
	}
	else if(type == "prepfns") {
		for(var i in payload) {
			payload[i].call(this,item.args);
		}
	}
};

DropperActor.prototype.tryCleaning = function()
{
	var camera = GAMEMODEL.modelCamera;
	var camshift = camera.getCameraShift();
	var actors = GAMEMODEL.gameSession.gameWorld.gameActors;

	for (var i in actors)
	{
		if (actors[i].alive && actors[i] instanceof EnemyActor)
		{
			if(actors[i].position.x < (this.position.x-1550+actors[i].deadLength)) {
				if (actors[i] instanceof Actor)		actors[i].alive = false;
				if (actors[i] instanceof Actor)		actors[i].clear();
			}
		}
	}
	for(var i in this.deathList) {
		if(!this.deathList[i])							delete this.deathList[i];
		else if(!this.deathList[i].alive)		delete this.deathList[i];
	}
};

DropperActor.alloc = function()
{
	var vc = new DropperActor();
	vc.init();
	return vc;
};


exports.DropperActor = DropperActor;
exports.DropperActor._loadJSEngineClasses = _loadJSEngineClasses;
