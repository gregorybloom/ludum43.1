// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["BEHAVIOR_BUILDER"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


BEHAVIOR_BUILDER={
	actionlists: {}
};
//      0       North
//      90      East
//      180     South?
//      270     West
BEHAVIOR_BUILDER.init = function()
{

	return true;
};
BEHAVIOR_BUILDER.clear = function()
{
  this.actionlists = null;
};
BEHAVIOR_BUILDER.fetchStart = function(name,data) {
  if(name == "B1") {
    return (function(actor,payload){
      actor.stepModule.beginStepPath("OPENING");
      actor.stepModule.loadStep("step1", {'stepnum':0}, {'time':500});
      actor.stepModule.loadStep("step2", {'stepnum':1}, {'time':2500});
      actor.stepModule.loadStep("step3", {'stepnum':2}, {'time':4000});
      actor.stepModule.saveStepFunctions("start","OPENING",0,function(time,snum,sgroup,stepvals){actor.unitSpeed=0.05;actor.facingAngle=270;});
      actor.stepModule.saveStepFunctions("start","OPENING",1,function(time,snum,sgroup,stepvals){
        if(actor instanceof EnemyJumperActor && actor.teleCircle)   actor.teleCircle.beginTeleport(180,2000, 2000);
      });
      actor.stepModule.saveStepFunctions("start","OPENING",2,function(time,snum,sgroup,stepvals){actor.unitSpeed=0.05;actor.facingAngle=90;});
      actor.stepModule.saveStepFunctions("end","OPENING",2,function(time,snum,sgroup,stepvals){actor.alive=false;});
    });
  }




  if(name == "C1" && data == 0) {
    return (function(actor,payload){
//      actor.clearModuleActionList(actor.motionModule,"H");
      actor.stepModule.beginStepPath("OPENING");
      actor.stepModule.loadStep("step1", {'stepnum':0}, {'time':500});
      actor.stepModule.loadStep("step2", {'stepnum':1}, {'time':1500});
      actor.stepModule.saveStepFunctions("start","OPENING",1,function(time,snum,sgroup,stepvals){
        if(actor instanceof EnemyJumperActor && actor.teleCircle)   actor.teleCircle.beginTeleport(180,1500);
      });
    });
  }
  if(name == "C2") {
    return (function(actor,payload){
      actor.stepModule.beginStepPath("OPENING");
      actor.stepModule.loadStep("step1", {'stepnum':0}, {'time':500});
      actor.stepModule.loadStep("step2", {'stepnum':1}, {'time':1500});
      actor.stepModule.loadStep("step3", {'stepnum':2}, {'time':1000});
      actor.stepModule.saveStepFunctions("start","OPENING",1,function(time,snum,sgroup,stepvals){
        if(actor instanceof EnemyJumperActor && actor.teleCircle && data == 0)   actor.teleCircle.beginTeleport(90,1500);
        if(actor instanceof EnemyJumperActor && actor.teleCircle && data == 1)   actor.teleCircle.beginTeleport(270,1500);
      });
      actor.stepModule.saveStepFunctions("start","OPENING",2,function(time,snum,sgroup,stepvals){
        if(actor instanceof EnemyJumperActor && actor.teleCircle)   actor.unitSpeed = 0.01;
      });
    });
  }
  if(name == "S1" && data == 0) {
//    return (function(actor,payload){ });
  }
};

