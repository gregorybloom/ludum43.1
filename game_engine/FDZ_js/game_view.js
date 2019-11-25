// CommonJS ClassLoader Hack
var classLoadList = ["GameCamera"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMEVIEW"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



if (typeof require === "function") {
	var $ = jQuery = require('jquery'); // as node_modules
}
else {
	var $ = jQuery.noConflict();
	$('div#renderarea');
}


GAMEVIEW={
	resourceURL: "",
	gameTextures: {},

	screen: {w:0,h:0},
	mainLayers: 10,
	hiddenLayers: 10,
	context: null,
	contextArr: {},
	loadedImgs: {},

	drawPt: {},
	drawSize: {},

	drawModifiers: {},
	drawBehavior: {},

	avgTick: 0,
	lastTick: 0,

	MAXSAMPLES: 100,
	tickindex: 0,
	ticksum: 0,
	ticklist: {},

	boundTexture: -1,
	drawcount: 0
};

GAMEVIEW.init = function()
{
	GAMEVIEW.declareResources();

	return true;
};
GAMEVIEW.loadTextures = function()
{
	for(var i in this.gameTextures) {
		this.loadImg(i, this.gameTextures[i]);
	}
	return true;
};
GAMEVIEW.set = function(screendim)
{
	this.screen.w = screendim.w;
	this.screen.h = screendim.h;

	$('div#renderarea').width(this.screen.w);
	$('div#renderarea').height(this.screen.h);

	for(var i=0; i<this.mainLayers; i++) {
		$('div#renderarea').append("<canvas class='starting'></canvas>");

		this.contextArr[i] = {};
		this.contextArr[i].canvas = $('div#renderarea canvas.starting').get(0);
		this.contextArr[i].context = this.contextArr[i].canvas.getContext("2d");

		$('div#renderarea canvas.starting').css('z-index',i+1);
		$('div#renderarea canvas.starting').addClass('render');
		if(i==(this.mainLayers-1))	$('div#renderarea canvas.starting').addClass('top');
		$('div#renderarea canvas.starting').removeClass('starting');
	}
	for(var i=-1; i>=(-this.hiddenLayers); i--) {
		$('div#renderarea').append("<canvas class='starting'></canvas>");

		this.contextArr[i] = {};
		this.contextArr[i].canvas = $('div#renderarea canvas.starting').get(0);
		this.contextArr[i].context = this.contextArr[i].canvas.getContext("2d");

		$('div#renderarea canvas.starting').css('z-index',i);
		$('div#renderarea canvas.starting').addClass('hidden');
		$('div#renderarea canvas.starting').addClass('render');
		$('div#renderarea canvas.starting').removeClass('starting');
	}

	$('div#renderarea canvas').attr('width', this.screen.w);
	$('div#renderarea canvas').attr('height', this.screen.h);
	$('div#renderarea canvas').width(this.screen.w);
	$('div#renderarea canvas').height(this.screen.h);

	$('div#loadingtext').remove();

	this.context = this.contextArr[0].context;

	this.context.font = "24pt Arial";
	this.context.fillStyle = "#999999";
	this.context.fillText("Loading...",100,300);
};
GAMEVIEW.loadImg = function(num, imgsrc)
{
	if(typeof this.loadedImgs[num] === "undefined")		this.loadedImgs[num] = {};
	this.loadedImgs[num].src = GameEngine.staticURLPath+"/"+imgsrc;
	this.loadedImgs[num].img = new Image();
	this.loadedImgs[num].img.src = GameEngine.staticURLPath+"/"+imgsrc;
};
GAMEVIEW.detectWebGLSupport = function() {
	if (window.WebGLRenderingContext) {
//     	webGLcanvasApp()
	} else if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
//     	html5CanvasAppFMobile()
    } else {
//	    html5CanvasApp()
    }
};
GAMEVIEW.setDrawPt = function(x,y)
{
    this.drawPt.x = x;
    this.drawPt.y = y;
};
GAMEVIEW.fetchCamera = function(type)
{
	if(type === "game") {
		if(GAMEMODEL.gameSession instanceof SessionActor && GAMEMODEL.gameSession.gameCamera instanceof ViewCamera) {
			return GAMEMODEL.gameSession.gameCamera;
		}
	}
	if(type === "screen") {
		if(GAMEMODEL.gameScreens instanceof ScreenManager && GAMEMODEL.gameScreens.screenCamera instanceof ViewCamera) {
			return GAMEMODEL.gameScreens.screenCamera;
		}
	}
	if(type === "model") {
		if(GAMEMODEL.modelCamera instanceof ViewCamera) {
			return GAMEMODEL.modelCamera;
		}
	}


	if(GAMEMODEL.gameSession instanceof SessionActor && GAMEMODEL.gameSession.gameCamera instanceof ViewCamera) {
		return GAMEMODEL.gameSession.gameCamera;
	}
	if(GAMEMODEL.modelCamera instanceof ViewCamera) {
		return GAMEMODEL.modelCamera;
	}
};


