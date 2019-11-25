
function ExitActor() {
}
ExitActor.prototype = new Actor;
ExitActor.prototype.identity = function() {
	return ('ExitActor (' +this._dom.id+ ')');
};
ExitActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.orbColorNum = 0;
	this.orbColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 5;
	this.haloAlpha = 0.4;

	this.toLevel = 0;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [4,7];
	this.alphaRange = [0.4,0.7];

	this.secret = false;
	this.secretTimer = 5000;
	this.secretWeight = 0.8;
	this.secretStart = GAMEMODEL.getTime();

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.radius = 10;
	this.size = {w:this.radius*2,h:this.radius*2};
	this.position = {x:0,y:0};
	this.updatePosition();

};
ExitActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
ExitActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

ExitActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);

		var drawOnLayer = 1;
		if(this.secret) {
			var curT = GAMEMODEL.getTime() - this.secretStart;
			if(curT > this.secretTimer) {
				var DT = curT - this.secretTimer;
				DT = DT%(this.secretTimer*2);
				if(DT < this.secretTimer)		return;
				var rangeWeight = this.secretWeight*(this.haloRange[1]-this.haloRange[0]) +this.haloRange[0];
				var alphaWeight = this.secretWeight*(this.alphaRange[1]-this.alphaRange[0]) +this.alphaRange[0];
				if(rangeWeight > this.haloWidth)		return;
				if(alphaWeight > this.haloAlpha)		return;
				rangeWeight = this.haloWidth - rangeWeight;		/**/
				alphaWeight = this.haloAlpha - alphaWeight/2;		/**/


				var Col = this.getNumericColor(alphaWeight, 0, "halo");
				var prop = {fill:false, color:Col,width:rangeWeight};
			    prop.source = "default";
			    prop.writeTo = drawOnLayer;
			 	var shape = {type:"box",width:this.size.w,height:this.size.h};
			    var transf = {};
			    GAMEVIEW.drawElement(this.position, shape, prop, transf);
			}


			return;
		}



	 	var prop = {fill:true, color:"#666666"};
	    prop.source = "default";
	    prop.writeTo = drawOnLayer;
	 	var shape = {type:"box",width:this.size.w,height:this.size.h};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);


	 	var prop = {fill:true, color:"#999999"};
	    prop.source = "default";
	    prop.writeTo = drawOnLayer;
	 	var shape = {type:"box",width:this.size.w/2,height:this.size.h/2};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);

	 	var prop = {fill:true, color:"#CCCCCC"};
	    prop.source = "default";
	    prop.writeTo = drawOnLayer;
	 	var shape = {type:"box",width:this.size.w/4+2,height:this.size.h/4+2};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);


	 	var prop = {fill:false, color:"#000000",width:1};
	    prop.source = "default";
	    prop.writeTo = drawOnLayer;
	 	var shape = {type:"box",width:this.size.w,height:this.size.h};
	    var transf = {};
	    GAMEVIEW.drawElement(this.position, shape, prop, transf);



 		var prop = {fill:true, color:this.haloColor,width:2};
	    prop.source = "default";
	    prop.writeTo = drawOnLayer;
	    prop.font = "bold 9pt Arial";
	 	var shape = {type:"text",text:"EXIT"};
   		var transf = {};
   		var pos = {x:this.position.x,y:this.position.y};
   		pos.x -= 6;
   		pos.y -= 5;
	    GAMEVIEW.drawElement(pos, shape, prop, transf);


//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
ExitActor.prototype.update = function() {
	Actor.prototype.update.call(this);

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


	this.orbColor = this.getNumericColor(1, 0, 'orb');
	this.haloColor = this.getNumericColor(1, 0, "halo");

};

ExitActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

ExitActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	if(act instanceof CharActor)	return true;
	return false;
};
ExitActor.prototype.collideVs = function(act) {
	if(act instanceof CharActor)
	{
		if(GAMEMODEL.collideMode != "PHYSICAL")			return;
		var colls = GAMEGEOM.CircleContainsPt(this.position,this.radius, act.position);
		if(colls && act.alive && !act.deathBegin) {
//			act.alive = false;
//			GAMEMODEL.goToLevel = this.toLevel;
			act.beginExit(this.toLevel);
		}
	}
};

ExitActor.alloc = function() {
	var vc = new ExitActor();
	vc.init();
	return vc;
};
