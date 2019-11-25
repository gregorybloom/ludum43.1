// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["AnimationFrame", "AnimationSequence", "AnimationCollection"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});




function AnimationFrame() {
}
/*	AnimationModule.prototype = new Module;
/**/
AnimationFrame.prototype.identity = function() {
	return ('AnimationFrame (?)');
};
AnimationFrame.prototype.init = function() {
/*	Module.prototype.init.call(this);
/**/

	this.imgNum = -1;
	this.imgFrameNum = 0;

	this.ticks = 0;
	this.frameNum = 0;
	this.seqNum = 0;

	this.scale = {w:1.0,h:1.0};

	this.rect = null;
};
AnimationFrame.prototype.setAnimationFrame = function(frame,img,t,afn,seq) {
/*	Module.prototype.init.call(this);
/**/

	this.imgFrameNum = frame;
	this.imgNum = img;

	this.ticks = t;

	this.frameNum = afn;
	this.seqNum = seq;
};
AnimationFrame.prototype.setScale = function(sc) {
	this.scale = sc;
};
AnimationFrame.alloc = function() {
	var vc = new AnimationFrame();
	vc.init();
	return vc;
};









function AnimationSequence() {
}
/*	AnimationModule.prototype = new Module;
/**/
AnimationSequence.prototype.identity = function() {
	return ('AnimationSequence (?)');
};
AnimationSequence.prototype.init = function() {
	this.frameSet = [];
};
AnimationSequence.prototype.addFrame = function(frame, num) {
	if(typeof frame === "undefined" || typeof this.frameSet === "undefined")	return this;

	if(typeof num === "undefined")	this.frameSet.push(frame);
	else
	{
		this.frameSet[num] = frame;
	}
};
AnimationSequence.alloc = function() {
	var vc = new AnimationSequence();
	vc.init();
	return vc;
};









function AnimationCollection() {
}
/*	AnimationModule.prototype = new Module;
/**/
AnimationCollection.prototype.identity = function() {
	return ('AnimationCollection (?)');
};
AnimationCollection.prototype.init = function() {
	this.sequenceSet = [];
};
AnimationCollection.prototype.addFrame = function(frame, num) {
	if(typeof frame === "undefined" || typeof this.sequenceSet === "undefined")	return this;

	if(typeof num === "undefined")	this.sequenceSet.push(frame);
	else
	{
		this.sequenceSet[num] = frame;
	}
};
AnimationCollection.alloc = function() {
	var vc = new AnimationCollection();
	vc.init();
	return vc;
};


exports.classSet = {};
exports.classSet.AnimationFrame = AnimationFrame;
exports.classSet.AnimationSequence = AnimationSequence;
exports.classSet.AnimationCollection = AnimationCollection;


exports.classSet._loadJSEngineClasses = _loadJSEngineClasses;
