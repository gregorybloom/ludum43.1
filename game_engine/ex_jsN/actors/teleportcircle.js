// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TimerObj","PathChainActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["TeleportCircleActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function TeleportCircleActor() {
}
TeleportCircleActor.prototype = new Actor;
TeleportCircleActor.prototype.identity = function() {
	return ('TeleportCircleActor (' +this._dom.id+ ')');
};
TeleportCircleActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	// ms until a released key is considered 'gone'.
	this.RELEASERESETTIME = 150;
  this.CIRCLE_STYLE = 2;

	this.BASEPATHLINEFADE = 8000;

  this.debugMode = 0;

	this.radius = 15;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};

	this.baseOffset = {x:0.5,y:0.35};
	this.actionMode = "MODE_STILL";

	this.charColor = "#FF0000";
	this.colorNum = 0;
  this.haloAlpha = 0.3;

	this.ticksDiff = 0;

	this.spaceHeld = false;

  if(this.CIRCLE_STYLE == 1)  this.selector = 3;
  if(this.CIRCLE_STYLE == 2)  this.selector = 2;

  if(this.CIRCLE_STYLE == 1)  this.points = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  if(this.CIRCLE_STYLE == 2)  this.points = [0, 45, 90, 135, 180, 225, 270, 315];


	this.heading = 0;

  this.keystates = {};

/*
	this.teleLineList = [];
	this.teleCrossList = {};
	this.teleItemList = {};
/**/
	this.teleInventoryList = {};


  this.started = false;
  this.startedTimer = TimerObj.alloc();
	this.startedTimer.lifeTime = 750;
	this.startedTimer.looping = false;

  this.fadeInTimer = TimerObj.alloc();
	this.fadeInTimer.lifeTime = 66;
	this.fadeInTimer.looping = false;

  this.finalFade = false;
  this.fadeOutTimer = TimerObj.alloc();
	this.fadeOutTimer.lifeTime = 250;
	this.fadeOutTimer.looping = false;

  this.minCRadius = 50;
  this.maxCRadius = 230;
  this.CRadius = 20;

  this.pressed = false;

  this.parent = null;
	this.updatePosition();

	this.circleType = "player";
	this.RingColor = "153,204,255";

	this.pathChain = PathChainActor.alloc();
};
TeleportCircleActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	if(this.pathChain instanceof Actor)		this.pathChain.clear();
	delete this.pathChain;
	this.pathChain = null;
};
TeleportCircleActor.prototype.changeStyle = function(type) {
  if(type == this.CIRCLE_STYLE) return;
  this.CIRCLE_STYLE = type;
  if(this.CIRCLE_STYLE == 1)  this.points = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  if(this.CIRCLE_STYLE == 2)  this.points = [0, 45, 90, 135, 180, 225, 270, 315];
  if(this.selector == null) this.selector = 0;
  if(this.selector < 0)   this.selector += this.points.length;
  if(this.selector >= this.points.length)   this.selector = this.selector % this.points.length;
};
TeleportCircleActor.prototype.draw = function() {
  if(!this.startedTimer.running && !this.fadeOutTimer.running)    return;
	this.pathChain.draw();

//  var prop = {fill:false, color:"rgba(110,200,250,0.9)",width:2};
  var prop = {fill:false, color:"#99CCFF",width:2};
      prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"circle",radius:this.CRadius};
    var transf = {};

    var finalA = 1;
    if(this.fadeOutTimer.running) {
      var c = this.fadeOutTimer.getCycle();
      var lt = this.fadeOutTimer.lifeTime;
      var dt = (c.time + lt)/lt;

      finalA = Math.max(0,(1-dt));
    }
    else if(this.fadeInTimer.running) {
      var c = this.fadeInTimer.getCycle();
      var lt = this.fadeInTimer.lifeTime;
      var dt = (c.time + lt)/lt;

      finalA = Math.min(1,dt);
    }
    if(finalA != 1)    transf = {actions:[{type:'a',alpha:finalA}]};

    GAMEVIEW.drawElement(this.position, shape, prop, transf);


    if(!this.startedTimer.running)    return;
    for(var i in this.points) {
      var angle = this.points[i];
      var P2 = GAMEGEOM.rotatePoint({x:0,y:this.CRadius}, angle);
      var pospt = {};
      pospt.x = P2.x + this.position.x;
      pospt.y = P2.y + this.position.y;

      var prop = {fill:false, color:"#99CCFF",width:1};
        prop.source = "default";
        prop.writeTo = 2;
     	  var shape = {type:"circle",radius:6};

        var transf = {};
        if(finalA != 1)    transf = {actions:[{type:'a',alpha:finalA}]};
        GAMEVIEW.drawElement(pospt, shape, prop, transf);
    }

    if(typeof this.points[this.selector] === "undefined") return;
		var prop = {fill:false, color:"rgba(153,204,255,"+0.35+")",width:2.5};
        prop.source = "default";
      prop.writeTo = 2;
    	var shape = {type:"shape",'pts':[]};
      var transf = {};

      var angle = this.points[this.selector];
			var P1 = GAMEGEOM.rotatePoint({x:0,y:this.parent.radius}, angle);		P1.t = 'm';
