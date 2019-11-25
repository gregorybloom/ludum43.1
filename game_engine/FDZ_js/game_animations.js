// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMEANIMATIONS"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



GAMEANIMATIONS={
	imageSets: {},
	collections: {}
};

GAMEANIMATIONS.init = function()
{
	if( !this.loadTextureFrames() )	return false;
	if( !this.loadAnimations() )	return false;

	return true;
};
GAMEANIMATIONS.loadTextureFrames = function()
{
	return true;
};
GAMEANIMATIONS.loadAnimations = function()
{
	return true;
};
GAMEANIMATIONS.loadTextureFrameFromGrid = function(imgNum, size, xmax, ymax, w, h, imgW, imgH, keyPt, pixelBuffer)
{
/*		this.loadTextureFrameFromGrid(11,  10*4,   10,4,    32,32,   10*32,4*32,   {x:16,y:16},   {x:0,y:0});
/**/
	var i;	var X;	var Y;	var W;	var H;
	var frame = null;

	this.imageSets[ imgNum ] = ImageFrameSet.alloc();
	this.imageSets[ imgNum ].imgNum = imgNum;

	for(var y=0; y<ymax; y++)
	{
		for(var x=0; x<xmax; x++)
		{
			i = x + y*xmax;
			X = w*x + x*2*pixelBuffer.x + pixelBuffer.x;
			Y = h*y + y*2*pixelBuffer.y + pixelBuffer.y;
			W = w;
			H = h;

			frame = ImageFrame.alloc();
			frame.setImageFrame(X,Y,W,H,imgW,imgH,keyPt);
			this.imageSets[ imgNum ].addFrame( frame, i );
		}
	}
};
GAMEANIMATIONS.addToTextureFrameFromGrid = function(imgNum, start, end, xstart, xmax, ystart, ymax, w, h, imgW, imgH, pixelBuffer)
{
	var i;	var X;	var Y;	var W;	var H;
	var frame = null;

	i = start;
	for(var y=ystart; y<ymax; y++)
	{
		for(var x=xstart; x<xmax; x++)
		{
			X = w*x + x*2*pixelBuffer.x + pixelBuffer.x;
			Y = h*y + y*2*pixelBuffer.y + pixelBuffer.y;
			W = w;
			H = h;
			keypt = {x: W/2.0, y: H/2.0};

			frame = ImageFrame.alloc();
			frame.setImageFrame(X,Y,W,H,imgW,imgH,keypt);
			this.imageSets[ imgNum ].addFrame( frame, i );

			i=i+1;
			if(i > end)		return;
		}
	}
};		//this.loadSequenceForCollection(0,  3,1,  11,  600,  2,1, {w:1,h:1});
GAMEANIMATIONS.loadSequenceForCollection = function(collNum, seqNum, frameCount, imgNum, ticksPerFrame, imgFrameStart, imgFrameStep, scale)
{
	this.collections[ collNum ].sequenceSet[ seqNum ] = AnimationSequence.alloc();
	var frame;

	for(var i=0; i<frameCount; i++)
	{
		frame = AnimationFrame.alloc();
		var imgFrame = imgFrameStart + i*imgFrameStep;

		frame.setAnimationFrame( imgFrame, imgNum, ticksPerFrame, i, seqNum );
		frame.setScale( scale );

		this.collections[ collNum ].sequenceSet[ seqNum ].addFrame( frame, i );
	}
};


GAMEANIMATIONS.getNewAnimationFrame = function(collNum, seqNum, frameNum, startTime, repeating, module)
{
	if(  typeof this.collections === "undefined")									return;
	if(  typeof this.collections[ collNum ] === "undefined")						return;
	if(  typeof this.collections[ collNum ].sequenceSet === "undefined")			return;
	if(  typeof this.collections[ collNum ].sequenceSet[ seqNum ] === "undefined")	return;
	if(  typeof this.collections[ collNum ].sequenceSet[ seqNum ].frameSet === "undefined")		return;

	var sequence = this.collections[ collNum ].sequenceSet[ seqNum ];

	var currTime = GAMEMODEL.getTime();
	var ticksDiff = currTime - startTime;


	var overlap = false;

	var ticksLeft = ticksDiff;

	var frameCount = 0;
	var currFrame;

	while( ticksLeft > 0 )
	{
		if(  frameCount >= sequence.frameSet.length  )
		{
			overlap = true;
			if(repeating == true)
			{
				frameCount = 0;
				var tickShift = ticksDiff - ticksLeft;
				if(typeof module !== "undefined")	module.animStartTime = module.animStartTime + tickShift;
			}
			else
			{
				frameCount = sequence.frameSet.length-1;
				ticksLeft = 0;
				break;
			}
		}
		if(  frameCount < sequence.frameSet.length  )
		{
			currFrame = sequence.frameSet[ frameCount ];
			if( ticksLeft > currFrame.ticks )
			{
				ticksLeft = ticksLeft - currFrame.ticks;
				frameCount = frameCount +1;
			}
			else
			{
				ticksLeft = 0;
			}
		}
	}

	if(frameCount < 0)	frameCount = -frameCount;
	if(overlap == true)	frameCount = -frameCount;
	return frameCount;
};
GAMEANIMATIONS.getAnimationFrame = function(collNum, seqNum, frameNum)
{
	if(  typeof this.collections === "undefined")									return;
	if(  typeof this.collections[ collNum ] === "undefined")						return;
	if(  typeof this.collections[ collNum ].sequenceSet === "undefined")			return;
	if(  typeof this.collections[ collNum ].sequenceSet[ seqNum ] === "undefined")	return;
	if(  typeof this.collections[ collNum ].sequenceSet[ seqNum ].frameSet === "undefined")		return;

	return this.collections[ collNum ].sequenceSet[ seqNum ].frameSet[ frameNum ];
};
GAMEANIMATIONS.getImageFrame = function(imgNum, imgFrame)
{
	if(  typeof this.imageSets === "undefined")						return;
	if(  typeof this.imageSets[ imgNum ] === "undefined")			return;
	if(  typeof this.imageSets[ imgNum ].frameSet === "undefined")	return;

	return this.imageSets[ imgNum ].frameSet[ imgFrame ];
};
GAMEANIMATIONS.getAnimationFrameNumber = function(collNum, seqNum, frameNum)
{
	if(  typeof this.collections === "undefined")							return;
	if(  typeof this.collections[ collNum ] === "undefined")				return;
	if(  typeof this.collections[ collNum ].sequenceSet === "undefined")			return;
	if(  typeof this.collections[ collNum ].sequenceSet[ seqNum ] === "undefined")	return;
	if(  typeof this.collections[ collNum ].sequenceSet[ seqNum ].frameSet === "undefined")		return;

	var sequence = this.collections[ collNum ].sequenceSet[ seqNum ];
	if(frameNum < 0 || typeof sequence.frameSet[ frameNum ] === "undefined")		return;

	var curFrame = sequence.frameSet[ frameNum ];

	return curFrame.frameNum;
};


exports.GAMEANIMATIONS = GAMEANIMATIONS;
exports.GAMEANIMATIONS._loadJSEngineClasses = _loadJSEngineClasses;