BEHAVIOR_BUILDER.getFunctions = function(type,typeset,context,rundata)
{
  var datalist = {};
	if(typeof typeset === "undefined")		return;

  if(type=="SQUAD_REQUEST" && typeset['id'] == 1) {
    datalist['vars'] = {};
    datalist['vars']['target'] = null;

//    datalist['funcs'] = {};
  }
  if(type=="SQUAD_REQUEST" && typeset['id'] == 1 && typeof rundata['behavior'] === "undefined") {
    if(context.stepModule instanceof StepModule) {
      context.stepModule.beginStep = function(stepnum,stepdata) {
/*        context.update = function() {
          CircleEnemy.prototype.update.call(context);
          var dropPos = {x:0,y:0};
          dropPos.y += GAMEMODEL.dropSpeed*context.ticksDiff;
          context.shiftPosition(dropPos);
        };        /**/
      };
    }
  }
  if(type=="SQUAD_REQUEST" && typeset['id'] == 1 && rundata['behavior'] === "set1") {
    if(context.stepModule instanceof StepModule) {
      context.stepModule.beginStep = function(stepnum,stepdata) {
/*
        context.clearModuleActionList(context.motionModule,"H");
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
        context.stepModule.loadStep('name', {'stepnum':(stepnum+1)}, {'time':(context.turntime*1.5)});
        /**/
      };
    };
  }
  return datalist;
};




	/*
	if(this.enemyClass == "LEGGIONAIRRE" && this.enemyType >= 0) {
			this.clearModuleActionList(this.motionModule,"H");
			if(this.enemyType == 2)		return;
			var alist = ActionList.alloc();


			var speed = this.unitSpeedH;
			var inc2 = IncrementBySpeed.alloc();	inc2.spdPerTick = speed;
			var head2 = HeadingByVector.alloc();
			var durt2 = DurationByTime.alloc();	durt2.duration = this.turntime;
			var lprog2 = LinearProgress.alloc();
			var lpath2 = LinearPath.alloc();

			var move2 = MoveActor.alloc();
			move2.movingActor = this;
			move2.increment = inc2;
			move2.heading = head2;
			move2.duration = durt2;
			move2.progress = lprog2;
			move2.path = lpath2;

			if(this.enemyType == 0) {
				if(stepnum == 0) {
					head2.setHeadingByVector({x:0,y:1}, 500000*speed);
					alist.addAction(move2);
					durt2.duration *= 1.5;
					this.loadStep({'stepnum':(stepnum+1)}, {'time':(this.turntime*1.5)});


					var Halist = ActionList.alloc();
					var Hmove3 = MoveActor.alloc();
					var speed = this.unitSpeedH/5;

					var head3 = HeadingByVector.alloc();
					head3.setHeadingByVector({x:1,y:0}, 15000);
					var durt3 = DurationByTime.alloc();	durt3.duration = this.turntime*0.3;
					var inc3 = IncrementBySpeed.alloc();	inc3.spdPerTick = speed*4;
					var lpath3 = LinearPath.alloc();
					var lprog3 = LinearProgress.alloc();
					Hmove3.movingActor = this;
					Hmove3.increment = inc3;
					Hmove3.heading = head3;
					Hmove3.duration = durt3;
					Hmove3.progress = lprog3;
					Hmove3.path = lpath3;
					Halist.addAction(Hmove3);
					this.motionModule.actionLists["HA"] = Halist;
					Halist.target = this;

					move2.testName = "H";
					Hmove3.testName = "HA";
/**/
/*
				}
				else if(stepnum < 3 || stepnum > 4) {
					if(stepnum%2==0)	head2.setHeadingByVector({x:1,y:0}, 500000*speed);
					if(stepnum%2==1)	head2.setHeadingByVector({x:-1,y:0}, 500000*speed);
					alist.addAction(move2);
					this.loadStep({'stepnum':(stepnum+1)}, {'time':this.turntime});
				}
				else if (stepnum == 3){
					head2.setHeadingByVector({x:1,y:0}, 500000*speed);
					durt2.duration *= 0.5;
					alist.addAction(move2);

					for(var m=0; m<3; m++) {
						var inc2 = IncrementBySpeed.alloc();	inc2.spdPerTick = speed*1.2;
						var head2 = HeadingByVector.alloc();
						var durt2 = DurationByTime.alloc();	durt2.duration = this.turntime*1.5;
						var lprog2 = LinearProgress.alloc();
						var lpath2 = LinearPath.alloc();

						if(m==0)				head2.setHeadingByVector({x:0,y:1}, 500000*speed);
						if(m==1)				head2.setHeadingByVector({x:-1,y:0}, 500000*speed);
						if(m==2)				head2.setHeadingByVector({x:0,y:-1}, 500000*speed);
						if(m==2)				durt2.duration *= 0.75;
						if(m==2)				inc2.spdPerTick *= 1.5;

						var move3 = MoveActor.alloc();
						move3.movingActor = this;
						move3.increment = inc2;
						move3.heading = head2;
						move3.duration = durt2;
						move3.progress = lprog2;
						move3.path = lpath2;

						alist.addAction(move3);
					}
					var t = 0;
					for(var i in alist.actionSet)
					{
						t+=alist.actionSet[i].duration.duration;
					}
					this.loadStep({'stepnum':(stepnum+1)}, {'time':t});
				}
				else if (stepnum == 4) {
					var head2 = HeadingByVector.alloc();
					head2.setHeadingByVector({x:1,y:0}, 150);
					var lpath2 = CubicBezierPath.alloc();

					var tempE = head2.calculateNewEndpt();
					lpath2.ptC1.x = 10;
					lpath2.ptC1.y = 80;
					lpath2.ptC2.x = 140;
					lpath2.ptC2.y = 80;
					move2.heading = head2;
					move2.path = lpath2;
					inc2.spdPerTick *= 1.5;

					var endpt = move2.heading.calculateNewEndpt();
					endpt.x += this.position.x;
					endpt.y += this.position.y;

					var total = lpath2.getPathLength(this.position, endpt, 0, 1);
					durt2.duration = total/inc2.spdPerTick;

					alist.addAction(move2);
					this.loadStep({'stepnum':(stepnum+1)}, {'time':(durt2.duration)});
				}
			}
			else if(this.enemyType == 1) {
				if(stepnum == 0) {
					head2.setHeadingByVector({x:0,y:1}, 500000*speed);
					alist.addAction(move2);
					durt2.duration *= 1.5;


					for(var m=0; m<4; m++) {
						var inc2 = IncrementBySpeed.alloc();	inc2.spdPerTick = speed;
						var head2 = HeadingByVector.alloc();
						var durt2 = DurationByTime.alloc();	durt2.duration = this.turntime;
						var lprog2 = LinearProgress.alloc();
						var lpath2 = CubicBezierPath.alloc();
						if(m==0) {
							lpath2.ptC1.x = 150;
							lpath2.ptC1.y = 175;
							lpath2.ptC2.x = -150;
							lpath2.ptC2.y = 275;
						}
						if(m==1) {
							lpath2.ptC1.x = 100;
							lpath2.ptC1.y = 75;
							lpath2.ptC2.x = 190;
							lpath2.ptC2.y = 175;
						}
						if(m==2) {
							lpath2.ptC1.x = 150;
							lpath2.ptC1.y = -150;
							lpath2.ptC2.x = -150;
							lpath2.ptC2.y = -50;
						}
						if(m==3) {
							lpath2.ptC1.x = -100;
							lpath2.ptC1.y = 75;
							lpath2.ptC2.x = -150;
							lpath2.ptC2.y = 75;
						}

						if(m==0)				head2.setHeadingByVector({x:0,y:1}, 200);
						if(m==1)				head2.setHeadingByVector({x:1,y:0}, 200);
						if(m==2)				head2.setHeadingByVector({x:0,y:-1}, 200);
						if(m==2)				durt2.duration *= 0.75;
						if(m==2)				inc2.spdPerTick *= 1.5;
						if(m==3)				head2.setHeadingByVector({x:-1,y:0}, 200);

						var move3 = MoveActor.alloc();
						move3.movingActor = this;
						move3.increment = inc2;
						move3.heading = head2;
						move3.duration = durt2;
						move3.progress = lprog2;
						move3.path = lpath2;

						alist.addAction(move3);
					}
					var t = 0;
					for(var i in alist.actionSet)
					{
						t+=alist.actionSet[i].duration.duration;
					}

					this.loadStep({'stepnum':(stepnum+1)}, {'time':t});
				}
				else if (stepnum == 1) {
					var head2 = HeadingByVector.alloc();
					head2.setHeadingByVector({x:0,y:-1}, 100);
					var lpath2 = LinearPath.alloc();

					var tempE = head2.calculateNewEndpt();
					move2.heading = head2;
					move2.path = lpath2;
//					inc2.spdPerTick *= 2.5;

					var endpt = move2.heading.calculateNewEndpt();
					endpt.x += this.position.x;
					endpt.y += this.position.y;

					var total = lpath2.getPathLength(this.position, endpt, 0, 1);
					durt2.duration = total/inc2.spdPerTick;

					alist.addAction(move2);
					this.loadStep({'stepnum':(stepnum+1)}, {'time':(durt2.duration)});
				}
				else if (stepnum == 2) {
					var head2 = HeadingByVector.alloc();
					head2.setHeadingByVector({x:0,y:1}, 250);
					var lpath2 = CubicBezierPath.alloc();

					var tempE = head2.calculateNewEndpt();
					lpath2.ptC1.x = 150;
					lpath2.ptC1.y = 75;
					lpath2.ptC2.x = -150;
					lpath2.ptC2.y = 175;
					move2.heading = head2;
					move2.path = lpath2;
					inc2.spdPerTick *= 1.5;

					var endpt = move2.heading.calculateNewEndpt();
					endpt.x += this.position.x;
					endpt.y += this.position.y;

					var total = lpath2.getPathLength(this.position, endpt, 0, 1);
					durt2.duration = total/inc2.spdPerTick;

					alist.addAction(move2);
					this.loadStep({'stepnum':(stepnum+1)}, {'time':(durt2.duration)});
				}
			}

			this.motionModule.actionLists["H"] = alist;
			alist.target = this;


			var ripple = RippleEffect.alloc();
			ripple.updatePosition(this.position);
			GAMEMODEL.gameSession.gameWorld.addActor(ripple, 'bullet');


	}
	if(this.enemyClass == "WHEELMAN" && this.enemyType < 10) {
	}
	/**/

exports.BEHAVIOR_BUILDER = BEHAVIOR_BUILDER;
exports.BEHAVIOR_BUILDER._loadJSEngineClasses = _loadJSEngineClasses;
