// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ActionModule"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function ActionModule() {
}
ActionModule.prototype.identity = function() {
	return ('ActionModule (?)');
};
ActionModule.prototype.init = function() {
	this.actionLists = {};

	this.parent = null;
	this.target = null;
	this.filter = null;
/*
	this.lastUpdateTicks = GAMEMODEL.getTime();
	this.thisUpdateTicks = GAMEMODEL.getTime();

	this.ticksDiff = 0;	/**/
};
ActionModule.prototype.clear = function() {
	for(var i in this.actionLists)
	{
		if(this.actionLists[i])		this.actionLists[i].clear();
		this.actionLists[i] = null;
	}
	this.actionLists = null;
};

ActionModule.prototype.eraseActionLists = function() {
	this.actionLists = {};
};
ActionModule.prototype.actionCount = function() {
	var obj={'_all':0};
	for(var i in this.actionLists)
	{
		obj[i]=0;
		if(this.actionLists[i]) {
			if(this.actionLists[i].actionSet) {
				for(var j in this.actionLists[i].actionSet) {
					if(this.actionLists[i].actionSet[j]) {
						if(this.actionLists[i].actionSet[j].alive) {
							obj[i]+=1;
							obj['_all']+=1;
						}
					}
				}
			}
		}
	}
	return obj;
};

ActionModule.prototype.update = function() {
	/*	this.lastUpdateTicks = this.thisUpdateTicks;
	this.thisUpdateTicks = GAMEMODEL.getTime();
	this.ticksDiff = this.thisUpdateTicks - this.lastUpdateTicks;
/**/
	if(this.parent == null && this.target != null)		this.parent = this.target;

	for(var i in this.actionLists)
	{
		if(this.actionLists[i].alive)		this.actionLists[i].update();
		else {
			this.actionLists[i].clear();
			delete this.actionLists[i];
		}
	}
};

ActionModule.alloc = function() {
	var vc = new ActionModule();
	vc.init();
	return vc;
};

exports.ActionModule = ActionModule;
exports.ActionModule._loadJSEngineClasses = _loadJSEngineClasses;