GAMEVIEW.calcAverageTick = function(newtick)
{
	if(typeof this.ticklist[ this.tickindex ] === "undefined")
	{
		this.ticklist[ this.tickindex ] = 0;
	}

	this.ticksum -= this.ticklist[ this.tickindex ];
	this.ticksum += newtick;

	this.ticklist[ this.tickindex ] = newtick;
	this.tickindex = this.tickindex+1;

	if( this.tickindex == this.MAXSAMPLES )
	{
		this.tickindex = 0;
		var fps = Math.floor(1000/(this.ticksum/this.MAXSAMPLES));
	}

	return (this.ticksum/this.MAXSAMPLES);
};

GAMEVIEW.BoxIsInCamera = function(box, camera)
{
	if(typeof camera==="undefined" || camera==null)		camera=GAMEMODEL.modelCamera;
	if(camera != null && camera instanceof GameCamera)
	{
		var absBox = camera.absBox;
		var shiftBox = {x:box.x, y:box.y, w:box.w, h:box.h};
		shiftBox.x = shiftBox.x;
		shiftBox.y = shiftBox.y;

		return GAMEGEOM.BoxIntersects(absBox, shiftBox);
	}
	return false;
};
GAMEVIEW.clearDrawMods = function()
{
	for(var i in this.drawModifiers)
	{
		delete this.drawModifiers[i];
	}
};

GAMEVIEW.DrawPtToWorldCoords = function(drawPt, vShift, camera)
{
	if(typeof camera==="undefined" || camera==null)		camera=GAMEMODEL.modelCamera;
	if(typeof vShift === "undefined")	vShift = null;

	var camShift = camera.getCameraShift();
	camShift.x = camShift.x;
	camShift.y = camShift.y;

	var absPt = {x:0,y:0};

	var zoom = camera.zoom;
	absPt.x = drawPt.x*zoom;
	absPt.y = drawPt.y*zoom;
	if(vShift != null)			absPt.x -= vShift.x;
	if(vShift != null)			absPt.y -= vShift.y;
	if(camShift.x != null)		absPt.x += camShift.x;
	if(camShift.y != null)		absPt.y += camShift.y;

	return absPt;
};
GAMEVIEW.PtToDrawCoords = function(absPt, vShift, camera)
{
	if(typeof camera==="undefined" || camera==null)		camera=GAMEMODEL.modelCamera;
	if(typeof vShift === "undefined")	vShift = null;

	var zoom = camera.zoom;

	var camShift = camera.getCameraShift();
	camShift.x = camShift.x;
	camShift.y = camShift.y;

	var drawPt = {x:0,y:0};
	if(absPt != null)			drawPt.x += absPt.x;
	if(absPt != null)			drawPt.y += absPt.y;
	if(vShift != null)			drawPt.x += vShift.x;
	if(vShift != null)			drawPt.y += vShift.y;
	if(camShift.x != null)		drawPt.x -= camShift.x;
	if(camShift.y != null)		drawPt.y -= camShift.y;

	drawPt.x = drawPt.x/zoom;
	drawPt.y = drawPt.y/zoom;

	return drawPt;
};
GAMEVIEW.BoxToDrawCoords = function(absBox, vShift, camera)
{
	if(typeof camera==="undefined" || camera==null)		camera=GAMEMODEL.modelCamera;
	if(typeof vShift === "undefined")	vShift = null;

	var zoom = camera.zoom;

	var drawBox = {x:0,y:0,w:0,h:0};
	var drawPt = GAMEVIEW.PtToDrawCoords(absBox, vShift, camera);

	drawBox.x = drawPt.x;
	drawBox.y = drawPt.y;
	drawBox.w = absBox.w/zoom;
	drawBox.h = absBox.h/zoom;

	return drawBox;
};

GAMEVIEW.updateAll = function()
{
	if(GAMEMODEL.gameMode === "GAME_RUN")
	{
//		var newTick = GAMEMODEL.getTime();
		var newTick = GAMEMODEL.getTime();

		var TickDiff = newTick - this.lastTick;
		this.avgTick = GAMEVIEW.calcAverageTick( TickDiff );

		this.lastTick = newTick;
	}
};
GAMEVIEW.drawAll = function()
{
//	this.context.fillStyle = "#FFFFFF";
//	this.context.fillRect( 0, 0, this.screen.w, this.screen.h );


		GAMEMODEL.drawAll();

};




