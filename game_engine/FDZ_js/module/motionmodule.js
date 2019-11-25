// CommonJS ClassLoader Hack
var classLoadList = ["ActionModule"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MotionModule"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function MotionModule() {
}

MotionModule.prototype = new ActionModule;
MotionModule.prototype.identity = function() {
	return ('MotionModule (' +this._dom.id+ ')');
};
MotionModule.prototype.init = function() {
	ActionModule.prototype.init.call(this);

	this.filter = null;
};
MotionModule.prototype.eraseMovingScripts = function() {
	this.actionLists = {};
};
MotionModule.prototype.activeMoveCount = function() {
	var obj = ActionModule.prototype.actionCount.call(this);
	return obj['_all'];
};

MotionModule.prototype.update = function() {
	return ActionModule.prototype.update.call(this);
};

MotionModule.prototype.buildPathItem = function(pathdefn) {
	var move2 = MoveActor.alloc();
/*
	if(pathdefn['type'] == "line") {
		//	set Duration (for duration)
		//

		//	get endpoint?

	}

/**/
//	if(pathdefn['type'] == "Line")

	move2.loadBasics();
	move2.movingActor = this.parent;
	if(pathdefn['dur']) {
			move2.duration.duration = pathdefn['dur'];
	}
	if(pathdefn['spd']) {
			move2.increment.spdPerTick = pathdefn['spd'];
	}

	if(pathdefn['dur'] && pathdefn['head'])				move2.heading.setHeadingByVector(pathdefn['head'], pathdefn['dur']*1.1);
	else if(pathdefn['ept'])	{
		move2.heading.setHeadingByRelPt(pathdefn['ept']);
	}
	else if(pathdefn['dur'] && pathdefn['spd'] && pathdefn['head'])	{
		move2.heading.setHeadingByVector(pathdefn['head'], (pathdefn['spd']*pathdefn['dur']));
	}

//	if(!pathdefn['spd'] && pathdefn['dur'])
	return move2;
};
MotionModule.prototype.buildPathSequence = function(movename,pathseq) {
	if(this.parent instanceof Actor) {
		this.parent.clearModuleActionList(this,this.parent.motionModule);
		var alist = ActionList.alloc();
		this.parent.motionModule.actionLists[movename] = alist;
		alist.target = this.parent;

		for(var i in pathseq) {
			var moveitem = this.buildPathItem(pathseq[i]);
			alist.addAction(moveitem);
		}




	}



    if(context.stepModule instanceof StepModule) {
      context.stepModule.beginStep = function(stepnum,stepdata) {
/*        context.clearModuleActionList(context.motionModule,"H");
        context.stepModule.stepNum = stepnum;
        //        context.stepModule.clearModuleStepList();

        var alist = ActionList.alloc();
        context.motionModule.actionLists["H"] = alist;
        alist.target = context;


				var move2 = MoveActor.alloc();
        alist.addAction(move2);
        move2.loadBasics();
        move2.movingActor = context;
        move2.increment.spdPerTick = context.unitSpeedH;
        move2.duration.duration = context.turntime;

        move2.heading.update = function() {
          var hdir = {};
          hdir.x = this.endPt.x - this.startPt.x;
          hdir.y = this.endPt.y - this.startPt.y;

          var actor = Actor.alloc();
          var a = actor.getAngleFromHeading(hdir);
          if(hdir.x > 0)          a += 0.005 * this.parentMoveActor.heldTime;
          else                    a -= 0.005 * this.parentMoveActor.heldTime;
          var hnew = actor.getHeadingFromAngle(a);
          var d = Math.sqrt(actor.distanceSquareToPt(this.startPt,this.endPt));
          hnew.x *= d;
          hnew.y *= d;
          this.endPt.x = this.startPt.x + hnew.x;
          this.endPt.y = this.startPt.y + hnew.y;
        };

        //        context.shotHeading = context.getHeadingAt(GAMEMODEL.gameSession.gamePlayer.position);
        //        context.defaultShot = 0;
        context.shoot();
        if(stepnum%2 == 0)   move2.heading.setHeadingByVector({x:1,y:0}, context.turntime*1.5*context.unitSpeedH);
        if(stepnum%2 == 1)   move2.heading.setHeadingByVector({x:-1,y:0}, context.turntime*1.5*context.unitSpeedH);
        move2.duration.duration *= 1.5;
        context.stepModule.loadStep('name',{'stepnum':(stepnum+1)}, {'time':(context.turntime*1.5)});
				/**/
      };
    }

};


MotionModule.alloc = function() {
	var vc = new MotionModule();
	vc.init();
	return vc;
};


exports.MotionModule = MotionModule;
exports.MotionModule._loadJSEngineClasses = _loadJSEngineClasses;
