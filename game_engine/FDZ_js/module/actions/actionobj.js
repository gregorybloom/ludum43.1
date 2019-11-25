// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ActionObject"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function ActionObject() {
}
ActionObject.prototype.identity = function() {
	return ('ActionObject (?)');
};
ActionObject.prototype.init = function() {

	this.target = null;
	this.alive = true;

	this.started = false;
	this.startLag = 0;

	this.givenTime = 0;

	this.startTime = GAMEMODEL.getTime();
	this.lastTime = 0;
	this.currTime = 0;

	this.diffTime = 0;

};
ActionObject.prototype.clear = function() {
};
ActionObject.prototype.takeTime = function(time) {
	this.givenTime += time;
};

ActionObject.prototype.checkStart = function() {
	if(this.startLag > this.givenTime) {
		var given = this.givenTime;
		this.startLag -= given;
		this.givenTime = 0;
		return given;
	}
	else {
		this.start();
	}
};
ActionObject.prototype.start = function() {
	this.startTime = GAMEMODEL.getTime();
	this.lastTime = this.startTime;

	this.started = true;
	this.givenTime -= this.startLag;
	this.startLag = 0;
};
ActionObject.prototype.update = function() {
	if(!this.started) {
		this.checkStart();
	}
	this.lastTime = this.currTime;
	this.currTime = GAMEMODEL.getTime();
	this.diffTime = this.currTime - this.lastTime;

	var used = this.act(this.givenTime);
	this.givenTime = 0;
	return used;
};
ActionObject.prototype.act = function(time) {
	return 0;
};
ActionObject.alloc = function() {
	var vc = new ActionObject();
	vc.init();
	return vc;
};


exports.ActionObject = ActionObject;
exports.ActionObject._loadJSEngineClasses = _loadJSEngineClasses;