//      var P2 = GAMEGEOM.rotatePoint({x:0,y:Math.min(100,this.CRadius-11)}, angle);		P2.t = 'l';
			var P2 = GAMEGEOM.rotatePoint({x:0,y:(this.CRadius-11)}, angle);		P2.t = 'l';
//      var P2 = GAMEGEOM.rotatePoint({x:0,y:80}, angle);		P2.t = 'l';
			shape.pts.push(P1);			shape.pts.push(P2);
      GAMEVIEW.drawElement(this.position, shape, prop, transf);



    var prop = {fill:false, color:"#99CCFF",width:2.5};
        prop.source = "default";
      prop.writeTo = 2;
    var shape = {type:"circle",radius:11};
      var transf = {};

      var angle = this.points[this.selector];
      var P2 = GAMEGEOM.rotatePoint({x:0,y:this.CRadius}, angle);
      var pospt = {};
      pospt.x = P2.x + this.position.x;
      pospt.y = P2.y + this.position.y;

      if(finalA != 1) {
        var Al = 1 - ((1-finalA)*(1-finalA));
        transf = {actions:[{type:'a',alpha:Al}]};
      }
      GAMEVIEW.drawElement(pospt, shape, prop, transf);
};
TeleportCircleActor.prototype.update = function() {
	Actor.prototype.update.call(this);
	if(this.parent instanceof Actor)  this.updatePosition(this.parent.position);
	this.pathChain.update();

  this.startedTimer.update();
  this.fadeInTimer.update();
  this.fadeOutTimer.update();

//	this.cleanTelePathLists();
	this.checkTelePaths();

  if(!this.startedTimer.running && !this.fadeOutTimer.running)    this.CRadius = this.minCRadius;
  if(this.startedTimer.running) {
    var c = this.startedTimer.getCycle();
    var lt = this.startedTimer.lifeTime;
    var dt = (c.time + lt)/lt;
    dt*=2;
    if(dt < 1)    dt = dt*dt;
    else          dt = 1-(dt-2)*(dt-2)+1;
    dt/=2;
    var dr = this.maxCRadius - this.minCRadius;
    this.CRadius = dr*dt + this.minCRadius;
  }


  var timerLists = [this.startedTimer, this.fadeInTimer, this.fadeOutTimer];
  for(var i in timerLists) {
    var timer = timerLists[i];
    if(timer.running) {
      var c = timer.getCycle();
      if( c.cycled ) {
        timer.stopTimer();

        if(i == 0 && !this.finalFade) {
          this.fadeOutTimer.cycled = false;
          this.fadeOutTimer.startTimer();
          this.finalFade = true;
        }
      }
    }
  }


	var keyids = GAMECONTROL.keyIDs;
	var keygroups = {};
	keygroups['RIGHT'] = ['KEY_ARROW_RIGHT','KEY_D'];
	keygroups['LEFT'] = ['KEY_ARROW_LEFT','KEY_A'];
	keygroups['UP'] = ['KEY_ARROW_UP','KEY_W'];
	keygroups['DOWN'] = ['KEY_ARROW_DOWN','KEY_S'];
	var resultcheck = {};
	for(var i in keygroups) {
		var kgroup = keygroups[i];
		resultcheck[i] = (GAMECONTROL.getKeyState( keyids[kgroup[0]] ) || GAMECONTROL.getKeyState( keyids[kgroup[1]] ));
	}

	var shiftstate = (GAMECONTROL.getKeyState(keyids['KEY_SHIFT']));
	if(shiftstate) {
		for(var i in keygroups) {
			var kgroup = keygroups[i];
			var dirlist = this.dirsFromSelector();
			if(!resultcheck[i] && dirlist.includes(i)) {
				if(Object.keys(this.keystates).length !== 0) {
					var times=[];
					for(var j in keygroups[i]) {
	//					if(!GAMECONTROL.getKeyState( keyids[kgroup[j]] ))		console.log(i,keygroups[i],kgroup[j]);
						if(!GAMECONTROL.getKeyState( keyids[kgroup[j]] ))		times.push( GAMECONTROL.getKeyUpTime( keyids[kgroup[j]] ) );
					}
					var mintime = Math.min.apply(null,times);
//					console.log(GAMEMODEL.getTime(),i,mintime,this.keystates);
					if(mintime > this.RELEASERESETTIME) {
						this.removeDirectional(i);
					}
				}
			}
		}
	}
};
TeleportCircleActor.prototype.dirsFromSelector = function() {
	if(this.selector == 0)		return ["DOWN"];
	if(this.selector == 1)		return ["DOWN","RIGHT"];
	if(this.selector == 2)		return ["RIGHT"];
	if(this.selector == 3)		return ["RIGHT","UP"];
	if(this.selector == 4)		return ["UP"];
	if(this.selector == 5)		return ["LEFT","UP"];
	if(this.selector == 6)		return ["LEFT"];
	if(this.selector == 7)		return ["DOWN","LEFT"];
};
TeleportCircleActor.prototype.removeDirectional = function(keyused) {
	delete this.keystates[keyused];
//	console.log(GAMEMODEL.getTime(),keyused,this.keystates);
	for(var i in this.keystates) {
		if(this.keystates[i] == 1) {
//			console.log("Doing",i);
			this.calcDirectional({keypress:true},i);
			break;
		}
	}
};

