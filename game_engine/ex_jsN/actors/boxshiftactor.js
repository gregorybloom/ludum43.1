// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["BoxShiftActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function BoxShiftActor() {
}
BoxShiftActor.prototype = new Actor;
BoxShiftActor.prototype.identity = function() {
	return ('BoxShiftActor (' +this._dom.id+ ')');
};
BoxShiftActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.boxType = 1;
	this.shiftType = {u:1,d:1,l:1,r:1};
	this.moveable = true;
	this.moving = false;
	this.loop = false;


	this.scoreValue = 0;

	this.activated = false;
	this.solid = true;
	this.transparent = false;

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.size = {w:14,h:14};
	this.position = {x:0,y:0};
	this.updatePosition();

	this.setBoxType(1);
};
BoxShiftActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
BoxShiftActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};
BoxShiftActor.prototype.setBoxType = function(type) {
	this.boxType = type;
	if(type == 1) {
		this.shiftType = {u:1,d:1,l:1,r:1};
		this.moveable = true;
		this.moving = false;
		this.loop = false;
	}
	if(type == 2) {
		this.shiftType = {u:0,d:0,l:1,r:1};
		this.moveable = true;
		this.moving = false;
		this.loop = false;
	}
	if(type == 3) {
		this.shiftType = {u:1,d:1,l:0,r:0};
		this.moveable = true;
		this.moving = false;
		this.loop = false;
	}
	if(type >= 10 && type <= 13) {
		this.shiftType = {u:0,d:0,l:0,r:0};
		if(type == 10)		this.shiftType.u = 1;
		if(type == 11)		this.shiftType.r = 1;
		if(type == 12)		this.shiftType.d = 1;
		if(type == 13)		this.shiftType.l = 1;
		this.moveable = true;
		this.moving = false;
		this.loop = false;
	}
	if(type >= 100 && type <= 120) {
		this.shiftType = {u:0,d:0,l:0,r:0};
		var diff = type - 100;
		if((diff&1) == 1)			this.shiftType.u = 1;
		if((diff&2) == 2)			this.shiftType.r = 1;
		if((diff&4) == 4)			this.shiftType.d = 1;
		if((diff&8) == 8)			this.shiftType.l = 1;
		this.moveable = true;
		this.moving = false;
		this.loop = false;
	}
};

BoxShiftActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);


    // Draw Box
		/*
    if(this.solid && !this.transparent)
    {
		 	var prop = {fill:true, color:"#999999"};
		    prop.source = "default";
		    prop.writeTo = 1;
		 	var shape = {type:"box",width:this.size.w,height:this.size.h};
		    var transf = {};
		    GAMEVIEW.drawElement(this.position, shape, prop, transf);
		}
	/**/

	var prop = {fill:true, color:"#009999"};
		prop.source = "default";
		prop.writeTo = 1;
	var shape = {type:"box",width:this.size.w-2,height:this.size.h-2};
		var transf = {};
		GAMEVIEW.drawElement(this.position, shape, prop, transf);


	 	var prop = {fill:false, color:"#999999",width:3};
	    prop.source = "default";
	    prop.writeTo = 1;
	 	var shape = {type:"box",width:this.size.w-5,height:this.size.h-5};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);

			var prop = {fill:false, color:"#FFFFFF",width:3};
		    prop.source = "default";
		    prop.writeTo = 1;
		 	var shape = {type:"box",width:this.size.w-1,height:this.size.h-1};
		    var transf = {};
		    GAMEVIEW.drawElement(this.position, shape, prop, transf);

				if(this.moveable) {
						if(this.shiftType.u && this.shiftType.d && this.shiftType.l && this.shiftType.r) {
							var prop = {fill:true, color:"#FFFFFF",width:1};
								prop.source = "default";
								prop.writeTo = 1;
								var shape = {type:"shape",pts:[]};
								var transf = {};
								shape.pts.push({x:0,y:-4,t:'m'});
								shape.pts.push({x:4,y:0, t:'l'});
								shape.pts.push({x:0,y:4, t:'l'});
								shape.pts.push({x:-4,y:0, t:'l'});
								shape.pts.push({x:0,y:-4,t:'l'});
								GAMEVIEW.drawElement(this.position, shape, prop, transf);
						}
						else {
							if(this.shiftType.u) {
								var prop = {fill:true, color:"#FFFFFF",width:1};
								prop.source = "default";
								prop.writeTo = 1;
								var shape = {type:"shape",pts:[]};
								var transf = {};
								shape.pts.push({x:0,y:-6,t:'m'});
								shape.pts.push({x:3,y:-2, t:'l'});
								shape.pts.push({x:-3,y:-2, t:'l'});
								shape.pts.push({x:0,y:-6,t:'l'});
								GAMEVIEW.drawElement(this.position, shape, prop, transf);
							}
							if(this.shiftType.d) {
								var prop = {fill:true, color:"#FFFFFF",width:1};
								prop.source = "default";
								prop.writeTo = 1;
								var shape = {type:"shape",pts:[]};
								var transf = {};
								shape.pts.push({x:0,y:6,t:'m'});
								shape.pts.push({x:3,y:2, t:'l'});
								shape.pts.push({x:-3,y:2, t:'l'});
								shape.pts.push({x:0,y:6,t:'l'});
								GAMEVIEW.drawElement(this.position, shape, prop, transf);
							}
							if(this.shiftType.l) {
								var prop = {fill:true, color:"#FFFFFF",width:1};
								prop.source = "default";
								prop.writeTo = 1;
								var shape = {type:"shape",pts:[]};
								var transf = {};
								shape.pts.push({x:-6,y:0,t:'m'});
								shape.pts.push({x:-2,y:3, t:'l'});
								shape.pts.push({x:-2,y:-3, t:'l'});
								shape.pts.push({x:-6,y:0,t:'l'});
								GAMEVIEW.drawElement(this.position, shape, prop, transf);
							}
							if(this.shiftType.r) {
								var prop = {fill:true, color:"#FFFFFF",width:1};
								prop.source = "default";
								prop.writeTo = 1;
								var shape = {type:"shape",pts:[]};
								var transf = {};
								shape.pts.push({x:6,y:0,t:'m'});
								shape.pts.push({x:2,y:3, t:'l'});
								shape.pts.push({x:2,y:-3, t:'l'});
								shape.pts.push({x:6,y:0,t:'l'});
								GAMEVIEW.drawElement(this.position, shape, prop, transf);
							}
						}
				}




	 	var prop = {fill:false, color:"#000000",width:1};
	    prop.source = "default";
	    prop.writeTo = 1;
	 	var shape = {type:"box",width:this.size.w,height:this.size.h};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);


//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
BoxShiftActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.updatePosition();

	var curtime = GAMEMODEL.getTime();

	this.solid = !this.activated;

};
BoxShiftActor.prototype.mouseClickAt = function(kInput) {

//    var screenPt = GAMEVIEW.PtToDrawCoords(this.position);
//    var d1 = kInput.pos.x-screenPt.x;
//    var d2 = kInput.pos.y-screenPt.y;
	var screenPt = GAMEVIEW.DrawPtToWorldCoords(kInput.pos);
    var clicked = GAMEGEOM.BoxContainsPt(this.absBox,screenPt);

    if(clicked) {
        if(kInput.bpress) {
            this.activated = !this.activated;
        }
    }
};

BoxShiftActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

BoxShiftActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	return false;
};
BoxShiftActor.prototype.collideVs = function(act) {

};
BoxShiftActor.alloc = function() {
	var vc = new BoxShiftActor();
	vc.init();
	return vc;
};


exports.BoxShiftActor = BoxShiftActor;
exports.BoxShiftActor._loadJSEngineClasses = _loadJSEngineClasses;
