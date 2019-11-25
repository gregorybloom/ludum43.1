// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["TimerObj"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function TimerObj() {
}
TimerObj.prototype.identity = function() {
	return ('TimerObj ()');
};

TimerObj.prototype.init = function() {
	this.started = false;
	this.running = false;
	this.startTime = 0;
	this.savedTime = 0;
	if(typeof this.lifeTime === "undefined")		this.lifeTime = 3000;
	if(typeof this.looping === "undefined")		this.looping = true;

	this.timeRate = 1.0;

	this.lastDiffTime = null;

	this.cycled = false;
	this.cycledBy = null;
};

TimerObj.prototype.update = function() {
	if(this.looping == true && this.cycled == true) {
		this.cycled = false;
		this.cycledBy = null;
	}

	if(this.started == false)	return;
	if(this.startTime == 0)		this.startTime = GAMEMODEL.getTime() - this.savedTime;
	if(this.running == false)	return;


	var diffTime = GAMEMODEL.getTime() - this.startTime;

	this.lastcycledBy = this.cycledBy;
	if(diffTime >= this.lifeTime && !this.cycled) {
			if(this.looping) {
				this.startTime += this.lifeTime;
				this.cycledBy = diffTime - this.lifeTime;
			}
			this.cycled = true;
	}
	else {
		this.cycledBy = diffTime - this.lifeTime;
	}
	if(this.lastcycledBy != null && !this.looping) {
		if(this.lastcycledBy < 0 && this.cycledBy < 0 && this.lastcycledBy > this.cycledBy) {
//			this.cycled = true;
		}
	}

};
TimerObj.prototype.startTimer = function() {
	this.startTime = GAMEMODEL.getTime() - this.savedTime;
	this.started = true;
	this.running = true;

	this.cycled = false;
	this.cycledBy = null;
};
TimerObj.prototype.stopTimer = function() {
	this.running = false;
};
TimerObj.prototype.getCycle = function() {
	if(this.cycledBy == null) {
		this.cycledBy = -this.lifeTime;
		if(this.lifeTime == 0)		this.cycledBy = 0;
	}

	return {'cycled':this.cycled,'time':this.cycledBy};
};
TimerObj.alloc = function() {
	var vc = new TimerObj();
	vc.init();
	return vc;
};


exports.TimerObj = TimerObj;
exports.TimerObj._loadJSEngineClasses = _loadJSEngineClasses;
