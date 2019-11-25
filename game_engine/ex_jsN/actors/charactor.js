// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TimerObj","TeleportCircleActor","PlayerTeleportCircle","BlockActor","LaserBoxActor","SmokeActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["CharActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});

function CharActor() {
}
CharActor.prototype = new Actor;
CharActor.prototype.identity = function() {
	return ('CharActor (' +this._dom.id+ ')');
};
CharActor.prototype.init = function() {
	Actor.prototype.init.call(this);
	this.debugMode = 0;

	this.radius = 10;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};

	this.baseOffset = {x:0.5,y:0.35};
	this.actionMode = "MODE_STILL";

	this.charColor = "#FF0000";
	this.colorNum = 0;
  this.haloAlpha = 0.3;

	this.unitSpeedX = 0;
	this.unitSpeedY = 0;

	this.hurtTimer = TimerObj.alloc();
	this.hurtTimer.baseLifeTime = 260;
	this.hurtTimer.lifeTime = this.hurtTimer.baseLifeTime;
	this.hurtIntensity = 0.0;

	this.impactTimer = TimerObj.alloc();
	this.impactTimer.lifeTime = 100;
	this.impactTimer.looping = false;

	this.invincTimer = TimerObj.alloc();
	this.invincTimer.lifeTime = 650;
	this.invincTimer.looping = false;

//	this.unitSpeedX = 0.13;
//	this.unitSpeedY = 0.13;
	this.ticksDiff = 0;

	this.shiftHeld = false;
	this.spaceHeld = false;
	this.solid = true;

	this.maxhealth = 4;
	this.health = this.maxhealth;

	this.drawShift = {x:0,y:0};

	this.heading = {x:0,y:0};

	this.dirTimeOut = 40;

	this.deathClock = 1200;
	this.deadAt = 1500;
	this.deathStart = GAMEMODEL.getTime();
	this.deathBegin = false;

	this.exitClock = 800;
	this.exitAt = 1200;
	this.exitStart = GAMEMODEL.getTime();
	this.exitBegin = false;
	this.exitTo = -1;


	this.started = false;

	this.startedTime = GAMEMODEL.getTime();
	this.startedTicks = 1000;

	this.keyTimeList = [];
	for(var i=0; i<4; i++)	this.keyTimeList[i] = GAMEMODEL.getTime();

	this.parentGrid = null;

	this.collisionModule = CollisionModule.alloc();
	this.collisionModule.parent = this;
	this.collisionModule.addShape( CircleShape.alloc() );
	this.collisionModule.shape.radius = this.radius;

	this.boxShape = BoxShape.alloc();
	this.boxShape.parent = this;
	this.boxShape.size.w = this.size.w;
	this.boxShape.size.h = this.size.h;

