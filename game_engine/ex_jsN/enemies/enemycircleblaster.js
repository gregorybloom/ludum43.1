// CommonJS ClassLoader Hack
var classLoadList = ["CharActor","EnemyBlasterActor","EnemyJumperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemyCircleBlaster"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EnemyCircleBlaster() {
}
EnemyCircleBlaster.prototype = new EnemyBlasterActor;
EnemyCircleBlaster.prototype.identity = function() {
	return ('EnemyCircleBlaster (' +this._dom.id+ ')');
};
EnemyCircleBlaster.prototype.init = function() {
	EnemyBlasterActor.prototype.init.call(this);

  this.facingAngle = 270;
	this.heading = {x:-1,y:0};
	this.unitSpeed = 0.04;

	this.health = 1;

  this.haloRange = [4,7];
  this.alphaRange = [0.1,0.4];

  this.deathTimer.lifeTime = 250;
  this.shotTimer.lifeTime = 1500;

  this.laserActor = null;
	this.laserAngle = 270;
	this.laserHeading = {x:-1,y:0};
	this.laserAdded = false;

	this.radius = 20;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.collisionModule = CollisionModule.alloc();
	this.collisionModule.parent = this;
	this.collisionModule.addShape( CircleShape.alloc() );
	this.collisionModule.shape.radius = this.radius;
};
EnemyCircleBlaster.prototype.clear = function() {
	EnemyBlasterActor.prototype.clear.call(this);
};
EnemyCircleBlaster.prototype.draw = function() {
	EnemyBlasterActor.prototype.draw.call(this);

	var startRad = 3*this.radius/4;


	if(this.deathTimer.running) {
		GAMEVIEW.drawCircle(this.absPosition,this.deathRadius,"#666666",1);
	}
	else {
		var prop = {fill:true, color:"#EEEEEE", width:1};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"circle",radius:this.radius};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);


		if(this.loadedItem && typeof this.loadedItem.type !== "undefined") {
			if(this.loadedItem.type == "ITEMORB") {
				var orbColor = this.getNumericColor(1,this.loadedItem.item.colorNum,'laser');

				var prop = {fill:true, color:orbColor, width:1};
				prop.source = "default";
				prop.writeTo = 2;
				var shape = {type:"circle",radius:7};
				var transf = {};
				GAMEVIEW.drawElement(this.position, shape, prop, transf);
			}
		}


		var prop = {fill:false, color:this.haloColor,width:this.haloWidth};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"circle",radius:(startRad)};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);

		var prop = {fill:false, color:this.haloColor,width:this.haloWidth};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"circle",radius:(startRad)};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);


		var prop = {fill:false, color:this.orbColor, width:1};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"circle",radius:startRad/2};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);



		var prop = {fill:false, color:"#000000", width:1.5};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"circle",radius:this.radius};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);
	}



//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
EnemyCircleBlaster.prototype.update = function() {
	EnemyBlasterActor.prototype.update.call(this);
};

EnemyCircleBlaster.prototype.updateDeath = function() {
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

EnemyCircleBlaster.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	EnemyBlasterActor.prototype.collide.call(this,act);
};

EnemyCircleBlaster.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(act instanceof CharActor)	return true;
	if(act instanceof EnemyJumperActor)	return true;
	return false;
};
EnemyCircleBlaster.prototype.collideVs = function(act) {
	if(act instanceof CharActor || act instanceof EnemyJumperActor)
	{
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;

		var bool = this.collisionModule.collideVs(act,"check");
		if(bool) {
			var fullprot = this.colorProtect(act.colorNum,this.colorNum);
			if(!fullprot) {
				if(act instanceof CharActor) {
					act.health -= 2;
					act.impact(null,4.0);
				}
				if(act instanceof EnemyJumperActor) {
					act.health -= 2;
					act.impact(null,1.0);
				}
			}
			this.beginDeath();
		}
	}
};

EnemyCircleBlaster.alloc = function() {
	var vc = new EnemyCircleBlaster();
	vc.init();
	return vc;
};


exports.EnemyCircleBlaster = EnemyCircleBlaster;
exports.EnemyCircleBlaster._loadJSEngineClasses = _loadJSEngineClasses;
