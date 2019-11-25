// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["AnimationModule"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});





function AnimationModule() {
}
/*	AnimationModule.prototype = new Module;
/**/
AnimationModule.prototype.identity = function() {
	return ('AnimationModule (?)');
};



AnimationModule.prototype.init = function() {
/*	Module.prototype.init.call(this);
/**/
	this.animates = false;
	this.drawCollection = -1;
	this.currentSequence = -1;
	this.currentFrame = 0;

	this.animStartTime = GAMEMODEL.getTime();
	this.animFinished = true;
	this.animRepeats = true;

	this.target = null;
	this.filter = null;
	this.drawShift = {x:0,y:0};
};

AnimationModule.prototype.draw = function() {
	if(this.target != null && this.drawCollection >= 0)
	{
		var pointC = {x:0,y:0};
		pointC.x = this.target.absBox.x;
		pointC.y = this.target.absBox.y + this.target.absBox.h;

		var frame = GAMEANIMATIONS.getAnimationFrame(this.drawCollection, this.currentSequence, this.currentFrame);
//		GAMEVIEW.drawFromAnimationFrame( frame, this.target.absPosition, null, {x:this.drawShift.x,y:this.drawShift.y}, null );
		GAMEVIEW.drawAnimationElement(frame, this.target.absPosition, {type:"frame"}, {}, {actions:[{type:"t",x:this.drawShift.x,y:this.drawShift.y}]}, GAMEMODEL.modelCamera);

	}
};
AnimationModule.prototype.update = function() {

	this.updateCurrentAnimation();

	if(this.animates != false && this.drawCollection >= 0)
	{
		if(this.animFinished && this.animRepeats == false)	return;

		var curFrame = GAMEANIMATIONS.getNewAnimationFrame(this.drawCollection, this.currentSequence, this.currentFrame, this.animStartTime, this.animRepeats, this );

		if(curFrame < 0)
		{
			this.animFinished = true;
			curFrame -= curFrame;
		}
		if(curFrame >= 0)
		{
			this.currentFrame = curFrame;
		}
	}
};
AnimationModule.prototype.changeToAnimation = function(sequence, repeat) {
	if(typeof repeat === 'undefined' || repeat == null)		repeat = false;

	if( this.currentSequence != sequence )
	{
		this.currentSequence = sequence;
		this.currentFrame = 0;

		this.animates = true;
		this.animRepeats = repeat;
		this.animFinished = false;
		this.animStartTime = GAMEMODEL.getTime();
	}
};
AnimationModule.prototype.updateCurrentAnimation = function() {
};



AnimationModule.alloc = function() {
	var vc = new AnimationModule();
	vc.init();
	return vc;
};


exports.AnimationModule = AnimationModule;
exports.AnimationModule._loadJSEngineClasses = _loadJSEngineClasses;
