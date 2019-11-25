// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelAltSecretA = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "altsecretB";

  this.levelAltSecretA_base(checkpt);
  this.levelAltSecretA_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelAltSecretA_base = function(checkpt)
{
        GAMEMODEL.modelClock.changeRate(1);

        GAMEMODEL.activeObjs = 0;

        var GW = GameWorld.alloc();

        GAMEMODEL.gameSession.gameWorldList[0]=GW;
        GAMEMODEL.gameSession.gameWorld=GW;
        GAMEMODEL.gameSession.gameWorld.clear();


        GW.load();
        GW.size = {w:800,h:600};
        GW.updatePosition({x:0,y:0});

        GAMEMODEL.modelCamera.updatePosition({x:0,y:-20});



        var CF = CamField.alloc();
        CF.player = GW.gamePlayer;
        GW.addActor(CF,'act');
        GW.camField = CF;

        if(checkpt) {
          GW.dropper.savedCheckpt = checkpt;
        }



};
LEVELLOADER.levelAltSecretA_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "OPEN";
TA.fontSize = 32;
TA.heading.x = -1;
TA.unitSpeed = 0.03;
TA.intoTime = 5500;
TA.fadeOutTime = 1500;
TA.fadeInTime = 1500;

TA.updatePosition({x:50,y:-133});
GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');



				        GW.gamePlayer = CharActor.alloc();
				        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
								GW.gamePlayer.updatePosition({x:0,y:0});



								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(12,10);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'5,0');
								grid.setStartPos({i:5,j:0});
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');



								var O1 = OrbActor.alloc();
								O1.colorNum = 2;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*2*4*1.5;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'6,4');
								grid.setGridData(0,0,0,0,'tile','pit',{filled:false});
								grid.setGridData(6,5,6,5,'tile','pit',{filled:false});

								grid.setGridData(6,4,6,4,'tile','riser',{filled:false});
								grid.setGridData(5,4,5,4,'tile','filler',{filled:false,color:2});
								grid.setGridData(5,4,5,4,'tile','riser',{filled:false});
								grid.setGridData(5,5,5,5,'tile','filler',{filled:false,color:0});
								grid.setGridData(5,5,5,5,'tile','riser',{filled:false});

								grid.setGridData(3,3,3,6,'tile','riser',{filled:false});
								grid.setGridData(3,2,9,2,'tile','riser',{filled:false});
								grid.setGridData(4,7,9,7,'tile','riser',{filled:false});
								grid.setGridData(9,4,9,6,'tile','riser',{filled:false});
								grid.setGridData(4,4,4,4,'tile','riser',{filled:false});
//								delete grid.nodeData['3,5']['tile']['riser'];
								grid.setGridData(3,5,3,5,'tile','filler',{filled:false,color:0});


								var shiftblockset = [];
								shiftblockset.push({i:5,j:6,t:3});
								shiftblockset.push({i:6,j:6,t:2});
								shiftblockset.push({i:6,j:3,t:1});
								shiftblockset.push({i:7,j:4,t:1});
								shiftblockset.push({i:4,j:5,t:3});
								shiftblockset.push({i:7,j:5,t:3});
								shiftblockset.push({i:7,j:6,t:2});
								shiftblockset.push({i:4,j:3,t:3});
								shiftblockset.push({i:5,j:3,t:2});
								shiftblockset.push({i:7,j:3,t:111});

								shiftblockset.push({i:1,j:1,t:2});
								shiftblockset.push({i:1,j:3,t:11});
								shiftblockset.push({i:3,j:1,t:2});
								shiftblockset.push({i:3,j:2,t:3});
								shiftblockset.push({i:4,j:2,t:2});
								shiftblockset.push({i:4,j:0,t:1});
								shiftblockset.push({i:5,j:1,t:2});
								shiftblockset.push({i:6,j:2,t:3});
								shiftblockset.push({i:6,j:0,t:13});
								shiftblockset.push({i:6,j:1,t:2});
								shiftblockset.push({i:7,j:1,t:2});
								shiftblockset.push({i:7,j:0,t:1});

								shiftblockset.push({i:9,j:6,t:3});
								shiftblockset.push({i:3,j:5,t:13});

								shiftblockset.push({i:0,j:1,t:2});
								shiftblockset.push({i:0,j:4,t:2});
								shiftblockset.push({i:2,j:5,t:3});
								shiftblockset.push({i:10,j:1,t:3});
								shiftblockset.push({i:9,j:0,t:11});
								shiftblockset.push({i:9,j:0,t:11});

								shiftblockset.push({i:2,j:3,t:3});
								shiftblockset.push({i:1,j:5,t:112});
								shiftblockset.push({i:1,j:8,t:108});
								shiftblockset.push({i:0,j:7,t:3});
								shiftblockset.push({i:3,j:8,t:3});
								shiftblockset.push({i:2,j:9,t:2});

								shiftblockset.push({i:4,j:8,t:106});
								shiftblockset.push({i:5,j:9,t:2});


								shiftblockset.push({i:8,j:7,t:114});
								shiftblockset.push({i:9,j:7,t:3});
								shiftblockset.push({i:8,j:9,t:2});
								shiftblockset.push({i:5,j:8,t:2});

								shiftblockset.push({i:8,j:8,t:3});
								shiftblockset.push({i:9,j:4,t:2});
								shiftblockset.push({i:8,j:2,t:1});
								shiftblockset.push({i:8,j:4,t:3});
								shiftblockset.push({i:10,j:3,t:111});
								shiftblockset.push({i:10,j:6,t:2});
								shiftblockset.push({i:11,j:5,t:3});
								shiftblockset.push({i:11,j:7,t:101});