/*		GAMEVIEW.drawFromAnimationFrame( frame, this.target.absPosition, {x:0,y:0}, this.target.absBox.ptC, this.target.drawLayer, null );
/**/
GAMEVIEW.drawFromAnimationFrame = function(frame, absPosition, camera, vShift, transf)
{
	if(typeof transf === "undefined" || transf == null)		transf = {};
	if(frame == null)	return;

	var imgFrame = GAMEANIMATIONS.getImageFrame(frame.imgNum, frame.imgFrameNum);
	if(imgFrame == null)	return;


	var drawSize = {w:0,h:0};
	drawSize.w = frame.scale.w*imgFrame.dim.w;
	drawSize.h = frame.scale.h*imgFrame.dim.h;
	drawSize.w = Math.abs(drawSize.w);
	drawSize.h = Math.abs(drawSize.h);

	var drawBox = {w:drawSize.w,h:drawSize.h};
	drawBox.x = absPosition.x - imgFrame.baseKeypt.x*frame.scale.w;
	drawBox.y = absPosition.y - imgFrame.baseKeypt.y*frame.scale.h;

	if( !GAMEVIEW.BoxIsInCamera(drawBox) )		return;

	if(typeof vShift === "undefined")	vShift = null;
	if(vShift == null)			vShift = {x:0,y:0};
	vShift.x -= imgFrame.baseKeypt.x*frame.scale.w;
	vShift.y -= imgFrame.baseKeypt.y*frame.scale.h;

	// convert to screen values
	var zoom = GAMEMODEL.modelCamera.zoom;
	drawSize.w = drawSize.w / zoom;
	drawSize.h = drawSize.h / zoom;

	var drawPos = GAMEVIEW.PtToDrawCoords(absPosition, vShift);

	if(typeof this.loadedImgs[frame.imgNum] === "undefined")	return;
	var img = this.loadedImgs[frame.imgNum].img;
	if(typeof img === "undefined" || img == null)	return;

		//draw frame
		this.context.save();

		this.context.scale(1,1);
		this.context.drawImage(img,

			imgFrame.pos.x,imgFrame.pos.y,   //sprite sheet top left
			imgFrame.dim.w, imgFrame.dim.h,    	//sprite sheet width/height
//			Math.floor(drawPos.x), Math.floor(drawPos.y), //destination x/y
			drawPos.x, drawPos.y, //destination x/y
			drawSize.w, drawSize.h
			   //destination width/height  (this can be used to scale)
		);

};

GAMEVIEW.fillBox = function(absBox, color)
{
	if(typeof color === "undefined")		color = "#FF0000";

	if( !GAMEVIEW.BoxIsInCamera(absBox) )		return;

	var drawBox = GAMEVIEW.BoxToDrawCoords(absBox);

	this.context.fillStyle=color;
	this.context.fillRect(drawBox.x, drawBox.y, drawBox.w, drawBox.h);
};
GAMEVIEW.drawBox = function(absBox, color, width)
{
	if(typeof color === "undefined")		color = "#FF0000";
	if(typeof width === "undefined")		width = 1;

	if( !GAMEVIEW.BoxIsInCamera(absBox) )		return;

	var drawBox = GAMEVIEW.BoxToDrawCoords(absBox);

	this.context.beginPath();
	this.context.rect(  drawBox.x, drawBox.y, drawBox.w, drawBox.h);
	this.context.lineWidth = width;
	this.context.strokeStyle = color;
	this.context.stroke();
	this.context.closePath();
};
GAMEVIEW.drawCircle = function(centerPt, radius, color, width)
{
	if(typeof color === "undefined")		color = "#FF0000";
	if(typeof width === "undefined")		width = 1;

	var absBox = {x:centerPt.x,y:centerPt.y,w:radius*2,h:radius*2};
	absBox.x = absBox.x - radius;
	absBox.y = absBox.y - radius;

	if( !GAMEVIEW.BoxIsInCamera(absBox) )		return;

	var zoom = GAMEMODEL.modelCamera.zoom;

	var drawCenter = GAMEVIEW.PtToDrawCoords(centerPt);

	radius = radius/zoom;
	this.context.beginPath();
	this.context.arc(drawCenter.x, drawCenter.y, radius, 0,2*Math.PI);
	this.context.lineWidth = width;
	this.context.strokeStyle = color;
	this.context.stroke();
	this.context.closePath();
};
GAMEVIEW.fillCircle = function(centerPt, radius, color)
{
	if(typeof color === "undefined")		color = "#FF0000";

	var absBox = {x:centerPt.x,y:centerPt.y,w:radius*2,h:radius*2};
	absBox.x = absBox.x - radius;
	absBox.y = absBox.y - radius;

	if( !GAMEVIEW.BoxIsInCamera(absBox) )		return;

	var zoom = GAMEMODEL.modelCamera.zoom;

	var drawCenter = GAMEVIEW.PtToDrawCoords(centerPt);

	radius = radius/zoom;

	this.context.beginPath();
	this.context.arc(drawCenter.x, drawCenter.y, radius, 0,2*Math.PI);
	this.context.fillStyle = color;
	this.context.fill();
};

