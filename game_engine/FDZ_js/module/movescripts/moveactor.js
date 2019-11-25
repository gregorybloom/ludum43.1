// CommonJS ClassLoader Hack
var classLoadList = ["ActionObject"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MoveActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function MoveActor() {
}
MoveActor.prototype = new ActionObject;

MoveActor.prototype.identity = function()
{
	return ('MoveActor (' + this._dom.id + ')');
};

MoveActor.prototype.init = function() {
	ActionObject.prototype.init.call(this);

	this.alive = true;

	this.startPt = {x:0,y:0};
	this.currEndPt = {x:0,y:0};
	this.lastEndPt = {x:0,y:0};


	this.lastBaseT = 0;

	this.heldTime = 0;
	this.sumDist = 0;
	this.sumTime = 0;

	this.lastShift = {x:0,y:0};
	this.currPt = {x:0,y:0};
	this.lastPt = {x:0,y:0};
	this.lastStep = {x:0,y:0};
	this.currStep = {x:0,y:0};

	this.movingActor = null;

	this.increment = null;
	this.heading = null;
	this.duration = null;

	this.progress = null;
	this.path = null;

	this.started = false;
};
MoveActor.prototype.loadBasics = function() {
	var inc2 = IncrementBySpeed.alloc();
	var head2 = HeadingByVector.alloc();
	var durt2 = DurationByTime.alloc();
	var lprog2 = LinearProgress.alloc();
	var lpath2 = LinearPath.alloc();
	this.increment = inc2;
	this.heading = head2;
	this.duration = durt2;
	this.progress = lprog2;
	this.path = lpath2;
};
MoveActor.prototype.start = function() {
	ActionObject.prototype.start.call(this);

	if(this.heading == null)								return;
	if(this.movingActor == null)							return;
	if(typeof this.movingActor.position === "undefined")	return;

	this.started = true;

	if(this.increment != null)	this.increment.parentMoveActor = this;
	if(this.heading != null)	this.heading.parentMoveActor = this;
	if(this.duration != null)	this.duration.parentMoveActor = this;
	if(this.progress != null)	this.progress.parentMoveActor = this;
	if(this.path != null)		this.path.parentMoveActor = this;

/*
//	this.startPt.x = this.movingActor.position.x;
//	this.startPt.y = this.movingActor.position.y;
//	this.currPt.x = this.startPt.x;
//	this.currPt.y = this.startPt.y;
//	this.currPt = {x:0,y:0};
/**/
	this.startPt = {x:0,y:0};
	this.lastShift = {x:0,y:0};

	this.lastEndPt = this.heading.calculateNewEndpt();
/*
//	this.lastEndPt.x += this.startPt.x;
//	this.lastEndPt.y += this.startPt.y;
/*	if(this.heading.absolutePt == true)
	{
		var ptshift = this.movingActor.getAbsoluteShift();
		this.lastEndPt.x = this.lastEndPt.x - ptshift.x;
		this.lastEndPt.y = this.lastEndPt.y - ptshift.y;
	}		/**/

	this.increment.start();
	this.heading.start();
	this.duration.start();
	this.progress.start();
	this.path.start();
};

MoveActor.prototype.update = function() {
	return ActionObject.prototype.update.call(this);
}

MoveActor.prototype.act = function(time) {
	if(this.movingActor == null)		return 0;
	if(this.heading == null || this.duration == null || this.increment == null)		return 0;
	if(this.progress == null || this.path == null)		return 0;


	this.heldTime = time;
	if(time > 0) {
		this.increment.update();
		this.heading.update();
		this.duration.update();
		this.progress.update();
		this.path.update();
	}


	if(this.duration != null)	this.duration.trimToLimit();

	if(this.heading != null && this.movingActor != null)
	{
		this.currEndPt = this.heading.calculateNewEndpt();
/*		if(this.heading.absolutePt == true)
		{
			var ptshift = this.movingActor.getAbsoluteShift();
			this.currEndPt.x = this.currEndPt.x - ptshift.x;
			this.currEndPt.y = this.currEndPt.y - ptshift.y;
		}		/**/
	}

	var total = 1.0;
	var top = 1.0;
	var newBaseT = 1.0;
	var newPrT = 1.0;


	if(this.increment != null)
	{
		total = this.increment.getTotal();
		top = this.increment.calculateNewTop(time);
	}
	if(total != 0)	newBaseT = top/total;

//	if(this.movingActor.enemyType == 0)		console.log(this.testName + "   : "+newBaseT+'='+top+'/'+total+'   v '+time);


	var prg = this.progress.getProgress(this.lastBaseT);
	this.lastPt = this.path.getPosition( prg, this.startPt, this.lastEndPt );
//	this.lastPt.x = this.currPt.x;
//	this.lastPt.y = this.currPt.y;

	newBaseT = this.heading.clipBaseT( newBaseT );
	newPrT = this.progress.getProgress( newBaseT );
	newPrT = this.heading.clipProgress( newPrT );
	if(newPrT > 1)		newPrT=1;

//	if(this.movingActor.enemyType == 0)		console.log(this.testName + "   : "+newPrT + " , diff " + (newBaseT-this.lastBaseT));

	var shiftpt = this.path.getPosition( newPrT, this.startPt, this.currEndPt );

/*
	shiftpt.x -= this.lastShift.x;
	shiftpt.y -= this.lastShift.y;
	this.currPt.x = this.lastPt.x + shiftpt.x;
	this.currPt.y = this.lastPt.y + shiftpt.y;
	this.lastShift.x += shiftpt.x;
	this.lastShift.y += shiftpt.y;
/**/

//	if(this.movingActor.enemyType == 0)		console.log(this.testName + "   : "+  newPrT +' : '+ JSON.stringify(shiftpt) +' , '+JSON.stringify(this.currPt)  );
	this.currStep = {x:0,y:0};
/*	this.currStep.x = this.currPt.x - this.lastPt.x;
	this.currStep.y = this.currPt.y - this.lastPt.y;
/**/
	this.currStep.x = shiftpt.x - this.lastPt.x;
	this.currStep.y = shiftpt.y - this.lastPt.y;

	if(this.duration != null)	this.duration.trimToLimit();

	this.sumTime += time;
	this.lastEndPt.x = this.currEndPt.x;
	this.lastEndPt.y = this.currEndPt.y;
	this.lastBaseT = newBaseT;
	var ddiff = Math.sqrt( this.currStep.x*this.currStep.x + this.currStep.y*this.currStep.y );
	this.sumDist += ddiff;
	this.lastStep.x = this.currStep.x;
	this.lastStep.y = this.currStep.y;
//	if(this.movingActor.enemyType == 0)		console.log(this.testName + "   : "+'** '+(newBaseT-prg)+'='+ddiff+'='+JSON.stringify(this.currStep)+' v '+JSON.stringify(this.currPt));
	this.currStep = {x:0,y:0};

	var newPt = {x:0,y:0};
	newPt.x = this.movingActor.position.x + this.lastStep.x;
	newPt.y = this.movingActor.position.y + this.lastStep.y;
//////	if(typeof this.movingActor.enemyType !== "undefined")		console.log(  this.movingActor.enemyClass + ','+this.movingActor.enemyType+':'+JSON.stringify(this.movingActor.position)+" == " +JSON.stringify(this.lastStep) );
	if(this.movingActor != null)	this.movingActor.updatePosition( newPt );

	var one = this.heading.reachedHeading( newBaseT, this.newPrT );
	var two = this.duration.durationReached();
	var three = this.lastBaseT;
//	if(this.movingActor.enemyType == 0)		console.log('---'+this.testName + "   : "+'**** '+one+'='+two+'='+three);

	if(this.heading != null)
	{
		if(this.heading.reachedHeading( newBaseT, this.newPrT )==true)	this.clear();
	}
	if(this.duration != null)
	{
		if(this.duration.durationReached()==true)	this.clear();
	}
	if(this.lastBaseT >= 1) {
		this.clear();
	}

	return time;
};
MoveActor.prototype.kill = function() {
	this.clear();
};
MoveActor.prototype.clear = function() {
	this.increment = null;
	this.heading = null;
	this.duration = null;
	this.progress = null;
	this.path = null;

	this.alive=false;
};

MoveActor.alloc = function() {
	var vc = new MoveActor();
	vc.init();
	return vc;
};


exports.MoveActor = MoveActor;
exports.MoveActor._loadJSEngineClasses = _loadJSEngineClasses;
