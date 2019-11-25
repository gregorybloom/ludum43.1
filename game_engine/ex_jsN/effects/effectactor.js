// CommonJS ClassLoader Hack
var classLoadList = ["TimerObj","Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["EffectActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function EffectActor() {
}
EffectActor.prototype = new Actor;
EffectActor.prototype.identity = function() {
	return ('EffectActor (' +this._dom.id+ ')');
};
EffectActor.prototype.init = function() {
	Actor.prototype.init.call(this);
	this.size = {w:20,h:20};
	this.position = {x:0,y:0};

	this.baseOffset = {x:0.5,y:0.5};
	this.actionMode = "MODE_STILL";

	this.drawShift = {x:0,y:0};

  this.started = false;
  this.lifeTimer = TimerObj.alloc();
	this.lifeTimer.lifeTime = 2300;
	this.lifeTimer.looping = false;

  this.fadeInTimer = TimerObj.alloc();
	this.fadeInTimer.lifeTime = 0;
	this.fadeInTimer.looping = false;

  this.finalFade = false;
  this.fadeOutTimer = TimerObj.alloc();
	this.fadeOutTimer.lifeTime = 500;
	this.fadeOutTimer.looping = false;
	this.updatePosition();
};
EffectActor.prototype.draw = function() {
  if(!this.lifeTimer.running && !this.fadeOutTimer.running)    return;

  var finalA = 1;
  if(this.fadeOutTimer.running) {
    var c = this.fadeOutTimer.getCycle();
    var lt = this.fadeOutTimer.lifeTime;
    var dt = (c.time + lt)/lt;

    finalA = Math.max(0,(1-dt));
  }

//	Actor.prototype.draw.call(this);
	if(!this.alive)			return;
};
EffectActor.prototype.startup = function() {
  this.started = true;

  this.lifeTimer.cycled = false;
  this.lifeTimer.startTimer();
  this.fadeInTimer.cycled = false;
  this.fadeInTimer.startTimer();
};
EffectActor.prototype.update = function() {
	Actor.prototype.update.call(this);
  if(!this.fadeOutTimer.running && this.finalFade) {
		this.clear();
 		this.alive = false;
	}

  this.lifeTimer.update();
  this.fadeInTimer.update();
  this.fadeOutTimer.update();

  if(!this.started && !this.finalFade)   this.startup();



  var timerLists = [this.lifeTimer, this.fadeInTimer, this.fadeOutTimer];
  for(var i in timerLists) {
    var timer = timerLists[i];
    if(timer.running) {
      var c = timer.getCycle();
      if( c.cycled ) {
        timer.stopTimer();

        if(i == 0 && !this.finalFade) {
          this.fadeOutTimer.cycled = false;
          if(this.fadeOutTimer.lifeTime > 0)  this.fadeOutTimer.startTimer();
          this.finalFade = true;
        }
      }
    }
  }
};
EffectActor.prototype.collide = function(act) {
//	Actor.prototype.collide.call(this,act);
};
EffectActor.prototype.collideType = function(act) {
	return false;
};
EffectActor.prototype.collideVs = function(act) {
};


EffectActor.alloc = function() {
	var vc = new EffectActor();
	vc.init();
	return vc;
};



exports.EffectActor = EffectActor;
exports.EffectActor._loadJSEngineClasses = _loadJSEngineClasses;