GAMEVIEW.drawLine = function(absPt1, absPt2, color, width)
{
	if(typeof color === "undefined")		color = "#FF0000";
	if(typeof width === "undefined")		width = 1;

//	if( !GAMEVIEW.BoxIsInCamera(absPt1) )		return;		// LINE vs BOX

	var drawPt1 = GAMEVIEW.PtToDrawCoords(absPt1);
	var drawPt2 = GAMEVIEW.PtToDrawCoords(absPt2);

	this.context.moveTo(drawPt1.x, drawPt1.y);
	this.context.lineWidth = width;
	this.context.strokeStyle = color;
	this.context.lineTo(drawPt2.x, drawPt2.y);
	this.context.stroke();
	this.context.closePath();
};
GAMEVIEW.buildBoundingBox = function(pos, shape, transf)
{
	var absBox = {x:0,y:0,w:0,h:0};
	if(shape.type == "circle") {
		absBox.w = shape.radius*2;
		absBox.h = absBox.w;
	}
	if(shape.type == "box") {
		absBox.w = shape.width;
		absBox.h = shape.height;
	}
	absBox.x = pos.x - absBox.w/2;
	absBox.y = pos.y - absBox.h/2;

	if(shape.type == "line") {
		absBox.w = Math.abs(shape.pt2.x - shape.pt1.x);
		absBox.h = Math.abs(shape.pt2.y - shape.pt1.y);
		absBox.x = pos.x + Math.min(shape.pt1.x,shape.pt2.y);
		absBox.y = pos.y + Math.min(shape.pt1.y,shape.pt2.y);
	}
	if(shape.type == "shape") {
		absBox.x1 = shape.pts[0].x;		absBox.x2 = absBox.x1;
		absBox.y1 = shape.pts[0].y;		absBox.y2 = absBox.y1;
		for(var i in shape.pts) {
			if( absBox.x1 > shape.pts[i].x)		absBox.x1 = shape.pts[i].x;
			if( absBox.x2 < shape.pts[i].x)		absBox.x2 = shape.pts[i].x;
			if( absBox.y1 > shape.pts[i].y)		absBox.y1 = shape.pts[i].y;
			if( absBox.y2 < shape.pts[i].y)		absBox.y2 = shape.pts[i].y;
		}
		absBox.x = Math.min(absBox.x1,absBox.x2);
		absBox.y = Math.min(absBox.y1,absBox.y2)
		absBox.w = Math.abs(absBox.x2 - absBox.x1);
		absBox.h = Math.abs(absBox.y2 - absBox.y1);
		delete absBox.x1;			delete absBox.x2;
		delete absBox.y1;			delete absBox.y2;
	}

	return absBox;
};
GAMEVIEW.makeTransform = function(pos, shape, absBox, transf, reverse, context) {
	if(context==null || typeof context === "undefined")		context=this.context;
	var zoom = GAMEMODEL.modelCamera.zoom;

	var acts = [];
		for(var k in transf.actions) {
			if(reverse==true)		acts.unshift( transf.actions[k] );
			else 					acts.push( transf.actions[k] );
		}

	for(var i in acts) {
		if(reverse==false || reverse==null || typeof reverse === "undefined") {
			if(acts[i].type=='a')	context.globalAlpha = acts[i].alpha;
			if(acts[i].type=='t')	context.translate(acts[i].x/zoom, acts[i].y/zoom);
			if(acts[i].type=='s')	context.scale(acts[i].x,acts[i].y);
			if(acts[i].type=='tr')	context.transform(acts[i].m1,acts[i].m2,acts[i].m3,acts[i].m4,acts[i].m5,acts[i].m6);
			if(acts[i].type=='ts')	context.setTransform(acts[i].m1,acts[i].m2,acts[i].m3,acts[i].m4,acts[i].m5,acts[i].m6);
			if(acts[i].type=='ti')	context.resetTransform();
			if(acts[i].type=='r') {
				if(typeof acts[i].x==="undefined")	acts[i].x=0;
				if(typeof acts[i].y==="undefined")	acts[i].y=0;
				if(acts[i].center!=true)	context.translate(absBox.w/2,absBox.h/2);
				if(acts[i].x!=0 || acts[i].y!=0)	context.translate(acts[i].x,acts[i].y);
				context.rotate(acts[i].angle*Math.PI/180);
				if(acts[i].x!=0 || acts[i].y!=0)	context.translate(-acts[i].x,-acts[i].y);
				if(acts[i].center!=true)	context.translate(-absBox.w/2,-absBox.h/2);
			}
		}
		else {
			if(acts[i].type=='t')	context.translate(-acts[i].x/zoom, -acts[i].y/zoom);
			if(acts[i].type=='s')	context.scale(1/acts[i].x,1/acts[i].y);
			if(acts[i].type=='tr')	context.resetTransform();
			if(acts[i].type=='ts')	context.resetTransform();
			if(acts[i].type=='ti')	context.resetTransform();
			if(acts[i].type=='r') {
				if(typeof acts[i].x==="undefined")	acts[i].x=0;
				if(typeof acts[i].y==="undefined")	acts[i].y=0;
				if(acts[i].center!=true)	context.translate(absBox.w/2,absBox.h/2);
				if(acts[i].x!=0 || acts[i].y!=0)	context.translate(acts[i].x,acts[i].y);
				context.rotate((-acts[i].angle)*(Math.PI/180));
				if(acts[i].x!=0 || acts[i].y!=0)	context.translate(-acts[i].x,-acts[i].y);
				if(acts[i].center!=true)	context.translate(-absBox.w/2,-absBox.h/2);
			}
		}
  }


};
GAMEVIEW.drawElement = function(pos, shape, prop, transf, camera)
{
	if(typeof prop==="undefined" || prop==null)	prop = {};
	if(typeof prop.color === "undefined")		prop.color = "#FF0000";
	if(typeof prop.width === "undefined")		prop.width = 1;

	if(typeof camera==="undefined" || camera==null)		camera=GAMEMODEL.modelCamera;

	var absBox = this.buildBoundingBox(pos, shape, transf);
//		console.log( JSON.stringify(camera.absBox) );
//	if( !GAMEVIEW.BoxIsInCamera(absBox,camera) )	return;
	if(camera == null)	return;

	var drawPt = this.PtToDrawCoords(pos,null,camera);
	var drawBox = GAMEVIEW.BoxToDrawCoords(absBox,null,camera);
	var zoom = camera.zoom;
//	if(shape.type == "circle")	console.log(JSON.stringify(camera.position)+'='+JSON.stringify(camera.getCameraShift()));

	var writeToContext = 0;
	var drawContext = this.context;

	if(typeof prop.writeTo!=="undefined") {
		writeToContext = prop.writeTo;
		drawContext = this.contextArr[writeToContext].context;
		this.contextArr[writeToContext].drawnOn = true;
	}
	drawContext.save();


	if(typeof prop.source!=="undefined") {
		if(prop.source=="default")	drawContext.globalCompositeOperation="source-over";
		drawContext.globalCompositeOperation = prop.source;
	}


	if(transf.actions !== "undefined" && transf.actions != null) {
		if(shape.type=="box")	drawBox = {x:(-drawBox.w/2),y:(-drawBox.h/2),w:drawBox.w,h:drawBox.h};
		transf.actions.unshift({type:'t',x:drawPt.x*zoom,y:drawPt.y*zoom});
		drawPt = {x:0,y:0};
		GAMEVIEW.makeTransform(drawPt, shape, absBox, transf, false, drawContext);
	}


	if(shape.type == "box" && prop.fill == true) {
		drawContext.fillStyle = prop.color;
		drawContext.translate(drawBox.x,drawBox.y);
		drawContext.fillRect(0, 0, drawBox.w, drawBox.h);
	}
	else if(shape.type == "text") {
		var tfont =	drawContext.font;
		drawContext.font = prop.font;
		if(prop.fill == true) {
			drawContext.fillStyle = prop.color;
			drawContext.fillText(shape.text,drawPt.x,drawPt.y);
		}
		else {
			drawContext.lineWidth = prop.width;
			drawContext.strokeStyle = prop.color;
			drawContext.strokeText(shape.text,drawPt.x,drawPt.y);
		}
	}
	else {
	    drawContext.beginPath();

	    if(shape.type == "box" && prop.fill == false) {
			drawContext.rect(  drawBox.x, drawBox.y, drawBox.w, drawBox.h);
			drawContext.lineWidth = prop.width;
			drawContext.strokeStyle = prop.color;
	    }
	    else if(shape.type == "line") {
			if(typeof shape.pt1==="undefined")		shape.pt1 = {x:0,y:0};
			if(shape.pt1==null)						shape.pt1 = {x:0,y:0};
			drawContext.moveTo(drawPt.x+shape.pt1.x/zoom, drawPt.y+shape.pt1.y/zoom);
			drawContext.lineWidth = prop.width;
			drawContext.strokeStyle = prop.color;
			drawContext.lineTo(drawPt.x+shape.pt2.x/zoom, drawPt.y+shape.pt2.y/zoom);
		}
	    else if(shape.type == "circle") {
//				console.log(JSON.stringify(drawPt)+'-'+shape.radius);
			drawContext.arc(drawPt.x, drawPt.y, shape.radius/zoom, 0,2*Math.PI);
	    	if(prop.fill == true) {
				drawContext.fillStyle = prop.color;
	    	}
	    	else {
				drawContext.lineWidth = prop.width;
				drawContext.strokeStyle = prop.color;
	    	}
	    }
	    else if(shape.type == "image") {
		    drawContext.drawImage(shape.img, drawPt.x, drawPt.y);
	    }
	    else if(shape.type == "text") {
	    	if(prop.fill == true)	drawContext.fillText(shape.text,drawPt.x,drawPt.y);
	    	else 					drawContext.strokeText(shape.text,drawPt.x,drawPt.y);
	    }
	    else if(shape.type == "shape") {
					if(prop.fill == true) {
						drawContext.fillStyle = prop.color;
					}
					else {
						drawContext.lineWidth = prop.width;
						drawContext.strokeStyle = prop.color;
					}

//		    drawContext.beginPath();
		    	var pts = shape.pts;
//					drawContext.moveTo(drawPt.x, drawPt.y);
		    	for(var i in pts) {
//	    			if(pts[i].t=='l')		console.log(pts[i].x/zoom+","+pts[i].y/zoom);
						if(pts[i].t != 'b') {
							var ptx = pts[i].x/zoom + drawPt.x;
							var pty = pts[i].y/zoom + drawPt.y;
						}
						else {
							var ptx1 = pts[i].x1/zoom + drawPt.x;
							var pty1 = pts[i].y1/zoom + drawPt.y;
							var ptx2 = pts[i].x2/zoom + drawPt.x;
							var pty2 = pts[i].y2/zoom + drawPt.y;
							var ptxb = pts[i].xb/zoom + drawPt.x;
							var ptyb = pts[i].yb/zoom + drawPt.y;
						}

		    		if(pts[i].t=='m')		drawContext.moveTo(ptx, pty);
	    			if(pts[i].t=='l')		drawContext.lineTo(ptx, pty);
					if(pts[i].t=='b')		drawContext.bezierCurveTo(ptx1,pty1, ptx2,pty2, ptxb,ptyb);
					if(pts[i].t=='a')		drawContext.arc(ptx,pty, pts[i].r/zoom, pts[i].ar1,pts[i].ar2,false);
					if(pts[i].t=='r')		drawContext.rect(ptx,pty, pts[i].w,pts[i].h);
		        }
//						drawContext.moveTo(-drawPt.x, -drawPt.y);

	    }


	    if(prop.fill == true && shape.type != "line" && shape.type != "shape") {
			drawContext.fill();
	    }
	    else if(shape.type != "shape") {
			drawContext.stroke();
	    }
	    else if(shape.type == "image") {
	    }
	    else if(shape.type == "shape") {
			if(prop.fill == true)	drawContext.fill();
			else 					drawContext.stroke();
	    }
//	    else {
	    	drawContext.closePath();
//	    }

	    if(shape.type == "text") {
			drawContext.font = tfont;
	    }
	}


	if(transf.actions !== "undefined") {
//		GAMEVIEW.makeTransform(drawPt, shape, absBox, transf, true, drawContext);
	}

    if(typeof prop.applyTo!=="undefined") {
    	var applyToContext = this.contextArr[prop.applyTo].context;
		if(typeof prop.source!=="undefined") {
			if(prop.source=="default")	applyToContext.globalCompositeOperation="source-over";
			applyToContext.globalCompositeOperation = prop.source;
		}

    	var propX=0;	var propY=0;
    	if(typeof prop.applyX!=="undefined")	propX=prop.applyX;
    	if(typeof prop.applyY!=="undefined")	propY=prop.applyY;
	    applyToContext.drawImage(this.contextArr[writeToContext].canvas,propX,propY);
		drawContext.clearRect(0,0,this.screen.w,this.screen.h);
		delete this.contextArr[writeToContext].drawnOn;
    }

	drawContext.restore();
	if(typeof prop.writeTo==="undefined") {
	}
};
GAMEVIEW.drawAnimationElement = function(frame, pos, shape, prop, transf, camera)
{
	if(typeof prop==="undefined" || prop==null)	prop = {};
	if(typeof prop.color === "undefined")		prop.color = "#FF0000";
	if(typeof prop.width === "undefined")		prop.width = 1;

	if(typeof camera==="undefined" || camera==null)		camera=GAMEMODEL.modelCamera;
	if(frame == null)	return;

	var imgFrame = GAMEANIMATIONS.getImageFrame(frame.imgNum, frame.imgFrameNum);
	if(imgFrame == null)	return;

	var frameSize = {w:0,h:0};
	frameSize.w = frame.scale.w*imgFrame.dim.w;
	frameSize.h = frame.scale.h*imgFrame.dim.h;
	frameSize.w = Math.abs(frameSize.w);
	frameSize.h = Math.abs(frameSize.h);

	var absBox = {w:frameSize.w,h:frameSize.h};
	absBox.x = pos.x - imgFrame.baseKeypt.x*frame.scale.w;
	absBox.y = pos.y - imgFrame.baseKeypt.y*frame.scale.h;

//		console.log( JSON.stringify(camera.absBox) );
	if( !GAMEVIEW.BoxIsInCamera(absBox,camera) )	return;

	var vShift = {x:0,y:0};
	vShift.x -= imgFrame.baseKeypt.x*frame.scale.w;
	vShift.y -= imgFrame.baseKeypt.y*frame.scale.h;

	var zoom = camera.zoom;
	frameSize.w = frameSize.w / zoom;
	frameSize.h = frameSize.h / zoom;

	var drawPt = this.PtToDrawCoords(pos,vShift,camera);
	var drawBox = GAMEVIEW.BoxToDrawCoords(absBox,vShift,camera);

	if(typeof this.loadedImgs[frame.imgNum] === "undefined")	return;
	var img = this.loadedImgs[frame.imgNum].img;
	if(typeof img === "undefined" || img == null)	return;


	var writeToContext = 0;
	var drawContext = this.context;

	if(typeof prop.writeTo==="undefined") {
		this.context.save();
	}
	else {
		writeToContext = prop.writeTo;
		drawContext = this.contextArr[writeToContext].context;
		this.contextArr[writeToContext].drawnOn = true;
	}

	if(typeof prop.source!=="undefined") {
		if(prop.source=="default")	drawContext.globalCompositeOperation="source-over";
		drawContext.globalCompositeOperation = prop.source;
	}

	if(transf.actions !== "undefined" && transf.actions != null) {
		if(shape.type=="box")	drawBox = {x:(-drawBox.w/2),y:(-drawBox.h/2),w:drawBox.w,h:drawBox.h};
		transf.actions.unshift({type:'t',x:drawPt.x*zoom,y:drawPt.y*zoom});
		drawPt = {x:0,y:0};
		GAMEVIEW.makeTransform(drawPt, shape, absBox, transf, false, drawContext);
	}


	if(shape.type == "frame") {
			//draw frame
		drawContext.scale(1,1);
		drawContext.drawImage(img,

			imgFrame.pos.x,imgFrame.pos.y,   //sprite sheet top left
			imgFrame.dim.w, imgFrame.dim.h,    	//sprite sheet width/height
//			Math.floor(drawPos.x), Math.floor(drawPos.y), //destination x/y
			drawPt.x, drawPt.y, //destination x/y
			frameSize.w, frameSize.h
			   //destination width/height  (this can be used to scale)
		);

	}


	if(transf.actions !== "undefined") {
		GAMEVIEW.makeTransform(drawPt, shape, absBox, transf, true, drawContext);
	}

    if(typeof prop.applyTo!=="undefined") {
    	var propX=0;	var propY=0;
    	if(typeof prop.applyX!=="undefined")	propX=prop.applyX;
    	if(typeof prop.applyY!=="undefined")	propY=prop.applyY;
	    this.contextArr[prop.applyTo].context.drawImage(this.contextArr[writeToContext].canvas,propX,propY);
		this.contextArr[writeToContext].context.clearRect(0,0,this.screen.w,this.screen.h);
		delete this.contextArr[writeToContext].drawnOn;
    }

	if(typeof prop.writeTo==="undefined") {
		this.context.restore();
	}
};


