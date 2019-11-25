// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ActionList"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function ActionList() {
}
ActionList.prototype.identity = function() {
	return ('ActionList (?)');
};
ActionList.prototype.init = function() {
	this.actionSet = [];

	this.target = null;
	this.alive = true;

	this.ordered = true;
	this.started = false;
	this.startLag = 0;

	this.startTime = GAMEMODEL.getTime();
	this.lastTime = GAMEMODEL.getTime();
};
ActionList.prototype.clear = function() {
	for(var i in this.actionSet)
	{
		if(this.actionSet[i])		this.actionSet[i].clear();
		this.actionSet[i] = null;
	}
	this.actionSet = null;
};
ActionList.prototype.update = function() {
	for(var i in this.actionSet)
	{
		if(!this.actionSet[i].alive)		this.actionSet.splice(i,1);
	}

	var curTime = GAMEMODEL.getTime();
	var dt = curTime - this.lastTime;

	if(!this.started) {
		var sdt = curTime - this.startTime;
		if(this.startLag > sdt) {
			return;
		}
		else {
			this.started = true;
			dt = sdt - this.startLag;
		}
	}

	for(var i in this.actionSet)
	{
		if(this.ordered) {
			if(this.actionSet[i].alive)		this.actionSet[i].takeTime(dt);
			if(this.actionSet[i].alive)		var usedT = this.actionSet[i].update();
			dt -= usedT;
			if(this.actionSet[i].alive)		break;
			if(dt <= 0)				break;
		}
		else {
			if(this.actionSet[i].alive)		this.actionSet[i].update();
		}
	}
	this.lastTime = curTime;
};

ActionList.prototype.addAction = function(act) {
	if(act instanceof ActionObject) {
		this.actionSet.push(act);
	}
};
ActionList.alloc = function() {
	var vc = new ActionList();
	vc.init();
	return vc;
};


exports.ActionList = ActionList;
exports.ActionList._loadJSEngineClasses = _loadJSEngineClasses;
