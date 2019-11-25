// CommonJS ClassLoader Hack
var classLoadList = ["EffectActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["TelPathActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function TelPathActor() {
}
TelPathActor.prototype = new EffectActor;
TelPathActor.prototype.identity = function() {
	return ('TelPathActor (' +this._dom.id+ ')');
};
TelPathActor.prototype.init = function() {
	EffectActor.prototype.init.call(this);

	this.WALL_LEVEL = 1;
	this.MIRROR_LEVEL = 3;
	this.MAX_WIDTH = 7;

	this.size = {w:20,h:20};
	this.position = {x:0,y:0};

	this.baseOffset = {x:0.5,y:0.5};
	this.actionMode = "MODE_STILL";

	this.drawShift = {x:0,y:0};

  this.startPt = {x:0,y:40};
  this.endPt = {x:40,y:40};

	this.drawStartPt = {x:0,y:40};
	this.drawEndPt = {x:40,y:40};
	this.normal = {x:0,y:1};

	this.lifeTimer.lifeTime = 6800;
	this.fadeInTimer.lifeTime = 0;
	this.fadeOutTimer.lifeTime = 1000;

	this.pathProperties = {};
/*
	this.pathProperties['_list'] = {};
	this.pathProperties['_links'] = {};
	this.pathProperties['_summary'] = {};
	this.pathProperties['_overlaps'] = [];

	this.pathProperties['_links']['_chain'] = {};
	this.pathProperties['_links']['_edges'] = {};
	this.pathProperties['_links']['_touches'] = {};
	this.pathProperties['_links']['_overlaps'] = {};
	this.pathProperties['_links']['_intersections'] = {};
/**/
  this.colorNum = 0;
	this.effectColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 5;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [6,9];
	this.alphaRange = [0.3,0.4];

	this.prevTelePath = null;
	this.nextTelePath = null;
	this.chainParent = null;
	this.chainNum = -1;

	this.updatePosition();
};
TelPathActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.chainParent = null;
	this.pathProperties = {};
};
TelPathActor.prototype.setPoints = function(start, end, drawend=null, drawstart=null) {
	var Xlow = Math.min(start.x,end.x);
	var Xhigh = Math.max(start.x,end.x);
	var Ylow = Math.min(start.y,end.y);
	var Yhigh = Math.max(start.y,end.y);

	var pos = {};
	pos.x = Xlow + (Xhigh-Xlow)/2;
	pos.y = Ylow + (Yhigh-Ylow)/2;

	this.size.w = Math.abs(Xhigh-Xlow);
	this.size.h = Math.abs(Yhigh-Ylow);

	this.updatePosition(pos);

	this.startPt = {};
	this.startPt.x = start.x - pos.x;
	this.startPt.y = start.y - pos.y;

	this.endPt = {};
	this.endPt.x = end.x - pos.x;
	this.endPt.y = end.y - pos.y;

	if(drawstart == null) {
		this.drawStartPt.x = this.startPt.x;
		this.drawStartPt.y = this.startPt.y;
	}
	else {
		this.drawStartPt.x = drawstart.x - pos.x;
		this.drawStartPt.y = drawstart.y - pos.y;
	}
	if(drawend == null) {
		this.drawEndPt.x = this.endPt.x;
		this.drawEndPt.y = this.endPt.y;
	}
	else {
		this.drawEndPt.x = drawend.x - pos.x;
		this.drawEndPt.y = drawend.y - pos.y;
	}
	this.normal = {x:0,y:0};
	this.normal.x -= (this.endPt.y - this.startPt.y);
	this.normal.y += (this.endPt.x - this.startPt.x);
};
TelPathActor.prototype.draw = function() {
//	EffectActor.prototype.draw.call(this);
	if(!this.alive)			return;

//  GAMEVIEW.drawBox(this.absBox, "black");

 var GW = GAMEMODEL.gameSession.gameWorld;
 var GP = GW.gamePlayer;
 var crosslist = GP.teleCircle.teleCrossList;


 var links = this.chainParent.summarizeLinks(this.id);
 var overlaps = (links['_summary']['_overlaps']) ? links['_summary']['_overlaps'] : 0;

	var finalA = 1;
	if(this.fadeOutTimer.running) {
		var c = this.fadeOutTimer.getCycle();
		var lt = this.fadeOutTimer.lifeTime;
		var dt = (c.time + lt)/lt;

		finalA = Math.max(0,(1-dt));
	}

//	GAMEVIEW.fillText(this.position, (""+this.chainNum), "12pt Arial", "#000000");

  var list = ['inner','outerhalo', 'center', 'innerhalo'];

  for(var i in list) {
      var item = list[i];

      var prop = {fill:true, color:this.effectColor, width:(2+overlaps)};
      prop.source = "default";
      prop.writeTo = 0;
			if(prop.width > this.MAX_WIDTH)		prop.width = this.MAX_WIDTH;
      if(typeof this.drawLayer !== "undefined")		prop.writeTo = this.drawLayer;

      var shape = {type:"shape",pts:[],pt:this.position};
      var transf = {};

			if(finalA != 1) {
        var Al = 1 - ((1-finalA)*(1-finalA));
        transf = {actions:[{type:'a',alpha:Al}]};
      }

      if(item == 'inner')     prop.color = this.haloColor;
      if(item == 'outerhalo')     prop.color = this.haloColor;
      if(item == 'innerhalo')     prop.color = this.haloColor;
      if(item != 'center')         prop.fill = false;
      if(item == 'inner')         prop.fill = true;
      if(item == 'outerhalo')		prop.width = prop.width + this.haloWidth/2;
      if(item == 'innerhalo')		prop.width = prop.width + this.haloWidth/3;
      if(item == 'inner')			prop.width = prop.width + this.haloWidth/4;

      //	        if(item == 'outer')			size = size + 2;
      //	        if(item == 'outer')			pos.x -= 2;

        var pts = [];
        pts.push({x:this.drawStartPt.x,y:this.drawStartPt.y,t:'m'});
        pts.push({x:this.drawEndPt.x,y:this.drawEndPt.y,t:'l'});

        shape.pts = pts;

      GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }


		if(overlaps >= this.WALL_LEVEL && links['_list']) {
			for(var id in links['_list']) {
				if(links['_list'][id]['hits']) {
					for(var i in links['_list'][id]['hits']) {
						var item = links['_list'][id]['hits'][i];
						if(item['type'] && item['type'] == "_overlaps") {
								var prop = {fill:false, color:"#000000", width:(2+overlaps)};
					      prop.source = "default";
					      prop.writeTo = 1;
								if(prop.width > 8)		prop.width = 8;
					      if(typeof this.drawLayer !== "undefined")		prop.writeTo = this.drawLayer;
					      var shape = {type:"shape",pts:[],pt:this.position};
					      var transf = {};

								if(finalA != 1) {
					        var Al = 1 - ((1-finalA)*(1-finalA));
					        transf = {actions:[{type:'a',alpha:Al}]};
					      }
								var pts = [];
			          pts.push({x:GAMEGEOM.subtractPoints(item['pt'],this.position).x,y:GAMEGEOM.subtractPoints(item['pt'],this.position).y,t:'m'});
//								pts.push({x:item['pt'].x,y:item['pt'].y,t:'m'});
								pts.push({x:GAMEGEOM.subtractPoints(item['pt2'],this.position).x,y:GAMEGEOM.subtractPoints(item['pt2'],this.position).y,t:'l'});

				        shape.pts = pts;
				      	GAMEVIEW.drawElement(this.position, shape, prop, transf);

								if(overlaps >= this.MIRROR_LEVEL) {
									prop.color = "#FFFFFF";
									prop.width = Math.min(overlaps,this.MAX_WIDTH) - this.MIRROR_LEVEL+1;
									GAMEVIEW.drawElement(this.position, shape, prop, transf);
								}
						}
					}
				}
			}

		}


/*
		if(typeof crosslist[this.id] !== "undefined") {
	 	 for(var id in crosslist[this.id]) {
	 		 for(var j in crosslist[this.id][id]) {
				 var crossitem = crosslist[this.id][id][j];
	 			 if(typeof crossitem["type"] !== "undefined" && typeof crossitem["pt"] !== "undefined") {

					 if(crossitem["type"] != "") {
						 if(crossitem["type"] == "segment")						continue;
//						 if(crossitem["type"] == "intersection")			continue;
						 if(crossitem["type"] == "overlap")						continue;
/**/

/*
						 var prop = {fill:true, color:"#CC00CC", width:3};
						 if(crossitem["type"] == "intersection") 	prop.color = "#0000FF";
						 if(crossitem["type"] == "segment") 			prop.color = "#00FF00";
						 if(crossitem["type"] == "segment")				prop.fill = false;

			       prop.source = "default";
			       prop.writeTo = 1;

			       var shape = {type:"circle",radius:2};
						 if(crossitem["type"] == "segment")			shape.radius *= 2.5;

						 var transf = {};
			 			 if(finalA != 1) {
			         var Al = 1 - ((1-finalA)*(1-finalA));
			         transf = {actions:[{type:'a',alpha:Al}]};
			       }
						 GAMEVIEW.drawElement(crossitem["pt"], shape, prop, transf);

					 }
	 			 }
	 		 }
		 }
	 }	/**/
};
TelPathActor.prototype.update = function() {
//	this.examineLinks();

	EffectActor.prototype.update.call(this);



  var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);

	this.haloAlpha = D*(this.alphaRange[1]-this.alphaRange[0]) + this.alphaRange[0];
	this.haloWidth = D*(this.haloRange[1]-this.haloRange[0]) + this.haloRange[0];

  this.effectColor = this.getNumericColor(this.haloAlpha, this.colorNum, 'orb');
	this.haloColor = this.getNumericColor(this.haloAlpha, this.colorNum, "halo");

};



TelPathActor.prototype.collide = function(act) {
//	Actor.prototype.collide.call(this,act);
};
TelPathActor.prototype.collideType = function(act) {
	return false;
};
TelPathActor.prototype.collideVs = function(act) {
};

TelPathActor.alloc = function() {
	var vc = new TelPathActor();
	vc.init();
	return vc;
};


exports.TelPathActor = TelPathActor;
exports.TelPathActor._loadJSEngineClasses = _loadJSEngineClasses;