GAMEVIEW.drawShape = function(pos, pts, transf, color, mode, width)
{
	if(this.clipset == false)	this.context.save();

	if(mode == "clip")			this.clipset = true;
    if(mode == "restore") {
	    this.context.restore();
	    this.clipset = false;
	    return;
    }


	if(typeof color === "undefined")		color = "#FF0000";
	if(typeof width === "undefined")		width = 1;

	var absBox = {x:0,y:0,w:0,h:0};
	for(var i in pts) {
		absBox.x = pts[i].x + transf.t2.x;
		absBox.y = pts[i].y + transf.t2.y;
		absBox.w = absBox.x*absBox.x + absBox.y*absBox.y;
		if(absBox.h < absBox.w)		absBox.h = absBox.w;
	}
	absBox.w = Math.sqrt(absBox.h)*2;
	absBox.h = absBox.w;
	absBox.x = pos.x + transf.t1.x - absBox.w/2;
	absBox.y = pos.y + transf.t1.y - absBox.h/2;

	if( !GAMEVIEW.BoxIsInCamera(absBox) )		return;


	var zoom = GAMEMODEL.modelCamera.zoom;
	var drawPt = this.PtToDrawCoords(pos);

			this.context.translate(drawPt.x, drawPt.y);
		    this.context.translate(transf.t1.x/zoom, transf.t1.y/zoom);
	        var a = transf.ang*Math.PI/180;
     		this.context.rotate(a);
		    this.context.translate(transf.t2.x/zoom, transf.t2.y/zoom);

	    this.context.beginPath();

	    	for(var i in pts) {
	    		if(pts[i].t=='m')		this.context.moveTo(pts[i].x/zoom, pts[i].y/zoom);
    			if(pts[i].t=='l')		this.context.lineTo(pts[i].x/zoom, pts[i].y/zoom);
				if(pts[i].t=='b')		this.context.bezierCurveTo(pts[i].x1/zoom,pts[i].y1/zoom, pts[i].x2/zoom,pts[i].y2/zoom, pts[i].xb/zoom,pts[i].yb/zoom);
				if(pts[i].t=='a')		this.context.arc(pts[i].x,pts[i].y, pts[i].r/zoom, pts[i].ar1,pts[i].ar2,false);
				if(pts[i].t=='r')		this.context.rect(pts[i].x,pts[i].y, pts[i].w,pts[i].h);
	        }


	        if(mode == "fill") {
	        	this.context.fillStyle = color;
	        	this.context.fill();
	        }
	        else if(mode == "stroke"){
				this.context.lineWidth = width;
				this.context.strokeStyle = color;
	    	    this.context.stroke();
	    	}

	  	this.context.closePath();

	        if(mode == "clip"){
			    this.context.clip();
			}

			    this.context.translate(-transf.t2.x/zoom, -transf.t2.y/zoom);
		        this.context.rotate(-a);
			    this.context.translate(-transf.t1.x/zoom, -transf.t1.y/zoom);
				this.context.translate(-drawPt.x, -drawPt.y);


	if(this.clipset == false)	this.context.save();
};