//	this.teleCircle = PlayerTeleportCircle.alloc();
//	this.teleCircle.parent = this;

	this.updatePosition();
};
CharActor.prototype.draw = function() {

//	Actor.prototype.draw.call(this);
	if(!this.alive)			return;
//	if(this.teleCircle instanceof Actor)	this.teleCircle.draw();

	var writeTo = 2;
	var t = 0;
	if(this.deathBegin)
	{
		t = (GAMEMODEL.getTime() - this.deathStart)/this.deathClock;
		writeTo -1;

		 	var prop = {fill:true, color:"#000000",width:1};
			if(t > 0.25)		prop.fill = false;
	    prop.source = "default";
	    prop.writeTo = writeTo;
		 	var shape = {type:"circle",radius:this.radius};
			if(t > 0.25)			shape.radius += (t-0.25)*100;
			if(t <= 0.25)		var transf = {};
	    if(t > 0.25)		var transf = {actions:[{type:'a',alpha:Math.max(0,(1-t))}]};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);
			return;
	}
	else if(this.exitBegin)
	{
		t = (GAMEMODEL.getTime() - this.exitStart)/this.exitClock;
		writeTo -1;
	}

	var pos = {x:this.absPosition.x,y:this.absPosition.y};
	if(this.hurtTimer.running) {
		var r = Math.random()*360;
		var h = Math.random();

			var t = this.hurtTimer.lifeTime+this.hurtTimer.getCycle()['time'];
			var hi = this.hurtIntensity -1;
			if(t < (this.hurtTimer.lifeTime/2) )			h*=6+hi;
			else if(t < (this.hurtTimer.lifeTime/3) )	h*=3+hi/2;
			else																			h*=1.5+hi/4;
		var head = this.getHeadingFromAngle(r);
		head.x*=h;
		head.y*=h;
		pos.x+=head.x;
		pos.y+=head.y;
	}





 	var prop = {fill:false, color:this.charColor,width:3};
		prop.width -= 3*(1-this.health/this.maxhealth);
		var alpha = Math.max(0,0.8*this.health/this.maxhealth);
		prop.color = this.getNumericColor(alpha,this.colorNum,'halo');

    prop.source = "default";
    prop.writeTo = writeTo;
 	var shape = {type:"circle",radius:this.radius-4};
    var transf = {};
    if(this.deathBegin)		   transf = {actions:[{type:'a',alpha:Math.max(0,(1-2*t)/2)}]};
    if(this.exitBegin)		   transf = {actions:[{type:'a',alpha:Math.max(0,(1-2*t)/2)}]};
    GAMEVIEW.drawElement(pos, shape, prop, transf);

 	var prop = {fill:false, color:"#000000",width:1};
    prop.source = "default";
    prop.writeTo = writeTo;
 	var shape = {type:"circle",radius:this.radius};
    var transf = {};
    if(this.deathBegin)		   transf = {actions:[{type:'a',alpha:Math.max(0,(1-2*t)/2)}]};
    if(this.exitBegin)		   transf = {actions:[{type:'a',alpha:Math.max(0,(1-2*t)/2)}]};
    GAMEVIEW.drawElement(pos, shape, prop, transf);


		if(this.hurtTimer.running) {
			var shape = {type:"circle",radius:(this.radius+2)};
			var prop = {fill:true, color:"rgba(00,113,197,0.35)",width:1};
			var hi = (this.hurtIntensity/10);
			var hiO = Math.min(1.0, hi+0.4);
			var hiL = Math.min(1.0, hi+0.35);
			var t = this.hurtTimer.lifeTime+this.hurtTimer.getCycle()['time'];
			if(t < (this.hurtTimer.lifeTime/2) )			prop.color="rgba(220,0,50,"+hiO+")";
			else																			prop.color="rgba(170,90,70,"+hiL+")";
			shape.radius = this.radius;
			GAMEVIEW.drawElement(pos, shape, prop, transf);
		}


    if(this.deathBegin || this.exitBegin) {
		 	var prop = {};
	    prop.source = "default";
	    prop.writeTo = -1;
	    prop.applyTo = 2;
	 		var shape = {};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }


    if(this.spaceHeld) {
	    	var C = this.getNumericColor(this.haloAlpha,this.colorNum,'halo');
		 	var prop = {fill:false, color:C,width:3};
		    prop.source = "default";
		    prop.writeTo = 2;
		 	var shape = {type:"circle",radius:this.radius+4};
		    var transf = {};
		    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }

};
CharActor.prototype.update = function() {
	Actor.prototype.update.call(this);

		var curtime = GAMEMODEL.getTime();
//		this.charColor = this.getNumericColor(this.haloAlpha, this.colorNum, 'switch');
		if(!this.deathBegin && this.health<=0)	this.beginDeath();
		this.impactTimer.update();
		this.invincTimer.update();
		this.hurtTimer.update();



	this.checkImpact();
	this.updateCurrentMode();
	this.updateCurrentAnimation();

	var newPos = {x:this.position.x,y:this.position.y};
	if(this.actionMode === "MODE_MOVING" && !this.deathBegin && !this.exitBegin)
	{
//		if((this.teleCircle instanceof TeleportCircleActor && !this.teleCircle.startedTimer.running) || !this.spaceHeld) {
		if(!this.spaceHeld) {
			newPos.x += this.heading.x*this.unitSpeedX*this.ticksDiff;
			newPos.y += this.heading.y*this.unitSpeedY*this.ticksDiff;
			if(this.shiftHeld) {
				newPos.x += this.heading.x*this.unitSpeedX*this.ticksDiff/2;
				newPos.y += this.heading.y*this.unitSpeedY*this.ticksDiff/2;
			}
		}
	}
//	newPos.y -= this.speedUpwards*this.ticksDiff;
	this.updatePosition(newPos);

//	if(this.teleCircle instanceof Actor)	this.teleCircle.update();


	if(this.alive && this.deathBegin) {
		if(curtime >= (this.deadAt+this.deathStart) ) {
			this.clear();
			this.alive = false;
//			GAMEMODEL.currentLevel = -1;
		}
		else {
			t = (GAMEMODEL.getTime() - this.deathStart)/this.deathClock;
			if(t > 0.5)			this.solid = false;
		}
	}
	if(this.alive && this.exitBegin) {
		if(curtime >= (this.exitAt+this.exitStart) ) {
			GAMEMODEL.goToLevel = this.exitTo;
		}
	}


	if(this.boxShape instanceof BoxShape) {
		if(JSON.stringify(this.size) !== JSON.stringify(this.boxShape.size)) {
			this.boxShape.size.w = this.size.w;
			this.boxShape.size.h = this.size.h;
		}
	}
/**/

//	if(this.animateModule != null)	this.animateModule.update();
};
CharActor.prototype.checkImpact = function() {
	if(this.impactTimer.running) {
		var c = this.impactTimer.getCycle();
		if(c.cycled) {
			this.impactTimer.stopTimer();
		}
	}
	if(this.invincTimer.running) {
		var c = this.invincTimer.getCycle();
		if(c.cycled) {
			this.invincTimer.stopTimer();
		}
	}
	if(this.hurtTimer.running) {
		var c = this.hurtTimer.getCycle();
		if(c.cycled) {
			this.hurtTimer.stopTimer();
		}
	}
};
CharActor.prototype.impact = function(data,hi) {
	if(!this.impactTimer.running)		this.impactTimer.startTimer();
	if(!this.invincTimer.running)		this.invincTimer.startTimer();
	if(!this.hurtTimer.running)		this.hurtTimer.startTimer();
	this.hurtIntensity = hi;
};


