// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TeleportCircleActor","TimerObj","TeleportRayActor","TeleMoveShadowActor","CharActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["PlayerTeleportCircle"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});




function PlayerTeleportCircle() {
}
PlayerTeleportCircle.prototype = new TeleportCircleActor;
PlayerTeleportCircle.prototype.identity = function() {
	return ('PlayerTeleportCircle (' +this._dom.id+ ')');
};
PlayerTeleportCircle.prototype.init = function() {
	TeleportCircleActor.prototype.init.call(this);

	// ms until a released key is considered 'gone'.
	this.RELEASERESETTIME = 150;

	this.BASEPATHLINEFADE = 8000;

  this.debugMode = 0;

	this.radius = 15;

	this.heading = 0;

	this.startedTimer.lifeTime = 750;
	this.fadeInTimer.lifeTime = 66;
	this.fadeOutTimer.lifeTime = 250;

  this.minCRadius = 50;
  this.maxCRadius = 230;
  this.CRadius = 20;

	this.updatePosition();

	this.circleType = "player";
	this.RingColor = "153,204,255";
};
PlayerTeleportCircle.prototype.draw = function() {
  if(!this.startedTimer.running && !this.fadeOutTimer.running)    return;
	TeleportCircleActor.prototype.draw.call(this);
};
PlayerTeleportCircle.prototype.update = function() {
	Actor.prototype.update.call(this);

  if(this.parent instanceof Actor)  this.updatePosition(this.parent.position);
	this.pathChain.update();

  this.startedTimer.update();
  this.fadeInTimer.update();
  this.fadeOutTimer.update();

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

PlayerTeleportCircle.prototype.readInput = function(inputobj)
{
  var keyused = false;
	var keyids = GAMECONTROL.keyIDs;

	var shiftstate = (GAMECONTROL.getKeyState(keyids['KEY_SHIFT']));



  if(keyids['KEY_SPACEBAR'] == inputobj.keyID)
	{
    this.pressedButton('KEY_SPACEBAR',inputobj.keypress);
	}

//  if(!this.startedTimer.running && this.CIRCLE_STYLE == 1)    return;

  var keyused = "";
  if(keyids['KEY_ARROW_UP'] == inputobj.keyID || keyids['KEY_W'] == inputobj.keyID)	{
    keyused = "UP";
		if(inputobj.keypress == true)  this.keystates['UP']=1;
    else if(!GAMECONTROL.getKeyState('KEY_ARROW_UP') && !GAMECONTROL.getKeyState('KEY_W'))    delete this.keystates['UP'];
	}
  if(keyids['KEY_ARROW_DOWN'] == inputobj.keyID || keyids['KEY_S'] == inputobj.keyID)	{
    keyused = "DOWN";
		if(inputobj.keypress == true)  this.keystates['DOWN']=1;
    else if(!GAMECONTROL.getKeyState('KEY_ARROW_DOWN') && !GAMECONTROL.getKeyState('KEY_S'))    delete this.keystates['DOWN'];
	}
  if(keyids['KEY_ARROW_RIGHT'] == inputobj.keyID || keyids['KEY_D'] == inputobj.keyID)	{
    keyused = "RIGHT";
		if(inputobj.keypress == true)  this.keystates['RIGHT']=1;
    else if(!GAMECONTROL.getKeyState('KEY_ARROW_RIGHT') && !GAMECONTROL.getKeyState('KEY_D'))    delete this.keystates['RIGHT'];
	}
  if(keyids['KEY_ARROW_LEFT'] == inputobj.keyID || keyids['KEY_A'] == inputobj.keyID)	{
    keyused = "LEFT";
		if(inputobj.keypress == true)  this.keystates['LEFT']=1;
    else if(!GAMECONTROL.getKeyState('KEY_ARROW_LEFT') && !GAMECONTROL.getKeyState('KEY_A'))    delete this.keystates['LEFT'];
	}

	this.calcDirectional(inputobj,keyused);
  if(this.CIRCLE_STYLE == 2) {
		if(!inputobj.keypress) {
			var keyset = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
			if(keyset.includes(keyused)) {
				if(shiftstate) {
					var keydown=false;
					for(var i in keyset) {
						if(this.keystates[keyset[i]]==1)	keydown=true;
					}
					if(!keydown)					this.teleportParent("shiftstep");
				}
			}
		}
  }
};
PlayerTeleportCircle.prototype.pressedButton = function(value,press) {
  if(value == "KEY_SPACEBAR") {
    if (press && !this.pressed) {
      this.started = true;

      this.startedTimer.cycled = false;
      this.startedTimer.startTimer();
      this.fadeInTimer.cycled = false;
      this.fadeInTimer.startTimer();


			if(GAMEMODEL.modelClock.timeRate == 1)	GAMEMODEL.modelClock.changeRate(0.25);

      this.CRadius = this.minCRadius;
      this.fadeOutTimer.stopTimer();

      this.finalFade = false;
      this.pressed = true;
    }
    else if(!press & this.pressed) {
      if(this.startedTimer.running) {
        if(typeof this.points[this.selector] !== "undefined" && this.parent instanceof CharActor) {
					this.teleportParent("bigcircle");
        }
      }

      this.pressed = false;
      this.startedTimer.stopTimer();
      this.fadeInTimer.stopTimer();
			if(GAMEMODEL.modelClock.timeRate != 1)	GAMEMODEL.modelClock.changeRate(1);


/*      if(!this.finalFade) {
        this.fadeOutTimer.cycled = false;
        this.fadeOutTimer.startTimer();
        this.finalFade = true;
      }   /**/

    }
  }
};

PlayerTeleportCircle.prototype.teleportParent = function(type) {
	if(!this.parent.alive)		return;

    var angle = this.points[this.selector];

		var dstep = 40;
		if(type == "bigcircle")		dstep = this.CRadius;
		if(type == "shiftstep")		dstep = 40;

    var P2 = GAMEGEOM.rotatePoint({x:0,y:dstep}, angle);

		var pospt = {};
    pospt.x = P2.x + this.position.x;
    pospt.y = P2.y + this.position.y;

		var pospts = {};
    pospts.x = this.parent.position.x - 2*P2.x/dstep;
    pospts.y = this.parent.position.y - 2*P2.y/dstep;
    var posptf = {};
    posptf.x = P2.x + this.position.x + 2*P2.x/dstep;
    posptf.y = P2.y + this.position.y + 2*P2.y/dstep;

		var raymove = TeleportRayActor.alloc();
		raymove.setRayParams(this.parent.position,pospt);
    GAMEMODEL.gameSession.gameWorld.addActor(raymove,'ray');
		raymove.rayType = "player";
		raymove.teleportHost = this.parent;
		raymove.teleportPoints = [pospts, posptf, pospt, this.parent.position];

//    this.parent.updatePosition(pospt);
};


PlayerTeleportCircle.prototype.addIntersectCircle = function(itemset,type,opts={}) {
	var pt = itemset['pts'];
	if(!this.teleInventoryList[type])		this.teleInventoryList[type] = {};
	if(type == "overlap" || type == "intersection") {
//		console.log(type,this.checkInventoryItem(itemset,type,opts),itemset);

		if(this.checkInventoryItem(itemset,type,opts))		return;
		this.addInventoryItem(itemset,type,opts);
	}


	var telelinecircle = TeleMoveShadowActor.alloc();
	telelinecircle.updatePosition(pt);
	telelinecircle.colorNum = this.parent.colorNum;
	GAMEMODEL.gameSession.gameWorld.addActor(telelinecircle,'act');
	var shift = 100 * 20;
	telelinecircle.lifeTimer.lifeTime = 50 + shift;
	telelinecircle.fadeInTimer.lifeTime = 0 + shift;
	telelinecircle.fadeOutTimer.lifeTime = 150;
	if(type == "segment")	telelinecircle.colorNum = 1;
	if(type == "segment")	telelinecircle.radius = 5;
	if(type == "intersection")	telelinecircle.colorNum = 2;
	if(type == "touch")		telelinecircle.colorNum = 1;
	if(type == "touch")		telelinecircle.radius = 3;
	if(type == "overlap")		telelinecircle.colorNum = 13;
	if(type == "overlap")		telelinecircle.radius = 5;
};


PlayerTeleportCircle.alloc = function() {
	var vc = new PlayerTeleportCircle();
	vc.init();
	return vc;
};



exports.PlayerTeleportCircle = PlayerTeleportCircle;
exports.PlayerTeleportCircle._loadJSEngineClasses = _loadJSEngineClasses;
