// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","Actor","EnemyActor","LaserBeamActor","EnemyShotActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyBlasterActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EnemyBlasterActor() {
}
EnemyBlasterActor.prototype = new EnemyActor;
EnemyBlasterActor.prototype.identity = function() {
	return ('EnemyBlasterActor (' +this._dom.id+ ')');
};
EnemyBlasterActor.prototype.init = function() {
	EnemyActor.prototype.init.call(this);

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

	this.laserActor = null;
	this.laserAngle = 270;
	this.laserHeading = {x:-1,y:0};
	this.laserAdded = false;

	this.laserStartUpTimer = TimerObj.alloc();
	this.laserStartUpTimer.lifeTime = 1000;
	this.laserStartUpTimer.looping = false;

	this.firingTypes = ['basic'];

	this.radius = 20;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.loadedItem = null;

};
EnemyBlasterActor.prototype.createLaser = function(num) {
		this.startedTimer.startTimer();
		this.startedTimer.update();
		this.stepsTimer.startTimer();
		this.stepsTimer.update();

    var L1 = LaserBeamActor.alloc();
    L1.rayNumber = num;
    L1.updatePosition(this.position);
    this.laserActor = L1;
		this.laserAdded = false;
    L1.rayParentActor = this;
		this.shotTimer.stopTimer();
};

EnemyBlasterActor.prototype.clear = function() {
	EnemyActor.prototype.clear.call(this);
	this.steps = null;
	if(this.laserActor instanceof Actor) {
		this.laserActor.alive = false;
		this.laserActor.clear();
	}
};
EnemyBlasterActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};
EnemyBlasterActor.prototype.checkShoot = function() {
	if(this.shotTimer.lifeTime < 0)		this.shotTimer.stopTimer();
	if(this.shotTimer.lifeTime < 0)		return;
	var c = this.shotTimer.getCycle();
	if(this.shotTimer.running && c.cycled)	{
		this.beginShoot();
	}
};
EnemyBlasterActor.prototype.beginShoot = function() {
	var rock = EnemyShotActor.alloc();
	rock.updatePosition(this.position);

	rock.heading.x = -1;
	rock.heading.y = 0;
	if(this.shotAngle)	rock.heading=this.getHeadingFromAngle(this.shotAngle+180);
	if(this.target)			rock.heading=this.getHeadingAt(this.target.absPosition);

	rock.shiftPosition({x: rock.heading.x* this.size.w / 2, y: rock.heading.y* this.size.h / 2});
	rock.firer = this;
	GAMEMODEL.gameSession.gameWorld.addActor(rock, 'bullet');
};
EnemyBlasterActor.prototype.draw = function() {
	EnemyActor.prototype.draw.call(this);


//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
EnemyBlasterActor.prototype.update = function() {
	EnemyActor.prototype.update.call(this);
	if(this.deathTimer.running) {
		if(this.laserActor instanceof Actor) {
			this.laserActor.alive = false;
			this.laserActor.clear();
		}
	}
	else if(this.startedTimer.running && !this.laserAdded) {
		if(!this.deathTimer.running && this.laserActor instanceof LaserBeamActor) {
				this.laserAdded = true;
				GAMEMODEL.gameSession.gameWorld.addActor(this.laserActor,'laser');

				this.laserHeading = this.getHeadingFromAngle(this.laserAngle);
				var yCheck = Math.round(this.laserHeading.y*100)/100;
				if(this.laserHeading.x < 0 && yCheck == 0) {
					this.laserStartUpTimer.lifeTime = 1000;
					this.laserStartUpTimer.startTimer();
					this.laserStartUpTimer.update();
				}

		}
	}

	this.laserStartUpTimer.update();

	this.updatePosition();


	var curtime = GAMEMODEL.getTime();


	var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);

	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];


	this.orbColor = this.getNumericColor(this.haloAlpha, this.colorNum, 'orb');
	this.haloColor = this.getNumericColor(this.haloAlpha, this.colorNum, "halo");

	this.heading = this.getHeadingFromAngle(this.facingAngle+180);

	if(this.laserActor instanceof LaserBeamActor) {
		this.laserHeading = this.getHeadingFromAngle(this.laserAngle);

		this.laserActor.facingAngle = this.laserAngle;
		this.laserActor.heading.x = this.laserHeading.x;
		this.laserActor.heading.y = this.laserHeading.y;
    this.laserActor.updatePosition(this.position);

		var c = this.laserStartUpTimer.getCycle();
		if(this.laserStartUpTimer.running && !c.cycled)	{
			var dt = this.laserStartUpTimer.cycledBy + this.laserStartUpTimer.lifeTime;
			this.laserActor.laserMaxLength = 20 + 25*dt/this.laserStartUpTimer.lifeTime;
			this.laserActor.shortened = true;
		}
		else {
			this.laserActor.shortened = false;
			this.laserActor.laserMaxLength = 1500;
		}


	}
/**/
};
EnemyBlasterActor.prototype.beginDeath = function() {
	if(!this.deathTimer.running)
	{
		if(GAMEVIEW.BoxIsInCamera(this.absBox)) {
			GAMEMODEL.playerScore += this.scoreValue;
			var r = 0.9 + 0.3 * Math.random();
			var v = 0.55 + 0.1 * Math.random();

			this.playSound(0, v, r);
		}
		this.shotTimer.stopTimer();


		if(this.loadedItem && typeof this.loadedItem.type !== "undefined") {
			if(this.loadedItem.type == "ITEMORB") {
				var I = this.loadedItem.item;
				I.updatePosition(this.position);
				GAMEMODEL.gameSession.gameWorld.addActor(I,'act');
				this.loadedItem = null;
			}
		}
		EnemyActor.prototype.beginDeath.call(this);
	}
};
EnemyBlasterActor.prototype.updateDeath = function() {
	if(!this.deathTimer.running)		return;

	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && !c.cycled)	{
		var dt = this.deathTimer.cycledBy + this.deathTimer.lifeTime;
		var deathDiff = dt/this.deathTimer.lifeTime;
	}
	if(c.cycled && this.alive) {
		this.clear();
		this.alive = false;
	}

};

EnemyBlasterActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	EnemyActor.prototype.collide.call(this,act);
};

EnemyBlasterActor.prototype.collideType = function(act) {
};
EnemyBlasterActor.prototype.collideVs = function(act) {
};

EnemyBlasterActor.alloc = function() {
	var vc = new EnemyBlasterActor();
	vc.init();
	return vc;
};

exports.EnemyBlasterActor = EnemyBlasterActor;
exports.EnemyBlasterActor._loadJSEngineClasses = _loadJSEngineClasses;
