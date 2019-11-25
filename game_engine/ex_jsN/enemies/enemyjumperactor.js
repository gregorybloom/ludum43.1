// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","Actor","CharActor","StepModule","BlockActor","LaserBoxActor","EnemyBlasterActor"];
classLoadList.push("TeleportCircleActor","EnemyTeleportCircle");
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyJumperActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EnemyJumperActor() {
}
EnemyJumperActor.prototype = new EnemyBlasterActor;
EnemyJumperActor.prototype.identity = function() {
	return ('EnemyJumperActor (' +this._dom.id+ ')');
};
EnemyJumperActor.prototype.init = function() {
	EnemyBlasterActor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.shotAngle = 270;
	this.facingAngle = 270;
	this.heading = {x:-1,y:0};
	this.unitSpeed = 0.04;

	this.scoreValue = 0;

	this.colorNum = 0;
	this.orbColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 5;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [4,7];
	this.alphaRange = [0.1,0.4];

	this.deathTimer.lifeTime = 250;
	this.shotTimer.lifeTime = 1500;

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

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


	this.laserActor = null;
	this.laserAngle = 270;
	this.laserHeading = {x:-1,y:0};
	this.laserAdded = false;

	this.radius = 20;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.loadedItem = null;

	this.stepModule = StepModule.alloc();
	this.stepModule.target = this;

	this.health = 2;


	this.teleCircle = EnemyTeleportCircle.alloc();
	this.teleCircle.parent = this;
	this.teleCircle.circleType = "enemy";


	this.collisionModule = CollisionModule.alloc();
	this.collisionModule.parent = this;
	this.collisionModule.addShape( CircleShape.alloc() );
	this.collisionModule.shape.radius = this.radius;

	this.boxShape = BoxShape.alloc();
	this.boxShape.parent = this;
	this.boxShape.size.w = this.size.w;
	this.boxShape.size.h = this.size.h;
};
EnemyJumperActor.prototype.draw = function() {
	EnemyBlasterActor.prototype.draw.call(this);



		var startRad = 2*this.radius/4;


		if(this.deathTimer.running) {
			GAMEVIEW.drawCircle(this.absPosition,this.deathRadius,"#666666",1);
		}
		else {
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


			var prop = {fill:true, color:"#EEEEEE", width:1};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"circle",radius:this.radius};
			var transf = {};
			GAMEVIEW.drawElement(pos, shape, prop, transf);


			if(this.loadedItem && typeof this.loadedItem.type !== "undefined") {
				if(this.loadedItem.type == "ITEMORB") {
					var orbColor = this.getNumericColor(1,this.loadedItem.item.colorNum,'laser');

					var prop = {fill:true, color:orbColor, width:1};
					prop.source = "default";
					prop.writeTo = 2;
					var shape = {type:"circle",radius:4};
					var transf = {};
					GAMEVIEW.drawElement(pos, shape, prop, transf);
				}
			}
			var prop = {fill:false, color:this.haloColor,width:(this.haloWidth+5)};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"circle",radius:(startRad)};
			var transf = {};
			GAMEVIEW.drawElement(pos, shape, prop, transf);


			var prop = {fill:false, color:this.orbColor, width:3};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"circle",radius:(startRad-2)};
			var transf = {};
			GAMEVIEW.drawElement(pos, shape, prop, transf);


			var prop = {fill:false, color:"rgba(0,0,0,0.5)", width:3.5};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"circle",radius:(this.radius-2.5)};
			var transf = {};
			GAMEVIEW.drawElement(pos, shape, prop, transf);

			var prop = {fill:false, color:"#000000", width:1.5};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"circle",radius:this.radius};
			var transf = {};
			GAMEVIEW.drawElement(pos, shape, prop, transf);


			if(this.hurtTimer.running) {
				var shape = {type:"circle",radius:(this.radius+2)};
				var prop = {fill:true, color:"rgba(00,113,197,0.25)",width:1};
				prop.writeTo = 2;
				var hi = (this.hurtIntensity/10);
				var hiO = Math.min(1.0, hi+0.3);
				var hiL = Math.min(1.0, hi+0.25);
				var t = this.hurtTimer.lifeTime+this.hurtTimer.getCycle()['time'];
				if(t < (this.hurtTimer.lifeTime/2) )			prop.color="rgba(220,0,50,"+hiO+")";
				else																			prop.color="rgba(170,90,70,"+hiL+")";
				shape.radius = this.radius;
				GAMEVIEW.drawElement(pos, shape, prop, transf);
			}


			if(this.teleCircle instanceof Actor)	this.teleCircle.draw();

			if(this.teleCircle instanceof TeleportCircleActor) {
				var tele = this.teleCircle;
//				var angle = tele.points[tele.selector];
				var angle = this.facingAngle;

				var P2 = GAMEGEOM.rotatePoint({x:0,y:this.radius-3}, angle);
				var pospt = {};
				pospt.x = P2.x + pos.x;
				pospt.y = P2.y + pos.y;

				var prop = {fill:true, color:"#FFFFFF"};
				prop.source = "default";
				prop.writeTo = 2;
				var shape = {type:"circle",radius:2.5};
				var transf = {};
				GAMEVIEW.drawElement(pospt, shape, prop, transf);
			}		/**/
		}