CharActor.prototype.updateCurrentMode = function() {

	var keyids = GAMECONTROL.keyIDs;
	var R = (GAMECONTROL.getKeyState(keyids['KEY_ARROW_RIGHT']) || GAMECONTROL.getKeyState(keyids['KEY_D']));
	var L = (GAMECONTROL.getKeyState(keyids['KEY_ARROW_LEFT']) || GAMECONTROL.getKeyState(keyids['KEY_A']));
	var U = (GAMECONTROL.getKeyState(keyids['KEY_ARROW_UP']) || GAMECONTROL.getKeyState(keyids['KEY_W']));
	var D = (GAMECONTROL.getKeyState(keyids['KEY_ARROW_DOWN']) || GAMECONTROL.getKeyState(keyids['KEY_S']));

	if(this.deathBegin)					return;

//	this.spaceHeld = inputobj.keypress;
	var SP = (GAMECONTROL.getKeyState(keyids['KEY_SPACEBAR']));
	if(this.spaceHeld != SP && SP) {
		if(this.parentGrid instanceof Actor && typeof this.parentGrid.playerIgnite === "function") {
//			this.parentGrid.playerIgnite(this);
		}
	}
//	this.spaceHeld = SP;

	if(this.parentGrid instanceof Actor && typeof this.parentGrid.playerInput === "function") {
		var dirobj = {u:U,r:R,l:L,d:D};
		this.parentGrid.playerInput(this,dirobj,this.heading);
	}


	if( !D && !U )					this.heading.y = 0;
	else if ( D && U ) {
		if( this.keyTimeList[0] < this.keyTimeList[2]  )		U = false;
		else if( this.keyTimeList[0] > this.keyTimeList[2]  )	D = false;
	}
	if( !R && !L )						this.heading.x = 0;
	else if ( R && L ) {
		if( this.keyTimeList[1] < this.keyTimeList[3]  )		R = false;
		else if( this.keyTimeList[1] > this.keyTimeList[3]  )	L = false;
	}

	if (D)								this.heading.y = 1;
	else if (U)							this.heading.y = -1;
	if (R)							this.heading.x = 1;
	else if (L)							this.heading.x = -1;

	if(this.actionMode == "MODE_STILL" || this.actionMode == "MODE_MOVING")
	{
		if(this.heading.x == 0 && this.heading.y == 0)	this.actionMode = "MODE_STILL";
		if(this.heading.x != 0 || this.heading.y != 0)	this.actionMode = "MODE_MOVING";
	}
};
CharActor.prototype.updateCurrentAnimation = function() {
};
CharActor.prototype.makeSmoke = function(pt,ang) {
//	var curtime = GAMEMODEL.getTime();
	var curtime = GAMEMODEL.getTime();
	var deathDiff = (curtime - this.deathStart)/this.deathClock;

	if( (deathDiff) <= 0.5) {

		var SM = SmokeActor.alloc();
/*		this.heading = {x:0,y:1};

		this.unitSpeedX = 0.03;
		this.unitSpeedY = 0.03;
		this.radius = 12;
		this.smokeAlpha = 0.5;

		this.radiusStart = 6;
		this.radiusEnd = 15;
		this.alphaStart = 0.5;
		this.alphaEnd = 0.1;
/**/
		var rng = Math.random()*10-5;
		SM.heading = this.getHeadingFromAngle(ang+rng);
		SM.unitSpeedX = 0.1;
		SM.unitSpeedY = 0.1;


	    SM.updatePosition(pt);
	    GAMEMODEL.gameSession.gameWorld.addActor(SM,'laser');
	}
};

