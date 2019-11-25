// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MoveActorComponent"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function MoveActorComponent() {
}
MoveActorComponent.prototype.identity = function() {
	return ('MoveActorComponent (?)');
};
MoveActorComponent.prototype.init = function() {
	this.parentMoveActor = null;
};
MoveActorComponent.prototype.start = function() {
};
MoveActorComponent.prototype.update = function() {
};
MoveActorComponent.alloc = function() {
	var vc = new MoveActorComponent();
	vc.init();
	return vc;
};


exports.MoveActorComponent = MoveActorComponent;
exports.MoveActorComponent._loadJSEngineClasses = _loadJSEngineClasses;