GAMEVIEW.fillText = function(absPt, text, font, color)
{
	if(typeof color === "undefined")		color = "#FF0000";

//	if( !GAMEVIEW.BoxIsInCamera(absPt1) )		return;		// LINE vs BOX

	var drawPt = GAMEVIEW.PtToDrawCoords(absPt);

	this.context.font = font;
	this.context.fillStyle = color;
	this.context.fillText(text,drawPt.x,drawPt.y);
};
GAMEVIEW.drawText = function(absPt, text, font, color, width)
{
	if(typeof color === "undefined")		color = "#FF0000";
	if(typeof width === "undefined")		width = 1;

//	if( !GAMEVIEW.BoxIsInCamera(absPt1) )		return;		// LINE vs BOX

	var drawPt = GAMEVIEW.PtToDrawCoords(absPt);
	var tfont =	this.context.font;


	this.context.font = font;
	this.context.lineWidth = width;
	this.context.strokeStyle = color;
	this.context.strokeText(text,drawPt.x,drawPt.y);

	this.context.font = tfont;
};


GAMEVIEW.drawEllipses = function(pos, size, ellshift, fill, a, color, width) {
	var kappa = 0.5522848;

	var t = {t1:{x:0,y:0},t2:ellshift, ang:a};
	var pt = {x:0,y:0};
	var endX = pt.x + size.w/2;
	var endY = pt.y + size.h/2;
	var baseX = pt.x - size.w/2;
	var baseY = pt.y - size.h/2;
	var offX = kappa* size.w/2;
	var offY = kappa* size.h/2;

	var pts = [ {t:'m',x:baseX,y:pt.y} ];
	pts.push( {t:'b',x1:baseX,y1:(pt.y-offY),	x2:(pt.x-offX),y2:baseY,	xb:pt.x,yb:baseY} );
	pts.push( {t:'b',x1:(pt.x+offX),y1:baseY,	x2:endX,y2:(pt.y-offY),		xb:endX,yb:pt.y} );
	pts.push( {t:'b',x1:endX,y1:(pt.y+offY),	x2:(pt.x+offX),y2:endY,		xb:pt.x,yb:endY} );
	pts.push( {t:'b',x1:(pt.x-offX),y1:endY,	x2:baseX,y2:(pt.y+offY),	xb:baseX,yb:pt.y} );

	if(fill == true)		fill = "fill";
	else if(fill == false)	fill = "stroke";
	if(!width)		width=1;

	GAMEVIEW.drawShape(pos, pts,  t, color, fill, width);
};
GAMEVIEW.drawEqTri = function(side, pos, fill, a, color, width) {
	var h = side * 0.866025;
	var t = {t1:{x:0,y:0},t2:{x:0,y:-5}, ang:a};
	pts = [ {t:'m',x:0,y:(-h/2)} ];
	pts.push( {t:'l',x:(-side/2),y:(h/2)} );
	pts.push( {t:'l',x:(side/2),y:(h/2)} );
	pts.push( {t:'l',x:0,y:(-h/2)} );

	if(fill == true)		fill = "fill";
	else if(fill == false)	fill = "stroke";
	if(!width)		width=1;

	GAMEVIEW.drawShape(pos, pts, t, color, fill, width);
};


exports.GAMEVIEW = GAMEVIEW;
exports.GAMEVIEW._loadJSEngineClasses = _loadJSEngineClasses;
