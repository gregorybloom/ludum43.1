// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelEndPath2 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "endpath3";

  this.levelEndPath2_base(checkpt);
  this.levelEndPath2_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelEndPath2_base = function(checkpt)
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

        GAMEMODEL.modelCamera.updatePosition({x:0,y:0});



        var CF = CamField.alloc();
        CF.player = GW.gamePlayer;
        GW.addActor(CF,'act');
        GW.camField = CF;

        if(checkpt) {
          GW.dropper.savedCheckpt = checkpt;
        }



};
LEVELLOADER.levelEndPath2_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "GROWTH";
TA.fontSize = 32;
TA.heading.x = -1;
TA.unitSpeed = 0.03;
TA.intoTime = 5500;
TA.fadeOutTime = 1500;
TA.fadeInTime = 1500;

TA.updatePosition({x:50,y:-110});
GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');



				        GW.gamePlayer = CharActor.alloc();
				        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
								GW.gamePlayer.updatePosition({x:0,y:0});
								GW.gamePlayer.colorNum=1;


								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(7,7);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'3,3');
								grid.setStartPos({i:3,j:3});
								grid.startColorNum=1;
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');


								var blockset = [];
								blockset.push({i:1,j:1});
								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}


								grid.setGridData(0,1,0,2,'tile','pit',{filled:false});
								grid.setGridData(1,0,2,0,'tile','pit',{filled:false});
								grid.setGridData(0,0,0,0,'tile','filler',{filled:false,color:0});
								grid.setGridData(0,5,0,5,'tile','filler',{filled:false,color:2});
								grid.setGridData(5,0,5,0,'tile','filler',{filled:false,color:1});

								grid.setGridData(0,0,0,0,'tile','riser',{filled:false,color:0});
								grid.setGridData(0,5,0,5,'tile','riser',{filled:false,color:2});

								grid.setGridData(5,0,6,1,'tile','riser',{filled:false,color:1});
								grid.setGridData(5,5,6,6,'tile','riser',{filled:false,color:1});

								grid.setGridData(4,2,5,4,'tile','riser',{filled:false,color:1});
								grid.setGridData(3,0,4,0,'tile','riser',{filled:false,color:1});
								grid.setGridData(0,3,1,4,'tile','riser',{filled:false,color:1});
								delete grid.nodeData['5,2']['tile']['riser'];
//								delete grid.nodeData['1,5']['tile']['riser'];


								var shiftblockset = [];
								shiftblockset.push({i:3,j:2,t:2});
								shiftblockset.push({i:4,j:2,t:2});
								shiftblockset.push({i:4,j:3,t:2});
								shiftblockset.push({i:2,j:3,t:3});
								shiftblockset.push({i:2,j:4,t:3});
								shiftblockset.push({i:3,j:5,t:3});
//								shiftblockset.push({i:5,j:5,t:1});
								shiftblockset.push({i:6,j:3,t:1});
								shiftblockset.push({i:3,j:4,t:112});
								shiftblockset.push({i:1,j:5,t:109});
								shiftblockset.push({i:1,j:4,t:3});
								shiftblockset.push({i:1,j:2,t:103});
								shiftblockset.push({i:3,j:1,t:1});


								for(var i in shiftblockset) {
									var BS1 = BoxShiftActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
									var name = shiftblockset[i].i+','+shiftblockset[i].j;
									BS1.setBoxType(shiftblockset[i].t);
									grid.addObject('act',BS1,name);
								}


								var orbset = [];
								orbset.push({i:3,j:6,n:2});
								orbset.push({i:2,j:1,n:0});
								for(var i in orbset) {
									var O1 = OrbActor.alloc();
									O1.colorNum = orbset[i].n;
									O1.deathTimer.lifeTime = 8000 * 2;
									O1.lifelineTimer.lifeTime = 8000 * 2*4;
									GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
									var name = orbset[i].i+','+orbset[i].j;
									grid.addObject('act',O1,name);
								}


/*

								grid.setGridData(3,3,4,4,'tile','riser',{filled:false});


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