CharActor.prototype.beginDeath = function() {
	if(!this.deathBegin) {
		this.deathStart = GAMEMODEL.getTime();
		this.deathBegin = true;
	}
};
CharActor.prototype.beginExit = function(toLevel) {
	if(!this.exitBegin) {
		this.exitStart = GAMEMODEL.getTime();
		this.exitBegin = true;
		this.exitTo = toLevel;
	}
};
CharActor.prototype.collide = function(act) {
	Actor.prototype.collide.call(this,act);
};
CharActor.prototype.collideType = function(act) {
//	if(act instanceof BlockActor)		return true;
//	if(act instanceof LaserBoxActor)	return true;
	return false;
};
CharActor.prototype.collideVs = function(act) {

//	if(act instanceof BlockActor || act instanceof DoorActor)
	if(act instanceof BlockActor)
	{
		var interBox = GAMEGEOM.BoxIntersection(this.absBox, act.absBox);
		var push = {x:interBox.w,y:interBox.h};

		var interCenter = {x:0,y:0};
		interCenter.x = interBox.x + interBox.w/2;
		interCenter.y = interBox.y + interBox.h/2;

		var thisCenter = {x:0,y:0};
		thisCenter.x = this.absBox.x + this.absBox.w/2;
		thisCenter.y = this.absBox.y + this.absBox.h/2;

		var collisionDir = 0;
		if(  Math.abs(push.x) >= Math.abs(push.y)  )
		{
			if(interCenter.y < thisCenter.y)		collisionDir = 0;
			else									collisionDir = 2;
		}
		else
		{
			if(interCenter.x < thisCenter.x)		collisionDir = 3;
			else									collisionDir = 1;
		}

		if((collisionDir%2) == 0)	push.x = 0;
		else						push.y = 0;


		var actCenter = {x:0,y:0};
		actCenter.x = act.absBox.x + act.absBox.w/2;
		actCenter.y = act.absBox.y + act.absBox.h/2;

		if(interCenter.x > actCenter.x)		push.x = -push.x;
		if(interCenter.y > actCenter.y)		push.y = -push.y;

		if((collisionDir%2) == 0)	push.x = 0;
		else						push.y = 0;

		this.shiftPosition( {x:-push.x,y:-push.y} );
	}

//	if(act instanceof SwitchActor || act instanceof LaserBoxActor)
	if(act instanceof LaserBoxActor)
	{
		var diff = {x:0,y:0};
		diff.x = this.position.x - act.position.x;
		diff.y = this.position.y - act.position.y;

		var D = diff.x*diff.x + diff.y*diff.y;
		var R = act.radius + this.radius;
		if( D < (R*R)) {

			D = Math.sqrt(D);

			var push = act.getHeadingAt(this.position);
			var pushDist = R - D;

			push.x = pushDist * push.x;
			push.y = pushDist * push.y;

			this.shiftPosition( {x:push.x,y:push.y} );
		}

	}
	/**/
};


