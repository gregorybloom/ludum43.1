// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","CharActor","EnemyBlasterActor","EnemyJumperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EnemySquareBlaster"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EnemySquareBlaster() {
}
EnemySquareBlaster.prototype = new EnemyBlasterActor;
EnemySquareBlaster.prototype.identity = function() {
	return ('EnemySquareBlaster (' +this._dom.id+ ')');
};
EnemySquareBlaster.prototype.init = function() {
	EnemyBlasterActor.prototype.init.call(this);

  this.facingAngle = 270;
	this.heading = {x:-1,y:0};
	this.unitSpeed = 0.04;

	this.health = 1;
	this.empty = false;

  this.haloRange = [4,7];
  this.alphaRange = [0.1,0.4];

	this.deathSize = {w:this.size.w,h:this.size.h};

  this.deathTimer.lifeTime = 2000;
  this.shotTimer.lifeTime = 1500;

  this.laserActor = null;
	this.laserAngle = 270;
	this.laserHeading = {x:-1,y:0};
	this.laserAdded = false;

	this.lifelineTimer = TimerObj.alloc();
	this.lifelineTimer.lifeTime = 26000;
	this.lifelineTimer.looping = false;

	this.size = {w:50,h:50};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.collisionModule = CollisionModule.alloc();
	this.collisionModule.parent = this;
	this.collisionModule.addShape( BoxShape.alloc() );
	this.collisionModule.shape.size.w = this.size.w;
	this.collisionModule.shape.size.h = this.size.h;
};
EnemySquareBlaster.prototype.clear = function() {
	EnemyBlasterActor.prototype.clear.call(this);
};
EnemySquareBlaster.prototype.draw = function() {
	EnemyBlasterActor.prototype.draw.call(this);



	if(this.deathTimer.running) {
		var BX = {w:this.deathSize.w,h:this.deathSize.h};
		BX.x = this.absPosition.x - BX.w/2;
		BX.y = this.absPosition.y - BX.h/2;
		GAMEVIEW.drawBox(BX,"#666666",1);

		var c = this.deathTimer.getCycle();
			var dt = this.deathTimer.cycledBy + this.deathTimer.lifeTime;
			var deathDiff = Math.max(0,1-dt/this.deathTimer.lifeTime);

		GAMEVIEW.fillBox(this.absBox,"rgba(0,0,0,"+deathDiff+")");

	}
	else {
		var prop = {fill:true, color:"#EEEEEE", width:1.5};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"box",width:this.size.w,height:this.size.h};
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

		var scale = 3/4;
		if(!this.empty) {

			var prop = {fill:false, color:this.haloColor,width:this.haloWidth};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"box",width:scale*this.size.w,height:scale*this.size.h};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);

			var prop = {fill:false, color:this.haloColor,width:this.haloWidth};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"box",width:scale*this.size.w,height:scale*this.size.h};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);


			var prop = {fill:false, color:this.orbColor, width:1};
			prop.source = "default";
			prop.writeTo = 2;
			var shape = {type:"box",width:this.size.w/2,height:this.size.h/2};
			var transf = {};
			GAMEVIEW.drawElement(this.position, shape, prop, transf);
		}




		var prop = {fill:false, color:"#000000", width:1.5};
		prop.source = "default";
		prop.writeTo = 2;
		var shape = {type:"box",width:this.size.w,height:this.size.h};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);
	}



//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
EnemySquareBlaster.prototype.update = function() {
	this.shotTimer.stopTimer();
	EnemyBlasterActor.prototype.update.call(this);

	if(this.collisionModule instanceof CollisionModule) {
		if(this.collisionModule.shape instanceof BoxShape) {
			if(JSON.stringify(this.size) !== JSON.stringify(this.collisionModule.shape.size)) {
				this.collisionModule.shape.size.w = this.size.w;
				this.collisionModule.shape.size.h = this.size.h;
			}
		}
	}


	this.lifelineTimer.update();

	if(!this.lifelineTimer.running) {
		this.lifelineTimer.startTimer();
		this.lifelineTimer.update();
	}
	var c = this.lifelineTimer.getCycle();
	if(this.lifelineTimer.running && !this.deathTimer.running && c.cycled)	{
		this.deathTimer.startTimer();
		this.deathTimer.update();
	}

};

EnemySquareBlaster.prototype.updateDeath = function() {
	if(!this.deathTimer.running)		return;
	EnemyBlasterActor.prototype.updateDeath.call(this);

	var c = this.deathTimer.getCycle();
	if(this.deathTimer.running && !c.cycled)	{
		var dt = this.deathTimer.cycledBy + this.deathTimer.lifeTime;
		var deathDiff = dt/this.deathTimer.lifeTime;

		this.deathSize.w = this.size.w*0.9 + 12*(deathDiff);
		this.deathSize.h = this.size.h*0.9 + 12*(deathDiff);
	}
};

EnemySquareBlaster.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	EnemyBlasterActor.prototype.collide.call(this,act);
};

EnemySquareBlaster.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(act instanceof EnemyJumperActor)	return true;
	if(act instanceof CharActor)	return true;
	return false;
};
EnemySquareBlaster.prototype.collideVs = function(act) {
	if(act instanceof CharActor || act instanceof EnemyJumperActor)
	{
		if(this.deathTimer.running)		return;
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;

		if(act.boxShape instanceof BoxShape) {}
		else 	return;

		var bool = this.collisionModule.collideVs(act.boxShape,"intersection");
		if(bool == false)		return;

		var interBox = bool['intersection'];
		var push = {x:interBox.w,y:interBox.h};

		var interCenter = {x:0,y:0};
		interCenter.x = interBox.xc;
		interCenter.y = interBox.yc;

		var thisCenter = {x:0,y:0};
		thisCenter.x = act.absBox.x + act.absBox.w/2;
		thisCenter.y = act.absBox.y + act.absBox.h/2;

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
		actCenter.x = this.absBox.x + this.absBox.w/2;
		actCenter.y = this.absBox.y + this.absBox.h/2;

		if(interCenter.x > actCenter.x)		push.x = -push.x;
		if(interCenter.y > actCenter.y)		push.y = -push.y;

		if((collisionDir%2) == 0)	push.x = 0;
		else						push.y = 0;


		var colls = false;
		if( Math.abs(push.x)+Math.abs(push.y) > 0 )		colls=true;
		push = GAMEGEOM.roundOffValues(push);

		var fullprot = false;
		fullprot = this.colorProtect(act.colorNum,this.colorNum);

		if(colls) {
			if( (this.empty || fullprot) && collisionDir == 1 && interCenter.x < (-400-2+this.size.w/2) && push.x >= act.radius/2) {
				act.beginDeath();
			}
			else if(this.empty) {
				act.shiftPosition( {x:-push.x,y:-push.y} );
			}
			else if(fullprot) {
				this.shiftPosition( {x:push.x,y:push.y} );
			}
			else if(act instanceof CharActor) {
				act.shiftPosition( {x:-push.x,y:-push.y} );
				act.health -= 2;
				act.impact(null,4.0);
			}
			else if(act instanceof EnemyJumperActor) {
				act.shiftPosition( {x:-push.x,y:-push.y} );
				act.health -= 2;
				act.impact(null,1.0);
			}
//			act.colorNum = this.colorNum;
//			this.beginDeath();
		}
	}
};

EnemySquareBlaster.alloc = function() {
	var vc = new EnemySquareBlaster();
	vc.init();
	return vc;
};


exports.EnemySquareBlaster = EnemySquareBlaster;
exports.EnemySquareBlaster._loadJSEngineClasses = _loadJSEngineClasses;
