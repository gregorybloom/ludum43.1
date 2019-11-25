// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["StarFieldArea"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function StarFieldArea() {
}
StarFieldArea.prototype = new Actor;
StarFieldArea.prototype.identity = function() {
	return ('StarFieldArea (' +this._dom.id+ ')');
};
StarFieldArea.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.ticksDiff = 0;
	this.facingAngle = 0;
	this.heading = {x:0,y:0};

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.size = {w:800,h:600};
	this.position = {x:0,y:0};
	this.updatePosition();
};
StarFieldArea.prototype.clear = function() {
	Actor.prototype.clear.call(this);
//	this.steps = null;
};
StarFieldArea.prototype.loadingData = function(data)
{
};

StarFieldArea.prototype.draw = function() {
	Actor.prototype.draw.call(this);
  if(!this.alive)   return;




  var prop = {fill:true, color:"#EEEEEE",width:1};
    prop.source = "default";
    prop.writeTo = 0;
  var shape = {type:"box",width:this.size.w+1,height:this.size.h+1};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

    var myrng = new Math.seedrandom('shoot shoot shoot');

    var dt = GAMEMODEL.getTime() - this.startedTime;

    var screens = 4;
    var stars = Math.ceil(myrng()*1000)+1000;

    for(var i=0; i<stars; i++) {
      var X = myrng() * 800*screens;
      var Y = myrng() * 600;

      var A = myrng()*0.3 + 0.1;
      var C = Math.floor( 16*myrng() );
      var Z = Math.floor( 10*myrng() );
      var S = Math.floor( 4*myrng() );
      var N = Math.floor(  360*myrng() );
      var SPD = myrng()*0.1;
			var aspd = myrng()*0.135+0.05;

			var ACK = Math.round( myrng.quick() );
			if(ACK == 0)		ACK=-1;
			aspd = aspd*ACK;

//			var Tseedname = (myrng() * 10000).toString();
//			var tempSEED = new Math.seedrandom(Tseedname);


      var Cl = this.getNumericColor(A, C, "halo");
      prop.fill = false;
      prop.color = Cl;
      prop.width;

      if(S <= 2) {
        shape.type = "box";
        shape.width = Z/2 +5;
        shape.height = Z/2 +5;
      }
			else {
				shape.type = "box";
        shape.width = Z/2 +5;
        shape.height = Z/2 +5;
				N = (N + aspd*dt)%(360);
				if(N < 0)	N += 360*Math.ceil(Math.abs(N/360));
			}

      X = (X - SPD*dt)%(800*screens);
      if(X < -20)   X += (800*screens)*Math.ceil(Math.abs( (X+20)/(800*screens) ));
      var transf = {};
      var transf = {actions:[{type:'r',angle:N,center:true}]};

      X-=400;
      Y-=300;
      if(X > 420) continue;
			if(X < -420) continue;
      GAMEVIEW.drawElement({x:X,y:Y}, shape, prop, transf);

    }




};
StarFieldArea.prototype.update = function() {
	Actor.prototype.update.call(this);
  if(!this.alive)   return;


};

StarFieldArea.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

StarFieldArea.prototype.collideType = function(act) {
  if(!this.alive)         return false;
  if(!act.alive)         return false;
	return false;
};

StarFieldArea.prototype.collideVs = function(act) {
};
StarFieldArea.alloc = function() {
	var vc = new StarFieldArea();
	vc.init();
	return vc;
};



exports.StarFieldArea = StarFieldArea;
exports.StarFieldArea._loadJSEngineClasses = _loadJSEngineClasses;
