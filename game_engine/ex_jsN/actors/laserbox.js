// CommonJS ClassLoader Hack
var classLoadList = ["Actor","LaserBeamActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["LaserBoxActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function LaserBoxActor() {
}
LaserBoxActor.prototype = new Actor;
LaserBoxActor.prototype.identity = function() {
	return ('LaserBoxActor (' +this._dom.id+ ')');
};
LaserBoxActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.laserActor = null;

	this.ticksDiff = 0;
	this.facingAngle = 135;
	this.heading = {x:0,y:0};
	this.angleChange = 0.04;
	this.changeDirection = 0;

	this.angleRange = [];

	this.unitSpeed = 0.04;
	this.health = 0;

	this.target = null;
	this.linkedOn = false;

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.size = {w:24,h:36};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.radius = Math.min(this.size.w/2,this.size.h/2);
};
LaserBoxActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
LaserBoxActor.prototype.createLaser = function(num) {
    var L1 = LaserBeamActor.alloc();
    L1.rayNumber = num;
    L1.updatePosition(this.position);
    GAMEMODEL.gameSession.gameWorld.addActor(L1,'laser');
    this.laserActor = L1;
    L1.rayParentActor = this;
};
LaserBoxActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};
LaserBoxActor.prototype.limitAngle = function(ang) {
	if(this.angleRange.length < 2)	return ang;
	ang = Math.max(ang, this.angleRange[0]);
	ang = Math.min(ang, this.angleRange[1]);
	return ang;
};
LaserBoxActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);


    // Draw Box
 	var prop = {fill:true, color:"#999999"};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w,height:this.size.h};
    var transf = {actions:[{type:'r',angle:this.facingAngle,center:true}]};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

    if(this.laserActor instanceof LaserBeamActor)
    {
    	if(this.linkedOn) {
		 	var prop = {fill:true, color:this.laserActor.laserColor};
		    prop.source = "default";
		    prop.writeTo = 2;
		 	var shape = {type:"circle",radius:this.radius/2};
		    var transf = {};
		    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    	}

	 	var prop = {fill:false, color:"#000000", width:0.5};
	 	if(this.linkedOn)		prop.fill = true;
	 	if(this.linkedOn)		prop.color = this.laserActor.laserColor;
	    prop.source = "default";
	    prop.writeTo = 2;
	 	var shape = {type:"circle",radius:this.radius/2};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }
//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
LaserBoxActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.updatePosition();

	var curtime = GAMEMODEL.getTime();

	this.facingAngle += this.angleChange*this.ticksDiff*this.changeDirection;

	if(this.facingAngle > 720)		this.facingAngle-=360;
	if(this.facingAngle < -720)		this.facingAngle+=360;
	this.facingAngle = this.limitAngle(this.facingAngle);

	this.heading = this.getHeadingFromAngle(this.facingAngle);

	if(this.laserActor instanceof LaserBeamActor) {
		this.laserActor.facingAngle = this.facingAngle;
		this.laserActor.heading.x = this.heading.x;
		this.laserActor.heading.y = this.heading.y;
	    this.laserActor.updatePosition(this.position);
	}
	this.linkedOn = false;
};
LaserBoxActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

LaserBoxActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	return false;
};
LaserBoxActor.prototype.collideVs = function(act) {

};
LaserBoxActor.prototype.mouseClickAt = function(kInput) {
    var screenPt = GAMEVIEW.PtToDrawCoords(this.position);
    var d1 = kInput.pos.x-screenPt.x;
    var d2 = kInput.pos.y-screenPt.y;
    var d = d1*d1 + d2*d2;

    var r = this.size;
    r = (r.w*r.w + r.h*r.h)*0.85;

    if(d <= r) {
        if(kInput.bpress) {
            if(this.laserActor instanceof LaserBeamActor) {
                this.laserActor.rayNumber++;
            }
        }
    }
};
LaserBoxActor.alloc = function() {
	var vc = new LaserBoxActor();
	vc.init();
	return vc;
};


exports.LaserBoxActor = LaserBoxActor;
exports.LaserBoxActor._loadJSEngineClasses = _loadJSEngineClasses;