CharActor.prototype.laserBurn = function(colorNum,pt,ang)
{
	var fullprot = this.colorProtect(this.colorNum,colorNum);
	if(fullprot == false) {
		//DEATH
		this.makeSmoke(pt,ang);
		if(!this.deathBegin)	this.beginDeath();
	}
};

CharActor.prototype.readInput = function(inputobj)
{
	var keyused = false;
	var keyids = GAMECONTROL.keyIDs;

	if(this.deathBegin || !this.alive)		return;
//	if(this.teleCircle instanceof TeleportCircleActor)		this.teleCircle.readInput(inputobj);
	if(keyids['KEY_ARROW_UP'] == inputobj.keyID || keyids['KEY_W'] == inputobj.keyID)
	{
		keyused = true;
		if(inputobj.keypress == true)
		{
//			this.keyTimeList[0] = GAMEMODEL.getTime();
			this.keyTimeList[0] = GAMEMODEL.getTime();
		}
	}
	if(keyids['KEY_ARROW_DOWN'] == inputobj.keyID || keyids['KEY_S'] == inputobj.keyID)
	{
		keyused = true;
		if(inputobj.keypress == true)
		{
//			this.keyTimeList[2] = GAMEMODEL.getTime();
			this.keyTimeList[2] = GAMEMODEL.getTime();
		}
	}
	if(keyids['KEY_ARROW_RIGHT'] == inputobj.keyID || keyids['KEY_D'] == inputobj.keyID)
	{
		keyused = true;
		if(inputobj.keypress == true)
		{
//			this.keyTimeList[1] = GAMEMODEL.getTime();
			this.keyTimeList[1] = GAMEMODEL.getTime();
		}
	}
	if(keyids['KEY_ARROW_LEFT'] == inputobj.keyID || keyids['KEY_A'] == inputobj.keyID)
	{
		keyused = true;
		if(inputobj.keypress == true)
		{
//			this.keyTimeList[3] = GAMEMODEL.getTime();
			this.keyTimeList[3] = GAMEMODEL.getTime();
		}
	}
	if(keyids['KEY_SPACEBAR'] == inputobj.keyID)
	{
		keyused = true;
		if(inputobj.keypress == true)
		{
//			this.keyTimeList[3] = GAMEMODEL.getTime();
		}
		else {
		}
	}
	if(keyids['KEY_SHIFT'] == inputobj.keyID)
	{
		keyused = true;
		this.shiftHeld = inputobj.keypress;
		if(inputobj.keypress == true)
		{
//			this.keyTimeList[3] = GAMEMODEL.getTime();
		}
		else {
		}
	}
	return keyused;
};

CharActor.alloc = function() {
	var vc = new CharActor();
	vc.init();
	return vc;
};
exports.CharActor = CharActor;
exports.CharActor._loadJSEngineClasses = _loadJSEngineClasses;
