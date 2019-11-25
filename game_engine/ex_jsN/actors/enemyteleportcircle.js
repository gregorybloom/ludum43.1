// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TeleportCircleActor","TeleportRayActor","TeleMoveShadowActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyTeleportCircle"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function EnemyTeleportCircle() {
}
EnemyTeleportCircle.prototype = new TeleportCircleActor;
EnemyTeleportCircle.prototype.identity = function() {
	return ('EnemyTeleportCircle (' +this._dom.id+ ')');
};
EnemyTeleportCircle.prototype.init = function() {
	TeleportCircleActor.prototype.init.call(this);

	// ms until a released key is considered 'gone'.
	this.RELEASERESETTIME = 150;
  this.CIRCLE_STYLE = 2;

	this.BASEPATHLINEFADE = 14000;

  this.debugMode = 0;

	this.radius = 15;

	this.heading = 0;


	this.startedTimer.lifeTime = 1500;
	this.fadeInTimer.lifeTime = 100;
	this.fadeOutTimer.lifeTime = 500;

  this.minCRadius = 50;
  this.maxCRadius = 230;
  this.CRadius = 20;

	this.targetTime = 1500;

	this.updatePosition();

	this.circleType = "enemy";
};
EnemyTeleportCircle.prototype.changeStyle = function(type) {
};
EnemyTeleportCircle.prototype.draw = function() {
  if(!this.startedTimer.running && !this.fadeOutTimer.running)    return;

//  var prop = {fill:false, color:"rgba(110,200,250,0.9)",width:2};
	var colorS = "rgba(110,110,110,0.6)";

  var prop = {fill:false, color:"rgba(110,110,110,0.6)",width:2};
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

      var prop = {fill:false, color:"rgba(110,110,110,0.6)",width:1};
        prop.source = "default";
        prop.writeTo = 2;
     	  var shape = {type:"circle",radius:6};

        var transf = {};
        if(finalA != 1)    transf = {actions:[{type:'a',alpha:finalA}]};
        GAMEVIEW.drawElement(pospt, shape, prop, transf);
    }

    if(typeof this.points[this.selector] === "undefined") return;
//		var prop = {fill:false, color:"rgba(153,204,255,"+0.35+")",width:2.5};
		var prop = {fill:false, color:"rgba(110,110,110,"+0.35+")",width:2.5};
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



    var prop = {fill:false, color:"rgba(110,110,110,0.6)",width:2.5};
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
EnemyTeleportCircle.prototype.update = function() {
  if(this.parent instanceof Actor)  this.updatePosition(this.parent.position);

  this.startedTimer.update();
  this.fadeInTimer.update();
  this.fadeOutTimer.update();


	for(var i in this.teleLineList) {
		var item = this.teleLineList[i];
		if(!item.alive) {
			for(var j in this.teleCrossList) {
				var item2 = this.teleCrossList[j];
				if(typeof this.teleCrossList[item2.id] !== "undefined") {
					if(typeof this.teleCrossList[item2.id][item.id] !== "undefined")	delete this.teleCrossList[item2.id][item.id];
				}
			}
			for(var type in this.teleInventoryList) {
				if(this.teleInventoryList[type]) {
					if(this.teleInventoryList[type][item.id])		delete this.teleInventoryList[type][item.id];
					for(var id in this.teleInventoryList[type]) {
						if(this.teleInventoryList[type][id].includes(item.id)) {
							for(var j in this.teleInventoryList[type][id]) {
								if(j == item.id) {
									this.teleInventoryList[type][id].splice(j,1);
									break;
								}
							}
						}
					}
				}
			}


			if(typeof this.teleItemList[item.id] !== "undefined")	delete this.teleItemList[item.id];
			if(typeof this.teleCrossList[item.id] !== "undefined")	delete this.teleCrossList[item.id];
			this.teleLineList.splice(i,1);
			break;
		}
	}

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

			if(i == 0 && (c.time+timer.lifeTime) >= this.targetTime) {
				this.endTeleport();
			}
			else if(i == 0 && c.cycled && timer.lifeTime == this.targetTime) {
				this.endTeleport();
			}
      else if( c.cycled ) {
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
						if(!GAMECONTROL.getKeyState( keyids[kgroup[j]] ))		times.push( GAMECONTROL.getKeyUpTime( keyids[kgroup[j]] ) );
					}
					var mintime = Math.min.apply(null,times);
					if(mintime > this.RELEASERESETTIME) {
						this.removeDirectional(i);
					}
				}
			}
		}
	}
};


EnemyTeleportCircle.prototype.calcDirectional = function(inputobj,keyused)
{
};
EnemyTeleportCircle.prototype.readInput = function(inputobj) {
};
EnemyTeleportCircle.prototype.pressedButton = function(value,press) {
};
EnemyTeleportCircle.prototype.beginTeleport = function(angle,time,started=false) {
	if(!this.parent)		return;
    this.started = true;
		var parent = this.parent;

		parent.unitSpeed = 0;
		parent.facingAngle = angle;

		this.targetTime = time;
		this.points = [parent.facingAngle];
		this.selector = 0;

		if(started != false)	this.startedTimer.lifeTime = started;
    this.startedTimer.cycled = false;
    this.startedTimer.startTimer();
    this.fadeInTimer.cycled = false;
    this.fadeInTimer.startTimer();

    this.CRadius = this.minCRadius;
    this.fadeOutTimer.stopTimer();

    this.finalFade = false;
    this.pressed = true;
};
EnemyTeleportCircle.prototype.endTeleport = function() {
	this.teleportParent("bigcircle");

	this.pressed = false;
	this.startedTimer.stopTimer();
	this.fadeInTimer.stopTimer();
	this.fadeOutTimer.stopTimer();
};

EnemyTeleportCircle.prototype.teleportParent = function(type) {
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
		raymove.teleportHost = this.parent;
		raymove.rayType = "enemy";
		raymove.teleportPoints = [pospts, posptf, pospt, this.parent.position];

//    this.parent.updatePosition(pospt);
};


EnemyTeleportCircle.prototype.addIntersectCircle = function(itemset,type,opts={}) {
	var pt = itemset['pts'];
	if(!this.teleInventoryList[type])		this.teleInventoryList[type] = {};
	if(type == "overlap" || type == "intersection") {

		if(this.checkInventoryItem(itemset,type,opts))		return;
		this.addInventoryItem(itemset,type,opts);
	}


	var telelinecircle = TeleMoveShadowActor.alloc();
	telelinecircle.updatePosition(pt);
	telelinecircle.colorNum = 17;
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

EnemyTeleportCircle.alloc = function() {
	var vc = new EnemyTeleportCircle();
	vc.init();
	return vc;
};


exports.EnemyTeleportCircle = EnemyTeleportCircle;
exports.EnemyTeleportCircle._loadJSEngineClasses = _loadJSEngineClasses;
