// CommonJS ClassLoader Hack
var classLoadList = ["TextActor","OrbActor","EnemyDropActor","CheckpointActor","EnemyCircleBlaster","EnemySquareBlaster","EnemyJumperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["LEVELLOADER"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});





LEVELLOADER={
  transitions:{}
};

LEVELLOADER.init = function()
{
};
LEVELLOADER.createActor = function(fillarr,dropid,type,pt,data,inventory) {
  var OBJ = null;

  if(type == "CheckpointActor") {
    OBJ = CheckpointActor.alloc();
    OBJ.updatePosition(pt);
    if(data) {
      if(typeof data.prog !== "undefined")    OBJ.progress = data.prog;
      if(typeof data.step !== "undefined")    OBJ.step = data.step;
      if(typeof data.stage !== "undefined")  OBJ.stage = data.stage;
      if(typeof data.level !== "undefined")  OBJ.level = data.level;
      if(typeof data.spd !== "undefined")    OBJ.unitSpeed = data.spd;
      if(typeof data.pcol !== "undefined")  OBJ.pColor = data.pcol;
      if(typeof data.dark !== "undefined")  OBJ.dark = data.dark;
      OBJ.dropId = dropid;
    }
  }
  if(type == "TextActor") {
    OBJ = TextActor.alloc();
    OBJ.updatePosition(pt);
    if(data) {
        if(typeof data.fadetime !== "undefined")    OBJ.fadeTime = data.fadetime;
        if(typeof data.spd !== "undefined")    OBJ.unitSpeed = data.spd;
        if(typeof data.fsize !== "undefined")    OBJ.loadingData({'fsize':data.fsize,"text":data.txt});
    }
  }
  if(type == "EnemyCircleBlaster" || type == "EnemySquareBlaster" || type == "EnemyJumperActor") {
    if(type == "EnemyCircleBlaster")    OBJ = EnemyCircleBlaster.alloc();
    if(type == "EnemySquareBlaster")    OBJ = EnemySquareBlaster.alloc();
    if(type == "EnemyJumperActor")      OBJ = EnemyJumperActor.alloc();
    OBJ.updatePosition(pt);
    if(data) {
        if(typeof data.angle !== "undefined")    OBJ.shotAngle = data.angle;
        if(typeof data.moveangle !== "undefined")    OBJ.facingAngle = data.moveangle;
        if(typeof data.spd !== "undefined")    OBJ.unitSpeed = data.spd;
        if(typeof data.color !== "undefined")    OBJ.colorNum = data.color;
        if(data.laser && typeof data.laser.angle !== "undefined")    OBJ.laserAngle = data.laser.angle;
        if(data.laser && typeof data.laser.color !== "undefined")    OBJ.createLaser(data.laser.color);
        if(data.shot && typeof data.shot.time !== "undefined")   OBJ.shotTimer.lifeTime = data.shot.time;
        if(data.shot && typeof data.shot.active !== "undefined" && !data.shot.active)   OBJ.shotTimer.lifeTime = -1;
        if(data.shot && typeof data.shot.active !== "undefined" && !data.shot.active)   OBJ.shotTimer.stopTimer();
        if(data.shot && typeof data.shot.active !== "undefined" && data.shot.active)   OBJ.shotTimer.startTimer();
        if(type == "EnemySquareBlaster") {
          if(typeof data.empty !== "undefined")    OBJ.empty = data.empty;
        }
    }
    if(OBJ && inventory && inventory.type) {
      OBJ.loadedItem = {'type':inventory.type};
      var INV_OBJ = null;
      if(inventory.type == "ITEMORB") {
        INV_OBJ = OrbActor.alloc();
        if(inventory.color)  INV_OBJ.colorNum = inventory.color;
      }
      if(INV_OBJ)   OBJ.loadedItem.item = INV_OBJ;
    }
  }
  if(OBJ && fillarr)   fillarr.push(OBJ);
  return OBJ;
};

LEVELLOADER.fillWorldWithDropActors = function(fillarr)
{
    for(var i in fillarr) {
      if(fillarr[i] instanceof Actor) {
        var act = fillarr[i];

        var ED = EnemyDropActor.alloc();
        ED.updatePosition(act.position);
        ED.subject = act;
        GAMEMODEL.gameSession.gameWorld.addActor(ED,'act');
        GAMEMODEL.gameSession.gameWorld.dropper.deathList[act.id] = act;
      }
    }
};

LEVELLOADER.loadLevel = function(num,args)
{
  console.log('Load level',num);
    GAMEMODEL.currentLevel = num;
		var functionvar = undefined;
    if(num == 0)        functionvar = LEVELLOADER.level0;
		if(num == 1)        functionvar = LEVELLOADER.level1;
		if(num == 2)        functionvar = LEVELLOADER.level2;
		if(num == 3)        functionvar = LEVELLOADER.level3;
		if(num == 4)        functionvar = LEVELLOADER.level4;
		if(num == 5)        functionvar = LEVELLOADER.level5;

		if(num == "test1")        functionvar = LEVELLOADER.levelTest1;

		if(num == "alt1")        functionvar = LEVELLOADER.levelAlt1;
		if(num == "alt2")        functionvar = LEVELLOADER.levelAlt2;
		if(num == "alt3")        functionvar = LEVELLOADER.levelAlt3;
		if(num == "alt4")        functionvar = LEVELLOADER.levelAlt4;
		if(num == "alt5")        functionvar = LEVELLOADER.levelAlt5;
		if(num == "alt6")        functionvar = LEVELLOADER.levelAlt6;
		if(num == "alt7")        functionvar = LEVELLOADER.levelAlt7;
		if(num == "alt8")        functionvar = LEVELLOADER.levelAlt8;
		if(num == "alt9")        functionvar = LEVELLOADER.levelAlt9;

		if(num == "endpath1")        functionvar = LEVELLOADER.levelEndPath1;
		if(num == "endpath2")        functionvar = LEVELLOADER.levelEndPath2;
		if(num == "endpath3")        functionvar = LEVELLOADER.levelEndPath3;


		if(num == "altsecretA")        functionvar = LEVELLOADER.levelAltSecretA;
		if(num == "altsecretB")        functionvar = LEVELLOADER.levelAltSecretB;
		if(num == "altsecretC")        functionvar = LEVELLOADER.levelAltSecretC;
		if(num == "altsecretD")        functionvar = LEVELLOADER.levelAltSecretD;
		if(num == "altsecretE")        functionvar = LEVELLOADER.levelAltSecretE;
		if(num == "altsecretF")        functionvar = LEVELLOADER.levelAltSecretF;
		if(num == "altsecretG")        functionvar = LEVELLOADER.levelAltSecretG;
		if(num == "altsecretH")        functionvar = LEVELLOADER.levelAltSecretH;

		if(num == "end")        functionvar = LEVELLOADER.levelEnd;



/*
		if(num == 6)        functionvar = LEVELLOADER.level6;
		if(num == 7)        functionvar = LEVELLOADER.level7;
		if(num == 8)        functionvar = LEVELLOADER.level8;
		if(num == 9)        functionvar = LEVELLOADER.level9;
		if(num == 10)        functionvar = LEVELLOADER.level10;
		if(num == 11)        functionvar = LEVELLOADER.level11;
		if(num == 12)        functionvar = LEVELLOADER.level12;
		if(num == "test2")        functionvar = LEVELLOADER.levelTest2;
/**/

		console.log(num,typeof functionvar);
		if(typeof functionvar === "function") {
			functionvar.call(this,num+1,args);
		}
		else {
				LEVELLOADER.levelN();
		}
/*
    if(num == 2)        LEVELLOADER.level2();


    if(num == "open")    LEVELLOADER.levelOpen();
    if(num == "build")    LEVELLOADER.levelbuild();

    if(num == "test")    LEVELLOADER.leveltest();
/**/
};


exports.LEVELLOADER = LEVELLOADER;
exports.LEVELLOADER._loadJSEngineClasses = _loadJSEngineClasses;
