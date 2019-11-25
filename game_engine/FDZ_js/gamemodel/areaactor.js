// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["AreaActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function AreaActor() {
}
AreaActor.prototype = new Actor;
AreaActor.prototype.identity = function() {
	return ('Actor (' +this._dom.id+ ')');
};
AreaActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.displayActors = [];
	this.passiveActors = [];
	this.activeActors = [];

	this.borderBlock = "NESW";

	this.baseOffset = {x:0,y:0};
};
AreaActor.prototype.start = function() {
};


AreaActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	for(var i in this.activeActors)
	{
		if(this.activeActors[i].alive) {
			this.activeActors[i].update();
		} else {
			this.activeActors.splice(i,1);
		}
	}
};
AreaActor.prototype.draw = function() {
//	Actor.prototype.draw.call(this);


	for(var i in this.activeActors)
	{
		this.activeActors[i].draw();
	}
};

AreaActor.prototype.collide = function() {
	for(var i in this.activeActors)
	{
		var j = parseInt(i)+1;
		for(j; j<this.activeActors.length; j++)
		{
			this.activeActors[i].collide(this.activeActors[j]);
			this.activeActors[j].collide(this.activeActors[i]);
		}
	}



};


AreaActor.alloc = function() {
	var vc = new AreaActor();
	vc.init();
	return vc;
};


exports.AreaActor = AreaActor;
exports.AreaActor._loadJSEngineClasses = _loadJSEngineClasses;
