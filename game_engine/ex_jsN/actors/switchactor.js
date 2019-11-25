// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["SwitchActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function SwitchActor() {
}
SwitchActor.prototype = new Actor;
SwitchActor.prototype.identity = function() {
	return ('SwitchActor (' +this._dom.id+ ')');
};
SwitchActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.switchTargets = [];

	this.activated = false;
	this.laserComponents = [];
	this.laserTouches = [];
	this.switchColorNum = 0;
	this.radius = 17;
	this.switchColor = "#FF0000";
	this.haloAlpha = 0.4;

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.size = {w:30,h:30};
	this.position = {x:0,y:0};
	this.updatePosition();
};
SwitchActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
SwitchActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

SwitchActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);


    // Draw Box
 	var prop = {fill:false, color:this.switchColor,width:4};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w-2,height:this.size.h-2};
    var transf = {actions:[{type:'r',angle:45,center:true}]};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    if(this.activated == false) {
	 	var prop = {fill:false, color:this.getNumericColor(this.haloAlpha,this.switchColorNum,'halo'),width:5};
	    prop.source = "default";
	    prop.writeTo = 2;
	 	var shape = {type:"box",width:this.size.w-6,height:this.size.h-6};
	    var transf = {actions:[{type:'r',angle:45,center:true}]};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }

 	var prop = {fill:false, color:"#999999",width:3};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w,height:this.size.h};
    var transf = {actions:[{type:'r',angle:45,center:true}]};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

 	var prop = {fill:false, color:"#000000",width:1};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w+1,height:this.size.h+1};
    var transf = {actions:[{type:'r',angle:45,center:true}]};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);




    for(var i in this.switchTargets) {
    	var actor = this.switchTargets[i];

	 	var prop = {fill:false, color:this.switchColor};
	    if(this.activated == false)		prop.color = this.getNumericColor(this.haloAlpha,this.switchColorNum,'halo');

	    prop.source = "lighter";
	    prop.writeTo = -1;
	    prop.width = 2;
	    var transf = {};
	 	var shape = {type:"line",pt1:{x:0,y:0},pt2:{x:0,y:0}};
		shape.pt2.x = actor.position.x - this.position.x;
		shape.pt2.y = actor.position.y - this.position.y;

	    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }

    if(this.activated == false) {
	    for(var i in this.laserTouches) {
			var lColor = this.getNumericColor(this.haloAlpha, this.laserTouches[i], 'switch');
		 	var prop = {fill:false, color:lColor,width:3};
		    prop.source = "lighter";
		    prop.writeTo = -1;
		 	var shape = {type:"circle",radius:this.radius-6};
		    var transf = {};
		    GAMEVIEW.drawElement(this.position, shape, prop, transf);
	    }
    }
    else {
	 	var prop = {fill:true, color:this.switchColor};
	    prop.source = "lighter";
	    prop.writeTo = -1;
	 	var shape = {type:"circle",radius:this.radius};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }

 	var prop = {};
    prop.source = "default";
    prop.writeTo = -1;
    prop.applyTo = 2;
 	var shape = {};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);



//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
SwitchActor.prototype.addTouchRay = function(num) {
	var Llist = this.getLaserParts(num);
	for(var i in Llist) {
		var cnum = Llist[i];
		if($.inArray(cnum,this.laserTouches) == -1) {
			this.laserTouches.push(cnum);
			this.updateActiveState();
		}
	}
};
SwitchActor.prototype.updateActiveState = function() {
	var m = true;
	for(var r in this.laserComponents) {
		var lValue = this.laserComponents[r];
		if($.inArray(lValue,this.laserTouches) == -1) {
			m=false;
		}
	}
	this.activated=m;
};
SwitchActor.prototype.activateTargets = function() {
	for(var i in this.switchTargets) {
		if(typeof this.switchTargets[i].activated !== "undefined") {
			this.switchTargets[i].activated = true;
		}
	}
};
SwitchActor.prototype.deactivateTargets = function() {
	for(var i in this.switchTargets) {
		if(typeof this.switchTargets[i].activated !== "undefined") {
			this.switchTargets[i].activated = false;
		}
	}
};
SwitchActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.updatePosition();

	var curtime = GAMEMODEL.getTime();

	this.switchColor = this.getNumericColor(this.haloAlpha, this.switchColorNum, 'switch');
	this.laserComponents = this.getLaserParts(this.switchColorNum);

	if(this.activated)		this.activateTargets();
	else					this.deactivateTargets();

	this.activated = false;
	this.laserTouches = [];
};

SwitchActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

SwitchActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	return false;
};
SwitchActor.prototype.collideVs = function(act) {

};
SwitchActor.alloc = function() {
	var vc = new SwitchActor();
	vc.init();
	return vc;
};

exports.SwitchActor = SwitchActor;
exports.SwitchActor._loadJSEngineClasses = SwitchActor;