TeleportCircleActor.prototype.calcDirectional = function(inputobj,keyused)
{
	if(this.CIRCLE_STYLE == 1) {
    if(inputobj.keypress && keyused == "UP") {
      if(this.selector == null)    this.selector = 0;
      this.selector=this.selector+1;
      if(this.selector < 0)   this.selector = this.points.length-1;
      this.selector=this.selector%this.points.length;
    }
    if(inputobj.keypress && keyused == "DOWN") {
      if(this.selector == null)   this.selector = 0;
      this.selector=this.selector-1;
      if(this.selector < 0)   this.selector = this.points.length-1;
      this.selector=this.selector%this.points.length;
    }
  }
  if(this.CIRCLE_STYLE == 2) {
    if(keyused == "LEFT") {
      if(inputobj.keypress) {
        if(this.keystates['UP'] == 1)         this.selector = 5;
        else if(this.keystates['DOWN'] == 1)  this.selector = 7;
        else                                  this.selector = 6;
      }
    }
    if(keyused == "RIGHT") {
      if(inputobj.keypress) {
        if(this.keystates['UP'] == 1)         this.selector = 3;
        else if(this.keystates['DOWN'] == 1)  this.selector = 1;
        else                                  this.selector = 2;
      }
    }
    if(keyused == "UP") {
      if(inputobj.keypress) {
        if(this.keystates['RIGHT'] == 1)      this.selector = 3;
        else if(this.keystates['LEFT'] == 1)  this.selector = 5;
        else                                  this.selector = 4;
      }
    }
    if(keyused == "DOWN") {
      if(inputobj.keypress) {
        if(this.keystates['RIGHT'] == 1)      this.selector = 1;
        else if(this.keystates['LEFT'] == 1)  this.selector = 7;
        else                                  this.selector = 0;
      }
    }
	}
};
TeleportCircleActor.prototype.readInput = function(inputobj)
{
};
TeleportCircleActor.prototype.pressedButton = function(value,press) {
};
TeleportCircleActor.prototype.addInventoryItem = function(itemset,type,opts={}) {
	if(!this.teleInventoryList[type])		this.teleInventoryList[type]={};
	if(type == "intersection" && !this.teleInventoryList['intersectpts'])	this.teleInventoryList['intersectpts']={};

	var act1 = itemset['actors']['act1'];
	var act2 = itemset['actors']['act2'];
	if(!this.teleInventoryList[type][act1.id])			this.teleInventoryList[type][act1.id]=[];
	if(!this.teleInventoryList[type][act2.id])			this.teleInventoryList[type][act2.id]=[];
	//		console.log(act1.id,act2.id,'=',this.teleInventoryList[type][act1.id].includes(act2.id),this.teleInventoryList[type][act2.id].includes(act1.id));
	if(!this.teleInventoryList[type][act1.id].includes(act2.id))	this.teleInventoryList[type][act1.id].push(act2.id);
	if(!this.teleInventoryList[type][act2.id].includes(act1.id))	this.teleInventoryList[type][act2.id].push(act1.id);

	if(type == "intersection") {
		if(!this.teleInventoryList['intersectpts'][act1.id])	this.teleInventoryList['intersectpts'][act1.id]=[];
		if(!this.teleInventoryList['intersectpts'][act2.id])	this.teleInventoryList['intersectpts'][act2.id]=[];

		if(!this.teleInventoryList['intersectpts'][act1.id].includes(itemset['pts']))	this.teleInventoryList['intersectpts'][act1.id].push(itemset['pts']);
		if(!this.teleInventoryList['intersectpts'][act2.id].includes(itemset['pts']))	this.teleInventoryList['intersectpts'][act2.id].push(itemset['pts']);
	}
};
TeleportCircleActor.prototype.checkInventoryItem = function(itemset,type,opts={}) {
	if(!this.teleInventoryList[type])		this.teleInventoryList[type]={};
	if(type == "intersection" && !this.teleInventoryList['intersectpts'])	this.teleInventoryList['intersectpts']={};

	var act1 = itemset['actors']['act1'];
	var act2 = itemset['actors']['act2'];
	if(!this.teleInventoryList[type][act1.id])			this.teleInventoryList[type][act1.id]=[];
	if(!this.teleInventoryList[type][act2.id])			this.teleInventoryList[type][act2.id]=[];

	if(this.teleInventoryList[type][act1.id].includes(act2.id))	return true;
	if(this.teleInventoryList[type][act2.id].includes(act1.id))	return true;

	if(type == "intersection") {
		if(!this.teleInventoryList['intersectpts'][act1.id])	this.teleInventoryList['intersectpts'][act1.id]=[];
		if(!this.teleInventoryList['intersectpts'][act2.id])	this.teleInventoryList['intersectpts'][act2.id]=[];
		for(var i in this.teleInventoryList['intersectpts']) {
			for(var j in this.teleInventoryList['intersectpts'][i]) {
				var D =  GAMEGEOM.getDistance( itemset['pts'],this.teleInventoryList['intersectpts'][i][j] );
				if(D < 3)		return true;
			}
		}
	}

	return false;
};


TeleportCircleActor.alloc = function() {
	var vc = new TeleportCircleActor();
	vc.init();
	return vc;
};


exports.TeleportCircleActor = TeleportCircleActor;
exports.TeleportCircleActor._loadJSEngineClasses = _loadJSEngineClasses;
