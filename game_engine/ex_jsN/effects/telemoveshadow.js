// CommonJS ClassLoader Hack
var classLoadList = ["EffectActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["TeleMoveShadowActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function TeleMoveShadowActor() {
}
TeleMoveShadowActor.prototype = new EffectActor;
TeleMoveShadowActor.prototype.identity = function() {
	return ('TeleMoveShadowActor (' +this._dom.id+ ')');
};
TeleMoveShadowActor.prototype.init = function() {
	EffectActor.prototype.init.call(this);

	this.radius = 15;

	this.size = {w:(2*this.radius),h:(2*this.radius)};
	this.position = {x:0,y:0};

	this.baseOffset = {x:0.5,y:0.5};
	this.actionMode = "MODE_STILL";

	this.drawShift = {x:0,y:0};

  this.lifeTimer.lifeTime = 800;
	this.fadeInTimer.lifeTime = 0;
	this.fadeOutTimer.lifeTime = 500;

  this.colorNum = 0;
	this.effectColor = "#FF0000";
	this.haloColor = "#FF0000";
	this.haloWidth = 5;
	this.haloAlpha = 0.4;

	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();
	this.haloRange = [6,9];
	this.alphaRange = [0.3,0.4];

	this.shadowType = "player";
	this.updatePosition();

	this.updatedColors = false;
};

TeleMoveShadowActor.prototype.draw = function() {
//	EffectActor.prototype.draw.call(this);
	if(!this.alive)			return;



//  GAMEVIEW.drawBox(this.absBox, "black");

	var finalA = 1;
	if(this.fadeOutTimer.running) {
		var c = this.fadeOutTimer.getCycle();
		var lt = this.fadeOutTimer.lifeTime;
		var dt = (c.time + lt)/lt;

		finalA = Math.max(0,(1-dt));
	}
  finalA /= 2;


  var list = ['inner','outerhalo', 'innerhalo'];

  for(var i in list) {
      var item = list[i];

      var prop = {fill:false, color:this.effectColor, width:2};
      prop.source = "default";
      prop.writeTo = 1;
      if(typeof this.drawLayer !== "undefined")		prop.writeTo = this.drawLayer;

      //      var shape = {type:"shape",pts:[],pt:this.position};
      var shape = {type:"circle",radius:this.radius};

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

			if(this.shadowType == "enemy" && !this.updatedColors) {
				prop.color = "rgba(68,68,68,0.8)";
			}

      //	        if(item == 'outer')			size = size + 2;
      //	        if(item == 'outer')			pos.x -= 2;

      GAMEVIEW.drawElement(this.position, shape, prop, transf);
    }
};
TeleMoveShadowActor.prototype.update = function() {
	EffectActor.prototype.update.call(this);

	this.size = {w:(2*this.radius),h:(2*this.radius)};



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

	this.updatedColors = true;
};
TeleMoveShadowActor.prototype.collide = function(act) {
//	Actor.prototype.collide.call(this,act);
};
TeleMoveShadowActor.prototype.collideType = function(act) {
	return false;
};
TeleMoveShadowActor.prototype.collideVs = function(act) {
};

TeleMoveShadowActor.alloc = function() {
	var vc = new TeleMoveShadowActor();
	vc.init();
	return vc;
};


exports.TeleMoveShadowActor = TeleMoveShadowActor;
exports.TeleMoveShadowActor._loadJSEngineClasses = _loadJSEngineClasses;