//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
EnemyJumperActor.prototype.update = function() {
	this.shotTimer.stopTimer();
	EnemyBlasterActor.prototype.update.call(this);
	if(!this.alive)	return;
	if(this.teleCircle instanceof Actor)	this.teleCircle.update();

	this.impactTimer.update();
	this.invincTimer.update();
	this.hurtTimer.update();

	this.checkImpact();

		if(this.boxShape instanceof BoxShape) {
			if(JSON.stringify(this.size) !== JSON.stringify(this.boxShape.size)) {
				this.boxShape.size.w = this.size.w;
				this.boxShape.size.h = this.size.h;
			}
		}
};

EnemyJumperActor.prototype.updateDeath = function() {
	if(!this.deathTimer.running)		return;
	EnemyBlasterActor.prototype.updateDeath.call(this);

	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && !c.cycled)	{
		var dt = this.deathTimer.cycledBy + this.deathTimer.lifeTime;
		var deathDiff = dt/this.deathTimer.lifeTime;

		this.deathRadius = this.radius*0.9 + 12*(deathDiff);
	}
	if(c.cycled && this.alive) {
		this.clear();
		this.alive = false;
	}
};

EnemyJumperActor.prototype.beginTeleport = function() {
	if(this.teleCircle instanceof Actor) {
		this.teleCircle.startTimer();
	}

};
EnemyJumperActor.prototype.checkImpact = function() {
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

EnemyJumperActor.prototype.impact = function(data,hi) {
	if(!this.impactTimer.running)		this.impactTimer.startTimer();
	if(!this.invincTimer.running)		this.invincTimer.startTimer();
	if(!this.hurtTimer.running)		this.hurtTimer.startTimer();
	this.hurtIntensity = hi;
};

EnemyJumperActor.prototype.collide = function(act) {
	EnemyBlasterActor.prototype.collide.call(this,act);
};
EnemyJumperActor.prototype.collideType = function(act) {
	if(act instanceof BlockActor)		return true;
	if(act instanceof LaserBoxActor)	return true;
	if(act instanceof CharActor)	return true;
	return false;
};
EnemyJumperActor.prototype.collideVs = function(act) {

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
	if(act instanceof CharActor)
	{
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;

		var bool = this.collisionModule.collideVs(act,"check");
		if(bool) {
			var fullprot = this.colorProtect(act.colorNum,this.colorNum);
			if(!fullprot) {
				act.health -= 4;
				act.impact(null,4.0);
			}
			this.beginDeath();
		}
	}
};



EnemyJumperActor.alloc = function() {
	var vc = new EnemyJumperActor();
	vc.init();
	return vc;
};

exports.EnemyJumperActor = EnemyJumperActor;
exports.EnemyJumperActor._loadJSEngineClasses = _loadJSEngineClasses;