//								shiftblockset.push({i:3,j:3,t:104});
								shiftblockset.push({i:3,j:4,t:112});

								for(var i in shiftblockset) {
									var BS1 = BoxShiftActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
									var name = shiftblockset[i].i+','+shiftblockset[i].j;
									BS1.setBoxType(shiftblockset[i].t);
									grid.addObject('act',BS1,name);
								}


								var blockset = [];
								blockset.push({i:3,j:7});
								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}

								var blockset = [];
								blockset.push({i:9,j:3});
								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}

/*

								grid.setGridData(5,3,5,3,'tile','filler',{filled:false,color:2});
								grid.setGridData(7,2,7,3,'tile','filler',{filled:false,color:1});

								blockset.push({i:0,j:2});
								blockset.push({i:0,j:3});
								blockset.push({i:0,j:4});
								blockset.push({i:2,j:1});
								blockset.push({i:2,j:2});
								blockset.push({i:2,j:3});
								blockset.push({i:4,j:2});
								blockset.push({i:4,j:3});
								blockset.push({i:6,j:2});
								blockset.push({i:6,j:3});
								blockset.push({i:8,j:1});
								blockset.push({i:8,j:2});
								blockset.push({i:8,j:3});
								blockset.push({i:10,j:2});
								blockset.push({i:10,j:3});


								var O1 = OrbActor.alloc();
								O1.colorNum = 1;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'6,1');
								var O1 = OrbActor.alloc();
								O1.colorNum = 2;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'5,2');


								grid.setGridData(3,1,3,1,'tile','laserfield',{filled:true,damage:4,color:0,heading:'H',master:undefined,ends:[0,1]});
								grid.setGridData(7,1,7,1,'tile','laserfield',{filled:true,damage:4,color:1,heading:'H',master:undefined,ends:[0,1]});
								grid.setGridData(1,4,1,4,'tile','pit',{filled:false});
								grid.setGridData(9,4,9,4,'tile','pit',{filled:false});

								var shiftblockset = [];
								shiftblockset.push({i:1,j:3,t:1});
								shiftblockset.push({i:2,j:4,t:1});
								shiftblockset.push({i:9,j:3,t:1});
								shiftblockset.push({i:8,j:4,t:1});

								for(var i in shiftblockset) {
									var BS1 = BoxShiftActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
									var name = shiftblockset[i].i+','+shiftblockset[i].j;
									BS1.setBoxType(shiftblockset[i].t);
									grid.addObject('act',BS1,name);
								}

/*
phases -
  startup
    titlecard & names
        - "StarPath"
        - "Development by Gregory Bloom"
        - "Music by Jeremy Ouillette"
  opening measure
        - base circle, shooting left, at bottom
          - "teleport to move!"
        - then, following circle: "Use big teleports by holding and releasing SPACEBAR!"
          - base circle, shooting right, at top. holds blue orb


    /**/

};
