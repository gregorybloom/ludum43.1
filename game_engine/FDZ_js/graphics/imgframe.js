// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ImageFrame", "ImageFrameSet"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function ImageFrame() {
}
/*	AnimationModule.prototype = new Module;
/**/
ImageFrame.prototype.identity = function() {
	return ('ImageFrame (?)');
};
ImageFrame.prototype.init = function() {
/*	Module.prototype.init.call(this);
/**/

	this.pos = {x:0,y:0};
	this.dim = {w:0,h:0};

	this.imgDim = {w:0,h:0};

	this.baseKeypt = {x:0,y:0};

	this.pt1 = {x:0,y:0};
	this.pt2 = {x:0,y:0};
};
ImageFrame.prototype.setImageFrame = function(x,y,w,h,imgW,imgH,keypt) {
/*	Module.prototype.init.call(this);
/**/

	this.pos.x = x;
	this.pos.y = y;
	this.dim.w = w;
	this.dim.h = h;

	this.imgDim.w = imgW;
	this.imgDim.h = imgH;

	this.baseKeypt.x = keypt.x;
	this.baseKeypt.y = keypt.y;

	this.pt1.x = x/imgW;
	this.pt1.y = y/imgH;
	this.pt2.x = (x+w-1)/imgW;
	this.pt2.y = (y+h-1)/imgH;
};
ImageFrame.alloc = function() {
	var vc = new ImageFrame();
	vc.init();
	return vc;
};









function ImageFrameSet() {
}
/*	AnimationModule.prototype = new Module;
/**/
ImageFrameSet.prototype.identity = function() {
	return ('ImageFrameSet (?)');
};
ImageFrameSet.prototype.init = function() {
	this.imgNum = -1;
	this.frameSet = [];
};
ImageFrameSet.prototype.setImg = function(img) {
	this.imgNum = img;
};
ImageFrameSet.prototype.addFrame = function(frame, num) {
	if(typeof frame === "undefined" || typeof this.frameSet === "undefined")	return this;

	if(typeof num === "undefined")
	{
		this.frameSet.push(frame);
	}
	else
	{
		if(typeof this.frameSet[num] === "undefined" && num >=this.frameSet.length)
		{
			for(var i=this.frameSet.length; i<num; i++)
			{
				var tF = ImageFrame.alloc();
				this.frameSet.push(tF);
			}
			this.frameSet.push(frame);
		}
		else
		{
			this.frameSet[num] = frame;
		}
	}
};




ImageFrameSet.alloc = function() {
	var vc = new ImageFrameSet();
	vc.init();
	return vc;
};



exports.classSet = {};
exports.classSet.ImageFrame = ImageFrame;
exports.classSet.ImageFrameSet = ImageFrameSet;


exports.classSet._loadJSEngineClasses = _loadJSEngineClasses;
